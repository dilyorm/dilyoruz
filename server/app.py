"""kyosan site API: projects, blog posts, admin login, and two data proxies.

Run:  KYO_ADMIN_PASSWORD=... KYO_SECRET=... uvicorn app:create_app --factory --port 8787
Data lives in KYO_DATA (default ./data): site.db plus uploads/.
"""
from __future__ import annotations

import hashlib
import hmac
import json
import os
import re
import secrets
import sqlite3
import time
import unicodedata
from contextlib import closing, contextmanager
from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

HERE = Path(__file__).parent
COOKIE = "kyo_admin"
SESSION_SECONDS = 14 * 24 * 3600
MAX_UPLOAD = 6 * 1024 * 1024
IMAGE_TYPES = {  # magic bytes -> extension; anything else is refused
    b"\x89PNG\r\n\x1a\n": ".png",
    b"\xff\xd8\xff": ".jpg",
    b"GIF87a": ".gif",
    b"GIF89a": ".gif",
}


class Settings(BaseModel):
    data_dir: Path = Path(os.environ.get("KYO_DATA", HERE / "data"))
    admin_password: str = os.environ.get("KYO_ADMIN_PASSWORD", "")
    secret: str = os.environ.get("KYO_SECRET", "")
    secure_cookie: bool = os.environ.get("KYO_SECURE_COOKIE", "1") != "0"
    dist_dir: Path | None = Path(os.environ["KYO_DIST"]) if os.environ.get("KYO_DIST") else None
    faceit_nick: str = os.environ.get("FACEIT_NICK", "kyosan")
    faceit_api_key: str = os.environ.get("FACEIT_API_KEY", "")
    avj_url: str = os.environ.get("AVJ_URL", "https://avj.dilyor.dev")
    avj_handle: str = os.environ.get("AVJ_HANDLE", "dilyor")


# ---------- storage ----------

SCHEMA = """
create table if not exists projects (
  id integer primary key,
  slug text unique not null,
  name text not null,
  tag text not null default '',
  what text not null default '',
  body text not null default '',
  stack text not null default '[]',
  links text not null default '[]',
  year text not null default '',
  position integer not null default 0,
  hidden integer not null default 0,
  updated_at real not null
);
create table if not exists posts (
  id integer primary key,
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover text not null default '',
  tags text not null default '[]',
  published integer not null default 0,
  published_at real,
  created_at real not null,
  updated_at real not null
);
"""


def slugify(text: str) -> str:
    s = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return s[:80] or "untitled"


class Store:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self.tx() as db:
            db.executescript(SCHEMA)
            if not db.execute("select 1 from projects limit 1").fetchone():
                seed = json.loads((HERE / "seed_projects.json").read_text(encoding="utf-8"))
                for i, p in enumerate(seed):
                    self._insert_project(db, {**p, "position": i})

    def db(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    @contextmanager
    def tx(self):
        conn = self.db()
        try:
            with conn:  # commits, or rolls back on error
                yield conn
        finally:
            conn.close()

    def unique_slug(self, db, table: str, base: str, own_id: int | None = None) -> str:
        slug, n = base, 2
        while True:
            row = db.execute(f"select id from {table} where slug = ?", (slug,)).fetchone()
            if not row or row["id"] == own_id:
                return slug
            slug, n = f"{base}-{n}", n + 1

    # projects
    @staticmethod
    def project_out(r: sqlite3.Row) -> dict:
        d = dict(r)
        d["stack"] = json.loads(d["stack"])
        d["links"] = json.loads(d["links"])
        d["hidden"] = bool(d["hidden"])
        return d

    def _insert_project(self, db, p: dict) -> int:
        slug = self.unique_slug(db, "projects", slugify(p.get("slug") or p["name"]))
        cur = db.execute(
            "insert into projects (slug,name,tag,what,body,stack,links,year,position,hidden,updated_at)"
            " values (?,?,?,?,?,?,?,?,?,?,?)",
            (slug, p["name"], p.get("tag", ""), p.get("what", ""), p.get("body", ""),
             json.dumps(p.get("stack", [])), json.dumps(p.get("links", [])), p.get("year", ""),
             p.get("position", 0), int(p.get("hidden", False)), time.time()),
        )
        return cur.lastrowid

    def projects(self, include_hidden=False) -> list[dict]:
        q = "select * from projects" + ("" if include_hidden else " where hidden = 0") + " order by position, id"
        with closing(self.db()) as db:
            return [self.project_out(r) for r in db.execute(q)]

    def project(self, pid: int) -> dict | None:
        with closing(self.db()) as db:
            r = db.execute("select * from projects where id = ?", (pid,)).fetchone()
            return self.project_out(r) if r else None

    def create_project(self, p: dict) -> dict:
        with self.tx() as db:
            top = db.execute("select coalesce(max(position), -1) + 1 from projects").fetchone()[0]
            pid = self._insert_project(db, {**p, "position": top})
        return self.project(pid)

    def update_project(self, pid: int, p: dict) -> dict | None:
        with self.tx() as db:
            if not db.execute("select 1 from projects where id = ?", (pid,)).fetchone():
                return None
            slug = self.unique_slug(db, "projects", slugify(p.get("slug") or p["name"]), pid)
            db.execute(
                "update projects set slug=?,name=?,tag=?,what=?,body=?,stack=?,links=?,year=?,hidden=?,updated_at=?"
                " where id=?",
                (slug, p["name"], p["tag"], p["what"], p["body"], json.dumps(p["stack"]), json.dumps(p["links"]),
                 p["year"], int(p["hidden"]), time.time(), pid),
            )
        return self.project(pid)

    def reorder_projects(self, ids: list[int]) -> None:
        with self.tx() as db:
            for i, pid in enumerate(ids):
                db.execute("update projects set position = ? where id = ?", (i, pid))

    def delete(self, table: str, rid: int) -> bool:
        with self.tx() as db:
            return db.execute(f"delete from {table} where id = ?", (rid,)).rowcount > 0

    # posts
    @staticmethod
    def post_out(r: sqlite3.Row, with_body=True) -> dict:
        d = dict(r)
        d["tags"] = json.loads(d["tags"])
        d["published"] = bool(d["published"])
        d["minutes"] = max(1, round(len(d["body"].split()) / 220))
        if not with_body:
            d.pop("body")
        return d

    def posts(self, include_drafts=False) -> list[dict]:
        q = "select * from posts" + ("" if include_drafts else " where published = 1")
        q += " order by coalesce(published_at, created_at) desc"
        with closing(self.db()) as db:
            return [self.post_out(r, with_body=False) for r in db.execute(q)]

    def post(self, *, pid: int | None = None, slug: str | None = None, include_drafts=False) -> dict | None:
        col, val = ("id", pid) if pid is not None else ("slug", slug)
        q = f"select * from posts where {col} = ?" + ("" if include_drafts else " and published = 1")
        with closing(self.db()) as db:
            r = db.execute(q, (val,)).fetchone()
            return self.post_out(r) if r else None

    def save_post(self, p: dict, pid: int | None = None) -> dict | None:
        now = time.time()
        with self.tx() as db:
            if pid is None:
                slug = self.unique_slug(db, "posts", slugify(p.get("slug") or p["title"]))
                pid = db.execute(
                    "insert into posts (slug,title,excerpt,body,cover,tags,published,published_at,created_at,updated_at)"
                    " values (?,?,?,?,?,?,?,?,?,?)",
                    (slug, p["title"], p["excerpt"], p["body"], p["cover"], json.dumps(p["tags"]),
                     int(p["published"]), now if p["published"] else None, now, now),
                ).lastrowid
            else:
                old = db.execute("select published_at from posts where id = ?", (pid,)).fetchone()
                if not old:
                    return None
                slug = self.unique_slug(db, "posts", slugify(p.get("slug") or p["title"]), pid)
                published_at = old["published_at"] or (now if p["published"] else None)
                db.execute(
                    "update posts set slug=?,title=?,excerpt=?,body=?,cover=?,tags=?,published=?,published_at=?,updated_at=?"
                    " where id=?",
                    (slug, p["title"], p["excerpt"], p["body"], p["cover"], json.dumps(p["tags"]),
                     int(p["published"]), published_at, now, pid),
                )
        return self.post(pid=pid, include_drafts=True)


# ---------- input models ----------


class Link(BaseModel):
    label: str = Field(max_length=40)
    href: str = Field(max_length=500, pattern=r"^(https?://|/)")


class ProjectIn(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    slug: str = Field(default="", max_length=80)
    tag: str = Field(default="", max_length=24)
    what: str = Field(default="", max_length=200)
    body: str = Field(default="", max_length=20_000)
    stack: list[str] = Field(default_factory=list, max_length=20)
    links: list[Link] = Field(default_factory=list, max_length=8)
    year: str = Field(default="", max_length=20)
    hidden: bool = False


class PostIn(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    slug: str = Field(default="", max_length=80)
    excerpt: str = Field(default="", max_length=400)
    body: str = Field(default="", max_length=200_000)
    cover: str = Field(default="", max_length=500, pattern=r"^(|https?://.*|/.*)$")
    tags: list[str] = Field(default_factory=list, max_length=10)
    published: bool = False


class LoginIn(BaseModel):
    password: str = Field(max_length=200)


class OrderIn(BaseModel):
    ids: list[int]


# ---------- auth ----------


def sign(secret: str, exp: int) -> str:
    mac = hmac.new(secret.encode(), f"admin.{exp}".encode(), hashlib.sha256).hexdigest()
    return f"{exp}.{mac}"


def valid_token(secret: str, token: str | None) -> bool:
    if not secret or not token or "." not in token:
        return False
    exp, _ = token.split(".", 1)
    if not exp.isdigit() or int(exp) < time.time():
        return False
    return hmac.compare_digest(token, sign(secret, int(exp)))


# ---------- tiny TTL cache for the proxies ----------


class Cache:
    def __init__(self):
        self.items: dict[str, tuple[float, dict]] = {}

    async def get(self, key: str, ttl: float, fetch):
        hit = self.items.get(key)
        if hit and time.monotonic() - hit[0] < ttl:
            return hit[1]
        try:
            value = await fetch()
        except Exception as e:  # serve stale data rather than nothing
            if hit:
                return hit[1]
            raise HTTPException(502, f"upstream failed: {type(e).__name__}") from e
        self.items[key] = (time.monotonic(), value)
        return value


async def fetch_faceit(s: Settings) -> dict:
    ua = {"User-Agent": "Mozilla/5.0 (kyosan-site)"}
    async with httpx.AsyncClient(timeout=10, headers=ua) as c:
        r = await c.get(f"https://www.faceit.com/api/users/v1/nicknames/{s.faceit_nick}")
        r.raise_for_status()
        p = r.json()["payload"]
        cs = p["games"]["cs2"]
        out = {
            "nickname": p["nickname"],
            "elo": cs.get("faceit_elo"),
            "level": cs.get("skill_level"),
            "url": f"https://www.faceit.com/en/players/{p['nickname']}",
            "stats": None,
        }
        if s.faceit_api_key:  # lifetime numbers need the official Data API
            auth = {"Authorization": f"Bearer {s.faceit_api_key}"}
            r = await c.get(f"https://open.faceit.com/data/v4/players/{p['id']}/stats/cs2", headers=auth)
            if r.is_success:
                life = r.json().get("lifetime", {})
                out["stats"] = {
                    "matches": life.get("Matches"),
                    "win_rate": life.get("Win Rate %"),
                    "kd": life.get("Average K/D Ratio"),
                    "hs": life.get("Average Headshots %"),
                }
        return out


async def fetch_music(s: Settings) -> dict:
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get(f"{s.avj_url}/api/public/{s.avj_handle}/music")
        r.raise_for_status()
        return r.json()


# ---------- app ----------


def create_app(settings: Settings | None = None) -> FastAPI:
    s = settings or Settings()
    store = Store(s.data_dir / "site.db")
    uploads = s.data_dir / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    cache = Cache()
    failed: dict[str, list[float]] = {}

    app = FastAPI(title="kyosan", docs_url=None, redoc_url=None, openapi_url=None)
    app.state.store = store

    def admin(request: Request) -> None:
        if not valid_token(s.secret, request.cookies.get(COOKIE)):
            raise HTTPException(401, "Log in first")
        # SameSite=Strict already blocks cross-site cookies; this also refuses
        # cross-origin writes from browsers that send an Origin header.
        origin = request.headers.get("origin")
        if request.method not in ("GET", "HEAD") and origin:
            if urlparse(origin).netloc != request.headers.get("host"):
                raise HTTPException(403, "Bad origin")

    # public
    @app.get("/api/health")
    def health():
        return {"ok": True}

    @app.get("/api/projects")
    def list_projects():
        return store.projects()

    @app.get("/api/posts")
    def list_posts():
        return store.posts()

    @app.get("/api/posts/{slug}")
    def get_post(slug: str):
        post = store.post(slug=slug)
        if not post:
            raise HTTPException(404, "No such post")
        return post

    @app.get("/api/faceit")
    async def faceit():
        return await cache.get("faceit", 600, lambda: fetch_faceit(s))

    @app.get("/api/music")
    async def music():
        return await cache.get("music", 300, lambda: fetch_music(s))

    # auth
    @app.post("/api/admin/login")
    def login(body: LoginIn, request: Request, response: Response):
        if not s.admin_password or not s.secret:
            raise HTTPException(503, "Admin is not configured on the server")
        ip = request.client.host if request.client else "?"
        recent = [t for t in failed.get(ip, []) if time.time() - t < 900]
        if len(recent) >= 5:
            raise HTTPException(429, "Too many attempts, try again in 15 minutes")
        if not hmac.compare_digest(body.password.encode(), s.admin_password.encode()):
            failed[ip] = recent + [time.time()]
            raise HTTPException(401, "Wrong password")
        failed.pop(ip, None)
        token = sign(s.secret, int(time.time()) + SESSION_SECONDS)
        response.set_cookie(COOKIE, token, max_age=SESSION_SECONDS, httponly=True, samesite="strict",
                            secure=s.secure_cookie, path="/")
        return {"ok": True}

    @app.post("/api/admin/logout")
    def logout(response: Response):
        response.delete_cookie(COOKIE, path="/")
        return {"ok": True}

    @app.get("/api/admin/me", dependencies=[Depends(admin)])
    def me():
        return {"ok": True}

    # admin: projects
    @app.get("/api/admin/projects", dependencies=[Depends(admin)])
    def admin_projects():
        return store.projects(include_hidden=True)

    @app.post("/api/admin/projects", dependencies=[Depends(admin)], status_code=201)
    def create_project(body: ProjectIn):
        return store.create_project(body.model_dump())

    @app.put("/api/admin/projects/order", dependencies=[Depends(admin)])
    def reorder(body: OrderIn):
        store.reorder_projects(body.ids)
        return store.projects(include_hidden=True)

    @app.put("/api/admin/projects/{pid}", dependencies=[Depends(admin)])
    def update_project(pid: int, body: ProjectIn):
        p = store.update_project(pid, body.model_dump())
        if not p:
            raise HTTPException(404, "No such project")
        return p

    @app.delete("/api/admin/projects/{pid}", dependencies=[Depends(admin)])
    def delete_project(pid: int):
        if not store.delete("projects", pid):
            raise HTTPException(404, "No such project")
        return {"ok": True}

    # admin: posts
    @app.get("/api/admin/posts", dependencies=[Depends(admin)])
    def admin_posts():
        return store.posts(include_drafts=True)

    @app.get("/api/admin/posts/{pid}", dependencies=[Depends(admin)])
    def admin_post(pid: int):
        p = store.post(pid=pid, include_drafts=True)
        if not p:
            raise HTTPException(404, "No such post")
        return p

    @app.post("/api/admin/posts", dependencies=[Depends(admin)], status_code=201)
    def create_post(body: PostIn):
        return store.save_post(body.model_dump())

    @app.put("/api/admin/posts/{pid}", dependencies=[Depends(admin)])
    def update_post(pid: int, body: PostIn):
        p = store.save_post(body.model_dump(), pid)
        if not p:
            raise HTTPException(404, "No such post")
        return p

    @app.delete("/api/admin/posts/{pid}", dependencies=[Depends(admin)])
    def delete_post(pid: int):
        if not store.delete("posts", pid):
            raise HTTPException(404, "No such post")
        return {"ok": True}

    @app.post("/api/admin/upload", dependencies=[Depends(admin)], status_code=201)
    async def upload(file: UploadFile = File(...)):
        data = await file.read(MAX_UPLOAD + 1)
        if len(data) > MAX_UPLOAD:
            raise HTTPException(413, "Images up to 6 MB")
        ext = next((e for magic, e in IMAGE_TYPES.items() if data.startswith(magic)), None)
        if ext is None and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
            ext = ".webp"
        if ext is None:
            raise HTTPException(415, "PNG, JPG, GIF or WebP only")
        name = f"{int(time.time())}-{secrets.token_hex(6)}{ext}"
        (uploads / name).write_bytes(data)
        return {"url": f"/uploads/{name}"}

    app.mount("/uploads", StaticFiles(directory=uploads), name="uploads")

    # Optional: serve the built site from the same process, with SPA fallback.
    if s.dist_dir and s.dist_dir.is_dir():
        dist = s.dist_dir.resolve()
        app.mount("/assets", StaticFiles(directory=dist / "assets"), name="assets")

        @app.get("/{path:path}", include_in_schema=False)
        def spa(path: str):
            f = (dist / path).resolve()
            if path and f.is_file() and dist in f.parents:
                return FileResponse(f)
            return FileResponse(dist / "index.html")

    return app


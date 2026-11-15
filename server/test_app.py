import pytest
from fastapi.testclient import TestClient

from app import Settings, create_app, sign, valid_token

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64


@pytest.fixture
def client(tmp_path):
    s = Settings(data_dir=tmp_path, admin_password="pw", secret="s3cret", secure_cookie=False)
    return TestClient(create_app(s), base_url="http://testserver")


def login(c):
    r = c.post("/api/admin/login", json={"password": "pw"})
    assert r.status_code == 200


def test_seeded_projects_are_public(client):
    ps = client.get("/api/projects").json()
    assert [p["name"] for p in ps][:2] == ["BIL", "Uzbek Gemma"]
    assert ps[0]["links"][0]["href"].startswith("https://")


def test_admin_requires_login(client):
    assert client.get("/api/admin/projects").status_code == 401
    assert client.post("/api/admin/posts", json={"title": "x"}).status_code == 401


def test_wrong_password_then_lockout(client):
    for _ in range(5):
        assert client.post("/api/admin/login", json={"password": "no"}).status_code == 401
    assert client.post("/api/admin/login", json={"password": "pw"}).status_code == 429


def test_token_signature_and_expiry():
    assert valid_token("k", sign("k", 9_999_999_999))
    assert not valid_token("k", sign("other", 9_999_999_999))
    assert not valid_token("k", sign("k", 1))
    assert not valid_token("k", "garbage")


def test_project_crud_hide_and_reorder(client):
    login(client)
    p = client.post("/api/admin/projects", json={"name": "New Thing", "stack": ["Rust"]}).json()
    assert p["slug"] == "new-thing" and p["position"] == 7

    p["hidden"] = True
    assert client.put(f"/api/admin/projects/{p['id']}", json=p).json()["hidden"] is True
    assert "New Thing" not in [x["name"] for x in client.get("/api/projects").json()]

    ids = [x["id"] for x in client.get("/api/admin/projects").json()]
    out = client.put("/api/admin/projects/order", json={"ids": ids[::-1]}).json()
    assert out[0]["name"] == "New Thing"

    assert client.delete(f"/api/admin/projects/{p['id']}").status_code == 200
    assert client.delete(f"/api/admin/projects/{p['id']}").status_code == 404


def test_links_must_be_http(client):
    login(client)
    bad = {"name": "x", "links": [{"label": "x", "href": "javascript:alert(1)"}]}
    assert client.post("/api/admin/projects", json=bad).status_code == 422


def test_drafts_stay_private_until_published(client):
    login(client)
    d = client.post("/api/admin/posts", json={"title": "Hello, world!", "body": "word " * 500}).json()
    assert d["slug"] == "hello-world" and d["published"] is False and d["published_at"] is None
    assert client.get("/api/posts").json() == []
    assert client.get("/api/posts/hello-world").status_code == 404

    d["published"] = True
    pub = client.put(f"/api/admin/posts/{d['id']}", json=d).json()
    assert pub["published_at"] is not None
    listed = client.get("/api/posts").json()
    assert listed[0]["minutes"] == 2 and "body" not in listed[0]
    assert client.get("/api/posts/hello-world").json()["title"] == "Hello, world!"

    # Same title again gets its own slug.
    assert client.post("/api/admin/posts", json={"title": "Hello world"}).json()["slug"] == "hello-world-2"


def test_cross_origin_write_refused(client):
    login(client)
    r = client.post("/api/admin/posts", json={"title": "x"}, headers={"Origin": "https://evil.example"})
    assert r.status_code == 403


def test_upload_images_only(client):
    login(client)
    r = client.post("/api/admin/upload", files={"file": ("a.png", PNG, "image/png")})
    assert r.status_code == 201
    url = r.json()["url"]
    assert client.get(url).content == PNG
    r = client.post("/api/admin/upload", files={"file": ("a.png", b"<svg onload=x>", "image/png")})
    assert r.status_code == 415


def test_admin_unconfigured(tmp_path):
    c = TestClient(create_app(Settings(data_dir=tmp_path, admin_password="", secret="")))
    assert c.post("/api/admin/login", json={"password": ""}).status_code == 503


def proxied(tmp_path):
    s = Settings(data_dir=tmp_path, admin_password="pw", secret="s3cret", secure_cookie=False,
                 site_origins="https://dilyor.uz, https://www.dilyor.uz", trust_proxy=True)
    return TestClient(create_app(s), base_url="http://api.dilyor.uz")


def test_site_origin_may_write_through_proxy(tmp_path):
    c = proxied(tmp_path)
    login(c)
    ok = c.post("/api/admin/posts", json={"title": "x"}, headers={"Origin": "https://www.dilyor.uz"})
    assert ok.status_code == 201
    bad = c.post("/api/admin/posts", json={"title": "y"}, headers={"Origin": "https://evil.example"})
    assert bad.status_code == 403


def test_lockout_follows_forwarded_client_ip(tmp_path):
    c = proxied(tmp_path)
    for _ in range(5):
        c.post("/api/admin/login", json={"password": "no"}, headers={"X-Forwarded-For": "1.1.1.1, 76.76.21.9"})
    assert c.post("/api/admin/login", json={"password": "pw"}, headers={"X-Forwarded-For": "1.1.1.1"}).status_code == 429
    # someone else behind the same proxy is not locked out
    assert c.post("/api/admin/login", json={"password": "pw"}, headers={"X-Forwarded-For": "2.2.2.2"}).status_code == 200


def test_global_cap_stops_ip_rotation(tmp_path):
    c = proxied(tmp_path)
    for i in range(30):  # a spoofed X-Forwarded-For per try dodges the per-IP limit...
        c.post("/api/admin/login", json={"password": "no"}, headers={"X-Forwarded-For": f"10.0.0.{i}"})
    # ...but not the cap on all failures together
    r = c.post("/api/admin/login", json={"password": "pw"}, headers={"X-Forwarded-For": "9.9.9.9"})
    assert r.status_code == 429

# kyosan

Personal site of Dilyorbek Muhammadjonov (kyosan): a skate-poster landing page, hobby rooms with live stats, a blog, and an admin panel.

## Layout

- `src/` – React 18 + Vite + framer-motion. Routes: `/`, `/blog`, `/blog/:slug`, `/admin`.
- `server/` – FastAPI + SQLite. Projects, blog posts, image uploads, admin login, and two proxies:
  - `/api/faceit` – FACEIT level and elo (FACEIT has no CORS).
  - `/api/music` – listening data from [avj](https://avj.dilyor.dev) (`/api/public/{handle}/music`), with 30 s preview clips.
- `art/` – scripts that build the pixel sprite and cursors.

Live stats that need no server (chess.com, OpenDota, Codeforces, Monkeytype) are fetched straight from the browser; saved snapshots in `src/data.js` show until they answer.

## Run locally

```sh
npm install
cp server/.env.example server/.env   # set KYO_ADMIN_PASSWORD and KYO_SECRET
pip install -r server/requirements.txt
sh server/dev.sh                     # API on :8787
npm run dev                          # site; /api and /uploads are proxied to :8787
```

Tests: `cd server && python -m pytest`.

## Deploy

Live setup: **Vercel** serves the built site at dilyor.uz (project `dm-web`, deployed with `vercel --prod`) and `vercel.json` proxies `/api` and `/uploads` to **api.dilyor.uz**: nginx on oraclewps in front of the API container.

API on the server (`~/kyosan`):

```sh
scp server/{app.py,seed_projects.json,Dockerfile,.dockerignore} oraclewps:kyosan/server/
scp deploy/compose.yml oraclewps:kyosan/compose.yml
ssh oraclewps 'cd ~/kyosan && docker compose up -d --build'
```

`~/kyosan/.env` holds the admin password and secret (mode 600, never committed), plus `KYO_SITE_ORIGINS`, `KYO_TRUST_PROXY=1` and `KYO_UID`/`KYO_GID` (owner of `./data`). The SQLite DB and uploaded images live in `~/kyosan/data`; back that folder up. nginx config: `deploy/nginx-api.dilyor.uz.conf`, TLS by certbot.

Without the API the site still works: projects come from `server/seed_projects.json`, the blog shows as resting, admin is unavailable. Uploads are capped at 4 MB to fit the request limit of Vercel.

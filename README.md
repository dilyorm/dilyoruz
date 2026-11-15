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

`npm run build`, then either serve `dist/` with nginx and route `/api` + `/uploads` to the API, or set `KYO_DIST=../dist` and let the API serve everything. Keep `KYO_SECURE_COOKIE=1` behind HTTPS. On a static host without the API, the site still works: projects come from `server/seed_projects.json`, the blog shows as resting, admin is unavailable.

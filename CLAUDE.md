# CLAUDE.md — RonnyCutz (ronnycutz.com)

Quick orientation for Claude Code when helping Aaron modify this site.

## What this is

Single-page barber site + booking engine. Frontend: React 19 + Vite 6 + Tailwind 4. Backend: Express 5 + better-sqlite3. Deployed via Docker on a self-hosted Linux box at `192.168.68.69`, port `8084`, fronted by a Cloudflare Tunnel at `ronnycutz.com`.

## Shipping a change (the only workflow)

**There is an auto-deploy loop on the server. You do not SSH, you do not rsync, you do not touch Docker. You commit and push to `main`. That's it.**

```bash
git add <files>
git commit -m "concise message describing the change"
git push origin main
```

Within ~60 seconds, `deploy.sh` (running from cron on the server) detects the new commit on `origin/main`, runs `git reset --hard origin/main`, then `docker compose up -d --build`. The site picks up the change automatically. Logs land in `/home/ben/ronnycutz/deploy.log` on the server.

Because of this, **never commit broken code to `main`**. If the build fails inside the container, the old container keeps running but the new code is on disk — the site will be stale until the next successful build. Always run `npm run build` locally before pushing any change that touches frontend code.

## Content that's safe to edit freely

These are the "just edit the JSON/image" knobs Aaron will most often want:

| What | File |
|---|---|
| Services (name, price, duration, description) | `src/data/services.json` |
| Weekly hours | `src/data/hours.json` — format: `{ "mon": [["10:00","18:00"]], "tue": [], ... }`. Empty array = closed. |
| Gallery photos | `src/data/gallery.json` (+ drop images into `public/gallery/`) |
| Shop info (name, tagline, address, Instagram) | `src/data/shop.json` |
| Logo | `public/logo.jpg` |

**Important:** if you change `shop.json`, keep the existing field names. Components read `shop.address` (string), `shop.instagram`, `shop.instagram_url`, `shop.tagline`, `shop.name`. Do not rename or remove these without also updating every component that reads them — a missing field will crash the page on render (e.g. `Cannot read properties of undefined`).

## Theme

Palette lives in `src/index.css` under the `@theme` block (Tailwind 4 syntax). Current colors: charcoal background, red primary (`--color-brass` → `#E03A2F`), blue secondary (`--color-blue` → `#4A7FD4`), cream text. Fonts: Playfair Display (display) + Inter (body).

If you change theme variables, the whole site updates — no need to touch individual components.

## Architecture at a glance

```
server.js                 Express entry, static serving, SPA fallback
server/db.js              SQLite init + migrations (WAL mode)
server/availability.js    Slot computation (hours − bookings − blocks)
server/ics.js             RFC5545 ICS feed + single-event generation
server/email.js           Nodemailer/Gmail booking confirmations
server/routes/
  bookings.js             POST /api/bookings (transaction-safe), cancel, .ics
  availability.js         GET /api/availability?date=&service_id=
  calendar.js             GET /api/calendar.ics?token= (Apple Calendar feed)
  admin.js                Admin CRUD (bookings, blocks, config) — header auth

src/pages/LandingPage.jsx Single-page scroll composition
src/pages/AdminPage.jsx   Password-protected admin dashboard
src/components/           Hero, Services, Gallery, Booking/*, Hours, Footer, StickyMobileBar
src/lib/api.js            Fetch wrappers for all API calls

docker-compose.yml        Port 8084:3001, volume-mounts ./data for SQLite
Dockerfile                Multi-stage node:20-alpine build
```

## Local development

```bash
npm install
cp .env.example .env  # only needed if you want email/calendar features locally
npm run dev:all       # vite on :5173 + express on :3001
```

## Things NOT to commit

- `.env` (gitignored)
- `data/` (gitignored — SQLite DB lives here on the server)
- `node_modules/`, `dist/` (gitignored)

## Things NOT to touch without asking Ben

- `deploy.sh` — the auto-deploy loop depends on this exact behavior
- `Dockerfile` / `docker-compose.yml` — rebuilding these on the server is fine, but changing the port or volume paths will break the running container
- The admin password lives in `ADMIN_TOKEN` inside the server's `.env`. Ask Ben if Aaron needs it changed.

## If a deploy seems stuck

SSH-free debugging — just look at the log the next time you push a small change and `tail -f /home/ben/ronnycutz/deploy.log` on the server (Ben can do this). Common causes of a failed deploy:

1. Frontend build error → run `npm run build` locally before pushing.
2. Broken JSON in `src/data/*.json` → Vite build will catch this.
3. Component crash on render from a missing `shop.json` field → test locally with `npm run dev`.

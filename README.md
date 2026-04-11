# RonnyCutz — ronnycutz.com

Single-page barber site with booking, Apple Calendar sync, and a password-protected admin page. Auto-deploys from `main` within ~60s via cron (`deploy.sh` on the server) — see `CLAUDE.md` for the workflow.

**Stack**: React 19 + Vite + Tailwind 4 + Express 5 + better-sqlite3 + Docker.

## Quick start (local)

```bash
npm install
cp .env.example .env       # fill in GMAIL creds + generate tokens

# Dev (frontend + backend together)
npm run dev:all            # vite on :5173 proxies /api to express on :3001

# Or separately
npm run dev                # vite only (still proxies /api to :3001)
npm run dev:server         # express only

# Production-style local test
npm run build && NODE_ENV=production npm start
# → http://localhost:3001
```

Generate tokens:

```bash
openssl rand -hex 32
```

## Where to edit

| What | File |
|---|---|
| Services (name/price/duration) | `src/data/services.json` |
| Weekly hours | `src/data/hours.json` |
| Gallery photos | `src/data/gallery.json` (+ optional `public/gallery/*.jpg`) |
| Shop info (phone, address, IG, map) | `src/data/shop.json` |

## Deployment to 192.168.68.69

Mirrors the `4mn.org` deployment — host port **8084** routed by Nginx Proxy Manager.

### 1. Cloudflare DNS

Add an **A record** in Cloudflare for `4mn.org`:
- Name: `ronnycutz`
- Content: `198.49.23.144`
- Proxy: ON (orange cloud)

### 2. Push project to the server

```bash
# From your Mac:
rsync -av --exclude node_modules --exclude dist --exclude data --exclude .env \
  ./ ben@192.168.68.69:/home/ben/ronnycutz/
```

### 3. SSH in and create `.env`

```bash
ssh ben@192.168.68.69
cd /home/ben/ronnycutz
cp .env.example .env
nano .env
# Fill in:
#   GMAIL_USER, GMAIL_APP_PASSWORD (reuse 4mn creds or generate new)
#   NOTIFY_EMAIL=aaron's email
#   CALENDAR_FEED_TOKEN=$(openssl rand -hex 32)
#   ADMIN_TOKEN=$(openssl rand -hex 32)
#   PUBLIC_BASE_URL=https://ronnycutz.com
```

### 4. Launch

```bash
docker compose up -d --build
docker compose logs -f ronnycutz
curl http://localhost:8084/api/health
```

### 5. Cloudflare Tunnel ingress rule

The server already runs a shared cloudflared tunnel (`ebb2e075-...`) that routes multiple domains via `/etc/cloudflared/config.yml`. Add an entry under `ingress:` before the final `http_status:404` catch-all:

```yaml
  - hostname: ronnycutz.com
    service: http://localhost:8084
  - hostname: www.ronnycutz.com
    service: http://localhost:8084
```

Then reload:

```bash
sudo systemctl restart cloudflared
sudo systemctl is-active cloudflared
```

DNS: add a CNAME `ronnycutz.com` (and `www`) pointing to `ebb2e075-6206-4565-9a69-2c60c468698c.cfargotunnel.com`, proxied. Within ~30s `https://ronnycutz.com` resolves with a valid Cloudflare cert.

## Apple Calendar subscription (for Aaron)

Once deployed, build his subscribe URL using `CALENDAR_FEED_TOKEN` from `.env`:

```
webcal://ronnycutz.com/api/calendar.ics?token=YOUR_TOKEN
```

**On Mac:** open the webcal URL in Safari → it launches Calendar.app → set refresh to 5 minutes.
**On iPhone:** Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar → paste the URL without the `webcal://` prefix.

New bookings appear automatically. Cancelled bookings disappear on next refresh.

## Admin page

Hidden URL:

```
https://ronnycutz.com/admin?token=YOUR_ADMIN_TOKEN
```

Shows upcoming bookings (cancel any) and block-time-off form.

## API reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Liveness check |
| GET | `/api/availability?date=YYYY-MM-DD&service_id=X` | Open slots for a day |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/:id.ics` | Single-event ICS download |
| GET | `/api/bookings/:id/cancel?token=X` | Self-cancel link (in confirmation email) |
| GET | `/api/calendar.ics?token=X` | Full feed (token = `CALENDAR_FEED_TOKEN`) |
| GET | `/api/admin/bookings?token=X` | Admin list |
| POST | `/api/admin/bookings/:id/cancel?token=X` | Admin cancel |
| GET/POST | `/api/admin/blocks?token=X` | Admin time-off management |

## Verification checklist

- [ ] `curl http://localhost:8084/api/health` returns 200
- [ ] Visit `http://localhost:8084`, complete a test booking end-to-end
- [ ] SQLite row created: `sqlite3 data/ronnycutz.db "SELECT * FROM bookings;"`
- [ ] Confirmation email received with `.ics` attachment
- [ ] `curl "http://localhost:8084/api/calendar.ics?token=XXX"` returns a valid ICS body
- [ ] After tunnel ingress rule added: `curl -I https://ronnycutz.com` → 200
- [ ] Mobile Safari: sticky bottom bar works, date picker scrolls smoothly
- [ ] Concurrent booking test: two tabs try to book the same slot, second one rejects with 409

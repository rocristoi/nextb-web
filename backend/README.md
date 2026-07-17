# NexTB API

Standalone Fastify service for mo-bi live data, GTFS processing, fleet lookup, STB alerts, and AC voting. The Next.js PWA frontend talks to this service over HTTP.


## Architecture

```
Browser / PWA (frontend host)
        │  NEXT_PUBLIC_API_URL
        ▼
Reverse proxy / TLS
        │
        ▼
NexTB API (Node) — :8080
        │
        ├── mo-bi.ro (live vehicles)
        ├── gtfs.tpbi.ro (GTFS refresh)
        ├── info.stbsa.ro (alerts)
        └── Postgres (AC votes)
```

## Local development

```bash
# From repository root
cp backend/.env.example backend/.env
npm ci
npm run dev:api          # http://localhost:8080

# In another terminal — frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" >> .env.local
npm run dev
```

Health check: `GET http://localhost:8080/health`

## API surface

All routes are prefixed with `/api`:

| Method | Path |
|--------|------|
| GET | `/api?stationID=` |
| GET | `/api/routes` |
| GET | `/api/getstops` |
| GET | `/api/stops-index` |
| GET | `/api/routeShape?shapeId=&name=` |
| GET | `/api/alerts` |
| GET | `/api/vehicle/search?q=` |
| GET | `/api/vehicle/:inventoryId?plate=` |
| GET | `/api/ac/status` |
| POST | `/api/ac/report` |
| GET | `/api/cron/gtfs-refresh` |

## Production deployment

### Quick start

```bash
# From repository root
cp backend/.env.example backend/.env   # edit secrets
npm ci
npm run start:api
```

GTFS is fetched on startup when needed. Expose port `8080` behind your reverse proxy (nginx, Caddy, Traefik, etc.) and terminate TLS there. Set `CORS_ORIGIN` to your frontend URL(s).

### systemd (recommended)

```bash
bash backend/scripts/setup-server.sh
# Edit backend/.env, then:
sudo systemctl start nextb-api
sudo systemctl status nextb-api
```

The unit file is at `backend/deploy/systemd/nextb-api.service`. Update `User=` and `WorkingDirectory=` for your server.

### Frontend configuration

Set on the frontend host (e.g. Vercel):

```
NEXT_PUBLIC_API_URL=https://api.example.com
```

Ensure `CORS_ORIGIN` in `backend/.env` includes the frontend origin.

## Security

- **Helmet** — standard HTTP security headers
- **CORS** — restrict `CORS_ORIGIN` in production (not `*`)
- **Rate limiting** — on AC reports and vehicle search
- **Input validation** — Zod schemas on POST endpoints
- **Cron auth** — `GET /api/cron/gtfs-refresh` requires `Authorization: Bearer $CRON_SECRET`

## GTFS refresh

- **Startup:** `ensureGtfsData()` downloads and extracts the TPBI zip into `data/` (and writes `assets/data/stops.json`) when the bundle is missing or checksums are stale
- **Scheduled:** `GET /api/cron/gtfs-refresh` with `Authorization: Bearer $CRON_SECRET` — call from system cron or another scheduler

## Environment

See [`backend/.env.example`](.env.example). Never commit production secrets.

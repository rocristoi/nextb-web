# NexTB Deployment

NexTB is split into two deployable parts:

| Component | Location | Typical host |
|-----------|----------|--------------|
| **Frontend** (PWA) | Repository root | Vercel, Netlify, or any static/Node host |
| **API** | [`backend/`](backend/) | VPS or dedicated server (Node.js) |

## Prerequisites

- Node.js 22 (matches CI)
- A Postgres database for AC votes (e.g. Neon)
- Outbound network on the API host (mo-bi, GTFS, STB alerts)

Apply the AC votes migration once:

```bash
psql "$DATABASE_URL" -f tests/db/migrations/001_ac_votes.sql
```

---

## 1. Deploy the API

See [`backend/README.md`](backend/README.md) for environment variables, GTFS refresh, and CI/CD.

Minimum steps:

```bash
cp backend/.env.example backend/.env   # configure secrets
npm ci
npm run gtfs:prepare --workspace=backend
npm run start:api
curl http://127.0.0.1:8080/health
```

For a persistent service, use systemd — see `backend/deploy/systemd/nextb-api.service`.

Expose the service via your reverse proxy with HTTPS, e.g. `https://api.example.com`.

---

## 2. Deploy the frontend

### Environment variables

Set in your frontend host (e.g. Vercel → Project → Settings → Environment Variables):

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL, e.g. `https://api.example.com` (no trailing slash) |

Local development:

```bash
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Vercel (example)

```bash
vercel link
vercel          # preview
vercel --prod   # production
```

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Node.js version | 22 |

### Post-deploy checks

- [ ] `/` and `/app/home` load
- [ ] Map stops load (API `/api/getstops`)
- [ ] Station panel shows arrivals
- [ ] AC report on `/app/faulty` persists after refresh

---

## CI

| Workflow | Purpose |
|----------|---------|
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Frontend lint, unit tests, e2e |
| [`.github/workflows/backend-ci.yml`](.github/workflows/backend-ci.yml) | API typecheck |
| [`.github/workflows/deploy-backend.yml`](.github/workflows/deploy-backend.yml) | API deploy (self-hosted runner) |

For local testing, see [`TESTING.md`](TESTING.md).

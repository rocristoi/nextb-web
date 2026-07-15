# NexTB Deployment (Vercel)

Deploy NexTB from the repository root. The app is a Next.js 16 PWA with a daily GTFS refresh cron and Neon Postgres for AC votes.

## Prerequisites

- Node.js 22 (matches CI)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- A Neon Postgres database with the AC votes schema applied
- Outbound network access at build time (GTFS download from `gtfs.tpbi.ro`)

## 1. Database migration

Apply the migration once against your Neon database:

```bash
# Using psql (replace with your connection string locally — never commit it)
psql "$DATABASE_URL" -f tests/db/migrations/001_ac_votes.sql
```

This creates the `ac_votes` table and index used by `/api/ac/report` and `/api/ac/status`.

## 2. Environment variables

Copy the template and fill in secrets locally:

```bash
cp .env.example .env.local
```

Set these in **Vercel → Project → Settings → Environment Variables** for Production, Preview, and Development:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `CRON_SECRET` | Yes | Random secret; Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` |
| `DEVICE_HASH_SALT` | Yes | Random secret for AC report device hashing |
| `CORS_MOBI_*` | No | Defaults point to mo-bi.ro |
| `MIN_MINUTES_PER_STOP` | No | Default `2` |
| `AVG_SPEED_METERS_PER_MIN` | No | Default `230` |
| `ETA_TOLERANCE_MINUTES` | No | Default `1` |
| `STOP_SPACING_METERS` | No | Default `350` |

Never echo secret values in logs or chat.

Sync from Vercel to local after linking:

```bash
vercel env pull .env.local
```

Or push required secrets from `.env.local` to all Vercel environments:

```bash
node scripts/sync-vercel-env.mjs
```

## 3. Link and deploy

From the repository root:

```bash
vercel link
vercel          # preview deployment
vercel --prod   # production (confirm when prompted)
```

### Vercel project settings

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Root Directory | `.` (repository root) |
| Build Command | `npm run build` (includes GTFS prebuild) |
| Install Command | `npm ci` |
| Node.js version | 22 |

`vercel.json` configures the daily cron:

- **Path:** `/api/cron/gtfs-refresh`
- **Schedule:** `0 3 * * *` (03:00 UTC)

The cron route accepts auth via `Authorization: Bearer <CRON_SECRET>` (Vercel default) or `?secret=<CRON_SECRET>` for manual testing.

Manual cron test:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://YOUR_DEPLOYMENT/api/cron/gtfs-refresh
```

## 4. Post-deploy verification

- [ ] `/` and `/app/home` load
- [ ] `/api/routes` returns JSON
- [ ] `/app/faulty` — submit AC report, refresh page, vote persists (Neon)
- [ ] Preview deployment status is **Ready** in Vercel dashboard
- [ ] Cron appears under **Settings → Cron Jobs**

## Known serverless limitations

- **Rate limiting** (`lib/server/rate-limit.ts`) is per serverless instance, not global across regions.
- **GTFS cache** on the filesystem is ephemeral; the build step and daily cron refresh data. Cold starts re-download via `instrumentation.ts` if files are missing.
- **Cron duration** — the GTFS refresh route sets `maxDuration = 60`. On Hobby, function timeouts may be lower; upgrade to Pro if cron jobs fail with timeout errors.

## CI

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint, unit tests, production build, and Playwright smoke e2e on push/PR to `main`/`master`.

For local testing, see [`TESTING.md`](TESTING.md).

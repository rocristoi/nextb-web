# NexTB Testing

## Automated

```bash
npm run test:unit     # Vitest (tests/unit)
npm run test:e2e      # Playwright smoke test (tests/e2e)
npm run test:ci       # unit + build + e2e (same as CI)
```

CI runs on push/PR via [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, unit tests, production build, then one Playwright smoke test.

## Manual QA checklist

- [ ] Landing page at `/` loads; CTAs go to `/app/home` and `/app/map`
- [ ] Legacy URLs redirect: `/map` → `/app/map`, `/lines` → `/app/lines`
- [ ] PWA `start_url` is `/app/home`; install prompt works
- [ ] Home: add/remove favorites from station panel; ETAs refresh
- [ ] Map: station search flies to stop and opens panel
- [ ] Station panel: comfort badges, AC uncertain state, stops away
- [ ] Lines: alert dots on affected lines; regional operators toggle in settings
- [ ] Route map: line alerts sidebar; vehicle modal
- [ ] Faulty AC: report broken/working; list updates
- [ ] Lookup: search by ID or plate
- [ ] Fleet stats page renders depot chart
- [ ] Theme toggle on landing and in app
- [ ] mo-bi 503 shows friendly error on station panel
- [ ] Rate limit returns 429 on excessive AC reports

## Environment

- `DATABASE_URL` — Neon for persistent AC votes (required in production; in-memory fallback locally)
- `DEVICE_HASH_SALT` — required in production for AC reports
- `CRON_SECRET` — required in production for GTFS cron (Bearer token from Vercel Cron)

Production deployment: [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Database migrations

SQL migrations live in [`tests/db/migrations/`](tests/db/migrations/). Apply them manually to Neon when setting up production (e.g. `001_ac_votes.sql`).

For how arrivals, fleet resolution, and GTFS filtering work, see [README.md](./README.md).

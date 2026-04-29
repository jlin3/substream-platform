# Substream Platform — Deployment Guide

This repo hosts the multi-tenant **substream-platform** Next.js app. It is
deployed alongside the **highlight-service** FastAPI microservice (in
[`highlight-service/`](highlight-service/)) as **two Railway services that
share one Railway project**.

> NOTE: this is a *different* deployment from the SDK monorepo's `IVSBackend`.
> The platform has its own Postgres, its own Redis, and its own highlight-service.

---

## Architecture

```
                                        Railway project: substream
 ┌────────────────────────┐           ┌────────────────────────────────┐
 │  substream-platform    │  internal │  substream-highlight-service   │
 │  (Next.js, this repo)  │ ───────▶  │  (FastAPI, highlight-service/) │
 │  /api/*  /dashboard/*  │ callback  │  /api/v1/highlights            │
 └──────┬─────────────────┘ ◀───────  └──────┬─────────────────────────┘
        │                                     │
        ▼                                     ▼
  Postgres + Redis                     GCS (video in/out)
  AWS IVS Real-Time                    Vertex AI Gemini 3.1 Pro
```

---

## Prerequisites

1. **Railway** account and CLI: `npm i -g @railway/cli && railway login`
2. **AWS**: account with IVS Real-Time + an IAM user with `AmazonIVSFullAccess`
   and S3 write (for recordings)
3. **GCP**: a service account with the roles below, downloaded as JSON:
   - `roles/storage.objectAdmin` — read source videos, write highlight reels
   - `roles/aiplatform.user` — invoke Gemini via Vertex AI
   - `roles/videointelligence.editor` — Video Intelligence annotations (legacy path)

---

## One-time setup

```bash
git clone git@github.com:jlin3/substream-platform.git
cd substream-platform
pnpm install

# IVS Real-Time stage + channel (writes env values to stdout — copy into Railway)
pnpm ivs:setup
```

---

## Deploy

### 1. Create the Railway project

```bash
railway init   # creates a new project, e.g. "substream"
```

From the Railway dashboard, add **three plugins** inside this project:

- **Postgres** (required) — exposes `DATABASE_URL`
- **Redis** (required) — expose as `REDIS_URL`

### 2. Deploy `substream-highlight-service` (FastAPI)

```bash
cd highlight-service
railway up --service substream-highlight-service
```

Set env vars for this service (Railway → Service → Variables):

| Variable | Required | Example |
|----------|----------|---------|
| `GCP_PROJECT` | yes | `substream-prod` |
| `GCP_REGION` | yes | `us-central1` |
| `GCP_CREDENTIALS_JSON` | yes | *full JSON contents of the service-account key* |
| `GCS_SOURCE_BUCKET` | yes | `substream-recordings` |
| `GCS_HIGHLIGHTS_BUCKET` | yes | `substream-highlights` |
| `GEMINI_DISCOVERY_MODEL` | no | `gemini-3.1-pro-preview` (default) |
| `GEMINI_SCORING_MODEL` | no | `gemini-3.1-pro-preview` |
| `GEMINI_REVIEW_MODEL` | no | `gemini-3.1-pro-preview` |
| `USE_FIRESTORE` | no | `true` to persist jobs in Firestore |
| `QUALITY_REVIEW_THRESHOLD` | no | `60` (0–100) |
| `DEFAULT_OUTPUT_PRESET` | no | `standard` / `social` / `extended` |
| `WEBHOOK_TIMEOUT_SECONDS` | no | `30` |

Verify:

```bash
curl https://<highlight-service-domain>/health
# => { "status": "ok", "version": "2.0.0", "models": { ... } }
```

### 3. Deploy `substream-platform` (Next.js)

```bash
cd ..
railway up --service substream-platform
```

Attach Postgres and Redis, then set env vars (see also [env.example.txt](env.example.txt)):

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | yes | from Postgres plugin |
| `REDIS_URL` | yes | from Redis plugin |
| `JWT_SECRET` | yes | `openssl rand -hex 64` |
| `STREAM_KEY_ENCRYPTION_KEY` | yes | `openssl rand -hex 32` |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_ACCOUNT_ID` | yes | IVS creds |
| `IVS_STAGE_ARN`, `IVS_CHANNEL_ARN` | yes | from `pnpm ivs:setup` |
| `IVS_RECORDING_CONFIG_ARN`, `IVS_PLAYBACK_KEY_PAIR_ID`, `IVS_PLAYBACK_PRIVATE_KEY` | optional | legacy RTMPS path |
| `S3_RECORDING_BUCKET` | yes | IVS recording bucket |
| `HIGHLIGHT_SERVICE_URL` | yes | internal URL of the highlight-service, e.g. `https://substream-highlight-service.railway.internal` |
| `HIGHLIGHT_CALLBACK_SECRET` | yes | `openssl rand -hex 32` — HMAC shared secret used by highlight-service callbacks |
| `PUBLIC_BASE_URL` | yes | e.g. `https://demo.substream.dev` — used in webhook callback URLs |
| `NEXT_PUBLIC_SITE_URL` | no | used for OG metadata |
| `DEMO_ORG_CODE` | no | defaults to `livewave123`; controls the `/login` access code |
| `LOG_LEVEL` | no | `info` / `debug` |
| `NEXT_PUBLIC_POSTHOG_KEY` | no | Enables client + server product analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | no | Defaults to `https://us.i.posthog.com` |

### 4. Run migrations + seed demo data

```bash
# migrations run automatically on container start (npm run start:production),
# but you can force them from the CLI:
railway run --service substream-platform npx prisma migrate deploy

# seed the `substream-demo` org + narrative highlights
railway run --service substream-platform pnpm db:seed
```

### 5. Verify end-to-end

```bash
# platform health
curl https://<platform-domain>/api/health

# highlight-service health
curl https://<highlight-service-domain>/health

# one-click demo dashboard
open https://<platform-domain>/api/auth/demo-auto
```

The dashboard should show the seeded streams and three narrative highlights
(**Halo CTF**, **Apex BR 9:16 social**, **Soccer matchday recap**).

---

## Operational notes

### Running locally (both services)

```bash
# Terminal 1 — platform
cp env.example.txt .env
# fill in DATABASE_URL, REDIS_URL, AWS_*, IVS_*, HIGHLIGHT_SERVICE_URL=http://localhost:8080
pnpm dev

# Terminal 2 — highlight-service
cd highlight-service
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/gcp-key.json
export GCP_PROJECT=substream-prod
uvicorn main:app --reload --port 8080
```

### Logs

```bash
railway logs -s substream-platform -f
railway logs -s substream-highlight-service -f
```

### Database

```bash
railway run -s substream-platform pnpm db:studio
```

---

## Troubleshooting

**"Highlight jobs stuck in PROCESSING"** — confirm
`HIGHLIGHT_SERVICE_URL` is reachable from the platform service (use
Railway's *internal* hostname, not the public one) and that
`HIGHLIGHT_CALLBACK_SECRET` matches on both sides. Tail the highlight
service logs for the callback POST.

**"Prisma migrate deploy failed on startup"** — the container keeps
running even if migrations fail; tail logs to see the error. Common cause
is a shadow-schema issue on Railway's Postgres; run migrations manually
via `railway run -s substream-platform npx prisma migrate deploy`.

**"IVS playback 403"** — check `IVS_PLAYBACK_PRIVATE_KEY` includes the
full PEM with newlines (use `\n` in Railway env values) and that
`AWS_ACCOUNT_ID` is set.

**"Demo login fails in production"** — a `DEMO_ORG_CODE` must be set OR
the seed must have run; see [src/app/api/auth/demo-login/route.ts](src/app/api/auth/demo-login/route.ts).

---

## Cost notes

- Railway — hobby ≈ $5/month per service ($10 for platform + highlight-service)
- Postgres plugin — $5/month
- AWS IVS Real-Time — ~$0.65/hr per publisher, ~$0.10/hr per subscriber
- GCP Gemini 3.1 Pro — usage-based; ~$0.01–$0.03 per minute of source video analysed

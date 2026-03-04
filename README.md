# Substream Platform

Multi-tenant streaming platform for businesses. Enables any website to embed live game streaming with chat, reactions, analytics, and viewer engagement.

Built on top of the [Substream SDK](https://github.com/jlin3/substream-sdk) and AWS IVS.

## Features

- **Multi-tenancy**: Organizations, Apps, API keys with scoped permissions
- **Auth**: API key (sk_live_*) and JWT authentication
- **Horizontal scaling**: Redis-backed stage pool, BullMQ webhook delivery
- **Chat**: AWS IVS Chat integration with moderation
- **Engagement**: Emoji reactions (Redis pub/sub), live viewer count (SSE)
- **Embeddable widget**: Drop-in `<script>` tag with video, chat, reactions
- **Stream discovery**: List live streams per app with filtering
- **Analytics**: Aggregate metrics, daily time-series, per-app breakdown
- **Admin dashboard**: Real-time overview at `/dashboard`
- **Observability**: Prometheus metrics at `/api/metrics`, structured pino logging

## Quick Start

```bash
pnpm install
cp env.example.txt .env    # Fill in your values
npx prisma generate
npx prisma db push
pnpm dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `REDIS_URL` | Recommended | Redis connection (falls back to in-memory) |
| `AWS_ACCESS_KEY_ID` | Yes | AWS credentials for IVS |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS credentials for IVS |
| `AWS_REGION` | Yes | AWS region (e.g., us-east-1) |
| `JWT_SECRET` | Production | Secret for signing/verifying JWTs |
| `STREAM_KEY_ENCRYPTION_KEY` | Production | 64 hex chars for AES-256-GCM |
| `STAGE_POOL_TARGET` | No | Stage pool size (default: 50) |
| `STAGE_POOL_MAX` | No | Max pool size (default: 500) |

## API Overview

### Organization Management
- `POST /api/orgs` — Create organization (returns API key)
- `POST /api/orgs/:id/apps` — Create app
- `POST /api/orgs/:id/keys` — Create API key
- `POST /api/apps/:id/tokens` — Issue JWT for a player

### Streaming
- `POST /api/streams/web-publish` — Start a stream
- `GET /api/streams/:id/viewer` — Get viewer token
- `GET /api/apps/:appId/streams?live=1` — List live streams

### Engagement
- `POST /api/streams/:id/chat` — Get chat token
- `POST /api/streams/:id/reactions` — Send reaction
- `GET /api/streams/:id/events` — SSE (viewer count + reactions)
- `GET /api/streams/:id/viewers` — Viewer count

### Analytics
- `GET /api/orgs/:id/analytics` — Organization metrics

### Embed
```html
<div data-stream-id="<id>" data-backend-url="https://..." data-auth-token="<token>"></div>
<script src="https://your-platform.com/embed.js"></script>
```

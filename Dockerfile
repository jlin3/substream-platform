FROM node:22-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN pnpm install --frozen-lockfile

RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate

COPY . .

RUN pnpm build

EXPOSE 3000

# Run pending migrations, then start Next. `|| echo ...` keeps the container
# alive if migrate fails so the app can still serve (and surface errors via
# logs) — matches the resilience pattern used by the SDK's IVSBackend.
CMD ["pnpm", "start:production"]

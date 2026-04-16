FROM node:22-slim AS builder

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm install
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate

COPY . .
RUN npm run build

FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]

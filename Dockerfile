# ── Etapa de build: TS → dist + cliente Prisma generado ──────────────────────
FROM node:24-slim AS build
WORKDIR /app
# openssl: sin él Prisma no detecta la versión SSL y elige el engine equivocado
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY prisma ./prisma
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npx prisma generate && npm run build

# ── Runtime: mínimo necesario para servir ─────────────────────────────────────
FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY docs ./docs
# --omit=dev incluye el CLI de prisma (dependencias): migrate deploy corre en el arranque
RUN npm ci --omit=dev --no-audit --no-fund && npx prisma generate
COPY --from=build /app/dist ./dist

USER node
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

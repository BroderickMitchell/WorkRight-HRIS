# syntax=docker/dockerfile:1.7

############################
# base: deps (with PNPM)
############################
FROM node:24-bookworm-slim AS base
WORKDIR /app

# Enable pnpm via corepack
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Build tooling for native deps (argon2, sharp, etc.)
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

# ---- cache-friendly workspace metadata ----
COPY pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY pnpm-lock.yaml ./

# postinstall bootstrap MUST exist before first install (fixes prior MODULE_NOT_FOUND)
COPY scripts/bootstrap-env.mjs scripts/

# Prisma assets needed during install/generate
COPY apps/api/prisma apps/api/prisma
COPY apps/api/scripts apps/api/scripts

# First install (deterministic + cached). Use cache mount to speed up CI.
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm install --frozen-lockfile

# Ensure prisma client/engines are present in the layer cache
RUN pnpm --filter @workright/api exec prisma format \
 && pnpm --filter @workright/api exec prisma generate


############################
# build: compile everything
############################
FROM base AS build
WORKDIR /app

# Bring the full repo
COPY . .

# Rebuild any native deps after full sources are present & run postinstall hooks
RUN --mount=type=cache,target=/root/.pnpm-store \
    pnpm -w rebuild -r \
 && pnpm -w -r run postinstall

# Build shared packages first (faster multi-stage caching)
RUN pnpm --filter @workright/ui run build \
 && pnpm --filter @workright/profile-schema run build \
 && pnpm --filter @workright/config run build

# API build (NestJS)
RUN pnpm --filter @workright/api exec prisma generate \
 && pnpm --filter @workright/api run build

# Web build (Next.js standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web run build

# Produce lean prod payload of the API (package.json + pruned node_modules)
RUN pnpm deploy --filter @workright/api --prod /app/deploy/api


############################
# runtime: Web (Next.js standalone)
# Build with: docker build --target runtime-web -t your-image .
############################
FROM node:24-alpine AS runtime-web
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Next.js standalone output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]


############################
# runtime: API (Cloud Run default)
############################
FROM node:24-bookworm-slim AS runtime-api
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Bring production deps from deploy output
COPY --from=build /app/deploy/api/node_modules ./node_modules
COPY --from=build /app/deploy/api/package.json ./package.json

# Bring compiled Nest build artifacts
COPY --from=build /app/apps/api/dist ./dist

# Bring Prisma schema/migrations if used at runtime (e.g., migrations or client env)
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

# Fail early if the entrypoint is missing
RUN test -f /app/dist/main.js || (echo "dist/main.js missing!" && ls -la /app/dist && exit 1)

EXPOSE 8080
CMD ["node", "dist/main.js"]

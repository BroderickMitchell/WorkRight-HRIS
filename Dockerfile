# syntax=docker/dockerfile:1.7

############################
# base: deps (with PNPM)
############################
FROM node:22-bookworm-slim AS base
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


# Postinstall bootstrap MUST exist before first install
COPY scripts/ ./scripts/

# Prisma bits needed by api during build (for generate)
COPY apps/api/prisma apps/api/prisma
COPY apps/api/scripts apps/api/scripts

# IMPORTANT: copy *workspace* package manifests so pnpm "sees" them on first install
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

# First install (cache-friendly)
RUN pnpm install --prod=false

############################
# build: compile everything
############################
FROM base AS build
WORKDIR /app

# Bring the full repo
COPY . .

# Ensure all packages are installed after sources copied
RUN pnpm -w install --prod=false

# Generate Prisma client for the API (ensures runtime binaries are baked into image)
RUN pnpm --filter @workright/api exec prisma generate

# Rebuild any native deps & run postinstall hooks
RUN pnpm -w rebuild -r \
 && pnpm -w -r run postinstall

# Build shared packages first (better cache hits)
RUN pnpm --filter @workright/ui run build \
 && pnpm --filter @workright/profile-schema run build \
 && pnpm --filter @workright/config run build

# --- API build ---
# Build via package script (runs Prisma generate via prebuild and compiles Nest)
RUN pnpm --filter @workright/api run build

# Produce lean prod payload of the API (package.json + pruned node_modules)
RUN pnpm deploy --filter @workright/api --prod /app/deploy/api

# --- Web build (Next.js) ---
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web exec next lint || true \
 && pnpm --filter @workright/web run typecheck || true
RUN pnpm --filter @workright/web run build

############################
# runtime: API (Cloud Run default)
############################
FROM node:22-bookworm-slim AS runtime-api
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
ENV CLOUD_RUN=true

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Bring production deps from deploy output
COPY --from=build /app/deploy/api/node_modules ./node_modules
COPY --from=build /app/deploy/api/package.json ./package.json

# Bring compiled Nest build artifacts
COPY --from=build /app/apps/api/dist ./dist

# Bring Prisma files with correct paths
COPY --from=build /app/apps/api/prisma ./prisma
ENV PRISMA_SCHEMA_PATH=/app/prisma/schema.prisma

# Bring Prisma helper scripts for conditional migrations
COPY --from=build /app/apps/api/scripts ./scripts

# Sanity check (adjust path if outDir changes)
RUN test -f /app/dist/main.js || (echo "dist/main.js missing!" && ls -la /app/dist && exit 1)

EXPOSE 8080

# Direct execution for debugging (add migrations later once this works)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]

############################
# runtime: Web (Next.js standalone)
# Build with: docker build --target runtime-web -t your-image .
############################
FROM node:22-alpine AS runtime-web
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

# Next.js standalone output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 8080

# Correct path for Next.js standalone server
CMD ["node", "apps/web/server.js"]


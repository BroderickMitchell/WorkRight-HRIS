# ---------- base: deps ----------
FROM node:20-bullseye-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Align pnpm with the workspace's declared package manager version
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential openssl \
  && rm -rf /var/lib/apt/lists/*

# Workspace metadata (cache-friendly)
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy TypeScript config early so builds pick up Node types + decorators
COPY tsconfig.base.json ./

# Package manifests only (so pnpm can resolve deps per package)
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/
COPY scripts/bootstrap-env.mjs scripts/
COPY apps/api/prisma apps/api/prisma

# Install deps for the whole workspace
RUN if [ -f pnpm-lock.yaml ]; then \
    pnpm -w install --frozen-lockfile; \
  else \
    pnpm -w install; \
  fi

# ---------- build ----------
FROM base AS build
WORKDIR /app

# Bring in the full sources
COPY . .

# Rebuild native deps + run postinstall now that sources exist
RUN pnpm -w rebuild -r \
 && pnpm -w -r run postinstall

# Build libraries first
RUN pnpm --filter @workright/ui run build \
 && pnpm --filter @workright/profile-schema run build \
 && pnpm --filter @workright/config run build

# API: prisma client + build
RUN pnpm --filter @workright/api exec prisma generate --schema prisma/schema.prisma \
 && pnpm --filter @workright/api run build

# Web: Next.js build (standalone output expected)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web run build

# Produce isolated production deployment for the API
RUN pnpm deploy --filter @workright/api --prod /app/deploy/api

# ---------- runtime-api ----------
FROM node:20-bullseye-slim AS runtime-api
WORKDIR /app

COPY --from=build /app/deploy/api ./
COPY --from=build /app/apps/api/prisma apps/api/prisma

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]

# ---------- runtime-web ----------
FROM node:20-alpine AS runtime-web
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000
# Keep whatever your Next.js standalone entry is (usually apps/web/server.js)
CMD ["node", "apps/web/server.js"]

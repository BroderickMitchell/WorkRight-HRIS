# ---------- base: deps ----------
FROM node:20-bullseye-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential openssl \
  && rm -rf /var/lib/apt/lists/*

# Workspace metadata (cache-friendly)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Package manifests only (so pnpm can resolve deps per package)
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

# Full install incl. dev deps (allow lockfile updates if not committed)
RUN pnpm -w install --no-frozen-lockfile

# ---------- build ----------
FROM base AS build
WORKDIR /app

# Now copy sources
COPY . .

# Build libraries first
RUN pnpm --filter ./packages/profile-schema run build \
 && pnpm --filter ./packages/config run build

# API: prisma + build
RUN pnpm --filter ./apps/api run prisma:generate \
 && pnpm --filter ./apps/api run build

# Web: Next.js build (expects output: 'standalone' in apps/web/next.config.js)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter ./apps/web run build

# ---------- runtime-api ----------
FROM node:20-alpine AS runtime-api
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate

# Minimal manifests so pnpm can install prod deps only for API and its graph
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/package.json ./
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/packages/config/package.json packages/config/
COPY --from=build /app/packages/profile-schema/package.json packages/profile-schema/
COPY --from=build /app/packages/ui/package.json packages/ui/

# Prod-only install for API and deps
RUN pnpm -w --filter ./apps/api... install --prod --no-frozen-lockfile

# Bring built artefacts
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]

# ---------- runtime-web ----------
FROM node:20-alpine AS runtime-web
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@latest --activate
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public

EXPOSE 3000
CMD ["node", "apps/web/server.js"]
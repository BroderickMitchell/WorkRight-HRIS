# syntax=docker/dockerfile:1.7

# ---------- base: deps ----------
FROM node:20-bullseye-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential openssl \
  && rm -rf /var/lib/apt/lists/*

# Workspace metadata (cache-friendly)
COPY pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

# Optionally copy the workspace lockfile when present
RUN --mount=type=bind,source=.,target=/tmp/context,ro \
  if [ -f /tmp/context/pnpm-lock.yaml ]; then \
    cp /tmp/context/pnpm-lock.yaml ./pnpm-lock.yaml; \
  fi

# Package manifests (for workspace install)
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/
COPY scripts/bootstrap-env.mjs scripts/
COPY apps/api/prisma apps/api/prisma

# Install once for the workspace
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm -w install --frozen-lockfile; \
    else \
      pnpm -w install; \
    fi

# ---------- build ----------
FROM base AS build
WORKDIR /app
COPY . .

RUN pnpm -w rebuild -r \
 && pnpm -w -r run postinstall

# Build libs first
RUN pnpm --filter @workright/ui run build \
 && pnpm --filter @workright/profile-schema run build \
 && pnpm --filter @workright/config run build

# API build (and ensure prisma client is generated)
RUN pnpm --filter @workright/api exec prisma generate --schema prisma/schema.prisma \
 && pnpm --filter @workright/api run build

# Web build (standalone)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web run build

# Produce lean prod payload of the API
RUN pnpm deploy --filter @workright/api --prod /app/deploy/api

# ---------- runtime-api ----------
FROM node:20-bullseye-slim AS runtime-api
WORKDIR /app

# Bring production deps from pnpm deploy output
COPY --from=build /app/deploy/api/node_modules ./node_modules
COPY --from=build /app/deploy/api/package.json ./package.json

# Bring the compiled Nest build artifacts explicitly
COPY --from=build /app/apps/api/dist ./dist

# Bring Prisma assets (migrations, schema) if you need them at runtime
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

ENV NODE_ENV=production
EXPOSE 3001

# Verify the entry exists at build time (fail early if not)
RUN test -f /app/dist/main.js || (echo "dist/main.js missing!" && ls -la /app/dist && exit 1)

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
CMD ["node", "apps/web/server.js"]

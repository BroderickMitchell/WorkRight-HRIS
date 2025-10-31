# ---------- base: deps ----------
FROM node:20-bullseye-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
# Align pnpm with the workspace's declared package manager version to avoid
# unexpected CLI differences during Docker builds (e.g. `pnpm prune` changes in
# pnpm@9).
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

# Full install incl. dev deps. When the lockfile is present, keep installs
# reproducible with --frozen-lockfile; otherwise fall back to the latest
# dependency graph to avoid failing the build when the lockfile is intentionally
# excluded from the workspace (common for private monorepos).
# Skip lifecycle scripts until the full workspace (including the Prisma schema)
# has been copied to avoid failures during cached dependency installs.
RUN if [ -f pnpm-lock.yaml ]; then \
    pnpm -w install --frozen-lockfile; \
  else \
    pnpm -w install; \
  fi

# ---------- build ----------
FROM base AS build
WORKDIR /app

# Now copy sources
COPY . .

# Rebuild any native dependencies against the final filesystem contents and run
# package lifecycle scripts once source files such as the Prisma schema are
# present.
RUN pnpm -w rebuild -r \
 && pnpm -w -r run postinstall

# Build libraries first so application bundles consume fresh artefacts.
RUN pnpm --filter @workright/ui run build \
 && pnpm --filter @workright/profile-schema run build \
 && pnpm --filter @workright/config run build

# API: prisma + build
RUN pnpm --filter @workright/api exec prisma generate --schema prisma/schema.prisma \
 && pnpm --filter @workright/api run build

# Web: Next.js build (expects output: 'standalone' in apps/web/next.config.js)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web run build

# Produce an isolated production deployment for the API with only the
# dependencies it requires at runtime. This avoids copying the entire
# workspace's node_modules tree (which may omit packages pruned as dev-only)
# into the final image and keeps the runtime lean and predictable.
RUN pnpm deploy --filter @workright/api --prod /app/deploy/api

# ---------- runtime-api ----------
FROM node:20-bullseye-slim AS runtime-api
WORKDIR /app

# Bring the deploy output which contains the API build along with its
# production dependencies. Include Prisma assets that need to remain editable
# (migrations, schema) in the runtime layer.
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
CMD ["node", "apps/web/server.js"]

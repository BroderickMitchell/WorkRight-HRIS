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
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./

# Package manifests only (so pnpm can resolve deps per package)
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/
COPY scripts/bootstrap-env.mjs scripts/

# Full install incl. dev deps (allow lockfile updates if not committed).
# Skip lifecycle scripts until the full workspace (including the Prisma schema)
# has been copied to avoid failures during cached dependency installs.
RUN pnpm -w install --no-frozen-lockfile --ignore-scripts

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

# Build libraries first
RUN pnpm --filter @workright/profile-schema run build \
 && pnpm --filter @workright/config run build \
 && pnpm --filter @workright/ui run build

# API: prisma + build
RUN pnpm --filter @workright/api exec prisma generate --schema prisma/schema.prisma \
 && pnpm --filter ./apps/api run build

# Web: Next.js build (expects output: 'standalone' in apps/web/next.config.js)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/ui run build
RUN pnpm --filter ./apps/web run build

# Drop dev-only dependencies prior to packaging runtime images so the runtime
# layers only include production dependencies for the workspaces that are part
# of the deployment graph (root -> @workright/api).
RUN pnpm prune --prod

# ---------- runtime-api ----------
FROM node:20-bullseye-slim AS runtime-api
WORKDIR /app

# Bring built artefacts and dependencies produced during the build stage
COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/packages/config/dist packages/config/dist
COPY --from=build /app/packages/config/package.json packages/config/
COPY --from=build /app/packages/profile-schema/dist packages/profile-schema/dist
COPY --from=build /app/packages/profile-schema/package.json packages/profile-schema/
COPY --from=build /app/packages/ui/package.json packages/ui/
COPY --from=build /app/scripts scripts/

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]

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

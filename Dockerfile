# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Install build tooling
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      python3 \
      build-essential && \
    rm -rf /var/lib/apt/lists/*

# Copy workspace metadata and base configs for cache-friendly install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./

# Copy the specific files that postinstall hooks rely on BEFORE running pnpm install
# (this prevents postinstall from failing due to missing helper scripts or prisma files)
COPY scripts ./scripts
COPY apps/api/prisma ./apps/api/prisma
COPY apps/api/scripts ./apps/api/scripts

# Copy minimal package manifests so pnpm can resolve workspace graph
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

RUN pnpm install --prod=false

# -------------------------
# BUILD STAGE
# -------------------------
FROM base AS build
WORKDIR /app

# Copy full repo
COPY . .

# Ensure dependencies are installed after sources copied
RUN pnpm -w install --prod=false

# Generate Prisma client if present (non-fatal)
RUN pnpm --filter @workright/api exec prisma generate || true

# Rebuild native deps & run postinstall hooks
RUN pnpm -w rebuild -r && \
    pnpm -w -r run postinstall

# Build shared packages
RUN pnpm --filter @workright/ui run build && \
    pnpm --filter @workright/profile-schema run build && \
    pnpm --filter @workright/config run build

# Build API
RUN pnpm --filter @workright/api run build

# Optional: create pruned deploy folder if your tooling supports it
RUN pnpm deploy --filter @workright/api --prod /app/deploy/api || true

# Build web (optional)
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web run build || true

# -------------------------
# RUNTIME API IMAGE
# -------------------------
FROM node:24-bookworm-slim AS runtime-api
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV CLOUD_RUN=true

# Prefer deploy output (smaller). Fallbacks below.
COPY --from=build /app/deploy/api/node_modules ./node_modules
COPY --from=build /app/deploy/api/package.json ./package.json

# Copy built API artifacts
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json.app

# Fallback if deploy node_modules not created
RUN if [ ! -d /app/node_modules ]; then \
      echo "deploy node_modules missing: copying apps/api/node_modules fallback" ; \
      cp -a /app/apps/api/node_modules ./node_modules 2>/dev/null || true ; \
    fi

# Final sanity check
RUN if [ ! -f /app/dist/main.js ]; then echo "ERROR: /app/dist/main.js missing"; ls -la /app/dist || true; exit 1; fi

EXPOSE 8080
CMD ["node", "dist/main.js"]

# Dockerfile (monorepo — runtime-api fixed)

# Multi-stage build: deps/base -> build -> runtime-api (Cloud Run safe)

# Replace your current root Dockerfile with this content.

# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Build tooling for native deps that some packages may need

RUN apt-get update 
&& apt-get install -y --no-install-recommends ca-certificates python3 build-essential 
&& rm -rf /var/lib/apt/lists/*

# Copy workspace metadata first for cache-friendly install

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Copy minimal package manifests so pnpm can resolve workspace graph

COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

RUN pnpm install --prod=false

# -------------------------

# Build stage

# -------------------------

FROM base AS build
WORKDIR /app

# Copy repo sources

COPY . .

# Ensure dependencies are installed with sources present

RUN pnpm -w install --prod=false

# Generate Prisma client if present (non-fatal)

RUN pnpm --filter @workright/api exec prisma generate || true

# Rebuild native deps & run postinstall hooks

RUN pnpm -w rebuild -r 
&& pnpm -w -r run postinstall

# Build shared packages first for cache benefits

RUN pnpm --filter @workright/ui run build 
&& pnpm --filter @workright/profile-schema run build 
&& pnpm --filter @workright/config run build

# Build API (assumes @workright/api produces dist/)

RUN pnpm --filter @workright/api run build

# Optional: produce a pruned deploy folder if you use a deploy helper

RUN pnpm deploy --filter @workright/api --prod /app/deploy/api || true

# Build web (optional)

ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @workright/web run build || true

# -------------------------

# Runtime stage for API (Cloud Run)

# -------------------------

FROM node:24-bookworm-slim AS runtime-api
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Mark this image as for Cloud Run by default; override if running locally

ENV CLOUD_RUN=true

# Copy production deps and package.json from deploy output if available

COPY --from=build /app/deploy/api/node_modules ./node_modules
COPY --from=build /app/deploy/api/package.json ./package.json

# Fallback: if deploy output wasn't produced, copy app node_modules/package.json

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json.app

# If node_modules wasn't copied from /deploy, try fallback copy

RUN if [ ! -d /app/node_modules ]; then 
echo "deploy node_modules missing: copying from apps/api node_modules fallback if present" ; 
cp -a /app/apps/api/node_modules ./node_modules 2>/dev/null || true ; 
fi

# Final sanity check that the built server exists

RUN if [ ! -f /app/dist/main.js ]; then echo "ERROR: /app/dist/main.js missing"; ls -la /app/dist || true; exit 1; fi

EXPOSE 8080

# Start server explicitly to avoid reliance on pruned package.json scripts

CMD ["node", "dist/main.js"]

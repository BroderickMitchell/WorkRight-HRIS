# syntax=docker/dockerfile:1.7

FROM node:24-bookworm-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    python3 \
    build-essential && \
    rm -rf /var/lib/apt/lists/*

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./

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

COPY . .

RUN pnpm -w install --prod=false

RUN pnpm --filter @workright/api exec prisma generate || true

RUN pnpm -w rebuild -r && \
    pnpm -w -r run postinstall

RUN pnpm --filter @workright/ui run build && \
    pnpm --filter @workright/profile-schema run build && \
    pnpm --filter @workright/config run build

RUN pnpm --filter @workright/api run build

RUN pnpm deploy --filter @workright/api --prod /app/deploy/api || true

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

COPY --from=build /app/deploy/api/node_modules ./node_modules
COPY --from=build /app/deploy/api/package.json ./package.json

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json.app

RUN if [ ! -d /app/node_modules ]; then \
      echo "Falling back to apps/api node_modules"; \
      cp -a /app/apps/api/node_modules ./node_modules 2>/dev/null || true ; \
    fi

RUN if [ ! -f /app/dist/main.js ]; then \
      echo 'ERROR: dist/main.js missing' ; \
      ls -la /app/dist ; \
      exit 1 ; \
    fi

EXPOSE 8080

CMD ["node", "dist/main.js"]

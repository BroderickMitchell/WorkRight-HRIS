# syntax=docker/dockerfile:1

FROM node:20-bullseye-slim AS base

WORKDIR /app

ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    build-essential \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

FROM base AS deps

COPY package.json pnpm-workspace.yaml ./
COPY pnpm-lock.yaml* ./
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install \
        --filter @workright/web... \
        --filter @workright/config... \
        --filter @workright/profile-schema... \
        --filter @workright/ui... \
        --frozen-lockfile \
        --include-dev-deps \
        --include-workspace-root \
        --workspace-root; \
    else \
      pnpm install \
        --filter @workright/web... \
        --filter @workright/config... \
        --filter @workright/profile-schema... \
        --filter @workright/ui... \
        --include-dev-deps \
        --include-workspace-root \
        --no-frozen-lockfile \
        --workspace-root; \
    fi

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY . .

RUN pnpm --filter @workright/profile-schema run build \
  && pnpm --filter @workright/config run build \
  && pnpm --filter @workright/ui run build \
  && pnpm --filter @workright/web run build

FROM node:20-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN corepack enable

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

EXPOSE 3000

CMD ["pnpm", "--filter", "@workright/web", "start"]

# syntax=docker/dockerfile:1

FROM node:24.11.0-bullseye-slim AS base

WORKDIR /app

ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

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
COPY scripts/bootstrap-env.mjs scripts/

RUN set -eux; \
    INSTALL_FLAGS="--filter @workright/web... --filter @workright/config... --filter @workright/profile-schema... --filter @workright/ui... --workspace-root"; \
    if [ -f pnpm-lock.yaml ]; then \
      pnpm install ${INSTALL_FLAGS} --frozen-lockfile --prod=false; \
    else \
      pnpm install ${INSTALL_FLAGS} --no-frozen-lockfile --prod=false; \
    fi

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY . .

FROM base AS runner
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

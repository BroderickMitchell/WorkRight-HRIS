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
    openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/
COPY apps/api/tsconfig.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

RUN set -eux; \
  INSTALL_FLAGS="--filter @workright/api... --filter @workright/profile-schema... --filter @workright/config... --filter @workright/ui... --prod=false --include-workspace-root --workspace-root"; \
  if [ -f pnpm-lock.yaml ]; then \
    pnpm install $INSTALL_FLAGS --frozen-lockfile; \
  else \
    pnpm install $INSTALL_FLAGS --no-frozen-lockfile; \
  fi

COPY . .

RUN pnpm --filter @workright/profile-schema run build \
  && pnpm --filter @workright/config run build \
  && pnpm --filter @workright/api run prisma:generate \
  && pnpm --filter @workright/api run build \
  && pnpm prune --prod --filter @workright/api...

FROM node:20-bullseye-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN corepack enable

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/apps/api ./apps/api
COPY --from=base /app/packages ./packages
COPY --from=base /app/tsconfig.base.json ./tsconfig.base.json
COPY package.json pnpm-workspace.yaml ./

EXPOSE 3001

CMD ["node", "apps/api/dist/main.js"]

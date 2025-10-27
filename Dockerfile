# --- base ---
FROM node:20-bullseye-slim AS base
WORKDIR /app

ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential openssl \
  && rm -rf /var/lib/apt/lists/*

# Copy root manifests first for better caching
COPY pnpm-workspace.yaml package.json ./
COPY pnpm-lock.yaml* ./

# Copy package manifests (no sources yet) to warm the install layer
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

# Install ALL deps (incl. dev) across the workspace
RUN pnpm install --frozen-lockfile

# Now copy sources
COPY . .

# Build packages (dev deps available here)
RUN pnpm --filter @workright/profile-schema run build \
  && pnpm --filter @workright/config run build \
  && pnpm --filter @workright/api run prisma:generate \
  && pnpm --filter @workright/api run build

# --- runtime image (only prod deps for the API) ---
FROM node:20-bullseye-slim AS runtime

# ---------- build ----------
FROM base AS build
WORKDIR /app

ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

COPY --from=base /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml* ./
COPY --from=base /app/apps/api/package.json apps/api/

# Install prod deps only for API
RUN pnpm --filter @workright/api... install --prod --frozen-lockfile

# Bring over built artifacts
COPY --from=base /app/apps/api/dist apps/api/dist
COPY --from=base /app/apps/api/prisma apps/api/prisma

ENV NODE_ENV=production

EXPOSE 3000
CMD ["node", "apps/api/dist/main.js"]

CMD ["node", "apps/api/dist/index.js"]

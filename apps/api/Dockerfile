# ---- Base ----
FROM node:24-bookworm-slim AS base
WORKDIR /app

ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates openssl python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

# ---- Deps ----
FROM base AS deps
# If you later add pnpm-lock.yaml, copy it and switch to --frozen-lockfile
COPY package.json ./
RUN pnpm install

# ---- Prisma client ----
FROM deps AS prisma
COPY prisma ./prisma
# Use the prisma CLI already installed from pnpm, not npx
RUN pnpm prisma generate

# ---- Build ----
FROM deps AS build
# Bring generated client + any prisma engines along
COPY --from=prisma /app/node_modules /app/node_modules
COPY --from=prisma /app/prisma /app/prisma

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# ---- Runtime ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
# If your app needs schema at runtime, also copy /app/prisma

USER node
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist/main.js"]

# ---- Base image ----
FROM node:24-bookworm-slim AS base
WORKDIR /app

# Use pnpm via Corepack
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# System deps needed by some Node modules and Prisma engines
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates openssl python3 build-essential \
 && rm -rf /var/lib/apt/lists/*

# ---- Dependencies (install) ----
FROM base AS deps

# If you later add a lockfile, uncomment the next line and add it to your repo:
# COPY pnpm-lock.yaml ./
COPY package.json ./

# Install dependencies
# If you do add pnpm-lock.yaml later, switch to: pnpm install --frozen-lockfile
RUN pnpm install

# ---- Generate Prisma client ----
FROM deps AS prisma
# Copy only what's needed to generate the client
COPY prisma ./prisma
RUN pnpm prisma generate

# ---- Build application ----
FROM deps AS build
# Bring in generated Prisma client from the previous stage
COPY --from=prisma /app/node_modules /app/node_modules
COPY --from=prisma /app/prisma /app/prisma

# Copy source and tsconfig etc.
COPY tsconfig.json ./
COPY src ./src

# Build (expects a script "build" that produces ./dist)
RUN pnpm build

# ---- Runtime image ----
FROM node:24-bookworm-slim AS runtime
WORKDIR /app

# Minimal runtime deps
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/*

# Copy node modules (with Prisma engines + generated client) and built code
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# If your app reads from prisma at runtime (rare), include it:
# COPY --from=build /app/prisma /app/prisma

# Non-root for safety
USER node

# Cloud Run will set $PORT; default to 8080 if not provided
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["node", "dist/main.js"]

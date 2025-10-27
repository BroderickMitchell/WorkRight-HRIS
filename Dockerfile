# Base stage for building the application
FROM node:20-bullseye-slim AS base

WORKDIR /app

# Set environment variables
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

# Install dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    build-essential \
    openssl \
  && rm -rf /var/lib/apt/lists/* \
  && corepack enable

# Copy necessary files for dependency installation
COPY package.json pnpm-workspace.yaml tsconfig.base.json ./
COPY pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/
COPY apps/api/tsconfig.json apps/api/
COPY apps/web/package.json apps/web/
COPY apps/web/tsconfig.json apps/web/
COPY packages/config/package.json packages/config/
COPY packages/profile-schema/package.json packages/profile-schema/
COPY packages/ui/package.json packages/ui/

# Install all workspace dependencies with pnpm
RUN pnpm install --recursive \
                 --workspace-root \
                 --prod=false \
                 --no-frozen-lockfile

# Debug tsup installation
RUN pnpm list tsup

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm --filter @workright/profile-schema run build \
  && pnpm --filter @workright/config run build \
  && pnpm --filter @workright/api run prisma:generate \
  && pnpm --filter @workright/api run build \
  && pnpm prune --prod --filter @workright/api...

# Final stage for running the application
FROM node:20-bullseye-slim AS runner

WORKDIR /app

# Copy production dependencies and built files from the base stage
COPY --from=base /app /app

# Set environment variables for production
ENV NODE_ENV=production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "apps/api/dist/index.js"]

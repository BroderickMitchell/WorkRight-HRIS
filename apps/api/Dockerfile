# Use official Node base image
FROM node:24-bookworm-slim AS base

# Set working directory
WORKDIR /app

# Enable corepack and PNPM
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Install build dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates python3 build-essential \
  && rm -rf /var/lib/apt/lists/*

# Copy dependency files from the API app
COPY apps/api/pnpm-lock.yaml ./pnpm-lock.yaml
COPY apps/api/package.json ./package.json

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the API app
COPY apps/api ./

# Build the app (if TypeScript)
RUN pnpm build

# --- Production stage ---
FROM node:24-bookworm-slim AS production

WORKDIR /app
ENV NODE_ENV=production

# Enable PNPM again
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

# Copy built app and dependencies from previous stage
COPY --from=base /app /app

# Expose the API port
EXPOSE 8080

# Start the app
CMD ["pnpm", "start"]

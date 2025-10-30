FROM node:20-alpine AS base
ENV PNPM_HOME=/usr/local/share/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@8.15.5 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile --ignore-scripts || pnpm install --ignore-scripts
RUN pnpm run prisma:generate

FROM deps AS builder
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=development
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./package.json
CMD ["node", "dist/main.js"]

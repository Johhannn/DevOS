# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app
RUN npm install -g pnpm

# Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy workspace packages and apps
COPY packages ./packages
COPY apps/api ./apps/api

# Install dependencies and build
RUN pnpm install --frozen-lockfile
RUN pnpm --filter api build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy necessary artifacts
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules

EXPOSE 3001
CMD ["node", "dist/main"]

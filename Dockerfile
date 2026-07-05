# Base image with Node.js
FROM node:24-alpine AS base

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile --prod --store-dir=/pnpm/store

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Declare build arguments for Next.js public variables
ARG NEXT_PUBLIC_VAPID_PUBLIC_KEY
ARG BETTER_AUTH_URL

# Set environment variables from build args
ENV NEXT_PUBLIC_VAPID_PUBLIC_KEY=$NEXT_PUBLIC_VAPID_PUBLIC_KEY
ENV BETTER_AUTH_URL=$BETTER_AUTH_URL

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install ALL dependencies (skip postinstall to avoid prisma generate before schema exists)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    corepack enable && corepack prepare pnpm@latest --activate && \
    pnpm install --frozen-lockfile --ignore-scripts --store-dir=/pnpm/store

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build Next.js application
RUN pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy necessary files from builder with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
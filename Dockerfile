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

# No build args on purpose — nothing environment-specific is baked in, so one
# published image serves every environment (production, a future test app, a
# preview) and each supplies its own values through Coolify at runtime.
#
# NEXT_PUBLIC_VAPID_PUBLIC_KEY in particular: Next.js only substitutes a
# NEXT_PUBLIC_* variable into the bundle when it is present in the environment
# at build time. Leaving it unset keeps
# `process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY` in the compiled server output as a
# real runtime lookup. That is safe because the value is read server-side only
# (src/lib/web-push.ts) — the browser fetches the key from
# GET /api/notifications/subscribe (see src/hooks/use-push-notifications.ts)
# rather than reading an inlined copy. If client code ever reads a
# NEXT_PUBLIC_* value directly it would be undefined in the browser, and baking
# it back in would re-tie the image to one environment.
#
# BETTER_AUTH_URL is read at runtime by better-auth and was never needed here:
# it was set on the builder stage only, which the runner stage does not inherit.

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
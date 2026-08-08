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

# No build args on purpose: Next.js only inlines NEXT_PUBLIC_* vars that exist
# at build time, so leaving them unset keeps one image usable in every environment.

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

# Prisma CLI for `migrate deploy`. npm, not pnpm: pnpm's symlink farm does not
# survive a COPY between stages. `npm init -y` keeps it to just these packages.
FROM base AS migrator
WORKDIR /src
COPY package.json ./
WORKDIR /migrator
# @prisma/studio-core pulls in a UI stack (effect, @electric-sql, react-dom,
# elkjs) that `migrate deploy` never loads — ~95MB. Stub it via an npm override;
# --install-links copies rather than symlinks so it survives the COPY below.
RUN npm init -y > /dev/null && \
    mkdir -p stub && \
    printf '{"name":"@prisma/studio-core","version":"0.0.0","main":"index.js","exports":{".":"./index.js","./*":"./index.js"}}' > stub/package.json && \
    printf 'module.exports=new Proxy({},{get:()=>undefined});' > stub/index.js && \
    npm pkg set overrides.@prisma/studio-core=file:./stub && \
    npm install --no-audit --no-fund --install-links \
      "prisma@$(node -p "require('/src/package.json').devDependencies.prisma")" \
      "dotenv@$(node -p "require('/src/package.json').dependencies.dotenv")"

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

# Migration tooling, so the migration service can run this same image. At the
# root, not /app/node_modules, which has symlinks a directory COPY cannot cross.
COPY --from=migrator --chown=nextjs:nodejs /migrator/node_modules /node_modules
COPY --chown=nextjs:nodejs prisma ./prisma
COPY --chown=nextjs:nodejs prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
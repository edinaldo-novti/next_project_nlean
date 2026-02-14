# ==============================================================================
# NoguiERP Frontend - Production Dockerfile
# ==============================================================================
# Multi-stage build for Next.js 16 application
# ==============================================================================

# Stage 1: Dependencies
FROM node:25-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN yarn --check-files

# Stage 2: Builder
FROM node:25-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps ./app/node_modules ./node_modules
COPY . .


# Build the application

RUN yarn build

# Stage 3: Runner
FROM node:25-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files and install production dependencies only
COPY package.json yarn.lock ./
RUN yarn install --production --ignore-scripts

# Copy built application
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next

# Fix permissions for node_modules (nextjs user needs read access)
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Start the application
CMD ["yarn", "start"]

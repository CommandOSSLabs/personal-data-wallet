# syntax=docker/dockerfile:1

# PDW Chat Demo Backend Dockerfile
# This version works from the backend directory context

FROM node:20 AS builder

WORKDIR /app

# Install Python and build tools for native dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies (this will use the published npm package)
RUN npm ci --include=dev

# Copy source code
COPY src ./src
COPY tsconfig.json ./tsconfig.json

# Build the application
RUN npm run build

# Remove dev dependencies
RUN npm prune --omit=dev

FROM node:20-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

# Create necessary directories
RUN mkdir -p /app/storage/consents && \
    chmod -R 755 /app/storage

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy source migrations (needed for runtime)
COPY --from=builder /app/src/db/migrations ./src/db/migrations

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create non-root user
RUN groupadd -r pdwuser && useradd -r -g pdwuser pdwuser && \
    chown -R pdwuser:pdwuser /app/storage

# Switch to non-root user
USER pdwuser

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]

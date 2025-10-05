# syntax=docker/dockerfile:1

# Force cache bust: 2025-01-06-v6-BUILD-TOOLS
ARG CACHE_BUST=2025-01-06-v6-BUILD-TOOLS

FROM node:20 AS builder

WORKDIR /app

# Install Python and build tools required for native dependencies (hnswlib-node)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy only the SDK workspace so local file dependencies resolve correctly
COPY packages/pdw-sdk ./packages/pdw-sdk

# Build the SDK first (required for file: dependency)
WORKDIR /app/packages/pdw-sdk
RUN npm ci
RUN npm run build

# Now build the backend
WORKDIR /app/packages/pdw-sdk/examples/pdw-chat-demo/backend
RUN npm ci
RUN npm run build
RUN npm prune --omit=dev

FROM node:20-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

# Copy the entire packages directory to maintain file: dependency structure
COPY --from=builder /app/packages ./packages

WORKDIR /app/packages/pdw-sdk/examples/pdw-chat-demo/backend

# Copy migrations from builder
COPY --from=builder /app/packages/pdw-sdk/examples/pdw-chat-demo/backend/src/db/migrations ./src/db/migrations

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]

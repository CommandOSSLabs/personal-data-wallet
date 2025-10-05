# syntax=docker/dockerfile:1

# Force cache bust on Railway: 2025-01-06-v4-clean-build
ARG CACHE_BUST=2025-01-06-v4-clean-build

FROM node:20-slim AS builder

WORKDIR /app

# Copy only the SDK workspace so local file dependencies resolve correctly
COPY packages/pdw-sdk ./packages/pdw-sdk

# Build the SDK first
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

# Copy migrations from builder (not build context)
COPY --from=builder /app/packages/pdw-sdk/examples/pdw-chat-demo/backend/src/db/migrations ./src/db/migrations

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 4000

CMD ["./docker-entrypoint.sh"]

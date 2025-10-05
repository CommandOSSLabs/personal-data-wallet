# syntax=docker/dockerfile:1

FROM node:20-slim AS builder

WORKDIR /app

# Copy frontend package files
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/ ./

# Build Next.js app
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

# syntax=docker/dockerfile:1

# PDW Chat Demo Full-Stack Deployment
# This Dockerfile builds both frontend and backend from the project root

# Backend Builder Stage
FROM node:20 AS backend-builder

WORKDIR /app

# Install Python and build tools for native dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy backend package files
COPY packages/pdw-sdk/examples/pdw-chat-demo/backend/package*.json ./backend/
COPY packages/pdw-sdk/examples/pdw-chat-demo/backend/tsconfig.json ./backend/

# Install backend dependencies (uses published npm package)
WORKDIR /app/backend
RUN npm ci --include=dev

# Copy backend source code
COPY packages/pdw-sdk/examples/pdw-chat-demo/backend/src ./src

# Build the backend application
RUN npm run build

# Remove dev dependencies for backend
RUN npm prune --omit=dev

# Frontend Builder Stage
FROM node:20 AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/package*.json ./frontend/
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/next.config.js ./frontend/
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/tsconfig.json ./frontend/
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/next-env.d.ts ./frontend/

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm ci

# Copy frontend source code
COPY packages/pdw-sdk/examples/pdw-chat-demo/frontend/app ./app

# Build the frontend application
RUN npm run build

# Final Runtime Stage
FROM node:20-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

# Install nginx for serving frontend and proxying to backend
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /app/storage/consents && \
    mkdir -p /var/log/supervisor && \
    chmod -R 755 /app/storage

# Copy built backend from backend-builder stage
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Copy backend migrations and entrypoint script
COPY --from=backend-builder /app/backend/src/db/migrations ./backend/src/db/migrations
COPY packages/pdw-sdk/examples/pdw-chat-demo/backend/docker-entrypoint.sh ./backend/docker-entrypoint.sh
RUN chmod +x ./backend/docker-entrypoint.sh

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/next.config.js

# Create nginx configuration
RUN cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 3000;
    server_name _;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:4000/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Create supervisor configuration
RUN cat > /etc/supervisor/conf.d/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root
logfile=/var/log/supervisor/supervisord.log
pidfile=/var/run/supervisord.pid

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/nginx.err.log
stdout_logfile=/var/log/supervisor/nginx.out.log

[program:backend]
command=/app/backend/docker-entrypoint.sh
directory=/app/backend
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/backend.err.log
stdout_logfile=/var/log/supervisor/backend.out.log
environment=NODE_ENV=production

[program:frontend]
command=npm start
directory=/app/frontend
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/frontend.err.log
stdout_logfile=/var/log/supervisor/frontend.out.log
environment=NODE_ENV=production,PORT=3001
EOF

# Create startup script
RUN cat > /app/start.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting PDW Chat Demo Full-Stack Application"
echo "Frontend will be available on port 3000"
echo "Backend API will be available on port 3000/api"

# Start supervisor to manage all services
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
EOF

RUN chmod +x /app/start.sh

# Create non-root user and set permissions
RUN groupadd -r pdwuser && useradd -r -g pdwuser pdwuser && \
    chown -R pdwuser:pdwuser /app/storage && \
    chown -R pdwuser:pdwuser /var/log/supervisor

EXPOSE 3000

CMD ["/app/start.sh"]
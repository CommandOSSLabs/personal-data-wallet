FROM node:18-alpine

WORKDIR /app

<<<<<<< HEAD
# Install build dependencies
RUN apk add --no-cache python3 make g++ gcc
=======
# Install build dependencies and curl for health checks
RUN apk add --no-cache \
    curl \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python
>>>>>>> a6df16e (fix docker file)

# Copy package.json and install dependencies
COPY package*.json ./
<<<<<<< HEAD
RUN npm install
=======

# Install all dependencies (including dev dependencies for build)
RUN npm ci
>>>>>>> a6df16e (fix docker file)

# Copy source code
COPY . .

# Build the application
RUN npm run build

<<<<<<< HEAD
=======
# Remove dev dependencies and clean up build dependencies
RUN npm prune --production && apk del python3 make g++

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

>>>>>>> a6df16e (fix docker file)
# Expose port
EXPOSE 3000

<<<<<<< HEAD
# Start the server
CMD ["npm", "run", "start:prod"]
=======
# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start the application
CMD ["node", "dist/main"]
>>>>>>> a6df16e (fix docker file)

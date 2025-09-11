FROM node:20-alpine

WORKDIR /backend 

# Install minimal build dependencies for hnswlib-node native compilation
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production && npm ci --only=development

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 8000

# Start the server
CMD ["node", "dist/main.js"]
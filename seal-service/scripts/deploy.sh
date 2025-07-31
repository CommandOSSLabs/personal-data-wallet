#!/bin/bash

# Seal Service Deployment Script
# This script builds and deploys the Seal encryption service

set -e

echo "🔒 Deploying Seal Encryption Service"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must run from seal-service directory"
    exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
node_version=$(node --version)
echo "Node.js version: $node_version"

if ! node -e "process.exit(process.version.slice(1).split('.')[0] >= 18 ? 0 : 1)"; then
    echo "❌ Error: Node.js 18+ required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build TypeScript
echo "🔨 Building TypeScript..."
npm run build

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "📋 Creating .env from example..."
    cp .env.example .env
    echo "✅ Please edit .env with your configuration"
fi

# Validate configuration
echo "🔍 Validating configuration..."
if ! grep -q "SEAL_KEY_SERVER_1=0x" .env 2>/dev/null; then
    echo "⚠️  Warning: SEAL_KEY_SERVER_1 not configured"
    echo "   Please update .env with real key server object IDs"
fi

# Test build
echo "🧪 Testing build..."
if [ ! -f "dist/seal-server.js" ]; then
    echo "❌ Error: Build failed - dist/seal-server.js not found"
    exit 1
fi

echo "✅ Build successful"

# Production deployment
if [ "$1" = "production" ]; then
    echo "🚀 Production deployment"
    
    # Set production environment
    export NODE_ENV=production
    
    # Install PM2 if not already installed
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installing PM2..."
        npm install -g pm2
    fi
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'seal-service',
    script: 'dist/seal-server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    log_file: 'logs/seal-service.log',
    error_file: 'logs/seal-service-error.log',
    out_file: 'logs/seal-service-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
EOF
    
    # Create logs directory
    mkdir -p logs
    
    # Start with PM2
    echo "🔄 Starting service with PM2..."
    pm2 start ecosystem.config.js
    pm2 save
    
    echo "✅ Production deployment completed"
    echo "📊 Use 'pm2 status' to check service status"
    echo "📋 Use 'pm2 logs seal-service' to view logs"
    
else
    echo "🧪 Development deployment"
    echo "✅ Ready for development"
    echo "🚀 Run 'npm run dev' to start development server"
    echo "🚀 Run 'npm start' to start production server"
fi

# Health check
echo "🔍 Performing health check..."
echo "   Waiting for service to start..."

# If production, check PM2 service
if [ "$1" = "production" ]; then
    sleep 5
    if pm2 list | grep -q "seal-service.*online"; then
        echo "✅ Service is running"
        
        # Test HTTP endpoint
        if curl -f -s http://localhost:8080/health > /dev/null; then
            echo "✅ Health check passed"
        else
            echo "❌ Health check failed"
            echo "📋 Check logs: pm2 logs seal-service"
        fi
    else
        echo "❌ Service failed to start"
        pm2 logs seal-service --lines 10
    fi
else
    echo "📋 Health check will be performed when service starts"
fi

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "1. Update .env with your Seal key server configuration"
echo "2. Set use_real_seal=True in Python backend configuration"
echo "3. Start the service and test the integration"
echo ""
echo "For help, see README.md or run with --help"
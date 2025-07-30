#!/bin/bash

# Setup script for Personal Data Wallet
# This script automates the initial setup process

set -e

echo "🚀 Setting up Personal Data Wallet"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BLUE}🔄 $1${NC}"
}

# Check prerequisites
echo "1. Checking prerequisites..."

# Check Node.js
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    log_info "Node.js found: $NODE_VERSION"
else
    log_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command -v npm > /dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    log_info "npm found: $NPM_VERSION"
else
    log_error "npm not found. Please install npm"
    exit 1
fi

# Check Python
if command -v python3 > /dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    log_info "Python found: $PYTHON_VERSION"
else
    log_error "Python3 not found. Please install Python 3.11+"
    exit 1
fi

# Check Docker (optional)
if command -v docker > /dev/null 2>&1; then
    DOCKER_VERSION=$(docker --version)
    log_info "Docker found: $DOCKER_VERSION"
    DOCKER_AVAILABLE=true
else
    log_warn "Docker not found. You can still run the project locally."
    DOCKER_AVAILABLE=false
fi

# Check Docker Compose (optional)
if command -v docker-compose > /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker-compose --version)
    log_info "Docker Compose found: $COMPOSE_VERSION"
    COMPOSE_AVAILABLE=true
else
    log_warn "Docker Compose not found. You can still run the project locally."
    COMPOSE_AVAILABLE=false
fi

# Install frontend dependencies
echo -e "\n2. Installing frontend dependencies..."
log_step "Running npm install..."
npm install
log_info "Frontend dependencies installed"

# Setup Python virtual environment
echo -e "\n3. Setting up Python environment..."
if [ ! -d "venv" ]; then
    log_step "Creating Python virtual environment..."
    python3 -m venv venv
    log_info "Virtual environment created"
else
    log_info "Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
log_step "Installing Python dependencies..."
source venv/bin/activate
cd backend
pip3 install -r requirements.txt
cd ..
log_info "Python dependencies installed"

# Setup environment configuration
echo -e "\n4. Setting up environment configuration..."
if [ ! -f "backend/.env" ]; then
    log_step "Creating .env file from template..."
    cp backend/.env.example backend/.env
    log_info ".env file created"
    log_warn "Please edit backend/.env with your configuration"
else
    log_info ".env file already exists"
fi

# Create data directory
echo -e "\n5. Creating data directories..."
mkdir -p backend/data
log_info "Data directories created"

# Setup Redis (if available)
echo -e "\n6. Checking Redis availability..."
if command -v redis-server > /dev/null 2>&1; then
    log_info "Redis is available locally"
    REDIS_AVAILABLE=true
elif [ "$DOCKER_AVAILABLE" = true ]; then
    log_info "Redis will be available via Docker"
    REDIS_AVAILABLE=true
else
    log_warn "Redis not found. Please install Redis or use Docker"
    REDIS_AVAILABLE=false
fi

# Display setup summary
echo -e "\n🎉 Setup completed!"
echo "==================="
echo ""
echo "Next steps:"
echo ""

if [ "$DOCKER_AVAILABLE" = true ] && [ "$COMPOSE_AVAILABLE" = true ]; then
    echo "Option 1: Run with Docker (Recommended)"
    echo "  docker-compose up -d"
    echo ""
fi

echo "Option 2: Run locally"
echo "  Terminal 1: cd backend && source ../venv/bin/activate && uvicorn main:app --reload"
echo "  Terminal 2: npm run dev"
if [ "$REDIS_AVAILABLE" = true ] && [ "$DOCKER_AVAILABLE" != true ]; then
    echo "  Terminal 3: redis-server"
fi
echo ""

echo "Configuration:"
echo "  - Edit backend/.env with your settings"
echo "  - Frontend will be available at: http://localhost:3000"
echo "  - Backend API will be available at: http://localhost:8000"
echo ""

echo "Testing:"
echo "  - Run ./scripts/test-system.sh to test the system"
echo ""

echo "Documentation:"
echo "  - See README.md for detailed documentation"
echo "  - See SETUP.md for step-by-step setup guide"
echo ""

# Offer to start services
if [ "$DOCKER_AVAILABLE" = true ] && [ "$COMPOSE_AVAILABLE" = true ]; then
    echo -n "Would you like to start the services with Docker now? (y/N): "
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        log_step "Starting services with Docker..."
        docker-compose up -d
        
        echo ""
        echo "Services starting up... Please wait a moment for them to be ready."
        echo "You can check the status with: docker-compose ps"
        echo "View logs with: docker-compose logs -f"
        echo ""
        echo "Once ready, open http://localhost:3000 in your browser!"
    fi
fi

deactivate 2>/dev/null || true  # Deactivate virtual environment if it was activated
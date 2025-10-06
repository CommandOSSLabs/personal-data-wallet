#!/bin/bash

# PDW Chat Demo Deployment Script
# This script helps deploy the PDW Chat Demo application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_info "Checking prerequisites..."

    local missing_commands=()

    if ! command_exists docker; then
        missing_commands+=("docker")
    fi

    if ! command_exists docker-compose; then
        missing_commands+=("docker-compose")
    fi

    if [ ${#missing_commands[@]} -gt 0 ]; then
        print_error "Missing required commands: ${missing_commands[*]}"
        print_error "Please install the missing commands and try again."
        exit 1
    fi

    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker and try again."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Setup environment files
setup_environment() {
    print_info "Setting up environment files..."

    # Backend environment
    if [ ! -f "backend/.env" ]; then
        print_info "Creating backend/.env from backend/.env.example"
        cp backend/.env.example backend/.env
        print_warning "Please edit backend/.env with your actual configuration values"
    else
        print_info "backend/.env already exists"
    fi

    # Frontend environment
    if [ ! -f "frontend/.env.local" ]; then
        print_info "Creating frontend/.env.local"
        cat > frontend/.env.local << EOF
# Frontend environment configuration
NEXT_PUBLIC_PDW_BACKEND_URL=http://localhost:4000
EOF
        print_success "Created frontend/.env.local"
    else
        print_info "frontend/.env.local already exists"
    fi

    # Docker compose environment
    if [ ! -f ".env" ]; then
        print_info "Creating .env for docker-compose"
        cat > .env << EOF
# Docker Compose Configuration
POSTGRES_PASSWORD=postgres_password_123
POSTGRES_DB=pdw_chat_demo
POSTGRES_USER=postgres

# Copy these from your backend/.env
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
PDW_PACKAGE_ID=0xa1b4bf8b2fe86b5de5aadc0e60690f0352081ec53e8754d40cc24a27a3e3a9bd
PDW_ACCESS_REGISTRY_ID=0x6d006a5a8d094cc8f92fa17ea48495ad5d5e4f775a4f5c063df1413c2ff2f2ca
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=text-embedding-004
WALRUS_UPLOAD_RELAY=https://upload-relay.testnet.walrus.space
SEAL_KEY_SERVER_IDS=0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75,0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8
SEAL_PACKAGE_ID=0xa1b4bf8b2fe86b5de5aadc0e60690f0352081ec53e8754d40cc24a27a3e3a9bd
SEAL_MODULE_NAME=seal_access_control
EOF
        print_warning "Please edit .env with your actual configuration values"
    else
        print_info ".env already exists"
    fi
}

# Deploy with Docker Compose
deploy_local() {
    print_info "Deploying locally with Docker Compose..."

    # Build and start services
    docker-compose down --volumes --remove-orphans
    docker-compose build --no-cache
    docker-compose up -d

    print_info "Waiting for services to be ready..."
    sleep 30

    # Check if services are healthy
    if curl -f http://localhost:4000/health >/dev/null 2>&1; then
        print_success "Backend is healthy and running at http://localhost:4000"
    else
        print_warning "Backend health check failed. Check logs with: docker-compose logs backend"
    fi

    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is running at http://localhost:3000"
    else
        print_warning "Frontend health check failed. Check logs with: docker-compose logs frontend"
    fi

    print_success "Local deployment completed!"
    print_info "Services:"
    print_info "  - Frontend: http://localhost:3000"
    print_info "  - Backend API: http://localhost:4000"
    print_info "  - Backend Health: http://localhost:4000/health"
    print_info "  - PostgreSQL: localhost:5432"
    print_info ""
    print_info "Useful commands:"
    print_info "  - View logs: docker-compose logs -f"
    print_info "  - Stop services: docker-compose down"
    print_info "  - Restart services: docker-compose restart"
}

# Deploy to Railway
deploy_railway() {
    print_info "Deploying to Railway..."

    if ! command_exists railway; then
        print_error "Railway CLI is not installed. Install it from: https://railway.app/cli"
        exit 1
    fi

    # Check if logged in to Railway
    if ! railway whoami >/dev/null 2>&1; then
        print_error "Please login to Railway first: railway login"
        exit 1
    fi

    print_info "Deploying backend to Railway..."
    cd backend
    railway up --environment production
    cd ..

    print_success "Railway deployment completed!"
    print_info "Check your deployment at: https://railway.app"
}

# Show usage
show_usage() {
    echo "PDW Chat Demo Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local     Deploy locally with Docker Compose"
    echo "  railway   Deploy to Railway platform"
    echo "  setup     Setup environment files only"
    echo "  health    Check health of local deployment"
    echo "  logs      Show logs of local deployment"
    echo "  stop      Stop local deployment"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup     # Setup environment files"
    echo "  $0 local     # Deploy locally"
    echo "  $0 railway   # Deploy to Railway"
    echo "  $0 health    # Check health"
}

# Check health of services
check_health() {
    print_info "Checking health of local services..."

    # Check backend
    if curl -f http://localhost:4000/health >/dev/null 2>&1; then
        print_success "Backend is healthy"
        curl -s http://localhost:4000/health | python -m json.tool 2>/dev/null || echo "Backend is running"
    else
        print_error "Backend is not responding"
    fi

    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_success "Frontend is healthy"
    else
        print_error "Frontend is not responding"
    fi

    # Check database
    if docker-compose exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
        print_success "Database is healthy"
    else
        print_error "Database is not responding"
    fi
}

# Show logs
show_logs() {
    print_info "Showing logs for all services..."
    docker-compose logs -f
}

# Stop services
stop_services() {
    print_info "Stopping all services..."
    docker-compose down
    print_success "All services stopped"
}

# Main execution
main() {
    case "${1:-help}" in
        "local")
            check_prerequisites
            setup_environment
            deploy_local
            ;;
        "railway")
            check_prerequisites
            setup_environment
            deploy_railway
            ;;
        "setup")
            setup_environment
            ;;
        "health")
            check_health
            ;;
        "logs")
            show_logs
            ;;
        "stop")
            stop_services
            ;;
        "help"|*)
            show_usage
            ;;
    esac
}

# Change to script directory
cd "$(dirname "$0")/.."

# Run main function
main "$@"
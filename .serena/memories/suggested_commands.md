# Suggested Commands for Development

## Frontend Commands
```bash
# Development
npm run dev              # Start Next.js development server (port 3000)
npm run build           # Build production bundle
npm run start           # Start production server
npm run lint            # Run ESLint for frontend

# Backend from root
npm run backend         # Start backend dev server from root directory
```

## Backend Commands
```bash
# Navigate to backend first
cd backend

# Development
npm run start:dev       # Start NestJS with hot reload (port 8000)
npm run start:debug     # Start with debugging
npm run start:prod      # Start production server

# Code Quality
npm run lint            # Run ESLint with auto-fix
npm run format          # Format code with Prettier
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Generate test coverage
npm run test:e2e       # Run end-to-end tests

# Build
npm run build          # Build NestJS application

# Database Migrations (TypeORM)
npm run migration:generate  # Generate migration from entities
npm run migration:create    # Create empty migration
npm run migration:run       # Run pending migrations
npm run migration:revert    # Revert last migration
npm run migration:show      # Show migration status
```

## Installation Commands
```bash
# Root directory
npm install             # Install frontend dependencies

# Backend
cd backend && npm install  # Install backend dependencies
```

## Docker Commands
```bash
docker-compose up -d postgres  # Start PostgreSQL container
docker-compose up              # Start all services
docker-compose down            # Stop all services
```

## Smart Contract Commands
```bash
cd smart-contract

# Deployment scripts
./deploy_devnet.sh      # Deploy to devnet
./deploy_testnet.sh     # Deploy to testnet

# Sui Move commands
sui move build          # Build Move package
sui move test          # Run Move tests
sui move publish       # Publish to blockchain
```

## Git Commands (Windows)
```bash
git status             # Check repository status
git add .              # Stage all changes
git commit -m "msg"    # Commit changes
git push              # Push to remote
git pull              # Pull from remote
```

## Utility Commands (Windows)
```bash
dir                   # List directory contents (or ls in Git Bash)
cd <path>            # Change directory
type <file>          # Display file contents (or cat in Git Bash)
findstr "pattern"    # Search for pattern (or grep in Git Bash)
mkdir <name>         # Create directory
rmdir /s <name>      # Remove directory with contents
del <file>           # Delete file

# PowerShell alternatives
Get-ChildItem        # List directory (alias: ls, dir)
Set-Location         # Change directory (alias: cd)
Get-Content          # Read file (alias: cat, type)
Select-String        # Search pattern (similar to grep)
```

## Common Development Workflow
```bash
# Start development environment
cd backend && npm run start:dev  # Terminal 1: Backend
npm run dev                      # Terminal 2: Frontend (from root)

# Before committing code
cd backend && npm run lint       # Lint backend
cd .. && npm run lint            # Lint frontend
cd backend && npm run format     # Format backend code
cd backend && npm run test       # Run backend tests
```
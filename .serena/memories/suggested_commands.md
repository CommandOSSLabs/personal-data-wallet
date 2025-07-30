# Suggested Commands

## Personal Data Wallet Commands

### Development
```bash
# Frontend development
npm run dev                    # Start Next.js dev server (port 3000)
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Backend development  
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000
npm run backend               # Shortcut for backend server

# Full stack with Docker
docker-compose up -d          # Start all services (recommended)
docker-compose down           # Stop all services
docker-compose logs -f backend # View backend logs
docker-compose ps             # Check service status
```

### Testing & Validation
```bash
# Health checks
curl http://localhost:8000/health        # Backend health
curl http://localhost:8000/memory/default-user/stats # Memory stats

# API testing
curl -X POST "http://localhost:8000/ingest" \
  -H "Content-Type: application/json" \
  -d '{"text": "My meeting is tomorrow at 2 PM", "user_id": "test"}'

curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \  
  -d '{"text": "When is my meeting?", "user_id": "test"}'
```

### Blockchain
```bash
# Sui contract deployment
cd sui-contract
sui client publish --gas-budget 20000000
sui move test                 # Run contract tests
```

## Serena Commands (ESSENTIAL - use exact commands)

### Core Development
```bash
uv run poe format            # Format code (BLACK + RUFF) - ONLY allowed formatting
uv run poe type-check        # Run mypy type checking - ONLY allowed type checking  
uv run poe test              # Run tests with default markers
uv run poe lint              # Check code style without fixing
```

### Testing with Markers
```bash
uv run poe test -m "python or go"     # Run specific language tests
uv run poe test -m snapshot           # Run symbolic editing tests
```

Available markers: `python`, `go`, `java`, `rust`, `typescript`, `php`, `csharp`, `elixir`, `terraform`, `clojure`, `snapshot`

### Project Management
```bash
uv run serena-mcp-server     # Start MCP server from project root
uv run index-project         # Index project for faster tool performance
```

## Windows-Specific Commands
```cmd
# Process management
tasklist | findstr "node"    # Find Node.js processes
tasklist | findstr "python"  # Find Python processes  
taskkill /F /PID <PID>       # Kill specific process

# Port checking
netstat -an | findstr :3000  # Check frontend port
netstat -an | findstr :8000  # Check backend port
netstat -an | findstr :6379  # Check Redis port
```

## Task Completion Workflow
**Always run these commands before completing any task:**
1. `uv run poe format` (for Serena code)
2. `uv run poe type-check` (for Serena code)  
3. `uv run poe test` (for Serena code)
4. `npm run lint` (for Personal Data Wallet frontend)
5. Test API endpoints manually
6. Verify Docker services are running
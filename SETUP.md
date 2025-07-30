# Step-by-Step Setup Guide

This guide will walk you through setting up the Personal Data Wallet from scratch.

## Prerequisites Check

Before starting, ensure you have:

```bash
# Check Node.js version (need 18+)
node --version

# Check npm version
npm --version

# Check Python version (need 3.11+)
python3 --version

# Check Docker version
docker --version
docker-compose --version
```

## Step 1: Project Setup

```bash
# Clone the repository
git clone https://github.com/CommandOSSLabs/personal-data-wallet.git
cd personal-data-wallet

# Install frontend dependencies
npm install

# Setup Python virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..
```

## Step 2: Environment Configuration

```bash
# Copy environment template
cp backend/.env.example backend/.env

# Edit the .env file
nano backend/.env  # or use your preferred editor
```

Required environment variables:
```env
OPENAI_API_KEY=sk-... # Optional, for advanced features
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
REDIS_URL=redis://localhost:6379
LOG_LEVEL=INFO
```

## Step 3: Start Services

### Option A: Docker (Recommended)

```bash
# Start all services with Docker
docker-compose up -d

# Check that all services are running
docker-compose ps

# Expected output:
# pdw-redis     redis:7-alpine    running   0.0.0.0:6379->6379/tcp
# pdw-backend   pdw_backend       running   0.0.0.0:8000->8000/tcp
# pdw-frontend  pdw_frontend      running   0.0.0.0:3000->3000/tcp
```

### Option B: Local Development

Terminal 1 - Start Redis:
```bash
redis-server
# If not installed: brew install redis (macOS) or apt install redis (Ubuntu)
```

Terminal 2 - Start Backend:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 3 - Start Frontend:
```bash
npm run dev
```

## Step 4: Verify Installation

1. **Check API Health:**
```bash
curl http://localhost:8000/health
# Expected: {"status":"healthy","version":"0.1.0"}
```

2. **Check Frontend:**
   - Open http://localhost:3000 in your browser
   - You should see the Personal Data Wallet chat interface

3. **Test Basic Functionality:**
   - Type: "My name is John and I work at OpenAI"
   - The system should respond that it stored the information
   - Type: "Where do I work?"
   - The system should respond with information about OpenAI

## Step 5: Optional - Deploy Sui Smart Contract

If you want to deploy the smart contract to Sui testnet:

```bash
# Install Sui CLI
curl -fsSL https://raw.githubusercontent.com/MystenLabs/sui/main/scripts/installer.sh | sh

# Configure Sui for testnet
sui client new-env --alias testnet --rpc https://fullnode.testnet.sui.io:443
sui client switch --env testnet

# Get testnet SUI tokens
sui client faucet

# Deploy the contract
cd sui-contract
sui client publish --gas-budget 20000000

# Note the package ID from the output for later use
```

## Step 6: Test End-to-End Flow

1. **Store Facts:**
```bash
curl -X POST "http://localhost:8000/ingest" \
  -H "Content-Type: application/json" \
  -d '{"text": "My flight to Tokyo is on Tuesday at 8 AM", "user_id": "test-user"}'
```

2. **Query Information:**
```bash
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"text": "When is my flight?", "user_id": "test-user"}'
```

3. **Check Memory Stats:**
```bash
curl http://localhost:8000/memory/test-user/stats
```

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check Python dependencies
cd backend
pip install -r requirements.txt

# Check Redis connection
redis-cli ping
# Should return: PONG
```

**Frontend build errors:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Docker issues:**
```bash
# Stop all containers and start fresh
docker-compose down
docker-compose up --build -d
```

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :3000  # Frontend
lsof -i :8000  # Backend
lsof -i :6379  # Redis

# Kill processes if needed
kill -9 <PID>
```

### Debug Commands

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Enter container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Check container resource usage
docker stats
```

## Development Workflow

1. **Make code changes**
2. **For backend changes:**
   ```bash
   docker-compose restart backend
   ```
3. **For frontend changes:**
   ```bash
   docker-compose restart frontend
   ```
4. **Test your changes**
5. **Commit and push**

## Next Steps

- Customize the chat interface
- Implement additional entity extractors
- Add more sophisticated classification
- Deploy to production
- Integrate with real Sui mainnet

For more details, see the main README.md file.
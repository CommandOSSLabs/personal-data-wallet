# Personal Data Wallet

A Decentralized, Self-Organizing Memory Layer for LLMs, inspired by the architecture of mem0. This system creates a user-owned knowledge graph where interactions are not just stored but understood, categorized, and structured, with ownership and data integrity managed by the Sui blockchain.

## Architecture Overview

The system consists of three primary components:

1. **Next.js Frontend**: A sophisticated chat interface with TanStack Query for robust server-state management
2. **Intelligent Backend (Python/FastAPI)**: Core logic plane that classifies input, extracts entities, builds knowledge graphs, creates vector embeddings, and orchestrates storage
3. **Sui & Walrus Backend**: Sui blockchain manages ownership and pointers, while Walrus stores immutable data blobs

## Features

- ✅ **Intent Classification**: Automatically classifies user input as facts, queries, or conversation
- ✅ **Knowledge Graph Extraction**: Builds structured relationships from natural language
- ✅ **Vector Embeddings**: Creates semantic embeddings for similarity search
- ✅ **Decentralized Storage**: Uses Sui blockchain for ownership and Walrus for data storage
- ✅ **Real-time Chat Interface**: Modern React-based chat with loading states and error handling
- ✅ **Memory Persistence**: Stores and retrieves user memories across sessions

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Docker and Docker Compose
- Sui CLI (for contract deployment)

### 1. Clone and Setup

```bash
git clone https://github.com/CommandOSSLabs/personal-data-wallet.git
cd personal-data-wallet

# Install frontend dependencies
npm install

# Setup backend
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
cd ..
```

### 2. Environment Configuration

Copy `backend/.env.example` to `backend/.env` and configure:

```env
OPENAI_API_KEY=your_openai_api_key_here
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
REDIS_URL=redis://localhost:6379
LOG_LEVEL=INFO
```

### 3. Run with Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check service health
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 4. Run Locally (Development)

Terminal 1 - Backend:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
npm run dev
```

Terminal 3 - Redis (if not using Docker):
```bash
redis-server
```

### 5. Deploy Sui Smart Contract

```bash
cd sui-contract

# Install Sui CLI if not already installed
curl -fsSL https://raw.githubusercontent.com/MystenLabs/sui/main/scripts/installer.sh | sh

# Deploy to testnet
sui client publish --gas-budget 20000000
```

## Usage

1. Open http://localhost:3000 in your browser
2. Start chatting! The system will:
   - **Facts**: Store information like "My flight to Tokyo is Tuesday at 8 AM"
   - **Queries**: Answer questions like "When is my flight?"
   - **Conversation**: Handle casual chat naturally

## API Endpoints

### Backend (http://localhost:8000)

- `POST /ingest` - Process and store user input
- `POST /query` - Query stored memories
- `GET /memory/{user_id}/stats` - Get memory statistics
- `GET /health` - Health check

### Example API Usage

```bash
# Store a fact
curl -X POST "http://localhost:8000/ingest" \
  -H "Content-Type: application/json" \
  -d '{"text": "My meeting with John is tomorrow at 2 PM", "user_id": "user123"}'

# Query memories
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"text": "When is my meeting?", "user_id": "user123"}'
```

## Project Structure

```
personal-data-wallet/
├── app/                          # Next.js frontend
│   ├── components/               # React components
│   ├── hooks/                    # TanStack Query hooks
│   ├── lib/                      # API client
│   └── types/                    # TypeScript types
├── backend/                      # Python FastAPI backend
│   ├── services/                 # Core business logic
│   │   ├── classifier.py         # Intent classification
│   │   ├── graph_extractor.py    # Knowledge graph extraction
│   │   ├── embeddings.py         # Vector embeddings
│   │   ├── vector_store.py       # HNSW vector search
│   │   ├── memory_manager.py     # Memory orchestration
│   │   ├── sui_client.py         # Sui blockchain client
│   │   └── walrus_client.py      # Walrus storage client
│   ├── models.py                 # Pydantic models
│   ├── config.py                 # Configuration
│   └── main.py                   # FastAPI application
├── sui-contract/                 # Sui Move smart contract
│   ├── sources/                  # Move source files
│   └── tests/                    # Move tests
└── docker-compose.yml            # Container orchestration
```

## Development

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests (when implemented)
cd backend
pytest

# Sui contract tests
cd sui-contract
sui move test
```

### Code Style

```bash
# Frontend linting
npm run lint

# Backend formatting (install black first: pip install black)
cd backend
black .
```

## Deployment

### Production Docker

```bash
# Build and deploy
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables

Production environment variables:

```env
NODE_ENV=production
NEXT_PUBLIC_BACKEND_URL=https://your-api-domain.com
SUI_NETWORK=mainnet
SUI_RPC_URL=https://fullnode.mainnet.sui.io:443
```

## Technical Details

### Intent Classification

The system uses keyword-based classification to determine:
- **FACT_ADDITION**: Statements containing factual information
- **QUERY**: Questions seeking information
- **CONVERSATIONAL**: General chat

### Knowledge Graph Extraction

Extracts entities and relationships using:
- Pattern matching for common relationship types
- Named entity recognition
- Proximity-based relationship inference

### Vector Storage

Uses HNSW (Hierarchical Navigable Small World) for efficient similarity search:
- 384-dimensional vectors from sentence-transformers
- Cosine similarity for semantic matching
- Persistent storage with metadata

### Blockchain Integration

- **Sui Smart Contract**: Manages ownership and data pointers
- **Walrus Storage**: Immutable blob storage for vector indexes and graphs
- **Event-driven**: Backend listens for blockchain events

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check Redis connection and Python dependencies
2. **Frontend API errors**: Verify backend URL in environment variables  
3. **Sui connection issues**: Ensure correct RPC URL and network configuration
4. **Docker issues**: Check port availability and Docker daemon status

### Debug Commands

```bash
# Check service logs
docker-compose logs backend
docker-compose logs frontend

# Check API health
curl http://localhost:8000/health

# Check memory stats
curl http://localhost:8000/memory/default-user/stats
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the API documentation

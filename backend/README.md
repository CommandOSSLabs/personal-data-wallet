# Personal Data Wallet Backend

This is the backend for the Personal Data Wallet application, built with NestJS. It provides API endpoints for chat functionality with streaming support and memory management.

## Features

- Streaming chat API with Server-Sent Events (SSE)
- Integration with Google Gemini AI models
- Memory management with vector search and knowledge graph
- Sui blockchain integration for on-chain data storage
- Walrus integration for blob storage
- IBE encryption for memory content

## Project Structure

```
backend/
├── src/
│   ├── chat/               # Chat module
│   │   ├── dto/            # Chat DTOs
│   │   ├── summarization/  # Summarization service
│   │   ├── chat.controller.ts
│   │   ├── chat.module.ts
│   │   └── chat.service.ts
│   ├── memory/             # Memory module
│   │   ├── dto/            # Memory DTOs
│   │   ├── classifier/     # Content classifier
│   │   ├── embedding/      # Embedding service
│   │   ├── graph/          # Knowledge graph
│   │   ├── hnsw-index/     # HNSW index
│   │   ├── memory-ingestion/ # Memory extraction
│   │   ├── memory-query/   # Memory query
│   │   ├── memory.controller.ts
│   │   └── memory.module.ts
│   ├── infrastructure/     # Infrastructure
│   │   ├── gemini/         # Google Gemini service
│   │   ├── seal/           # Seal encryption
│   │   ├── sui/            # Sui blockchain
│   │   ├── walrus/         # Walrus storage
│   │   └── infrastructure.module.ts
│   ├── app.controller.ts   # App controller
│   ├── app.module.ts       # App module
│   ├── app.service.ts      # App service
│   └── main.ts             # Application entry point
└── test/                   # Tests
```

## Getting Started

### Prerequisites

- Node.js 18+
- Sui blockchain account and private key
- Google Cloud API key for Gemini
- Walrus API key

### Environment Variables

Create a `.env` file in the root directory with:

```
SUI_NETWORK=devnet
SUI_PACKAGE_ID=<your_package_id>
SUI_ADMIN_PRIVATE_KEY=<your_private_key>
GOOGLE_API_KEY=<your_google_api_key>
WALRUS_API_KEY=<your_walrus_api_key>
WALRUS_API_URL=https://api.walrus.ai/v1
SEAL_MASTER_KEY=<your_seal_master_key>
```

### Installation

```bash
npm install
```

### Running the Application

```bash
# Development
npm run start

# Watch mode
npm run start:dev

# Production mode
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Test API endpoints
node test-endpoints.js
```

## API Endpoints

### Chat API

- `GET /api/chat/sessions` - Get all sessions for a user
- `GET /api/chat/sessions/:sessionId` - Get a specific session
- `POST /api/chat/sessions` - Create a new session
- `POST /api/chat/sessions/:sessionId/messages` - Add a message to a session
- `DELETE /api/chat/sessions/:sessionId` - Delete a session
- `PUT /api/chat/sessions/:sessionId/title` - Update session title
- `POST /api/chat/summary` - Save a summary for a session
- `SSE /api/chat/stream` - Stream chat (Server-Sent Events)
- `POST /api/chat` - Send a regular chat message

### Memory API

- `GET /api/memories` - Get all memories for a user
- `POST /api/memories` - Create a new memory
- `POST /api/memories/search` - Search memories
- `DELETE /api/memories/:memoryId` - Delete a memory
- `PUT /api/memories/:memoryId` - Update a memory
- `POST /api/memories/context` - Get memory context for chat
- `GET /api/memories/stats` - Get memory statistics

### Health Check

- `GET /api/health` - Get service health status

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## Frontend Integration

The frontend can consume the SSE streaming endpoint using the EventSource API:

```javascript
const eventSource = new EventSource('/api/chat/stream?content=Hello&userId=user123');

eventSource.onmessage = (event) => {
  const chunk = event.data;
  console.log('Received chunk:', chunk);
};

eventSource.onerror = () => {
  eventSource.close();
};
```
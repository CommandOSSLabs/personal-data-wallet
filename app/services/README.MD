# Personal Data Wallet

A decentralized chat application featuring streaming chat, on-chain session history, and an encrypted persistent memory layer using vector search and knowledge graphs, all secured by Sui blockchain.

## Architecture

This application consists of three primary components:

1. **NestJS Backend (Application)**: Orchestrates all business logic, including chat streaming, RAG, memory classification, and communication with external services.

2. **Walrus (Data Store)**: Used for off-chain bulk data storage:
   - Encrypted Content Blobs: Individual encrypted user memories
   - HNSW Index File: Vector search index
   - Knowledge Graph File: JSON connecting memory entities

3. **Sui Blockchain (Ledger)**: On-chain source of truth for ownership and data pointers, storing chat history and pointers to user's data on Walrus.

## Prerequisites

- Node.js v18+
- Sui CLI (for smart contract deployment)
- Docker and Docker Compose
- Google API Key for Gemini AI
- Walrus API Key

## Installation and Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/personal-data-wallet.git
cd personal-data-wallet
```

2. **Set up environment variables**

Create a `.env` file in the project root:

```
SUI_NETWORK=testnett
SUI_PACKAGE_ID=<your_deployed_package_id>
SUI_ADMIN_PRIVATE_KEY=<your_sui_private_key>
GOOGLE_API_KEY=<your_google_api_key>
WALRUS_API_KEY=<your_walrus_api_key>
WALRUS_API_URL=https://api.walrus.ai/v1
SEAL_MASTER_KEY=<your_seal_master_key>
```

3. **Deploy the Sui smart contracts**

```bash
cd smart-contract
sui client publish --gas-budget 100000000
```

After deployment, copy the package ID to your `.env` file.

4. **Start the application using Docker Compose**

```bash
docker-compose up -d
```

## API Endpoints

### Chat API

- `POST /api/chat/session` - Create a new chat session
  - Body: `{ "modelName": "gemini-1.5-pro", "userAddress": "0x..." }`

- `SSE /api/chat/message` - Stream a chat message (Server-Sent Events)
  - Body: `{ "content": "Hello", "modelName": "gemini-1.5-pro", "sessionId": "0x...", "userAddress": "0x..." }`

- `POST /api/chat/summary` - Save a summary for a chat session
  - Body: `{ "sessionId": "0x...", "summary": "Chat about weather", "userAddress": "0x..." }`

### Memory API

- `POST /api/memory` - Create a new memory
  - Body: `{ "content": "My favorite color is blue", "category": "preference", "userAddress": "0x..." }`

- `GET /api/memory/query` - Query relevant memories
  - Query params: `?query=favorite+color&userAddress=0x...&limit=5`

## Consuming the Chat Streaming Endpoint

Here's how a frontend client would consume the SSE streaming endpoint:

```javascript
// Example frontend code using EventSource API
function startChatStream() {
  const userMessage = "Tell me about climate change";
  const sessionId = "0x123..."; // From previous createSession call
  const userAddress = "0x456..."; // User's Sui address
  
  // Create the EventSource
  const eventSource = new EventSource(`/api/chat/message?content=${encodeURIComponent(userMessage)}&sessionId=${sessionId}&userAddress=${userAddress}&modelName=gemini-1.5-pro`);
  
  let fullResponse = '';
  
  // Handle incoming message chunks
  eventSource.onmessage = (event) => {
    const chunk = event.data;
    fullResponse += chunk;
    
    // Update UI with the chunk
    appendToChat(chunk);
  };
  
  // Handle completion
  eventSource.onerror = () => {
    // Stream is complete or errored
    eventSource.close();
    
    // Process the complete response if needed
    processCompleteResponse(fullResponse);
  };
}

function appendToChat(text) {
  const chatWindow = document.getElementById('chat-window');
  chatWindow.innerHTML += text;
}

function processCompleteResponse(text) {
  console.log('Full response received:', text);
  // Additional processing if needed
}
```

## Project Structure

```
├── backend-v2/              # NestJS Backend
│   ├── src/
│   │   ├── controllers/     # API Controllers
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── modules/         # NestJS Modules
│   │   ├── services/        # Service Layer
│   │   ├── app.module.ts    # Main App Module
│   │   └── main.ts          # Application Entry Point
│   ├── Dockerfile           # Backend Docker Configuration
│   └── package.json         # Backend Dependencies
├── smart-contract/          # Sui Move Package
│   ├── sources/
│   │   ├── chat_sessions.move  # Chat Session Contract
│   │   └── memory.move         # Memory Contract
│   └── Move.toml            # Move Package Config
└── docker-compose.yml       # Docker Compose Configuration
```

## Development

For local development:

1. **Run services individually**

```bash
# Backend
cd backend-v2
npm install
npm run start:dev

# Local Sui Node (in a separate terminal)
sui start
```

2. **Run tests**

```bash
# Backend tests
cd backend-v2
npm test
```

## License

This project is licensed under the MIT License.
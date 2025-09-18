# Personal Data Wallet

A decentralized personal data wallet that securely stores your memories on the blockchain while keeping chat sessions in a PostgreSQL database.

## Architecture Overview

The system uses a hybrid storage approach:

1. **On-chain Storage (Sui Blockchain + Walrus)**
   - HNSW Index for vector similarity search
   - Embedding vectors for memory retrieval
   - Memory content (encrypted)
   - Memory metadata and relationships

2. **Off-chain Storage (PostgreSQL)**
   - Chat sessions
   - Chat messages
   - User preferences
   - Application state

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker and Docker Compose (optional)
- Sui wallet with testnet funds

### Environment Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/personal-data-wallet.git
   cd personal-data-wallet
   ```

2. Install dependencies:
   ```
   npm install
   cd backend && npm install
   ```

3. Configure environment variables:
   ```
   cp backend/.env.example backend/.env
   ```
   Edit the `.env` file with your database credentials and Sui wallet information.

4. Set up PostgreSQL:
   ```
   # Create database
   createdb personal_data_wallet
   ```
   
   Or use Docker:
   ```
   docker-compose up -d postgres
   ```

5. Start the backend:
   ```
   cd backend
   npm run start:dev
   ```

6. Start the frontend:
   ```
   # In the project root
   npm run dev
   ```

## Database Schema

### Chat Sessions
- `id`: UUID (primary key)
- `title`: String
- `summary`: String (optional)
- `userAddress`: String
- `suiObjectId`: String (optional, for blockchain reference)
- `isArchived`: Boolean
- `metadata`: JSONB
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Chat Messages
- `id`: UUID (primary key)
- `role`: String (user/assistant)
- `content`: Text
- `sessionId`: UUID (foreign key)
- `memoryId`: String (optional, reference to blockchain memory)
- `walrusHash`: String (optional, reference to Walrus storage)
- `metadata`: JSONB
- `createdAt`: Timestamp

## On-chain Structure

### Memory Module
- Memory records
- Memory indices
- Vector storage
- Relationship graphs

## API Endpoints

### Memory API
- `POST /api/memories` - Create new memory
- `GET /api/memories?user={address}` - Get all memories for a user
- `GET /api/memories/{id}?user={address}` - Get a specific memory
- `POST /api/memories/search` - Search memories
- `POST /api/memories/{id}` - Update a memory
- `DELETE /api/memories/{id}` - Delete a memory
- `POST /api/memories/process` - Process a memory without creating it
- `POST /api/memories/save-approved` - Save an approved memory

### Chat API
- `POST /api/chat/sessions` - Create a new chat session
- `GET /api/chat/sessions?user={address}` - Get all sessions for a user
- `GET /api/chat/sessions/{id}` - Get a specific chat session
- `POST /api/chat/sessions/{id}/messages` - Add a message to a session
- `POST /api/chat/stream` - Stream chat responses
- `DELETE /api/chat/sessions/{id}` - Delete a chat session

## License

MIT
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Data Wallet is a hybrid Web3 application that combines blockchain storage (Sui/Walrus) for secure memory management with PostgreSQL for chat sessions. The architecture uses:
- **Frontend**: Next.js 14 with TypeScript, Mantine UI, TailwindCSS
- **Backend**: NestJS with TypeORM, PostgreSQL
- **Blockchain**: Sui blockchain with Walrus storage for decentralized memory persistence
- **AI Services**: Google Gemini for embeddings and chat
- **Encryption**: SEAL SDK for decentralized key management (SEAL branch)

## Branch Information

### Main Branch
- Standard implementation with AES-256-GCM encryption
- Application manages encryption keys directly using HKDF
- Simplified key derivation from user addresses
- Production-ready with demo mode support

### SEAL Branch
- **Identity-Based Encryption (IBE)**: SEAL uses IBE where identities can be any string/byte array
- **Decentralized Secrets Management**: Not a key management service, but a secrets management platform
- **Architecture Components**:
  - **Onchain Access Policies**: Sui Move smart contracts define access control logic via `seal_approve` functions
  - **Off-chain Key Servers**: Hold IBE master secret keys, validate access requests
- **Threshold Encryption**: Supports "t-out-of-n" threshold (e.g., 2-of-3, 3-of-5 key servers)
- **Two Service Modes**:
  - **Open Mode**: Any package can request keys, ideal for public/trial use
  - **Permissioned Mode**: Restricted to approved packages, for commercial/dedicated use
- **Session Keys**: Created per user/package, require wallet signature, have TTL (time-to-live)
- **Encryption Process**: 
  1. Client encrypts data with IBE using identity string
  2. Returns encrypted data + symmetric backup key
  3. Data stored on decentralized storage (e.g., Walrus)
- **Decryption Process**:
  1. User creates session key and signs with wallet
  2. Smart contract validates access via `seal_approve` function
  3. Key servers verify transaction and provide derived keys
  4. Client decrypts data using threshold of key server responses
- **Security**: Each package controls its own IBE identity namespace
- **Cryptography**: Uses Boneh-Franklin IBE with BLS12-381 curve + AES-256-GCM

## Common Development Commands

### Frontend (Next.js)
```bash
npm install          # Install dependencies
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run lint         # Run ESLint
```

### Backend (NestJS)
```bash
cd backend
npm install                    # Install dependencies
npm run start:dev             # Start development server with hot reload (port 8000)
npm run build                 # Build for production
npm run start:prod            # Start production server
npm run lint                  # Run ESLint
npm run test                  # Run unit tests
npm run test:e2e              # Run e2e tests
npm run test:cov              # Run tests with coverage
npm run test:seal-open-mode  # Test SEAL open mode functionality (SEAL branch)
```

### Database Migrations (TypeORM)
```bash
cd backend
npm run migration:generate -- -n MigrationName  # Generate migration from entities
npm run migration:create -- -n MigrationName    # Create empty migration
npm run migration:run                           # Run pending migrations
npm run migration:revert                        # Revert last migration
npm run migration:show                          # Show all migrations
```

### Smart Contract (Move/Sui)
```bash
cd smart-contract
sui move build                # Build Move contracts
sui move test                 # Run Move tests
./deploy_testnet.sh          # Deploy to testnet
./deploy_devnet.sh           # Deploy to devnet
```

### Docker
```bash
docker-compose up -d postgres  # Start PostgreSQL container
docker-compose up -d           # Start all services
docker-compose down            # Stop all services
```

## Architecture & Key Components

### Backend Module Structure
The backend follows NestJS modular architecture with clear separation of concerns:

- **`/infrastructure`**: External service integrations
  - `gemini/`: Google Gemini AI service for embeddings and chat
  - `seal/`: SEAL service for structured information extraction
  - `sui/`: Sui blockchain interaction service
  - `walrus/`: Walrus decentralized storage service

- **`/memory`**: Memory management system
  - `memory-ingestion/`: Process and store memories
  - `memory-query/`: Search and retrieve memories
  - `embedding/`: Vector embedding generation
  - `hnsw-index/`: HNSW vector index for similarity search
  - `graph/`: Memory relationship graph management
  - `classifier/`: Memory classification service

- **`/chat`**: Chat session management
  - `summarization/`: Chat summarization service
  - Manages PostgreSQL-stored chat sessions and messages

- **`/database`**: TypeORM configuration and entities
  - Chat sessions and messages stored in PostgreSQL
  - Migrations for schema management

- **`/storage`**: File and blob storage management

### Frontend Structure
- **`/app`**: Next.js 14 app directory structure
  - `api/`: API route handlers
  - `components/`: Reusable UI components
  - `hooks/`: Custom React hooks
  - `services/`: API client services
  - `providers/`: Context providers (Sui wallet, React Query)
  
### Blockchain Integration
- Smart contracts in `/smart-contract/sources/`
- On-chain structures: Memory records, HNSW indices, vector storage
- Off-chain PostgreSQL for chat sessions with optional blockchain references

## Environment Configuration

Backend requires `.env` file (see `backend/.env.example`):
- Database credentials (PostgreSQL)
- Sui wallet configuration
- API keys for external services
- Port configuration (default: 8000)

### SEAL Branch Specific Configuration
```bash
# SEAL Configuration
SEAL_NETWORK=testnet          # mainnet, testnet, or devnet
SEAL_PACKAGE_ID=              # Your access control package ID (optional, uses native SEAL if empty)
SEAL_MODULE_NAME=seal_access_control  # Module name containing seal_approve function
SEAL_THRESHOLD=2              # Threshold for key servers (e.g., 2-of-3)
SEAL_KEY_SERVER_IDS=          # Comma-separated key server object IDs (optional)
SEAL_OPEN_MODE=true           # true for open mode, false for permissioned
SEAL_SESSION_TTL_MIN=60       # Session key TTL in minutes
```

## API Structure

All API endpoints prefixed with `/api`:
- Memory endpoints: `/api/memories/*`
- Chat endpoints: `/api/chat/*`
- Storage endpoints: `/api/storage/*`

Backend uses:
- Global validation pipe for request validation
- CORS enabled for frontend integration
- NestJS dependency injection throughout

## Testing Strategy

- Unit tests: Located alongside source files as `*.spec.ts`
- Test framework: Jest with ts-jest
- Run tests before committing code changes
- Backend has comprehensive test coverage setup

## Key Development Patterns

1. **State Management**: Uses React Query for server state, local state for UI
2. **Error Handling**: Centralized error handling in services
3. **Type Safety**: Full TypeScript with strict typing
4. **Modular Architecture**: Clear separation between modules in NestJS
5. **Blockchain Hybrid**: Critical data on-chain, session data off-chain

## SEAL Security Best Practices

When working with the SEAL branch:

1. **Threshold Selection**: Choose appropriate threshold (e.g., 2-of-3) balancing security and availability
2. **Key Server Vetting**: Select trusted key server providers with clear SLAs
3. **Envelope Encryption**: For large/sensitive data, encrypt with symmetric key and use SEAL for key management
4. **Symmetric Key Handling**: Treat backup keys from `encrypt` API with extreme caution
5. **Audit Logging**: Implement comprehensive logging for all encryption/decryption events
6. **Session Key Management**: Reuse session keys within TTL, handle signatures securely
7. **Access Control Design**: Carefully design `seal_approve` functions in smart contracts

## Technical Notes

### SEAL vs Traditional Encryption
- **SEAL**: Decentralized key servers manage master keys, access controlled by blockchain
- **Traditional (Main branch)**: Application directly manages keys with HKDF derivation

### Identity Namespace
Each package in SEAL controls its own IBE identity namespace, allowing flexible access control patterns like:
- Time-lock encryption (decrypt after timestamp)
- Role-based access (decrypt if user has specific role)
- Multi-signature requirements (decrypt if approved by multiple parties)
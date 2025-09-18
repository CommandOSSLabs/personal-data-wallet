# Personal Data Wallet - Project Overview

## Project Purpose
A decentralized personal data wallet that securely stores memories on the Sui blockchain with Walrus storage, while keeping chat sessions in a PostgreSQL database. The system provides AI-powered chat interfaces for interacting with stored memories.

## Architecture
Hybrid storage approach:
1. **On-chain (Sui Blockchain + Walrus)**: HNSW Index for vector search, embedding vectors, encrypted memory content, metadata
2. **Off-chain (PostgreSQL)**: Chat sessions, messages, user preferences, application state

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **UI Libraries**: 
  - Mantine UI (v8.2.1) - Component library
  - Tailwind CSS - Utility-first CSS
  - Tabler Icons React - Icon library
  - Lucide React - Additional icons
- **Blockchain Integration**:
  - @mysten/dapp-kit - Sui dApp development
  - @mysten/sui - Sui SDK
  - @suiet/wallet-kit - Wallet integration
- **State Management**: 
  - TanStack React Query (v5) - Data fetching/caching
- **Other**: 
  - React Markdown with syntax highlighting
  - Axios for API calls

### Backend  
- **Framework**: NestJS (v11) with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Blockchain**: Sui SDK, Walrus storage integration
- **AI/ML**: 
  - Google Generative AI for embeddings
  - hnswlib-node for vector similarity search
- **Infrastructure**: Docker support, Railway deployment

### Smart Contracts
- **Language**: Move (Sui blockchain)
- **Package**: PDW (Personal Data Wallet)

## Project Structure
```
/
├── app/              # Next.js frontend application
│   ├── api/         # API routes
│   ├── components/  # React components
│   ├── hooks/       # Custom React hooks
│   ├── services/    # Frontend services
│   └── types/       # TypeScript types
├── backend/         # NestJS backend
│   └── src/
│       ├── chat/    # Chat module
│       ├── memory/  # Memory module
│       ├── storage/ # Storage services
│       └── database/# Database configs
├── smart-contract/  # Move smart contracts
│   └── sources/     # Contract source files
└── docs/           # Documentation
```

## Development Environment
- Node.js 18+
- PostgreSQL 14+
- TypeScript 5
- Docker & Docker Compose (optional)
- Sui wallet with testnet funds
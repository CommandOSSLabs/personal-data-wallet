# Personal Data Wallet Architecture Overview

## Project Description
A decentralized personal data wallet that uses Sui blockchain for state management, Walrus for decentralized storage, and HNSW algorithms for efficient vector search. The system supports multimodal content (text, images, PDFs) with unified embeddings.

## Architecture Components

### 1. Frontend (`app/`)
- Next.js application
- User interface for memory management
- Chat interface for querying memories

### 2. Backend (`backend/`)
- **Framework**: NestJS
- **Main Modules**:
  - **Infrastructure Module**: Core services (Sui, Walrus, Gemini, Seal)
  - **Memory Module**: Memory management, ingestion, and querying
  - **Chat Module**: Conversational interface with summarization

### 3. Smart Contracts (`smart-contract/`, `sui-contract/`)
- **Sui Move Contracts**: Handle permissions and metadata
- **Key Structures**:
  ```move
  struct VectorEmbedding {
      walrus_hash: String,    // Reference to vector in Walrus
      category: String,
      // ... other metadata
  }
  
  struct Memory {
      blob_id: String         // Pointer to encrypted content on Walrus
  }
  ```

### 4. Storage Architecture

#### Walrus Integration
Walrus serves as the decentralized storage layer for:

1. **HNSW Vector Indices**
   - Serialized index files (`index.bin`)
   - Periodic snapshots (every 10 vectors)
   - Downloaded and updated by backend services

2. **Knowledge Graphs**
   - JSON representations of memory relationships
   - Stored/retrieved by GraphService

3. **Encrypted Memory Content**
   - Actual memory data (encrypted)
   - Referenced by blob IDs in Sui contracts

4. **File Attachments**
   - Images (original + thumbnails)
   - PDFs (original + first page thumbnail)
   - Other binary content

#### Data Flow
```
User → Frontend → Backend API → 
  ├→ Sui Contract (permissions/metadata)
  ├→ Gemini API (embeddings)
  ├→ SEAL (encryption)
  └→ Walrus (storage)
```

### 5. Event-Driven Processing
- Sui events trigger backend operations
- Backend listens for `IngestionRequested` events
- Processes embeddings and updates indices
- Stores results in Walrus

### 6. Security Model
- **On-chain**: Permission management via Sui
- **Encryption**: SEAL homomorphic encryption
- **Storage**: Encrypted blobs in Walrus
- **Access Control**: Blockchain-enforced ownership

## Key Design Decisions

1. **Hybrid Architecture**: On-chain permissions, off-chain computation
2. **Decentralized Storage**: Walrus for all persistent data
3. **Event-Driven**: Loose coupling between components
4. **Multimodal Support**: Unified embeddings for all content types
5. **Category-Based Organization**: Predefined categories for filtering

## Technology Stack
- **Blockchain**: Sui Network
- **Storage**: Walrus decentralized storage
- **Backend**: NestJS (TypeScript)
- **ML/AI**: Google Gemini (embeddings)
- **Vector Search**: HNSW (hnswlib)
- **Encryption**: Microsoft SEAL
- **Frontend**: Next.js + React

## Recent Migration
The backend was recently migrated from Python Flask to NestJS (TypeScript) as indicated by commit `a1a6db7 feat: migrate backend to NestJs`. This provides better type safety and integration with the TypeScript ecosystem.
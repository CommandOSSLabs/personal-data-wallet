# Personal Data Wallet SDK

A TypeScript SDK for building memory-aware applications with decentralized storage, SEAL encryption, and Sui blockchain integration.

## Features

- 🧠 **Memory Management**: Create, search, and retrieve memories with AI-powered categorization
- 🔐 **SEAL Encryption**: Identity-based encryption for privacy-preserving data storage
- 🌊 **Walrus Storage**: Decentralized storage with automatic caching and fallback
- ⛓️ **Sui Integration**: Type-safe smart contract interactions using Move codegen
- 💬 **Memory-Aware Chat**: AI conversations with contextual memory retrieval
- 🛠️ **Developer-Friendly**: Full TypeScript support with comprehensive type safety

## Installation

```bash
npm install @personal-data-wallet/sdk @mysten/sui
```

## Quick Start

```typescript
import { PersonalDataWallet } from '@personal-data-wallet/sdk';
import { SuiClient } from '@mysten/sui/client';

// Create a Sui client and extend it with PDW
const suiClient = new SuiClient({ url: 'https://fullnode.devnet.sui.io' });
const client = suiClient.$extend(PersonalDataWallet);

// Create a memory
const memoryId = await client.pdw.createMemory({
  content: "Meeting notes from project discussion",
  category: "work",
  signer: keypair
});

// Search memories
const results = await client.pdw.searchMemories({
  query: "project updates",
  userAddress: "0x...",
  k: 5
});

// Get memory context for chat
const context = await client.pdw.getMemoryContext(
  "What did we discuss about the project?",
  "0x..."
);
```

## Architecture

The SDK is organized into clear, logical modules:

### **Core** (`@personal-data-wallet/sdk/core`)
- **Types**: Domain types and interfaces
- **Interfaces**: Service interfaces (`IService`, `BaseService`, `ILogger`)

### **Services** (`@personal-data-wallet/sdk/services` or main export)
14 business logic services:
- `StorageService` - Production Walrus storage with upload relay
- `EmbeddingService` - Vector embedding generation
- `GeminiAIService` - Google Gemini AI integration
- `QueryService` - Advanced search (semantic, vector, hybrid)
- `ClassifierService` - Content classification
- `MemoryIndexService` - Memory indexing with HNSW
- `ViewService` - Blockchain view operations
- `TransactionService` - Transaction management
- `BatchService` - Batch processing
- `ChatService` - Chat functionality
- `CrossContextPermissionService` - Permission management
- `MemoryService` - Memory operations
- `VectorService` - Vector operations
- `GraphService` - Knowledge graph management

### **Infrastructure** (`@personal-data-wallet/sdk/infrastructure`)
External integrations:
- **Walrus**: `WalrusStorageService`, `StorageManager`
- **Sui**: `SuiService`, `BlockchainManager`
- **SEAL**: `SealService`, `EncryptionService`
- **AI**: `GeminiAIService`

### **Utilities** (`@personal-data-wallet/sdk/utils`)
- Vector indexing (`HnswIndexService`, `VectorManager`)
- Batch processing (`BatchManager`, `BatchingService`)
- Knowledge graphs (`GraphService`, `KnowledgeGraphManager`)

## API Reference

### Client Extension Methods

#### Top-level Methods (Imperative Actions)
- `createMemory(options)` - Create and store a new memory
- `searchMemories(options)` - Search existing memories by content similarity
- `getMemoryContext(query, userAddress)` - Get relevant memory context for AI chat

#### Transaction Builders (`tx` property)
- `tx.createMemoryRecord(options)` - Create transaction for memory record
- `tx.deleteMemory(memoryId)` - Create transaction to delete a memory
- `tx.updateMemoryIndex(indexId, options)` - Create transaction to update memory index

#### Move Call Builders (`call` property)
- `call.createMemoryRecord(options)` - Move call for composing transactions
- `call.deleteMemory(memoryId)` - Move call for deletion
- `call.updateMemoryIndex(indexId, options)` - Move call for index updates

#### View Methods (`view` property)
- `view.getUserMemories(userAddress)` - Get all memories for a user
- `view.getMemoryIndex(userAddress)` - Get memory index information
- `view.getMemory(memoryId)` - Get specific memory by ID

#### BCS Types (`bcs` property)
Auto-generated from Move contracts:
- `bcs.Memory()` - Memory struct BCS definition
- `bcs.MemoryIndex()` - MemoryIndex struct BCS definition
- `bcs.MemoryMetadata()` - MemoryMetadata struct BCS definition

### Service Usage Examples

#### Using StorageService
```typescript
import { StorageService } from '@personal-data-wallet/sdk';

const storage = new StorageService({
  network: 'testnet',
  useUploadRelay: true
});

// Upload data to Walrus
const result = await storage.uploadBlob(data, {
  signer: keypair,
  epochs: 3
});

// Retrieve data
const retrieved = await storage.retrieve(result.blobId);
```

#### Using EmbeddingService
```typescript
import { EmbeddingService } from '@personal-data-wallet/sdk';

const embeddings = new EmbeddingService({
  apiKey: process.env.GEMINI_API_KEY
});

// Generate embeddings
const result = await embeddings.embedText({
  text: "Your content here",
  type: 'RETRIEVAL_DOCUMENT'
});
```

#### Using QueryService
```typescript
import { QueryService } from '@personal-data-wallet/sdk';

const query = new QueryService({
  embeddingService: embeddings,
  hnswService: hnsw
});

// Semantic search
const results = await query.semanticSearch({
  query: "Find relevant memories",
  k: 5
});
```

## Configuration

```typescript
const client = suiClient.$extend(PersonalDataWallet, {
  packageId: '0x...', // Your deployed package ID
  apiUrl: 'https://your-backend.com/api',
  encryptionConfig: {
    enabled: true,
    keyServers: ['https://keyserver.com']
  },
  storageConfig: {
    provider: 'walrus',
    cacheEnabled: true
  }
});
```

## Migration Guide

**Upgrading from pre-1.0.0?** See [MIGRATION.md](./MIGRATION.md) for detailed migration instructions.

### Quick Migration

Old imports still work but are deprecated:

```typescript
// ❌ Deprecated (but still works)
import { SealService } from '@personal-data-wallet/sdk/security';
import { SuiService } from '@personal-data-wallet/sdk/blockchain';
import { WalrusStorageService } from '@personal-data-wallet/sdk/storage';

// ✅ Recommended
import { SealService } from '@personal-data-wallet/sdk/infrastructure/seal';
import { SuiService } from '@personal-data-wallet/sdk/infrastructure/sui';
import { WalrusStorageService } from '@personal-data-wallet/sdk/infrastructure/walrus';

// ✅ Or use main export
import { SealService, SuiService, WalrusStorageService } from '@personal-data-wallet/sdk';
```

## Development

```bash
# Install dependencies
npm install

# Generate types from Move contracts
npm run codegen

# Build the SDK
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

## Documentation

- **Migration Guide**: [MIGRATION.md](./MIGRATION.md)
- **API Documentation**: See `docs/` directory
- **Examples**: See `examples/` directory
- **Service Docs**: See `docs/services/` for individual service documentation

## License

MIT
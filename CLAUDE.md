# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Primary Focus

**Working Directory**: `/workspaces/personal-data-wallet/packages/pdw-sdk`

This is the **Personal Data Wallet SDK** - a TypeScript SDK for building memory-aware applications with decentralized storage, SEAL encryption, and Sui blockchain integration.

**Package**: `personal-data-wallet-sdk` v0.2.0
**Smart Contract Package ID**: `0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde` (Sui Testnet)

## SDK Overview

The SDK provides a composable API for:

- **Memory Management**: Create, search, and retrieve memories with AI-powered categorization
- **SEAL Encryption**: Identity-based encryption for privacy-preserving data storage
- **Walrus Storage**: Decentralized storage with automatic caching and fallback
- **Sui Integration**: Type-safe smart contract interactions using Move codegen
- **Memory-Aware Chat**: AI conversations with contextual memory retrieval
- **React Support**: Designed to work with React applications using @mysten/dapp-kit patterns
- **Browser-Compatible**: Runs fully in browser environments using WebAssembly (hnswlib-wasm) and IndexedDB

## SDK Architecture

### Directory Structure

```
packages/pdw-sdk/
├── src/
│   ├── client/                  # Client extension & factory
│   │   ├── PersonalDataWallet.ts    # Main client class
│   │   ├── ClientMemoryManager.ts   # High-level memory operations
│   │   └── factory.ts               # Factory patterns
│   ├── services/                # Business logic (14 services)
│   │   ├── MemoryService.ts
│   │   ├── ChatService.ts
│   │   ├── StorageService.ts
│   │   ├── EncryptionService.ts
│   │   ├── TransactionService.ts
│   │   └── ViewService.ts
│   ├── infrastructure/          # External integrations
│   │   ├── walrus/              # Walrus storage
│   │   ├── sui/                 # Sui blockchain
│   │   ├── seal/                # SEAL encryption
│   │   └── ai/                  # Gemini AI
│   ├── wallet/                  # Wallet architecture
│   │   ├── MainWalletService.ts
│   │   └── ContextWalletService.ts
│   ├── access/                  # Access control
│   ├── aggregation/             # Multi-context queries
│   ├── core/                    # Types & interfaces
│   ├── generated/               # Auto-generated from Move
│   └── index.ts                 # Main exports
├── example/                     # Example Next.js app
├── test/                        # Test suite
└── package.json
```

### Key Design Patterns

**1. Client Extension Pattern**

Follows MystenLabs conventions for Sui ecosystem SDKs:

```typescript
import { PersonalDataWallet } from 'personal-data-wallet-sdk';
import { SuiClient } from '@mysten/sui/client';

const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
const client = suiClient.$extend(PersonalDataWallet);

// Access PDW functionality
await client.pdw.createMemory({ content, category, signer });
```

**2. Service Layer Architecture**

Services are organized into three categories:

- **Business Logic** (services/): High-level operations (MemoryService, ChatService, etc.)
- **Infrastructure** (infrastructure/): External service clients (Walrus, Sui, SEAL, AI)
- **Utilities** (utils/): Helper functions and managers

**3. Memory Processing Pipeline**

Seven-stage pipeline for memory ingestion:

1. **Input Classification** (Gemini AI)
2. **Embedding Generation** (text-embedding-004, 768-dim vectors)
3. **HNSW Index Update** (batched, 5-second window)
4. **Knowledge Graph Extraction** (entities + relationships)
5. **SEAL Encryption** (IBE with threshold key servers)
6. **Walrus Storage** (with local fallback)
7. **Sui Blockchain Record** (on-chain metadata)

## Development Commands

### Building

```bash
cd packages/pdw-sdk

# Full build (codegen + TypeScript compilation)
npm run build

# TypeScript compilation only
npm run build:ts

# Generate types from Move contracts
npm run codegen

# Watch mode for development
npm run dev
```

### Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Test SEAL integration specifically
npm run test:seal
npm run test:seal:watch

# Quick deployment verification
npm run verify:quick
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Example App

```bash
cd packages/pdw-sdk/example

# Start example Next.js app
npm run dev

# Build example app
npm run build
```

## Client API Structure

The SDK exposes a namespaced API through the client extension:

```typescript
client.pdw.{
  // Top-level imperative methods
  createMemory(options)           // Create and store a memory
  searchMemories(options)         // Search memories by content
  getMemoryContext(query, user)   // Get context for AI chat
  uploadToStorage(data)           // Upload to Walrus
  retrieveFromStorage(blobId)     // Retrieve from Walrus

  // Transaction builders (returns TransactionBlock)
  tx: {
    createMemoryRecord(options)
    updateMemoryMetadata(memoryId, metadata)
    deleteMemoryRecord(memoryId)
    grantAccess(memoryId, recipient)
    revokeAccess(memoryId, recipient)
    registerContent(content)
    executeBatch(transactions)
  }

  // Move call builders (for composing transactions)
  call: {
    createMemoryRecord(options)
    updateMemoryMetadata(options)
    deleteMemoryRecord(memoryId)
    grantAccess(options)
    revokeAccess(options)
    executeBatch(transactions)
  }

  // View methods (read-only, no gas costs)
  view: {
    getUserMemories(address)
    getMemoryIndex(address)
    getMemory(memoryId)
    getMemoryStats(address)
    getChatSessions(address)
    getChatSession(sessionId)
    getAccessPermissions(memoryId)
    getContentRegistry(address)
    objectExists(objectId)
    getObjectType(objectId)
    findMemoryByContentHash(hash)
  }

  // Wallet architecture
  wallet: {
    getMainWallet(address)
    createMainWallet(signer)
    deriveContextId(seed)
    rotateKeys(walletId)
    ensureMainWallet(address)
  }

  // Context wallets
  context: {
    create(name, signer)
    getContext(contextId)
    listUserContexts(address)
    addData(contextId, data)
    removeData(contextId, dataId)
    listData(contextId)
    ensureContext(name, address)
  }

  // Access control
  access: {
    requestConsent(request)
    grantPermissions(grant)
    revokePermissions(grant)
    checkPermission(memoryId, requester)
    getGrantsByUser(address)
    validateOAuthPermission(token)
  }

  // Aggregation (multi-context queries)
  aggregate: {
    query(query, contexts)
    queryWithScopes(query, scopes)
    search(searchTerm, contexts)
    getAggregatedStats(contexts)
  }

  // BCS types (auto-generated from Move contracts)
  bcs: {
    Memory()
    MemoryIndex()
    MemoryMetadata()
    AccessControl()
    ContentRegistry()
    AccessPermission()
  }

  // Service instances (for advanced usage)
  memory: MemoryService
  chat: ChatService
  storage: StorageService
  encryption: EncryptionService
  viewService: ViewService
  mainWalletService: MainWalletService
  contextWalletService: ContextWalletService
  permissionService: PermissionService
  aggregationService: AggregationService

  // Configuration
  config: PDWConfig
}
```

## Core Services

### MemoryService

High-level memory operations:

```typescript
const memoryId = await client.pdw.createMemory({
  content: "Meeting notes",
  category: "work",
  signer: keypair
});

const results = await client.pdw.searchMemories({
  query: "project updates",
  userAddress: "0x...",
  k: 5
});
```

### StorageService

Walrus storage with automatic fallback:

```typescript
const { blobId } = await client.pdw.uploadToStorage(data);
const retrieved = await client.pdw.retrieveFromStorage(blobId);
```

### EncryptionService

SEAL encryption/decryption:

- Identity format: `[PackageId][UserAddress]`
- Threshold cryptography (2-of-2 key servers)
- Session key management with TTL

### TransactionService

Build and execute Sui transactions:

```typescript
const tx = client.pdw.tx.createMemoryRecord({
  content: "data",
  category: "personal"
});

await signer.signAndExecuteTransactionBlock({ transactionBlock: tx });
```

## Key Concepts

### HNSW Index Management (Browser-Compatible)

The SDK uses **hnswlib-wasm** for browser-compatible vector indexing:

- **WebAssembly**: Near-native performance via WASM compilation
- **IndexedDB Persistence**: Browser storage instead of filesystem
- **In-memory caching**: Entire index loaded in RAM per user
- **Batched updates**: 5-second window, max 50 vectors per batch
- **Walrus backup**: Indices synced to decentralized storage
- **Parameters**: M=16, efConstruction=200, efSearch=50, cosine distance
- **Performance**: O(log N) search, 10-50ms query latency

### Memory Query Flow

1. Generate query embedding (768-dim vector)
2. Load user's HNSW index from cache/Walrus
3. Perform vector similarity search (get 2x requested results)
4. Load knowledge graph from Walrus
5. Expand results via graph traversal (1-hop)
6. Rank combined results (70% vector, 30% graph connectivity)
7. Retrieve and decrypt memory content via SEAL

### SEAL Access Control

Access patterns supported:

- **Self-access**: User decrypts their own memories
- **App allowlist**: Third-party apps with user approval
- **Time-locked**: Future access after timestamp

Session keys have TTL and require refresh logic.

## Configuration

### Environment Variables

**For SDK Example App** (packages/pdw-sdk/example/.env):

```bash
NEXT_PUBLIC_PACKAGE_ID=0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde
NEXT_PUBLIC_ACCESS_REGISTRY_ID=0x1d0a1936e170e54ff12ef30a042b390a8ef6dae0febcdd62c970a87eebed8659
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_GEMINI_API_KEY=<your-api-key>
```

### SDK Configuration

```typescript
const client = suiClient.$extend(PersonalDataWallet, {
  packageId: '0x...',
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

## Common Development Tasks

### Regenerating Types from Move Contracts

After smart contract changes:

```bash
cd ../../smart-contract
sui move build

cd ../packages/pdw-sdk
npm run codegen
```

This generates TypeScript types in `src/generated/`.

### Adding a New Service

1. Create service class in `src/services/`
2. Implement service interface from `src/core/interfaces/`
3. Add service to `PersonalDataWallet` constructor
4. Expose service methods in client API
5. Update `src/index.ts` exports
6. Write tests in `test/`

### Working with React Components

The SDK is designed to work with React using `@mysten/dapp-kit`:

```typescript
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { ClientMemoryManager } from 'personal-data-wallet-sdk';

function MyComponent() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  const memoryManager = useMemo(() => {
    return new ClientMemoryManager({
      packageId: process.env.NEXT_PUBLIC_PACKAGE_ID,
      // ... other config
    });
  }, []);

  // Use memoryManager for operations
}
```

### Testing SEAL Integration

```bash
# Run SEAL-specific tests
npm run test:seal

# Watch mode
npm run test:seal:watch
```

Tests require testnet connectivity and valid key server configuration.

## Performance Targets

- **Memory Ingestion**: < 1 second per memory
- **Vector Search**: < 50ms (achieved: 10-50ms)
- **Memory Retrieval**: < 300ms (includes SEAL decryption)
- **Graph Traversal**: < 20ms
- **SEAL Encryption**: 50-200ms
- **SEAL Decryption**: 100-500ms (network dependent)

## Browser Compatibility

### Architecture Changes for Frontend Support

The SDK has been refactored to run fully in browser environments:

**Previous (Node.js only)**:
- ❌ `hnswlib-node` - Native C++ module requiring Node.js
- ❌ `fs` module for filesystem operations
- ❌ `process.cwd()` and Node.js-specific APIs

**Current (Browser-compatible)**:
- ✅ `hnswlib-wasm` - WebAssembly for cross-platform compatibility
- ✅ IndexedDB for browser-based persistence
- ✅ Emscripten filesystem for WASM file operations
- ✅ Standard Web APIs only

### Vector Indexing Implementation

**WASM-Only Approach**: The SDK uses exclusively `hnswlib-wasm` for vector indexing:

**HnswWasmService** (`src/vector/HnswWasmService.ts`):
- **Primary and only** vector indexing implementation
- Uses WebAssembly for near-native HNSW performance (~10-50ms query latency)
- Stores indices in IndexedDB via Emscripten FS
- Syncs with Walrus for distributed backup
- Drop-in replacement for the previous Node.js-only `HnswIndexService`

**Backward Compatibility**:
- Export alias: `export { HnswWasmService as HnswIndexService }`
- All existing code using `HnswIndexService` automatically uses WASM version
- No changes needed in dependent services (VectorManager, BatchManager, etc.)

**Implementation Details**:
```typescript
// Initialization (async for WASM loading)
const lib = await loadHnswlib();
const index = lib.HierarchicalNSW('cosine', maxElements);

// Saving (uses Emscripten FS + IndexedDB)
await index.writeIndex(indexName);
await lib.EmscriptenFileSystemManager.syncFS(false);

// Loading (from IndexedDB)
await lib.EmscriptenFileSystemManager.syncFS(true);
await index.readIndex(indexName, false);
```

### Browser Storage Strategy

1. **In-Memory**: Active HNSW indices (fast access)
2. **IndexedDB**: Persistent local storage via Emscripten
3. **Walrus**: Distributed backup and sync across devices

### Performance Considerations

- **WASM Loading**: One-time ~2-5MB download on first use
- **IndexedDB**: Asynchronous operations, use `await`
- **Memory Limits**: Browser tabs typically limited to 2-4GB RAM
- **Batch Operations**: Essential for performance (already implemented)

### Browser Compatibility Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebAssembly | ✅ 57+ | ✅ 52+ | ✅ 11+ | ✅ 16+ |
| IndexedDB | ✅ 24+ | ✅ 16+ | ✅ 10+ | ✅ 12+ |
| SEAL Encryption | ✅ | ✅ | ✅ | ✅ |
| Sui Integration | ✅ | ✅ | ✅ | ✅ |

## Critical Development Notes

### When Modifying Services

- Update `PersonalDataWallet` client extension class
- Follow MystenLabs patterns for consistency
- Use batching for HNSW index updates (never individual adds)
- Always provide fallback for Walrus storage operations
- Implement session key refresh logic (TTL management)

### When Working with React

- Initialize services with `useMemo` to prevent recreations
- Handle loading states for all async operations
- Use batch decryption for multiple memories (UX improvement)
- Display progress callbacks for long-running operations

### When Working with Transactions

- Use transaction builders (`tx.*`) to create TransactionBlock objects
- Use Move call builders (`call.*`) for composing complex transactions
- Always handle transaction errors gracefully
- Test with actual wallet signatures on testnet

### When Working with SEAL

- Session keys are ephemeral and stored in memory
- Implement key refresh before expiration
- Handle key server failures gracefully
- Test decryption flows with actual encrypted data

### Code Generation

- Never manually edit files in `src/generated/`
- Always run `npm run codegen` after Move contract changes
- Fix-codegen-paths script runs automatically after codegen
- Commit generated files to maintain type safety

## Testing Strategy

### Unit Tests

- Test each service in isolation
- Mock external dependencies (Sui, Walrus, SEAL, Gemini)
- Focus on business logic correctness

### Integration Tests

- Test with actual Sui testnet
- Test SEAL encryption/decryption flows
- Test Walrus storage operations
- Use real API keys in CI environment

### Example App as Integration Test

The example app in `packages/pdw-sdk/example/` serves as a living integration test demonstrating real-world SDK usage.

## SDK Dependencies

Key dependencies:

- `@mysten/sui` (v1.38+): Sui blockchain client
- `@mysten/dapp-kit` (v0.19+): React hooks for Sui
- `@mysten/seal` (v0.6+): SEAL encryption
- `@mysten/walrus` (v0.7+): Walrus storage
- `@google/genai` (v1.20+): Google Gen AI SDK (unified SDK for Gemini API and Vertex AI)
- `@tanstack/react-query` (v5.90+): React Query for data fetching
- `hnswlib-wasm` (v0.8.2): Browser-compatible HNSW vector search (WebAssembly)

## Publishing

The SDK is designed to be published to npm as `personal-data-wallet-sdk`.

Before publishing:

```bash
npm run build        # Build package
npm run test         # Run all tests
npm run lint         # Check code quality
```

Note: `_prepublishOnly` script is prefixed with `_` to disable automatic builds during local installs.

## Walrus Metadata-on-Blob Pattern (Experimental)

The SDK includes experimental support for attaching metadata directly to Walrus Blob objects as an alternative to on-chain Memory structs.

### Implementation Overview

**Location**: [StorageService.ts:1464-1701](packages/pdw-sdk/src/services/StorageService.ts)

**Key Components**:

1. **WalrusMemoryMetadata Interface** (lines 102-153)
   - All string values for VecMap<String, String> compatibility
   - No `content_hash` field (blob_id serves this purpose)
   - Includes vector_id and vector_status for HNSW linking
   - Supports encryption metadata (SEAL identity, type)

2. **buildWalrusMetadata() Method** (lines 1480-1551)
   - Converts memory data to Walrus-compatible format
   - Handles embedding info, graph data, encryption status
   - Extensible with custom fields

3. **attachMetadataToBlob() Method** (lines 1568-1623)
   - Creates transaction to call Walrus `blob::add_or_replace_metadata()`
   - Converts WalrusMemoryMetadata to VecMap format
   - Requires blob object ID and signer

4. **retrieveBlobMetadata() Method** (lines 1637-1701)
   - Queries Sui dynamic fields for metadata
   - Parses VecMap<String, String> into WalrusMemoryMetadata
   - Returns null if no metadata found

### Usage Example

```typescript
// During blob upload
const result = await storageService.uploadBlob(data, {
  signer: keypair,
  epochs: 3,
  attachMetadata: true,  // Enable Walrus metadata
  vectorId: 42,
  embeddingBlobId: 'embedding_blob_xyz',
  graphBlobId: 'graph_blob_abc',
  metadata: {
    category: 'work',
    topic: 'engineering',
    importance: '8'
  }
});

// Later, attach metadata to existing blob
const metadata = storageService.buildWalrusMetadata(dataSize, {
  category: 'personal',
  vectorId: 123,
  isEncrypted: true
});

await storageService.attachMetadataToBlob(
  blobObjectId,  // Blob object ID (not blob_id hash!)
  metadata,
  signer
);

// Retrieve metadata from blob
const retrievedMetadata = await storageService.retrieveBlobMetadata(blobObjectId);
console.log('Category:', retrievedMetadata?.category);
console.log('Vector ID:', retrievedMetadata?.vector_id);
```

### Architecture Decision: On-Chain vs Walrus Metadata

**Current Recommendation: Use On-Chain Memory Structs**

After implementing and analyzing both approaches, the on-chain Memory struct approach is superior for the PDW use case:

| Feature | On-Chain Memory | Walrus Metadata |
|---------|----------------|-----------------|
| **Query Speed** | Fast (50-200ms) | Slow (N queries) |
| **Filtering** | ✅ Server-side | ❌ Client-side only |
| **Pagination** | ✅ Built-in | ❌ Manual |
| **Indexing** | ✅ By owner/category | ❌ None |
| **Discovery** | ✅ getOwnedObjects() | ❌ Must track IDs |
| **Gas (Create)** | ~$0.03 | ~$0.015 |
| **Gas (Query)** | ✅ Free (RPC) | ❌ Multiple RPCs |

**Why On-Chain is Better**:

1. **Efficient Querying**: Single RPC call to get filtered memories
2. **Better UX**: Fast metadata access (50-200ms vs seconds)
3. **Three-Layer Architecture Works**: Vector (HNSW) → Metadata (On-Chain) → Content (Walrus)
4. **No N+1 Problem**: Walrus metadata requires querying each blob individually
5. **Built-in Indexing**: Sui provides queryable object storage

**When to Use Walrus Metadata**:

- ✅ Static file hosting (no querying needed)
- ✅ Content-addressed lookups (know blob ID in advance)
- ✅ HTTP-accessible metadata via Walrus Sites
- ❌ NOT for memory organization/filtering
- ❌ NOT for user memory listings
- ❌ NOT for category-based search

### Key Insights from Implementation

1. **Blob ID is Content-Addressed**:
   - `blob_id = blake2b256(bcs(root_hash, encoding_type, size))`
   - No need for separate content_hash field
   - Built-in integrity verification

2. **Metadata Stored as Dynamic Fields**:
   - Attached via `blob::add_metadata()` Move call
   - Requires separate query per blob
   - No built-in search/filter capabilities

3. **VecMap<String, String> Format**:
   - All metadata values must be strings
   - Numeric values converted to strings
   - JSON arrays stored as stringified JSON

4. **Blob Object ID vs Blob ID Hash**:
   - Blob Object ID: On-chain object reference (for metadata attachment)
   - Blob ID Hash: Content-addressed hash (for content retrieval)
   - Must distinguish between these two!

5. **Walrus Blob ID Format**:
   - **Binary**: Fixed 32-byte array `[u8; 32]`
   - **String**: Base64 URL-safe, no padding (e.g., `"E7_nNXvFU_3qZVu3OH1yycRG7LZlyn1-UxEDCDDqGGU"`)
   - **Derivation**: `blake2b256(bcs(root_hash, encoding_type, size))`
   - **In SDK**: Handled as string (base64 representation)
   - **In Move contracts**: Stored as `String` type
   - **In transactions**: Encoded as `vector<u8>` (UTF-8 bytes of base64 string)
   - **Length**: Always 43-44 characters in base64 format

   ```typescript
   // Example blob ID formats:
   const blobId = "E7_nNXvFU_3qZVu3OH1yycRG7LZlyn1-UxEDCDDqGGU"; // String (SDK)
   const blobIdBytes = new TextEncoder().encode(blobId);  // Uint8Array for tx
   ```

6. **Content Hash = Blob ID** (No Redundant Hashing):
   - The SDK **does NOT** generate separate SHA-256 content hashes
   - Walrus `blob_id` already serves as a content-addressed hash via `blake2b256`
   - `MemoryMetadata.contentHash` should be set directly to the Walrus `blob_id`
   - This eliminates redundant hashing operations and improves upload performance

   ```typescript
   // ❌ OLD (redundant SHA-256 hashing):
   const hashBuffer = await crypto.subtle.digest('SHA-256', data);
   const contentHash = Array.from(new Uint8Array(hashBuffer))
     .map(b => b.toString(16).padStart(2, '0'))
     .join('');

   // ✅ NEW (use Walrus blob_id directly):
   const blob = await flow.getBlob();
   const contentHash = blob.blobId; // Walrus blob_id is already a content hash
   ```

   **Benefits**:
   - Eliminates ~50-200ms SHA-256 computation per upload
   - Reduces code complexity (no Web Crypto API needed)
   - Uses Walrus's native content-addressing mechanism
   - Single source of truth for content identity

### Future Optimization (Hybrid Approach)

If gas costs become a concern, consider a hybrid approach:

```typescript
// On-chain: Essential queryable fields only
struct Memory {
  id: UID,
  owner: address,
  category: String,
  vector_id: u64,
  blob_id: String,
  importance: u8,
  created_at: u64
}

// Walrus metadata: Rich but non-queryable fields
{
  topic: "...",
  embedding_dimensions: "768",
  graph_entity_count: "15",
  graph_relationship_count: "23",
  custom_tags: ["tag1", "tag2"]
}
```

This reduces on-chain storage costs while maintaining queryability for essential fields.

## Code Quality

Follow the Codacy instructions in `.github/instructions/codacy.instructions.md` for automated code analysis after edits.

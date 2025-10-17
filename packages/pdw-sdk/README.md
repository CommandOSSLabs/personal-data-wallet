# Personal Data Wallet SDK

[![npm version](https://img.shields.io/npm/v/personal-data-wallet-sdk.svg)](https://www.npmjs.com/package/personal-data-wallet-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A TypeScript SDK for building memory-aware applications with decentralized storage, SEAL encryption, and Sui blockchain integration.

## Features

- 🧠 **Memory Management** - Create, search, and retrieve memories with AI-powered categorization
- 🔐 **SEAL Encryption** - Identity-based encryption for privacy-preserving data storage
- 🌊 **Walrus Storage** - Decentralized storage with automatic caching and fallback
- ⛓️ **Sui Integration** - Type-safe smart contract interactions using Move codegen
- 💬 **Memory-Aware Chat** - AI conversations with contextual memory retrieval (RAG)
- 🔍 **Vector Search** - HNSW-based semantic search with 768-dimensional embeddings
- 🕸️ **Knowledge Graph** - Entity and relationship extraction
- ⚛️ **React Hooks** - Ready-to-use React hooks for common operations
- 🛠️ **Developer-Friendly** - Full TypeScript support with comprehensive type safety
- 🌐 **Browser-Compatible** - Runs fully in browser using WebAssembly (hnswlib-wasm)

## Installation

```bash
npm install personal-data-wallet-sdk @mysten/sui @mysten/dapp-kit @tanstack/react-query react
```

### Peer Dependencies

The SDK requires the following peer dependencies:

```json
{
  "@mysten/dapp-kit": "^0.19.0",
  "@mysten/sui": "^1.38.0",
  "@tanstack/react-query": "^5.90.0",
  "react": "^18.0.0"
}
```

## Quick Start

### 1. Basic Setup

```typescript
import { ClientMemoryManager } from 'personal-data-wallet-sdk';

const manager = new ClientMemoryManager({
  packageId: '0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde',
  accessRegistryId: '0x1d0a1936e170e54ff12ef30a042b390a8ef6dae0febcdd62c970a87eebed8659',
  walrusAggregator: 'https://aggregator.walrus-testnet.walrus.space',
  geminiApiKey: process.env.GEMINI_API_KEY,
});

// Create a memory
const blobId = await manager.createMemory({
  content: 'Meeting notes from project discussion',
  category: 'work',
  account,
  signAndExecute,
  client,
});

// Search memories
const results = await manager.searchMemories({
  query: 'project updates',
  userAddress: account.address,
  k: 5,
});
```

### 2. React Integration (Recommended)

The SDK provides React hooks for seamless integration with React applications:

```typescript
import { useCreateMemory } from 'personal-data-wallet-sdk/hooks';
import { useCurrentAccount } from '@mysten/dapp-kit';

function CreateMemoryComponent() {
  const account = useCurrentAccount();

  const { mutate: createMemory, isPending, progress } = useCreateMemory({
    config: {
      packageId: process.env.NEXT_PUBLIC_PACKAGE_ID,
      accessRegistryId: process.env.NEXT_PUBLIC_ACCESS_REGISTRY_ID,
      walrusAggregator: process.env.NEXT_PUBLIC_WALRUS_AGGREGATOR,
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    },
    onSuccess: (result) => {
      console.log('Memory created! Blob ID:', result.blobId);
    },
    onProgress: (progress) => {
      console.log('Progress:', progress.message);
    },
  });

  const handleCreate = () => {
    createMemory({
      content: 'My important note',
      category: 'general',
    });
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? `Creating... (${progress?.message})` : 'Create Memory'}
    </button>
  );
}
```

## Environment Setup

### Required Configuration

Create a `.env` file (or `.env.local` for Next.js):

```env
# Sui Blockchain Configuration (Testnet)
NEXT_PUBLIC_PACKAGE_ID=0x067706fc08339b715dab0383bd853b04d06ef6dff3a642c5e7056222da038bde
NEXT_PUBLIC_ACCESS_REGISTRY_ID=0x1d0a1936e170e54ff12ef30a042b390a8ef6dae0febcdd62c970a87eebed8659

# Walrus Storage Configuration
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space

# AI Configuration (REQUIRED)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the key and add it to your environment variables

> ⚠️ **Important**: The SDK requires a valid Gemini API key for AI-powered features like memory categorization, embeddings, and chat.

## React Hooks API

The SDK provides several React hooks for common operations:

### useCreateMemory

Create memories with progress tracking:

```typescript
import { useCreateMemory } from 'personal-data-wallet-sdk/hooks';

const {
  mutate,        // Function to create memory
  mutateAsync,   // Promise-based version
  isPending,     // Loading state
  isSuccess,     // Success state
  data,          // Result data
  error,         // Error object
  progress,      // Progress updates
  reset,         // Reset state
} = useCreateMemory({
  config: {
    packageId: '0x...',
    geminiApiKey: 'your-key',
    // ... other config
  },
  onSuccess: (result) => console.log('Created:', result.blobId),
  onError: (error) => console.error('Error:', error),
  onProgress: (progress) => console.log('Progress:', progress.message),
});
```

### useSearchMemories

Search memories with semantic similarity:

```typescript
import { useSearchMemories } from 'personal-data-wallet-sdk/hooks';

const { data: results, isLoading, error } = useSearchMemories(
  userAddress,
  query,
  {
    k: 5,                    // Number of results
    minSimilarity: 0.5,      // Minimum similarity threshold
    enabled: query.length > 2, // Only search when ready
    debounceMs: 500,         // Debounce delay
    geminiApiKey: apiKey,
  }
);
```

### useMemoryChat

AI chat with memory context (RAG):

```typescript
import { useMemoryChat } from 'personal-data-wallet-sdk/hooks';

const {
  messages,              // Chat messages
  sendMessage,           // Send a message
  createMemoryFromMessage, // Save message as memory
  isProcessing,          // Loading state
  retrievedMemories,     // Context memories used
} = useMemoryChat(userAddress, {
  systemPrompt: 'You are a helpful AI assistant...',
  maxContextMemories: 5,
  aiProvider: 'gemini',
  autoSaveMessages: false,
  geminiApiKey: process.env.GEMINI_API_KEY,
});
```

### useMemoryServices

Access all memory services:

```typescript
import { useMemoryServices } from 'personal-data-wallet-sdk/hooks';

const {
  memoryService,
  storageService,
  vectorService,
  chatService,
  // ... other services
} = useMemoryServices(config);
```

## API Reference

### ClientMemoryManager

The main class for memory operations:

#### Constructor

```typescript
const manager = new ClientMemoryManager({
  packageId: string,              // Sui package ID
  accessRegistryId?: string,      // Access registry object ID
  walletRegistryId?: string,      // Wallet registry object ID
  walrusPublisher?: string,       // Walrus publisher URL
  walrusAggregator?: string,      // Walrus aggregator URL
  geminiApiKey?: string,          // Gemini API key
  network?: 'mainnet' | 'testnet' | 'devnet',
  encryptionEnabled?: boolean,
  enableProgressCallbacks?: boolean,
  onProgress?: (progress: CreateMemoryProgress) => void,
});
```

#### Methods

##### createMemory()

Create and store a new memory:

```typescript
const blobId = await manager.createMemory({
  content: string,           // Memory content
  category?: string,         // Category (e.g., 'work', 'personal')
  account: WalletAccount,    // Current wallet account
  signAndExecute: Function,  // Sign and execute function
  client: SuiClient,         // Sui client instance
  importance?: number,       // Importance (1-10)
  tags?: string[],           // Custom tags
});
```

##### searchMemories()

Search memories using semantic similarity:

```typescript
const results = await manager.searchMemories({
  query: string,           // Search query
  userAddress: string,     // User's Sui address
  k?: number,              // Number of results (default: 5)
  minSimilarity?: number,  // Minimum similarity (0-1, default: 0.5)
  category?: string,       // Filter by category
  tags?: string[],         // Filter by tags
});

// Returns: Array<{
//   blobId: string,
//   content: string,
//   category: string,
//   similarity: number,
//   timestamp?: number,
// }>
```

##### getMemoryById()

Retrieve a specific memory:

```typescript
const memory = await manager.getMemoryById(blobId, userAddress);
```

##### deleteMemory()

Delete a memory:

```typescript
await manager.deleteMemory({
  blobId: string,
  account: WalletAccount,
  signAndExecute: Function,
  client: SuiClient,
});
```

## Service Architecture

The SDK is organized into three layers:

### 1. Business Logic Services (`services/`)

High-level operations:

- **MemoryService** - Memory CRUD operations
- **ChatService** - AI chat with memory context
- **QueryService** - Advanced search (semantic, vector, hybrid)
- **GraphService** - Knowledge graph management
- **ClassifierService** - Content classification
- **MemoryIndexService** - Memory indexing with HNSW

### 2. Infrastructure Services (`infrastructure/`)

External service integrations:

- **WalrusStorageService** - Walrus decentralized storage
- **SuiService** - Sui blockchain interactions
- **SealService** - SEAL encryption
- **GeminiAIService** - Google Gemini AI
- **EmbeddingService** - Vector embedding generation

### 3. Utilities (`utils/`)

Helper functions and managers:

- **VectorManager** - HNSW vector indexing (WebAssembly)
- **BatchManager** - Batch processing
- **KnowledgeGraphManager** - Graph operations

## Advanced Usage

### Direct Service Usage

For advanced use cases, you can use services directly:

```typescript
import { EmbeddingService, QueryService } from 'personal-data-wallet-sdk';

// Generate embeddings
const embeddingService = new EmbeddingService({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004',
  dimensions: 768,
});

const result = await embeddingService.embedText({
  text: 'Your content here',
  type: 'RETRIEVAL_DOCUMENT',
});

console.log('Embedding:', result.embedding); // 768-dimensional vector
```

### Knowledge Graph Extraction

```typescript
import { GraphService } from 'personal-data-wallet-sdk';

const graphService = new GraphService({
  aiService: geminiService,
});

const graph = await graphService.extractGraph({
  content: 'John met Sarah at the conference in San Francisco.',
});

console.log('Entities:', graph.entities);
// [{ id: 'john', type: 'person', ... }, ...]

console.log('Relationships:', graph.relationships);
// [{ from: 'john', to: 'sarah', type: 'met_at', ... }]
```

### Vector Search with HNSW

```typescript
import { HnswWasmService } from 'personal-data-wallet-sdk';

// Initialize WASM-based HNSW index
const vectorService = new HnswWasmService({
  space: 'cosine',
  dim: 768,
  maxElements: 10000,
  M: 16,
  efConstruction: 200,
});

await vectorService.initIndex('my-index', 768);
await vectorService.addItem(embedding, id);

// Search
const neighbors = await vectorService.searchKnn(queryEmbedding, 5);
```

## Examples

### Complete Next.js Example

Check out the [example app](./example) for a complete Next.js application demonstrating:

- Memory creation with progress tracking
- Vector search with semantic similarity
- AI chat with memory context (RAG)
- Knowledge graph visualization
- Access control management

```bash
cd packages/pdw-sdk/example
npm install
cp .env.example .env.local
# Edit .env.local with your configuration
npm run dev
```

### React Component Example

```typescript
'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useCreateMemory, useSearchMemories } from 'personal-data-wallet-sdk/hooks';

export function MemoryManager() {
  const account = useCurrentAccount();
  const [content, setContent] = useState('');
  const [query, setQuery] = useState('');

  const { mutate: createMemory, isPending } = useCreateMemory({
    config: {
      packageId: process.env.NEXT_PUBLIC_PACKAGE_ID!,
      geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
    },
    onSuccess: (result) => {
      console.log('Created:', result.blobId);
      setContent('');
    },
  });

  const { data: results } = useSearchMemories(account?.address, query, {
    k: 5,
    minSimilarity: 0.5,
    enabled: query.length > 2,
    geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });

  return (
    <div>
      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter memory content..."
        />
        <button
          onClick={() => createMemory({ content, category: 'general' })}
          disabled={isPending}
        >
          {isPending ? 'Creating...' : 'Create Memory'}
        </button>
      </div>

      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search memories..."
        />
        {results?.map((result) => (
          <div key={result.blobId}>
            <strong>{result.category}</strong>
            <p>{result.content}</p>
            <small>Similarity: {(result.similarity * 100).toFixed(1)}%</small>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Browser Compatibility

The SDK is fully browser-compatible using WebAssembly for vector indexing:

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| WebAssembly | ✅ 57+ | ✅ 52+ | ✅ 11+ | ✅ 16+ |
| IndexedDB | ✅ 24+ | ✅ 16+ | ✅ 10+ | ✅ 12+ |
| SEAL Encryption | ✅ | ✅ | ✅ | ✅ |
| Sui Integration | ✅ | ✅ | ✅ | ✅ |

### Performance Characteristics

- **Memory Creation**: ~1-2 seconds (includes AI analysis + encryption + storage)
- **Vector Search**: 10-50ms (after index is loaded)
- **Memory Retrieval**: 300-500ms (includes decryption)
- **HNSW Index Loading**: ~100-500ms (depends on index size)

## Configuration Options

### Full Configuration Example

```typescript
const config = {
  // Sui Blockchain
  packageId: '0x...',
  accessRegistryId: '0x...',
  walletRegistryId: '0x...',
  network: 'testnet', // 'mainnet' | 'testnet' | 'devnet'

  // Walrus Storage
  walrusPublisher: 'https://publisher.walrus-testnet.walrus.space',
  walrusAggregator: 'https://aggregator.walrus-testnet.walrus.space',

  // AI Configuration
  geminiApiKey: 'your-api-key',
  embeddingModel: 'text-embedding-004',
  chatModel: 'gemini-2.5-flash',
  embeddingDimensions: 768,

  // SEAL Encryption
  encryptionEnabled: true,
  sealKeyServers: ['https://keyserver1.com', 'https://keyserver2.com'],

  // Vector Search
  hnswM: 16,
  hnswEfConstruction: 200,
  hnswEfSearch: 50,

  // Progress Callbacks
  enableProgressCallbacks: true,
  onProgress: (progress) => console.log(progress.message),
};
```

## Troubleshooting

### "No QueryClient set" Error

If you see this error, ensure you're using the SDK's hooks correctly and have `@tanstack/react-query` as a peer dependency:

```typescript
// App-level provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

### "Gemini API key not configured" Error

Ensure your environment variable is set:

```bash
# .env.local
NEXT_PUBLIC_GEMINI_API_KEY=AIza...your_key_here
```

Restart your dev server after changing environment variables.

### Memory Creation Hanging

If memory creation gets stuck:

1. Check browser console for errors
2. Verify wallet has testnet SUI tokens
3. Ensure Gemini API key is valid
4. Check network connectivity to Walrus

### Module Resolution Errors

If you see module resolution errors during build:

```bash
# Clean everything and reinstall
rm -rf node_modules package-lock.json .next
npm install
npm run dev
```

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/CommandOSSLabs/personal-data-wallet.git
cd personal-data-wallet/packages/pdw-sdk

# Install dependencies
npm install

# Generate types from Move contracts
npm run codegen

# Build the SDK
npm run build

# Run tests
npm test

# Development mode (watch)
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Test SEAL integration
npm run test:seal
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## API Models Used

The SDK uses the following Google Gemini models:

- **Embeddings**: `text-embedding-004` (768 dimensions)
- **Chat/Generation**: `gemini-2.5-flash`
- **Content Analysis**: `gemini-2.5-flash`

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## Support

- **Documentation**: See [example app README](./example/README.md) for detailed setup
- **Issues**: [GitHub Issues](https://github.com/CommandOSSLabs/personal-data-wallet/issues)
- **Examples**: Check the [example directory](./example)

## License

MIT - see [LICENSE](./LICENSE) file for details

## Links

- **npm**: https://www.npmjs.com/package/personal-data-wallet-sdk
- **GitHub**: https://github.com/CommandOSSLabs/personal-data-wallet
- **Sui Documentation**: https://docs.sui.io
- **Walrus Documentation**: https://docs.walrus.site
- **Google AI Studio**: https://aistudio.google.com

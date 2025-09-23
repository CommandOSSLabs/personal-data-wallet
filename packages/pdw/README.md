# PDW - Personal Data Wallet for Vector Storage

A streamlined SDK for storing AI-generated vector embeddings on Walrus decentralized storage network.

## 🚀 Features

- **🧠 AI Embeddings**: Generate 768-dimensional vectors using Google Gemini API
- **🔍 Vector Search**: Fast similarity search with HNSW (Hierarchical Navigable Small World) algorithm
- **🌊 Walrus Storage**: Store vector indices on decentralized Walrus network
- **⚡ Batch Processing**: Efficient batch operations for multiple texts
- **📊 Analytics**: Comprehensive statistics and monitoring
- **🛡️ Fallback**: Local storage fallback when Walrus is unavailable

## 📦 Installation

```bash
npm install @personal-data-wallet/pdw
```

## 🔑 Prerequisites

1. **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Walrus Network Access**: Testnet is free and available by default

## 🚀 Quick Start

```typescript
import { createPDWWithPreset } from '@personal-data-wallet/pdw';

// Create PDW instance with basic configuration
const pdw = createPDWWithPreset('BASIC', 'your-gemini-api-key');

// Store text as vector embedding
const result = await pdw.storeText(
  'user123',
  'This is my important note about AI and blockchain technology.',
  { category: 'notes' }
);

console.log(`Stored with vector ID: ${result.vectorId}`);
console.log(`Saved to Walrus blob: ${result.blobId}`);

// Search for similar texts
const similar = await pdw.searchSimilar(
  'user123',
  'AI blockchain research',
  { k: 5, threshold: 0.7 }
);

console.log(`Found ${similar.results.length} similar texts`);
```

## 🏗️ Advanced Usage

### Manual Configuration

```typescript
import { PDW } from '@personal-data-wallet/pdw';

const pdw = new PDW({
  embedding: {
    apiKey: 'your-gemini-api-key',
    model: 'text-embedding-004',
    batchSize: 20
  },
  vector: {
    dimensions: 768,
    maxElements: 10000,
    efConstruction: 200,
    m: 16
  },
  walrus: {
    network: 'testnet',
    enableBatching: true
  }
});
```

### Batch Processing

```typescript
// Store multiple texts efficiently
const texts = [
  { text: 'First document content', category: 'docs' },
  { text: 'Second document content', category: 'docs' },
  { text: 'Third document content', category: 'notes' }
];

const batchResult = await pdw.storeTextsBatch('user123', texts);
console.log(`Batch completed: ${batchResult.successCount} successful`);
```

### Index Management

```typescript
// Save vector index to Walrus
const blobId = await pdw.saveUserIndex('user123');

// Load vector index from Walrus
await pdw.loadUserIndex('user123', blobId);

// Check if index exists
const exists = await pdw.hasUserIndex('user123');

// Get index statistics
const stats = pdw.getUserIndexStats('user123');
console.log(`Index contains ${stats.vectorCount} vectors`);
```

## 📊 Configuration Presets

### BASIC (Development)
- Max elements: 1,000
- Batch size: 10
- Suitable for testing and small datasets

### PRODUCTION (Recommended)
- Max elements: 50,000
- Batch size: 50
- Optimized for production workloads

### HIGH_CAPACITY (Large Datasets)
- Max elements: 100,000
- Batch size: 100
- For enterprise-scale deployments

## 🔍 Vector Search Options

```typescript
const searchOptions = {
  k: 10,                    // Number of results
  threshold: 0.7,           // Similarity threshold (0-1)
  efSearch: 50,             // HNSW search parameter
  includeMetadata: true,    // Include metadata in results
  includeEmbeddings: false  // Include embedding vectors
};

const results = await pdw.searchSimilar('user123', 'query text', searchOptions);
```

## 📈 Analytics & Monitoring

```typescript
// Get comprehensive statistics
const stats = pdw.getStats();

console.log('Embedding Service:', stats.embedding);
console.log('Walrus Service:', stats.walrus);
console.log('Users:', stats.users);

// Get user-specific index stats
const userStats = pdw.getUserIndexStats('user123');
console.log(`Vector count: ${userStats.vectorCount}`);
console.log(`Dimensions: ${userStats.dimension}`);
```

## 🛠️ Utilities

```typescript
import { PDWUtils, validateConfig } from '@personal-data-wallet/pdw';

// Validate configuration
const validation = validateConfig(config);
if (!validation.isValid) {
  console.error('Config errors:', validation.errors);
}

// Estimate storage requirements
const estimate = PDWUtils.estimateStorage(1000, 500); // 1000 texts, 500 chars avg
console.log(`Storage needed: ${estimate.totalMB} MB`);

// Get SDK information
const info = PDWUtils.getInfo();
console.log(`${info.name} v${info.version}`);
```

## 🌊 Walrus Network

PDW uses the Walrus decentralized storage network:

- **Testnet**: Free tier, suitable for development and testing
- **Mainnet**: Production tier (coming soon)
- **Local Fallback**: Automatic fallback to local storage if Walrus unavailable

## ⚡ Performance Tips

1. **Use Batch Operations**: Process multiple texts together for better performance
2. **Optimize Vector Index**: Adjust `efConstruction` and `m` parameters based on your needs
3. **Enable Batching**: Set `enableBatching: true` in Walrus config for better throughput
4. **Cache Management**: Indices are automatically cached in memory for fast access

## 🔒 Security & Privacy

- **Client-Side Processing**: All embedding generation happens locally
- **Decentralized Storage**: Vector indices stored on decentralized Walrus network
- **No Data Lock-in**: Your data remains under your control
- **Local Fallback**: Ensures availability even when network is down

## 📝 API Reference

### PDW Class Methods

| Method | Description | Parameters |
|--------|-------------|------------|
| `storeText()` | Store single text as vector | userId, text, options |
| `storeTextsBatch()` | Store multiple texts | userId, texts[], options |
| `searchSimilar()` | Search similar texts | userId, query, options |
| `saveUserIndex()` | Save index to Walrus | userId |
| `loadUserIndex()` | Load index from Walrus | userId, blobId? |
| `hasUserIndex()` | Check if index exists | userId, blobId? |
| `getUserIndexStats()` | Get index statistics | userId |
| `clearUserData()` | Clear user data from memory | userId |
| `getStats()` | Get service statistics | none |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/CommandOSSLabs/personal-data-wallet)
- [Walrus Documentation](https://docs.walrus.space/)
- [Google Gemini API](https://ai.google.dev/)

---

**PDW** - Decentralized vector storage made simple 🚀
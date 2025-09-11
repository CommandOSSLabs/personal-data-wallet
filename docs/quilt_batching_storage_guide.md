# Complete Guide to Walrus Quilt - Batching Storage

## Table of Contents
1. [Overview](#overview)
2. [What is Quilt?](#what-is-quilt)
3. [Key Benefits](#key-benefits)
4. [Architecture & Technical Details](#architecture--technical-details)
5. [Cost Savings Analysis](#cost-savings-analysis)
6. [TypeScript SDK Integration](#typescript-sdk-integration)
7. [API Reference](#api-reference)
8. [Use Cases](#use-cases)
9. [Real-World Applications](#real-world-applications)
10. [Best Practices](#best-practices)
11. [Migration Guide](#migration-guide)
12. [Troubleshooting](#troubleshooting)

## Overview

**Walrus Quilt** is a revolutionary batch storage solution launched by MystenLabs as part of the Walrus decentralized storage protocol. Quilt is a batch storage solution that makes it intuitive and easy to achieve optimal economics when storing large volumes of small files, such as NFT collections, documents, AI communications data, and log data.

### Launch Timeline
- **Testnet**: Live since Walrus 1.29 release
- **Mainnet**: Launched July 30th, 2025 with version 1.29

## What is Quilt?

Quilt is a batch storage solution with an intuitive API, designed to make storing and accessing large numbers of small files on Walrus both incredibly convenient, efficient, and cost-effective. Instead of storing each file individually, Quilt groups many small files into a single unit, reducing overhead and costs.

### Core Concept
```
Traditional Storage:         Quilt Batching:
┌─────────────┐             ┌─────────────────┐
│  File 1     │             │   Quilt Unit    │
│  + Metadata │             │ ┌─────────────┐ │
└─────────────┘             │ │  File 1     │ │
┌─────────────┐             │ │  File 2     │ │
│  File 2     │      →      │ │  File 3     │ │
│  + Metadata │             │ │     ...     │ │
└─────────────┘             │ │  File 660   │ │
┌─────────────┐             │ └─────────────┘ │
│     ...     │             │ + Shared Meta   │
└─────────────┘             └─────────────────┘
```

### Key Features

1. **Batch Processing**: Quilt will bundle up to 660 objects into a single unit, reducing encoding overhead and gas fees on SUI

2. **Individual Access**: Although stored together as one unit, each file within a Quilt can be accessed individually without needing to download the entire Quilt

3. **Native API**: Quilt provides a Walrus-native API for grouping and managing a large number of small files, alleviating developers from having to manage custom batching schemes on their own

4. **Metadata Support**: Developers can add protocol-native tags and metadata to efficiently organize and retrieve content

## Key Benefits

### 1. **Dramatic Cost Reduction**
Storing small files with Quilt will lower costs by up to 106x for 100 KB blobs and 420x for 10 KB blobs.

### 2. **Gas Efficiency**
Using Quilt will also reduce any SUI-denominated gas fees associated with Walrus storage transactions.

### 3. **Preserved Performance**
This makes data retrieval latency from a Quilt comparable to (or lower than) that of whole blob storage, providing the cost savings of batching with the speed and convenience of individual access.

### 4. **Developer Experience**
- No need for custom batching logic
- Simplified data management
- Native Walrus integration
- Tag-based organization

## Architecture & Technical Details

### Erasure Coding & Metadata
The size of the storage resource needed to store a blob, and the size taken into account to pay for the upload costs, corresponds to the encoded size of a blob. The encoded size of a blob is about 5x larger than the unencoded original blob size, and the size of some metadata that is independent of the size of the blob.

### Metadata Overhead Problem
Since the fixed size per-blob metadata is quite large (about 64MB in the worse case), the cost of storing small blobs (< 10MB) is dominated by this, and the size of storing larger blobs is dominated by their increasing size.

### Quilt Solution
When multiple blobs are stored together, the metadata costs are amortized across the batch. Quilt can also significantly reduce Sui computation and storage costs.

### Technical Specifications
- **Maximum files per Quilt**: 660 objects
- **Encoding optimization**: Shared metadata across batch
- **Access pattern**: Direct file access without full batch download
- **Storage efficiency**: 5x erasure coding with shared overhead

## Cost Savings Analysis

### Before Quilt
Storing 600 small images for your NFT project meant making 600 separate storage operations, which creates significantly more storage overhead than a single large operation. To address this, builders have to manually batch files into one storage operation, adding extra effort and overhead. Retrieving one NFT image is also more complex as builders need to retrieve the entire batch first.

### After Quilt
You can now batch all 600 images into a single Quilt through a Walrus-native API, dramatically cutting storage overhead without increasing development and operational burden. You can tag each image with its traits (e.g., "color: blue," "accessory: hat") and quickly retrieve the specific image you need, without downloading the entire batch.

### Cost Comparison Table

| Blob Size | Traditional Cost | Quilt Cost | Savings |
|-----------|-----------------|------------|---------|
| 10 KB     | High            | Low        | **420x** |
| 100 KB    | High            | Low        | **106x** |
| 1 MB      | Moderate        | Low        | **~50x** |
| 10 MB+    | Low overhead    | Minimal    | **~10x** |

## TypeScript SDK Integration

### Installation
```bash
npm install @mysten/walrus
```

Latest version: **0.6.4** (published 4 days ago)

### Basic Setup
```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile } from '@mysten/walrus';

const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});
```

### Creating WalrusFile Objects
You can also construct a WalrusFile from a Uint8Array, Blob, or a string which can then be stored on walrus:

```typescript
// From raw data
const file1 = WalrusFile.from(new Uint8Array([1, 2, 3]));

// From Blob
const file2 = WalrusFile.from(new Blob([new Uint8Array([1, 2, 3])]));

// From string with metadata
const file3 = WalrusFile.from('Hello from the TS SDK!!!\n', {
  identifier: 'README.md',
  tags: {
    'content-type': 'text/plain',
    'category': 'documentation',
    'version': '1.0'
  },
});

// From File (browser)
const file4 = WalrusFile.from(fileInputElement.files[0], {
  identifier: 'user-upload.jpg',
  tags: {
    'content-type': 'image/jpeg',
    'user-id': 'user123',
    'upload-date': new Date().toISOString()
  }
});
```

### Batch Upload with Quilt
Currently the provided files will all be written into a single quilt. Future versions of the SDK may optimize how files are stored to be more efficient by splitting files into multiple quilts:

```typescript
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Create signer
const keypair = Ed25519Keypair.generate();

// Upload multiple files as a Quilt
const results = await walrusClient.writeFiles({
  files: [file1, file2, file3, file4],
  epochs: 3,
  deletable: true,
  signer: keypair,
});

console.log('Quilt upload results:', results);
// Results structure:
// [
//   { id: 'file1-id', blobId: 'quilt-blob-id', blobObject: {...} },
//   { id: 'file2-id', blobId: 'quilt-blob-id', blobObject: {...} },
//   ...
// ]
```

### Reading Files from Quilt
The WalrusFile API provides a higher level abstraction so that applications don't need to worry about how data is stored in walrus. Today it handles data stored directly in blobs, and data stored in Quilts:

```typescript
// Get the WalrusFile wrapper for a blob (could be Quilt or regular blob)
const blob = await walrusClient.getFiles(blobId);

// Get all files from the Quilt
const files = await blob.files();

// Get files by identifier
const [readme] = await blob.files({ 
  identifiers: ['README.md'] 
});

// Get files by tags
const textFiles = await blob.files({ 
  tags: [{ 'content-type': 'text/plain' }] 
});

// Get files by specific quilt ID
const filesById = await blob.files({ 
  ids: [quiltID] 
});

// Advanced filtering
const userImages = await blob.files({
  tags: [
    { 'content-type': 'image/jpeg' },
    { 'user-id': 'user123' }
  ]
});
```

### Working with File Data
```typescript
// Read file content
for (const file of files) {
  const data = await file.data();
  const text = await file.text();
  const arrayBuffer = await file.arrayBuffer();
  
  console.log(`File: ${file.identifier}`);
  console.log(`Tags:`, file.tags);
  console.log(`Size: ${data.length} bytes`);
}

// Stream large files
const file = files.find(f => f.identifier === 'large-dataset.csv');
if (file) {
  const stream = await file.stream();
  // Process stream...
}
```

## API Reference

### WalrusClient Methods

#### `writeFiles(options)`
Upload multiple files as a Quilt batch.

**Parameters:**
```typescript
interface WriteFilesOptions {
  files: WalrusFile[];
  epochs: number;
  deletable?: boolean;
  signer: Signer;
}
```

**Returns:**
```typescript
Promise<{
  id: string;
  blobId: string;
  blobObject: Blob.$inferType;
}[]>
```

#### `getFiles(blobId)`
This method accepts both Blob IDs and Quilt IDs, and will return a WalrusFile. It is encouraged to always read files in batches when possible, which will allow the client to be more efficient when loading multiple files from the same quilt.

### WalrusFile Methods

#### `files(options?)`
Retrieve files from a Quilt with optional filtering.

**Parameters:**
```typescript
interface FileFilterOptions {
  identifiers?: string[];
  tags?: Record<string, any>[];
  ids?: string[];
}
```

### File Metadata Structure
```typescript
interface WalrusFile {
  identifier: string;
  tags: Record<string, any>;
  data(): Promise<Uint8Array>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  stream(): Promise<ReadableStream>;
}
```

## Use Cases

### 1. **NFT Collections**
Store large collections of NFT images with metadata tags for traits and attributes.

```typescript
// NFT Collection Example
const nftImages = await Promise.all(
  nftFiles.map((file, index) => 
    WalrusFile.from(file, {
      identifier: `nft_${index}.png`,
      tags: {
        'collection': 'Crypto Punks',
        'trait-background': traits[index].background,
        'trait-accessory': traits[index].accessory,
        'rarity': traits[index].rarity,
        'token-id': index.toString()
      }
    })
  )
);

const results = await walrusClient.writeFiles({
  files: nftImages,
  epochs: 100, // Long-term storage
  deletable: false,
  signer: keypair
});
```

### 2. **AI Communications Data**
Walrus introduces efficiencies for both large files and the small-file datasets common in AI and analytics pipelines through Quilt.

```typescript
// AI Training Data Example
const aiDataFiles = conversations.map(conv => 
  WalrusFile.from(JSON.stringify(conv), {
    identifier: `conversation_${conv.id}.json`,
    tags: {
      'data-type': 'ai-training',
      'model-version': 'gpt-4',
      'session-id': conv.sessionId,
      'user-type': conv.userType,
      'timestamp': conv.timestamp
    }
  })
);

await walrusClient.writeFiles({
  files: aiDataFiles,
  epochs: 50,
  deletable: true,
  signer: keypair
});
```

### 3. **Log Storage**
```typescript
// Application Logs Example
const logFiles = logEntries.map(log => 
  WalrusFile.from(JSON.stringify(log), {
    identifier: `log_${log.timestamp}.json`,
    tags: {
      'log-level': log.level,
      'service': log.service,
      'environment': 'production',
      'date': new Date(log.timestamp).toISOString().split('T')[0]
    }
  })
);

await walrusClient.writeFiles({
  files: logFiles,
  epochs: 10, // Shorter retention
  deletable: true,
  signer: keypair
});
```

### 4. **Document Management**
```typescript
// Document Storage Example
const documents = await Promise.all(
  docFiles.map(file => 
    WalrusFile.from(file, {
      identifier: file.name,
      tags: {
        'document-type': getDocumentType(file.name),
        'department': 'legal',
        'confidentiality': 'internal',
        'created-by': userId,
        'version': '1.0'
      }
    })
  )
);

await walrusClient.writeFiles({
  files: documents,
  epochs: 200, // Long-term retention
  deletable: false,
  signer: keypair
});
```

## Real-World Applications

### 1. **Tusky Integration**
Tusky, a decentralized, privacy-first file storage platform that improves on centralized products like Dropbox or Google Drive, handles a wide spectrum of file sizes uploaded by users. Quilt makes it efficient and convenient for Tusky's architecture to manage small files, even during periods of high volume—enhancing the performance of Tusky's app for users and reducing costs.

### 2. **Baselight Partnership**
Baselight, a permissionless data platform designed for structured datasets built by Finisterra Labs, has partnered with Walrus to allow users to unlock the potential value of data stored onchain. Data stored on Walrus can be made queryable and programmable within Baselight, enabling dynamic access models such as token-gated queries, time-locked permissions, or DAO-controlled licensing.

### 3. **Enterprise Use Cases**
- **Media Companies**: Batch storage of thumbnails and previews
- **Gaming**: Asset bundles and texture packs
- **IoT**: Sensor data and telemetry batches
- **Research**: Dataset collections and experimental results

## Best Practices

### 1. **Optimal File Grouping**
- **Group related files**: Store logically related files together
- **Similar access patterns**: Batch files likely to be accessed together
- **Size considerations**: Mix small files to maximize batch efficiency

```typescript
// Good: Related NFT collection
const nftBatch = [nft1, nft2, nft3, ...]; // Same collection

// Good: Daily logs
const dailyLogs = logsForDate('2024-01-15');

// Avoid: Mixing unrelated data types
const mixedBatch = [nftImage, logFile, document]; // Not recommended
```

### 2. **Effective Tagging Strategy**
```typescript
// Hierarchical tagging
const file = WalrusFile.from(data, {
  identifier: 'user-avatar.jpg',
  tags: {
    // Primary classification
    'type': 'image',
    'subtype': 'avatar',
    
    // User context
    'user-id': 'user123',
    'user-tier': 'premium',
    
    // Technical metadata
    'format': 'jpeg',
    'size': 'thumbnail',
    'version': '2.0',
    
    // Business logic
    'visibility': 'public',
    'moderation-status': 'approved'
  }
});
```

### 3. **Error Handling**
```typescript
import { RetryableWalrusClientError } from '@mysten/walrus';

async function safeQuiltUpload(files: WalrusFile[]) {
  try {
    return await walrusClient.writeFiles({
      files,
      epochs: 10,
      deletable: true,
      signer: keypair
    });
  } catch (error) {
    if (error instanceof RetryableWalrusClientError) {
      console.warn('Network issue, retrying...');
      walrusClient.reset();
      return await walrusClient.writeFiles({
        files,
        epochs: 10,
        deletable: true,
        signer: keypair
      });
    }
    throw error;
  }
}
```

### 4. **Performance Optimization**
The current quilt encoding is less efficient for single files, so writing multiple files together is recommended when possible.

```typescript
// Efficient: Batch multiple files
const batchSize = 100;
const batches = chunk(allFiles, batchSize);

for (const batch of batches) {
  await walrusClient.writeFiles({
    files: batch,
    epochs: 10,
    deletable: true,
    signer: keypair
  });
}

// Less efficient: Single file uploads
// Avoid this pattern with Quilt
for (const file of allFiles) {
  await walrusClient.writeFiles({
    files: [file], // Single file - not optimal for Quilt
    epochs: 10,
    deletable: true,
    signer: keypair
  });
}
```

### 5. **Cost Management**
```typescript
// Estimate costs before upload
const estimatedSize = files.reduce((total, file) => 
  total + file.data().length, 0);

console.log(`Estimated encoded size: ${estimatedSize * 5} bytes`);
console.log(`Files in batch: ${files.length}`);
console.log(`Shared metadata savings: ~${files.length * 64}MB`);

// Use appropriate epoch lengths
const shortTermData = { epochs: 5 };   // Logs, temp files
const mediumTermData = { epochs: 50 }; // User content
const longTermData = { epochs: 200 };  // NFTs, archives
```

## Migration Guide

### From Individual Blobs to Quilt

#### Before (Individual Storage)
```typescript
// Old approach - individual blob storage
const results = [];
for (const file of files) {
  const result = await walrusClient.writeBlob({
    data: await file.arrayBuffer(),
    epochs: 10,
    deletable: true,
    signer: keypair
  });
  results.push(result);
}
```

#### After (Quilt Batching)
```typescript
// New approach - Quilt batching
const walrusFiles = files.map(file => 
  WalrusFile.from(file, {
    identifier: file.name,
    tags: extractMetadata(file)
  })
);

const results = await walrusClient.writeFiles({
  files: walrusFiles,
  epochs: 10,
  deletable: true,
  signer: keypair
});
```

### Migration Checklist
- [ ] Identify files suitable for batching
- [ ] Define tagging strategy
- [ ] Update file access patterns
- [ ] Test with small batches first
- [ ] Monitor cost savings
- [ ] Update documentation

## Troubleshooting

### Common Issues

#### 1. **Single File Inefficiency**
**Problem**: The current quilt encoding is less efficient for single files

**Solution**: Always batch multiple files together when using Quilt.

#### 2. **Tag Query Performance**
**Problem**: Slow file retrieval with complex tag queries

**Solution**: Use indexed tags and limit query complexity
```typescript
// Efficient: Simple tag matching
const files = await blob.files({ 
  tags: [{ 'user-id': 'user123' }] 
});

// Less efficient: Complex nested queries
// Avoid overly complex tag combinations
```

#### 3. **Batch Size Optimization**
**Problem**: Uncertain about optimal batch sizes

**Solution**: Start with 50-100 files per batch and monitor performance
```typescript
const optimalBatchSize = 100; // Good starting point
const maxBatchSize = 660;     // Maximum supported

// Adjust based on file sizes and access patterns
const batchSize = avgFileSize < 10000 ? 200 : 50;
```

#### 4. **Access Pattern Mismatch**
**Problem**: Files batched together but accessed separately

**Solution**: Group files by access patterns
```typescript
// Good: Files accessed together
const userSessionFiles = getUserSessionData(userId, sessionId);

// Better: Related content
const nftCollectionBatch = getNftsByCollection(collectionId);
```

### SDK Version Compatibility
- **Minimum version**: `@mysten/walrus@0.6.0`
- **Recommended**: `@mysten/walrus@0.6.4` or later
- **Quilt support**: Available since version 0.6.0

### Network Configuration
```typescript
// Testnet (development)
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});

// Mainnet (production)
const walrusClient = new WalrusClient({
  network: 'mainnet',
  suiClient,
});
```

## Future Roadmap

Future versions of the SDK may optimize how files are stored to be more efficient by splitting files into multiple quilts.

### Planned Improvements
- **Smart batch splitting**: Automatic optimization across multiple Quilts
- **Enhanced querying**: More sophisticated tag-based searches  
- **Compression**: Built-in compression for text-based files
- **Streaming access**: Efficient streaming of large batched files

### Community Feedback
The Walrus team has planned initiatives to reduce costs for all blob sizes by making metadata smaller, as well as further improving the efficiency of Quilt for small blob storage.

---

**Quilt represents a major advancement in decentralized storage efficiency**, making it economically viable to store large volumes of small files while maintaining the performance and accessibility that modern applications require. By leveraging Quilt's batching capabilities, developers can achieve dramatic cost savings while simplifying their data management architecture.
# Complete Guide to @mysten/walrus Package

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Core Classes & APIs](#core-classes--apis)
4. [Basic Setup](#basic-setup)
5. [Configuration Options](#configuration-options)
6. [File Operations (WalrusFile API)](#file-operations-walrusfile-api)
7. [Blob Operations (Direct API)](#blob-operations-direct-api)
8. [Advanced Features](#advanced-features)
9. [Error Handling](#error-handling)
10. [Performance Considerations](#performance-considerations)
11. [Environment Configuration](#environment-configuration)
12. [Best Practices](#best-practices)
13. [Examples](#examples)

## Overview

The **@mysten/walrus** package is the official TypeScript SDK for interacting with Walrus, a decentralized storage and data availability protocol. The SDK provides high-level abstractions for storing and retrieving data while handling the complexities of the underlying storage network.

### Key Features
- **High-level file operations** with WalrusFile API
- **Direct blob storage** and retrieval
- **Quilt batching support** for efficient small file storage
- **Upload relay integration** for reduced client complexity
- **Automatic retry logic** and error recovery
- **WASM-based encoding/decoding** for optimal performance

## Installation

```bash
npm install --save @mysten/walrus @mysten/sui
```

### Dependencies
The Walrus SDK requires the Sui TypeScript SDK as a peer dependency:
- `@mysten/walrus` - Core Walrus functionality
- `@mysten/sui` - Sui blockchain integration

## Core Classes & APIs

### Primary Classes

#### 1. **WalrusClient**
The main client class for interacting with Walrus storage.

#### 2. **WalrusFile**
High-level abstraction for file operations, similar to the fetch API Response object.

#### 3. **WalrusBlob**
Lower-level blob handling, particularly useful for Quilt operations.

### API Levels

The SDK provides two levels of abstraction:

1. **High-Level API**: `WalrusFile` operations for easy file handling
2. **Low-Level API**: Direct blob operations for advanced use cases

## Basic Setup

### Simple Configuration

```typescript
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';

// Create Sui client
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
});

// Create Walrus client
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
});
```

### Network Support

The walrus SDK currently includes all the relevant package and object IDs needed for connecting to testnet.

**Supported Networks:**
- `testnet` - Walrus testnet (built-in configuration)
- Custom networks (manual configuration required)

## Configuration Options

### Manual Network Configuration

You can manually configure the walrusClient to use a different set of ids, allowing you to connect to a different network or updated deployment of the walrus contracts:

```typescript
const walrusClient = new WalrusClient({
  suiClient,
  packageConfig: {
    systemObjectId: '0x98ebc47370603fe81d9e15491b2f1443d619d1dab720d586e429ed233e1255c1',
    stakingPoolId: '0x20266a17b4f1a216727f3eef5772f8d486a9e3b5e319af80a5b75809c035561d',
  },
});
```

### Custom Fetch Configuration

For some environments you may need to customize how data is fetched:

```typescript
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  storageNodeClientOptions: {
    fetch: (url, options) => {
      console.log('fetching', url);
      return fetch(url, options);
    },
    timeout: 60_000,
  },
});
```

This can be used to implement a fetch function with custom timeouts, rate limits, retry logic, or any other desired behavior.

### Advanced HTTP Configuration

```typescript
import type { RequestInfo, RequestInit } from 'undici';
import { Agent, fetch, setGlobalDispatcher } from 'undici';

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  storageNodeClientOptions: {
    timeout: 60_000,
    fetch: (url, init) => {
      return fetch(url as RequestInfo, {
        ...(init as RequestInit),
        dispatcher: new Agent({
          connectTimeout: 60_000,
        }),
      }) as unknown as Promise<Response>;
    },
  },
});
```

## File Operations (WalrusFile API)

The WalrusFile API provides a higher level abstraction so that applications don't need to worry about how data is stored in walrus. Today it handles data stored directly in blobs, and data stored in Quilts, but may be expanded to cover other storage patterns in the future.

### Reading Files

#### Reading by ID
To read files, you can use the getFiles method. This method accepts both Blob IDs and Quilt IDs, and will return a WalrusFile.

```typescript
// Read single or multiple files
const [file1, file2] = await walrusClient.getFiles({ 
  ids: [blobId1, quiltId2] 
});
```

**Performance Tip**: It is encouraged to always read files in batches when possible, which will allow the client to be more efficient when loading multiple files from the same quilt.

#### Working with WalrusFile

A WalrusFile works like a Response object from the fetch API:

```typescript
// Get contents as a Uint8Array
const bytes = await file1.bytes();

// Parse the contents as a UTF-8 string
const text = await file1.text();

// Parse the contents as JSON
const json = await file2.json();
```

#### File Metadata

A WalrusFile may also have identifier and tags properties if the file was stored in a quilt:

```typescript
const identifier: string | null = await file1.getIdentifier();
const tags: Record<string, string> = await file1.getTags();
```

### Working with Quilts (Batched Files)

#### Getting Blob for Quilt Operations

```typescript
const blob = await walrusClient.getBlob({ blobId });
```

#### Reading Files from Quilts

If the blob is a quilt, you can read the files in the quilt:

```typescript
// Get all files
const files = await blob.files();

// Get files by identifier
const [readme] = await blob.files({ identifiers: ['README.md'] });

// Get files by tag
const textFiles = await blob.files({ 
  tags: [{ 'content-type': 'text/plain' }] 
});

// Get files by quilt id
const filesById = await blob.files({ ids: [quiltID] });
```

### Creating WalrusFile Objects

You can also construct a WalrusFile from a Uint8Array, Blob, or a string which can then be stored on walrus:

```typescript
// From Uint8Array
const file1 = WalrusFile.from(new Uint8Array([1, 2, 3]));

// From Blob
const file2 = WalrusFile.from(new Blob([new Uint8Array([1, 2, 3])]));

// From string with metadata
const file3 = WalrusFile.from('Hello from the TS SDK!!!\n', {
  identifier: 'README.md',
  tags: {
    'content-type': 'text/plain',
  },
});
```

### Writing Files

#### Simple File Upload

Once you have your files you can use the writeFiles method to write them to walrus. Along with the files, you will also need to provide a Signer instance that signs and pays for the transaction/storage fees:

```typescript
const results: {
  id: string;
  blobId: string;
  blobObject: Blob.$inferType;
}[] = await walrusClient.writeFiles({
  files: [file1, file2, file3],
  epochs: 3,
  deletable: true,
  signer: keypair,
});
```

**Important Notes:**
- Currently the provided files will all be written into a single quilt
- Future versions of the SDK may optimize how files are stored to be more efficient by splitting files into multiple quilts
- The current quilt encoding is less efficient for single files, so writing multiple files together is recommended when possible

#### Cost Considerations

The exact costs will depend on the size of the blobs, as well as the current gas and storage prices. The Signer's address will need to have:
- Sufficient **SUI** to cover transactions that register and certify the blob
- Sufficient **WAL** to pay for storage for the specified number of epochs
- Additional **WAL** for the write fee

### Browser-Friendly Upload Flow

When the transactions to upload a blob are signed by a wallet in a browser, some wallets will use popups to prompt the user for a signature. If the popups are not opened in direct response to a user interaction, they may be blocked by the browser.

#### Multi-Step Upload Process

The client.writeFilesFlow method returns an object with a set of methods that break the write flow into several smaller steps:

```typescript
// Step 1: Create and encode the flow
const flow = walrusClient.writeFilesFlow({
  files: [
    WalrusFile.from({
      contents: new Uint8Array(fileData),
      identifier: 'my-file.txt',
    }),
  ],
  epochs: 3,
  owner: currentAccount.address,
  deletable: true,
});

await flow.encode();

// Step 2: Register the blob (user interaction required)
async function handleRegister() {
  const registerTx = flow.register();
  await signAndExecuteTransaction({ transaction: registerTx });
  
  // Step 3: Upload to storage nodes
  await flow.upload();
}

// Step 4: Certify the blob (user interaction required)
async function handleCertify() {
  const certifyTx = flow.certify();
  await signAndExecuteTransaction({ transaction: certifyTx });
  
  // Step 5: Get the uploaded files
  const files = await flow.listFiles();
  console.log('Uploaded files', files);
}
```

#### Flow Methods

- **`encode`** - Encodes the files and generates a blobId
- **`register`** - Returns a transaction that will register the blob on-chain
- **`upload`** - Uploads the data to storage nodes
- **`certify`** - Returns a transaction that will certify the blob on-chain
- **`listFiles`** - Returns a list of the created files

## Blob Operations (Direct API)

In case you do not want to use the WalrusFile abstractions, you can use the readBlob and writeBlob APIs directly.

### Reading Blobs

The readBlob method will read a blob given the blobId and return Uint8Array containing the blobs content:

```typescript
const blob = await walrusClient.readBlob({ blobId });
```

### Writing Blobs

The writeBlob method can be used to write a blob (as a Uint8Array) to walrus:

```typescript
const file = new TextEncoder().encode('Hello from the TS SDK!!!\n');

const { blobId } = await walrusClient.writeBlob({
  blob: file,
  deletable: false,
  epochs: 3,
  signer: keypair,
});
```

#### Parameters

- **`blob`** - Uint8Array containing the data to store
- **`deletable`** - Whether the blob can be deleted later
- **`epochs`** - How long the blob should be stored for
- **`signer`** - Keypair or signer for transactions

## Advanced Features

### Upload Relay Integration

Writing blobs directly from a client requires a lot of requests to write data to all of the storage nodes. An upload relay can be used to offload the work of these writes to a server, reducing complexity for the client.

#### Basic Upload Relay Configuration

```typescript
const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  WalrusClient.experimental_asClientExtension({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        max: 1_000,
      },
    },
  }),
);
```

#### Upload Relay Tipping

Upload relays may require a tip to be included to cover the cost of writing the blob. You can configure a maximum tip (paid in MIST).

##### Constant Tip
A const will send a fixed amount for each blob written to the upload relay:

```typescript
const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  WalrusClient.experimental_asClientExtension({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        address: '0x123...',
        kind: {
          const: 105,
        },
      },
    },
  }),
);
```

##### Linear Tip
A linear tip will send a fixed amount for each blob written to the fan out proxy, plus a multiplier based on the size of the blob:

```typescript
const client = new SuiClient({
  url: getFullnodeUrl('testnet'),
  network: 'testnet',
}).$extend(
  WalrusClient.experimental_asClientExtension({
    uploadRelay: {
      host: 'https://upload-relay.testnet.walrus.space',
      sendTip: {
        address: '0x123...',
        kind: {
          linear: {
            base: 105,
            multiplier: 10,
          },
        },
      },
    },
  }),
);
```

#### Tip Configuration Discovery

The tip required by an upload relay can be found using the tip-config endpoint: (eg. https://upload-relay.testnet.walrus.space/v1/tip-config).

## Error Handling

### Retryable Errors

The SDK exports all the error classes for different types of errors that can be thrown. Walrus is a fault tolerant distributed system, where many types of errors can be recovered from. During epoch changes there may be times when the data cached in the WalrusClient can become invalid.

```typescript
import { RetryableWalrusClientError } from '@mysten/walrus';

try {
  const blob = await walrusClient.readBlob({ blobId });
} catch (error) {
  if (error instanceof RetryableWalrusClientError) {
    walrusClient.reset();
    /* retry your operation */
    const blob = await walrusClient.readBlob({ blobId });
  } else {
    throw error;
  }
}
```

**Important**: RetryableWalrusClientError are not guaranteed to succeed after resetting the client and retrying, but this pattern can be used to handle some edge cases.

### Automatic Error Handling

High level methods like readBlob already handle various error cases and will automatically retry when hitting these methods, as well as handling cases where only a subset of nodes need to respond successfully to read or publish a blob.

### Debugging Network Errors

You can pass an onError option in the storageNodeClientOptions to get the individual errors from failed requests:

```typescript
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  storageNodeClientOptions: {
    onError: (error) => console.log(error),
  },
});
```

When trying to troubleshoot problems, it can be challenging to figure out what's going wrong when you don't see all the individual network errors. The onError callback helps with debugging.

### Error Resilience Design

When using the lower level methods to build your own read or publish flows, it is recommended to:
- Understand the number of shards/slivers that need to be successfully written or read
- Gracefully handle cases where some nodes may be in a bad state
- Walrus is designed to handle some nodes being down
- The SDK will only throw errors when it can't read from or write to enough storage nodes

## Performance Considerations

### Request Volume

The walrus SDK is designed primarily to be used to build aggregators and publishers, and may not be optimal when used directly in client side apps. Reading and writing directly from storage nodes requires a lot of requests (~2200 to write a blob, ~335 to read a blob).

**Recommendation**: For most apps, using aggregators and publishers with optimized reads/writes will provide a better user experience.

### Request Handling

Reading and writing blobs directly from storage nodes requires a lot of requests. The walrus SDK will issue all requests needed to complete these operations, but does not handling all the complexities a robust aggregator or publisher might encounter.

By default all requests are issued using the global fetch for whatever runtime the SDK is running in. This will not impose any limitations on concurrency, and will be subject to default timeouts and behavior defined by your runtime.

### Batch Operations

For optimal performance:
- Always read files in batches when possible for Quilt operations
- Write multiple files together when using Quilt (more efficient than single files)
- Consider using upload relays for high-volume upload scenarios

## Environment Configuration

### WASM Bindings

The walrus SDK requires wasm bindings to encode and decode blobs. When running in node or bun and some bundlers this will work without any additional configuration.

#### Vite Configuration

In vite you can get the url for the wasm bindings by importing the wasm file with a ?url suffix:

```typescript
import walrusWasmUrl from '@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url';

const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  wasmUrl: walrusWasmUrl,
});
```

#### CDN or Self-Hosted WASM

If you are unable to get a url for the wasm file in your bundler or build system, you can self host the wasm bindings, or load them from a CDN:

```typescript
const walrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
});
```

#### Next.js Configuration

In next.js when using walrus in API routes, you may need to tell next.js to skip bundling for the walrus packages:

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  serverExternalPackages: ['@mysten/walrus', '@mysten/walrus-wasm'],
};
```

### Runtime-Specific Considerations

#### Bun Runtime
In bun, the abort signal will stop requests from responding, but they still wait for completion before their promises reject.

## Best Practices

### 1. **Use Appropriate API Level**
- **High-level WalrusFile API**: For most application needs
- **Low-level blob API**: For advanced use cases requiring fine control

### 2. **Optimize for Batch Operations**
```typescript
// Good: Batch file reads
const files = await walrusClient.getFiles({ ids: [id1, id2, id3] });

// Less optimal: Individual reads
const file1 = await walrusClient.getFiles({ ids: [id1] });
const file2 = await walrusClient.getFiles({ ids: [id2] });
```

### 3. **Handle Errors Gracefully**
```typescript
async function robustBlobRead(blobId: string, maxRetries = 3): Promise<Uint8Array> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await walrusClient.readBlob({ blobId });
    } catch (error) {
      if (error instanceof RetryableWalrusClientError && attempt < maxRetries - 1) {
        console.warn(`Attempt ${attempt + 1} failed, retrying...`);
        walrusClient.reset();
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Failed to read blob after ${maxRetries} attempts`);
}
```

### 4. **Manage Wallet Interactions**
```typescript
// Browser-friendly upload with proper user interaction handling
async function uploadWithUserInteraction(files: WalrusFile[]) {
  const flow = walrusClient.writeFilesFlow({
    files,
    epochs: 3,
    owner: userAddress,
    deletable: true,
  });

  // Pre-encode (no user interaction required)
  await flow.encode();

  // Register step (user interaction)
  const registerButton = document.getElementById('register-btn');
  registerButton?.addEventListener('click', async () => {
    const registerTx = flow.register();
    await wallet.signAndExecuteTransaction({ transaction: registerTx });
    await flow.upload(); // Can happen immediately after register
    
    // Enable certify button
    document.getElementById('certify-btn')?.removeAttribute('disabled');
  });

  // Certify step (separate user interaction)
  const certifyButton = document.getElementById('certify-btn');
  certifyButton?.addEventListener('click', async () => {
    const certifyTx = flow.certify();
    await wallet.signAndExecuteTransaction({ transaction: certifyTx });
    const uploadedFiles = await flow.listFiles();
    console.log('Upload complete:', uploadedFiles);
  });
}
```

### 5. **File Organization Best Practices**
```typescript
// Good: Organized file creation with meaningful tags
const files = documents.map((doc, index) => 
  WalrusFile.from(doc.content, {
    identifier: `document_${index}.${doc.extension}`,
    tags: {
      'content-type': doc.mimeType,
      'category': doc.category,
      'created-date': doc.createdAt,
      'version': '1.0',
      'user-id': doc.userId
    }
  })
);

// Efficient batch upload
const results = await walrusClient.writeFiles({
  files,
  epochs: 10,
  deletable: true,
  signer: keypair
});
```

### 6. **Development vs Production**
```typescript
// Development configuration with debugging
const devWalrusClient = new WalrusClient({
  network: 'testnet',
  suiClient,
  storageNodeClientOptions: {
    timeout: 30_000,
    onError: (error) => console.error('Storage node error:', error),
    fetch: (url, options) => {
      console.log('Walrus request:', url);
      return fetch(url, options);
    }
  },
});

// Production configuration
const prodWalrusClient = new WalrusClient({
  network: 'mainnet',
  suiClient,
  storageNodeClientOptions: {
    timeout: 60_000,
    // Custom fetch with retry logic, rate limiting, etc.
    fetch: productionFetchWithRetries,
  },
});
```

## Examples

### Complete File Upload Example

```typescript
import { WalrusClient, WalrusFile } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function uploadDocuments() {
  // Setup
  const suiClient = new SuiClient({
    url: getFullnodeUrl('testnet'),
  });

  const walrusClient = new WalrusClient({
    network: 'testnet',
    suiClient,
  });

  const keypair = Ed25519Keypair.generate();

  // Create files
  const files = [
    WalrusFile.from('# README\n\nThis is a test document.', {
      identifier: 'README.md',
      tags: {
        'content-type': 'text/markdown',
        'category': 'documentation'
      }
    }),
    WalrusFile.from(JSON.stringify({ name: 'config', version: '1.0' }), {
      identifier: 'config.json',
      tags: {
        'content-type': 'application/json',
        'category': 'configuration'
      }
    })
  ];

  try {
    // Upload files
    const results = await walrusClient.writeFiles({
      files,
      epochs: 5,
      deletable: true,
      signer: keypair,
    });

    console.log('Upload successful:', results);
    return results;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
}
```

### File Reading and Processing Example

```typescript
async function processStoredFiles(blobId: string) {
  try {
    // Get the blob (could be individual file or quilt)
    const blob = await walrusClient.getBlob({ blobId });
    
    // Check if it's a quilt with multiple files
    const files = await blob.files();
    
    if (files.length > 1) {
      console.log('Processing quilt with', files.length, 'files');
      
      // Process each file based on its type
      for (const file of files) {
        const identifier = await file.getIdentifier();
        const tags = await file.getTags();
        
        console.log(`Processing file: ${identifier}`);
        
        if (tags['content-type'] === 'application/json') {
          const jsonData = await file.json();
          console.log('JSON content:', jsonData);
        } else if (tags['content-type']?.startsWith('text/')) {
          const textContent = await file.text();
          console.log('Text content:', textContent);
        } else {
          const binaryData = await file.bytes();
          console.log('Binary data size:', binaryData.length, 'bytes');
        }
      }
    } else {
      // Single file
      const [singleFile] = files;
      const content = await singleFile.text();
      console.log('Single file content:', content);
    }
  } catch (error) {
    console.error('Failed to process files:', error);
  }
}
```

For a complete overview of the available methods on the WalrusClient you can reference [TypeDocs](http://sdk.mystenlabs.com/typedoc/classes/_mysten_walrus.WalrusClient.html).

There are a number of simple [examples you can reference](https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus/examples) in the ts-sdks repo that show things like building simple aggregators and publishers with the walrus SDK.

---

The **@mysten/walrus** package provides a comprehensive and developer-friendly interface to the Walrus decentralized storage network, with both high-level abstractions for common use cases and low-level APIs for advanced scenarios. By following the patterns and best practices outlined in this guide, developers can build robust applications that leverage decentralized storage effectively.
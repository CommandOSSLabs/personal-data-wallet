# Walrus Quilts Documentation

## Overview

Quilts are a higher-level abstraction in the Walrus SDK that allow storing multiple related files together with metadata. Unlike regular blobs which store raw binary data, Quilts provide a structured way to group files with identifiers and tags.

## Key Concepts

### What is a Quilt?

A Quilt is a special storage format in Walrus that:
- Groups multiple files into a single storage unit
- Preserves individual file identities through identifiers
- Supports metadata via tags (key-value pairs)
- Optimizes storage and retrieval of related content

### Quilt vs Blob

| Feature | Blob | Quilt |
|---------|------|-------|
| Content Type | Single binary data | Multiple files |
| Metadata | Limited | Rich (identifiers + tags) |
| File Identity | No | Yes (via identifiers) |
| Use Case | Single large files | Related file collections |
| Efficiency | Better for single files | Better for multiple files |

## Core Components

### 1. WalrusFile

The building block of Quilts. Each file in a Quilt is a WalrusFile instance.

```typescript
import { WalrusFile } from '@mysten/walrus';

// Create a WalrusFile with identifier and tags
const file = WalrusFile.from('File content here', {
  identifier: 'filename.txt',  // Optional: identifies file within Quilt
  tags: {                      // Optional: metadata as key-value pairs
    'content-type': 'text/plain',
    'version': '1.0.0',
    'author': 'system'
  }
});
```

### 2. File Methods

WalrusFile provides several methods for reading content:

```typescript
// Get content as bytes
const bytes: Uint8Array = await file.bytes();

// Get content as text
const text: string = await file.text();

// Parse content as JSON
const data: any = await file.json();

// Get file metadata
const identifier = file.getIdentifier();
const tags = file.getTags();
```

## Writing Quilts

### Basic Write Operation

```typescript
const files = [
  WalrusFile.from('README content', {
    identifier: 'README.md',
    tags: { 'content-type': 'text/markdown' }
  }),
  WalrusFile.from(JSON.stringify(config), {
    identifier: 'config.json',
    tags: { 'content-type': 'application/json' }
  })
];

const result = await walrusClient.writeFiles({
  files: files,
  epochs: 5,        // Number of epochs to store
  deletable: true,  // Whether files can be deleted
  signer: keypair   // Transaction signer
});
```

### Write Options

| Option | Type | Description |
|--------|------|-------------|
| `files` | WalrusFile[] | Array of files to store |
| `epochs` | number | Storage duration in epochs |
| `deletable` | boolean | Allow future deletion |
| `signer` | Signer | Keypair for signing transaction |
| `owner` | string (optional) | Destination address |
| `attributes` | Record (optional) | Additional metadata |

## Reading Quilts

### Retrieve Files from Quilt

```typescript
// Get files by Quilt ID
const files = await walrusClient.getFiles({ 
  ids: [quiltId] 
});

// Process each file
for (const file of files) {
  const identifier = file.getIdentifier();
  const content = await file.text();
  const tags = file.getTags();
  
  console.log(`File: ${identifier}`);
  console.log(`Tags:`, tags);
  console.log(`Content:`, content);
}
```

## Advanced Features

### Manual Quilt Encoding

The `encodeQuilt` function provides low-level control:

```typescript
import { encodeQuilt } from '@mysten/walrus';

const { index, quilt } = encodeQuilt({
  files: [
    {
      contents: new TextEncoder().encode('Content 1'),
      identifier: 'file1.txt',
      tags: { type: 'text' }
    },
    {
      contents: new TextEncoder().encode('Content 2'),
      identifier: 'file2.txt',
      tags: { type: 'text' }
    }
  ]
});

// Returns:
// - index: Metadata about file positions and properties
// - quilt: Uint8Array containing the encoded data
```

### Quilt Index Structure

The index returned by `encodeQuilt` contains:
```typescript
{
  patches: Array<{
    startIndex: number;    // Start position in quilt
    endIndex: number;      // End position in quilt
    identifier: string;    // File identifier
    tags: Map<string, string> | Record<string, string>
  }>
}
```

## Use Cases in Personal Data Wallet

### 1. Memory Storage

Store memory components together:
```typescript
const memoryQuilt = [
  WalrusFile.from(memoryContent, {
    identifier: 'content.txt',
    tags: { type: 'memory', timestamp: Date.now().toString() }
  }),
  WalrusFile.from(JSON.stringify(embedding), {
    identifier: 'embedding.json',
    tags: { type: 'vector', dimensions: '1536' }
  }),
  WalrusFile.from(JSON.stringify(metadata), {
    identifier: 'metadata.json',
    tags: { type: 'metadata' }
  })
];
```

### 2. Chat Session Archives

Bundle chat messages with context:
```typescript
const sessionQuilt = [
  WalrusFile.from(JSON.stringify(messages), {
    identifier: 'messages.json',
    tags: { type: 'chat', session: sessionId }
  }),
  WalrusFile.from(summary, {
    identifier: 'summary.txt',
    tags: { type: 'summary' }
  }),
  WalrusFile.from(JSON.stringify(relatedMemories), {
    identifier: 'context.json',
    tags: { type: 'context' }
  })
];
```

### 3. Multi-Modal Content

Store different content types together:
```typescript
const multiModalQuilt = [
  WalrusFile.from(textContent, {
    identifier: 'description.txt',
    tags: { type: 'text' }
  }),
  WalrusFile.from(imageData, {
    identifier: 'image.png',
    tags: { type: 'image', format: 'png' }
  }),
  WalrusFile.from(JSON.stringify(analysis), {
    identifier: 'analysis.json',
    tags: { type: 'ml-analysis' }
  })
];
```

## Best Practices

### 1. When to Use Quilts

✅ **Use Quilts for:**
- Related files that should be stored/retrieved together
- Files that need rich metadata
- Small to medium collections of files
- Structured data with multiple components

❌ **Use regular blobs for:**
- Single large files
- Binary data without structure
- Performance-critical single file operations

### 2. Identifier Conventions

- Use descriptive, unique identifiers within each Quilt
- Follow naming conventions (e.g., `type.extension`)
- Consider hierarchical naming for complex structures

### 3. Tag Strategy

- Use consistent tag keys across your application
- Include content-type for proper handling
- Add version information for compatibility
- Include timestamps for temporal queries

### 4. Storage Optimization

- Group truly related files together
- Avoid creating Quilts with single files
- Consider file sizes when grouping
- Balance between granularity and efficiency

## Error Handling

```typescript
try {
  const result = await walrusClient.writeFiles({
    files: quiltFiles,
    epochs: 5,
    deletable: true,
    signer: keypair
  });
  
  if (result.error) {
    console.error('Quilt write failed:', result.error);
    // Handle error
  }
} catch (error) {
  if (error instanceof RetryableWalrusClientError) {
    // Retry operation
  } else {
    // Handle non-retryable error
  }
}
```

## Performance Considerations

1. **File Count**: Quilts work best with 2-20 files
2. **File Size**: Individual files should be reasonably sized
3. **Total Size**: Consider network and storage limits
4. **Retrieval**: All files in a Quilt are retrieved together

## Migration from Blobs to Quilts

For existing blob-based storage:

1. **Identify Related Blobs**: Find blobs that are frequently accessed together
2. **Create Migration Strategy**: Plan grouping and metadata addition
3. **Implement Gradual Migration**: Support both formats during transition
4. **Update Access Patterns**: Modify code to use Quilt APIs

## Future Considerations

The Walrus SDK documentation indicates that Quilts are an evolving feature with potential future enhancements:

- More efficient encoding for single files
- Advanced query capabilities
- Improved storage patterns
- Enhanced metadata support

## References

- [Walrus SDK Documentation](https://sdk.mystenlabs.com/walrus)
- [TypeDoc Reference](https://sdk.mystenlabs.com/typedoc/modules/_mysten_walrus.html)
- [WalrusFile Class](https://sdk.mystenlabs.com/typedoc/classes/_mysten_walrus.WalrusFile.html)
- [WalrusClient Methods](https://sdk.mystenlabs.com/typedoc/classes/_mysten_walrus.WalrusClient.html)
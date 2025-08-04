# HNSW Indexer Implementation in Personal Data Wallet

## Overview
The HNSW (Hierarchical Navigable Small World) indexer is a core component of the Personal Data Wallet that enables fast semantic similarity search across stored memories. It uses the `hnswlib-node` library for efficient vector operations.

## Implementation Details

### Location
`backend/src/memory/hnsw-index/hnsw-index.service.ts`

### Key Features

1. **Index Configuration**
   - **Dimensions**: 512 (default) - matches embedding vector size
   - **Max Elements**: 10,000 (default) - configurable capacity
   - **Distance Metric**: Cosine similarity - ideal for semantic search
   - **Framework**: NestJS service with dependency injection

2. **Core Methods**

   - `createIndex(dimensions, maxElements)`: Creates new HNSW index
   - `addVectorToIndex(index, id, vector)`: Adds embedding vector with ID
   - `searchIndex(index, vector, k)`: Finds k nearest neighbors
   - `removeVectorFromIndex(index, id)`: Marks vector for deletion
   - `getIndexSize(index)`: Returns current vector count

3. **Persistence with Walrus**
   - `saveIndex(index)`: Serializes index to buffer and uploads to Walrus
   - `loadIndex(blobId)`: Downloads index from Walrus and reconstructs
   - Files named: `index_[timestamp].hnsw`

### Architecture Integration

1. **Memory Ingestion Flow**
   ```
   User Input → Gemini Embedding (512-dim) → Add to HNSW → Save to Walrus
   ```

2. **Memory Query Flow**
   ```
   Query → Gemini Embedding → HNSW Search → Filter Results → Return Memories
   ```

3. **Storage Strategy**
   - Index kept in-memory during operation
   - Periodic snapshots saved to Walrus
   - Full index serialization (no incremental updates)
   - Index blob ID stored in Sui contract

### Technical Implementation

- Uses `hnswlib-node` package for HNSW operations
- Internal methods use undocumented APIs:
  - `(index as any).getIndexBuffer()` for serialization
  - `(index as any).readIndexFromBuffer(serialized)` for deserialization
- Error handling with NestJS Logger
- Async/await pattern for all I/O operations

### Performance Characteristics

- **Search Complexity**: O(log N) - very fast even with large datasets
- **Memory Usage**: Entire index loaded in RAM
- **Persistence Cost**: Full index snapshot each save
- **Query Speed**: Sub-100ms for typical searches

### Current Limitations

1. No incremental updates - entire index saved each time
2. Single index for all users (filtered by metadata)
3. Fixed dimensions once created
4. No compression of serialized index
5. No version control or rollback capability

### Usage in Memory Services

- **MemoryIngestionService**: Loads index, adds vectors, saves periodically
- **MemoryQueryService**: Loads index, performs similarity searches
- Both services manage index lifecycle and coordinate with Walrus

The HNSW indexer provides the foundation for semantic search capabilities, enabling users to find relevant memories based on meaning rather than exact matches.
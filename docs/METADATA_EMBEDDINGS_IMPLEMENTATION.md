# Metadata Embeddings Implementation Guide

## Overview

This document describes the implementation of vector embeddings for memory metadata in the Personal Data Wallet system. The enhancement converts simple string-based metadata into rich 768-dimensional embeddings that enable advanced search, similarity matching, and knowledge graph construction.

## Architecture Components

### 1. Smart Contract Layer (`memory.move`)

#### MemoryMetadata Struct
```move
public struct MemoryMetadata has drop, store {
    // Content identification
    content_type: String,
    content_size: u64,
    content_hash: String,
    
    // Memory classification
    category: String,
    topic: String,
    importance: u8, // 1-10 scale
    
    // Vector embedding (768 dimensions)
    embedding_blob_id: String, // Points to serialized embedding on Walrus
    embedding_dimension: u64,  // Should be 768 for Gemini embeddings
    
    // Temporal metadata
    created_timestamp: u64,
    updated_timestamp: u64,
    
    // Additional metadata using VecMap (extensible)
    custom_metadata: VecMap<String, String>
}
```

#### Enhanced Memory Struct
- Now includes `metadata: MemoryMetadata` field
- Supports rich metadata alongside content blob references
- Maintains backward compatibility with existing vector_id system

#### New Functions
- `create_memory_metadata()` - Creates metadata with validation
- `create_memory_record()` - Enhanced with metadata parameters
- `update_memory_metadata()` - Updates topic and importance
- `add_custom_metadata()` - Adds extensible key-value pairs

### 2. Backend Services

#### WalrusService Enhancements

**New Interfaces:**
```typescript
interface MemoryMetadata {
  contentType: string;
  contentSize: number;
  contentHash: string;
  category: string;
  topic: string;
  importance: number; // 1-10 scale
  embeddingBlobId?: string;
  embeddingDimension: number;
  createdTimestamp: number;
  updatedTimestamp?: number;
  customMetadata?: Record<string, string>;
}

interface EnhancedUploadResult {
  blobId: string;
  metadata: MemoryMetadata;
  embeddingBlobId?: string;
}
```

**Key Methods:**
- `createMetadataWithEmbedding()` - Generates embeddings from content
- `uploadContentWithMetadata()` - Enhanced upload with metadata
- `retrieveMetadataEmbedding()` - Retrieves embedding vectors
- `getEnhancedMetadata()` - Reconstructs metadata from Walrus tags
- `searchByMetadataEmbedding()` - Similarity search using embeddings

#### MemoryIngestionService Updates

**New Methods:**
- `processEnhancedMemory()` - Processes memories with metadata embeddings
- `searchMemoriesByMetadata()` - Searches using embedding similarity
- `getMetadataInsights()` - Provides analytics on memory metadata

**Enhanced DTOs:**
```typescript
interface EnhancedCreateMemoryDto extends CreateMemoryDto {
  topic: string;
  importance: number;
  customMetadata?: Record<string, string>;
}
```

## Data Flow

### Memory Creation with Metadata Embeddings

1. **Content Input**: User provides memory content, category, topic, importance
2. **Metadata Creation**: WalrusService creates MemoryMetadata struct
3. **Embedding Generation**: EmbeddingService creates 768-dimensional vector from content summary
4. **Embedding Storage**: Embedding stored as JSON blob on Walrus/local storage
5. **Content Upload**: Original content uploaded with enhanced metadata tags
6. **Blockchain Record**: Move contract creates Memory object with embedded metadata
7. **Index Update**: HNSW index updated with both content and metadata vectors

### Metadata Search Flow

1. **Query Input**: User provides search text
2. **Query Embedding**: Generate embedding for search text
3. **Similarity Search**: Compare query embedding with stored metadata embeddings
4. **Result Filtering**: Apply category, importance, and other filters
5. **Content Retrieval**: Decrypt and return matching memory content
6. **Result Ranking**: Sort by similarity scores and metadata relevance

## Storage Strategy

### Embedding Storage Format
```json
{
  "vector": [0.1, 0.2, ...], // 768 float values
  "dimension": 768,
  "source": "metadata",
  "category": "conversation",
  "topic": "AI development",
  "contentHash": "sha256...",
  "timestamp": 1234567890
}
```

### Walrus Tag Structure
```json
{
  "content-type": "text/plain",
  "owner": "0x...",
  "category": "conversation",
  "topic": "AI development",
  "importance": "8",
  "content-hash": "sha256...",
  "embedding-blob-id": "blob123...",
  "embedding-dimension": "768",
  "created": "2024-01-01T00:00:00Z"
}
```

## Integration Points

### Frontend Integration
- Update memory creation forms to include topic and importance
- Add metadata insights dashboard
- Implement embedding-based search UI
- Display metadata enrichment in memory details

### Search Enhancement
- Dual search: content vectors + metadata embeddings
- Weighted scoring combining content similarity and metadata relevance
- Category and importance filtering
- Temporal search using metadata timestamps

### Knowledge Graph Enhancement
- Use metadata embeddings for entity relationship discovery
- Topic-based clustering of memories
- Importance-weighted graph construction
- Cross-category relationship discovery

## Configuration

### Environment Variables
```bash
# Enable metadata embeddings (default: true)
ENABLE_METADATA_EMBEDDINGS=true

# Embedding similarity threshold (default: 0.7)
METADATA_SEARCH_THRESHOLD=0.7

# Max metadata search results (default: 10)
METADATA_SEARCH_LIMIT=10
```

### Move Contract Deployment
Updated contract requires new deployment with extended structs:
```bash
cd smart-contract
sui client publish --gas-budget 50000000
```

## Performance Considerations

### Embedding Generation
- Cached embeddings to avoid regeneration
- Batch processing for multiple memories
- Async processing to avoid blocking user operations

### Storage Optimization
- Compress embedding vectors before storage
- Use local storage fallback for Walrus unavailability
- Implement embedding deduplication for similar content

### Search Performance
- Index metadata embeddings separately from content
- Use approximate nearest neighbor search for large datasets
- Cache frequent search results

## Security & Privacy

### Encryption Strategy
- Content remains SEAL-encrypted
- Metadata embeddings stored in plaintext for searchability
- Content hash provides integrity verification without revealing content

### Access Control
- Metadata embeddings inherit content access permissions
- User-specific embedding spaces
- Admin controls for system-wide embedding management

## Testing Strategy

### Unit Tests
- Metadata creation and validation
- Embedding generation and storage
- Similarity search accuracy
- Error handling for network failures

### Integration Tests
- End-to-end memory creation with metadata
- Cross-service embedding flow
- Walrus storage and retrieval
- Blockchain integration

### Performance Tests
- Embedding generation speed
- Search response times
- Concurrent user handling
- Storage scalability

## Migration Guide

### Existing Memories
1. Identify memories without metadata embeddings
2. Generate embeddings for existing content
3. Update blockchain records with enhanced metadata
4. Rebuild search indices with metadata vectors

### Backward Compatibility
- Legacy memories continue to work with content-only vectors
- Gradual migration during normal memory operations
- Fallback to content search when metadata embeddings unavailable

## Monitoring & Analytics

### Metrics to Track
- Embedding generation success rate
- Search accuracy and relevance scores
- Metadata coverage percentage
- User engagement with metadata features

### Health Checks
- Embedding service availability
- Walrus storage connectivity
- Search index consistency
- Metadata integrity validation

## Future Enhancements

### Advanced Features
- Multi-modal embeddings (text + images)
- Hierarchical topic classification
- Temporal embedding evolution
- Cross-user similarity (privacy-preserving)

### Optimization Opportunities
- Vector database integration (Pinecone, Weaviate)
- Distributed embedding computation
- Real-time embedding updates
- Federated search across users

## Troubleshooting

### Common Issues
1. **Embedding Generation Fails**: Check EmbeddingService availability and API keys
2. **Search Returns No Results**: Verify embedding storage and similarity thresholds
3. **High Latency**: Optimize embedding computation and storage access
4. **Memory Bloat**: Monitor embedding cache sizes and implement cleanup

### Debug Commands
```bash
# Check embedding generation
curl -X POST /api/memory/test-embedding -d '{"text": "test content"}'

# Verify metadata storage
curl /api/memory/metadata/{blobId}

# Test search functionality
curl -X POST /api/memory/search-metadata -d '{"query": "AI", "userAddress": "0x..."}'
```

This implementation provides a robust foundation for metadata-driven memory search while maintaining system reliability and user privacy.
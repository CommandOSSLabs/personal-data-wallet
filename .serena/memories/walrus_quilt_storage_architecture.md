# Walrus-Quilt Storage Architecture for Vector Embeddings

## Overview
Our Personal Data Wallet will use **Walrus-Quilt** as the primary storage layer for vector embeddings and metadata, implementing a sophisticated memory layer database stored on decentralized infrastructure.

## Key Architecture Components

### 1. **Walrus Decentralized Storage**
- **Purpose**: High-integrity, decentralized blob storage with 4.5x replication factor
- **Technology**: RedStuff protocol with two-dimensional erasure coding
- **Integration**: Built on Sui blockchain for coordination and payments
- **Cost**: ~5x blob size overhead (significantly more efficient than full replication)

### 2. **Quilt Batch Storage Optimization**
- **Purpose**: Optimize storage of small vector embedding files and metadata
- **Capacity**: Up to 666 blobs per quilt unit
- **Cost Savings**: 
  - **Walrus Storage**: Up to 409x savings for 10KB files
  - **Sui Gas Fees**: Up to 238x reduction in computation costs
- **Individual Access**: Retrieve specific blobs without downloading entire quilt

### 3. **Vector Embedding Storage Format**
```
Quilt Structure:
├── Vector Embeddings (encrypted via Seal)
│   ├── blob_id: content-addressable identifier
│   ├── QuiltPatchId: unique ID within quilt
│   └── metadata: blob metadata and tags
├── HNSW Index Files (serialized)
│   ├── index.hnsw: hierarchical navigable small world index
│   ├── index.meta: metadata and configuration
│   └── sharded_indices: for massive scale (billions of vectors)
└── Blob Metadata
    ├── identifier: unique name within quilt
    ├── tags: key-value pairs for filtering
    └── Walrus-native metadata: immutable, stored with blob
```

## Current Implementation Status

### ✅ **Implemented Components**
1. **WalrusClient** (`backend/services/walrus_client.py`)
   - Basic blob storage/retrieval (currently mocked)
   - Vector index storage methods
   - Knowledge graph storage methods

2. **VectorStore** (`backend/services/vector_store.py`)
   - HNSW index with hnswlib
   - Cosine similarity search
   - Batch embedding operations
   - File serialization (.hnsw + .meta files)

### 🚧 **Integration Architecture Plan**

#### **Phase 1: Basic Walrus-Quilt Integration**
```python
# Enhanced WalrusClient with Quilt support
class WalrusClient:
    async def store_embedding_quilt(self, embeddings: List[EmbeddingData]) -> QuiltResponse
    async def retrieve_embedding_by_patch_id(self, patch_id: str) -> EmbeddingData
    async def store_hnsw_index_quilt(self, index_files: Dict[str, bytes]) -> str
```

#### **Phase 2: Vector Database on Walrus**
```
Memory Layer Database Architecture:
┌─────────────────────────────────────────────────────────┐
│                    Sui Control Plane                   │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Vector Index    │  │ Ownership & Access Control      │ │
│  │ Contract        │  │ (Seal Integration)              │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Walrus Data Plane                       │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │ Encrypted   │  │ HNSW Index   │  │ Metadata Quilt  │ │
│  │ Embeddings  │  │ Quilt        │  │ (searchable)    │ │
│  │ Quilt       │  │              │  │                 │ │
│  └─────────────┘  └──────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Off-Chain Compute Plane                    │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Indexer &       │  │ Query Processing                │ │
│  │ Query Node      │  │ (HNSW Search)                   │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Walrus-Quilt API Integration

### **Storage Operations**
```bash
# Store embeddings as quilt
curl -X PUT "$PUBLISHER/v1/quilts?epochs=5" \
  -F "embedding_001=@vector_001.bin" \
  -F "embedding_002=@vector_002.bin" \
  -F '_metadata=[
    {"identifier": "embedding_001", "tags": {"user": "alice", "category": "text"}},
    {"identifier": "embedding_002", "tags": {"user": "bob", "category": "image"}}
  ]'

# Store HNSW index files as quilt  
curl -X PUT "$PUBLISHER/v1/quilts?epochs=100" \
  -F "index.hnsw=@hnsw_index.hnsw" \
  -F "index.meta=@hnsw_index.meta" \
  -F "shard_001.hnsw=@shard_001.hnsw"
```

### **Retrieval Operations**
```bash
# Retrieve by quilt patch ID
curl "$AGGREGATOR/v1/blobs/by-quilt-patch-id/<patch-id>"

# Retrieve by quilt ID and identifier
curl "$AGGREGATOR/v1/blobs/by-quilt-id/<quilt-id>/embedding_001"

# List all patches in quilt
walrus list-patches-in-quilt <quilt-id>
```

## Implementation Strategy

### **Immediate Next Steps**
1. **Upgrade WalrusClient** with real Walrus HTTP API integration
2. **Implement Quilt Storage** for vector embeddings and HNSW indices
3. **Add Metadata Management** with tags for efficient querying
4. **Integrate with Current VectorStore** to serialize/deserialize via Walrus

### **Advanced Features (Future)**
1. **Seal Encryption Integration** for private vector embeddings
2. **Sharded Index Management** for billion-scale vector search
3. **Automatic Cost Optimization** using Quilt batch strategies
4. **Cross-Quilt Search** with distributed HNSW indices

## Cost Benefits Analysis

### **Traditional Storage vs Walrus-Quilt**
- **10KB Vector Embeddings**: 409x cost reduction when batched
- **HNSW Index Files**: Massive savings for multi-file index structures  
- **Sui Gas Fees**: 238x reduction in blockchain transaction costs
- **Operational Efficiency**: Single API for managing hundreds of related files

### **Scalability Targets**
- **Current**: Thousands of embeddings per user
- **Phase 1**: Millions of embeddings with sharded indices
- **Phase 2**: Billions of embeddings across distributed quilts
- **Phase 3**: Cross-user embedding marketplace with privacy preservation

## Security & Privacy Considerations

### **Public Data Warning**
- All Walrus blobs are **public and discoverable**
- **Encryption required** for sensitive vector embeddings
- **Seal integration** provides programmable access control

### **Privacy-Preserving Architecture**
1. **Metadata Search**: Fast search on public, non-sensitive metadata
2. **Secure Retrieval**: Encrypted embedding access via Seal protocol
3. **On-Chain Verification**: Sui smart contracts enforce access policies
4. **Decentralized Trust**: Threshold encryption across multiple key servers

This architecture enables a decentralized, cost-effective, and scalable vector database that maintains user sovereignty while providing enterprise-grade performance.
# Walrus Technical Specifications & Implementation Guide

## Core Walrus Technologies

### **RedStuff Protocol**
- **Type**: Two-dimensional erasure coding scheme
- **Replication Factor**: 4.5x storage overhead (vs traditional full replication)
- **Self-Healing**: Nodes can reconstruct lost fragments efficiently
- **Byzantine Fault Tolerance**: Resilient against malicious storage nodes
- **Network Churn**: Handles dynamic node joining/leaving

### **Sui Blockchain Integration**
- **Coordination Layer**: Sui smart contracts manage storage nodes and blob metadata
- **Payment System**: WAL tokens (1 WAL = 1 billion FROST) for storage costs
- **Object Model**: Storage resources and blob objects as Sui objects
- **Events System**: On-chain events notify off-chain indexers

### **Storage Objects & Costs**

#### **Storage Resource Object**
```rust
struct Storage {
    id: UID,
    start_epoch: u32,
    end_epoch: u32,
    storage_size: u64
}
```

#### **Blob Object**
```rust
struct Blob {
    id: UID,
    registered_epoch: u32,
    blob_id: u256,
    size: u64,
    encoding_type: u8,
    certified_epoch: Option<u32>,
    storage: Storage,
    deletable: bool
}
```

#### **Cost Components**
1. **Storage Resources**: WAL tokens for storage space purchase
2. **Upload Costs**: WAL charged for blob registration  
3. **Sui Transactions**: Gas costs for on-chain actions (paid in SUI)
4. **On-Chain Objects**: SUI set aside in storage fund (mostly refunded when deleted)

## Quilt Advanced Features

### **Batch Storage Specifications**
- **Maximum Blobs per Quilt**: 666 blobs (QuiltV1)
- **Identifier Requirements**: Must start alphanumerically, no trailing whitespace
- **Metadata Limits**: 64 KB per metadata entry, 64 KB total tag size
- **Immutability**: Metadata cannot be changed after storage

### **Quilt Operations**
```bash
# CLI Commands
walrus store-quilt --epochs 5 file1.txt file2.txt file3.txt
walrus read-quilt <quilt-id> <identifier>
walrus list-patches-in-quilt <quilt-id>

# HTTP API Endpoints
PUT /v1/quilts?epochs=5                    # Store quilt
GET /v1/blobs/by-quilt-patch-id/<patch-id> # Retrieve by patch ID
GET /v1/blobs/by-quilt-id/<quilt-id>/<identifier> # Retrieve by identifier
```

### **QuiltPatchId vs BlobId**
- **QuiltPatchId**: Unique ID for blob within quilt (changes if moved to different quilt)
- **BlobId**: Standard blob identifier (deterministic from content)
- **Individual Operations**: Cannot delete/extend/share individual blobs within quilt

## Installation & Configuration

### **Quick Installation**
```bash
curl -sSf https://install.wal.app | sh
```

### **Prerequisites**
- Sui wallet with SUI tokens
- WAL tokens for publishing blobs
- 64-bit architecture (recommended)
- AVX2/SSSE3 support for optimal performance

### **Configuration File**: `~/.config/walrus/client_config.yaml`
```yaml
system_object: <system-object-id>
staking_object: <staking-object-id>
subsidies_object: <subsidies-object-id>
wallet_config:
  # Wallet configuration
communication:
  # Network settings
```

## API Reference

### **JSON API**
```bash
# Store blob
walrus json '{
    "config": "path/to/client_config.yaml",
    "command": {
        "store": {
            "files": ["README.md"],
            "epochs": 100
        }
    }
}'

# Read blob
walrus json '{
    "config": "path/to/client_config.yaml", 
    "command": {
        "read": {
            "blobId": "4BKcDC0Ih5RJ8R0tFMz3MZVNZV8b2goT6_JiEEwNHQo"
        }
    }
}'
```

### **HTTP API**
```bash
# Store blob
curl -X PUT "$PUBLISHER/v1/blobs?epochs=5" --upload-file "some/file"

# Read blob
curl "$AGGREGATOR/v1/blobs/<blob-id>"
curl "$AGGREGATOR/v1/blobs/by-object-id/<object-id>"
```

## Events & Smart Contract Integration

### **Sui Events**
- **BlobRegistered**: Notifies storage nodes about expected slivers
- **BlobCertified**: Indicates blob availability and deletion epoch
- **BlobDeleted**: Signals blob removal from storage
- **InvalidBlobID**: Error handling for malformed data
- **Epoch Events**: EpochChangeStart, EpochChangeDone

### **Smart Contract Benefits**
- **Direct Metadata Access**: Read Walrus system data directly on Sui
- **Storage Management**: Split, merge, transfer storage resources
- **Proof of Availability**: Blockchain events provide cryptographic proofs
- **Advanced Use Cases**: Enable complex smart contract interactions

## Performance & Scalability

### **HNSW Index Parameters**
| Parameter | Description | Impact |
|-----------|-------------|---------|
| M | Neighbors per node during construction | Higher M = better recall, more memory |
| efConstruction | Dynamic candidate list size (build) | Higher ef = better quality, slower build |
| efSearch | Dynamic candidate list size (search) | Higher ef = better recall, slower search |
| mL | Layer assignment probability factor | Affects graph sparsity at top layers |

### **Scalability Strategies**
- **Index Sharding**: Break massive indices into smaller, independent units
- **Quilt Management**: Bundle sharded index files efficiently
- **Horizontal Scaling**: Replicate indexer/query nodes behind load balancers
- **Caching**: Use CDNs and traditional caches with Walrus backends

## Security Considerations

### **Data Privacy**
- **Public Storage Warning**: All Walrus blobs are public and discoverable
- **Encryption Required**: Use additional encryption layers for sensitive data
- **Seal Integration**: Programmable access control via Identity-Based Encryption

### **Operational Security**
- **Key Management**: Secure IBE master secret keys with HSMs/secure enclaves
- **Threshold Security**: Distribute trust across multiple key servers
- **Access Policies**: Transparent, auditable smart contract-based rules

## Integration Patterns

### **Blockchain Indexer Pattern**
1. Smart contract emits events on state changes
2. Off-chain indexer subscribes to specific event types
3. Indexer updates local state (HNSW index) based on events
4. Periodic serialization to Walrus for durability

### **Two-Stage Query Pattern**
1. **Stage 1**: Fast metadata search on unencrypted data
2. **Stage 2**: Secure retrieval of encrypted data via access control
3. **Decoupling**: Separate performance optimization from security requirements

This comprehensive specification provides the technical foundation for implementing a production-grade Walrus-Quilt vector storage system.
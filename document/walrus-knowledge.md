# Walrus Comprehensive Knowledge Base

## Overview

Walrus is a decentralized blob storage and data availability protocol designed for large binary files ("blobs"), built on the Sui blockchain for coordination and governance.

## Key Features

- **Decentralized Storage**: Uses a network of storage nodes with delegated proof of stake
- **High Availability**: Ensures blob accessibility even with multiple unavailable nodes
- **Cost Efficient**: Uses erasure coding (approximately 5x blob size overhead)
- **Public Storage**: All blobs stored are public and discoverable
- **Sui Integration**: Uses Sui blockchain for metadata, coordination, and payments
- **Epoch-based System**: Storage managed in epochs (currently ~2 weeks)

## Installation

### Quick Install (Recommended)
```bash
curl -sSf https://install.wal.app | sh
```

### Alternative Methods
- Download from GitHub releases
- Install via Cargo: `cargo install walrus-cli`  
- Build from source using Rust toolchain

### Prerequisites
- Sui wallet with SUI tokens
- WAL tokens for publishing blobs
- 64-bit architecture (recommended)
- AVX2/SSSE3 support for optimal performance

## Configuration

**Config file location**: `~/.config/walrus/client_config.yaml`

Key configuration parameters:
- `system_object`
- `staking_object` 
- `subsidies_object`
- Wallet configuration
- Communication settings
- Supports Mainnet and Testnet contexts

## Architecture Components

### Sui-Based Components

1. **System Object**
   - Records and manages current committee of storage nodes
   - System object ID found in `client_config.yaml`
   - Viewable on Sui explorers

2. **Storage Resources**
   - Represent empty storage space for blob storage
   - Purchased with WAL tokens

3. **Blob Resources**
   - Represent registered and certified stored blobs
   - Stored as Sui objects

4. **Walrus-Related Events**
   - Emitted when changes occur to Sui objects

### Walrus-Specific Services

1. **Client (Binary)**
   - Command Line Interface (CLI)
   - JSON API
   - HTTP API

2. **Aggregator Services**
   - Enable blob reading via HTTP requests

3. **Publisher Services**  
   - Used for storing blobs in Walrus

4. **Storage Nodes**
   - Form decentralized storage infrastructure
   - Store encoded blob slivers

## API Documentation

### JSON API

**Store a blob:**
```bash
walrus json '{
    "config": "path/to/client_config.yaml",
    "command": {
        "store": {
            "files": ["README.md"],
            "epochs": 100
        }
    }
}'
```

**Read a blob:**
```bash
walrus json '{
    "config": "path/to/client_config.yaml", 
    "command": {
        "read": {
            "blobId": "4BKcDC0Ih5RJ8R0tFMz3MZVNZV8b2goT6_JiEEwNHQo"
        }
    }
}'
```

### HTTP/Web API

**Store Blobs:**
- Endpoint: `PUT /v1/blobs`
- Parameters:
  - `epochs`: Number of storage epochs
  - `send_object_to`: Specify recipient address
  - `deletable`: Mark blob as deletable

**Read Blobs:**
- `GET /v1/blobs/<blob-id>`
- `GET /v1/blobs/by-object-id/<object-id>`

**Quilt APIs (Walrus 1.29+):**
- Store Quilts: `PUT /v1/quilts`
- Retrieve by Quilt Patch ID: `GET /v1/blobs/by-quilt-patch-id/<patch-id>`
- Retrieve by Quilt ID: `GET /v1/blobs/by-quilt-id/<quilt-id>/<identifier>`

## Quilt - Batch Storage Optimization

### Overview
Quilt is a batch storage feature designed to optimize storage of small blobs in Walrus. It allows storing up to 666 blobs in a single "quilt" unit, providing significant cost reductions and efficiency improvements.

### Key Features
- **Batch Storage**: Store up to 666 blobs in a single quilt unit
- **Individual Retrieval**: Access specific blobs within a quilt without downloading the entire unit
- **Custom Metadata**: Immutable "Walrus-native" blob metadata with flexible tagging
- **Unique Identifiers**: Each blob gets a `QuiltPatchId` different from standard `BlobId`

### Cost Benefits
- **Dramatic Storage Cost Reduction**: Up to 409x savings for 10KB files
- **Sui Computation Savings**: Up to 238x reduction in gas fees for test scenarios
- **Efficiency**: Minimal additional effort beyond standard storage procedures

### Metadata Constraints
- **Identifier Rules**: Must start alphanumerically, no trailing whitespace
- **Size Limits**: Maximum 64 KB per metadata entry, total tag size limited to 64 KB
- **Immutability**: Metadata cannot be changed after storage

### Important Limitations
- **No Individual Management**: Cannot delete, extend, or share individual blobs within a quilt
- **ID Changes**: Blob IDs may change when stored in different quilts
- **Batch Operations**: All operations must be performed at the quilt level

### Ideal Use Cases
- **Large Volumes of Small Blobs**: Managing collections of small files efficiently
- **File Collections**: Organizing related files together
- **NFT Image Collections**: Storing multiple NFT assets cost-effectively
- **Cost-sensitive Applications**: Applications requiring efficient storage for numerous small files

### CLI Usage
```bash
# Store multiple blobs as a quilt
walrus store-quilt --epochs 5 file1.txt file2.txt file3.txt

# Retrieve individual blob from quilt
walrus read-quilt <quilt-id> <identifier>
```

### API Usage
```bash
# Store quilt via HTTP API
curl -X PUT "$PUBLISHER/v1/quilts?epochs=5" \
  -F "file1=@path/to/file1.txt" \
  -F "file2=@path/to/file2.txt"

# Retrieve by quilt patch ID
curl "$AGGREGATOR/v1/blobs/by-quilt-patch-id/<patch-id>"

# Retrieve by quilt ID and identifier
curl "$AGGREGATOR/v1/blobs/by-quilt-id/<quilt-id>/<identifier>"
```

**Example Request:**
```bash
curl -X PUT "$PUBLISHER/v1/blobs?epochs=5" --upload-file "some/file"
```

## Core Operations

### 1. Store Operation
**Process:**
1. Encode blob using erasure coding
2. Derive deterministic blob ID from content
3. Execute Sui transaction to purchase storage
4. Register blob ID on Sui
5. Distribute blob slivers to storage nodes
6. Aggregate signed receipts from nodes
7. Certify blob availability on Sui

**Constraints:**
- Maximum blob size: 13.3 GiB
- All stored blobs are public
- Storage duration: specified number of epochs

### 2. Read Operation  
**Process:**
1. Query Sui system object for storage node committee
2. Query storage nodes for blob metadata
3. Reconstruct blob from slivers using erasure decoding
4. Verify reconstructed blob against blob ID

### 3. Blob ID Generation
- Deterministically derived from blob content and Walrus configuration
- Can generate locally: `walrus blob-id <file-path>`
- Used for content verification

### 4. Certify Availability
**Verification Methods:**
- Sui SDK event authentication
- Sui blob object authentication  
- Smart contract object reading

### 5. Delete Operation
- Optional blob deletability (set during storage)
- Owner can delete their own blobs
- Reclaims storage space
- May not make blob completely unavailable if copies exist elsewhere

## Storage Costs

### Four Cost Components

1. **Storage Resources**
   - Acquire storage space using WAL tokens
   - Purchased from system/subsidy contracts
   - Resources have specific capacity and epoch duration

2. **Upload Costs**
   - WAL charged for blob registration
   - Ensures system sustainability

3. **Sui Transactions**
   - Gas costs for on-chain actions (paid in SUI)
   - Up to three transactions per blob:
     - Acquire storage resource
     - Register blob
     - Certify blob availability

4. **On-Chain Objects**
   - Blobs represented as Sui objects
   - SUI set aside in storage fund
   - Most SUI refunded when objects deleted

### Cost Optimization Strategies

- Use `--dry-run` for estimated WAL costs
- Check `walrus info` for current resource pricing
- Acquire larger storage resources at once
- Use Quilt for batch storage of small blobs
- Burn blob objects after expiration
- Combine multiple blob management actions in single transaction
- Actively delete and reuse storage resources
- Consider re-registering blobs near lifetime expiration

**Key Insight:** Encoded blob size (5x original + metadata) significantly impacts costs, especially for smaller blobs.

## Walrus Sites

**Features:**
- Decentralized web hosting using Sui and Walrus
- No server management required
- Sites can be linked to Sui objects (like NFTs)
- Owned by Sui addresses, exchangeable/updatable
- Compatible with SuiNS naming system
- Static sites with potential dynamic interactions via Sui wallets

**URL Format:** `[subdomain].wal.app/[object-id]`

**Publishing:** Uses site-builder tool, served through portals

## Technical Details

- **Storage Encoding:** Linear fountain codes for error correction
- **Blockchain:** Built on Sui for coordination and payments
- **Token:** Native WAL token for staking and payments
- **Architecture:** 64-bit recommended, 32-bit supports blobs < 500 MiB
- **Network:** Mainnet and Testnet available
- **License:** Apache 2.0 (open source)

## Important Considerations

⚠️ **Security Warning:** All blobs stored in Walrus are **public and discoverable**. Do not store confidential information without additional encryption layers.

## Documentation Sources

- Official docs: https://docs.wal.app
- GitHub: https://github.com/MystenLabs/walrus
- GitHub Pages: https://mystenlabs.github.io/walrus

## Getting Started Workflow

1. Install Sui CLI and set up wallet
2. Obtain SUI and WAL tokens
3. Install Walrus client
4. Configure `client_config.yaml`
5. Start storing and retrieving blobs

## Sui Blockchain Integration

### Sui Objects Used by Walrus

**Storage Object**
```
struct Storage {
    id: UID,
    start_epoch: u32,
    end_epoch: u32,
    storage_size: u64
}
```
- Represents storage reservation for a specific period
- Can be split, merged, and transferred between users
- Defines capacity and epoch duration

**Blob Object**
```
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
- Represents registered and certified stored blobs
- Contains metadata about blob properties and status
- Links to associated storage resource

### Sui Events

**BlobRegistered**
- Notifies storage nodes about expected slivers
- Emitted when blob is registered on-chain

**BlobCertified** 
- Indicates blob availability and deletion epoch
- Confirms successful storage across network

**BlobDeleted**
- Signals blob removal from storage
- Allows storage space reclamation

**InvalidBlobID**
- Indicates incorrectly encoded blob
- Error handling for malformed data

**Epoch Events**
- `EpochChangeStart`: Beginning of epoch transition
- `EpochChangeDone`: Completion of epoch transition

### Smart Contract Integration Benefits

- **Direct Metadata Access**: Read Walrus system data directly on Sui
- **Storage Management**: Split, merge, transfer storage resources
- **Proof of Availability**: Blockchain events provide cryptographic proofs
- **Advanced Use Cases**: Enable complex smart contract interactions
- **Optional Integration**: Direct Sui interaction not required for basic usage

## Glossary

### Core Concepts

**Blob**
- Single unstructured data object stored on Walrus
- Has unique blob ID computed from its slivers
- Maximum size: 13.3 GiB

**Epoch**
- Time period tracking committee changes
- On Mainnet, duration is two weeks
- Measures blob lifetimes

**WAL**
- Native token of Walrus
- Used for storage payments and staking
- 1 WAL = 1 billion FROST

**Quilt**
- Structured data object consisting of one or multiple unstructured blobs
- Has unique quilt ID
- Used for batch storage of small blobs

### Storage Architecture

**Storage Node**
- Entity storing data for Walrus
- Holds one or several shards
- Participates in storage challenges and attestations

**Shard**
- Subset of erasure-encoded data of all blobs
- Assigned to and stored on a single storage node

**Sliver**
- Erasure-encoded data of one shard
- Corresponds to a single blob
- Contains erasure-encoded symbols

### Technical Components

**RedStuff**
- Erasure-encoding approach used by Walrus
- Uses two encodings (primary and secondary)
- Enables shard recovery and fault tolerance

**Certificate of Availability (CoA)**
- Blob ID with signatures from storage nodes
- Requires at least 2f+1 shards in a specific epoch
- Proves blob availability on the network

**Publisher**
- Service interacting with Sui and storage nodes
- Offers HTTP POST endpoint for blob storage
- Handles blob registration and distribution

---

*Last updated: Based on documentation fetched from docs.wal.app including glossary terms*
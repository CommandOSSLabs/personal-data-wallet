# Walrus-Quilt + Seal Encryption Focused Architecture

## Revised Implementation Scope

**✅ Current Focus:**
- **Walrus-Quilt**: Batch storage for vector embeddings and metadata
- **Seal Encryption**: Identity-Based Encryption for private data
- **Sui Integration**: Smart contracts for ownership and access control

**⏰ Deferred for Later:**
- HNSW indexer implementation 
- Off-chain compute plane optimization
- Advanced vector search capabilities

## Core Architecture (Simplified)

```
┌─────────────────────────────────────────────────────────┐
│                 Sui Control Plane                       │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Vector Index    │  │ Seal Access Control             │ │
│  │ Contract        │  │ (IBE Policies)                  │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                 Walrus Data Plane                       │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              Encrypted Quilts                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │ User A      │  │ User B      │  │ Shared      │  │ │
│  │  │ Embeddings  │  │ Embeddings  │  │ Embeddings  │  │ │
│  │  │ Quilt       │  │ Quilt       │  │ Quilt       │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│              Personal Data Wallet                       │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Embedding       │  │ Memory Management               │ │
│  │ Service         │  │ (Basic Storage/Retrieval)       │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Implementation Phases

### **Phase 1: Walrus-Quilt Storage Layer**
**Goal**: Replace mocked WalrusClient with real Walrus HTTP API integration

**Components to Implement:**
1. **Enhanced WalrusClient** with Quilt support
2. **Vector Embedding Storage** as batch quilts
3. **Metadata Management** with tags and identifiers
4. **Basic Retrieval** by patch ID and identifier

**Key Methods:**
```python
class WalrusClient:
    async def store_embedding_quilt(
        self, 
        embeddings: List[EmbeddingData], 
        epochs: int = 5
    ) -> QuiltResponse
    
    async def retrieve_embedding_by_patch_id(
        self, 
        patch_id: str
    ) -> EmbeddingData
    
    async def retrieve_embedding_by_identifier(
        self, 
        quilt_id: str, 
        identifier: str
    ) -> EmbeddingData
    
    async def list_quilt_patches(
        self, 
        quilt_id: str
    ) -> List[QuiltPatch]
```

### **Phase 2: Seal Encryption Integration**
**Goal**: Add client-side encryption for sensitive vector embeddings

**Components to Implement:**
1. **Seal Client Integration** for IBE encryption/decryption
2. **Access Control Policies** via Sui smart contracts
3. **Key Server Communication** for decryption keys
4. **Encrypted Quilt Storage** workflow

**Key Methods:**
```python
class SealClient:
    async def encrypt_embedding(
        self, 
        embedding_data: bytes, 
        policy_id: str,
        identity: str
    ) -> EncryptedData
    
    async def decrypt_embedding(
        self, 
        encrypted_data: EncryptedData,
        access_proof: SuiTransaction
    ) -> bytes
    
    async def create_access_policy(
        self, 
        policy_rules: AccessRules
    ) -> str  # Returns policy_id
```

### **Phase 3: Integrated Workflow**
**Goal**: Complete encrypted storage and retrieval pipeline

**Workflow:**
1. **Encrypt** → Seal encrypts vector embedding client-side
2. **Store** → WalrusClient stores encrypted data in quilt with metadata
3. **Register** → Sui contract records ownership and access policies
4. **Retrieve** → Query Sui for blob info, request decryption key from Seal
5. **Decrypt** → Client decrypts and uses vector embedding

## Technical Implementation Details

### **Walrus HTTP API Integration**
```python
# Store encrypted embeddings as quilt
async def store_encrypted_quilt(self, encrypted_embeddings: List[EncryptedEmbedding]):
    files = {}
    metadata = []
    
    for i, emb in enumerate(encrypted_embeddings):
        identifier = f"embedding_{emb.user_id}_{i}"
        files[identifier] = emb.encrypted_data
        metadata.append({
            "identifier": identifier,
            "tags": {
                "user_id": emb.user_id,
                "category": emb.category,
                "encrypted": "true",
                "policy_id": emb.policy_id
            }
        })
    
    response = await self.http_client.put(
        f"{self.publisher_url}/v1/quilts?epochs={epochs}",
        files=files,
        data={"_metadata": json.dumps(metadata)}
    )
    return response.json()
```

### **Seal Encryption Workflow**
```python
# Client-side encryption before storage
async def encrypt_and_store_embedding(self, embedding: VectorEmbedding, user_address: str):
    # 1. Create access policy
    policy_id = await self.seal_client.create_access_policy({
        "owner": user_address,
        "access_rules": f"owner == {user_address}"
    })
    
    # 2. Encrypt embedding
    identity = f"{policy_id}{user_address}{timestamp}"
    encrypted_data = await self.seal_client.encrypt_embedding(
        embedding.to_bytes(), 
        policy_id, 
        identity
    )
    
    # 3. Store in Walrus quilt
    quilt_response = await self.walrus_client.store_embedding_quilt([
        EncryptedEmbedding(
            encrypted_data=encrypted_data,
            user_id=user_address,
            policy_id=policy_id,
            category="text_embedding"
        )
    ])
    
    # 4. Register on Sui
    await self.sui_client.register_encrypted_embedding(
        user_address, 
        quilt_response.blob_id, 
        policy_id
    )
```

## Benefits of This Focused Approach

### **Immediate Value**
1. **Real Decentralized Storage**: Actual Walrus integration vs mocked implementation
2. **Cost Optimization**: Quilt batch storage for significant cost savings
3. **Privacy Protection**: Seal encryption ensures data sovereignty
4. **Production Ready**: Complete storage/retrieval pipeline

### **Future Extensibility**
1. **HNSW Integration**: Can add vector search later without breaking storage layer
2. **Scale Preparation**: Quilt architecture ready for massive scale
3. **Advanced Features**: Foundation supports complex access policies and sharing

### **Development Priorities**
1. **Week 1-2**: Walrus HTTP API integration and Quilt storage
2. **Week 3-4**: Seal encryption client and key management
3. **Week 5-6**: Sui smart contract integration and access policies
4. **Week 7+**: Testing, optimization, and production deployment

This focused approach delivers a complete **encrypted, decentralized vector storage system** without the complexity of advanced indexing, providing immediate value while establishing the foundation for future enhancements.
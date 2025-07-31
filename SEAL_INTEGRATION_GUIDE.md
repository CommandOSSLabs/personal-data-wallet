# Seal IBE Integration Guide

This guide walks you through setting up and using the complete Seal Identity-Based Encryption (IBE) integration with the Personal Data Wallet.

## Overview

Our Seal integration provides **real privacy-preserving encryption** for vector embeddings using:

- **Identity-Based Encryption (IBE)**: Encrypt data using identity strings, decrypt with private keys from Seal servers
- **Two-Layer Architecture**: Public metadata vectors for search, encrypted main vectors for privacy
- **Decentralized Key Management**: Multiple key servers with threshold encryption (t-out-of-n)
- **Sui Blockchain Integration**: On-chain access control policies and ownership verification

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Personal Data Wallet                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Python Backend  │  │ HNSW Indexer    │  │ Walrus Client   │  │
│  │ (FastAPI)       │  │ (Privacy Layer) │  │ (Storage)       │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│           │                     │                     │          │
└───────────┼─────────────────────┼─────────────────────┼──────────┘
            │                     │                     │
            ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ TypeScript      │  │ Metadata Vectors │  │ Encrypted Blobs │
│ Seal Service    │  │ (Public/Search)  │  │ (Private/Walrus)│
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Seal Key        │  │ HNSW Index      │  │ Walrus Network  │
│ Servers         │  │ (Fast Search)   │  │ (Decentralized) │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js 18+** (for Seal service)
- **Python 3.8+** (for backend)
- **Access to Sui testnet** (for key servers)
- **Basic understanding of IBE concepts**

### Step 1: Install Dependencies

```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Seal service dependencies
cd seal-service
npm install
```

### Step 2: Configure Seal Service

```bash
# Copy environment template
cd seal-service
cp .env.example .env

# Edit configuration
nano .env
```

**Key settings:**
```env
# Service Configuration
PORT=8080
NODE_ENV=development

# Sui Network
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443

# Seal Configuration  
SEAL_THRESHOLD=1
SEAL_VERIFY_KEY_SERVERS=false

# Key Server Object IDs (update with real values)
SEAL_KEY_SERVER_1=0x...
SEAL_KEY_SERVER_2=0x...
```

### Step 3: Configure Python Backend

Edit `backend/.env`:

```env
# Enable real Seal integration
USE_REAL_SEAL=true
SEAL_SERVICE_URL=http://localhost:8080
SEAL_THRESHOLD=1
```

### Step 4: Start Services

```bash
# Terminal 1: Start Seal service
cd seal-service
npm run dev

# Terminal 2: Start Python backend
cd backend
python main.py

# Terminal 3: Run integration tests
python test_real_seal_integration.py
```

## How It Works

### 1. Data Storage Flow

```python
# When storing a chat message:
chat_text = "I love pizza on Fridays"

# 1. Extract entities and relationships
entities = {"pizza": {"type": "Food", "confidence": 0.9}}
relationships = [{"user": "prefers", "pizza": 0.85}]

# 2. Generate two vectors
main_vector = generate_full_embedding(chat_text)      # 768 dims - contains all semantic info
metadata_vector = generate_metadata_embedding(chat_text)  # 384 dims - for search only

# 3. Create access policy
policy = {
    "owner": user_address,
    "category": "chat_memory", 
    "access_rules": [f"owner:{user_address}"]
}

# 4. Encrypt main vector with Seal IBE
ibe_identity = f"owner:{user_address}|category:chat_memory|policy:{policy_hash}"
encrypted_main = await seal_service.encrypt(main_vector, ibe_identity, policy)

# 5. Store encrypted main vector on Walrus
walrus_hash = await walrus_client.store_blob(encrypted_main)

# 6. Store metadata vector in HNSW index (public, searchable)
await indexer.add_enhanced_embedding_with_privacy(
    embedding_id=embedding_id,
    owner=user_address,
    main_vector=main_vector,        # Gets encrypted
    metadata_vector=metadata_vector, # Stays public for search
    entities=entities,
    relationships=relationships
)
```

### 2. Search and Retrieval Flow

```python
# Stage 1: Public metadata search (fast, no decryption)
query_vector = generate_query_embedding("What foods do I like?")
search_results = await indexer.search_unified(
    query_vector=query_vector,
    k=10,
    filters={"category": "chat_memory", "owner": user_address}
)

# search_results contains:
# - Public metadata vectors and similarity scores
# - Entity/relationship information  
# - Encrypted main vector hashes
# - Privacy flags (main_vector_encrypted=True)

# Stage 2: Secure decryption (for selected results)
for result in search_results[:3]:  # Top 3 results
    if result["main_vector_encrypted"]:
        # Request decryption key from Seal servers
        decrypted = await indexer.retrieve_decrypted_main_vector(
            embedding_id=result["embedding_id"],
            user_address=user_address,
            user_signature=user_signature  # Proves ownership
        )
        
        # decrypted contains full semantic vector + rich metadata
        main_vector = decrypted["main_vector"]        # 768 dims
        entities = decrypted["entities"]              # Rich entity data
        relationships = decrypted["relationships"]    # Relationship graph
```

### 3. Privacy Guarantees

**What's Public:**
- Metadata vectors (384 dimensions) - for similarity search
- Basic category and ownership info
- Entity names and types (but not semantic details)
- Search performance is fast

**What's Private:**
- Main vectors (768 dimensions) - contain full semantic information
- Detailed entity semantic meanings
- Relationship confidence scores and context
- Personal preferences and sensitive data
- Only accessible with valid Sui signatures

## API Reference

### Seal Service Endpoints

#### Encrypt Data
```http
POST /encrypt
Content-Type: application/json

{
  "data": "48656c6c6f20576f726c64",  // hex-encoded
  "identity": "owner:0x123|category:chat|policy:abc123",
  "policy": {
    "owner": "0x123",
    "category": "chat", 
    "access_rules": ["owner:0x123"]
  }
}
```

#### Request Decryption Key
```http
POST /request-key
Content-Type: application/json

{
  "ibe_identity": "owner:0x123|category:chat|policy:abc123",
  "sui_ptb": {
    "transaction_type": "access_request",
    "user_address": "0x123"
  },
  "signature": "user_signature"
}
```

#### Decrypt Data
```http
POST /decrypt
Content-Type: application/json

{
  "encrypted_data": "base64_encrypted_data",
  "decryption_key": "base64_session_key", 
  "identity": "owner:0x123|category:chat|policy:abc123"
}
```

### Python API

#### Store Privacy-Preserving Embedding
```python
index_id = await indexer.add_enhanced_embedding_with_privacy(
    embedding_id="chat_001",
    owner="0x123...",
    main_vector=[0.1, 0.2, ...],      # 768 dims - gets encrypted
    metadata_vector=[0.3, 0.4, ...],  # 384 dims - stays public
    category="chat_memory",
    entities={"pizza": {"type": "Food", "confidence": 0.9}},
    relationships=[{"user": "prefers", "pizza": 0.85}]
)
```

#### Search Public Metadata
```python
results = await indexer.search_unified(
    query_vector=query_embedding,
    k=10,
    filters={"category": "chat_memory", "owner": user_address}
)
```

#### Decrypt Private Data
```python
decrypted = await indexer.retrieve_decrypted_main_vector(
    embedding_id="chat_001",
    user_address="0x123...",
    user_signature="signature"
)
```

## Configuration Options

### Development vs Production

**Development Mode:**
```env
USE_REAL_SEAL=false          # Uses simulation
SEAL_VERIFY_KEY_SERVERS=false
NODE_ENV=development
```

**Production Mode:**
```env
USE_REAL_SEAL=true           # Uses real Seal servers
SEAL_VERIFY_KEY_SERVERS=true
NODE_ENV=production
SEAL_KEY_SERVER_1=0x...      # Real server object IDs
SEAL_KEY_SERVER_2=0x...
```

### Key Server Configuration

**Testnet (1-out-of-2):**
```env
SEAL_THRESHOLD=1
SEAL_KEY_SERVER_1=0x...  # Mysten testnet server 1
SEAL_KEY_SERVER_2=0x...  # Mysten testnet server 2
```

**Production (2-out-of-3):**
```env
SEAL_THRESHOLD=2
SEAL_KEY_SERVER_1=0x...  # Production server 1
SEAL_KEY_SERVER_2=0x...  # Production server 2  
SEAL_KEY_SERVER_3=0x...  # Production server 3
```

## Testing

### Run Integration Tests

```bash
# Test TypeScript Seal service
cd seal-service
chmod +x scripts/test-integration.sh
./scripts/test-integration.sh

# Test Python integration
python test_real_seal_integration.py

# Test privacy workflow
python test_privacy_workflow.py
```

### Manual Testing

```bash
# 1. Check Seal service health
curl http://localhost:8080/health

# 2. Test encryption
curl -X POST http://localhost:8080/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "data": "48656c6c6f",
    "identity": "owner:0x123|category:test",
    "policy": {"owner": "0x123", "category": "test"}
  }'

# 3. Test Python backend
python -c "
import asyncio
from backend.services.seal_encryption import SealEncryptionService

async def test():
    service = SealEncryptionService()
    health = await service.health_check()
    print(f'Service health: {health}')
    await service.close()

asyncio.run(test())
"
```

## Deployment

### Production Deployment

```bash
# Deploy Seal service
cd seal-service
chmod +x scripts/deploy.sh
./scripts/deploy.sh production

# Configure Python backend
export USE_REAL_SEAL=true
export SEAL_SERVICE_URL=http://localhost:8080

# Start services
pm2 start ecosystem.config.js  # Seal service
python backend/main.py         # Python backend
```

### Docker Deployment

```dockerfile
# Dockerfile.seal-service
FROM node:18-alpine
WORKDIR /app
COPY seal-service/package*.json ./
RUN npm ci --only=production
COPY seal-service/dist ./dist
EXPOSE 8080
CMD ["node", "dist/seal-server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  seal-service:
    build: 
      context: .
      dockerfile: Dockerfile.seal-service
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - USE_REAL_SEAL=true
    
  backend:
    build: .
    depends_on:
      - seal-service
    environment:
      - USE_REAL_SEAL=true
      - SEAL_SERVICE_URL=http://seal-service:8080
```

## Troubleshooting

### Common Issues

**1. Connection Errors**
```
Error: Cannot connect to Seal encryption service
```
**Solution:** Check if Seal service is running on port 8080

**2. Key Server Issues**
```  
Error: Seal encryption failed: Key server not found
```
**Solution:** Update key server object IDs in configuration

**3. Permission Errors**
```
Error: Access denied: invalid access policy
```
**Solution:** Verify user signatures and access policies

**4. Encryption Failures**
```
Error: IBE encryption failed
```
**Solution:** Check identity string format and policy structure

### Debug Mode

Enable detailed logging:

```bash
# Seal service
export LOG_LEVEL=debug

# Python backend  
export LOG_LEVEL=DEBUG
```

### Health Checks

```bash
# Check all services
curl http://localhost:8080/health           # Seal service
curl http://localhost:8000/health           # Python backend

# Check configuration
python -c "
from backend.config import settings
print(f'Real Seal: {settings.use_real_seal}')
print(f'Service URL: {settings.seal_service_url}')
"
```

## Security Best Practices

### Key Management
- **Never hardcode** key server object IDs in source code
- **Use environment variables** for all sensitive configuration
- **Rotate keys regularly** in production environments
- **Monitor key server health** and availability

### Access Control
- **Validate all signatures** before granting access
- **Use strong access policies** with multiple rules
- **Log all access attempts** for audit trails
- **Implement rate limiting** on encryption endpoints

### Network Security
- **Use HTTPS** in production environments
- **Implement proper CORS** policies
- **Add authentication** for service endpoints
- **Monitor network traffic** for anomalies

## Next Steps

1. **Get Testnet Access**: Contact Mysten Labs for testnet key server object IDs
2. **Deploy to Staging**: Test with real Sui testnet integration
3. **Implement Sui Contracts**: Add on-chain access policy validation
4. **Performance Optimization**: Benchmark and optimize for scale
5. **Production Deployment**: Deploy with production key servers

## Support

- **Documentation**: See `seal-service/README.md` for detailed API docs
- **Examples**: Check `test_real_seal_integration.py` for usage examples
- **Issues**: Report bugs and feature requests on GitHub
- **Community**: Join Discord for development discussions

---

This integration provides **enterprise-grade privacy** for personal data storage while maintaining the **performance** needed for real-time applications. The two-layer architecture ensures that search remains fast while keeping sensitive data truly private through Identity-Based Encryption.
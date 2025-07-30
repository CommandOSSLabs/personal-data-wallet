# Walrus-Quilt Integration Guide

## Overview

This document provides comprehensive guidance on using the enhanced Walrus-Quilt integration in the Personal Data Wallet project. The implementation provides cost-effective, decentralized storage for vector embeddings and HNSW indices using Walrus's Quilt batch storage optimization.

## Architecture

### Core Components

1. **WalrusClient** - Enhanced HTTP API client with Quilt support
2. **VectorStore** - HNSW vector search with Walrus integration
3. **Data Models** - Pydantic models for type-safe operations
4. **Configuration** - Environment-based settings

### Cost Benefits

- **409x cost reduction** for 10KB files when using Quilt vs individual storage
- **238x reduction** in Sui gas fees for batch operations
- **Up to 666 blobs** per quilt unit for maximum efficiency

## Configuration

### Environment Variables

```bash
# Required Walrus URLs
WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space

# Optional settings
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
```

### Settings Class

```python
from config import settings

# Access configuration
publisher_url = settings.walrus_publisher_url
aggregator_url = settings.walrus_aggregator_url
```

## Basic Usage

### 1. Initialize WalrusClient

```python
from services.walrus_client import WalrusClient

# Create client instance
walrus_client = WalrusClient()

# Always remember to close when done
await walrus_client.close()
```

### 2. Store Individual Blobs

```python
# Store single blob
data = b"Hello, Walrus!"
blob_id = await walrus_client.store_blob(
    data=data,
    epochs=5,  # Storage duration
    deletable=True  # Can be deleted later
)

# Retrieve blob
retrieved_data = await walrus_client.retrieve_blob(blob_id)
```

### 3. Store Quilt (Batch)

```python
from models import QuiltBlob

# Prepare multiple blobs
blobs = [
    QuiltBlob(
        identifier="file_1",
        data=b"First file content",
        metadata={"type": "text", "category": "document"}
    ),
    QuiltBlob(
        identifier="file_2", 
        data=b"Second file content",
        metadata={"type": "text", "category": "document"}
    )
]

# Store as quilt (batch)
quilt_response = await walrus_client.store_quilt(blobs, epochs=10)

print(f"Quilt ID: {quilt_response.quilt_id}")
print(f"Total patches: {len(quilt_response.patches)}")
print(f"Storage cost: {quilt_response.total_cost}")
```

### 4. Retrieve from Quilt

```python
# Method 1: Retrieve by patch ID
patch_id = quilt_response.patches[0].patch_id
data = await walrus_client.retrieve_from_quilt_by_patch_id(patch_id)

# Method 2: Retrieve by quilt ID and identifier
data = await walrus_client.retrieve_from_quilt_by_id(
    quilt_id=quilt_response.quilt_id,
    identifier="file_1"
)
```

## Vector Store Integration

### 1. Basic Vector Operations

```python
from services.vector_store import VectorStore
from models import EmbeddingResult

# Create vector store
vector_store = VectorStore(dimension=768, max_elements=10000)

# Add embeddings
embeddings = [
    EmbeddingResult(
        vector=[0.1, 0.2, 0.3, ...],  # 768 dimensions
        text="First document content"
    ),
    EmbeddingResult(
        vector=[0.4, 0.5, 0.6, ...],
        text="Second document content"
    )
]

# Add to store
for embedding in embeddings:
    vector_store.add_embedding(embedding)

# Search similar vectors
query_vector = [0.1, 0.15, 0.25, ...]
results = vector_store.search(query_vector, k=5)

for text, similarity in results:
    print(f"Similarity: {similarity:.3f} - {text}")
```

### 2. Save Vector Store to Walrus

```python
# Save HNSW index to Walrus Quilt
quilt_id = await vector_store.save_to_walrus_quilt(
    walrus_client=walrus_client,
    user_id="user_123",
    metadata={
        "version": "1.0",
        "description": "User knowledge base",
        "created": "2024-01-01T00:00:00"
    }
)

print(f"Vector store saved to Quilt: {quilt_id}")
```

### 3. Load Vector Store from Walrus

```python
# Create new vector store instance
new_vector_store = VectorStore(dimension=768, max_elements=10000)

# Load from Walrus
success = await new_vector_store.load_from_walrus_quilt(
    walrus_client=walrus_client,
    quilt_id=quilt_id
)

if success:
    print("Vector store loaded successfully!")
    print(f"Total items: {new_vector_store.current_id}")
else:
    print("Failed to load vector store")
```

## Advanced Patterns

### 1. Embedding Storage Pattern

```python
from models import EmbeddingQuiltData

# Prepare embedding data for optimal storage
embedding_data = EmbeddingQuiltData(
    user_id="user_123",
    embeddings=embeddings,
    metadata={
        "source": "document_collection",
        "model": "text-embedding-3-large",
        "timestamp": "2024-01-01T00:00:00"
    }
)

# Store embeddings as optimized quilt
quilt_id = await walrus_client.store_embeddings_quilt(embedding_data)

# Later: retrieve embeddings
retrieved_embeddings = await walrus_client.retrieve_embeddings_from_quilt(quilt_id)
```

### 2. HNSW Index Storage Pattern

```python
from models import VectorIndexQuiltData

# Prepare index files for storage
index_files = {
    "index.hnsw": hnsw_binary_data,
    "index.meta": metadata_json_bytes,
    "shard_001.hnsw": shard_binary_data  # For sharded indices
}

index_data = VectorIndexQuiltData(
    user_id="user_123",
    index_files=index_files,
    metadata={
        "dimension": "768",
        "total_items": "50000",
        "version": "2.0"
    }
)

# Store index as quilt (long-term storage)
quilt_id = await walrus_client.store_hnsw_index_quilt(index_data)

# Later: retrieve index files
retrieved_files = await walrus_client.retrieve_hnsw_index_from_quilt(quilt_id)
```

### 3. Backup and Recovery Pattern

```python
# Backup embeddings for redundancy
backup_quilt_id = await vector_store.backup_embeddings_to_quilt(
    walrus_client=walrus_client,
    user_id="user_123",
    metadata={
        "backup_type": "scheduled",
        "backup_date": "2024-01-01",
        "reason": "daily_backup"
    }
)

# Recovery workflow
async def recover_user_data(user_id: str, backup_quilt_id: str):
    # Create new vector store
    recovered_store = VectorStore(dimension=768, max_elements=10000)
    
    # Load from backup
    success = await recovered_store.load_from_walrus_quilt(
        walrus_client, backup_quilt_id
    )
    
    if success:
        print(f"Recovered {recovered_store.current_id} items for user {user_id}")
        return recovered_store
    else:
        print("Recovery failed")
        return None
```

## Error Handling

### 1. Retry Logic

The WalrusClient includes automatic retry logic for network failures:

```python
# Automatic retries with exponential backoff
# - 3 retry attempts by default
# - Handles timeout and network errors
# - 1s, 2s, 4s backoff pattern

# Custom retry configuration (if needed)
try:
    result = await walrus_client._retry_request(
        operation=lambda: some_walrus_operation(),
        max_retries=5,
        backoff_factor=2.0
    )
except Exception as e:
    print(f"All retry attempts failed: {e}")
```

### 2. Error Types

```python
import httpx

try:
    blob_id = await walrus_client.store_blob(data)
except httpx.TimeoutException:
    print("Request timed out")
except httpx.NetworkError:
    print("Network connectivity issue")
except Exception as e:
    print(f"Unexpected error: {e}")
```

### 3. Graceful Degradation

```python
async def store_with_fallback(data: bytes, user_id: str):
    """Store data with local fallback if Walrus fails"""
    
    # Try Walrus first
    try:
        blob_id = await walrus_client.store_blob(data)
        if blob_id:
            return {"storage": "walrus", "id": blob_id}
    except Exception as e:
        print(f"Walrus storage failed: {e}")
    
    # Fallback to local storage
    import hashlib
    local_id = hashlib.sha256(data).hexdigest()
    local_path = f"./local_storage/{user_id}/{local_id}"
    
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, 'wb') as f:
        f.write(data)
    
    return {"storage": "local", "id": local_id, "path": local_path}
```

## Performance Optimization

### 1. Batch Operations

```python
# Instead of storing embeddings individually:
# ❌ Inefficient
for embedding in embeddings:
    blob_id = await walrus_client.store_blob(embedding_data)

# ✅ Efficient - use Quilt batch storage
embedding_data = EmbeddingQuiltData(
    user_id="user_123",
    embeddings=embeddings
)
quilt_id = await walrus_client.store_embeddings_quilt(embedding_data)
```

### 2. Connection Management

```python
# ✅ Reuse client instance
class DataManager:
    def __init__(self):
        self.walrus_client = WalrusClient()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.walrus_client.close()

# Usage
async with DataManager() as manager:
    # Perform multiple operations
    result1 = await manager.walrus_client.store_blob(data1)
    result2 = await manager.walrus_client.store_blob(data2)
```

### 3. Metadata Strategies

```python
# Efficient metadata for querying
metadata = {
    "user_id": "user_123",
    "type": "embedding",
    "category": "document",  # For filtering
    "dimension": "768",      # For compatibility checks
    "created": "2024-01-01", # For time-based queries
    "model": "text-embedding-3-large",  # For model tracking
    "version": "1.0"         # For schema versioning
}
```

## Monitoring and Debugging

### 1. Logging

```python
import logging

# Enable detailed logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Log storage operations
async def store_with_logging(data: bytes, user_id: str):
    logger.info(f"Storing {len(data)} bytes for user {user_id}")
    
    start_time = time.time()
    blob_id = await walrus_client.store_blob(data)
    duration = time.time() - start_time
    
    if blob_id:
        logger.info(f"Storage successful: {blob_id} (took {duration:.2f}s)")
    else:
        logger.error(f"Storage failed for user {user_id}")
    
    return blob_id
```

### 2. Health Checks

```python
async def check_walrus_health():
    """Check if Walrus services are accessible"""
    try:
        # Test with small blob
        test_data = b"health_check"
        blob_id = await walrus_client.store_blob(test_data, epochs=1)
        
        if blob_id:
            # Try to retrieve it back
            retrieved = await walrus_client.retrieve_blob(blob_id)
            if retrieved == test_data:
                return {"status": "healthy", "latency": "normal"}
        
        return {"status": "degraded", "issue": "storage_retrieval_mismatch"}
        
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}
```

### 3. Cost Tracking

```python
class CostTracker:
    def __init__(self):
        self.operations = []
    
    async def tracked_store_quilt(self, blobs: List[QuiltBlob], epochs: int = 5):
        start_time = time.time()
        total_size = sum(len(blob.data) for blob in blobs)
        
        result = await walrus_client.store_quilt(blobs, epochs)
        
        if result:
            self.operations.append({
                "timestamp": start_time,
                "operation": "store_quilt",
                "blob_count": len(blobs),
                "total_size": total_size,
                "epochs": epochs,
                "cost": result.total_cost,
                "quilt_id": result.quilt_id
            })
        
        return result
    
    def get_cost_summary(self):
        total_cost = sum(op.get("cost", 0) for op in self.operations)
        total_size = sum(op.get("total_size", 0) for op in self.operations)
        
        return {
            "total_operations": len(self.operations),
            "total_cost": total_cost,
            "total_size": total_size,
            "average_cost_per_byte": total_cost / total_size if total_size > 0 else 0
        }
```

## Testing

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run all Walrus-Quilt tests
python -m pytest backend/test_walrus_quilt.py -v

# Run specific test categories
python -m pytest backend/test_walrus_quilt.py::TestWalrusClient -v
python -m pytest backend/test_walrus_quilt.py::TestVectorStoreWalrusIntegration -v
```

### Test Configuration

```python
# Mock Walrus for testing
import pytest
from unittest.mock import AsyncMock

@pytest.fixture
def mock_walrus_client():
    client = AsyncMock(spec=WalrusClient)
    client.store_blob.return_value = "mock_blob_id"
    client.retrieve_blob.return_value = b"mock_data"
    return client

# Test with real Walrus (integration tests)
@pytest.mark.integration
async def test_real_walrus_storage():
    client = WalrusClient()
    try:
        blob_id = await client.store_blob(b"integration_test_data")
        assert blob_id is not None
        
        data = await client.retrieve_blob(blob_id)
        assert data == b"integration_test_data"
    finally:
        await client.close()
```

## Migration Guide

### From Mock to Real Implementation

If upgrading from the previous mock implementation:

1. **Update configuration** - Add aggregator URL
2. **Handle real responses** - Parse actual Walrus API responses  
3. **Add error handling** - Network failures now possible
4. **Update tests** - Mock HTTP responses instead of simple returns

```python
# Before (mock implementation)
async def old_store(data):
    return f"mock_blob_{hash(data) % 1000000}"

# After (real implementation)
async def new_store(data):
    try:
        result = await walrus_client.store_blob(data)
        return result  # Real blob ID from Walrus
    except Exception as e:
        logger.error(f"Storage failed: {e}")
        return None
```

## Troubleshooting

### Common Issues

1. **Network Timeouts**
   ```
   Solution: Check network connectivity to Walrus testnet
   URLs: publisher.walrus-testnet.walrus.space, aggregator.walrus-testnet.walrus.space
   ```

2. **Large Blob Failures**
   ```
   Solution: Split large files or use streaming uploads
   Max blob size: ~13.3 GiB
   ```

3. **Quilt Size Limits**
   ```
   Solution: Stay under 666 blobs per quilt
   Use multiple quilts for larger collections
   ```

4. **Epoch Management**
   ```
   Solution: Monitor storage epochs and extend before expiration
   Use longer epochs for permanent data (e.g., 200 epochs)
   ```

### Support

For issues or questions:
- Check the test suite for usage examples
- Review Walrus documentation: https://docs.wal.app
- Monitor Walrus network status
- Verify testnet token balances (SUI + WAL)

---

## Summary

The Walrus-Quilt integration provides:

✅ **409x cost reduction** for small file storage  
✅ **Decentralized reliability** with 4.5x replication  
✅ **Seamless HNSW integration** for vector databases  
✅ **Automatic retry logic** for network resilience  
✅ **Type-safe operations** with Pydantic models  
✅ **Comprehensive test coverage** for production use  

This implementation transforms the Personal Data Wallet into a truly decentralized, cost-effective vector database suitable for large-scale deployment.
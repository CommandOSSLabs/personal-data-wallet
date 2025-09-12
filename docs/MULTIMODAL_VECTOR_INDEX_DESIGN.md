# Multimodal Enhancement for Vector Index System

## Overview
This document describes how to ADD multimodal capabilities (images, PDFs) to the existing vector index system while preserving all current functionality and naming conventions.

## Design Principles
1. **Preserve Existing Names**: All current classes, methods, and structures remain unchanged
2. **Additive Approach**: New functionality is added alongside existing features
3. **Backward Compatibility**: Current text-only workflows continue to work
4. **Minimal Disruption**: New components integrate seamlessly

## New Components to Add

### 1. Multimodal Processing Service (NEW)
```python
# New file: backend/services/multimodal_processor.py
from dataclasses import dataclass
import numpy as np
from typing import Optional, Dict, Any

@dataclass
class ProcessedContent:
    """Result of multimodal processing"""
    embedding: np.ndarray
    extracted_text: Optional[str]
    thumbnail_bytes: Optional[bytes]
    metadata: Dict[str, Any]

class MultimodalProcessor:
    """Processes images and PDFs into embeddings"""
    
    def __init__(self):
        # Initialize Gemini Vision for multimodal processing
        self.vision_model = None  # Gemini Pro Vision
        self.text_model = None    # Gemini Pro
        
    async def process_image(self, image_bytes: bytes) -> ProcessedContent:
        """Process image into embedding with OCR"""
        # Implementation here
        pass
        
    async def process_pdf(self, pdf_bytes: bytes) -> ProcessedContent:
        """Process PDF into embedding"""
        # Implementation here
        pass
```

### 2. File Attachment Service (NEW)
```python
# New file: backend/services/file_attachment_service.py
@dataclass
class FileAttachmentMetadata:
    embedding_id: str
    file_type: str
    file_size: int
    walrus_certificate: str
    thumbnail_certificate: Optional[str]
    
class FileAttachmentService:
    """Manages file attachments in Walrus"""
    
    async def store_attachment(self, file_bytes: bytes, file_type: str) -> str:
        """Store file in Walrus, return certificate"""
        pass
        
    async def retrieve_attachment(self, certificate: str) -> bytes:
        """Retrieve file from Walrus"""
        pass
```

### 3. Enhanced HNSWIndexerService Methods (ADDITIONS)
```python
# Add these NEW methods to existing HNSWIndexerService class
class HNSWIndexerService:
    # ... existing methods remain unchanged ...
    
    # NEW METHOD - does not replace add_embedding
    async def add_multimodal_embedding(self,
                                     embedding_id: str,
                                     owner: str,
                                     content_bytes: bytes,
                                     content_type: str,
                                     category: str,
                                     timestamp: str):
        """Add image or PDF embedding - NEW method"""
        # Process through multimodal processor
        processor = MultimodalProcessor()
        
        if content_type.startswith('image/'):
            processed = await processor.process_image(content_bytes)
        elif content_type == 'application/pdf':
            processed = await processor.process_pdf(content_bytes)
        else:
            raise ValueError(f"Unsupported type: {content_type}")
            
        # Store file in Walrus
        attachment_service = FileAttachmentService()
        attachment_cert = await attachment_service.store_attachment(
            content_bytes, content_type
        )
        
        # Add to index using processed embedding
        # Reuse existing internal logic
        await self._add_to_index(
            embedding_id=embedding_id,
            vector=processed.embedding,
            metadata={
                'owner': owner,
                'category': category,
                'content_type': content_type,
                'attachment_cert': attachment_cert,
                'extracted_text': processed.extracted_text,
                'timestamp': timestamp
            }
        )
    
    # NEW METHOD for multimodal search
    async def search_multimodal(self,
                              query: Union[str, bytes],
                              query_type: str = 'text',
                              k: int = 10,
                              **filters) -> List[Dict]:
        """Search with text or image query - NEW method"""
        processor = MultimodalProcessor()
        
        if query_type == 'text':
            query_vector = await processor.text_model.encode(query)
        else:
            query_vector = await processor.vision_model.encode(query)
            
        # Use existing search method
        return await self.search(query_vector, k, **filters)
```

### 4. New Sui Move Structures (ADDITIONS)
```move
// Add to existing vector_index.move - DO NOT modify existing structures

// NEW structure for file attachments
public struct FileAttachment has key, store {
    id: UID,
    embedding_id: address,      // Links to VectorEmbedding
    file_type: String,         
    file_size: u64,
    walrus_certificate: String,
    thumbnail_certificate: String,
    upload_time: u64
}

// NEW event for multimodal content
public struct MultimodalContentAdded has copy, drop {
    embedding_id: address,
    owner: address,
    content_type: String,
    category: String,
    attachment_id: address,
    timestamp: u64
}

// NEW function - does not replace add_embedding
public entry fun add_multimodal_content(
    registry: &mut VectorRegistry,
    walrus_hash: vector<u8>,
    metadata_vector: vector<u64>,
    category: vector<u8>,
    content_type: vector<u8>,
    attachment_cert: vector<u8>,
    ctx: &mut TxContext
) {
    // Implementation similar to add_embedding
    // but creates FileAttachment as well
}
```

### 5. API Endpoint Additions
```python
# Add to existing main.py - NEW endpoints only

@app.post("/api/memories/upload")
async def upload_multimodal_memory(
    file: UploadFile,
    category: str,
    user_id: str = Depends(get_current_user)
):
    """NEW endpoint for image/PDF upload"""
    content = await file.read()
    content_type = file.content_type
    
    # Use the NEW method
    await indexer.add_multimodal_embedding(
        embedding_id=generate_id(),
        owner=user_id,
        content_bytes=content,
        content_type=content_type,
        category=category,
        timestamp=datetime.now().isoformat()
    )

@app.post("/api/memories/search/image")
async def search_by_image(
    file: UploadFile,
    k: int = 10,
    user_id: str = Depends(get_current_user)
):
    """NEW endpoint for image-based search"""
    image_bytes = await file.read()
    
    # Use the NEW method
    results = await indexer.search_multimodal(
        query=image_bytes,
        query_type='image',
        k=k,
        owner_filter=user_id
    )
    return results
```

## Integration Strategy

### Phase 1: Add New Components
1. Create `multimodal_processor.py` service
2. Create `file_attachment_service.py` service
3. Add new methods to `HNSWIndexerService` (non-breaking)
4. Deploy new Sui Move structures (additive)

### Phase 2: Frontend Integration
1. Add file upload UI components
2. Add image search interface
3. Display thumbnails in results
4. Keep existing text search unchanged

### Phase 3: Testing
1. Verify existing text embeddings work unchanged
2. Test new multimodal embeddings
3. Ensure both can coexist in same index
4. Validate search across content types

## Benefits of This Approach

1. **Zero Breaking Changes**: All existing code continues to work
2. **Gradual Adoption**: Users can start using multimodal features when ready
3. **Clean Separation**: New code in new files/methods
4. **Easy Rollback**: Can disable new features without affecting existing ones

## Usage Examples

### Existing Text Flow (Unchanged)
```python
# This continues to work exactly as before
await indexer.add_embedding(
    embedding_id="123",
    owner="user1", 
    walrus_hash="abc",
    metadata_vector=[1,2,3],
    category="personal",
    ibe_identity="",
    timestamp="2024-01-01"
)
```

### New Multimodal Flow
```python
# New capability - does not affect existing flow
await indexer.add_multimodal_embedding(
    embedding_id="456",
    owner="user1",
    content_bytes=image_bytes,
    content_type="image/jpeg",
    category="personal",
    timestamp="2024-01-01"
)
```

## Summary

This design adds multimodal capabilities through:
- New service classes with new names
- New methods that don't replace existing ones  
- New Move structures that complement existing ones
- New API endpoints alongside current ones

All existing functionality remains intact with no changes to current naming or behavior.
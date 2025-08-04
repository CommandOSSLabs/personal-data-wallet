# Multimodal Vector Index Design

## Overview
The vector index system has been enhanced to support multimodal content (text, images, PDFs) using Google Gemini's unified embedding capabilities.

## Key Components

### 1. Multimodal Processing
- **Google Gemini Pro Vision**: Processes images and generates visual embeddings
- **Google Gemini Pro**: Handles text embeddings
- **Unified Embedding Space**: 768-dimensional vectors for all content types
- **Built-in OCR**: Automatic text extraction from images and PDFs

### 2. Content Storage Strategy
- **Text**: Embeddings in HNSW, metadata stores first 500 chars
- **Images**: Original + thumbnail in Walrus, visual embeddings in HNSW
- **PDFs**: Original + first page thumbnail in Walrus, combined embeddings

### 3. Enhanced Data Structures
```move
struct VectorEmbedding {
    content_type: String,           // text, image, pdf
    attachment_hash: Option<String>, // Walrus hash for files
    // ... other fields
}

struct FileAttachment {
    file_type: String,
    walrus_certificate: String,
    thumbnail_hash: Option<String>,
    extracted_text: Option<String>
}
```

### 4. Search Capabilities
- **Cross-modal search**: Find images by text, text by image
- **Unified queries**: Single search across all content types
- **Smart filtering**: By category, content type, or both

### 5. Use Cases
- Personal photo search by description
- Receipt/document organization
- Mixed content memories (text + images)
- Visual similarity search

## Implementation Status
- Simplified design with periodic snapshots (no delta updates)
- Single HNSW index for all content
- Category-based filtering
- Event-driven processing
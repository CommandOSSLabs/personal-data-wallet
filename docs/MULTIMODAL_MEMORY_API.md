# Multimodal Memory API Documentation

## Overview
The Personal Data Wallet backend now supports multimodal memory processing, allowing users to upload images and PDFs along with text content to create rich, searchable memories. The system uses Google Gemini Vision API for OCR and content extraction.

## API Endpoints

### 1. Create Multimodal Memory
**POST** `/api/memories/multimodal`

Creates a new memory with an image or PDF attachment. The backend processes the attachment to extract text content and combines it with any provided text.

#### Request
- **Content-Type**: `multipart/form-data`
- **File Field**: `attachment` (required)
- **Body Fields**:
  - `textContent` (string, optional): Additional text content
  - `category` (string, required): Memory category
  - `userAddress` (string, required): User's wallet address
  - `userSignature` (string, optional): User signature for verification

#### File Constraints
- **Maximum file size**: 10MB
- **Supported formats**: 
  - Images: PNG, JPEG, GIF, WebP, BMP
  - Documents: PDF

#### Example Request (curl)
```bash
curl -X POST "http://localhost:3000/api/memories/multimodal" \
  -H "Content-Type: multipart/form-data" \
  -F "attachment=@/path/to/document.pdf" \
  -F "textContent=This is additional context about the document" \
  -F "category=documents" \
  -F "userAddress=0x742d35Cc6634C0532925a3b8D794B4Af527b1234"
```

#### Example Response
```json
{
  "success": true,
  "memoryId": "backend_temp_1725901234567_abc123",
  "blobId": "walrus_blob_789xyz",
  "attachmentBlobId": "walrus_blob_456def", 
  "vectorId": 42,
  "message": "Multimodal memory processed successfully"
}
```

### 2. Process Multimodal Memory (Direct Blockchain Mode)
**POST** `/api/memories/multimodal/process`

Processes multimodal memory content without creating an on-chain record. Used when the frontend will handle blockchain operations directly.

#### Request Format
Same as create multimodal memory endpoint, but without `userSignature`.

#### Example Request (JavaScript/Fetch)
```javascript
const formData = new FormData();
formData.append('attachment', fileInput.files[0]);
formData.append('textContent', 'Meeting notes from today');
formData.append('category', 'meetings');
formData.append('userAddress', userWalletAddress);

const response = await fetch('/api/memories/multimodal/process', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Processing result:', result);
```

#### Example Response
```json
{
  "success": true,
  "vectorId": 43,
  "blobId": "walrus_blob_content_123",
  "attachmentBlobId": "walrus_blob_file_456",
  "message": "Multimodal memory processed successfully"
}
```

## Processing Pipeline

### 1. File Validation
- Checks file type and size limits
- Validates MIME types for security

### 2. Attachment Storage
- Stores original file in Walrus decentralized storage
- Generates content hash for deduplication
- Creates thumbnail for images (when applicable)

### 3. Content Extraction
- **Images**: Uses Gemini Vision API for OCR and scene description
- **PDFs**: Extracts text content and processes with Vision API
- Handles multiple languages and various document formats

### 4. Text Processing
- Combines extracted text with provided text content
- Generates embeddings using Gemini text embedding model
- Extracts entities and relationships for knowledge graph

### 5. Vector Indexing
- Adds content vectors to HNSW index for similarity search
- Uses batched processing for performance optimization
- Updates user's knowledge graph with new entities

## Error Handling

### File Upload Errors
```json
{
  "success": false,
  "message": "Only images and PDF files are allowed"
}
```

### Processing Errors
```json
{
  "success": false,
  "message": "Failed to process attachment: Unable to extract text from PDF"
}
```

### Storage Errors
```json
{
  "success": false,
  "message": "Failed to store attachment: Walrus storage unavailable"
}
```

## Integration Examples

### Frontend React Component
```jsx
import React, { useState } from 'react';

const MultimodalMemoryUpload = ({ userAddress }) => {
  const [file, setFile] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('attachment', file);
    formData.append('textContent', textContent);
    formData.append('category', category);
    formData.append('userAddress', userAddress);

    try {
      const response = await fetch('/api/memories/multimodal', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Memory created:', result.memoryId);
      } else {
        console.error('Failed to create memory:', result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])}
        required
      />
      
      <textarea
        placeholder="Additional context (optional)"
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
      />
      
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="general">General</option>
        <option value="documents">Documents</option>
        <option value="photos">Photos</option>
        <option value="receipts">Receipts</option>
      </select>
      
      <button type="submit" disabled={!file}>
        Upload Memory
      </button>
    </form>
  );
};
```

## Security Considerations

1. **File Type Validation**: Only images and PDFs are accepted
2. **File Size Limits**: 10MB maximum to prevent abuse
3. **Content Scanning**: Files are processed through Gemini for content safety
4. **User Verification**: User signatures can be required for authentication
5. **Access Control**: Memories are isolated by user wallet address

## Performance Notes

1. **Batch Processing**: Vector indexing uses 5-second batching for efficiency
2. **Caching**: Processed embeddings are cached in memory
3. **Async Processing**: File processing happens asynchronously
4. **Deduplication**: Identical files are deduplicated by content hash
5. **Thumbnail Generation**: Images get optimized thumbnails for quick preview

## Troubleshooting

### Common Issues

1. **"No file uploaded"**: Ensure the file field name is `attachment`
2. **"File too large"**: Reduce file size to under 10MB
3. **"Unsupported file type"**: Use only images or PDF files
4. **"Processing timeout"**: Large files may take longer to process
5. **"Walrus storage unavailable"**: Retry after network issues resolve

### Debug Mode
Enable debug logging to see detailed processing steps:
```bash
export LOG_LEVEL=debug
npm run start:dev
```

This will show detailed logs for file processing, OCR extraction, and vector indexing steps.
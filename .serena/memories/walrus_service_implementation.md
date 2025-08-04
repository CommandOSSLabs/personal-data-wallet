# WalrusService Implementation Details

## Overview
The Personal Data Wallet project uses a custom **WalrusService** implementation (NOT the official Mysten WalrusClient) for decentralized storage operations.

## Location
`backend/src/infrastructure/walrus/walrus.service.ts`

## Key Implementation Details

### Configuration
- **API URL**: Configured via `WALRUS_API_URL` env var (defaults to `https://api.walrus.ai/v1`)
- **Authentication**: Uses `WALRUS_API_KEY` for Bearer token authentication
- **Framework**: NestJS service with dependency injection

### Core Methods

1. **Text Content Operations**
   - `uploadContent(content: string): Promise<string>` - Returns blob ID
   - `retrieveContent(blobId: string): Promise<string>` - Returns content
   - `deleteContent(blobId: string): Promise<boolean>` - Returns success status

2. **File Operations**
   - `uploadFile(buffer: Buffer, filename: string): Promise<string>` - Uses FormData/multipart
   - `downloadFile(blobId: string): Promise<Buffer>` - Returns file buffer

### HTTP Implementation
- Uses **axios** for HTTP requests
- Endpoints:
  - POST `/blobs` - Upload text content
  - GET `/blobs/{blobId}` - Retrieve text content
  - DELETE `/blobs/{blobId}` - Delete content
  - POST `/files` - Upload files (multipart/form-data)
  - GET `/files/{blobId}` - Download files

### Error Handling
- Logs errors using NestJS Logger
- Throws wrapped errors with descriptive messages
- Handles missing API key gracefully (uses dummy key for development)

## Integration Points

### 1. HnswIndexService (`backend/src/memory/hnsw-index/hnsw-index.service.ts`)
- Stores serialized HNSW vector indices as files
- Retrieves indices for similarity search operations

### 2. GraphService (`backend/src/memory/graph/graph.service.ts`)
- Stores knowledge graph JSON representations
- Manages graph persistence and retrieval

### 3. MemoryIngestionService (`backend/src/memory/memory-ingestion/memory-ingestion.service.ts`)
- Stores encrypted memory content
- Returns blob IDs for reference in Sui smart contracts

### 4. MemoryQueryService (`backend/src/memory/memory-query/memory-query.service.ts`)
- Retrieves encrypted content by blob ID
- Handles content deletion when memories are removed

## Important Notes
- This is a **custom implementation**, not the official Mysten SDK
- Designed specifically for the Personal Data Wallet's needs
- Provides a simple, async interface for Walrus storage operations
- All content is encrypted before storage (handled by other services)
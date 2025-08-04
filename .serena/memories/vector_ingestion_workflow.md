# Vector Ingestion Workflow - Complete System Architecture

## System Overview
The Personal Data Wallet implements a decentralized vector indexing system that splits responsibility between:
- **Sui Smart Contract**: Permissioning and state management
- **Off-Chain Backend**: Heavy computation (embedding and indexing) 
- **Walrus Storage**: Decentralized file storage

## Complete Workflow Process

### 1. Ingestion Request & Permission Check
- **Client Initiates**: Calls `Ingest` function on Sui Vector Index Contract with raw text
- **Permission Verification**: Contract checks ownership/permissions for the client
- **Authorization Result**:
  - ❌ **Denied**: Returns "Error: No permission" and stops
  - ✅ **Granted**: Proceeds to off-chain processing

### 2. Off-Chain Processing (Event-Driven)
- **Event Emission**: Contract emits `IngestionRequested` event with raw text
- **Backend Listener**: Off-Chain Backend (HNSW Indexer Service) receives event
- **Vector Creation**: ML model converts text to numerical vector embedding
- **Index Update Process**:
  - Downloads current HNSW index file (`index.bin`) from Walrus
  - Adds new vector to existing index
  - Generates updated `index.bin` file

### 3. Storage & Finalization
- **Upload to Walrus**: Backend uploads updated `index.bin` to decentralized storage
- **Certificate Receipt**: Walrus returns Blob Certificate (cryptographic proof/ID)
- **Contract Finalization**: Backend calls `FinalizeUpdate` with Blob Certificate
- **State Update**: Smart contract verifies certificate and updates pointer to new index
- **Success Acknowledgment**: Contract confirms successful ingestion to original client

## Key Components Integration

### Smart Contract Layer (`sui-contract/`)
- **vector_index.move**: Handles permissions and state management
- **Event System**: Emits events for off-chain coordination
- **Certificate Verification**: Validates Walrus storage proofs

### Off-Chain Backend (`backend/services/`)
- **hnsw_indexer.py**: HNSW indexer service for vector management
- **sui_events_listener.py**: Listens for blockchain events
- **walrus_client.py**: Handles Walrus storage operations
- **Advanced embeddings services**: Convert text to vectors

### Decentralized Storage
- **Walrus**: Stores HNSW index files with cryptographic certificates
- **Blob Certificates**: Ensure data integrity and provenance
- **Version Management**: Maintains index file versioning

## Architecture Benefits
- **Decentralized**: No single point of failure
- **Permission-Based**: Blockchain-enforced access control
- **Scalable**: Off-chain computation for heavy ML operations
- **Verifiable**: Cryptographic proofs for all stored data
- **Event-Driven**: Efficient coordination between components

This workflow enables secure, permissioned vector ingestion while maintaining decentralization and leveraging blockchain for trust and state management.
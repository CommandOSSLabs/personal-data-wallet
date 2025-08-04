# Mysten SEAL Implementation

## Overview
The Personal Data Wallet has integrated Mysten's SEAL (Secure Encrypted Access Layer) for identity-based encryption (IBE) of user memories and chat data.

## Key Components

### SealService (backend/src/infrastructure/seal/seal.service.ts)
- Main service handling SEAL encryption/decryption operations
- Integrates with Sui blockchain via SuiClient
- Manages session keys for user authentication
- Supports threshold encryption (default: 2 key servers)

### Core Features
1. **Encryption**: Encrypts user content using IBE with user's Sui address as identity
2. **Decryption**: Requires user signature for session key creation
3. **Session Management**: Caches session keys with TTL
4. **Batch Operations**: Supports fetching multiple keys for efficiency
5. **Backup Keys**: Generates symmetric backup keys (not yet implemented for decryption)

### Configuration
- SEAL_NETWORK: Network to use (mainnet/testnet/devnet)
- SEAL_PACKAGE_ID: Sui package ID for SEAL contract
- SEAL_MODULE_NAME: Module name (default: 'access_control')
- SEAL_THRESHOLD: Number of key servers required (default: 2)
- SEAL_SESSION_TTL_MIN: Session key TTL in minutes (default: 60)
- SEAL_KEY_SERVER_IDS: Optional custom key server IDs

### Testing
- Unit tests: backend/src/infrastructure/seal/seal.service.spec.ts
- Integration test: backend/src/test/test-seal-sui-integration.ts
- Covers encryption, decryption, session management, and error handling
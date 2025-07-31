# Seal Encryption Service

This TypeScript service provides Identity-Based Encryption (IBE) capabilities using Mysten Labs' Seal library for the Personal Data Wallet project.

## Overview

The Seal service acts as a bridge between our Python backend and the Seal IBE encryption system, providing:

- **Real IBE Encryption**: Using Mysten Labs' Seal library
- **Decentralized Key Management**: Multiple key servers with threshold encryption
- **Sui Integration**: On-chain access control policies
- **RESTful API**: HTTP endpoints for encryption/decryption operations

## Architecture

```
┌─────────────────┐    HTTP API    ┌─────────────────┐    Seal SDK    ┌─────────────────┐
│  Python Backend │◄──────────────►│ TypeScript      │◄──────────────►│ Seal Key       │
│  (HNSW Indexer) │                │ Seal Service    │                │ Servers         │
└─────────────────┘                └─────────────────┘                └─────────────────┘
                                            │                                   │
                                            ▼                                   ▼
                                   ┌─────────────────┐                ┌─────────────────┐
                                   │ Sui Blockchain  │                │ Walrus Storage  │
                                   │ (Access Control)│                │ (Encrypted Data)│
                                   └─────────────────┘                └─────────────────┘
```

## Features

### Encryption Operations
- **IBE Encryption**: Encrypt data using identity strings
- **Session Key Creation**: Generate decryption keys with access validation
- **Secure Decryption**: Decrypt data using session keys

### Access Control
- **Policy Validation**: Verify Sui-based access policies
- **Signature Verification**: Validate user signatures
- **Threshold Security**: Configurable t-out-of-n key server setup

### Service Management
- **Health Checks**: Monitor service and key server availability
- **Configuration**: Flexible testnet/mainnet configuration
- **Error Handling**: Comprehensive error reporting and logging

## Quick Start

### Prerequisites

- Node.js 18+ 
- TypeScript
- Access to Sui testnet/mainnet
- Seal testnet key servers (for testing)

### Installation

```bash
cd seal-service
npm install
```

### Configuration

Create `.env` file from example:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

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

# Key Server Object IDs (get from Mysten Labs)
SEAL_KEY_SERVER_1=0x...
SEAL_KEY_SERVER_2=0x...
```

### Development

```bash
# Build TypeScript
npm run build

# Start development server with hot reload
npm run dev

# Start production server
npm start
```

### Testing

```bash
# Run health check
curl http://localhost:8080/health

# Get service info
curl http://localhost:8080/info
```

## API Reference

### Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "service": "seal-encryption-service",
  "version": "1.0.0",
  "keyServers": 2,
  "threshold": 1
}
```

### Service Information

```http
GET /info
```

**Response:**
```json
{
  "service": "seal-encryption-service",
  "version": "1.0.0",
  "keyServers": 2,
  "threshold": 1,
  "network": "testnet"
}
```

### Encryption

```http
POST /encrypt
```

**Request:**
```json
{
  "data": "48656c6c6f20576f726c64",  // hex-encoded data
  "identity": "owner:0x123|category:chat|policy:abc123",
  "policy": {
    "owner": "0x123",
    "category": "chat",
    "access_rules": ["owner:0x123"]
  }
}
```

**Response:**
```json
{
  "encrypted_data": "base64-encoded-encrypted-data",
  "servers_used": 2,
  "timestamp": "2024-01-15T10:30:00Z",
  "success": true
}
```

### Key Request

```http
POST /request-key
```

**Request:**
```json
{
  "ibe_identity": "owner:0x123|category:chat|policy:abc123",
  "sui_ptb": {
    "transaction_type": "access_request",
    "user_address": "0x123",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "signature": "user-signature"
}
```

**Response:**
```json
{
  "decryption_key": "base64-encoded-session-key",
  "metadata": {
    "identity": "owner:0x123|category:chat|policy:abc123",
    "servers_contacted": 2,
    "threshold_met": true,
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "success": true
}
```

### Decryption

```http
POST /decrypt
```

**Request:**
```json
{
  "encrypted_data": "base64-encoded-encrypted-data",
  "decryption_key": "base64-encoded-session-key",
  "identity": "owner:0x123|category:chat|policy:abc123"
}
```

**Response:**
```json
{
  "decrypted_data": "48656c6c6f20576f726c64",  // hex-encoded
  "success": true
}
```

## Integration with Python Backend

The Python `SealEncryptionService` automatically detects and uses this service when:

1. `use_real_seal=True` in configuration
2. Service is running on configured URL (default: `http://localhost:8080`)

### Configuration in Python

```python
# backend/config.py
class Settings(BaseSettings):
    use_real_seal: bool = True  # Enable real Seal integration
    seal_service_url: str = "http://localhost:8080"
```

### Usage Example

```python
# The Python service automatically uses real Seal when configured
seal_service = SealEncryptionService()

# This will use real Seal IBE if use_real_seal=True
encrypted_result = await seal_service.encrypt_data(
    data=b"Hello World",
    policy=policy_dict,
    object_id="test_001"
)
```

## Security Considerations

### Development vs Production

- **Development**: Uses simulated key servers and relaxed validation
- **Production**: Requires real key servers and strict signature validation

### Key Server Configuration

- **Testnet**: Use Mysten Labs provided testnet key servers
- **Mainnet**: Use production key servers or run your own
- **Threshold**: Configure appropriate t-out-of-n threshold for your security needs

### Access Control

- **Sui PTB Validation**: Ensures only authorized users can decrypt
- **Signature Verification**: Validates user ownership
- **Policy Enforcement**: On-chain access control rules

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Ensure service is running on correct port
   - Check firewall settings
   - Verify network connectivity to Sui RPC

2. **Key Server Issues**
   - Verify key server object IDs are correct
   - Check threshold configuration
   - Ensure key servers are accessible

3. **Encryption Failures**
   - Validate identity string format
   - Check data encoding (hex for input)
   - Verify policy structure

### Debugging

Enable debug logging:

```env
LOG_LEVEL=debug
```

Check service logs for detailed error information.

## Development Roadmap

- [ ] **Mainnet Integration**: Support for production key servers
- [ ] **Advanced Policies**: Complex access control rules
- [ ] **Key Rotation**: Automatic key server rotation
- [ ] **Metrics**: Prometheus metrics integration
- [ ] **Clustering**: Multi-instance deployment support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## License

MIT License - see LICENSE file for details
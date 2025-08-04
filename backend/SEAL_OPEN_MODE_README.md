# SEAL Open Mode Implementation

This document describes the SEAL (Secure Encrypted Access Layer) implementation in **open mode** for the Personal Data Wallet.

## Overview

In open mode, SEAL key servers:
- Accept decryption requests for **any** onchain package
- Use a single master key to serve all access policies
- Do not verify package ownership or restrictions
- Are suitable for testing and public deployments

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Enable SEAL open mode (default: true)
SEAL_OPEN_MODE=true

# SEAL network configuration
SEAL_NETWORK=testnet
SEAL_THRESHOLD=2
SEAL_SESSION_TTL_MIN=60

# Optional: Custom key server IDs (comma-separated)
# If empty, uses allowlisted servers for the network
SEAL_KEY_SERVER_IDS=

# Optional: Custom Sui RPC URL
SUI_RPC_URL=
```

## Services

### 1. SealService (Enhanced)

The main `SealService` now supports both open and permissioned modes:

```typescript
// Open mode: encrypt with any package
const result = await sealService.encrypt(
  content,
  userAddress,
  customPackageId // Any package ID
);

// Open mode: decrypt with any package
const decrypted = await sealService.decrypt(
  encrypted,
  userAddress,
  signature,
  customPackageId,
  customModuleName
);
```

### 2. SealOpenModeService

Dedicated service for open mode operations:

```typescript
// Encrypt with explicit package and identity
const result = await openModeService.encrypt(
  content,
  packageId,
  identity
);

// Batch operations
const results = await openModeService.batchEncrypt(items);
```

### 3. SealOpenModeController

REST API endpoints for open mode:

- `POST /seal/open-mode/session-message` - Get session key message
- `POST /seal/open-mode/encrypt` - Encrypt content
- `POST /seal/open-mode/decrypt` - Decrypt content
- `POST /seal/open-mode/batch-encrypt` - Batch encrypt
- `POST /seal/open-mode/test` - Test functionality
- `GET /seal/open-mode/status` - Get service status

## Usage Examples

### Basic Encryption/Decryption

```typescript
// 1. Get session message
const messageBytes = await sealService.getSessionKeyMessage(
  userAddress,
  packageId
);

// 2. User signs the message
const signature = await keypair.signPersonalMessage(messageBytes);

// 3. Encrypt content
const { encrypted, backupKey } = await sealService.encrypt(
  'Secret message',
  userAddress,
  packageId
);

// 4. Decrypt content
const decrypted = await sealService.decrypt(
  encrypted,
  userAddress,
  signature.signature,
  packageId,
  moduleName
);
```

### Using Open Mode Service

```typescript
// Create custom identity
const identity = `app:${appId}:${userAddress}`;

// Encrypt with metadata
const result = await openModeService.encrypt(
  content,
  packageId,
  identity
);

console.log(result.metadata); // { packageId, identity, threshold, network }
```

## Key Features

1. **Any Package Support**: Encrypt/decrypt using any Sui package ID
2. **Custom Identities**: Use any identity format for encryption
3. **Batch Operations**: Efficiently encrypt multiple items
4. **Session Management**: Automatic session key caching per package
5. **Backward Compatible**: Works with existing SEAL integrations

## Security Considerations

⚠️ **Important**: Open mode is less secure than permissioned mode:

- No package verification
- No access control at key server level
- Suitable for testing and public data
- NOT recommended for sensitive production data

For production with sensitive data, use permissioned mode:
```env
SEAL_OPEN_MODE=false
```

## Testing

Run the open mode tests:

```bash
npm run test:seal-open-mode
```

Or manually:
```bash
ts-node src/test/test-seal-open-mode.ts
```

## Migration from Permissioned Mode

To switch from permissioned to open mode:

1. Set `SEAL_OPEN_MODE=true` in environment
2. No code changes required for basic operations
3. Can now use custom package IDs in encrypt/decrypt
4. Existing encrypted data remains accessible

## Troubleshooting

### Common Issues

1. **"Package not found" errors**
   - Ensure the package exists on-chain
   - Check network configuration matches package deployment

2. **"Invalid signature" errors**
   - Ensure correct package ID in session key
   - Verify signature matches the session message

3. **"Key server unreachable"**
   - Check network connectivity
   - Verify key server IDs are correct

### Debug Mode

Enable detailed logging:
```typescript
// In seal-open-mode.config.ts
openMode: {
  enableDetailedLogging: true
}
```

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Application   │────▶│  SealService /   │────▶│  SEAL Client    │
│                 │     │ OpenModeService  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  Key Servers    │
                                                  │  (Open Mode)    │
                                                  └─────────────────┘
```

## References

- [SEAL Documentation](https://docs.sui.io/guides/developer/cryptography/seal)
- [SEAL SDK](https://www.npmjs.com/package/@mysten/seal-sdk)
- [Sui Documentation](https://docs.sui.io/)
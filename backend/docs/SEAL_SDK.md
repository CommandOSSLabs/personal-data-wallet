# Seal SDK Documentation

## Overview

Seal is a decentralized secrets management (DSM) service that relies on access control policies defined and validated on Sui blockchain. It enables identity-based encryption (IBE) and decryption of sensitive data, with access controlled by onchain policies. Lightweight key servers enforce these policies and provide threshold-based decryption keys.

Key capabilities:
- Identity-Based Encryption (IBE) for flexible data encryption
- Threshold secret sharing (t-out-of-n) for resilient key management
- Onchain access control via Sui Move packages
- Decentralized key server architecture
- Session-based authentication for secure key access

## Installation

```bash
npm install @mysten/seal
```

## Design Architecture

### Core Components

1. **Access Policies (Onchain)**
   - Defined in Sui Move packages
   - Controls IBE identity subdomains
   - Determines key access authorization through `seal_approve` functions
   - Supports various policy types (token-gated, subscription-based, time-locked, allowlist)

2. **Key Servers (Offchain)**
   - Hold IBE master secret keys
   - Evaluate onchain access policies
   - Return derived secret keys when authorized
   - Support multiple server configurations and t-out-of-n threshold encryption

### Cryptographic Primitives
- **KEM (Key Encapsulation Mechanism)**: Boneh-Franklin IBE with BLS12-381 curve
- **DEM (Data Encapsulation Mechanism)**: AES-256-GCM
- Future support planned for post-quantum primitives

## Key Components

### SealClient
Main client for encryption and decryption operations:
- **encrypt()** - Encrypts data under an identity using IBE
- **decrypt()** - Decrypts encrypted data using cached keys
- **fetchKeys()** - Pre-fetches keys from key servers for better performance
- **getKeyServers()** - Retrieves configured key server information

### SessionKey
Authentication mechanism for interacting with key servers:
- Ephemeral key pair for secure communication
- Used to authorize decryption operations
- Can be exported/imported for persistence

### Configuration Options
```typescript
interface EncryptOptions {
  kemType?: KemType;       // Key encapsulation mechanism
  demType?: DemType;       // Data encapsulation mechanism  
  threshold: number;        // Number of key servers needed for decryption
  packageId: string;        // Namespace identifier (your Move package ID)
  id: string;              // Identity to encrypt under
  data: Uint8Array;        // Data to encrypt
  aad?: Uint8Array;        // Additional authenticated data
}

interface KeyServerConfig {
  objectId: string;        // On-chain object ID of key server
  weight: number;          // Server weight for threshold calculation
  apiKeyName?: string;     // API key name for authentication
  apiKey?: string;         // API key value
}
```

## Getting Started

### 1. Choose Key Servers
- Use verified key servers in Testnet/Mainnet
- For permissioned servers, get allowlist access for your policy package ID

### 2. Initialize Client
```typescript
const client = new SealClient({
  suiClient,
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false, // Set to true for production
});
```

### 3. Encrypt Data
```typescript
const { encryptedObject: encryptedBytes, key: backupKey } = await client.encrypt({
  threshold: 2,
  packageId: fromHEX(packageId),
  id: fromHEX(id),
  data,
});
// IMPORTANT: Store backupKey securely - it can decrypt the data independently
```

### 4. Create Access Policy (Move Contract)
```move
module my_package::my_module {
    public fun seal_approve(
        id: vector<u8>,
        // Your access control parameters
    ): bool {
        // Implement access control logic
        true
    }
}
```

### 5. Decrypt Data
```typescript
// Create transaction with seal_approve call
const tx = new Transaction();
tx.moveCall({
    target: `${packageId}::${moduleName}::seal_approve`,
    arguments: [
        tx.pure.vector("u8", fromHEX(id)),
        // Other arguments based on your policy
    ]
});

// Create session and get user signature
const sessionKey = new SessionKey();
const txBytes = await tx.build({ client: suiClient });

// Decrypt
const decryptedBytes = await client.decrypt({
    data: encryptedBytes,
    sessionKey,
    txBytes,
    checkShareConsistency: true // Enable for untrusted encryptors
});
```

## Security Best Practices

### 1. Threshold Configuration
- Choose appropriate t-out-of-n settings (e.g., 2-of-3, 3-of-5)
- Balance fault tolerance with security guarantees
- Avoid configurations that could lead to data loss

### 2. Key Server Selection
- Choose servers from trusted organizations
- Verify provider's Full node dependencies and redundancy
- Establish clear service expectations

### 3. Envelope Encryption Strategy
- Use envelope encryption for sensitive/large datasets
- Generate separate symmetric keys for data encryption
- Enable easy key rotation without re-encrypting data

### 4. Symmetric Key Management
- **Critical**: Securely store the symmetric key returned from `encrypt()`
- This key can decrypt data independently of key servers
- Consider returning keys to users for direct management
- Prevent key leakage at all costs

### 5. Audit and Logging
- Implement robust audit logging for key access
- Track decryption attempts and events
- Use tamper-evident logging systems
- Note: Key server interactions aren't automatically logged on-chain

## Key Server Providers

### Testnet (Free)
Key servers available for development and testing

### Mainnet Providers
Each provider sets their own pricing and rate limits:
- **Ruby Nodes**
- **NodeInfra**
- **Overclock**
- **Studio Mirai**
- **H2O Nodes**
- **Triton One**
- **Enoki by Mysten Labs** (requires dashboard signup)

Providers offer two modes:
- **Open mode**: Public/trial use
- **Permissioned mode**: Dedicated/commercial use

## Advanced Features

### Time-Lock Encryption
Encrypt data that can only be decrypted after a specific time

### Token-Gated Access
Restrict decryption to holders of specific tokens

### Subscription-Based Access
Implement recurring access control for content

### Performance Optimization
- Pre-fetch keys using `fetchKeys()` for batch operations
- Cache session keys for reuse
- Use envelope encryption for large files

## Integration with Personal Data Wallet

Seal SDK can enhance privacy in the personal data wallet by:
- Encrypting sensitive memory content before Walrus storage
- Using identity-based encryption for user-specific data
- Providing threshold decryption for high-availability
- Enabling privacy-preserving data sharing with access control

### Implementation Ideas

1. **Private Memory Storage**
   - Encrypt memory content with user's wallet address as identity
   - Store encrypted data on Walrus
   - Use Move contract to control access based on ownership

2. **Secure Metadata Vectors**
   - Encrypt Gemini-generated embedding vectors (768 dimensions)
   - Link encrypted vectors with blob IDs
   - Enable similarity search on encrypted metadata

3. **Controlled Memory Sharing**
   - Create allowlist-based access policies
   - Share specific memories with designated recipients
   - Time-bound access for temporary sharing

4. **Recovery Mechanism**
   - Use 2-of-3 threshold for resilience
   - Backup symmetric keys securely
   - Enable account recovery through social recovery

## Resources

- [Official Documentation](https://seal-docs.wal.app/)
- [GitHub Repository](https://github.com/MystenLabs/seal)
- [TypeScript SDK Docs](https://sdk.mystenlabs.com/seal)
- [Sui Discord](https://discord.gg/sui) - For support and questions
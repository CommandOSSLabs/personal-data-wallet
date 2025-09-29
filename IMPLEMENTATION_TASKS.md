# PDW SDK Integration - Immediate Implementation Tasks

## Phase 1: Critical Blocking Issues (Next 2-3 Weeks)

### Task 1: Deploy wallet.move Contract (Week 1)

#### 1.1 Create Move Contract Structure

Create `smart-contract/sources/wallet.move`:

```move
module personal_data_wallet::wallet {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};
    use std::string::String;
    
    /// Main wallet identity for users
    struct MainWallet has key, store { 
        id: UID,
        owner: address,
        created_at: u64,
        context_salt: vector<u8>,
    }
    
    /// App-specific context wallet  
    struct ContextWallet has key, store {
        id: UID,
        app_id: String,
        owner: address,
        policy_ref: Option<String>, 
        created_at: u64,
    }
    
    public fun create_main_wallet(ctx: &mut TxContext): MainWallet {
        MainWallet {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            created_at: tx_context::epoch(ctx),
            context_salt: b"default_salt", // TODO: Generate random
        }
    }
    
    public fun create_context_wallet(
        app_id: String, 
        ctx: &mut TxContext
    ): ContextWallet {
        ContextWallet {
            id: object::new(ctx),
            app_id,
            owner: tx_context::sender(ctx),
            policy_ref: option::none(),
            created_at: tx_context::epoch(ctx),
        }
    }
}
```

#### 1.2 Deploy to Testnet

Update `smart-contract/deploy_testnet.sh`:

```bash
#!/bin/bash
sui client publish --gas-budget 100000000 --skip-dependency-verification
echo "Deployed wallet contracts. Update packageId in SDK configuration."
```

#### 1.3 Update SDK Configuration

Update `packages/pdw-sdk/src/config/defaults.ts`:

```typescript
export const createDefaultConfig = (): PDWConfig => ({
  packageId: 'NEW_PACKAGE_ID_FROM_DEPLOYMENT', // Update this
  apiUrl: 'http://localhost:3001/api',
  // ... other config
});
```

### Task 2: Complete PermissionService Implementation (Week 2)

#### 2.1 Replace TODO Implementations

Update `packages/pdw-sdk/src/access/PermissionService.ts`:

```typescript
async grantPermissions(userAddress: string, options: GrantPermissionsOptions): Promise<AccessGrant> {
  // Replace TODO with actual implementation
  const tx = new Transaction();
  tx.moveCall({
    target: `${this.packageId}::seal_access_control::grant_access`,
    arguments: [
      tx.pure(options.contextId),
      tx.pure(options.recipientAppId),
      tx.pure(options.scopes),
      tx.pure(options.expiresAt || 0)
    ]
  });
  
  // Execute transaction (need signer from caller)
  // Store policy blob in Walrus for quick access
  // Return actual grant object
}

async checkPermission(appId: string, userAddress: string, scope: string): Promise<boolean> {
  // Replace mock implementation with real on-chain query
  const response = await this.suiClient.getOwnedObjects({
    owner: userAddress,
    filter: {
      StructType: `${this.packageId}::seal_access_control::AccessGrant`
    }
  });
  
  // Check if any grants match appId and scope
  return response.data.some(obj => {
    // Parse grant data and validate scope
    return true; // TODO: Implement actual validation
  });
}
```

#### 2.2 Integrate Permission Validation in SEAL

Update `packages/pdw-sdk/src/security/SealService.ts`:

```typescript
async decrypt(
  encryptedObject: EncryptedObject, 
  sessionKey: SessionKey, 
  requesterAppId: string
): Promise<any> {
  // Add permission check before decrypt
  const hasPermission = await this.permissionService.checkPermission(
    requesterAppId,
    encryptedObject.identity,
    'read:memories'
  );
  
  if (!hasPermission) {
    throw new Error(`Permission denied: ${requesterAppId} cannot decrypt data for ${encryptedObject.identity}`);
  }
  
  // Proceed with SEAL decrypt
  return await this.sealClient.decrypt({
    data: encryptedObject,
    sessionKey,
    txBytes: undefined // Add approval transaction if needed
  });
}
```

### Task 3: Enable MainWalletService (Week 2)

#### 3.1 Replace Mock Implementation

Update `packages/pdw-sdk/src/wallet/MainWalletService.ts`:

```typescript
async getMainWallet(userAddress: string): Promise<MainWallet | null> {
  try {
    const response = await this.suiClient.getOwnedObjects({
      owner: userAddress,
      filter: {
        StructType: `${this.packageId}::wallet::MainWallet`
      },
      options: {
        showContent: true,
        showType: true
      }
    });

    if (response.data.length === 0) {
      return null;
    }
    
    const walletObject = response.data[0];
    const fields = walletObject.data?.content?.fields as any;
    
    return {
      owner: userAddress,
      walletId: walletObject.data?.objectId || '',
      createdAt: parseInt(fields?.created_at || '0'),
      salts: {
        context: Buffer.from(fields?.context_salt || []).toString('hex')
      }
    };
  } catch (error) {
    console.error('Error fetching main wallet:', error);
    return null;
  }
}

async createMainWallet(options: CreateMainWalletOptions): Promise<MainWallet> {
  const tx = new Transaction();
  
  tx.moveCall({
    target: `${this.packageId}::wallet::create_main_wallet`,
    arguments: []
  });
  
  // Execute transaction with signer
  // Return created wallet data
  // TODO: Add signer parameter and execute transaction
  throw new Error('createMainWallet requires signer - implement transaction execution');
}
```

## Phase 2: Integration Testing (Week 3)

### Task 4: Create Integration Tests

Create `packages/pdw-sdk/test/integration/wallet-integration.test.ts`:

```typescript
describe('Wallet Integration', () => {
  test('should create main wallet on-chain', async () => {
    // Test actual wallet creation
    // Verify on-chain data matches expected structure
  });
  
  test('should derive deterministic context IDs', async () => {
    // Test context ID derivation with real wallet data
  });
});
```

Create `packages/pdw-sdk/test/integration/permission-integration.test.ts`:

```typescript
describe('Permission Integration', () => {
  test('should grant and validate permissions on-chain', async () => {
    // Test real permission flows
  });
  
  test('should deny access without proper permissions', async () => {
    // Test permission enforcement
  });
});
```

### Task 5: Update Client Extension

Update `packages/pdw-sdk/src/client/PersonalDataWallet.ts`:

```typescript
// Expose wallet management methods
wallet: {
  createMainWallet: this.#mainWallet.createMainWallet.bind(this.#mainWallet),
  getMainWallet: this.#mainWallet.getMainWallet.bind(this.#mainWallet),
  deriveContextId: this.#mainWallet.deriveContextId.bind(this.#mainWallet),
},

// Expose permission methods  
permissions: {
  requestConsent: this.#permission.requestConsent.bind(this.#permission),
  grantPermissions: this.#permission.grantPermissions.bind(this.#permission),
  checkPermission: this.#permission.checkPermission.bind(this.#permission),
},
```

## Success Validation

### Week 1 Success Criteria

- [ ] wallet.move deployed to testnet successfully
- [ ] SDK can query MainWallet objects from on-chain
- [ ] Context derivation works with real on-chain data

### Week 2 Success Criteria

- [ ] PermissionService performs real on-chain operations
- [ ] SEAL decrypt validates permissions before decryption
- [ ] Cross-app permission grants work end-to-end

### Week 3 Success Criteria

- [ ] Integration tests pass with real blockchain interactions
- [ ] Reference implementation demonstrates full workflow
- [ ] External developers can follow integration guide

## Immediate Next Actions

1. **Create wallet.move contract** (Priority: Urgent)
2. **Deploy to testnet and update packageId** (Priority: Urgent)  
3. **Replace PermissionService TODOs** (Priority: High)
4. **Test end-to-end permission flows** (Priority: High)
5. **Create integration documentation** (Priority: Medium)

After completing these tasks, the PDW SDK will transition from "promising infrastructure" to "production-ready dApp integration platform" that enables real cross-app data sharing.

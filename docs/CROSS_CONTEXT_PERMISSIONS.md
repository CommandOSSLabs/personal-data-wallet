# Cross-Context Permission System

## Overview

The Personal Data Wallet implements a sophisticated cross-context permission system that allows users to maintain complete control over their data while enabling secure data sharing between applications.

## Architecture

### Three-Tier Wallet Structure

```
User (0xUSER123...)
│
├─ MainWallet (Discoverable)
│  ├─ owner: 0xUSER123...
│  ├─ context_salt: random_bytes
│  └─ Registered in WalletRegistry
│
├─ ContextWallet (Social App)
│  ├─ app_id: "social_app"
│  ├─ context_id: derive_context_id(MainWallet, "social_app")
│  └─ Auto-access: ✅ (no permissions needed)
│
├─ ContextWallet (Medical App)
│  ├─ app_id: "medical_app"
│  ├─ context_id: derive_context_id(MainWallet, "medical_app")
│  └─ Auto-access: ✅ (no permissions needed)
│
└─ ContextWallet (Weather App)
   ├─ app_id: "weather_app"
   ├─ context_id: derive_context_id(MainWallet, "weather_app")
   └─ Auto-access: ✅ (no permissions needed)
```

## Permission Model

### Default Behavior: Context Isolation

**Key Principle:** Each app can freely access its own context without permissions, but requires explicit user authorization to access other contexts.

```
Own-Context Access (Auto-Granted):
├─ Social App → Social Context: ✅ Read/Write (no permission needed)
├─ Medical App → Medical Context: ✅ Read/Write (no permission needed)
└─ Weather App → Weather Context: ✅ Read/Write (no permission needed)

Cross-Context Access (Requires Permission):
├─ Social App → Medical Context: ❌ Denied by default
├─ Social App → Weather Context: ❌ Denied by default
├─ Medical App → Social Context: ❌ Denied by default
└─ Weather App → Medical Context: ❌ Denied by default
```

### Cross-Context Permission Grant Flow

**Scenario:** Social App wants to access Medical App data to show health-related posts.

#### Step 1: User Signs Permission Grant

```typescript
// User connects to Social App and grants permission
grant_cross_context_access(
  registry,
  requesting_app_id: "social_app",      // App requesting access
  source_context_id: "medical_context", // Context to access
  access_level: "read",                 // read or write
  expires_at: now + 30_days,           // Time-limited
  clock,
  ctx
)
```

#### Step 2: Permission Stored On-Chain

```
AccessRegistry.context_permissions:
├─ Key: (medical_context, social_app)
└─ Value: {
      access_level: "read",
      granted_at: 1696118400000,
      expires_at: 1698710400000,
      granted_by: 0xUSER123...
   }
```

#### Step 3: Social App Can Now Decrypt Medical Data

```move
// Social App attempts to decrypt medical data
seal_approve(
  id: medical_content_bytes,
  requesting_app_id: "social_app",
  registry,
  clock,
  ctx
)

// Validation flow:
// 1. ✅ Verify user owns medical_context
// 2. ❌ Not own context (social_app ≠ medical_app)
// 3. ✅ Check permission: (medical_context, social_app) → Found!
// 4. ✅ Check expiry: expires_at > now
// 5. ✅ Grant access - return decryption key
```

## SEAL Integration

### How SEAL Works with Cross-Context Permissions

**SEAL Authorization Layers:**

```
Layer 1: SEAL Key Server
├─ Validates session key is valid
├─ Checks package-specific authorization
└─ Verifies wallet signature

Layer 2: seal_approve (Our Contract)
├─ Validates user owns the context
├─ Checks if app is accessing own context (auto-grant)
├─ Validates cross-context permissions (if applicable)
└─ Returns approval or aborts with ENoAccess
```

**Complete Decryption Flow:**

```typescript
// 1. User connects wallet to Social App
user.connectWallet("social_app")

// 2. User signs session key for Social App package
sessionKey = createSessionKey({
  packageId: "0xSOCIAL_PACKAGE...",
  userAddress: "0xUSER123...",
  ttlMin: 60
})

// 3. Social App builds seal_approve transaction
tx = buildTransaction({
  target: "seal_approve",
  arguments: [
    medical_content_id,
    "social_app",  // requesting_app_id
    registry,
    clock
  ]
})

// 4. User signs transaction
signedTx = wallet.signTransaction(tx)

// 5. SEAL validates and calls seal_approve
// 6. seal_approve checks permissions
// 7. If approved, SEAL returns decryption key
// 8. Social App can decrypt medical data
```

## API Reference

### Core Functions

#### `register_context`

Register a new context wallet for an app.

```move
public entry fun register_context(
    registry: &mut AccessRegistry,
    context_id: String,        // Derived from MainWallet
    app_id: String,           // Application identifier
    clock: &Clock,
    ctx: &mut TxContext
)
```

**Usage:**
```typescript
// App creates context wallet
const contextId = deriveContextId(mainWallet, "social_app")
await client.pdw.call.registerContext({
  contextId,
  appId: "social_app",
  clock,
  registry
}, signer)
```

#### `grant_cross_context_access`

Grant an app permission to access another app's context.

```move
public entry fun grant_cross_context_access(
    registry: &mut AccessRegistry,
    requesting_app_id: String,   // App that wants access
    source_context_id: String,   // Context to access
    access_level: String,        // "read" or "write"
    expires_at: u64,            // Expiration timestamp
    clock: &Clock,
    ctx: &mut TxContext
)
```

**Usage:**
```typescript
// User grants Social App access to Medical context
await client.pdw.call.grantCrossContextAccess({
  requestingAppId: "social_app",
  sourceContextId: medicalContextId,
  accessLevel: "read",
  expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  clock,
  registry
}, signer)
```

#### `revoke_cross_context_access`

Revoke an app's permission to access a context.

```move
public entry fun revoke_cross_context_access(
    registry: &mut AccessRegistry,
    requesting_app_id: String,
    source_context_id: String,
    ctx: &mut TxContext
)
```

**Usage:**
```typescript
// User revokes Social App's access to Medical context
await client.pdw.call.revokeCrossContextAccess({
  requestingAppId: "social_app",
  sourceContextId: medicalContextId,
  registry
}, signer)
```

#### `seal_approve`

SEAL-compliant approval function with cross-context validation.

```move
entry fun seal_approve(
    id: vector<u8>,              // Content ID (SEAL key)
    requesting_app_id: String,   // App requesting decryption
    registry: &AccessRegistry,
    clock: &Clock,
    ctx: &TxContext
)
```

**Called automatically by SEAL during decryption.**

## Security Model

### Isolation Guarantees

1. **Context Isolation:** Apps cannot access other contexts without explicit permission
2. **User Control:** Only the user can grant/revoke cross-context permissions
3. **Time-Limited:** All permissions have expiration dates
4. **Audit Trail:** All permission changes emit events for tracking
5. **SEAL Integration:** Leverages SEAL's session key mechanism for package-level isolation

### Attack Scenarios & Mitigations

#### Scenario 1: Malicious App Tries to Access Medical Data

**Attack:**
```move
// Weather App tries to decrypt medical data
seal_approve(medical_content_id, "weather_app", registry, clock, ctx)
```

**Mitigation:**
- ❌ No permission exists for (medical_context, weather_app)
- ❌ Transaction aborts with ENoAccess
- ✅ Medical data remains secure

#### Scenario 2: App Tries to Impersonate Another App

**Attack:**
```move
// Weather App tries to claim it's Social App
seal_approve(medical_content_id, "social_app", registry, clock, ctx)
```

**Mitigation:**
- ❌ SEAL validates session key is for Weather App package, not Social App package
- ❌ Package mismatch detected at SEAL layer
- ✅ Request rejected before reaching seal_approve

#### Scenario 3: Expired Permission

**Attack:**
```move
// Social App tries to use expired permission
seal_approve(medical_content_id, "social_app", registry, clock, ctx)
```

**Mitigation:**
- ✅ Permission found: (medical_context, social_app)
- ❌ Expiry check fails: expires_at <= current_time
- ❌ Transaction aborts with ENoAccess
- ✅ User must re-grant permission if needed

## Events

### `ContextRegistered`

Emitted when a new context wallet is registered.

```move
public struct ContextRegistered has copy, drop {
    context_id: String,
    app_id: String,
    owner: address,
    timestamp: u64,
}
```

### `CrossContextAccessChanged`

Emitted when cross-context permission is granted or revoked.

```move
public struct CrossContextAccessChanged has copy, drop {
    source_context_id: String,
    requesting_app_id: String,
    access_level: String,
    granted: bool,           // true = granted, false = revoked
    expires_at: u64,
    granted_by: address,
}
```

## Example Use Cases

### Use Case 1: Health & Fitness Integration

**Scenario:** Fitness App wants to show health metrics from Medical App.

```typescript
// 1. User has Medical App with health records
// 2. User installs Fitness App
// 3. Fitness App requests permission
await client.pdw.call.grantCrossContextAccess({
  requestingAppId: "fitness_app",
  sourceContextId: medicalContextId,
  accessLevel: "read",
  expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
  clock,
  registry
}, signer)

// 4. Fitness App can now read medical data
const healthData = await client.pdw.view.getMemories(medicalContextId)
```

### Use Case 2: Social + Shopping

**Scenario:** Shopping App wants to recommend products based on social interests.

```typescript
// User grants Shopping App read access to Social context
await client.pdw.call.grantCrossContextAccess({
  requestingAppId: "shopping_app",
  sourceContextId: socialContextId,
  accessLevel: "read",
  expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
  clock,
  registry
}, signer)

// Shopping App analyzes social posts to recommend products
const interests = await analyzeSocialData(socialContextId)
const recommendations = generateRecommendations(interests)
```

### Use Case 3: Emergency Access

**Scenario:** Emergency Services App needs immediate access to Medical records.

```typescript
// User pre-authorizes emergency access
await client.pdw.call.grantCrossContextAccess({
  requestingAppId: "emergency_services",
  sourceContextId: medicalContextId,
  accessLevel: "read",
  expiresAt: Date.now() + (10 * 365 * 24 * 60 * 60 * 1000), // 10 years
  clock,
  registry
}, signer)

// In emergency, paramedics can instantly access medical history
const medicalHistory = await emergencyApp.getMedicalRecords(userId)
```

## Best Practices

### For App Developers

1. **Request Minimal Permissions:** Only request access to contexts you actually need
2. **Explain Why:** Show users clear explanations of why you need cross-context access
3. **Time-Limit Requests:** Request reasonable expiration times (30-90 days typical)
4. **Handle Denials Gracefully:** Implement fallback behavior if permission is denied
5. **Respect Revocations:** Check permissions regularly and handle revocations

### For Users

1. **Review Carefully:** Understand what context access you're granting
2. **Time-Limit Grants:** Use shorter expiration times for sensitive contexts
3. **Regular Audits:** Periodically review and revoke unnecessary permissions
4. **Emergency Access:** Pre-authorize trusted apps for emergency scenarios
5. **Revoke When Done:** Revoke access when you no longer use an app

## Migration Guide

### From Old Permission Model

**Old Model (Wallet-Address Based):**
```move
// ❌ Old: Permission tied to wallet address
grant_access(registry, recipient_address, content_id, "read", expires_at)
seal_approve(id, registry, clock, ctx) // Only checks wallet address
```

**New Model (App-Context Based):**
```move
// ✅ New: Permission tied to app and context
grant_cross_context_access(registry, requesting_app_id, source_context_id, "read", expires_at)
seal_approve(id, requesting_app_id, registry, clock, ctx) // Validates app + context
```

### Migration Steps

1. **Deploy New Contracts:** Deploy updated `seal_access_control.move` and `wallet.move`
2. **Create Main Wallets:** Users create MainWallet once
3. **Migrate Context Data:** Apps create ContextWallets and migrate existing data
4. **Update SDK Calls:** Update all `seal_approve` calls to include `requesting_app_id`
5. **Re-Grant Permissions:** Users re-grant cross-context permissions with new system

## Troubleshooting

### Common Errors

#### `ENoAccess` (Error Code 1)

**Cause:** App doesn't have permission to access the requested context.

**Solutions:**
- User must grant permission via `grant_cross_context_access`
- Check if permission has expired
- Verify correct app_id is being used

#### `ENotOwner` (Error Code 0)

**Cause:** User doesn't own the context they're trying to grant access to.

**Solutions:**
- Verify context_id belongs to the signing user
- Check that MainWallet is properly registered

#### `EInvalidAppId` (Error Code 6)

**Cause:** Empty or invalid app_id provided.

**Solutions:**
- Ensure app_id is not an empty string
- Use consistent app_id across all operations

#### `EContextNotFound` (Error Code 8)

**Cause:** Context hasn't been registered yet.

**Solutions:**
- Call `register_context` before attempting access
- Verify context_id is correctly derived from MainWallet

## Future Enhancements

### Planned Features

1. **Granular Permissions:** Per-field access control within contexts
2. **Delegation:** Allow apps to delegate permissions to other apps
3. **Consent Templates:** Pre-defined permission sets for common scenarios
4. **Usage Analytics:** Track how apps use cross-context data
5. **Auto-Revocation:** Automatically revoke unused permissions after N days
6. **Multi-Sig Approvals:** Require multiple signatures for sensitive contexts

### Research Areas

1. **Zero-Knowledge Proofs:** Prove data properties without revealing data
2. **Homomorphic Encryption:** Compute on encrypted cross-context data
3. **Differential Privacy:** Add noise to cross-context queries
4. **Blockchain Analytics:** Detect suspicious permission patterns
5. **AI-Powered Recommendations:** Suggest optimal permission configurations

## References

- [SEAL Documentation](https://seal-docs.wal.app/)
- [Sui Move Documentation](https://docs.sui.io/guides/developer/sui-101)
- [Personal Data Wallet Architecture](../TECHNICAL_ARCHITECTURE_DOCUMENT.md)
- [Wallet Module Source](../smart-contract/sources/wallet.move)
- [Access Control Module Source](../smart-contract/sources/seal_access_control.move)

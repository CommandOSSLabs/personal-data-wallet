# Dynamic Fields Architecture - One Paragraph Summary

## Technical Implementation

The Personal Data Wallet implements a parent-child wallet architecture at the **Move smart contract level** (not blockchain-level addressing) where each user has one MainWallet object that stores multiple ContextWallet child objects as Sui dynamic object fields, using human-readable `app_id` strings (e.g., "medical-app", "social-app") as keys within the Move object's internal field storage. While Sui does not natively support app-id as blockchain addresses (all objects still have traditional object IDs like `0xABC123...`), our Move contract achieves O(1) lookups by app name through Sui's dynamic field feature (`dynamic_object_field::borrow(&main_wallet.id, "medical-app")`), where the lookup happens in the Move VM runtime rather than at the blockchain address level. Each ContextWallet contains both a deterministic `contextId` hash (SHA3 for SEAL encryption keys) and exists as a standard Sui object with its own object ID, enabling third-party apps to create contexts via user signature, read other contexts with OAuth-style permission grants (read:own, write:own, read:other, write:other), and store SEAL-encrypted data on Walrus, all while preventing deletion (immutable by design) and providing developers a simple API (`getContextForApp(user, "my-app")`) without requiring address derivation or tracking blockchain addresses manually.

---

## Key Technical Clarifications

### ✅ What We Have:
- **Move-level dynamic fields** with string keys (app_id)
- **O(1) lookups** within the Move contract execution
- **Standard Sui objects** with normal object IDs
- **Human-readable keys** for developer convenience

### ❌ What We Don't Have:
- **Blockchain-level app-id addressing** (not like ENS/DNS)
- **Native Sui support** for human-readable addresses
- **Address derivation requirement** (no need to compute addresses)

### 🎯 What This Means:
- Apps use simple string names ("medical-app") as keys
- Sui handles the storage optimization internally
- No special blockchain features needed beyond standard Move + dynamic fields
- Works entirely within the smart contract layer

---

## Architecture Diagram

```
Blockchain Level (Sui Native):
├─ MainWallet Object ID: 0xMAIN_ABC123...     ← Sui object ID
    └─ Dynamic Fields (Move contract internal storage):
        ├─ Key: "medical-app" (string)
        │   └─ Value: ContextWallet Object ID: 0xCTX_789...
        ├─ Key: "social-app" (string)  
        │   └─ Value: ContextWallet Object ID: 0xCTX_DEF...
        └─ Key: "fitness-app" (string)
            └─ Value: ContextWallet Object ID: 0xCTX_GHI...

Lookup Flow:
1. SDK queries MainWallet by object ID (0xMAIN_ABC123...)
2. Move contract does dynamic_object_field::borrow(id, "medical-app")
3. Move VM returns ContextWallet object (0xCTX_789...)
4. SDK receives standard Sui object response

Result: O(1) lookup by app name, no address derivation needed
```

---

## Benefits Over Traditional Approaches

| Aspect | Our Implementation | Alternative (Derived Addresses) |
|--------|-------------------|--------------------------------|
| **Key Type** | String ("medical-app") | Address (0xDERIVED123...) |
| **Derivation** | Not needed | Must compute hash(user + app) |
| **Developer UX** | Simple: `getContextForApp(user, "medical-app")` | Complex: Must derive then lookup |
| **Sui Level** | Move contract (dynamic fields) | Would require address derivation |
| **Lookup** | O(1) in Move VM | O(1) but requires extra step |
| **Readability** | Human-readable keys | 0x... addresses |
| **Maintenance** | App name stays same | Address changes if derivation changes |

---

## Compatibility with Sui

This implementation is fully compatible with Sui's object model because:

1. ✅ **Uses Standard Dynamic Fields**: Built-in Sui feature, no custom extensions
2. ✅ **Maintains Object IDs**: All objects have proper Sui UIDs
3. ✅ **Move Type System**: Fully type-safe with Move's guarantees
4. ✅ **No Blockchain Changes**: Works on standard Sui testnet/mainnet
5. ✅ **Indexing Support**: Sui indexers can query dynamic fields normally

**Bottom Line**: We leverage Sui's existing features (dynamic fields with string keys) to create a developer-friendly API without requiring any non-standard blockchain features.

---

**Status**: Production-ready with zero TypeScript errors  
**Documentation**: See [DYNAMIC_FIELDS_IMPLEMENTATION.md](./DYNAMIC_FIELDS_IMPLEMENTATION.md) for full details

# SEAL Official Pattern Analysis - The Real Solution

## 🎯 **Key Discovery from Official Examples**

After analyzing the official SEAL examples at https://github.com/MystenLabs/seal/tree/main/examples, I've identified the **critical difference** between our implementation and the official pattern.

---

## 📋 **Official Allowlist Pattern**

### **Move Contract** (`allowlist.move`)

```move
entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, allowlist), ENoAccess);
}

fun approve_internal(caller: address, id: vector<u8>, allowlist: &Allowlist): bool {
    // Check if the id has the right prefix
    let namespace = namespace(allowlist);
    if (!is_prefix(namespace, id)) {
        return false
    };

    // Check if user is in the allowlist
    allowlist.list.contains(&caller)
}
```

**Key Points**:
1. ✅ Uses `ctx.sender()` - the transaction sender
2. ✅ Checks if sender is in the allowlist
3. ✅ Checks if ID has the correct namespace prefix
4. ✅ **NO** comparison between `sender` and `requesting_wallet`

### **Frontend Decryption** (`utils.ts`)

```typescript
// Build transaction for SEAL approval
const tx = new Transaction();
ids.forEach((id) => moveCallConstructor(tx, id));
const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

// Fetch keys from SEAL servers
await sealClient.fetchKeys({ ids, txBytes, sessionKey, threshold: 2 });

// Decrypt locally
const decryptedFile = await sealClient.decrypt({
  data: new Uint8Array(encryptedData),
  sessionKey,
  txBytes,
});
```

**Key Points**:
1. ✅ Transaction built with `onlyTransactionKind: true`
2. ✅ **NO** `tx.setSender()` call
3. ✅ SEAL servers call `dry_run_transaction_block` with **their own context**
4. ✅ The `ctx.sender()` in Move is the **user's address from the session key**

### **Move Call Constructor** (`AllowlistView.tsx`)

```typescript
function constructMoveCall(packageId: string, allowlistId: string): MoveCallConstructor {
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: `${packageId}::allowlist::seal_approve`,
      arguments: [
        tx.pure.vector('u8', fromHex(id)),  // Only ID
        tx.object(allowlistId)               // Only allowlist object
      ],
    });
  };
}
```

**Key Points**:
1. ✅ Only 2 arguments: `id` and `allowlist`
2. ✅ **NO** `requesting_wallet` parameter
3. ✅ The sender is determined by the session key, not the transaction

---

## 🔍 **Our Implementation vs Official Pattern**

### **Our seal_approve Function**

```move
entry fun seal_approve(
    id: vector<u8>,
    requesting_wallet: address,  // ❌ EXTRA PARAMETER
    registry: &AccessRegistry,
    clock: &Clock,
    ctx: &TxContext
) {
    let owner = tx_context::sender(ctx);

    // ❌ WRONG: Comparing sender to requesting_wallet
    if (requesting_wallet == owner) {
        return
    };
    
    // ... complex registry logic
}
```

**Problems**:
1. ❌ Extra `requesting_wallet` parameter not in official pattern
2. ❌ Comparing `sender` to `requesting_wallet` doesn't work in `dry_run`
3. ❌ Complex registry logic instead of simple allowlist check
4. ❌ Using `Clock` for timestamp validation (unnecessary)

### **Official seal_approve Function**

```move
entry fun seal_approve(id: vector<u8>, allowlist: &Allowlist, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, allowlist), ENoAccess);
}
```

**Advantages**:
1. ✅ Simple: only `id` and `allowlist` parameters
2. ✅ Uses `ctx.sender()` directly (set by SEAL servers)
3. ✅ Checks if sender is in allowlist
4. ✅ Checks if ID has correct namespace prefix

---

## 💡 **The Real Issue**

### **How SEAL Key Servers Work**

When you call `sealClient.decrypt()`:

1. **Client sends**: `{ encryptedObject, sessionKey, txBytes }`
2. **Key server extracts**: 
   - `packageId` from encrypted object
   - `id` from encrypted object
   - **User address** from `sessionKey`
3. **Key server calls**: `dry_run_transaction_block(txBytes)`
4. **Key server sets**: `tx_context::sender(ctx)` = **user address from session key**
5. **Move function executes**: `seal_approve(id, allowlist, ctx)`
6. **Move checks**: Is `ctx.sender()` in the allowlist?

### **Why Our Implementation Fails**

Our function signature:
```move
seal_approve(id, requesting_wallet, registry, clock, ctx)
```

When SEAL servers call this:
- `ctx.sender()` = User address (from session key) ✅
- `requesting_wallet` = User address (from transaction argument) ✅
- **But**: We're checking `requesting_wallet == owner` where `owner = ctx.sender()`

**The problem**: In `dry_run_transaction_block`, the `ctx.sender()` might be:
- The key server's address
- A default/zero address
- **NOT** the user's address

**Why**: The `dry_run` doesn't execute with the user's signature, so `ctx.sender()` is unreliable!

---

## 🎯 **The Solution: Follow Official Pattern**

### **Option 1: Simplified Allowlist Pattern (RECOMMENDED)**

Create a simple allowlist-based access control like the official example:

```move
public struct UserAllowlist has key {
    id: UID,
    owner: address,
    allowed: vector<address>,
}

entry fun seal_approve(id: vector<u8>, allowlist: &UserAllowlist, ctx: &TxContext) {
    let caller = tx_context::sender(ctx);
    
    // Owner can always access their own data
    // OR caller must be in the allowed list
    assert!(
        allowlist.owner == caller || allowlist.allowed.contains(&caller),
        ENoAccess
    );
}
```

**Why this works**:
- SEAL servers set `ctx.sender()` to the user's address from the session key
- Simple check: is the user the owner OR in the allowlist?
- No need for `requesting_wallet` parameter
- No need for complex registry logic

### **Option 2: Namespace-Based Self-Access**

Use the ID prefix pattern from the official example:

```move
entry fun seal_approve(
    id: vector<u8>,
    registry: &AccessRegistry,
    ctx: &TxContext
) {
    let caller = tx_context::sender(ctx);
    
    // Check if ID starts with caller's address (self-access)
    let caller_bytes = address::to_bytes(caller);
    if (is_prefix(caller_bytes, id)) {
        return  // Self-access granted
    };
    
    // For cross-user access, check registry
    // ... existing registry logic
}
```

**Why this works**:
- Users encrypt with their address as the ID prefix
- If ID starts with caller's address, it's self-access
- No need for `requesting_wallet` parameter
- Works with `ctx.sender()` from SEAL servers

---

## 📊 **Comparison Table**

| Feature | Our Current | Official Pattern | Recommended Fix |
|---------|-------------|------------------|-----------------|
| Parameters | `id, requesting_wallet, registry, clock, ctx` | `id, allowlist, ctx` | `id, registry, ctx` |
| Self-Access Check | `requesting_wallet == owner` | `allowlist.owner == caller` | `is_prefix(caller, id)` |
| Sender Source | `tx_context::sender(ctx)` | `tx_context::sender(ctx)` | `tx_context::sender(ctx)` |
| Works in dry_run? | ❌ NO | ✅ YES | ✅ YES |
| Complexity | High (registry + timestamps) | Low (simple allowlist) | Medium (registry + prefix) |

---

## 🚀 **Implementation Steps**

### **Step 1: Update Move Contract**

Remove `requesting_wallet` parameter and use prefix-based self-access:

```move
entry fun seal_approve(
    id: vector<u8>,
    registry: &AccessRegistry,
    clock: &Clock,
    ctx: &TxContext
) {
    let caller = tx_context::sender(ctx);
    
    // ✅ SELF-ACCESS: Check if ID starts with caller's address
    assert!(id.length() >= 32, EInvalidTimestamp);
    let caller_bytes = address::to_bytes(caller);
    
    // Extract first 32 bytes of ID (should be user address)
    let mut id_prefix = vector::empty<u8>();
    let mut i = 0;
    while (i < 32 && i < id.length()) {
        id_prefix.push_back(*id.borrow(i));
        i = i + 1;
    };
    
    if (id_prefix == caller_bytes) {
        return  // Self-access granted!
    };
    
    // For cross-user access, check registry permissions
    // ... existing registry logic
}
```

### **Step 2: Update SDK Transaction Building**

Remove `requesting_wallet` parameter:

```typescript
tx.moveCall({
  target: `${this.config.packageId}::seal_access_control::seal_approve`,
  arguments: [
    tx.pure.vector("u8", fromHex(id)),  // Arg 1: Content ID
    tx.object(registryId),               // Arg 2: AccessRegistry
    tx.object('0x6')                     // Arg 3: Clock
  ]
});

// ❌ REMOVE: tx.setSender(userAddress);
// SEAL servers will set the sender from the session key!
```

### **Step 3: Update Test**

Remove `requesting_wallet` from transaction call:

```typescript
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(
  userAddress,  // id: Content identifier
  userAddress   // userAddress: For registry lookup (not for Move call)
  // ❌ REMOVE: requesting_wallet parameter
);
```

---

## ✅ **Expected Result**

After implementing the fix:

1. ✅ SEAL servers call `dry_run_transaction_block`
2. ✅ SEAL servers set `ctx.sender()` = user address (from session key)
3. ✅ Move function extracts first 32 bytes of `id`
4. ✅ Compares `id_prefix` to `caller_bytes`
5. ✅ If match → Self-access granted!
6. ✅ Decryption succeeds!

---

## 🔗 **References**

- **Official Allowlist Example**: https://github.com/MystenLabs/seal/blob/main/examples/move/sources/allowlist.move
- **Official Frontend**: https://github.com/MystenLabs/seal/blob/main/examples/frontend/src/AllowlistView.tsx
- **Official Utils**: https://github.com/MystenLabs/seal/blob/main/examples/frontend/src/utils.ts
- **SEAL Documentation**: https://seal-docs.wal.app/UsingSeal/#decryption

---

## 💭 **Key Takeaway**

**The official pattern is much simpler**:
- ✅ No `requesting_wallet` parameter
- ✅ No `tx.setSender()` call
- ✅ SEAL servers handle sender context
- ✅ Simple allowlist or prefix-based access control

**Our mistake**: Adding extra parameters and trying to manage sender context manually!

**The fix**: Follow the official pattern - let SEAL servers set the sender, and use simple prefix-based self-access! 🎯


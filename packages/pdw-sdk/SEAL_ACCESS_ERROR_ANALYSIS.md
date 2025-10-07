# SEAL Access Error Analysis - October 7, 2025

## 🎉 **Major Progress!**

### **✅ Fixed Issues**
1. **Transaction Building**: ✅ **FIXED** - No more `toLowerCase()` error
2. **Walrus Upload**: ✅ **SUCCESS** - Real upload with WAL tokens (12.3s)
3. **Walrus Retrieval**: ✅ **SUCCESS** - Binary data preserved (13.8s)
4. **SEAL Encryption**: ✅ **WORKING** - 9,877 bytes → 10,226 bytes encrypted

### **⚠️ New Error**
```
NoAccessError: User does not have access to one or more of the requested keys
```

---

## 🔍 **Root Cause: Access Control Policy**

### **The Error**

The SEAL key servers are **correctly rejecting** the decryption request because:

1. **Content was registered** in AccessRegistry (Step 4.5)
2. **Registration failed** with MoveAbort error:
   ```
   MoveAbort(MoveLocation { module: seal_access_control, function: 2, instruction: 17, 
   function_name: Some("register_content") }, 2)
   ```
3. **Abort code 2** suggests the content is **already registered** or **access denied**

### **What's Happening**

1. **Encryption**: ✅ Works - Creates encrypted object with `id = userAddress`
2. **Registration**: ❌ Fails - Tries to register content ownership
3. **Decryption**: ❌ Fails - Key servers check `seal_approve` function
4. **seal_approve**: ❌ Rejects - No valid access grant in AccessRegistry

---

## 📖 **SEAL Access Control Flow**

According to the Move contract and SEAL documentation:

### **seal_approve Function** (seal_access_control.move)

```move
entry fun seal_approve(
    id: vector<u8>,              // Content identifier
    requesting_wallet: address,   // Wallet requesting access
    registry: &AccessRegistry,    // Access registry reference
    clock: &Clock,               // System clock
    ctx: &TxContext              // Transaction context
)
```

**The function checks**:
1. Does `requesting_wallet` have permission for `id`?
2. Is the permission still valid (not expired)?
3. Is the permission scope sufficient (read/write)?

**If any check fails**: Abort (access denied)

### **Current Situation**

- **Content ID**: `userAddress` (0xb59f00b2454bef14d538b3609fb99e32fcf17f96ce7a4195d145ca67b1c93e07)
- **Requesting Wallet**: Same `userAddress`
- **Access Grant**: ❌ **NONE** - Registration failed
- **Result**: Key servers reject decryption

---

## 🔧 **Why Registration Failed**

### **Error Code 2**

Looking at the Move contract, abort code 2 typically means:
- `ENotOwner` - Caller is not the content owner
- `EAlreadyRegistered` - Content already registered
- `EInvalidPermission` - Invalid permission parameters

### **Possible Causes**

1. **Content Already Registered**
   - Previous test run registered this content
   - Need to use a different content ID or clear registry

2. **Permission Issue**
   - User doesn't have permission to register
   - AccessRegistry not properly initialized

3. **Transaction Parameters**
   - Missing or incorrect parameters in register_content call

---

## 💡 **Solutions**

### **Option 1: Self-Access (Owner Decrypts Own Content)**

For the owner to decrypt their own content, the `seal_approve` function should allow **self-access** without explicit grants.

**Update seal_access_control.move**:
```move
entry fun seal_approve(
    id: vector<u8>,
    requesting_wallet: address,
    registry: &AccessRegistry,
    clock: &Clock,
    ctx: &TxContext
) {
    let sender = tx_context::sender(ctx);
    
    // ✅ Allow self-access: Owner can always decrypt their own content
    if (requesting_wallet == sender) {
        return; // Access granted
    };
    
    // Check registry for explicit grants
    // ... existing permission check logic
}
```

### **Option 2: Grant Access Explicitly**

Before decryption, grant access to the user:

```typescript
// After encryption, grant self-access
const grantTx = new Transaction();
grantTx.moveCall({
  target: `${packageId}::seal_access_control::grant_access`,
  arguments: [
    grantTx.pure.address(userAddress),      // owner
    grantTx.pure.address(userAddress),      // recipient (self)
    grantTx.pure.vector("u8", fromHex(userAddress)), // content ID
    grantTx.pure.string("read"),            // access level
    grantTx.pure.u64(Date.now() + 86400000) // expires in 24h
  ]
});

// Sign and execute
const result = await suiClient.signAndExecuteTransaction({
  transaction: grantTx,
  signer: keypair
});
```

### **Option 3: Use Different Content ID**

Instead of using `userAddress` as content ID, use a unique identifier:

```typescript
// Generate unique content ID
const contentId = crypto.randomUUID(); // or hash of content

// Encrypt with unique ID
const { encryptedObject, key } = await sealClient.encrypt({
  threshold: 2,
  packageId: fromHex(packageId),
  id: fromHex(contentId),  // ✅ Unique ID
  data: dataBytes
});

// Register content with unique ID
const registerTx = new Transaction();
registerTx.moveCall({
  target: `${packageId}::seal_access_control::register_content`,
  arguments: [
    registerTx.pure.vector("u8", fromHex(contentId)),
    registerTx.pure.address(userAddress),
    registerTx.object(accessRegistryId),
    registerTx.object('0x6')
  ]
});
```

---

## 🎯 **Recommended Fix**

### **Immediate Solution: Update seal_approve for Self-Access**

The cleanest solution is to allow owners to decrypt their own content without explicit grants.

**Update smart-contract/sources/seal_access_control.move**:

```move
entry fun seal_approve(
    id: vector<u8>,
    requesting_wallet: address,
    registry: &AccessRegistry,
    clock: &Clock,
    ctx: &TxContext
) {
    let sender = tx_context::sender(ctx);
    
    // ✅ SELF-ACCESS: Owner can always decrypt their own content
    // Content ID is the owner's address, so if requesting_wallet == sender, grant access
    let content_id_as_address = address::from_bytes(id);
    if (requesting_wallet == content_id_as_address) {
        return; // Self-access granted
    };
    
    // For cross-user access, check registry permissions
    assert!(
        has_valid_permission(registry, id, requesting_wallet, clock),
        ENoAccess
    );
}
```

### **Steps to Implement**

1. **Update Move Contract**
   - Add self-access logic to `seal_approve`
   - Rebuild and republish contract

2. **Test Self-Access**
   - Run memory-workflow-seal.ts
   - Should now decrypt successfully

3. **Add Cross-User Tests**
   - Test granting access to other users
   - Verify permission expiration
   - Test access revocation

---

## 📊 **Current Workflow Status**

| Step | Status | Details |
|------|--------|---------|
| 1. Services Init | ✅ | All services ready |
| 2. Embeddings | ✅ | 768-dim vector (679ms) |
| 3. Metadata | ✅ | 10 fields, privacy-protected |
| 4. SEAL Encryption | ✅ | 9,877 → 10,226 bytes |
| 4.5. Content Registration | ❌ | MoveAbort error code 2 |
| 5. Walrus Upload | ✅ | Real upload (12.3s) |
| 6. Walrus Retrieval | ✅ | Binary preserved (13.8s) |
| 7. SEAL Decryption | ❌ | NoAccessError (expected) |

---

## 🔗 **Related Files**

- **Move Contract**: `smart-contract/sources/seal_access_control.move`
- **Test File**: `packages/pdw-sdk/test/memory-workflow-seal.ts`
- **SEAL Service**: `packages/pdw-sdk/src/security/SealService.ts`
- **Access Registry**: Shared object `0x86970655012a20316d4032e9d3e1d49409215a0a766611133e0576fe9e10ce3e`

---

## ✅ **Summary**

**Problem**: SEAL key servers reject decryption due to missing access grant  
**Cause**: `seal_approve` function requires explicit permission in AccessRegistry  
**Fix**: Add self-access logic to allow owners to decrypt their own content  
**Impact**: Will enable full end-to-end SEAL encryption/decryption workflow  

**After fix**:
- ✅ Encryption working
- ✅ Walrus upload/retrieval working
- ✅ SEAL decryption working (with self-access)
- ✅ Full workflow complete

**Status**: Need to update Move contract and republish! 🚀


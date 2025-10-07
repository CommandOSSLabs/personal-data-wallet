# SEAL Decryption Debug - Next Steps

## 🔍 **Current Status**

### **✅ Completed**
1. **Contract Updated**: Added self-access logic to `seal_approve` function
2. **Contract Published**: New package ID `0xb513935426e5f7a256036ef22b31f7b836b8ae764ddeaa5f8ce2b35e317023ad`
3. **SDK Updated**: Codegen regenerated, build successful
4. **Test Executed**: Still getting `NoAccessError` from SEAL key servers

### **❌ Still Failing**
- SEAL decryption returns: `NoAccessError: User does not have access to one or more of the requested keys`
- The self-access logic should have fixed this, but it's still being rejected

---

## 🤔 **Why Is It Still Failing?**

The self-access check we added should work:

```move
entry fun seal_approve(
    id: vector<u8>,
    requesting_wallet: address,
    registry: &AccessRegistry,
    clock: &Clock,
    ctx: &TxContext
) {
    let owner = tx_context::sender(ctx);

    // ✅ SELF-ACCESS: Owner can always decrypt their own content
    if (requesting_wallet == owner) {
        return  // Should grant access!
    };
    
    // ... rest of logic
}
```

**But the key servers are still rejecting it!**

### **Possible Reasons**

1. **Transaction Context Issue**:
   - The `tx_context::sender(ctx)` might not be the user's address
   - SEAL key servers use `dry_run_transaction_block` which might have a different sender

2. **Package ID Mismatch**:
   - The SEAL client might still be using the old package ID
   - The session key was created with the old package ID

3. **Transaction Building Issue**:
   - The transaction bytes might not be calling the correct function
   - The arguments might be in the wrong order

4. **Key Server Caching**:
   - SEAL key servers might be caching the old contract state
   - Need to wait for cache invalidation

---

## 🔧 **Debugging Steps**

### **Step 1: Verify Transaction is Calling New Contract**

Check if the approval transaction is using the new package ID:

```typescript
console.log('🔍 Approval transaction details:');
console.log(`   Package ID: ${packageId}`);
console.log(`   Target: ${packageId}::seal_access_control::seal_approve`);
console.log(`   Arguments: id=${userAddress}, requesting_wallet=${userAddress}`);
```

### **Step 2: Test with dry_run_transaction_block**

Manually test the transaction to see what the key servers see:

```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${packageId}::seal_access_control::seal_approve`,
  arguments: [
    tx.pure.vector("u8", fromHex(userAddress)),
    tx.pure.address(userAddress),
    tx.object(accessRegistryId),
    tx.object('0x6')
  ]
});

tx.setSender(userAddress);

const result = await suiClient.dryRunTransactionBlock({
  transactionBlock: await tx.build({ client: suiClient })
});

console.log('Dry run result:', result);
```

### **Step 3: Check Session Key Package ID**

The session key might be tied to the old package:

```typescript
console.log('Session key package ID:', sessionKey.getPackageId());
console.log('Expected package ID:', packageId);
```

### **Step 4: Create Fresh Session Key**

Try creating a new session key with the new package ID:

```typescript
const newSessionKey = await SessionKey.create({
  address: userAddress,
  packageId: fromHex(packageId),  // New package ID
  ttlMin: 30,
  suiClient
});

const message = newSessionKey.getPersonalMessage();
const { signature } = await keypair.signPersonalMessage(message);
newSessionKey.setPersonalMessageSignature(signature);
```

---

## 💡 **Most Likely Issue: Session Key Package ID**

The session key was created **before** we updated the package ID. The SEAL key servers are probably checking:

1. Session key says: "I want keys for package `0x37028...`" (old)
2. Transaction calls: `0xb51393...::seal_access_control::seal_approve` (new)
3. **Mismatch!** → Access denied

### **Solution**

The test needs to create a **fresh session key** after encryption, using the **same package ID** that was used for encryption.

---

## 🎯 **Recommended Fix**

### **Update Test to Use Consistent Package ID**

The issue is that the session key is created once at the beginning, but we need to ensure it's using the correct package ID:

```typescript
// In memory-workflow-seal.ts

// After SEAL encryption (Step 4)
console.log('🔄 Creating fresh session key for decryption...');
const decryptSessionKey = await SessionKey.create({
  address: userAddress,
  packageId: fromHex(packageId),  // Same as encryption
  ttlMin: 30,
  suiClient
});

const decryptMessage = decryptSessionKey.getPersonalMessage();
const { signature: decryptSig } = await keypair.signPersonalMessage(decryptMessage);
decryptSessionKey.setPersonalMessageSignature(decryptSig);

// Use this fresh session key for decryption
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(
  userAddress,
  userAddress,
  userAddress
);

const decryptedBytes = await sealServiceRef.decryptData({
  encryptedObject: encryptedBytes,
  sessionKey: decryptSessionKey,  // Fresh session key
  txBytes: approvalTxBytes
});
```

---

## 📊 **Expected Behavior After Fix**

| Component | Before | After |
|-----------|--------|-------|
| Package ID | `0x37028...` (old) | `0xb51393...` (new) |
| Session Key Package | `0x37028...` (old) | `0xb51393...` (new) |
| Transaction Target | `0xb51393...` (new) | `0xb51393...` (new) |
| seal_approve Logic | No self-access | ✅ Self-access |
| SEAL Decryption | ❌ NoAccessError | ✅ **SUCCESS** |

---

## 🔗 **Files to Check**

- **Test File**: `packages/pdw-sdk/test/memory-workflow-seal.ts`
- **SEAL Service**: `packages/pdw-sdk/src/security/SealService.ts`
- **Contract**: `smart-contract/sources/seal_access_control.move` (lines 191-209)
- **Config**: `packages/pdw-sdk/.env.test` (package ID updated)

---

## ✅ **Summary**

**Problem**: Session key created with old package ID, transaction uses new package ID  
**Root Cause**: Package ID mismatch between session key and transaction  
**Fix**: Create fresh session key with new package ID before decryption  
**Impact**: Will enable SEAL decryption to work with self-access logic  

**Next Action**: Update test to create fresh session key for decryption! 🚀


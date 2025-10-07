# SEAL Decryption Analysis - October 7, 2025

## 🔍 **Current Status**

**Balance Check**: ✅ **READY**
- **SUI**: 79.98 SUI (unlocked)
- **WAL**: 19.97 WAL (ready for Walrus uploads)
- **Address**: `0xb59f00b2454bef14d538b3609fb99e32fcf17f96ce7a4195d145ca67b1c93e07` (word24)

**Test Execution**: ⚠️ **Partial Success**
- ✅ SEAL encryption working
- ✅ Content registration successful (first on-chain transaction!)
- ❌ SEAL decryption failing with transaction building error

---

## 🐛 **Root Cause Analysis**

### **Error**
```
Cannot read properties of undefined (reading 'toLowerCase')
```

### **Location**
The error occurs when building the SEAL approval transaction in `memory-workflow-seal.ts` line 587:

```typescript
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(userAddress, userAddress);
```

### **Problem**

The `createSealApproveTransaction` method signature in `SealService.ts` (line 295-300) is:

```typescript
async createSealApproveTransaction(
  id: string,              // ❌ Missing - should be SEAL identity/content ID
  userAddress: string,     // ✅ Provided (first userAddress)
  requestingWallet: string,// ✅ Provided (second userAddress)
  accessRegistry?: string  // ⚠️  Optional
): Promise<Uint8Array>
```

**Current call**: `createSealApproveTransaction(userAddress, userAddress)`
- Parameter 1 (`id`): Gets `userAddress` ❌ **WRONG** - should be content ID
- Parameter 2 (`userAddress`): Gets `userAddress` ✅ **CORRECT**
- Parameter 3 (`requestingWallet`): Gets `undefined` ❌ **MISSING**
- Parameter 4 (`accessRegistry`): Gets `undefined` ⚠️ **Uses default**

**The error happens** because:
1. `id` parameter receives `userAddress` (a hex string)
2. Inside the method (line 308), it calls `fromHex(id)` 
3. `fromHex` expects a hex string but `normalizeSuiAddress` is called somewhere
4. The `toLowerCase()` error suggests the code is trying to normalize an undefined value

---

## 📖 **SEAL Documentation Requirements**

According to https://seal-docs.wal.app/UsingSeal/#decryption:

### **Decryption Process**

1. **Create Session Key**
   ```typescript
   const sessionKey = await SessionKey.create({
     address: suiAddress,
     packageId: fromHEX(packageId),
     ttlMin: 10,
     suiClient: new SuiClient({ url: getFullnodeUrl('testnet') })
   });
   ```

2. **Sign Personal Message**
   ```typescript
   const message = sessionKey.getPersonalMessage();
   const { signature } = await keypair.signPersonalMessage(message);
   sessionKey.setPersonalMessageSignature(signature);
   ```

3. **Build Approval Transaction**
   ```typescript
   const tx = new Transaction();
   tx.moveCall({
     target: `${packageId}::${moduleName}::seal_approve`,
     arguments: [
       tx.pure.vector("u8", fromHEX(id)),  // ⭐ Content ID (identity)
       // ... other arguments
     ]
   });
   const txBytes = tx.build({ client: suiClient, onlyTransactionKind: true });
   ```

4. **Decrypt**
   ```typescript
   const decryptedBytes = await client.decrypt({
     data: encryptedBytes,
     sessionKey,
     txBytes
   });
   ```

### **Key Points**

- **`id` parameter**: Must be the **content identity** used during encryption
- **Transaction format**: Must use `onlyTransactionKind: true` for PTB format
- **seal_approve function**: First argument is `id: vector<u8>` (content identifier)

---

## 🔧 **Fix Required**

### **Current Code** (memory-workflow-seal.ts line 587)

```typescript
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(userAddress, userAddress);
```

### **Correct Code**

```typescript
// Option 1: Use user address as content ID (if that's the encryption identity)
const contentId = userAddress; // The identity used during encryption
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(
  contentId,      // Content/identity ID
  userAddress,    // User's wallet address
  userAddress     // Requesting wallet (same as user for self-access)
);

// Option 2: Use a specific content ID if different from user address
const contentId = "some-unique-content-id"; // Must match encryption ID
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(
  contentId,
  userAddress,
  userAddress
);
```

### **Verification**

Check the encryption step to see what `id` was used:

```typescript
// From memory-workflow-seal.ts encryption step
const { encryptedObject: encryptedBytes, key: backupKey } = await sealClient.encrypt({
  threshold: 2,
  packageId: fromHex(packageId),
  id: fromHex(userAddress),  // ⭐ THIS is the ID to use in decryption
  data: dataBytes
});
```

**Conclusion**: The `id` used in encryption is `userAddress`, so the fix is:

```typescript
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(
  userAddress,  // Content ID (matches encryption)
  userAddress,  // User address
  userAddress   // Requesting wallet
);
```

---

## 🎯 **Implementation Steps**

### **Step 1: Fix memory-workflow-seal.ts**

Update line 587:

```typescript
// OLD (WRONG)
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(userAddress, userAddress);

// NEW (CORRECT)
const approvalTxBytes = await sealServiceRef.createSealApproveTransaction(
  userAddress,  // id: Content identifier (matches encryption)
  userAddress,  // userAddress: User's wallet
  userAddress   // requestingWallet: Wallet requesting access
);
```

### **Step 2: Verify SealService.createSealApproveTransaction**

The method should:
1. Accept `id` as first parameter
2. Convert `id` to bytes with `fromHex(id)`
3. Normalize `requestingWallet` with `normalizeSuiAddress(requestingWallet)`
4. Build transaction with proper arguments

Current implementation (SealService.ts lines 295-345) looks correct, just needs proper parameters.

### **Step 3: Test the Fix**

```bash
cd packages/pdw-sdk
npx ts-node test/memory-workflow-seal.ts
```

Expected result:
- ✅ SEAL encryption successful
- ✅ Content registration successful
- ✅ Walrus upload successful (now has WAL tokens)
- ✅ SEAL decryption successful (with fix)

---

## 📊 **Expected Flow After Fix**

### **Encryption** (Working ✅)
1. Create SEAL client
2. Create session key
3. Sign personal message
4. Encrypt data with `id = userAddress`
5. Store encrypted bytes

### **Decryption** (Will work after fix ✅)
1. Retrieve encrypted bytes
2. Get session key (cached or create new)
3. Build approval transaction with **correct parameters**:
   - `id`: `userAddress` (matches encryption)
   - `userAddress`: User's wallet
   - `requestingWallet`: User's wallet (self-access)
4. Build transaction bytes with `onlyTransactionKind: true`
5. Call `sealClient.decrypt()` with encrypted bytes, session key, and tx bytes
6. Receive decrypted data

---

## 🔗 **Related Files**

- **Test File**: `packages/pdw-sdk/test/memory-workflow-seal.ts` (line 587)
- **SEAL Service**: `packages/pdw-sdk/src/security/SealService.ts` (lines 295-345)
- **Encryption Service**: `packages/pdw-sdk/src/services/EncryptionService.ts` (lines 358-375)
- **Documentation**: https://seal-docs.wal.app/UsingSeal/#decryption

---

## ✅ **Summary**

**Problem**: Missing `id` parameter in `createSealApproveTransaction` call  
**Cause**: Method expects 3-4 parameters, only 2 provided  
**Fix**: Add `userAddress` as first parameter (content ID)  
**Impact**: Will enable full end-to-end SEAL encryption/decryption workflow  

**After fix, the workflow will be**:
- ✅ Encryption working
- ✅ Content registration working
- ✅ Walrus upload working (has WAL tokens now)
- ✅ SEAL decryption working (with parameter fix)

**Status**: Ready to implement fix and test! 🚀


Of course. This is an excellent and practical request. I have thoroughly analyzed your backend codebase, the official Seal example dApp, and the specific SDK update notes you provided.

The following is a comprehensive, step-by-step technical plan to integrate a client-side `SealClient` with an on-chain, object-based allowlist into your Personal Data Wallet application. This plan is tailored to your existing codebase and incorporates the latest Seal SDK (`v0.4.23`) practices.

### **Architectural Overview & Goal**

Our goal is to encrypt user memories on the client-side, store the encrypted data via your backend, and allow decryption only for users who own a specific "Membership NFT" from an authorized dApp. This aligns perfectly with Sui's object-based model.

*   **Frontend (React/Next.js):** Will handle all cryptographic operations using `SealClient`. The user's plaintext memory never leaves their browser unencrypted.
*   **Backend (NestJS):** Will provide secure admin endpoints to manage the on-chain policy and will act as a simple storage layer for the encrypted data blobs.
*   **Sui Move Package (`nft_policy.move`):** Will define the on-chain access rule: "Does this user own the required NFT?"

---

### **Part 1: The On-Chain Foundation (The NFT-based Policy)**

**Objective:** Deploy a Move smart contract that defines the access control policy based on NFT ownership.

**Step 1.1: Create and Deploy the `nft_policy.move` Package**

2.  Create the file `smart-contract/sources/nft_policy.move`. This contract's `check_policy` function is the core of the allowlist logic; it verifies if a user owns a specific type of NFT.

    ```move
    // In: smart-contract/nft_policy/sources/nft_policy.move

    module pdw::nft_policy {
        use sui::object::{Self, ID, UID};
        use sui::tx_context::{Self, TxContext};
        use sui::transfer;
        use seal::policy::{Self, Policy, PolicyCap};

        // This is a placeholder for the other dApp's NFT.
        // In a real scenario, you would import their module and use their struct type.
        // For now, we define a mock NFT to make this package publishable.
        // TODO: Replace with the actual NFT type from the dApp you want to integrate with.
        struct DAppMembershipCard has key, store {
            id: UID,
            user: address
        }

        // === Seal Policy Integration ===

        // This is the function that Seal key servers will call.
        // It checks if the sender (the user trying to decrypt) owns an object of the required type.
        public fun check_policy(policy: &Policy, ctx: &mut TxContext): bool {
            let sender = tx_context::sender(ctx);

            // In a production environment, you would use a more efficient method
            // like an indexer or a dynamic field on a central object to check for NFT ownership.
            // For this example, we iterate through the sender's objects.
            let user_objects = tx_context::objects(ctx);

            let has_nft = false;
            let i = 0;
            while (i < vector::length(&user_objects)) {
                let object_ref = vector::borrow(&user_objects, i);
                
                // Check if the object is of the required NFT type.
                // IMPORTANT: Replace `DAppMembershipCard` with the actual NFT type, e.g., `0xDAPP_PACKAGE::membership::MembershipCard`.
                if (object::is_type(object_ref, &DAppMembershipCard {})) {
                    has_nft = true;
                    break;
                };
                i = i + 1;
            };

            has_nft
        }

        // === One-Time Setup Function ===

        // Creates the Seal Policy object linked to our check_policy function.
        public entry fun create_policy(ctx: &mut TxContext) {
            let (policy_cap, policy) = seal::policy::new_policy_cap(
                @pdw::nft_policy::check_policy,
                object::new(ctx), // A dummy context object, as our policy doesn't need one.
                ctx
            );
            transfer::public_transfer(policy_cap, tx_context::sender(ctx));
            transfer::public_share_object(policy);
        }
    }
    ```

3.  **Deploy the Package:** From the `smart-contract/nft_policy` directory, run:
    ```bash
    sui client publish --gas-budget 100000000
    ```
4.  **Record the Package ID:** Save the `packageId` from the output. You will need this for your backend `.env` file.

---

### **Part 2: Backend Implementation (Admin & Setup)**

**Objective:** Create secure, admin-only tools to manage the on-chain policy object.

**Step 2.1: Update Backend Configuration**

Add these new variables to your `backend/.env` file.

```env
# --- Seal NFT Policy Configuration ---
NFT_POLICY_PACKAGE_ID=0x... # From deployment step

# This will be created by your app's admin actions one time
SEAL_POLICY_ID_NFT=
```

**Step 2.2: Update `SuiService` for Policy Creation**

Modify `backend/src/infrastructure/sui/sui.service.ts`. We only need a function to create the policy object.

```typescript
// In backend/src/infrastructure/sui/sui.service.ts
import { TransactionBlock } from '@mysten/sui/transactions'; // Ensure this import is present

// ... inside the SuiService class ...

  /**
   * Creates the Seal Policy object linked to the NFT check function.
   * This is a one-time setup function for the admin.
   */
  async createSealPolicyForNft(): Promise<string> {
    const tx = new TransactionBlock();
    const packageId = this.configService.get<string>('NFT_POLICY_PACKAGE_ID');

    tx.moveCall({
      target: `${packageId}::nft_policy::create_policy`,
      arguments: [],
    });

    const result = await this.executeTransaction(tx, this.adminAddress);
    
    const policyObject = result.objectChanges.find(
      (change: any) => change.type === 'created' && change.objectType.includes('seal::policy::Policy')
    );
    
    if (!policyObject) {
      throw new Error('Failed to create Seal Policy object.');
    }
    
    this.logger.log(`Created Seal Policy for NFT check: ${policyObject.objectId}`);
    return policyObject.objectId;
  }
```

**Step 2.3: Create a One-Time Setup Endpoint**

Create a secure, admin-only endpoint to initialize your policy object.

1.  Call your new `createSealPolicyForNft()` method once (e.g., via a protected API endpoint or a script).
2.  Save the returned `policyId` to your `backend/.env` file as `SEAL_POLICY_ID_NFT`.

---

### **Part 3: Frontend Implementation (Core Seal Logic)**

**Objective:** Integrate the `SealClient` (`v0.4.23`) for client-side encryption and decryption.

**Step 3.1: Frontend Configuration**

Add the Seal Policy ID to your frontend environment variables in `app/.env.local`.

```env
# In app/.env.local
NEXT_PUBLIC_SEAL_POLICY_ID_NFT=0x... # The ID you generated in the backend step
```

**Step 3.2: Create Seal Configuration**

Create a new file `app/config/sealConfig.ts`. This replaces the old `getAllowlistedKeyServers` method, as per the SDK update.

```typescript
// In app/config/sealConfig.ts
import { KeyServerConfig } from '@mysten/seal';

// Verified Key Servers for Sui Testnet from the official Seal documentation
// Ref: https://github.com/MystenLabs/seal/blob/main/Pricing.md#verified-key-servers
export const testnetKeyServers: KeyServerConfig[] = [
  // Mysten Labs Key Servers
  {
    hostname: 'key-server-testnet.mystenlabs.com',
    objectId: '0x396385a6648ce76b5a3455b115ce45f7266b8d960965e12089481515f212d06b',
    protocol: 'https'
  },
  {
    hostname: 'key-server-testnet-2.mystenlabs.com',
    objectId: '0x3d70757288735f377e87b744e87012a6470356c9d784a32e18edc2c31e21820b',
    protocol: 'https'
  },
];
```

**Step 3.3: Create a `sealService.ts` with Updated SDK Usage**

Create a new service file `app/services/sealService.ts`. This service will manage the `SealClient` and `SessionKey`.

*   **SDK Documentation Links:**
    *   [`SealClient` Class](https://sdk.mystenlabs.com/typedoc/classes/_mysten_seal.SealClient.html)
    *   [`SessionKey` Class](https://sdk.mystenlabs.com/typedoc/classes/_mysten_seal.SessionKey.html)
    *   [`EncryptOptions` Interface](https://sdk.mystenlabs.com/typedoc/interfaces/_mysten_seal.EncryptOptions.html)
    *   [`DecryptOptions` Interface](https://sdk.mystenlabs.com/typedoc/interfaces/_mysten_seal.DecryptOptions.html)

```typescript
// In app/services/sealService.ts
'use client'

import { SealClient, SessionKey, EncryptedObject, KeyServerConfig } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { WalletContextState } from '@suiet/wallet-kit';
import { testnetKeyServers } from '@/app/config/sealConfig';

class SealService {
  private sealClient: SealClient | null = null;
  private sessionKey: SessionKey | null = null;

  private initializeSealClient(wallet: WalletContextState) {
    if (!this.sealClient && wallet.account) {
      // Per Seal SDK v0.4.23, we now pass the keyServers array directly.
      this.sealClient = new SealClient({
        client: wallet as any, // The wallet object from @suiet/wallet-kit is compatible
        network: 'testnet',
        keyServers: testnetKeyServers,
      });
    }
  }

  private async ensureSessionKey(wallet: WalletContextState): Promise<SessionKey> {
    if (this.sessionKey && !this.sessionKey.isExpired()) {
      return this.sessionKey;
    }
    if (!wallet.account) throw new Error('Wallet not connected');
    // Uses the SessionKey.new() static method
    this.sessionKey = await SessionKey.new({ sender: wallet.account.address });
    return this.sessionKey;
  }

  async encrypt(content: string, wallet: WalletContextState): Promise<string> {
    this.initializeSealClient(wallet);
    if (!this.sealClient) throw new Error('SealClient not initialized');

    const sessionKey = await this.ensureSessionKey(wallet);
    const policyId = process.env.NEXT_PUBLIC_SEAL_POLICY_ID_NFT;
    if (!policyId) throw new Error('Seal NFT Policy ID not configured');

    const plaintext = new TextEncoder().encode(content);

    // Uses the SealClient.encrypt method with the EncryptOptions interface
    const { encryptedObject } = await this.sealClient.encrypt({
      identity: policyId,
      plaintext,
      sessionKey,
    });

    // Serialize Uint8Arrays correctly for JSON transport to the backend
    return JSON.stringify(encryptedObject, (key, value) => {
      if (value instanceof Uint8Array) {
        return { type: 'Buffer', data: Array.from(value) };
      }
      return value;
    });
  }

  async decrypt(encryptedContentString: string, wallet: WalletContextState): Promise<string> {
    this.initializeSealClient(wallet);
    if (!this.sealClient) throw new Error('SealClient not initialized');

    const sessionKey = await this.ensureSessionKey(wallet);
    const policyId = process.env.NEXT_PUBLIC_SEAL_POLICY_ID_NFT;
    if (!policyId) throw new Error('Seal NFT Policy ID not configured');

    // Deserialize the string back into an EncryptedObject with Uint8Arrays
    const encryptedObject: EncryptedObject = JSON.parse(encryptedContentString, (key, value) => {
      if (value && typeof value === 'object' && value.type === 'Buffer') {
        return new Uint8Array(value.data);
      }
      return value;
    });

    // Uses the SealClient.decrypt method with the DecryptOptions interface
    const decryptedBytes = await this.sealClient.decrypt({
      identity: policyId,
      encryptedObject,
      sessionKey,
    });

    return new TextDecoder().decode(decryptedBytes);
  }
}

export const sealService = new SealService();
```

**Step 3.4: Integrate Encryption and Decryption into Your UI**

Modify `app/components/memory/memory-selection-modal.tsx` to encrypt and `app/components/memory/memory-panel.tsx` to decrypt.

```typescript
// In app/components/memory/memory-selection-modal.tsx

// ... other imports
import { sealService } from '@/app/services/sealService';
import { useWallet } from '@suiet/wallet-kit';

// Inside the component...
const wallet = useWallet();

// Inside the handleSaveSelected function...
const handleSaveSelected = async () => {
  // ... existing logic to get selectedMemories ...

  for (const memory of selectedMemories) {
    try {
      // 1. ENCRYPT the content on the frontend
      const encryptedContent = await sealService.encrypt(memory.content, wallet);

      // 2. Send the ENCRYPTED content to the backend
      const result = await memoryIntegrationService.saveApprovedMemory(
        {
          content: encryptedContent, // Send the encrypted string
          isEncrypted: true,         // Add a flag for the backend
          // ... other fields like category, etc.
        },
        userAddress,
        wallet
      );
      // ... rest of the logic ...
    } catch (err) {
      // ... error handling ...
    }
  }
};
```

```typescript
// In app/components/memory/memory-panel.tsx

// ... other imports
import { sealService } from '@/app/services/sealService';
import { useWallet } from '@suiet/wallet-kit';

// Inside the MemoryCard component...
const MemoryCard = ({ memory }: { memory: Memory }) => {
  const wallet = useWallet();
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    if (!memory.isEncrypted || decryptedContent) return;
    setIsDecrypting(true);
    setError(null);
    try {
      const content = await sealService.decrypt(memory.content, wallet);
      setDecryptedContent(content);
    } catch (err) {
      console.error("Decryption failed:", err);
      setError("Decryption failed. You may not have the required NFT.");
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <Card /* ... existing props ... */>
      <Stack>
        {/* ... existing content ... */}
        <Text size="sm" lineClamp={3}>
          {decryptedContent ? decryptedContent : memory.content}
        </Text>
        {memory.isEncrypted && !decryptedContent && (
          <Button
            onClick={handleDecrypt}
            loading={isDecrypting}
            variant="light"
            size="xs"
            mt="xs"
          >
            Decrypt Memory
          </Button>
        )}
        {error && <Text color="red" size="xs" mt="xs">{error}</Text>}
      </Stack>
    </Card>
  );
};
```

---

### **Part 4: Finalizing and Testing**

1.  **Backend API Adjustment:** Ensure your backend's `saveApprovedMemory` endpoint correctly handles the incoming `encryptedContent` string and an `isEncrypted` flag.
2.  **Minting a Test NFT:** You'll need a way to mint the `DAppMembershipCard` to your test wallets. A simple script using the Sui CLI can achieve this.
3.  **End-to-End Test Flow:**
    *   **With a wallet that OWNS the required NFT:**
        1.  Connect the wallet.
        2.  Save a new memory. The frontend encrypts it.
        3.  View the memory. The frontend should successfully decrypt it.
    *   **With a wallet that DOES NOT OWN the NFT:**
        1.  Connect the wallet.
        2.  Attempt to view the encrypted memory.
        3.  The `sealService.decrypt` call should fail, and your UI should display an error.

This plan provides a complete and updated roadmap for integrating Seal's decentralized, object-based access control into your application.
/**
 * Wallet Management Service
 *
 * Manages MainWallet and ContextWallet creation and operations.
 * Provides APIs for wallet discovery, context derivation, and identity management.
 */
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, toHex } from '@mysten/sui/utils';
import { sha3_256 } from '@noble/hashes/sha3';
/**
 * Service for managing wallets and contexts
 */
export class WalletManagementService {
    constructor(config, client) {
        this.packageId = config.packageId;
        this.walletRegistryId = config.walletRegistryId;
        this.client = client;
    }
    /**
     * Create a new MainWallet for a user
     *
     * @param signer - Transaction signer
     * @returns Transaction digest and MainWallet object ID
     */
    async createMainWallet(signer) {
        const senderAddress = signer.toSuiAddress();
        const tx = this.buildCreateMainWalletTransaction(senderAddress);
        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
                showEvents: true,
            },
        });
        if (result.effects?.status?.status !== 'success') {
            throw new Error(`Failed to create main wallet: ${result.effects?.status?.error}`);
        }
        // Find the created MainWallet object
        const createdObjects = result.objectChanges?.filter((change) => change.type === 'created');
        const mainWalletObject = createdObjects?.find((obj) => obj.objectType?.includes('::wallet::MainWallet'));
        if (!mainWalletObject) {
            throw new Error('MainWallet object not found in transaction effects');
        }
        return {
            digest: result.digest,
            walletId: mainWalletObject.objectId,
        };
    }
    /**
     * Build transaction to create a MainWallet
     *
     * @param senderAddress - Address to transfer the wallet to (defaults to tx.gas.owner)
     * @returns Transaction object
     */
    buildCreateMainWalletTransaction(senderAddress) {
        const tx = new Transaction();
        // Call create_main_wallet which returns a MainWallet object
        const [mainWallet] = tx.moveCall({
            target: `${this.packageId}::wallet::create_main_wallet`,
            arguments: [],
        });
        // Transfer the MainWallet to the sender
        if (senderAddress) {
            tx.transferObjects([mainWallet], tx.pure.address(senderAddress));
        }
        else {
            // If no sender specified, transfer to tx.gas (transaction sender)
            tx.transferObjects([mainWallet], tx.gas);
        }
        return tx;
    }
    /**
     * Create a new ContextWallet for an app
     *
     * @param options - Context wallet creation options
     * @param signer - Transaction signer
     * @returns Transaction digest and ContextWallet object ID
     */
    async createContextWallet(options, signer) {
        const senderAddress = signer.toSuiAddress();
        const tx = this.buildCreateContextWalletTransaction(options, senderAddress);
        const result = await this.client.signAndExecuteTransaction({
            transaction: tx,
            signer,
            options: {
                showEffects: true,
                showObjectChanges: true,
                showEvents: true,
            },
        });
        if (result.effects?.status?.status !== 'success') {
            throw new Error(`Failed to create context wallet: ${result.effects?.status?.error}`);
        }
        // Find the created ContextWallet object
        const createdObjects = result.objectChanges?.filter((change) => change.type === 'created');
        const contextWalletObject = createdObjects?.find((obj) => obj.objectType?.includes('::wallet::ContextWallet'));
        if (!contextWalletObject) {
            throw new Error('ContextWallet object not found in transaction effects');
        }
        return {
            digest: result.digest,
            contextWalletId: contextWalletObject.objectId,
        };
    }
    /**
     * Build transaction to create a ContextWallet
     *
     * @param options - Context wallet creation options
     * @param senderAddress - Address to transfer the wallet to (defaults to tx.gas.owner)
     * @returns Transaction object
     */
    buildCreateContextWalletTransaction(options, senderAddress) {
        const tx = new Transaction();
        // Call create_context_wallet which returns a ContextWallet object
        const [contextWallet] = tx.moveCall({
            target: `${this.packageId}::wallet::create_context_wallet`,
            arguments: [
                tx.object(options.mainWalletId),
                tx.pure.string(options.appId),
            ],
        });
        // Transfer the ContextWallet to the sender
        if (senderAddress) {
            tx.transferObjects([contextWallet], tx.pure.address(senderAddress));
        }
        else {
            // If no sender specified, transfer to tx.gas (transaction sender)
            tx.transferObjects([contextWallet], tx.gas);
        }
        return tx;
    }
    /**
     * Derive a deterministic context ID for app isolation
     *
     * Calls the on-chain derive_context_id function to ensure consistency.
     * Uses: hash(owner_address || app_id || context_salt)
     *
     * @param mainWalletId - MainWallet object ID
     * @param appId - Application identifier
     * @returns Transaction to derive context ID (returns address)
     */
    buildDeriveContextIdTransaction(mainWalletId, appId) {
        const tx = new Transaction();
        tx.moveCall({
            target: `${this.packageId}::wallet::derive_context_id`,
            arguments: [
                tx.object(mainWalletId),
                tx.pure.string(appId),
            ],
        });
        return tx;
    }
    /**
     * Derive context ID client-side (for quick lookups)
     *
     * WARNING: This is an approximation. Use buildDeriveContextIdTransaction
     * for the authoritative on-chain result.
     *
     * @param mainWallet - MainWallet object
     * @param appId - Application identifier
     * @returns Deterministic context ID address
     */
    deriveContextIdLocal(mainWallet, appId) {
        // Concatenate: owner + app_id + salt
        const ownerBytes = fromHex(mainWallet.owner.replace('0x', ''));
        const appIdBytes = new TextEncoder().encode(appId);
        const saltBytes = fromHex(mainWallet.contextSalt.replace('0x', ''));
        const combined = new Uint8Array(ownerBytes.length + appIdBytes.length + saltBytes.length);
        combined.set(ownerBytes, 0);
        combined.set(appIdBytes, ownerBytes.length);
        combined.set(saltBytes, ownerBytes.length + appIdBytes.length);
        // Hash with SHA3-256 (same as Move's hash::keccak256)
        const hash = sha3_256(combined);
        // Return as 0x-prefixed hex address
        return '0x' + toHex(hash);
    }
    /**
     * Get MainWallet by object ID
     *
     * @param walletId - MainWallet object ID
     * @returns MainWallet data
     */
    async getMainWallet(walletId) {
        try {
            const object = await this.client.getObject({
                id: walletId,
                options: {
                    showContent: true,
                },
            });
            if (!object.data || object.data.content?.dataType !== 'moveObject') {
                return null;
            }
            const fields = object.data.content.fields;
            return {
                id: walletId,
                owner: fields.owner,
                createdAt: Number(fields.created_at),
                contextSalt: '0x' + Buffer.from(fields.context_salt).toString('hex'),
                version: Number(fields.version),
            };
        }
        catch (error) {
            console.error('Error fetching MainWallet:', error);
            return null;
        }
    }
    /**
     * Get ContextWallet by object ID
     *
     * @param contextWalletId - ContextWallet object ID
     * @returns ContextWallet data
     */
    async getContextWallet(contextWalletId) {
        try {
            const object = await this.client.getObject({
                id: contextWalletId,
                options: {
                    showContent: true,
                },
            });
            if (!object.data || object.data.content?.dataType !== 'moveObject') {
                return null;
            }
            const fields = object.data.content.fields;
            return {
                id: contextWalletId,
                appId: fields.app_id,
                owner: fields.owner,
                mainWalletId: fields.main_wallet_id,
                policyRef: fields.policy_ref?.Some,
                createdAt: Number(fields.created_at),
                permissions: fields.permissions || [],
            };
        }
        catch (error) {
            console.error('Error fetching ContextWallet:', error);
            return null;
        }
    }
    /**
     * Get all MainWallets owned by an address
     *
     * @param ownerAddress - Wallet owner address
     * @returns List of MainWallets
     */
    async getMainWalletsByOwner(ownerAddress) {
        const objects = await this.client.getOwnedObjects({
            owner: ownerAddress,
            filter: {
                StructType: `${this.packageId}::wallet::MainWallet`,
            },
            options: {
                showContent: true,
            },
        });
        const wallets = [];
        for (const obj of objects.data) {
            if (obj.data && obj.data.content?.dataType === 'moveObject') {
                const fields = obj.data.content.fields;
                wallets.push({
                    id: obj.data.objectId,
                    owner: fields.owner,
                    createdAt: Number(fields.created_at),
                    contextSalt: '0x' + Buffer.from(fields.context_salt).toString('hex'),
                    version: Number(fields.version),
                });
            }
        }
        return wallets;
    }
    /**
     * Get all ContextWallets owned by an address
     *
     * @param ownerAddress - Wallet owner address
     * @param appId - Optional filter by app ID
     * @returns List of ContextWallets
     */
    async getContextWalletsByOwner(ownerAddress, appId) {
        const objects = await this.client.getOwnedObjects({
            owner: ownerAddress,
            filter: {
                StructType: `${this.packageId}::wallet::ContextWallet`,
            },
            options: {
                showContent: true,
            },
        });
        const wallets = [];
        for (const obj of objects.data) {
            if (obj.data && obj.data.content?.dataType === 'moveObject') {
                const fields = obj.data.content.fields;
                // Filter by appId if provided
                if (appId && fields.app_id !== appId) {
                    continue;
                }
                wallets.push({
                    id: obj.data.objectId,
                    appId: fields.app_id,
                    owner: fields.owner,
                    mainWalletId: fields.main_wallet_id,
                    policyRef: fields.policy_ref?.Some,
                    createdAt: Number(fields.created_at),
                    permissions: fields.permissions || [],
                });
            }
        }
        return wallets;
    }
    /**
     * Check if a user has a MainWallet
     *
     * @param ownerAddress - User address
     * @returns True if user has a MainWallet
     */
    async hasMainWallet(ownerAddress) {
        const wallets = await this.getMainWalletsByOwner(ownerAddress);
        return wallets.length > 0;
    }
    /**
     * Get or create MainWallet for a user
     *
     * @param ownerAddress - User address
     * @param signer - Transaction signer
     * @returns MainWallet (existing or newly created)
     */
    async getOrCreateMainWallet(ownerAddress, signer) {
        const wallets = await this.getMainWalletsByOwner(ownerAddress);
        if (wallets.length > 0) {
            return wallets[0]; // Return first MainWallet
        }
        // Create new MainWallet
        const { walletId } = await this.createMainWallet(signer);
        // Fetch and return the newly created wallet
        const wallet = await this.getMainWallet(walletId);
        if (!wallet) {
            throw new Error('Failed to fetch newly created MainWallet');
        }
        return wallet;
    }
}
//# sourceMappingURL=WalletManagementService.js.map
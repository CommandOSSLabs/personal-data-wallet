/**
 * Wallet Management Service
 *
 * Manages MainWallet and ContextWallet creation and operations.
 * Provides APIs for wallet discovery, context derivation, and identity management.
 */
import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
import type { Signer } from '@mysten/sui/cryptography';
export interface WalletManagementConfig {
    packageId: string;
    walletRegistryId: string;
}
export interface MainWallet {
    id: string;
    owner: string;
    createdAt: number;
    contextSalt: string;
    version: number;
}
export interface ContextWallet {
    id: string;
    appId: string;
    owner: string;
    mainWalletId: string;
    policyRef?: string;
    createdAt: number;
    permissions: string[];
}
export interface CreateContextWalletOptions {
    mainWalletId: string;
    appId: string;
}
/**
 * Service for managing wallets and contexts
 */
export declare class WalletManagementService {
    private packageId;
    private walletRegistryId;
    private client;
    constructor(config: WalletManagementConfig, client: SuiClient);
    /**
     * Create a new MainWallet for a user
     *
     * @param signer - Transaction signer
     * @returns Transaction digest and MainWallet object ID
     */
    createMainWallet(signer: Signer): Promise<{
        digest: string;
        walletId: string;
    }>;
    /**
     * Build transaction to create a MainWallet
     *
     * @param senderAddress - Address to transfer the wallet to (defaults to tx.gas.owner)
     * @returns Transaction object
     */
    buildCreateMainWalletTransaction(senderAddress?: string): Transaction;
    /**
     * Create a new ContextWallet for an app
     *
     * @param options - Context wallet creation options
     * @param signer - Transaction signer
     * @returns Transaction digest and ContextWallet object ID
     */
    createContextWallet(options: CreateContextWalletOptions, signer: Signer): Promise<{
        digest: string;
        contextWalletId: string;
    }>;
    /**
     * Build transaction to create a ContextWallet
     *
     * @param options - Context wallet creation options
     * @param senderAddress - Address to transfer the wallet to (defaults to tx.gas.owner)
     * @returns Transaction object
     */
    buildCreateContextWalletTransaction(options: CreateContextWalletOptions, senderAddress?: string): Transaction;
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
    buildDeriveContextIdTransaction(mainWalletId: string, appId: string): Transaction;
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
    deriveContextIdLocal(mainWallet: MainWallet, appId: string): string;
    /**
     * Get MainWallet by object ID
     *
     * @param walletId - MainWallet object ID
     * @returns MainWallet data
     */
    getMainWallet(walletId: string): Promise<MainWallet | null>;
    /**
     * Get ContextWallet by object ID
     *
     * @param contextWalletId - ContextWallet object ID
     * @returns ContextWallet data
     */
    getContextWallet(contextWalletId: string): Promise<ContextWallet | null>;
    /**
     * Get all MainWallets owned by an address
     *
     * @param ownerAddress - Wallet owner address
     * @returns List of MainWallets
     */
    getMainWalletsByOwner(ownerAddress: string): Promise<MainWallet[]>;
    /**
     * Get all ContextWallets owned by an address
     *
     * @param ownerAddress - Wallet owner address
     * @param appId - Optional filter by app ID
     * @returns List of ContextWallets
     */
    getContextWalletsByOwner(ownerAddress: string, appId?: string): Promise<ContextWallet[]>;
    /**
     * Check if a user has a MainWallet
     *
     * @param ownerAddress - User address
     * @returns True if user has a MainWallet
     */
    hasMainWallet(ownerAddress: string): Promise<boolean>;
    /**
     * Get or create MainWallet for a user
     *
     * @param ownerAddress - User address
     * @param signer - Transaction signer
     * @returns MainWallet (existing or newly created)
     */
    getOrCreateMainWallet(ownerAddress: string, signer: Signer): Promise<MainWallet>;
}
//# sourceMappingURL=WalletManagementService.d.ts.map
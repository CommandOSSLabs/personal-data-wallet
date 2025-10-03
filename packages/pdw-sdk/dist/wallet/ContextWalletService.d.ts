/**
 * ContextWalletService - App-scoped data container management
 *
 * Manages app-specific data contexts for users, including:
 * - Context wallet creation and metadata management
 * - App isolation and data segregation
 * - CRUD operations within contexts
 * - Integration with MainWalletService for identity
 */
import { SuiClient } from '@mysten/sui/client';
import { ContextWallet, CreateContextWalletOptions } from '../types/wallet';
import { MainWalletService } from './MainWalletService.js';
import { StorageService } from '../services/StorageService.js';
import { EncryptionService } from '../encryption/EncryptionService.js';
/**
 * Configuration for ContextWalletService
 */
export interface ContextWalletServiceConfig {
    /** Sui client instance */
    suiClient: SuiClient;
    /** Package ID for Move contracts */
    packageId: string;
    /** MainWalletService instance for identity management */
    mainWalletService: MainWalletService;
    /** StorageService for Walrus blob retrieval */
    storageService?: StorageService;
    /** EncryptionService for SEAL decryption */
    encryptionService?: EncryptionService;
}
/**
 * ContextWalletService handles app-scoped data containers
 */
export declare class ContextWalletService {
    private suiClient;
    private packageId;
    private mainWalletService;
    private storageService?;
    private encryptionService?;
    constructor(config: ContextWalletServiceConfig);
    /**
     * Create a new context wallet for an app (stored as dynamic field on MainWallet)
     * @param userAddress - User's Sui address
     * @param options - Context creation options
     * @param signer - Transaction signer
     * @returns Created ContextWallet metadata
     */
    create(userAddress: string, options: CreateContextWalletOptions, signer: any): Promise<ContextWallet>;
    /**
     * Get context wallet by app ID (fetches from dynamic field)
     * @param userAddress - User's Sui address
     * @param appId - Application identifier
     * @returns ContextWallet metadata or null if not found
     */
    getContextForApp(userAddress: string, appId: string): Promise<ContextWallet | null>;
    /**
     * Get context wallet by ID (deprecated - use getContextForApp)
     * @param contextId - Context wallet ID
     * @returns ContextWallet metadata or null if not found
     */
    getContext(contextId: string): Promise<ContextWallet | null>;
    /**
     * List all context wallets for a user (from dynamic fields on MainWallet)
     * @param userAddress - User's Sui address
     * @returns Array of ContextWallet metadata
     */
    listUserContexts(userAddress: string): Promise<ContextWallet[]>;
    /**
     * Add data item to a context
     * @param contextId - Context wallet ID
     * @param data - Data to store
     * @returns Data item ID
     */
    addData(contextId: string, data: {
        content: string;
        category?: string;
        metadata?: Record<string, any>;
    }): Promise<string>;
    /**
     * Remove data item from a context
     * @param contextId - Context wallet ID
     * @param itemId - Data item ID to remove
     * @returns Success status
     */
    removeData(contextId: string, itemId: string): Promise<boolean>;
    /**
     * List data items in a context
     * @param contextId - Context wallet ID
     * @param filters - Optional filters
     * @returns Array of data items
     */
    listData(contextId: string, filters?: {
        category?: string;
        limit?: number;
        offset?: number;
    }): Promise<Array<{
        id: string;
        content: string;
        category?: string;
        metadata?: Record<string, any>;
        createdAt: number;
    }>>;
    /**
     * Ensure context wallet exists for an app, create if not found
     * @param userAddress - User's Sui address
     * @param appId - Application ID
     * @param signer - Transaction signer for creation
     * @returns Existing or newly created ContextWallet
     */
    ensureContext(userAddress: string, appId: string, signer: any): Promise<ContextWallet>;
    /**
     * Delete a context wallet and all its data
     * @param contextId - Context wallet ID
     * @returns Success status
     */
    deleteContext(contextId: string): Promise<boolean>;
    /**
     * Update context wallet metadata
     * @param contextId - Context wallet ID
     * @param updates - Updates to apply
     * @returns Updated ContextWallet
     */
    updateContext(contextId: string, updates: {
        policyRef?: string;
        metadata?: Record<string, any>;
    }): Promise<ContextWallet>;
    /**
     * Validate that a user has access to a context
     * @param contextId - Context wallet ID
     * @param userAddress - User's Sui address
     * @returns True if user has access
     */
    validateAccess(contextId: string, userAddress: string): Promise<boolean>;
    /**
     * Get statistics for a context wallet
     * @param contextId - Context wallet ID
     * @returns Context usage statistics
     */
    getContextStats(contextId: string): Promise<{
        itemCount: number;
        totalSize: number;
        categories: Record<string, number>;
        lastActivity: number;
    }>;
}
//# sourceMappingURL=ContextWalletService.d.ts.map
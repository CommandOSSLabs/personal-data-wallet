/**
 * ClientMemoryManager - Client-side Memory Operations for React dApps
 *
 * Provides a simplified API for creating and retrieving memories in React dApps
 * using @mysten/dapp-kit. Handles the complete flow:
 * - Memory creation: embedding → encryption → Walrus upload → on-chain registration
 * - Memory retrieval: Walrus fetch → SEAL decryption → content extraction
 *
 * Usage:
 * ```typescript
 * const manager = new ClientMemoryManager({
 *   packageId: '0x...',
 *   accessRegistryId: '0x...',
 *   walrusAggregator: 'https://...',
 *   geminiApiKey: 'your-key'
 * });
 *
 * // Create memory
 * const blobId = await manager.createMemory({
 *   content: 'My memory',
 *   account,
 *   signAndExecute,
 *   client,
 *   onProgress: (status) => console.log(status)
 * });
 *
 * // Retrieve memory
 * const content = await manager.retrieveMemory({
 *   blobId: '...',
 *   account,
 *   signPersonalMessage,
 *   client
 * });
 * ```
 */
import { Transaction } from '@mysten/sui/transactions';
import type { SuiClient } from '@mysten/sui/client';
export interface ClientMemoryManagerConfig {
    packageId: string;
    accessRegistryId: string;
    walrusAggregator: string;
    geminiApiKey: string;
    sealServerObjectIds?: string[];
    walrusNetwork?: 'testnet' | 'mainnet';
    categories?: string[];
}
export interface CreateMemoryOptions {
    content: string;
    category?: string;
    account: {
        address: string;
    };
    signAndExecute: (params: {
        transaction: Transaction;
    }, callbacks: {
        onSuccess: (result: any) => void;
        onError: (error: Error) => void;
    }) => void;
    client: SuiClient;
    onProgress?: (status: string) => void;
}
export interface RetrieveMemoryOptions {
    blobId: string;
    account: {
        address: string;
    };
    signPersonalMessage: (params: {
        message: Uint8Array;
    }) => Promise<{
        signature: string;
    }>;
    client: SuiClient;
    onProgress?: (status: string) => void;
}
export interface BatchRetrieveMemoriesOptions {
    blobIds: string[];
    account: {
        address: string;
    };
    signPersonalMessage: (params: {
        message: Uint8Array;
    }) => Promise<{
        signature: string;
    }>;
    client: SuiClient;
    onProgress?: (status: string, current: number, total: number) => void;
}
export interface BatchRetrieveResult {
    blobId: string;
    content?: string;
    error?: string;
}
export interface ClientMemoryMetadata {
    content: string;
    embedding: number[];
    timestamp: number;
}
/**
 * Client-side memory manager for React dApps
 */
export declare class ClientMemoryManager {
    private readonly config;
    private readonly defaultCategories;
    constructor(config: ClientMemoryManagerConfig);
    /**
     * Create a new memory (3 signatures: Walrus register, certify, on-chain)
     */
    createMemory(options: CreateMemoryOptions): Promise<string>;
    /**
     * Retrieve and decrypt a memory
     */
    retrieveMemory(options: RetrieveMemoryOptions): Promise<ClientMemoryMetadata>;
    /**
     * Batch retrieve and decrypt multiple memories with a single signature
     * This is much more efficient than calling retrieveMemory multiple times
     */
    batchRetrieveMemories(options: BatchRetrieveMemoriesOptions): Promise<BatchRetrieveResult[]>;
    private analyzeContent;
    private generateEmbedding;
    private encryptWithSEAL;
    private uploadToWalrus;
    private registerOnChain;
    private fetchFromWalrus;
    /**
     * Create a reusable decryption session (requires one signature)
     * This session can be used to decrypt multiple memories without additional signatures
     */
    private createDecryptionSession;
    private decryptWithSEAL;
}
export default ClientMemoryManager;
//# sourceMappingURL=ClientMemoryManager.d.ts.map
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const transactions_1 = require("@mysten/sui/transactions");
// Import generated Move contract functions
const MemoryModule = __importStar(require("../generated/pdw/memory"));
const AccessModule = __importStar(require("../generated/pdw/seal_access_control"));
/**
 * TransactionService provides high-level transaction building and execution
 * for Personal Data Wallet Move contracts with proper error handling and gas management.
 */
class TransactionService {
    constructor(client, config) {
        this.client = client;
        this.config = config;
    }
    // ==================== MEMORY TRANSACTIONS ====================
    /**
     * Build transaction to create a new memory record
     */
    buildCreateMemoryRecord(options) {
        const tx = new transactions_1.Transaction();
        // Set gas budget if provided
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        // Set gas price if provided
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Call the memory contract function
        const moveCall = MemoryModule.createMemoryRecord({
            package: this.config.packageId,
            arguments: [
                Array.from(new TextEncoder().encode(options.category)),
                options.vectorId,
                Array.from(new TextEncoder().encode(options.blobId)),
                Array.from(new TextEncoder().encode(options.contentType)),
                options.contentSize,
                Array.from(new TextEncoder().encode(options.contentHash)),
                Array.from(new TextEncoder().encode(options.topic)),
                options.importance,
                Array.from(new TextEncoder().encode(options.embeddingBlobId)),
            ],
        });
        moveCall(tx);
        return tx;
    }
    /**
     * Build transaction to create a lightweight memory record
     *
     * This creates a minimal on-chain Memory struct with only essential queryable fields.
     * Rich metadata should be stored as Walrus blob metadata for gas efficiency.
     *
     * Use this when:
     * - Gas costs are a concern (saves ~50% gas vs full metadata)
     * - Rich metadata is stored on Walrus blob
     * - Only need basic filtering (category, vector_id, importance)
     *
     * @param options - Lightweight memory creation options
     * @returns Transaction to create lightweight memory record
     */
    buildCreateMemoryRecordLightweight(options) {
        const tx = new transactions_1.Transaction();
        // Set gas budget if provided
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        // Set gas price if provided
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Call the lightweight memory creation function
        // Note: Walrus blob_id is a base64 string (URL-safe, no padding)
        // Example: "E7_nNXvFU_3qZVu3OH1yycRG7LZlyn1-UxEDCDDqGGU"
        // We encode the string to vector<u8> for the Move function parameter
        tx.moveCall({
            target: `${this.config.packageId}::memory::create_memory_record_lightweight`,
            arguments: [
                tx.pure.vector('u8', Array.from(new TextEncoder().encode(options.category))),
                tx.pure.u64(options.vectorId),
                tx.pure.vector('u8', Array.from(new TextEncoder().encode(options.blobId))),
                tx.pure.vector('u8', Array.from(new TextEncoder().encode(options.blobObjectId || ''))),
                tx.pure.u8(options.importance),
            ],
        });
        return tx;
    }
    /**
     * Build transaction to update memory metadata
     */
    buildUpdateMemoryMetadata(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::memory::update_memory_metadata`,
            arguments: [
                tx.pure.string(options.memoryId),
                tx.pure.string(options.metadataBlobId),
                tx.pure.u64(options.embeddingDimension || 0)
            ]
        });
        return tx;
    }
    /**
     * Build transaction to delete a memory record
     */
    buildDeleteMemoryRecord(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::memory::delete_memory_record`,
            arguments: [tx.pure.string(options.memoryId)]
        });
        return tx;
    }
    /**
     * Build transaction to create a memory index
     */
    buildCreateMemoryIndex(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::memory::create_memory_index`,
            arguments: [
                tx.pure.string(options.indexBlobId),
                tx.pure.string(options.graphBlobId)
            ]
        });
        return tx;
    }
    /**
     * Build transaction to update a memory index
     */
    buildUpdateMemoryIndex(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::memory::update_memory_index`,
            arguments: [
                tx.pure.string(options.indexId),
                tx.pure.string(options.newIndexBlobId),
                tx.pure.string(options.newGraphBlobId || '')
            ]
        });
        return tx;
    }
    // ==================== ACCESS CONTROL TRANSACTIONS ====================
    /**
     * Build transaction to grant access to content
     */
    buildGrantAccess(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::access::grant_access`,
            arguments: [
                tx.pure.string(options.contentId),
                tx.pure.address(options.recipient),
                tx.pure.u8(Array.isArray(options.permissions) ? options.permissions[0] : options.permissions),
                tx.pure.u64(options.expirationTime || 0)
            ]
        });
        return tx;
    }
    /**
     * Build transaction to revoke access from content
     */
    buildRevokeAccess(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::access::revoke_access`,
            arguments: [
                tx.pure.string(options.contentId),
                tx.pure.address(options.recipient)
            ]
        });
        return tx;
    }
    /**
     * Build transaction to register content for access control
     */
    buildRegisterContent(options) {
        const tx = new transactions_1.Transaction();
        if (options.gasBudget) {
            tx.setGasBudget(options.gasBudget);
        }
        if (options.gasPrice) {
            tx.setGasPrice(options.gasPrice);
        }
        // Note: Using tx.moveCall for actual implementation
        tx.moveCall({
            target: `${this.config.packageId}::access::register_content`,
            arguments: [
                tx.pure.string(options.contentHash),
                tx.pure.string(options.encryptionKey),
                tx.pure.string(Array.isArray(options.accessPolicy) ? JSON.stringify(options.accessPolicy) : options.accessPolicy)
            ]
        });
        return tx;
    }
    // ==================== EXECUTION METHODS ====================
    /**
     * Execute a transaction and return structured result
     */
    async executeTransaction(tx, signer, options = {}) {
        try {
            // Set sender if provided
            if (options.sender) {
                tx.setSender(options.sender);
            }
            // Execute the transaction
            const result = await this.client.signAndExecuteTransaction({
                transaction: tx,
                signer,
                options: {
                    showEffects: true,
                    showObjectChanges: true,
                    showEvents: true,
                },
            });
            // Parse the result
            const transactionResult = {
                digest: result.digest,
                effects: result.effects,
                status: result.effects?.status?.status === 'success' ? 'success' : 'failure',
                gasUsed: result.effects?.gasUsed?.computationCost
                    ? Number(result.effects.gasUsed.computationCost)
                    : undefined,
            };
            // Extract created objects
            if (result.objectChanges) {
                transactionResult.createdObjects = result.objectChanges
                    .filter(change => change.type === 'created')
                    .map(change => ({
                    objectId: change.objectId,
                    objectType: change.objectType || 'unknown',
                }));
                transactionResult.mutatedObjects = result.objectChanges
                    .filter(change => change.type === 'mutated')
                    .map(change => ({
                    objectId: change.objectId,
                    objectType: change.objectType || 'unknown',
                }));
                transactionResult.deletedObjects = result.objectChanges
                    .filter(change => change.type === 'deleted')
                    .map(change => change.objectId);
            }
            // Add error if transaction failed
            if (transactionResult.status === 'failure') {
                transactionResult.error = result.effects?.status?.error || 'Unknown transaction error';
            }
            return transactionResult;
        }
        catch (error) {
            console.error('Transaction execution failed:', error);
            return {
                digest: '',
                status: 'failure',
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    // ==================== CONVENIENCE METHODS ====================
    /**
     * Create and execute a memory record transaction
     */
    async createMemoryRecord(options, signer) {
        const tx = this.buildCreateMemoryRecord(options);
        return this.executeTransaction(tx, signer, options);
    }
    /**
     * Create and execute an update memory metadata transaction
     */
    async updateMemoryMetadata(options, signer) {
        const tx = this.buildUpdateMemoryMetadata(options);
        return this.executeTransaction(tx, signer, options);
    }
    /**
     * Create and execute a delete memory record transaction
     */
    async deleteMemoryRecord(options, signer) {
        const tx = this.buildDeleteMemoryRecord(options);
        return this.executeTransaction(tx, signer, options);
    }
    /**
     * Create and execute a grant access transaction
     */
    async grantAccess(options, signer) {
        const tx = this.buildGrantAccess(options);
        return this.executeTransaction(tx, signer, options);
    }
    /**
     * Create and execute a revoke access transaction
     */
    async revokeAccess(options, signer) {
        const tx = this.buildRevokeAccess(options);
        return this.executeTransaction(tx, signer, options);
    }
    // ==================== BATCH OPERATIONS ====================
    /**
     * Build a batch transaction combining multiple operations
     */
    buildBatchTransaction(operations) {
        const tx = new transactions_1.Transaction();
        for (const operation of operations) {
            switch (operation.type) {
                case 'createMemory':
                    MemoryModule.createMemoryRecord({
                        tx,
                        ...operation.options,
                    });
                    break;
                case 'updateMemory':
                    MemoryModule.updateMemoryMetadata({
                        tx,
                        ...operation.options,
                    });
                    break;
                case 'deleteMemory':
                    MemoryModule.deleteMemoryRecord({
                        tx,
                        ...operation.options,
                    });
                    break;
                case 'grantAccess':
                    // Legacy function removed - use grantWalletAllowlistAccess instead
                    AccessModule.grantWalletAllowlistAccess({
                        package: this.config.packageId,
                        arguments: operation.options,
                    })(tx);
                    break;
                case 'revokeAccess':
                    // Legacy function removed - use revokeWalletAllowlistAccess instead
                    AccessModule.revokeWalletAllowlistAccess({
                        package: this.config.packageId,
                        arguments: operation.options,
                    })(tx);
                    break;
                default:
                    console.warn(`Unknown operation type: ${operation.type}`);
            }
        }
        return tx;
    }
    /**
     * Execute a batch transaction
     */
    async executeBatch(operations, signer, txOptions = {}) {
        const tx = this.buildBatchTransaction(operations);
        if (txOptions.gasBudget) {
            tx.setGasBudget(txOptions.gasBudget);
        }
        return this.executeTransaction(tx, signer, txOptions);
    }
    // ==================== UTILITY METHODS ====================
    /**
     * Estimate gas cost for a transaction
     */
    async estimateGas(tx, signer) {
        try {
            const dryRunResult = await this.client.dryRunTransactionBlock({
                transactionBlock: await tx.build({ client: this.client }),
            });
            return dryRunResult.effects.gasUsed?.computationCost
                ? Number(dryRunResult.effects.gasUsed.computationCost)
                : 0;
        }
        catch (error) {
            console.error('Gas estimation failed:', error);
            return 0;
        }
    }
    /**
     * Get recommended gas budget based on transaction complexity
     */
    getRecommendedGasBudget(operationCount = 1) {
        const baseGas = 1000000; // 1M MIST base
        const perOperationGas = 500000; // 500K MIST per operation
        return baseGas + (operationCount * perOperationGas);
    }
}
exports.TransactionService = TransactionService;
//# sourceMappingURL=TransactionService.js.map
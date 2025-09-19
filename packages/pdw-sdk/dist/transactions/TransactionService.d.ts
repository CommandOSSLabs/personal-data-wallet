import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import { PDWConfig, TransactionOptions, TransactionResult, CreateMemoryRecordTxOptions, UpdateMemoryMetadataTxOptions, DeleteMemoryRecordTxOptions, CreateMemoryIndexTxOptions, UpdateMemoryIndexTxOptions, GrantAccessTxOptions, RevokeAccessTxOptions, RegisterContentTxOptions } from '../types';
/**
 * TransactionService provides high-level transaction building and execution
 * for Personal Data Wallet Move contracts with proper error handling and gas management.
 */
export declare class TransactionService {
    private client;
    private config;
    constructor(client: SuiClient, config: PDWConfig);
    /**
     * Build transaction to create a new memory record
     */
    buildCreateMemoryRecord(options: CreateMemoryRecordTxOptions): Transaction;
    /**
     * Build transaction to update memory metadata
     */
    buildUpdateMemoryMetadata(options: UpdateMemoryMetadataTxOptions): Transaction;
    /**
     * Build transaction to delete a memory record
     */
    buildDeleteMemoryRecord(options: DeleteMemoryRecordTxOptions): Transaction;
    /**
     * Build transaction to create a memory index
     */
    buildCreateMemoryIndex(options: CreateMemoryIndexTxOptions): Transaction;
    /**
     * Build transaction to update a memory index
     */
    buildUpdateMemoryIndex(options: UpdateMemoryIndexTxOptions): Transaction;
    /**
     * Build transaction to grant access to content
     */
    buildGrantAccess(options: GrantAccessTxOptions): Transaction;
    /**
     * Build transaction to revoke access from content
     */
    buildRevokeAccess(options: RevokeAccessTxOptions): Transaction;
    /**
     * Build transaction to register content for access control
     */
    buildRegisterContent(options: RegisterContentTxOptions): Transaction;
    /**
     * Execute a transaction and return structured result
     */
    executeTransaction(tx: Transaction, signer: any, options?: TransactionOptions): Promise<TransactionResult>;
    /**
     * Create and execute a memory record transaction
     */
    createMemoryRecord(options: CreateMemoryRecordTxOptions, signer: any): Promise<TransactionResult>;
    /**
     * Create and execute an update memory metadata transaction
     */
    updateMemoryMetadata(options: UpdateMemoryMetadataTxOptions, signer: any): Promise<TransactionResult>;
    /**
     * Create and execute a delete memory record transaction
     */
    deleteMemoryRecord(options: DeleteMemoryRecordTxOptions, signer: any): Promise<TransactionResult>;
    /**
     * Create and execute a grant access transaction
     */
    grantAccess(options: GrantAccessTxOptions, signer: any): Promise<TransactionResult>;
    /**
     * Create and execute a revoke access transaction
     */
    revokeAccess(options: RevokeAccessTxOptions, signer: any): Promise<TransactionResult>;
    /**
     * Build a batch transaction combining multiple operations
     */
    buildBatchTransaction(operations: Array<{
        type: 'createMemory' | 'updateMemory' | 'deleteMemory' | 'grantAccess' | 'revokeAccess';
        options: any;
    }>): Transaction;
    /**
     * Execute a batch transaction
     */
    executeBatch(operations: Array<{
        type: 'createMemory' | 'updateMemory' | 'deleteMemory' | 'grantAccess' | 'revokeAccess';
        options: any;
    }>, signer: any, txOptions?: TransactionOptions): Promise<TransactionResult>;
    /**
     * Estimate gas cost for a transaction
     */
    estimateGas(tx: Transaction, signer: any): Promise<number>;
    /**
     * Get recommended gas budget based on transaction complexity
     */
    getRecommendedGasBudget(operationCount?: number): number;
}
//# sourceMappingURL=TransactionService.d.ts.map
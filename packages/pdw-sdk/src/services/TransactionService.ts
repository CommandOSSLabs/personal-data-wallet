import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';
import {
  PDWConfig,
  TransactionOptions,
  TransactionResult,
  CreateMemoryRecordTxOptions,
  UpdateMemoryMetadataTxOptions,
  DeleteMemoryRecordTxOptions,
  CreateMemoryIndexTxOptions,
  UpdateMemoryIndexTxOptions,
  GrantAccessTxOptions,
  RevokeAccessTxOptions,
  RegisterContentTxOptions,
} from '../types';

// Import generated Move contract functions
import * as MemoryModule from '../generated/pdw/memory';
import * as AccessModule from '../generated/pdw/seal_access_control';

/**
 * TransactionService provides high-level transaction building and execution
 * for Personal Data Wallet Move contracts with proper error handling and gas management.
 */
export class TransactionService {
  constructor(
    private client: SuiClient,
    private config: PDWConfig
  ) {}

  // ==================== MEMORY TRANSACTIONS ====================

  /**
   * Build transaction to create a new memory record
   */
  buildCreateMemoryRecord(options: CreateMemoryRecordTxOptions): Transaction {
    const tx = new Transaction();
    
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
      package: this.config.packageId!,
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
   * Build transaction to update memory metadata
   */
  buildUpdateMemoryMetadata(options: UpdateMemoryMetadataTxOptions): Transaction {
    const tx = new Transaction();
    
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
  buildDeleteMemoryRecord(options: DeleteMemoryRecordTxOptions): Transaction {
    const tx = new Transaction();
    
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
  buildCreateMemoryIndex(options: CreateMemoryIndexTxOptions): Transaction {
    const tx = new Transaction();
    
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
  buildUpdateMemoryIndex(options: UpdateMemoryIndexTxOptions): Transaction {
    const tx = new Transaction();
    
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
  buildGrantAccess(options: GrantAccessTxOptions): Transaction {
    const tx = new Transaction();
    
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
  buildRevokeAccess(options: RevokeAccessTxOptions): Transaction {
    const tx = new Transaction();
    
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
  buildRegisterContent(options: RegisterContentTxOptions): Transaction {
    const tx = new Transaction();
    
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
  async executeTransaction(
    tx: Transaction, 
    signer: any, 
    options: TransactionOptions = {}
  ): Promise<TransactionResult> {
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
      const transactionResult: TransactionResult = {
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
    } catch (error) {
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
  async createMemoryRecord(
    options: CreateMemoryRecordTxOptions, 
    signer: any
  ): Promise<TransactionResult> {
    const tx = this.buildCreateMemoryRecord(options);
    return this.executeTransaction(tx, signer, options);
  }

  /**
   * Create and execute an update memory metadata transaction
   */
  async updateMemoryMetadata(
    options: UpdateMemoryMetadataTxOptions, 
    signer: any
  ): Promise<TransactionResult> {
    const tx = this.buildUpdateMemoryMetadata(options);
    return this.executeTransaction(tx, signer, options);
  }

  /**
   * Create and execute a delete memory record transaction
   */
  async deleteMemoryRecord(
    options: DeleteMemoryRecordTxOptions, 
    signer: any
  ): Promise<TransactionResult> {
    const tx = this.buildDeleteMemoryRecord(options);
    return this.executeTransaction(tx, signer, options);
  }

  /**
   * Create and execute a grant access transaction
   */
  async grantAccess(
    options: GrantAccessTxOptions, 
    signer: any
  ): Promise<TransactionResult> {
    const tx = this.buildGrantAccess(options);
    return this.executeTransaction(tx, signer, options);
  }

  /**
   * Create and execute a revoke access transaction
   */
  async revokeAccess(
    options: RevokeAccessTxOptions, 
    signer: any
  ): Promise<TransactionResult> {
    const tx = this.buildRevokeAccess(options);
    return this.executeTransaction(tx, signer, options);
  }

  // ==================== BATCH OPERATIONS ====================

  /**
   * Build a batch transaction combining multiple operations
   */
  buildBatchTransaction(operations: Array<{
    type: 'createMemory' | 'updateMemory' | 'deleteMemory' | 'grantAccess' | 'revokeAccess';
    options: any;
  }>): Transaction {
    const tx = new Transaction();

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
          AccessModule.grantAccess({
            tx,
            ...operation.options,
          });
          break;
        
        case 'revokeAccess':
          AccessModule.revokeAccess({
            tx,
            ...operation.options,
          });
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
  async executeBatch(
    operations: Array<{
      type: 'createMemory' | 'updateMemory' | 'deleteMemory' | 'grantAccess' | 'revokeAccess';
      options: any;
    }>,
    signer: any,
    txOptions: TransactionOptions = {}
  ): Promise<TransactionResult> {
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
  async estimateGas(tx: Transaction, signer: any): Promise<number> {
    try {
      const dryRunResult = await this.client.dryRunTransactionBlock({
        transactionBlock: await tx.build({ client: this.client }),
      });
      
      return dryRunResult.effects.gasUsed?.computationCost 
        ? Number(dryRunResult.effects.gasUsed.computationCost)
        : 0;
    } catch (error) {
      console.error('Gas estimation failed:', error);
      return 0;
    }
  }

  /**
   * Get recommended gas budget based on transaction complexity
   */
  getRecommendedGasBudget(operationCount: number = 1): number {
    const baseGas = 1000000; // 1M MIST base
    const perOperationGas = 500000; // 500K MIST per operation
    return baseGas + (operationCount * perOperationGas);
  }
}
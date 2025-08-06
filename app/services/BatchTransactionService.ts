'use client';

import { Transaction } from '@mysten/sui/transactions';

// Class for batching multiple blockchain operations into a single transaction
export class BatchTransactionService {
  private transaction: Transaction;
  private operations: Array<{
    execute: () => Promise<void>;
    description: string;
  }> = [];
  private isExecuting = false;
  private autoExecuteThreshold: number;

  constructor(autoExecuteThreshold = 5) {
    this.transaction = new Transaction();
    this.autoExecuteThreshold = autoExecuteThreshold;
  }

  /**
   * Add a chat message to the transaction batch
   */
  addChatMessage(
    packageId: string,
    sessionId: string,
    role: string,
    content: string
  ) {
    this.operations.push({
      execute: async () => {
        this.transaction.moveCall({
          target: `${packageId}::chat_sessions::add_message_to_session`,
          arguments: [
            this.transaction.object(sessionId),
            this.transaction.pure.string(role),
            this.transaction.pure.string(content)
          ]
        });
      },
      description: `Add "${role}" message to session ${sessionId.substring(0, 8)}...`
    });

    // Auto-execute if we reach the threshold
    if (this.operations.length >= this.autoExecuteThreshold) {
      this.executeAsync();
    }

    return this;
  }

  /**
   * Reset the batch by creating a new transaction and clearing operations
   */
  reset() {
    if (this.isExecuting) {
      console.warn('Cannot reset while executing');
      return this;
    }
    
    this.transaction = new Transaction();
    this.operations = [];
    return this;
  }

  /**
   * Execute the transaction batch asynchronously
   */
  async executeAsync(wallet?: any): Promise<boolean> {
    // If there are no operations, just return success
    if (this.operations.length === 0) {
      return true;
    }

    // Don't allow concurrent execution
    if (this.isExecuting) {
      console.warn('Transaction batch is already executing');
      return false;
    }

    this.isExecuting = true;
    try {
      // Apply all operations to the transaction
      for (const op of this.operations) {
        await op.execute();
      }

      // If wallet is provided, execute the transaction
      if (wallet && wallet.connected) {
        await wallet.signAndExecuteTransactionBlock({
          transactionBlock: this.transaction as any
        });
      } else {
        console.error('Wallet not connected, cannot execute transaction');
        return false;
      }
      
      // Reset after successful execution
      this.reset();
      return true;
    } catch (error) {
      console.error('Error executing transaction batch:', error);
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Get the current pending operations count
   */
  get pendingCount(): number {
    return this.operations.length;
  }
}

// Global instance for sharing across components
let batchService: BatchTransactionService | null = null;

/**
 * Get or create a shared batch transaction service
 */
export function getSharedBatchService(autoExecuteThreshold = 5): BatchTransactionService {
  if (!batchService) {
    batchService = new BatchTransactionService(autoExecuteThreshold);
  }
  return batchService;
}
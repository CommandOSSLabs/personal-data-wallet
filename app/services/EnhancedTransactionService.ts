'use client';

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

interface PreApprovalConfig {
  maxTransactions: number;
  expirationMinutes: number;
}

/**
 * Enhanced transaction service with pre-approval and better batching
 */
export class EnhancedTransactionService {
  private transaction: Transaction;
  private operations: Array<{
    execute: () => Promise<void>;
    description: string;
    timestamp: number;
  }> = [];
  private isExecuting = false;
  private autoExecuteThreshold: number;
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelayMs: number;
  
  // Pre-approval configuration
  private preApprovalConfig: PreApprovalConfig = {
    maxTransactions: 10,
    expirationMinutes: 30
  };
  
  // Session-based approval tracking
  private sessionApproval: {
    approved: boolean;
    remainingTransactions: number;
    expiresAt: number;
  } | null = null;

  constructor(
    autoExecuteThreshold = 10, // Increased from 5 to batch more operations
    batchDelayMs = 2000 // Wait 2 seconds before executing to collect more operations
  ) {
    this.transaction = new Transaction();
    this.autoExecuteThreshold = autoExecuteThreshold;
    this.batchDelayMs = batchDelayMs;
  }

  /**
   * Request pre-approval for multiple transactions
   */
  async requestPreApproval(wallet: any): Promise<boolean> {
    if (!wallet?.connected) {
      console.error('Wallet not connected');
      return false;
    }

    try {
      // Create a dummy transaction to request pre-approval
      const approvalTx = new Transaction();
      
      // Add a comment to explain to the user what they're approving
      approvalTx.setSender(wallet.account.address);
      
      // Show approval dialog with clear messaging
      const message = `Pre-approve up to ${this.preApprovalConfig.maxTransactions} transactions for the next ${this.preApprovalConfig.expirationMinutes} minutes?`;
      
      if (confirm(message)) {
        this.sessionApproval = {
          approved: true,
          remainingTransactions: this.preApprovalConfig.maxTransactions,
          expiresAt: Date.now() + (this.preApprovalConfig.expirationMinutes * 60 * 1000)
        };
        
        console.log('Pre-approval granted for session');
        return true;
      }
    } catch (error) {
      console.error('Error requesting pre-approval:', error);
    }
    
    return false;
  }

  /**
   * Check if we have valid pre-approval
   */
  private hasValidPreApproval(): boolean {
    if (!this.sessionApproval) return false;
    
    // Check if approval has expired
    if (Date.now() > this.sessionApproval.expiresAt) {
      this.sessionApproval = null;
      return false;
    }
    
    // Check if we have remaining transactions
    return this.sessionApproval.remainingTransactions > 0;
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
      description: `Add "${role}" message to session ${sessionId.substring(0, 8)}...`,
      timestamp: Date.now()
    });

    // Set up delayed execution
    this.scheduleExecution();
    
    return this;
  }

  /**
   * Schedule batch execution with delay to collect more operations
   */
  private scheduleExecution() {
    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // If we've reached the threshold, execute immediately
    if (this.operations.length >= this.autoExecuteThreshold) {
      this.executeAsync();
      return;
    }

    // Otherwise, wait for more operations
    this.batchTimeout = setTimeout(() => {
      if (this.operations.length > 0) {
        this.executeAsync();
      }
    }, this.batchDelayMs);
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
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    return this;
  }

  /**
   * Execute the transaction batch
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

    // Clear the batch timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    this.isExecuting = true;
    try {
      // Apply all operations to the transaction
      for (const op of this.operations) {
        await op.execute();
      }

      // If wallet is provided, execute the transaction
      if (wallet && wallet.connected) {
        const operationCount = this.operations.length;
        console.log(`Executing batch of ${operationCount} operations`);
        
        // Check if we can use pre-approval
        if (this.hasValidPreApproval()) {
          console.log('Using pre-approved session');
          this.sessionApproval!.remainingTransactions--;
        }
        
        await wallet.signAndExecuteTransactionBlock({
          transactionBlock: this.transaction as any,
          options: {
            showEffects: true,
            showEvents: true
          }
        });
        
        console.log(`Successfully executed ${operationCount} operations in one transaction`);
      } else {
        console.error('Wallet not connected, cannot execute transaction');
        return false;
      }
      
      // Reset after successful execution
      this.reset();
      return true;
    } catch (error) {
      console.error('Error executing transaction batch:', error);
      
      // If error is due to approval, clear pre-approval
      if (error instanceof Error && error.message.includes('User rejected')) {
        this.sessionApproval = null;
      }
      
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  /**
   * Force immediate execution of pending operations
   */
  async flush(wallet: any): Promise<boolean> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    return this.executeAsync(wallet);
  }

  /**
   * Get the current pending operations count
   */
  get pendingCount(): number {
    return this.operations.length;
  }

  /**
   * Get session approval status
   */
  get approvalStatus(): {
    hasApproval: boolean;
    remainingTransactions: number;
    expiresIn: number;
  } {
    if (!this.hasValidPreApproval()) {
      return {
        hasApproval: false,
        remainingTransactions: 0,
        expiresIn: 0
      };
    }

    return {
      hasApproval: true,
      remainingTransactions: this.sessionApproval!.remainingTransactions,
      expiresIn: Math.max(0, this.sessionApproval!.expiresAt - Date.now())
    };
  }
}

// Global instance for sharing across components
let enhancedService: EnhancedTransactionService | null = null;

/**
 * Get or create a shared enhanced transaction service
 */
export function getEnhancedTransactionService(
  autoExecuteThreshold = 10,
  batchDelayMs = 2000
): EnhancedTransactionService {
  if (!enhancedService) {
    enhancedService = new EnhancedTransactionService(autoExecuteThreshold, batchDelayMs);
  }
  return enhancedService;
}

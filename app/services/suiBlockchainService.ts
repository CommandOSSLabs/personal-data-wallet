'use client'

import { useWallet } from '@suiet/wallet-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { getSharedBatchService } from './BatchTransactionService'
import { getEnhancedTransactionService } from './EnhancedTransactionService'

// Define the package ID to be used for our Move contracts
// Hardcoding values for testnet
const PACKAGE_ID = '0xef2acd8cfed039a44c82f99e2e0a32f50ed8306b7c507e1826d5bc6b73738ef0'
const SUI_NETWORK = 'testnet'
const SUI_API_URL = 'https://fullnode.testnet.sui.io:443'

console.log('Using SUI_PACKAGE_ID:', PACKAGE_ID)
console.log('Using SUI_NETWORK:', SUI_NETWORK)
console.log('Using SUI_API_URL:', SUI_API_URL)

// Create a shared SUI client instance to be used outside of React components
const sharedSuiClient = new SuiClient({
  url: SUI_API_URL
})

export class SuiBlockchainService {
  private client: SuiClient
  private wallet: any
  
  constructor(wallet: any) {
    // Initialize the Sui client with network configuration
    this.client = sharedSuiClient
    this.wallet = wallet
  }

  // Create a new chat session on the blockchain
  async createChatSession(modelName: string): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    console.log('Creating chat session with model:', modelName)
    console.log('Wallet connected:', this.wallet.connected)
    console.log('Wallet account:', this.wallet.account)
    console.log('Wallet chain:', this.wallet.chain)
    
    try {
      // Check wallet balance first
      const balance = await this.client.getBalance({
        owner: this.wallet.account.address,
        coinType: '0x2::sui::SUI'
      })
      
      console.log('Wallet SUI balance:', balance)
      
      if (BigInt(balance.totalBalance) === BigInt(0)) {
        throw new Error('Insufficient SUI balance. Please get some SUI from a faucet for gas fees.')
      }
      
      // Build the transaction
      const tx = new Transaction()
      
      // Call the create_session function from our Move package
      console.log('Using package ID:', PACKAGE_ID)
      const target = `${PACKAGE_ID}::chat_sessions::create_session`
      console.log('Target function:', target)
      
      tx.moveCall({
        target,
        arguments: [
          tx.pure.string(modelName), // model name string
        ]
      })

      console.log('Transaction built, signing and executing...')
      // Sign and execute the transaction using the connected wallet
      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      })
      
      console.log('Transaction executed, result:', result)
      
      // Extract the created object ID from events
      const sessionId = await this.extractObjectIdFromEvents(result)
      if (!sessionId) {
        console.error('Failed to extract session ID. Full result:', JSON.stringify(result, null, 2))
        throw new Error('Failed to extract session ID from transaction result')
      }
      
      return sessionId
    } catch (error) {
      console.error('Error creating chat session:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Check if the error is related to the package not found
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && 
          error.message.includes('DependentPackageNotFound')) {
        console.error('Package not found error. Make sure you are connected to testnet and the package ID is correct.')
        console.error('Current package ID:', PACKAGE_ID)
        console.error('Current network:', SUI_NETWORK)
        console.error('Current API URL:', SUI_API_URL)
      }
      
      throw error
    }
  }

  // Add a message to an existing session
  async addMessageToSession(
    sessionId: string, 
    role: string,
    content: string,
    executeBatch = false
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      // Use enhanced service for better batching and pre-approval
      const enhancedService = getEnhancedTransactionService();
      enhancedService.addChatMessage(PACKAGE_ID, sessionId, role, content);
      
      // Execute the batch immediately if requested or let it auto-execute when threshold reached
      if (executeBatch) {
        return await enhancedService.flush(this.wallet);
      }
      
      return true;
    } catch (error) {
      console.error('Error adding message to session:', error)
      throw error
    }
  }
  
  // Execute any pending batched transactions
  async executePendingTransactions(): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const enhancedService = getEnhancedTransactionService();
      return await enhancedService.flush(this.wallet);
    } catch (error) {
      console.error('Error executing pending transactions:', error)
      throw error
    }
  }
  
  // Request pre-approval for multiple transactions
  async requestPreApproval(): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const enhancedService = getEnhancedTransactionService();
      return await enhancedService.requestPreApproval(this.wallet);
    } catch (error) {
      console.error('Error requesting pre-approval:', error)
      return false
    }
  }

  // Delete a chat session
  async deleteSession(
    sessionId: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      // Call the delete_session function we added to the contract
      tx.moveCall({
        target: `${PACKAGE_ID}::chat_sessions::delete_session`,
        arguments: [
          tx.object(sessionId)  // session ID
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error deleting session:', error)
      throw error
    }
  }

  // Save a summary for a session
  async saveSessionSummary(
    sessionId: string,
    summary: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::chat_sessions::save_session_summary`,
        arguments: [
          tx.object(sessionId),     // session ID
          tx.pure.string(summary),  // summary text
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error saving session summary:', error)
      throw error
    }
  }

  // Get all memory records for a user from the blockchain with content
  async getUserMemories(userAddress: string): Promise<{
    memories: Array<{
      id: string;
      category: string;
      vectorId: number;
      blobId: string;
      owner: string;
      content?: string;
      isEncrypted?: boolean;
    }>;
    total: number;
  }> {
    try {
      console.log('Fetching memories from blockchain for user:', userAddress);

      // Query all Memory objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::memory::Memory`
        },
        options: {
          showContent: true,
          showType: true
        }
      });

      console.log('Raw blockchain response:', response);

      const memories = [];

      for (const item of response.data) {
        if (item.data?.content && 'fields' in item.data.content) {
          const fields = item.data.content.fields as any;

          const memory = {
            id: item.data.objectId,
            category: fields.category || 'unknown',
            vectorId: parseInt(fields.vector_id) || 0,
            blobId: fields.blob_id || '',
            owner: fields.owner || userAddress,
            content: undefined as string | undefined,
            isEncrypted: true
          };

          // Don't fetch content here to avoid infinite loops
          // Content will be fetched on-demand by the frontend
          if (memory.blobId && memory.blobId !== 'temp_blob_id') {
            // Mark as available for fetching
            memory.isEncrypted = true; // Will be decrypted when fetched
          } else {
            console.log(`Memory ${memory.id} has invalid blobId: ${memory.blobId}`);
            memory.content = 'Content not available (invalid storage reference)';
            memory.isEncrypted = false;
          }

          memories.push(memory);
        }
      }

      console.log(`Found ${memories.length} memories on blockchain for user ${userAddress}`);

      return {
        memories,
        total: memories.length
      };

    } catch (error) {
      console.error('Error fetching user memories from blockchain:', error);
      return {
        memories: [],
        total: 0
      };
    }
  }

  // Fetch content from storage (local or Walrus)
  private async fetchContentFromStorage(blobId: string): Promise<string> {
    try {
      // Check if it's a local storage blob ID
      if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
        console.log(`Fetching content from local storage: ${blobId}`);

        // Call backend to retrieve content from local storage
        const response = await fetch(`/api/storage/retrieve/${blobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch from local storage: ${response.statusText}`);
        }

        const data = await response.text();
        return data;
      } else {
        // It's a Walrus blob ID
        console.log(`Fetching content from Walrus: ${blobId}`);

        // Call backend to retrieve content from Walrus
        const response = await fetch(`/api/storage/retrieve/${blobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch from Walrus: ${response.statusText}`);
        }

        const data = await response.text();
        return data;
      }
    } catch (error) {
      console.error(`Error fetching content for blob ${blobId}:`, error);
      throw error;
    }
  }

  // Get memory index for a user from the blockchain
  async getUserMemoryIndex(userAddress: string): Promise<{
    indexId: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
  } | null> {
    try {
      console.log('Fetching memory index from blockchain for user:', userAddress);

      // Query MemoryIndex objects owned by the user
      const response = await this.client.getOwnedObjects({
        owner: userAddress,
        filter: {
          StructType: `${PACKAGE_ID}::memory::MemoryIndex`
        },
        options: {
          showContent: true,
          showType: true
        }
      });

      if (response.data.length === 0) {
        console.log('No memory index found for user:', userAddress);
        return null;
      }

      // Get the first (and should be only) memory index
      const indexObject = response.data[0];
      if (indexObject.data?.content && 'fields' in indexObject.data.content) {
        const fields = indexObject.data.content.fields as any;

        return {
          indexId: indexObject.data.objectId,
          version: parseInt(fields.version) || 1,
          indexBlobId: fields.index_blob_id || '',
          graphBlobId: fields.graph_blob_id || ''
        };
      }

      return null;

    } catch (error) {
      console.error('Error fetching user memory index from blockchain:', error);
      return null;
    }
  }

  // Create a memory record on the blockchain
  async createMemoryRecord(
    category: string,
    vectorId: number,
    blobId: string
  ): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::create_memory_record`,
        arguments: [
          tx.pure.string(category),
          tx.pure.u64(BigInt(vectorId)),
          tx.pure.string(blobId),
        ]
      })

      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      })
      
      const memoryId = await this.extractObjectIdFromEvents(result)
      if (!memoryId) {
        throw new Error('Failed to extract memory ID from transaction result')
      }
      
      return memoryId
    } catch (error) {
      console.error('Error creating memory record:', error)
      throw error
    }
  }

  // Create a new memory index
  async createMemoryIndex(
    indexBlobId: string,
    graphBlobId: string
  ): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::create_memory_index`,
        arguments: [
          tx.pure.string(indexBlobId),
          tx.pure.string(graphBlobId),
        ]
      })

      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any
      })
      
      const indexId = await this.extractObjectIdFromEvents(result)
      if (!indexId) {
        throw new Error('Failed to extract index ID from transaction result')
      }
      
      return indexId
    } catch (error) {
      console.error('Error creating memory index:', error)
      throw error
    }
  }

  // Update a memory index
  async updateMemoryIndex(
    indexId: string,
    expectedVersion: number,
    newIndexBlobId: string,
    newGraphBlobId: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::update_memory_index`,
        arguments: [
          tx.object(indexId),
          tx.pure.u64(BigInt(expectedVersion)),
          tx.pure.string(newIndexBlobId),
          tx.pure.string(newGraphBlobId),
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error updating memory index:', error)
      throw error
    }
  }

  /**
   * Delete a memory record from the blockchain
   * @param memoryId The object ID of the memory to delete
   * @returns True if successful, otherwise throws an error
   */
  async deleteMemory(memoryId: string): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }

    try {
      console.log(`Deleting memory ${memoryId}...`)
      // Build the transaction
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory_wallet::delete_memory`,
        arguments: [
          tx.object(memoryId), // memory object ID
        ]
      })

      // Sign and execute the transaction
      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      console.log(`Memory deletion transaction completed with digest: ${result.digest}`)
      return result.digest !== undefined && result.digest !== null
    } catch (error) {
      console.error('Error deleting memory:', error)
      throw error
    }
  }

  // Helper method to extract object ID from transaction events
  private async extractObjectIdFromEvents(result: any): Promise<string> {
    try {
      console.log('Extracting object ID from result:', result)
      
      // Handle wallet kit response which may have different structure
      if (!result) {
        console.error('No result provided')
        return ''
      }
      
      // Check if we have a digest
      if (!result.digest) {
        console.error('No transaction digest found')
        return ''
      }
      
      console.log('Transaction digest:', result.digest)
      
      // Use the digest to fetch full transaction details
      try {
        // Wait for transaction to be confirmed
        console.log('Waiting for transaction confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds for indexing
        
        console.log('Fetching transaction details using digest:', result.digest)
        const txResult = await this.client.getTransactionBlock({
          digest: result.digest,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true
          }
        })
        
        console.log('Retrieved transaction details:', txResult)
        
        // Look for created objects in objectChanges
        if (txResult.objectChanges && Array.isArray(txResult.objectChanges)) {
          console.log('Checking object changes from transaction')
          for (const change of txResult.objectChanges) {
            if (change.type === 'created') {
              console.log('Found created object:', change.objectId)
              return change.objectId
            }
          }
        }
        
        // Look for created objects in effects
        if (txResult.effects?.created && Array.isArray(txResult.effects.created)) {
          console.log('Checking effects.created from transaction')
          const created = txResult.effects.created[0]
          if (created && created.reference) {
            console.log('Found created object in effects:', created.reference.objectId)
            return created.reference.objectId
          }
        }
        
        // Look for events that might indicate a creation
        if (txResult.events && Array.isArray(txResult.events)) {
          for (const event of txResult.events) {
            if (event.type.includes('::chat_sessions::ChatSessionCreated')) {
              console.log('Found ChatSessionCreated event:', event)
              if (event.parsedJson && typeof event.parsedJson === 'object' && 'id' in event.parsedJson) {
                console.log('Found object ID in event:', event.parsedJson.id)
                return event.parsedJson.id as string
              }
            }
          }
        }
        
        console.error('No created objects found in transaction details')
      } catch (err) {
        console.error('Error fetching transaction details:', err)
      }
      
      return ''
    } catch (error) {
      console.error('Error extracting object ID:', error)
      return ''
    }
  }
}

// Non-hook version of the service - for use in non-React contexts
let suiServiceWithMockWallet: SuiBlockchainService | null = null;

export function getStaticSuiService() {
  if (!suiServiceWithMockWallet) {
    // Create a mock wallet for non-component contexts
    const mockWallet = {
      connected: false,
      account: null,
      signAndExecuteTransactionBlock: async () => {
        throw new Error('Cannot execute transactions outside of React components - pass a real wallet instance')
      }
    };
    suiServiceWithMockWallet = new SuiBlockchainService(mockWallet);
  }
  return suiServiceWithMockWallet;
}

// Hook for using the Sui blockchain service - ONLY call this in React components
export function useSuiBlockchain() {
  const wallet = useWallet()
  const service = new SuiBlockchainService(wallet)
  
  return {
    service,
    wallet
  }
}
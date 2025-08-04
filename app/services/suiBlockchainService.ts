'use client'

import { useWallet } from '@suiet/wallet-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'

// Define the package ID to be used for our Move contracts
const PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID || '0x18df5680add6cc42ca87ac3373eb7dc61910c18b0da0e42383ebec35897399ea'
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'devnet'
const SUI_API_URL = process.env.NEXT_PUBLIC_SUI_API_URL || 'https://fullnode.devnet.sui.io:443'

export class SuiBlockchainService {
  private client: SuiClient
  private wallet: ReturnType<typeof useWallet>
  
  constructor(wallet: ReturnType<typeof useWallet>) {
    // Initialize the Sui client with network configuration
    this.client = new SuiClient({
      url: SUI_API_URL
    })
    this.wallet = wallet
  }

  // Create a new chat session on the blockchain
  async createChatSession(modelName: string): Promise<string> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      // Build the transaction
      const tx = new Transaction()
      
      // Call the create_session function from our Move package
      tx.moveCall({
        target: `${PACKAGE_ID}::pdw::chat_sessions::create_session`,
        arguments: [
          tx.pure.string(modelName), // model name string
        ]
      })

      // Sign and execute the transaction using the connected wallet
      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        }
      })
      
      // Extract the created object ID from events
      const sessionId = this.extractObjectIdFromEvents(result)
      if (!sessionId) {
        throw new Error('Failed to extract session ID from transaction result')
      }
      
      return sessionId
    } catch (error) {
      console.error('Error creating chat session:', error)
      throw error
    }
  }

  // Add a message to an existing session
  async addMessageToSession(
    sessionId: string, 
    role: string,
    content: string
  ): Promise<boolean> {
    if (!this.wallet.connected || !this.wallet.account) {
      throw new Error('Wallet not connected')
    }
    
    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::pdw::chat_sessions::add_message_to_session`,
        arguments: [
          tx.object(sessionId),    // session ID
          tx.pure.string(role),    // role (user or assistant)
          tx.pure.string(content), // message content
        ]
      })

      await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: { showEffects: true }
      })
      
      return true
    } catch (error) {
      console.error('Error adding message to session:', error)
      throw error
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
        target: `${PACKAGE_ID}::pdw::chat_sessions::delete_session`,
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
        target: `${PACKAGE_ID}::pdw::chat_sessions::save_session_summary`,
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
        target: `${PACKAGE_ID}::pdw::memory::create_memory_record`,
        arguments: [
          tx.pure.string(category),
          tx.pure.u64(BigInt(vectorId)),
          tx.pure.string(blobId),
        ]
      })

      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        }
      })
      
      const memoryId = this.extractObjectIdFromEvents(result)
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
        target: `${PACKAGE_ID}::pdw::memory::create_memory_index`,
        arguments: [
          tx.pure.string(indexBlobId),
          tx.pure.string(graphBlobId),
        ]
      })

      const result = await this.wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: {
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        }
      })
      
      const indexId = this.extractObjectIdFromEvents(result)
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
        target: `${PACKAGE_ID}::pdw::memory::update_memory_index`,
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

  // Helper method to extract object ID from transaction events
  private extractObjectIdFromEvents(result: any): string {
    try {
      // Look for object creation events
      for (const event of result.events || []) {
        if (
          event.type.includes('::pdw::chat_sessions::ChatSessionCreated') ||
          event.type.includes('::pdw::memory::MemoryCreated') ||
          event.type.includes('::pdw::memory::MemoryIndexCreated')
        ) {
          // Extract the ID from the event
          return event.parsedJson?.id
        }
      }
      
      // If no events found, try to extract from object changes
      const created = (result.objectChanges || []).find(
        (change: any) => change.type === 'created'
      )
      
      return created?.objectId || ''
    } catch (error) {
      console.error('Error extracting object ID:', error)
      return ''
    }
  }
}

// Hook for using the Sui blockchain service
export function useSuiBlockchain() {
  const wallet = useWallet()
  const service = new SuiBlockchainService(wallet)
  
  return {
    service,
    wallet
  }
}
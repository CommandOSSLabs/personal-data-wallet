'use client'

import { Transaction } from '@mysten/sui/transactions'
import { httpApi } from '@/app/api/httpApi'

// Types for memory index management
export interface MemoryIndexState {
  indexId: string | null
  isCreating: boolean
  isRegistered: boolean
  lastError: string | null
  createdAt: number | null
}

export interface PrepareIndexResponse {
  success: boolean
  indexBlobId?: string
  graphBlobId?: string
  message?: string
}

export interface RegisterIndexResponse {
  success: boolean
  message?: string
}

export interface CreateMemoryResponse {
  success: boolean
  memoryId?: string
  message?: string
  requiresIndexCreation?: boolean
  indexBlobId?: string
  graphBlobId?: string
}

// Cache key prefix for localStorage
const CACHE_PREFIX = 'memory_index_'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

class MemoryIndexService {
  private indexCache: Map<string, MemoryIndexState> = new Map()
  private pendingOperations: Map<string, Promise<string | null>> = new Map()

  constructor() {
    // Load cached indexes from localStorage on initialization
    this.loadCachedIndexes()
  }

  /**
   * Load cached index states from localStorage
   */
  private loadCachedIndexes(): void {
    if (typeof window === 'undefined') return

    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith(CACHE_PREFIX))
      
      for (const key of keys) {
        const userAddress = key.replace(CACHE_PREFIX, '')
        const cached = localStorage.getItem(key)
        
        if (cached) {
          const state: MemoryIndexState = JSON.parse(cached)
          
          // Check if cache is not expired
          if (state.createdAt && Date.now() - state.createdAt < CACHE_EXPIRY) {
            this.indexCache.set(userAddress, state)
          } else {
            // Remove expired cache
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.error('Error loading cached indexes:', error)
    }
  }

  /**
   * Save index state to localStorage
   */
  private saveIndexState(userAddress: string, state: MemoryIndexState): void {
    if (typeof window === 'undefined') return

    try {
      this.indexCache.set(userAddress, state)
      localStorage.setItem(
        `${CACHE_PREFIX}${userAddress}`,
        JSON.stringify(state)
      )
    } catch (error) {
      console.error('Error saving index state:', error)
    }
  }

  /**
   * Get the current index state for a user
   */
  getIndexState(userAddress: string): MemoryIndexState | null {
    return this.indexCache.get(userAddress) || null
  }

  /**
   * Clear index state for a user
   */
  clearIndexState(userAddress: string): void {
    this.indexCache.delete(userAddress)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${CACHE_PREFIX}${userAddress}`)
    }
  }

  /**
   * Ensure a user has a memory index, creating one if necessary
   * This is the main entry point for index management
   */
  async ensureMemoryIndex(
    userAddress: string,
    wallet: any
  ): Promise<string | null> {
    // Check if we already have a registered index
    const cachedState = this.getIndexState(userAddress)
    if (cachedState?.indexId && cachedState.isRegistered) {
      console.log(`Using cached index ${cachedState.indexId} for ${userAddress}`)
      return cachedState.indexId
    }

    // Check if there's already a pending operation for this user
    const pendingOp = this.pendingOperations.get(userAddress)
    if (pendingOp) {
      console.log(`Waiting for pending index creation for ${userAddress}`)
      return pendingOp
    }

    // Start new index creation operation
    const operation = this.createIndexForUser(userAddress, wallet)
    this.pendingOperations.set(userAddress, operation)

    try {
      const result = await operation
      return result
    } finally {
      this.pendingOperations.delete(userAddress)
    }
  }

  /**
   * Create a new memory index for a user
   */
  private async createIndexForUser(
    userAddress: string,
    wallet: any
  ): Promise<string | null> {
    try {
      // Update state to indicate creation is in progress
      this.saveIndexState(userAddress, {
        indexId: null,
        isCreating: true,
        isRegistered: false,
        lastError: null,
        createdAt: null
      })

      // Step 1: Prepare index data on backend
      console.log(`Preparing index data for ${userAddress}...`)
      const prepareResponse = await this.prepareIndex(userAddress)
      
      if (!prepareResponse.success || !prepareResponse.indexBlobId || !prepareResponse.graphBlobId) {
        const error = prepareResponse.message || 'Failed to prepare index data'
        this.saveIndexState(userAddress, {
          indexId: null,
          isCreating: false,
          isRegistered: false,
          lastError: error,
          createdAt: null
        })
        throw new Error(error)
      }

      // Step 2: Create index on blockchain
      console.log(`Creating index on-chain for ${userAddress}...`)
      const indexId = await this.createIndexOnChain(
        userAddress,
        prepareResponse.indexBlobId,
        prepareResponse.graphBlobId,
        wallet
      )

      if (!indexId) {
        const error = 'Failed to create index on blockchain'
        this.saveIndexState(userAddress, {
          indexId: null,
          isCreating: false,
          isRegistered: false,
          lastError: error,
          createdAt: null
        })
        throw new Error(error)
      }

      // Step 3: Register index with backend
      console.log(`Registering index ${indexId} with backend...`)
      const registerResponse = await this.registerIndex(userAddress, indexId)
      
      if (!registerResponse.success) {
        const error = registerResponse.message || 'Failed to register index with backend'
        this.saveIndexState(userAddress, {
          indexId,
          isCreating: false,
          isRegistered: false,
          lastError: error,
          createdAt: Date.now()
        })
        // Don't throw here - we have the index created, just not registered
        console.error(error)
      }

      // Success - save the final state
      this.saveIndexState(userAddress, {
        indexId,
        isCreating: false,
        isRegistered: registerResponse.success,
        lastError: null,
        createdAt: Date.now()
      })

      console.log(`Successfully created and registered index ${indexId} for ${userAddress}`)
      return indexId

    } catch (error) {
      console.error(`Failed to create index for ${userAddress}:`, error)
      
      // Save error state
      this.saveIndexState(userAddress, {
        indexId: null,
        isCreating: false,
        isRegistered: false,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        createdAt: null
      })
      
      return null
    }
  }

  /**
   * Prepare index data on the backend
   */
  private async prepareIndex(userAddress: string): Promise<PrepareIndexResponse> {
    try {
      const response = await httpApi.post('/api/memories/prepare-index', {
        userAddress
      })
      return response as PrepareIndexResponse
    } catch (error) {
      console.error('Error preparing index:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to prepare index'
      }
    }
  }

  /**
   * Create memory index on blockchain
   */
  private async createIndexOnChain(
    userAddress: string,
    indexBlobId: string,
    graphBlobId: string,
    wallet: any
  ): Promise<string | null> {
    if (!wallet.connected || !wallet.account) {
      throw new Error('Wallet not connected')
    }

    try {
      const PACKAGE_ID = '0x8ae699f05fbbf9c314118d53bfdd6e43c4daa12b7a785a972128f1efaf65b50c'
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::memory::create_memory_index`,
        arguments: [
          tx.pure.string(indexBlobId),
          tx.pure.string(graphBlobId),
        ],
      })

      const result = await wallet.signAndExecuteTransactionBlock({
        transactionBlock: tx as any,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        }
      })

      // Extract created object ID
      const indexId = await this.extractObjectId(result)
      return indexId
    } catch (error) {
      console.error('Error creating index on-chain:', error)
      return null
    }
  }

  /**
   * Register index with backend
   */
  private async registerIndex(
    userAddress: string,
    indexId: string
  ): Promise<RegisterIndexResponse> {
    try {
      const response = await httpApi.post('/api/memories/register-index', {
        userAddress,
        indexId
      })
      return response as RegisterIndexResponse
    } catch (error) {
      console.error('Error registering index:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register index'
      }
    }
  }

  /**
   * Extract object ID from transaction result
   */
  private async extractObjectId(result: any): Promise<string | null> {
    try {
      console.log('Initial transaction result:', JSON.stringify(result, null, 2))
      
      // If we have a digest, fetch the full transaction details
      if (result.digest) {
        console.log('Transaction digest:', result.digest)
        
        // Import SuiClient dynamically to get transaction details
        const { SuiClient } = await import('@mysten/sui/client')
        const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' })
        
        // Wait for transaction to be indexed
        console.log('Waiting for transaction confirmation...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        try {
          const txResult = await client.getTransactionBlock({
            digest: result.digest,
            options: {
              showEffects: true,
              showEvents: true,
              showObjectChanges: true
            }
          })
          
          console.log('Retrieved full transaction details:', JSON.stringify(txResult, null, 2))
          
          // Look for created objects in objectChanges
          if (txResult.objectChanges && Array.isArray(txResult.objectChanges)) {
            for (const change of txResult.objectChanges) {
              if (change.type === 'created') {
                console.log('Found created object:', change.objectId)
                return change.objectId
              }
            }
          }
          
          // Look for created objects in effects
          if (txResult.effects?.created && Array.isArray(txResult.effects.created)) {
            for (const created of txResult.effects.created) {
              if (created.reference && created.reference.objectId) {
                console.log('Found created object in effects:', created.reference.objectId)
                return created.reference.objectId
              }
            }
          }
          
          // Look for events with object IDs (specifically MemoryIndexUpdated)
          if (txResult.events && Array.isArray(txResult.events)) {
            for (const event of txResult.events) {
              if (event.type.includes('::memory::MemoryIndexUpdated') && event.parsedJson) {
                console.log('Found MemoryIndexUpdated event:', event.parsedJson)
                if (event.parsedJson.id) {
                  return event.parsedJson.id
                }
              }
            }
          }
        } catch (fetchError) {
          console.error('Error fetching transaction details:', fetchError)
        }
      }
      
      // Fallback to checking immediate result
      if (result.objectChanges && Array.isArray(result.objectChanges)) {
        for (const change of result.objectChanges) {
          if (change.type === 'created') {
            console.log('Found created object in immediate result:', change.objectId)
            return change.objectId
          }
        }
      }

      console.error('No created objects found')
      return null
    } catch (error) {
      console.error('Error extracting object ID:', error)
      return null
    }
  }

  /**
   * Handle memory creation with automatic index creation
   * This wraps the memory creation API call and handles index creation if needed
   */
  async createMemoryWithAutoIndex(
    content: string,
    category: string,
    userAddress: string,
    wallet: any
  ): Promise<CreateMemoryResponse> {
    try {
      // First attempt to create the memory
      let response = await httpApi.post('/api/memories', {
        content,
        category,
        userAddress
      }) as CreateMemoryResponse

      // Check if index creation is required
      if (!response.success && response.requiresIndexCreation) {
        console.log('Index creation required, creating index...')
        
        // Ensure index exists
        const indexId = await this.ensureMemoryIndex(userAddress, wallet)
        
        if (!indexId) {
          return {
            success: false,
            message: 'Failed to create memory index. Please try again.'
          }
        }

        // Retry memory creation
        console.log('Retrying memory creation after index creation...')
        response = await httpApi.post('/api/memories', {
          content,
          category,
          userAddress
        }) as CreateMemoryResponse
      }

      return response
    } catch (error) {
      console.error('Error creating memory:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create memory'
      }
    }
  }

  /**
   * Check if user needs to create an index
   * This can be called proactively to create index before first memory
   */
  async checkAndCreateIndex(
    userAddress: string,
    wallet: any
  ): Promise<{
    hasIndex: boolean
    indexId: string | null
    message?: string
  }> {
    try {
      // Check cache first
      const cachedState = this.getIndexState(userAddress)
      if (cachedState?.indexId && cachedState.isRegistered) {
        return {
          hasIndex: true,
          indexId: cachedState.indexId
        }
      }

      // Try to create a test memory to check if index exists
      const testResponse = await httpApi.post('/api/memories', {
        content: 'test',
        category: 'test',
        userAddress
      }) as CreateMemoryResponse

      if (testResponse.requiresIndexCreation) {
        // Index doesn't exist, create it
        console.log('Index does not exist, creating...')
        const indexId = await this.ensureMemoryIndex(userAddress, wallet)
        
        return {
          hasIndex: !!indexId,
          indexId,
          message: indexId ? 'Index created successfully' : 'Failed to create index'
        }
      }

      // Index exists but not in our cache
      return {
        hasIndex: true,
        indexId: null,
        message: 'Index exists on backend'
      }
    } catch (error) {
      console.error('Error checking index:', error)
      return {
        hasIndex: false,
        indexId: null,
        message: error instanceof Error ? error.message : 'Failed to check index'
      }
    }
  }
}

// Export singleton instance
export const memoryIndexService = new MemoryIndexService()

// Export types
export type { MemoryIndexState, PrepareIndexResponse, RegisterIndexResponse, CreateMemoryResponse }

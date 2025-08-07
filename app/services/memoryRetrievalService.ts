'use client'

import { memoryApi } from '../api/memoryApi'
import { memoryDecryptionCache } from './memoryDecryptionCache'

// Interface for memory search results
export interface MemorySearchResult {
  id: string
  content: string
  category: string
  similarity_score: number
  timestamp: string
  isEncrypted: boolean
  walrusHash?: string
  owner: string
}

// Interface for memory context results
export interface MemoryContext {
  context: string
  relevantMemories: any[]
  queryMetadata: {
    queryTimeMs: number
    memoriesFound: number
    contextLength: number
  }
}

class MemoryRetrievalService {
  private cachedMemories: Record<string, any[]> = {}
  private memoryCacheTTL = 60 * 1000 // 1 minute cache

  /**
   * Search for memories related to a query
   */
  async searchMemories(
    query: string,
    userAddress: string,
    category?: string,
    limit: number = 5
  ): Promise<MemorySearchResult[]> {
    try {
      // Use the backend API to perform the search
      const response = await memoryApi.searchMemories({
        query,
        userAddress,
        category,
        k: limit
      })

      // Process results and check decryption cache
      const results = response.results || []

      // Auto-decrypt results that have cached decrypted content
      await Promise.all(results.map(async (result) => {
        if (result.walrusHash && await memoryDecryptionCache.isMemoryDecrypted(result.id)) {
          // Update with cached decrypted content
          const content = await memoryDecryptionCache.getDecryptedContent(result.walrusHash)
          if (content) {
            result.content = content
          }
        }
      }))

      return results
    } catch (error) {
      console.error('Error searching memories:', error)
      return []
    }
  }

  /**
   * Get memory context for a chat message
   */
  async getMemoryContext(
    message: string,
    userAddress: string,
    userSignature: string
  ): Promise<MemoryContext> {
    try {
      // Call backend to get memory context
      const response = await memoryApi.getMemoryContext(message, userAddress, userSignature)

      // Process and return formatted context
      return {
        context: response.context,
        relevantMemories: response.relevant_memories || [],
        queryMetadata: {
          queryTimeMs: response.query_metadata?.query_time_ms || 0,
          memoriesFound: response.query_metadata?.memories_found || 0,
          contextLength: response.query_metadata?.context_length || 0
        }
      }
    } catch (error) {
      console.error('Error getting memory context:', error)
      return {
        context: '',
        relevantMemories: [],
        queryMetadata: {
          queryTimeMs: 0,
          memoriesFound: 0,
          contextLength: 0
        }
      }
    }
  }

  /**
   * Get all memories for a user directly from blockchain with caching
   */
  async getUserMemories(userAddress: string, forceRefresh = false): Promise<any[]> {
    // Check cache first unless force refresh
    const cacheKey = `memories_${userAddress}`
    const cachedData = this.cachedMemories[cacheKey]
    const now = Date.now()

    if (!forceRefresh && cachedData && cachedData.timestamp && (now - cachedData.timestamp) < this.memoryCacheTTL) {
      console.log('Using cached memories from blockchain data')
      return cachedData.memories
    }

    try {
      // Fetch directly from blockchain instead of backend API
      const { SuiBlockchainService } = await import('@/app/services/suiBlockchainService');

      // Create a service instance with a mock wallet for read-only operations
      const mockWallet = {
        connected: false,
        account: null,
        signAndExecuteTransactionBlock: async () => {
          throw new Error('Read-only operation - no signing required');
        }
      };

      const suiService = new SuiBlockchainService(mockWallet);
      const blockchainResult = await suiService.getUserMemories(userAddress);

      // Transform blockchain data to expected format
      const memories = blockchainResult.memories.map(memory => ({
        id: memory.id,
        content: memory.content || 'Loading content...', // Will be fetched by cache service
        category: memory.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        blobId: memory.blobId,
        vectorId: memory.vectorId,
        owner: memory.owner,
        suiObjectId: memory.id,
        isEncrypted: memory.isEncrypted !== false, // Default to encrypted
        walrusHash: memory.blobId // Add walrusHash for cache service
      }));

      // Update cache
      this.cachedMemories[cacheKey] = {
        memories,
        timestamp: now
      }

      console.log(`Fetched ${memories.length} memories from blockchain for user ${userAddress}`);

      // Auto-load content for memories
      await this.autoLoadMemoryContent(memories);

      return memories
    } catch (error) {
      console.error('Error getting user memories from blockchain:', error)
      return []
    }
  }

  /**
   * Auto-load content for memories in background
   */
  private async autoLoadMemoryContent(memories: any[]): Promise<void> {
    try {
      console.log(`Auto-loading content for ${memories.length} memories`);

      // Load content for all memories in parallel (with concurrency limit)
      const batchSize = 3; // Process 3 at a time to avoid overwhelming the API
      for (let i = 0; i < memories.length; i += batchSize) {
        const batch = memories.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (memory) => {
            if (memory.walrusHash && memory.walrusHash !== 'temp_blob_id') {
              try {
                console.log(`Loading content for memory ${memory.id} from ${memory.walrusHash}`);
                const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);

                if (content) {
                  // Update the memory object with real content
                  memory.content = content;
                  memory.isEncrypted = false;
                  console.log(`Content loaded for memory ${memory.id}: ${content.substring(0, 50)}...`);
                } else {
                  memory.content = 'Content not available';
                  memory.isEncrypted = false;
                }
              } catch (error) {
                console.error(`Failed to load content for memory ${memory.id}:`, error);
                memory.content = 'Failed to load content';
                memory.isEncrypted = true;
              }
            } else {
              memory.content = 'Invalid storage reference';
              memory.isEncrypted = false;
            }
          })
        );

        // Small delay between batches to be nice to the API
        if (i + batchSize < memories.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Content loading completed for ${memories.length} memories`);
    } catch (error) {
      console.error('Error auto-loading memory content:', error);
    }
  }

  /**
   * Find memories relevant to a text using HNSW index
   */
  async findRelevantMemories(text: string, userAddress: string, limit = 5): Promise<any[]> {
    if (!text || text.trim().length === 0) {
      return []
    }

    try {
      // Use the search API which uses the HNSW index for fast vector similarity search
      const results = await this.searchMemories(text, userAddress, undefined, limit)
      return results
    } catch (error) {
      console.error('Error finding relevant memories:', error)
      
      // Fallback to client-side relevance if backend search fails
      try {
        const allMemories = await this.getUserMemories(userAddress)
        
        // Simple relevance calculation based on text matching
        const relevantMemories = allMemories
          .filter(memory => {
            if (!memory.content) return false
            
            // Split query into keywords
            const keywords = text.toLowerCase().split(/\s+/)
              .filter(word => word.length > 3)
            
            // Count matches
            const memoryContent = memory.content.toLowerCase()
            let matches = 0
            for (const keyword of keywords) {
              if (memoryContent.includes(keyword)) {
                matches++
              }
            }
            
            // Return true if at least one keyword matches
            return matches > 0
          })
          .sort((a, b) => {
            // Sort by recency if no other criteria
            const dateA = new Date(a.timestamp || a.created_at).getTime()
            const dateB = new Date(b.timestamp || b.created_at).getTime()
            return dateB - dateA
          })
          .slice(0, limit)
        
        return relevantMemories
      } catch (fallbackError) {
        console.error('Fallback relevance search failed:', fallbackError)
        return []
      }
    }
  }
  
  /**
   * Clear memory cache
   */
  clearCache(userAddress?: string) {
    if (userAddress) {
      // Clear specific user cache
      delete this.cachedMemories[`memories_${userAddress}`]
    } else {
      // Clear all cache
      this.cachedMemories = {}
    }
  }
}

// Export singleton instance
export const memoryRetrievalService = new MemoryRetrievalService()
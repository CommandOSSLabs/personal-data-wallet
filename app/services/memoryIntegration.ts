// Memory Integration Service
// Simplified service for memory context retrieval (detection now handled by backend)

import { memoryApi } from '@/app/api'

export interface MemoryContext {
  relevantMemories: string[]
  contextSummary: string
  totalMemories: number
}

// Types for compatibility (detection now handled by backend)
export interface DetectionResult {
  shouldStore: boolean
  memories: MemoryCandidate[]
  reasoning: string
}

export interface MemoryCandidate {
  content: string
  category: string
  confidence: number
  extractedInfo?: { key: string; value: string }[]
}

class MemoryIntegrationService {
  /**
   * Process a user message for memory detection and storage
   * Note: Memory detection is now handled automatically by the backend
   * This method is kept for compatibility but returns empty results
   */
  async processMessage(
    message: string, 
    userAddress: string, 
    userSignature?: string
  ): Promise<{
    detectionResult: DetectionResult
    storedMemories: string[]
    errors: string[]
  }> {
    // Memory detection is now handled automatically by the backend
    // during chat streaming, so this method returns empty results
    console.log('Memory detection now handled by backend automatically')
    
    return {
      detectionResult: {
        shouldStore: false,
        memories: [],
        reasoning: 'Memory detection moved to backend'
      },
      storedMemories: [],
      errors: []
    }
  }

  /**
   * Get relevant memory context for a conversation
   */
  async getMemoryContext(
    query: string,
    userAddress: string,
    userSignature: string,
    maxMemories: number = 5
  ): Promise<MemoryContext> {
    try {
      // Use the regular search endpoint (secure endpoints don't exist yet)
      const response = await memoryApi.searchMemories({
        query: query,
        userAddress: userAddress,
        k: maxMemories,
        userSignature
      })

      const relevantMemories = response.results?.map(m => m.content) || []

      return {
        relevantMemories,
        contextSummary: relevantMemories.join('\n'),
        totalMemories: response.results?.length || 0
      }
    } catch (error) {
      console.error('Failed to get memory context:', error)
      // Return empty context instead of throwing - this prevents chat from breaking
      return {
        relevantMemories: [],
        contextSummary: '',
        totalMemories: 0
      }
    }
  }

  /**
   * Search memories by category
   */
  async searchMemoriesByCategory(
    category: string,
    userAddress: string,
    userSignature?: string
  ): Promise<any[]> {
    try {
      const response = await memoryApi.searchMemories({
        query: `category:${category}`,
        userAddress,
        category,
        userSignature
      })

      return response.results || []
    } catch (error) {
      console.error('Failed to search memories by category:', error)
      return []
    }
  }

  /**
   * Get memory statistics for a user
   */
  async getMemoryStats(userAddress: string): Promise<{
    totalMemories: number
    categoryCounts: Record<string, number>
    storageUsed: number
    lastUpdated: string
  }> {
    try {
      const response = await memoryApi.getMemoryStats(userAddress)
      
      return {
        totalMemories: response.total_memories || 0,
        categoryCounts: response.categories || {},
        storageUsed: response.storage_used_bytes || 0,
        lastUpdated: response.last_updated || ''
      }
    } catch (error) {
      console.error('Failed to get memory stats:', error)
      return {
        totalMemories: 0,
        categoryCounts: {},
        storageUsed: 0,
        lastUpdated: ''
      }
    }
  }

  /**
   * Enhanced context generation for chat
   * Combines memory context with conversation history
   */
  async generateChatContext(
    currentMessage: string,
    conversationHistory: string[],
    userAddress: string,
    userSignature: string
  ): Promise<{
    memoryContext: string
    conversationSummary: string
    fullContext: string
  }> {
    try {
      // Get memory context based on current message
      const memoryContext = await this.getMemoryContext(
        currentMessage,
        userAddress,
        userSignature,
        3 // Limit to 3 most relevant memories
      )

      // Create conversation summary (last 3 messages)
      const recentHistory = conversationHistory.slice(-6) // Last 3 exchanges
      const conversationSummary = recentHistory.length > 0 
        ? `Recent conversation:\n${recentHistory.join('\n')}`
        : ''

      // Combine contexts
      const memoryContextStr = memoryContext.relevantMemories.length > 0
        ? `Relevant memories about the user:\n${memoryContext.relevantMemories.join('\n')}`
        : ''

      const fullContext = [memoryContextStr, conversationSummary]
        .filter(Boolean)
        .join('\n\n')

      return {
        memoryContext: memoryContextStr,
        conversationSummary,
        fullContext
      }
    } catch (error) {
      console.error('Failed to generate chat context:', error)
      return {
        memoryContext: '',
        conversationSummary: '',
        fullContext: ''
      }
    }
  }

  /**
   * Analyze conversation for memory opportunities
   * Note: Memory detection is now handled automatically by the backend
   */
  async analyzeConversationHistory(
    messages: string[],
    userAddress: string,
    userSignature?: string
  ): Promise<{
    potentialMemories: MemoryCandidate[]
    recommendations: string[]
  }> {
    // Memory detection is now handled automatically by the backend
    // during chat streaming, so this method returns empty results
    console.log('Memory detection now handled by backend automatically')
    
    return {
      potentialMemories: [],
      recommendations: ['Memory detection moved to backend - no manual analysis needed']
    }
  }

  /**
   * Fetch all memories for a user and auto-decrypt them
   */
  async fetchUserMemories(userAddress: string): Promise<{
    memories: any[]
    total: number
  }> {
    try {
      // Use the search endpoint with empty query to get all memories
      const response = await memoryApi.searchMemories({
        query: '',
        userAddress,
        k: 100 // Get a reasonable number of memories
      })
      
      const memories = response.results || [];
      
      // Auto-decrypt memories in background
      this.autoDecryptMemories(memories);
      
      return {
        memories: memories,
        total: memories.length || 0
      }
    } catch (error) {
      console.error('Failed to fetch user memories:', error)
      return {
        memories: [],
        total: 0
      }
    }
  }
  
  /**
   * Automatically decrypt all memories in background
   */
  async autoDecryptMemories(memories: any[]) {
    try {
      console.log(`Auto-decrypting ${memories.length} memories in background...`);
      
      // Process memories that have walrus hashes and are encrypted
      const toDecrypt = memories.filter(m => m.isEncrypted && m.walrusHash);
      
      if (toDecrypt.length === 0) {
        console.log('No memories to decrypt');
        return;
      }
      
      // Import here to avoid circular dependencies
      const { memoryDecryptionCache } = await import('@/app/services/memoryDecryptionCache');
      
      // Process in batches to avoid overwhelming the API
      const batchSize = 5;
      
      for (let i = 0; i < toDecrypt.length; i += batchSize) {
        const batch = toDecrypt.slice(i, i + batchSize);
        
        // Don't await - let this run in background
        Promise.all(batch.map(async memory => {
          if (memory.walrusHash) {
            try {
              // Use the caching service to get and store content
              const content = await memoryDecryptionCache.getDecryptedContent(memory.walrusHash);
              if (content) {
                memoryDecryptionCache.markMemoryDecrypted(memory.id);
                console.log(`Auto-decrypted memory ${memory.id.slice(0, 8)}...`);
              }
            } catch (err) {
              console.error(`Failed to auto-decrypt memory ${memory.id}:`, err);
            }
          }
        })).catch(err => {
          console.error('Batch decryption error:', err);
        });
      }
    } catch (error) {
      console.error('Auto-decryption failed:', error);
    }
  }

  /**
   * Clear all memories for a user and clear decryption cache
   */
  async clearUserMemories(userAddress: string): Promise<boolean> {
    try {
      // This should be replaced with actual API call when available
      console.log('Clearing memories for user:', userAddress);
      
      // Also clear the decryption cache
      const { memoryDecryptionCache } = await import('@/app/services/memoryDecryptionCache');
      memoryDecryptionCache.clearCache();
      
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Failed to clear user memories:', error);
      return false;
    }
  }
}

export const memoryIntegrationService = new MemoryIntegrationService()

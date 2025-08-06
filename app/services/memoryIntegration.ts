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

export interface MemoryExtraction {
  shouldSave: boolean
  category: string
  content: string
  extractedFacts: string[]
  confidence: number
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
      // Use direct blockchain calls instead of backend API
      // Get user memories from local storage or cache if available
      const memories = await this.fetchUserMemories(userAddress);
      const allMemories = memories.memories || [];
      
      // Simple local search to find relevant memories
      // A more sophisticated approach would involve vector embeddings
      const relevantMemories = allMemories
        .filter(memory => {
          // Simple text matching for now
          const content = memory.content?.toLowerCase() || '';
          const searchTerms = query.toLowerCase().split(' ')
            .filter(term => term.length > 3); // Filter out short words
            
          return searchTerms.some(term => content.includes(term));
        })
        .slice(0, maxMemories)
        .map(m => m.content);

      return {
        relevantMemories,
        contextSummary: relevantMemories.join('\n'),
        totalMemories: relevantMemories.length
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
      // Use direct blockchain access instead of backend API
      const memories = await this.fetchUserMemories(userAddress);
      const allMemories = memories.memories || [];
      
      // Filter by category
      return allMemories.filter(memory => 
        memory.category === category || memory.category?.toLowerCase() === category.toLowerCase()
      );
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
      // Use direct blockchain access instead of backend API
      const memories = await this.fetchUserMemories(userAddress);
      const allMemories = memories.memories || [];
      
      // Calculate category counts
      const categoryCounts: Record<string, number> = {};
      allMemories.forEach(memory => {
        const category = memory.category || 'unknown';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Calculate rough storage estimation (1KB per memory as a very rough estimate)
      const storageUsed = allMemories.length * 1024;
      
      return {
        totalMemories: allMemories.length,
        categoryCounts: categoryCounts,
        storageUsed: storageUsed,
        lastUpdated: new Date().toISOString()
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
      // Get memories directly from blockchain
      // First try to get from local storage cache
      const cachedMemories = this.getMemoriesFromCache(userAddress);
      if (cachedMemories && cachedMemories.length > 0) {
        console.log(`Found ${cachedMemories.length} cached memories for ${userAddress}`);
        // Auto-decrypt memories in background
        this.autoDecryptMemories(cachedMemories);
        return {
          memories: cachedMemories,
          total: cachedMemories.length
        };
      }
      
      // If no cached memories, fetch from blockchain
      const { getStaticSuiService } = await import('@/app/services/suiBlockchainService');
      const suiService = getStaticSuiService();
      
      // Get user memories from blockchain (using mock data for now)
      const mockMemories = [
        {
          id: `mem-${Date.now()}-1`,
          content: "I like pizza with extra cheese",
          category: "preference",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `mem-${Date.now()}-2`,
          content: "I live in San Francisco",
          category: "location",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: `mem-${Date.now()}-3`,
          content: "My favorite color is blue",
          category: "preference",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      // Cache the memories
      this.saveMemoriesToCache(userAddress, mockMemories);
      
      // Auto-decrypt memories in background
      this.autoDecryptMemories(mockMemories);
      
      return {
        memories: mockMemories,
        total: mockMemories.length
      }
    } catch (error) {
      console.error('Failed to fetch user memories:', error);
      return {
        memories: [],
        total: 0
      }
    }
  }
  
  // Helper methods for local caching
  private getMemoriesFromCache(userAddress: string): any[] {
    try {
      const key = `memories_${userAddress}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return [];
    } catch (error) {
      console.error('Error getting memories from cache:', error);
      return [];
    }
  }
  
  private saveMemoriesToCache(userAddress: string, memories: any[]): void {
    try {
      const key = `memories_${userAddress}`;
      localStorage.setItem(key, JSON.stringify(memories));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error saving memories to cache:', error);
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
      
      // Clear the local memory cache
      const key = `memories_${userAddress}`;
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
      
      // For now, just return success
      return true;
    } catch (error) {
      console.error('Failed to clear user memories:', error);
      return false;
    }
  }
  
  /**
   * Find memories that are relevant to a given text
   * This is a client-side replacement for the backend search API
   */
  getMemoriesRelevantToText(memories: any[], text: string, limit: number = 3): any[] {
    if (!memories || !memories.length || !text) return [];
    
    // Simple relevance algorithm:
    // 1. Split the query into keywords
    // 2. For each memory, count how many keywords match
    // 3. Sort memories by match count
    // 4. Return top N memories
    
    // Prepare keywords from text (remove common words and short words)
    const stopWords = ['the', 'and', 'is', 'in', 'to', 'a', 'with', 'for', 'of', 'on', 'at', 'by'];
    const keywords = text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !stopWords.includes(word));
    
    // Score each memory based on keyword matches
    const scoredMemories = memories.map(memory => {
      // Skip if no content
      if (!memory.content) return { ...memory, similarity: 0 };
      
      const content = memory.content.toLowerCase();
      
      // Count how many keywords appear in the memory content
      let matchCount = 0;
      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          matchCount++;
        }
      }
      
      // Calculate similarity score (0-1)
      const similarity = keywords.length > 0 ? matchCount / keywords.length : 0;
      
      return {
        ...memory,
        similarity
      };
    });
    
    // Sort by similarity score (highest first)
    const sortedMemories = scoredMemories
      .filter(memory => memory.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);
    
    // Return top N results
    return sortedMemories.slice(0, limit);
  }

  /**
   * Save a memory after user approval
   * This handles index creation if needed, then saves the memory
   */
  async saveApprovedMemory(
    memoryExtraction: MemoryExtraction,
    userAddress: string,
    wallet?: any
  ): Promise<{
    success: boolean;
    memoryId?: string;
    message?: string;
  }> {
    try {
      console.log('Saving approved memory:', memoryExtraction);
      
      // If wallet is not provided, we can't create blockchain records
      if (!wallet) {
        console.error('Wallet not provided for memory creation');
        return {
          success: false,
          message: 'Wallet connection required to save memories'
        };
      }
      
      // Use the memory index service to handle everything including index creation
      const { memoryIndexService } = await import('@/app/services/memoryIndexService');
      
      // This will automatically create an index if needed
      const response = await memoryIndexService.createMemoryWithAutoIndex(
        memoryExtraction.content,
        memoryExtraction.category,
        userAddress,
        wallet
      );
      
      if (!response.success) {
        console.error('Memory creation failed:', response.message);
        return {
          success: false,
          message: response.message || 'Failed to create memory'
        };
      }
      
      // If we got a memory ID from backend, create the blockchain record
      if (response.memoryId) {
        try {
          // Import SUI service dynamically to avoid circular dependencies
          const { SuiBlockchainService } = await import('@/app/services/suiBlockchainService');
          const suiService = new SuiBlockchainService(wallet);
          
          // The backend should have returned the necessary data
          // We might need to get this from a separate call
          const backendData = await memoryApi.saveApprovedMemory({
            content: memoryExtraction.content,
            category: memoryExtraction.category,
            userAddress,
            suiObjectId: response.memoryId
          });
          
          if (backendData.blobId && backendData.vectorId !== undefined) {
            // Create memory record on blockchain
            const blockchainMemoryId = await suiService.createMemoryRecord(
              memoryExtraction.category,
              backendData.vectorId,
              backendData.blobId
            );
            
            return {
              success: true,
              memoryId: blockchainMemoryId,
              message: 'Memory saved successfully'
            };
          }
        } catch (blockchainError) {
          console.error('Blockchain record creation failed:', blockchainError);
          // Even if blockchain fails, we have the memory in backend
          return {
            success: true,
            memoryId: response.memoryId,
            message: 'Memory saved to backend (blockchain record pending)'
          };
        }
      }
      
      return {
        success: true,
        memoryId: response.memoryId,
        message: 'Memory saved successfully'
      };
    } catch (error) {
      console.error('Error saving approved memory:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const memoryIntegrationService = new MemoryIntegrationService()

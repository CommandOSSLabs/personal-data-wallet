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
}

export const memoryIntegrationService = new MemoryIntegrationService()

// Memory Integration Service
// Handles the complete memory storage pipeline: detection → storage → retrieval

import { memoryDetectionService, type DetectionResult, type MemoryCandidate } from './memoryDetection'
import { memoryApi } from '@/app/api'

export interface MemoryContext {
  relevantMemories: string[]
  contextSummary: string
  totalMemories: number
}

class MemoryIntegrationService {
  /**
   * Process a user message for memory detection and storage
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
    const storedMemories: string[] = []
    const errors: string[] = []

    try {
      // Step 1: Detect potential memories
      const detectionResult = memoryDetectionService.analyzeMessage(message)
      
      console.log('Memory detection result:', detectionResult)

      // Step 2: Store memories if detected
      if (detectionResult.shouldStore && detectionResult.memories.length > 0) {
        for (const memory of detectionResult.memories) {
          try {
            const formattedMemory = memoryDetectionService.formatMemoryForStorage(
              memory, 
              userAddress
            )

            // Use the regular storage endpoint (secure endpoints don't exist yet)
            const response = await memoryApi.createMemory({
              content: formattedMemory.content,
              category: formattedMemory.category,
              userAddress: formattedMemory.userAddress,
              userSignature
            })

            if (response.success && response.embeddingId) {
              storedMemories.push(response.embeddingId)
              console.log(`Stored memory: ${response.embeddingId} in category: ${memory.category}`)
            }
          } catch (error) {
            console.error('Failed to store memory:', error)
            errors.push(`Failed to store ${memory.category} memory: ${error}`)
          }
        }
      }

      return {
        detectionResult,
        storedMemories,
        errors
      }
    } catch (error) {
      console.error('Memory processing error:', error)
      return {
        detectionResult: {
          shouldStore: false,
          memories: [],
          reasoning: 'Error during memory detection'
        },
        storedMemories: [],
        errors: [`Memory processing failed: ${error}`]
      }
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
   * This can be called periodically to find missed memories
   */
  async analyzeConversationHistory(
    messages: string[],
    userAddress: string,
    userSignature?: string
  ): Promise<{
    potentialMemories: MemoryCandidate[]
    recommendations: string[]
  }> {
    const potentialMemories: MemoryCandidate[] = []
    const recommendations: string[] = []

    try {
      for (const message of messages) {
        const result = memoryDetectionService.analyzeMessage(message)
        if (result.shouldStore) {
          potentialMemories.push(...result.memories)
        }
      }

      // Generate recommendations
      if (potentialMemories.length > 0) {
        const categories = [...new Set(potentialMemories.map(m => m.category))]
        recommendations.push(
          `Found ${potentialMemories.length} potential memories in categories: ${categories.join(', ')}`
        )
        recommendations.push(
          'Consider reviewing and storing these memories for better personalization.'
        )
      }

      return {
        potentialMemories,
        recommendations
      }
    } catch (error) {
      console.error('Failed to analyze conversation history:', error)
      return {
        potentialMemories: [],
        recommendations: ['Error analyzing conversation history']
      }
    }
  }
}

export const memoryIntegrationService = new MemoryIntegrationService()

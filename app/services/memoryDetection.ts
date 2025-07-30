// Memory Detection Service
// Analyzes user messages to identify personal information worth storing

export interface MemoryCandidate {
  content: string
  category: 'personal' | 'preferences' | 'facts' | 'goals' | 'relationships' | 'other'
  confidence: number // 0-1 score
  extractedInfo: {
    key: string
    value: string
  }[]
}

export interface DetectionResult {
  shouldStore: boolean
  memories: MemoryCandidate[]
  reasoning: string
}

class MemoryDetectionService {
  // Keywords and patterns for different memory categories
  private readonly patterns = {
    personal: {
      keywords: ['my name is', 'i am', 'i\'m', 'i live in', 'i work at', 'i study', 'my age', 'i was born'],
      patterns: [
        /my name is (\w+)/i,
        /i am (\d+) years old/i,
        /i live in ([^,.]+)/i,
        /i work at ([^,.]+)/i,
        /i study ([^,.]+)/i,
        /i was born in (\d{4})/i
      ]
    },
    preferences: {
      keywords: ['i like', 'i love', 'i hate', 'i prefer', 'my favorite', 'i enjoy', 'i dislike'],
      patterns: [
        /i like ([^,.]+)/i,
        /i love ([^,.]+)/i,
        /my favorite ([^,.]+) is ([^,.]+)/i,
        /i prefer ([^,.]+)/i,
        /i enjoy ([^,.]+)/i
      ]
    },
    goals: {
      keywords: ['i want to', 'my goal', 'i plan to', 'i hope to', 'i aim to', 'i intend to'],
      patterns: [
        /i want to ([^,.]+)/i,
        /my goal is to ([^,.]+)/i,
        /i plan to ([^,.]+)/i,
        /i hope to ([^,.]+)/i
      ]
    },
    relationships: {
      keywords: ['my wife', 'my husband', 'my partner', 'my friend', 'my family', 'my children', 'my parents'],
      patterns: [
        /my (wife|husband|partner) is ([^,.]+)/i,
        /my (friend|colleague) ([^,.]+)/i,
        /i have (\d+) (children|kids)/i
      ]
    },
    facts: {
      keywords: ['remember that', 'important to note', 'keep in mind', 'don\'t forget'],
      patterns: [
        /remember that ([^,.]+)/i,
        /important to note ([^,.]+)/i,
        /keep in mind ([^,.]+)/i
      ]
    }
  }

  /**
   * Analyze a message to detect potential memories
   */
  analyzeMessage(message: string): DetectionResult {
    const memories: MemoryCandidate[] = []
    const lowerMessage = message.toLowerCase()
    
    // Check each category
    for (const [category, config] of Object.entries(this.patterns)) {
      const categoryMemories = this.detectCategoryMemories(message, lowerMessage, category as any, config)
      memories.push(...categoryMemories)
    }

    // Determine if we should store any memories
    const shouldStore = memories.length > 0 && memories.some(m => m.confidence > 0.6)
    
    const reasoning = this.generateReasoning(memories, shouldStore)

    return {
      shouldStore,
      memories: memories.filter(m => m.confidence > 0.5), // Only return high-confidence memories
      reasoning
    }
  }

  private detectCategoryMemories(
    originalMessage: string, 
    lowerMessage: string, 
    category: keyof typeof this.patterns,
    config: { keywords: string[], patterns: RegExp[] }
  ): MemoryCandidate[] {
    const memories: MemoryCandidate[] = []

    // Check keyword matches
    const keywordMatches = config.keywords.filter(keyword => lowerMessage.includes(keyword))
    
    if (keywordMatches.length > 0) {
      // Try pattern matching for structured extraction
      const extractedInfo: { key: string, value: string }[] = []
      
      for (const pattern of config.patterns) {
        const match = originalMessage.match(pattern)
        if (match) {
          extractedInfo.push({
            key: this.getKeyFromPattern(pattern, category),
            value: match[1] || match[0]
          })
        }
      }

      // Calculate confidence based on keyword matches and pattern matches
      const confidence = Math.min(
        0.3 + (keywordMatches.length * 0.2) + (extractedInfo.length * 0.3),
        1.0
      )

      if (confidence > 0.5) {
        memories.push({
          content: originalMessage,
          category,
          confidence,
          extractedInfo
        })
      }
    }

    return memories
  }

  private getKeyFromPattern(pattern: RegExp, category: string): string {
    const patternStr = pattern.toString()
    
    if (patternStr.includes('name')) return 'name'
    if (patternStr.includes('age')) return 'age'
    if (patternStr.includes('live')) return 'location'
    if (patternStr.includes('work')) return 'occupation'
    if (patternStr.includes('study')) return 'education'
    if (patternStr.includes('born')) return 'birth_year'
    if (patternStr.includes('favorite')) return 'favorite'
    if (patternStr.includes('goal')) return 'goal'
    if (patternStr.includes('want')) return 'desire'
    if (patternStr.includes('wife|husband|partner')) return 'relationship'
    
    return category
  }

  private generateReasoning(memories: MemoryCandidate[], shouldStore: boolean): string {
    if (!shouldStore) {
      return "No significant personal information detected that warrants storage."
    }

    const categories = [...new Set(memories.map(m => m.category))]
    const highConfidence = memories.filter(m => m.confidence > 0.8).length
    
    return `Detected ${memories.length} potential memories across ${categories.length} categories (${categories.join(', ')}). ${highConfidence} high-confidence matches found.`
  }

  /**
   * Format memory for storage
   */
  formatMemoryForStorage(memory: MemoryCandidate, userAddress: string): {
    content: string
    category: string
    userAddress: string
    metadata: any
  } {
    return {
      content: memory.content,
      category: memory.category,
      userAddress,
      metadata: {
        confidence: memory.confidence,
        extractedInfo: memory.extractedInfo,
        detectedAt: new Date().toISOString()
      }
    }
  }
}

export const memoryDetectionService = new MemoryDetectionService()

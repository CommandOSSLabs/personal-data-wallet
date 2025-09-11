/**
 * Timelock Service - Frontend Time-locked Encryption Operations
 * 
 * This service provides client-side time-lock encryption and decryption functionality.
 */

// Types for time-lock operations
export interface TimelockEncryptRequest {
  content: string
  unlockTime: string // ISO string
  userAddress: string
}

export interface TimelockDecryptRequest {
  encryptedData: string // Base64 encoded
  userAddress: string
}

export interface TimelockEncryptResponse {
  success: boolean
  encryptedData: string
  identityId: string
  unlockTime: number
  unlockTimeISO: string
}

export interface TimelockDecryptResponse {
  success: boolean
  content: string
  decryptedAt: string
}

export interface TimelockStatus {
  canDecrypt: boolean
  unlockTime?: number
  unlockTimeISO?: string
  timeRemaining?: number
}

export interface TimelockMemory {
  id: string
  name: string
  description: string
  encryptedData: string
  unlockTime: number
  unlockTimeISO: string
  canDecrypt: boolean
  timeRemaining?: number
  createdAt: string
}

class TimelockService {
  private readonly baseUrl = '/api/seal/timelock'

  /**
   * Encrypt content with time-lock
   */
  async encryptWithTimelock(request: TimelockEncryptRequest): Promise<TimelockEncryptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/encrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to encrypt with time-lock:', error)
      throw error
    }
  }

  /**
   * Decrypt time-locked content
   */
  async decryptTimelock(request: TimelockDecryptRequest): Promise<TimelockDecryptResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/decrypt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to decrypt time-locked content:', error)
      throw error
    }
  }

  /**
   * Check time-lock status
   */
  async checkTimelockStatus(encryptedData: string): Promise<TimelockStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ encryptedData }),
      })

      if (!response.ok) {
        console.warn('Failed to check time-lock status')
        return { canDecrypt: false }
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to check time-lock status:', error)
      return { canDecrypt: false }
    }
  }

  /**
   * Create a time-locked memory with metadata
   */
  async createTimelockMemory(
    name: string,
    description: string,
    content: string,
    unlockTime: Date,
    userAddress: string
  ): Promise<TimelockMemory> {
    try {
      // Encrypt the content
      const encryptResult = await this.encryptWithTimelock({
        content,
        unlockTime: unlockTime.toISOString(),
        userAddress,
      })

      // Check initial status
      const status = await this.checkTimelockStatus(encryptResult.encryptedData)

      const memory: TimelockMemory = {
        id: `timelock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        description,
        encryptedData: encryptResult.encryptedData,
        unlockTime: encryptResult.unlockTime,
        unlockTimeISO: encryptResult.unlockTimeISO,
        canDecrypt: status.canDecrypt,
        timeRemaining: status.timeRemaining,
        createdAt: new Date().toISOString(),
      }

      // Store in localStorage for demo purposes
      // In a real app, this would be stored in a database or on-chain
      this.saveTimelockMemory(memory)

      return memory
    } catch (error) {
      console.error('Failed to create time-lock memory:', error)
      throw error
    }
  }

  /**
   * Get all time-locked memories for a user
   */
  getTimelockMemories(userAddress: string): TimelockMemory[] {
    try {
      const stored = localStorage.getItem(`timelock_memories_${userAddress}`)
      if (!stored) return []

      const memories: TimelockMemory[] = JSON.parse(stored)
      
      // Update status for each memory
      return memories.map(memory => ({
        ...memory,
        canDecrypt: Date.now() >= memory.unlockTime,
        timeRemaining: Math.max(0, memory.unlockTime - Date.now()),
      }))
    } catch (error) {
      console.error('Failed to get time-lock memories:', error)
      return []
    }
  }

  /**
   * Save time-locked memory to localStorage
   */
  private saveTimelockMemory(memory: TimelockMemory): void {
    try {
      const userAddress = memory.id.split('_')[0] // Extract from ID for demo
      const existing = this.getTimelockMemories(userAddress)
      const updated = [...existing, memory]
      
      localStorage.setItem(
        `timelock_memories_${userAddress}`,
        JSON.stringify(updated)
      )
    } catch (error) {
      console.error('Failed to save time-lock memory:', error)
    }
  }

  /**
   * Delete a time-locked memory
   */
  deleteTimelockMemory(memoryId: string, userAddress: string): void {
    try {
      const existing = this.getTimelockMemories(userAddress)
      const updated = existing.filter(memory => memory.id !== memoryId)
      
      localStorage.setItem(
        `timelock_memories_${userAddress}`,
        JSON.stringify(updated)
      )
    } catch (error) {
      console.error('Failed to delete time-lock memory:', error)
    }
  }

  /**
   * Format time remaining as human-readable string
   */
  formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return 'Unlocked'

    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  /**
   * Get suggested unlock times
   */
  getSuggestedUnlockTimes(): Array<{ label: string; value: Date }> {
    const now = new Date()
    
    return [
      {
        label: '1 hour from now',
        value: new Date(now.getTime() + 60 * 60 * 1000)
      },
      {
        label: '1 day from now',
        value: new Date(now.getTime() + 24 * 60 * 60 * 1000)
      },
      {
        label: '1 week from now',
        value: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        label: '1 month from now',
        value: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        label: '1 year from now',
        value: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      }
    ]
  }
}

// Export singleton instance
export const timelockService = new TimelockService()
export default timelockService

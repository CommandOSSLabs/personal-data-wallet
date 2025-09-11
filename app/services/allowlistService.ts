/**
 * Allowlist Service - Frontend Allowlist Management Operations
 * 
 * This service provides client-side allowlist management functionality.
 */

// Types for allowlist operations
export interface CreateAllowlistRequest {
  name: string
  description?: string
  addresses: string[]
  userAddress: string
}

export interface UpdateAllowlistRequest {
  name?: string
  description?: string
  addresses?: string[]
  userAddress: string
}

export interface AllowlistAccessRequest {
  allowlistId: string
  content: string
  userAddress: string
}

export interface AllowlistDecryptRequest {
  encryptedData: string
  userAddress: string
}

export interface AllowlistPolicy {
  id: string
  name: string
  description?: string
  addresses: string[]
  owner: string
  createdAt: string
  updatedAt: string
  isActive: boolean
  memoryCount: number
}

export interface AllowlistEncryptResponse {
  success: boolean
  encryptedData: string
  identityId: string
  allowlistId: string
}

export interface AllowlistDecryptResponse {
  success: boolean
  content: string
  decryptedAt: string
}

export interface AllowlistAccessCheck {
  canAccess: boolean
  isOwner: boolean
  isInAllowlist: boolean
  allowlistActive: boolean
}

class AllowlistService {
  private readonly baseUrl = '/api/seal/allowlist'

  /**
   * Create a new allowlist policy
   */
  async createAllowlist(request: CreateAllowlistRequest): Promise<AllowlistPolicy> {
    try {
      const response = await fetch(this.baseUrl, {
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
      console.error('Failed to create allowlist:', error)
      throw error
    }
  }

  /**
   * Get all allowlists for a user
   */
  async getUserAllowlists(userAddress: string): Promise<AllowlistPolicy[]> {
    try {
      const response = await fetch(`${this.baseUrl}/${userAddress}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get user allowlists:', error)
      throw error
    }
  }

  /**
   * Update an allowlist
   */
  async updateAllowlist(allowlistId: string, request: UpdateAllowlistRequest): Promise<AllowlistPolicy> {
    try {
      const response = await fetch(`${this.baseUrl}/${allowlistId}/update`, {
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
      console.error('Failed to update allowlist:', error)
      throw error
    }
  }

  /**
   * Toggle allowlist active status
   */
  async toggleAllowlist(allowlistId: string, userAddress: string): Promise<AllowlistPolicy> {
    try {
      const response = await fetch(`${this.baseUrl}/${allowlistId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to toggle allowlist:', error)
      throw error
    }
  }

  /**
   * Delete an allowlist
   */
  async deleteAllowlist(allowlistId: string, userAddress: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${allowlistId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to delete allowlist:', error)
      throw error
    }
  }

  /**
   * Encrypt content with allowlist access control
   */
  async encryptWithAllowlist(request: AllowlistAccessRequest): Promise<AllowlistEncryptResponse> {
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
      console.error('Failed to encrypt with allowlist:', error)
      throw error
    }
  }

  /**
   * Decrypt allowlist-protected content
   */
  async decryptAllowlist(request: AllowlistDecryptRequest): Promise<AllowlistDecryptResponse> {
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
      console.error('Failed to decrypt allowlist content:', error)
      throw error
    }
  }

  /**
   * Check if user can access allowlist
   */
  async checkAllowlistAccess(allowlistId: string, userAddress: string): Promise<AllowlistAccessCheck> {
    try {
      const response = await fetch(`${this.baseUrl}/${allowlistId}/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userAddress }),
      })

      if (!response.ok) {
        console.warn('Failed to check allowlist access')
        return {
          canAccess: false,
          isOwner: false,
          isInAllowlist: false,
          allowlistActive: false,
        }
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to check allowlist access:', error)
      return {
        canAccess: false,
        isOwner: false,
        isInAllowlist: false,
        allowlistActive: false,
      }
    }
  }

  /**
   * Validate Sui address format
   */
  validateSuiAddress(address: string): boolean {
    return address.startsWith('0x') && address.length === 66
  }

  /**
   * Validate multiple Sui addresses
   */
  validateSuiAddresses(addresses: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []

    addresses.forEach(address => {
      if (this.validateSuiAddress(address)) {
        valid.push(address)
      } else {
        invalid.push(address)
      }
    })

    return { valid, invalid }
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 8)}...${address.slice(-6)}`
  }

  /**
   * Get allowlist status badge info
   */
  getStatusBadge(allowlist: AllowlistPolicy): { color: string; label: string } {
    if (!allowlist.isActive) {
      return { color: 'gray', label: 'Inactive' }
    }
    
    if (allowlist.memoryCount === 0) {
      return { color: 'blue', label: 'Ready' }
    }
    
    return { color: 'green', label: 'Active' }
  }

  /**
   * Get suggested allowlist names
   */
  getSuggestedNames(): string[] {
    return [
      'Family Members',
      'Work Team',
      'Close Friends',
      'Project Collaborators',
      'Trusted Contacts',
      'Emergency Access',
      'Shared Documents',
      'Group Chat Members'
    ]
  }
}

// Export singleton instance
export const allowlistService = new AllowlistService()
export default allowlistService

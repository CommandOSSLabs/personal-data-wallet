'use client'

/**
 * Walrus Cache Service
 * Provides caching for Walrus content to reduce API calls and improve performance
 */

interface CacheEntry {
  content: string | ArrayBuffer
  timestamp: number
  isHit?: boolean
}

class WalrusCache {
  private cache: Map<string, CacheEntry> = new Map()
  private ttl: number = 30 * 60 * 1000 // 30 minutes default TTL
  private maxSize: number = 100 // Maximum number of entries
  private hits: number = 0
  private misses: number = 0
  
  constructor(ttlMs?: number, maxSize?: number) {
    if (typeof window !== 'undefined') {
      // Only load in browser environment
      this.loadFromLocalStorage()
    }
    
    if (ttlMs) this.ttl = ttlMs
    if (maxSize) this.maxSize = maxSize
  }
  
  /**
   * Get content from cache
   * @param blobId The Walrus blob ID
   * @returns The cached content or null if not found/expired
   */
  get(blobId: string): string | ArrayBuffer | null {
    const entry = this.cache.get(blobId)
    
    if (!entry) {
      this.misses++
      return null
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(blobId)
      this.misses++
      return null
    }
    
    // Track cache hit
    this.hits++
    entry.isHit = true
    
    return entry.content
  }
  
  /**
   * Store content in cache
   * @param blobId The Walrus blob ID
   * @param content The content to cache
   */
  set(blobId: string, content: string | ArrayBuffer): void {
    // Enforce cache size limits
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }
    
    this.cache.set(blobId, {
      content,
      timestamp: Date.now()
    })
    
    // Save to localStorage if in browser
    if (typeof window !== 'undefined') {
      this.saveToLocalStorage()
    }
  }
  
  /**
   * Remove content from cache
   * @param blobId The Walrus blob ID
   */
  invalidate(blobId: string): void {
    this.cache.delete(blobId)
    
    // Update localStorage if in browser
    if (typeof window !== 'undefined') {
      this.saveToLocalStorage()
    }
  }
  
  /**
   * Clear the entire cache
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
    
    // Clear localStorage if in browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem('walrus_cache_metadata')
      
      // Remove all walrus cache items
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('walrus_cache_')) {
          keysToRemove.push(key)
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key))
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number, hits: number, misses: number, hitRatio: number } {
    const totalRequests = this.hits + this.misses
    const hitRatio = totalRequests === 0 ? 0 : this.hits / totalRequests
    
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRatio
    }
  }
  
  /**
   * Evict the oldest entry from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTimestamp = Infinity
    
    // Use Array.from to convert iterator to array
    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    })
    
    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
  
  /**
   * Save cache metadata to localStorage
   * Note: We only save metadata and small content items
   * to avoid localStorage quota issues
   */
  private saveToLocalStorage(): void {
    try {
      // Save metadata
      const metadata = {
        lastUpdated: Date.now(),
        size: this.cache.size,
        hits: this.hits,
        misses: this.misses
      }
      
      localStorage.setItem('walrus_cache_metadata', JSON.stringify(metadata))
      
      // Save cache entries (only string content, not binary)
      const maxStorageItemSize = 100 * 1024 // 100KB max per item
      
      // Use Array.from to convert iterator to array
      Array.from(this.cache.entries()).forEach(([key, entry]) => {
        if (typeof entry.content === 'string' && entry.content.length < maxStorageItemSize) {
          localStorage.setItem(`walrus_cache_${key}`, JSON.stringify({
            content: entry.content,
            timestamp: entry.timestamp
          }))
        }
      })
    } catch (error) {
      console.warn('Failed to save Walrus cache to localStorage:', error)
      // Continue silently - this is just an optimization
    }
  }
  
  /**
   * Load cache from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      // Load metadata
      const metadataStr = localStorage.getItem('walrus_cache_metadata')
      if (metadataStr) {
        const metadata = JSON.parse(metadataStr)
        this.hits = metadata.hits || 0
        this.misses = metadata.misses || 0
      }
      
      // Load cache entries
      const keysToLoad: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('walrus_cache_')) {
          keysToLoad.push(key)
        }
      }
      
      // Load cache entries (up to maxSize)
      for (let i = 0; i < Math.min(keysToLoad.length, this.maxSize); i++) {
        const key = keysToLoad[i]
        const blobId = key.replace('walrus_cache_', '')
        const entryStr = localStorage.getItem(key)
        
        if (entryStr) {
          try {
            const entry = JSON.parse(entryStr)
            
            // Check if not expired
            if (Date.now() - entry.timestamp <= this.ttl) {
              this.cache.set(blobId, {
                content: entry.content,
                timestamp: entry.timestamp
              })
            } else {
              // Remove expired item
              localStorage.removeItem(key)
            }
          } catch (error) {
            // Skip invalid entries
            localStorage.removeItem(key)
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load Walrus cache from localStorage:', error)
      // Continue silently - this is not critical
    }
  }
}

// Export singleton instance
export const walrusCache = new WalrusCache()
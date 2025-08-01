/**
 * Memory Decryption Cache Service
 * 
 * This service provides caching for decrypted memory content to avoid
 * repeated API calls for the same content across the application.
 */

class MemoryDecryptionCacheService {
  // In-memory cache of decrypted content keyed by walrus hash
  private decryptedContentCache: Map<string, string> = new Map();
  
  // Track which memories have been successfully decrypted 
  private decryptedMemoryIds: Set<string> = new Set();
  
  /**
   * Check if a memory has been decrypted by its ID
   */
  async isMemoryDecrypted(memoryId: string): Promise<boolean> {
    return this.decryptedMemoryIds.has(memoryId);
  }
  
  /**
   * Get content from cache if available, otherwise fetch and cache it
   */
  async getDecryptedContent(walrusHash: string): Promise<string | null> {
    try {
      // Return from cache if available
      if (this.decryptedContentCache.has(walrusHash)) {
        console.log(`Cache hit for memory: ${walrusHash.substring(0, 8)}...`);
        return this.decryptedContentCache.get(walrusHash) || null;
      }
      
      console.log(`Cache miss for memory: ${walrusHash.substring(0, 8)}..., fetching`);
      
      // Fetch from API if not in cache
      const response = await fetch(`/api/memory/content/${walrusHash}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch memory content: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.content) {
        // Store in cache
        this.decryptedContentCache.set(walrusHash, data.content);
        return data.content;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting decrypted content:', error);
      return null;
    }
  }
  
  /**
   * Mark a memory as decrypted by its ID
   */
  markMemoryDecrypted(memoryId: string): void {
    this.decryptedMemoryIds.add(memoryId);
  }
  
  /**
   * Check if a memory has been decrypted by its ID
   */
  isMemoryDecrypted(memoryId: string): boolean {
    return this.decryptedMemoryIds.has(memoryId);
  }
  
  /**
   * Pre-fetch and decrypt a batch of memories
   */
  async batchDecrypt(memories: Array<{id: string, walrusHash?: string}>): Promise<void> {
    const toDecrypt = memories.filter(m => m.walrusHash && !this.decryptedContentCache.has(m.walrusHash));
    
    if (toDecrypt.length === 0) return;
    
    console.log(`Batch decrypting ${toDecrypt.length} memories`);
    
    // Process in small batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < toDecrypt.length; i += batchSize) {
      const batch = toDecrypt.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async memory => {
          if (memory.walrusHash) {
            try {
              const content = await this.getDecryptedContent(memory.walrusHash);
              if (content) {
                this.markMemoryDecrypted(memory.id);
              }
            } catch (err) {
              console.error(`Failed to decrypt memory ${memory.id}:`, err);
            }
          }
        })
      );
    }
  }
  
  /**
   * Clear the cache
   */
  clearCache(): void {
    this.decryptedContentCache.clear();
    this.decryptedMemoryIds.clear();
  }
}

// Export singleton instance
export const memoryDecryptionCache = new MemoryDecryptionCacheService();
// Use Web Crypto API for both browser and Node.js environments
const crypto = (() => {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  } else if (typeof global !== 'undefined' && global.crypto) {
    return global.crypto;
  } else {
    try {
      return require('crypto').webcrypto || require('crypto');
    } catch (e) {
      throw new Error('No crypto implementation available');
    }
  }
})();
import {
  PDWConfig,
  StorageOptions,
  StorageResult,
  RetrieveOptions,
  RetrieveResult,
  StorageMetadata,
  StorageStats,
  WalrusConfig,
  CacheEntry,
  StorageFilter,
} from '../types';

/**
 * StorageService handles Walrus decentralized storage operations with
 * caching, encryption, compression, and local fallback capabilities.
 */
export class StorageService {
  private cache: Map<string, CacheEntry> = new Map();
  private walrusConfig: WalrusConfig;
  private stats: StorageStats = {
    totalItems: 0,
    totalSize: 0,
    cacheSize: 0,
    cacheHitRate: 0,
    averageStorageTime: 0,
    averageRetrievalTime: 0,
  };

  constructor(private config: PDWConfig) {
    this.walrusConfig = {
      publisherUrl: config.walrusPublisherUrl || 'https://publisher.walrus.space',
      aggregatorUrl: config.walrusAggregatorUrl || 'https://aggregator.walrus.space',
      maxFileSize: config.walrusMaxFileSize || 1024 * 1024 * 1024, // 1GB
      timeout: config.walrusTimeout || 30000, // 30s
    };
  }

  /**
   * Upload content to Walrus storage with optional encryption and compression
   */
  async upload(
    content: Uint8Array | string, 
    options: StorageOptions = {}
  ): Promise<StorageResult> {
    const startTime = Date.now();
    
    try {
      // Convert string to Uint8Array if needed
      let processedContent = typeof content === 'string' 
        ? new TextEncoder().encode(content) 
        : content;

      // Apply compression if requested
      if (options.compress && options.compress !== 'none') {
        processedContent = await this.compressContent(processedContent, options.compress);
      }

      // Apply encryption if requested
      if (options.encrypt) {
        processedContent = await this.encryptContent(processedContent);
      }

      // Check file size limits
      if (processedContent.length > this.walrusConfig.maxFileSize!) {
        throw new Error(`Content size (${processedContent.length}) exceeds Walrus limit (${this.walrusConfig.maxFileSize})`);
      }

      // Upload to Walrus
      const blobId = await this.uploadToWalrus(processedContent);
      
      // Create metadata
      const metadata: StorageMetadata = {
        contentType: this.detectContentType(content),
        size: processedContent.length,
        tags: options.tags || {},
        createdAt: new Date().toISOString(),
        encrypted: options.encrypt || false,
        compressionType: (options.compress as 'gzip' | 'none') || 'none',
        checksumSha256: await this.calculateSha256(processedContent),
      };

      // Cache if requested
      if (options.cacheLocally) {
        this.addToCache(blobId, processedContent, metadata, options.cacheExpiry);
      }

      const processingTime = Date.now() - startTime;
      this.updateStorageStats(processedContent.length, processingTime);

      return {
        blobId,
        walrusUrl: `${this.walrusConfig.aggregatorUrl}/v1/${blobId}`,
        metadata,
        cached: options.cacheLocally || false,
        processingTimeMs: processingTime,
      };
    } catch (error) {
      console.error('Storage upload failed:', error);
      throw new Error(`Failed to upload to storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieve content from Walrus storage with caching support
   */
  async retrieve(
    blobId: string, 
    options: RetrieveOptions = {}
  ): Promise<RetrieveResult> {
    const startTime = Date.now();

    try {
      // Check cache first if enabled
      if (options.useCache !== false) {
        const cached = this.getFromCache(blobId, options.maxCacheAge);
        if (cached) {
          const retrievalTime = Date.now() - startTime;
          this.updateRetrievalStats(retrievalTime, true);
          
          return {
            content: cached.content,
            metadata: cached.metadata,
            fromCache: true,
            retrievalTimeMs: retrievalTime,
          };
        }
      }

      // Retrieve from Walrus
      const content = await this.retrieveFromWalrus(blobId);
      
      // We need metadata to properly decrypt/decompress
      // In a real implementation, metadata would be stored separately or embedded
      const metadata: StorageMetadata = {
        contentType: 'application/octet-stream', // Default, should be stored separately
        size: content.length,
        tags: {},
        createdAt: new Date().toISOString(),
        encrypted: false, // Would be determined from stored metadata
        compressionType: 'none', // Would be determined from stored metadata
        checksumSha256: await this.calculateSha256(content),
      };

      let processedContent = content;

      // Apply decompression if needed
      if (options.decompress !== false && metadata.compressionType !== 'none') {
        if (metadata.compressionType === 'gzip') {
          processedContent = await this.decompressContent(processedContent, metadata.compressionType);
        }
      }

      // Apply decryption if needed
      if (options.decrypt !== false && metadata.encrypted) {
        processedContent = await this.decryptContent(processedContent);
      }

      // Update cache
      if (options.useCache !== false) {
        this.addToCache(blobId, processedContent, metadata);
      }

      const retrievalTime = Date.now() - startTime;
      this.updateRetrievalStats(retrievalTime, false);

      return {
        content: processedContent,
        metadata,
        fromCache: false,
        retrievalTimeMs: retrievalTime,
      };
    } catch (error) {
      console.error('Storage retrieval failed:', error);
      throw new Error(`Failed to retrieve from storage: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Delete content from cache and Walrus (if supported)
   */
  async delete(blobId: string): Promise<boolean> {
    try {
      // Remove from cache
      this.cache.delete(blobId);

      // Note: Walrus doesn't support deletion in the current version
      // This would be a no-op or might involve marking as deleted in metadata
      console.warn('Walrus does not support deletion. Content remains accessible.');
      
      return true;
    } catch (error) {
      console.error('Storage deletion failed:', error);
      return false;
    }
  }

  /**
   * List stored items (from cache and metadata store)
   */
  async list(filter?: StorageFilter): Promise<Array<{ blobId: string; metadata: StorageMetadata }>> {
    // This would typically query a metadata database
    // For now, return cached items
    const items: Array<{ blobId: string; metadata: StorageMetadata }> = [];
    
    for (const [blobId, entry] of this.cache.entries()) {
      if (this.matchesFilter(entry.metadata, filter)) {
        items.push({ blobId, metadata: entry.metadata });
      }
    }

    return items;
  }

  /**
   * Get storage statistics
   */
  getStats(): StorageStats {
    this.stats.cacheSize = this.calculateCacheSize();
    return { ...this.stats };
  }

  /**
   * Clear cache with optional filter
   */
  clearCache(filter?: StorageFilter): number {
    let cleared = 0;
    
    if (!filter) {
      cleared = this.cache.size;
      this.cache.clear();
    } else {
      for (const [blobId, entry] of this.cache.entries()) {
        if (this.matchesFilter(entry.metadata, filter)) {
          this.cache.delete(blobId);
          cleared++;
        }
      }
    }

    return cleared;
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupCache(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [blobId, entry] of this.cache.entries()) {
      // Remove entries older than 24 hours by default
      if (now - entry.cachedAt > 24 * 60 * 60 * 1000) {
        this.cache.delete(blobId);
        cleaned++;
      }
    }

    return cleaned;
  }

  // ==================== PRIVATE METHODS ====================

  private async uploadToWalrus(content: Uint8Array): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.walrusConfig.timeout);

    try {
      const response = await fetch(`${this.walrusConfig.publisherUrl}/v1/store`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
        },
        body: new Uint8Array(content),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Walrus upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.blobId || result.blob_id || result.id;
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private async retrieveFromWalrus(blobId: string): Promise<Uint8Array> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.walrusConfig.timeout);

    try {
      const response = await fetch(`${this.walrusConfig.aggregatorUrl}/v1/${blobId}`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`Walrus retrieval failed: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  private async compressContent(content: Uint8Array, type: 'gzip'): Promise<Uint8Array> {
    // Note: In a browser environment, you'd use CompressionStream
    // In Node.js, you'd use zlib
    if (typeof window !== 'undefined') {
      // Browser environment
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(content.slice());
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    } else {
      // Node.js environment - would use zlib
      throw new Error('Compression not implemented for Node.js environment');
    }
  }

  private async decompressContent(content: Uint8Array, type: 'gzip'): Promise<Uint8Array> {
    if (typeof window !== 'undefined') {
      // Browser environment
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(content.slice());
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    } else {
      throw new Error('Decompression not implemented for Node.js environment');
    }
  }

  private async encryptContent(content: Uint8Array): Promise<Uint8Array> {
    // Placeholder for encryption - would integrate with EncryptionService
    console.warn('Encryption not yet implemented, returning content as-is');
    return content;
  }

  private async decryptContent(content: Uint8Array): Promise<Uint8Array> {
    // Placeholder for decryption - would integrate with EncryptionService
    console.warn('Decryption not yet implemented, returning content as-is');
    return content;
  }

  private detectContentType(content: Uint8Array | string): string {
    if (typeof content === 'string') {
      return 'text/plain';
    }

    // Basic content type detection based on headers
    if (content.length >= 4) {
      // PNG
      if (content[0] === 0x89 && content[1] === 0x50 && content[2] === 0x4E && content[3] === 0x47) {
        return 'image/png';
      }
      // JPEG
      if (content[0] === 0xFF && content[1] === 0xD8) {
        return 'image/jpeg';
      }
      // PDF
      if (content[0] === 0x25 && content[1] === 0x50 && content[2] === 0x44 && content[3] === 0x46) {
        return 'application/pdf';
      }
    }

    return 'application/octet-stream';
  }

  private addToCache(
    blobId: string, 
    content: Uint8Array | string, 
    metadata: StorageMetadata, 
    expiry?: number
  ): void {
    const now = Date.now();
    
    this.cache.set(blobId, {
      content,
      metadata,
      cachedAt: now,
      accessCount: 1,
      lastAccessed: now,
    });
  }

  private getFromCache(blobId: string, maxAge?: number): CacheEntry | null {
    const entry = this.cache.get(blobId);
    if (!entry) return null;

    const now = Date.now();
    
    // Check age
    if (maxAge && (now - entry.cachedAt) > maxAge) {
      this.cache.delete(blobId);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry;
  }

  private matchesFilter(metadata: StorageMetadata, filter?: StorageFilter): boolean {
    if (!filter) return true;

    if (filter.contentType && metadata.contentType !== filter.contentType) {
      return false;
    }

    if (filter.encrypted !== undefined && metadata.encrypted !== filter.encrypted) {
      return false;
    }

    if (filter.minSize && metadata.size < filter.minSize) {
      return false;
    }

    if (filter.maxSize && metadata.size > filter.maxSize) {
      return false;
    }

    if (filter.tags) {
      for (const [key, value] of Object.entries(filter.tags)) {
        if (metadata.tags[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private calculateCacheSize(): number {
    let size = 0;
    for (const entry of this.cache.values()) {
      size += entry.content instanceof Uint8Array 
        ? entry.content.length 
        : new TextEncoder().encode(entry.content).length;
    }
    return size;
  }

  private updateStorageStats(size: number, time: number): void {
    this.stats.totalItems++;
    this.stats.totalSize += size;
    this.stats.averageStorageTime = 
      (this.stats.averageStorageTime * (this.stats.totalItems - 1) + time) / this.stats.totalItems;
  }

  private updateRetrievalStats(time: number, fromCache: boolean): void {
    if (fromCache) {
      // Update cache hit rate
      const totalRequests = this.stats.totalItems;
      this.stats.cacheHitRate = (this.stats.cacheHitRate * totalRequests + 1) / (totalRequests + 1);
    }
    
    this.stats.averageRetrievalTime = 
      (this.stats.averageRetrievalTime * this.stats.totalItems + time) / (this.stats.totalItems + 1);
  }

  private async calculateSha256(data: Uint8Array): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment - create a new ArrayBuffer copy to ensure compatibility
        const buffer = new ArrayBuffer(data.length);
        const view = new Uint8Array(buffer);
        view.set(data);
        
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (error) {
      console.warn('Web Crypto API failed, using fallback hash');
    }
    
    // Fallback hash implementation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data[i];
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
}
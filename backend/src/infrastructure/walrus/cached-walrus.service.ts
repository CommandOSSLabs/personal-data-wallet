import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WalrusService } from './walrus.service';
import NodeCache from 'node-cache';

@Injectable()
export class CachedWalrusService {
  private logger = new Logger(CachedWalrusService.name);
  private contentCache: NodeCache;
  
  constructor(
    private readonly walrusService: WalrusService,
    private readonly configService: ConfigService
  ) {
    // Initialize in-memory cache with default TTL of 30 minutes
    const ttl = configService.get<number>('WALRUS_CACHE_TTL', 30 * 60);
    const checkperiod = configService.get<number>('WALRUS_CACHE_CHECK_PERIOD', 60);
    
    this.contentCache = new NodeCache({
      stdTTL: ttl,
      checkperiod, // Check for expired entries every minute
      useClones: false, // Don't clone objects for better performance
      maxKeys: 10000 // Maximum number of keys
    });
    
    this.logger.log(`Initialized Walrus cache with TTL: ${ttl}s, check period: ${checkperiod}s`);
  }
  
  /**
   * Get admin address (passthrough to base service)
   */
  getAdminAddress(): string {
    return this.walrusService.getAdminAddress();
  }
  
  /**
   * Upload content to Walrus with caching
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    epochs?: number,
    additionalTags?: Record<string, string>
  ): Promise<string> {
    // Upload is always passed through to the original service
    const blobId = await this.walrusService.uploadContent(
      content,
      ownerAddress,
      epochs,
      additionalTags
    );
    
    // Cache the content after successful upload
    this.contentCache.set(blobId, content);
    this.logger.debug(`Cached content for blob ID: ${blobId}`);
    
    return blobId;
  }
  
  /**
   * Retrieve content from Walrus with caching
   */
  async retrieveContent(blobId: string): Promise<string> {
    // Check cache first
    const cachedContent = this.contentCache.get<string>(blobId);
    
    if (cachedContent) {
      this.logger.debug(`Cache hit for blob ID: ${blobId}`);
      return cachedContent;
    }
    
    // Cache miss, fetch from Walrus
    this.logger.debug(`Cache miss for blob ID: ${blobId}, fetching from Walrus`);
    try {
      const content = await this.walrusService.retrieveContent(blobId);
      
      // Cache the result
      this.contentCache.set(blobId, content);
      
      return content;
    } catch (error) {
      this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Get file tags from Walrus (passthrough)
   */
  async getFileTags(blobId: string): Promise<Record<string, string>> {
    return this.walrusService.getFileTags(blobId);
  }
  
  /**
   * Check if a user has access to a file (passthrough)
   */
  async verifyUserAccess(blobId: string, userAddress: string): Promise<boolean> {
    return this.walrusService.verifyUserAccess(blobId, userAddress);
  }
  
  /**
   * Upload a file to Walrus with caching
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    ownerAddress: string,
    epochs?: number,
    additionalTags?: Record<string, string>
  ): Promise<string> {
    const blobId = await this.walrusService.uploadFile(
      buffer,
      filename,
      ownerAddress,
      epochs,
      additionalTags
    );
    
    return blobId;
  }
  
  /**
   * Download a file from Walrus with caching
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    // For binary data, we use a separate method - no caching for now
    // We could implement this with a more sophisticated cache strategy if needed
    return this.walrusService.downloadFile(blobId);
  }
  
  /**
   * Delete content from Walrus and clear from cache
   */
  async deleteContent(
    blobId: string,
    userAddress: string
  ): Promise<boolean> {
    // Remove from cache first
    this.contentCache.del(blobId);
    
    // Then delete from Walrus
    return this.walrusService.deleteContent(blobId, userAddress);
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): {
    keys: number;
    hits: number;
    misses: number;
    ksize: number;
    vsize: number;
  } {
    return this.contentCache.getStats();
  }
  
  /**
   * Clear the entire cache
   */
  clearCache(): void {
    this.contentCache.flushAll();
    this.logger.log('Walrus content cache cleared');
  }
}
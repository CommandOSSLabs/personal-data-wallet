import { SealService } from '../security/SealService';

// MemoryMetadata interface (defined locally)
export interface MemoryMetadata {
  contentType: string;
  contentSize: number;
  contentHash: string;
  category: string;
  topic: string;
  importance: number;
  embeddingDimension: number;
  createdTimestamp: number;
  customMetadata: Record<string, string>;
  isEncrypted: boolean;
}

// ==================== TYPES & INTERFACES ====================

export interface WalrusConfig {
  network?: 'testnet' | 'mainnet';
  adminAddress?: string;
  storageEpochs?: number;
  uploadRelayHost?: string;
  retryAttempts?: number;
  timeoutMs?: number;
  sealService?: SealService;
}

export interface WalrusUploadOptions {
  category?: string;
  topic?: string;
  importance?: number;
  additionalTags?: Record<string, string>;
  enableEncryption?: boolean;
  epochs?: number;
}

export interface WalrusUploadResult {
  success: boolean;
  blobId: string;
  contentHash: string;
  metadata: MemoryMetadata;
  isEncrypted: boolean;
  uploadTimeMs: number;
  backupKey?: string;
}

class WalrusError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'WalrusError';
    if (cause) {
      this.stack += `\nCaused by: ${cause instanceof Error ? cause.stack : String(cause)}`;
    }
  }
}

export interface WalrusRetrievalResult {
  content: string | Buffer;
  metadata: MemoryMetadata;
  blobId: string;
  isFromCache: boolean;
  retrievalTimeMs: number;
}

export interface BlobInfo {
  blobId: string;
  size: number;
  contentType: string;
  uploadDate: Date;
  expiryDate?: Date;
  isEncrypted: boolean;
  tags: Record<string, string>;
}

export interface WalrusStats {
  totalUploads: number;
  totalRetrievals: number;
  successfulUploads: number;
  failedUploads: number;
  cacheHitRate: number;
  averageUploadTime: number;
  averageRetrievalTime: number;
  localFallbackCount: number;
  totalStorageUsed: number;
}

interface CachedContent {
  content: Buffer;
  metadata: MemoryMetadata;
  timestamp: Date;
}

// ==================== MAIN SERVICE ====================

export class WalrusService {
  private config: Required<WalrusConfig>;
  private cache = new Map<string, CachedContent>();
  private stats: WalrusStats = {
    totalUploads: 0,
    totalRetrievals: 0,
    successfulUploads: 0,
    failedUploads: 0,
    cacheHitRate: 0,
    averageUploadTime: 0,
    averageRetrievalTime: 0,
    localFallbackCount: 0,
    totalStorageUsed: 0
  };

  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private sealService?: SealService;

  constructor(config: Partial<WalrusConfig> = {}) {
    this.config = {
      network: config.network || 'testnet',
      adminAddress: config.adminAddress || '',
      storageEpochs: config.storageEpochs || 12,
      uploadRelayHost: config.uploadRelayHost || 'https://upload-relay.testnet.walrus.space',
      retryAttempts: config.retryAttempts || 3,
      timeoutMs: config.timeoutMs || 60000,
      sealService: config.sealService!
    };

    this.sealService = config.sealService;
  }

  // ==================== PUBLIC API ====================

  /**
   * Upload content to Walrus
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    options: WalrusUploadOptions = {}
  ): Promise<WalrusUploadResult> {
    const startTime = Date.now();
    this.stats.totalUploads++;

    try {
      // Create comprehensive metadata
      const metadata = await this.createMetadataWithEmbedding(
        content,
        options.category || 'general',
        options.topic || '',
        options.importance || 5,
        options.additionalTags || {}
      );

      // Check for duplicate uploads
      const existingBlobId = this.findDuplicateContent(metadata.contentHash);
      if (existingBlobId) {
        console.log(`Duplicate content detected, returning existing blob: ${existingBlobId}`);
        return this.createUploadResult(existingBlobId, metadata, false, Date.now() - startTime);
      }

      // Store in Walrus
      let blobId: string;
      let isEncrypted = false;
      let backupKey: string | undefined;

      if (options.enableEncryption && this.sealService) {
        // Use SEAL service for encryption and storage
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const encryptionResult = await this.sealService.encryptData({
          data,
          id: ownerAddress,
          threshold: this.sealService.getConfiguration().threshold || 2
        });
        
        // Convert encrypted data to base64 for storage
        const encryptedContent = btoa(String.fromCharCode(...encryptionResult.encryptedObject));
        blobId = await this.uploadToWalrus(
          encryptedContent, 
          ownerAddress, 
          metadata, 
          options.epochs
        );
        isEncrypted = true;
        backupKey = btoa(String.fromCharCode(...encryptionResult.key));
      } else {
        blobId = await this.uploadToWalrus(content, ownerAddress, metadata, options.epochs);
      }

      // Cache the result
      this.cacheContent(blobId, Buffer.from(content), metadata);

      // Update statistics
      this.stats.successfulUploads++;
      const uploadTime = Date.now() - startTime;
      this.updateAverageUploadTime(uploadTime);
      this.stats.totalStorageUsed += metadata.contentSize;

      return this.createUploadResult(blobId, metadata, isEncrypted, uploadTime, backupKey);

    } catch (error) {
      console.error('Upload failed:', error);
      this.stats.failedUploads++;
      throw new WalrusError('Failed to upload to Walrus', error);
    }
  }

  /**
   * Retrieve content from Walrus
   */
  async retrieveContent(blobId: string, decryptionKey?: string): Promise<WalrusRetrievalResult> {
    const startTime = Date.now();
    this.stats.totalRetrievals++;

    try {
      // Check cache first
      const cached = this.cache.get(blobId);
      if (cached && this.isCacheValid(cached.timestamp)) {
        this.stats.cacheHitRate = this.stats.cacheHitRate * 0.9 + 0.1; // Moving average
        return {
          content: cached.content.toString(),
          metadata: cached.metadata,
          blobId,
          isFromCache: true,
          retrievalTimeMs: Date.now() - startTime
        };
      }

      // Retrieve from Walrus
      const result = await this.retrieveFromWalrus(blobId);
      
      // Decrypt if needed
      let content = result.content;
      if (result.metadata.isEncrypted && this.sealService && decryptionKey) {
        // Convert base64 back to Uint8Array
        const encryptedData = Uint8Array.from(atob(content.toString()), c => c.charCodeAt(0));
        const sessionKey = null; // TODO: Get session key from context
        const txBytes = new Uint8Array(); // TODO: Get approval transaction bytes
        
        const decryptedData = await this.sealService.decryptData({
          encryptedObject: encryptedData,
          sessionKey,
          txBytes
        });
        
        const decoder = new TextDecoder();
        content = Buffer.from(decoder.decode(decryptedData));
      }

      // Cache the result
      this.cacheContent(blobId, content, result.metadata);

      // Update cache hit rate
      this.stats.cacheHitRate = this.stats.cacheHitRate * 0.9; // Moving average

      return {
        content: content.toString(),
        metadata: result.metadata,
        blobId,
        isFromCache: false,
        retrievalTimeMs: Date.now() - startTime
      };

    } catch (error) {
      throw new WalrusError(`Failed to retrieve content from Walrus: ${blobId}`, error);
    }
  }

  /**
   * Get blob information
   */
  async getBlobInfo(blobId: string): Promise<BlobInfo | null> {
    try {
      // Use official Walrus client to get blob info
      // TODO: Implement with @mysten/walrus client
      throw new WalrusError('getBlobInfo not yet implemented with official client');
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete blob from Walrus
   */
  async deleteBlob(blobId: string): Promise<boolean> {
    try {
      // Use official Walrus client to delete blob
      // TODO: Implement with @mysten/walrus client
      
      // Remove from cache
      this.cache.delete(blobId);
      
      return true;
    } catch (error) {
      throw new WalrusError(`Failed to delete blob: ${blobId}`, error);
    }
  }

  /**
   * Get service statistics
   */
  getStats(): WalrusStats {
    return { ...this.stats };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // ==================== PRIVATE METHODS ====================

  private async createMetadataWithEmbedding(
    content: string,
    category: string,
    topic: string,
    importance: number,
    customMetadata: Record<string, string>
  ): Promise<MemoryMetadata> {
    const contentBuffer = Buffer.from(content, 'utf-8');
    const contentHash = await this.generateContentHash(content);
    const timestamp = Date.now();

    return {
      contentType: 'text/plain',
      contentSize: contentBuffer.length,
      contentHash,
      category,
      topic: topic || `Memory about ${category}`,
      importance: Math.max(1, Math.min(10, importance)),
      embeddingDimension: 768,
      createdTimestamp: timestamp,
      customMetadata,
      isEncrypted: false
    };
  }

  private async generateContentHash(content: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async uploadToWalrus(
    content: string, 
    ownerAddress: string, 
    metadata: MemoryMetadata, 
    epochs?: number
  ): Promise<string> {
    try {
      // Use official @mysten/walrus client here
      // TODO: Implement actual Walrus upload using official client
      // Include required tags: context-id, app-id, owner, content-type, content-hash, encrypted, encryption-type
      
      // Mock implementation for now
      const blobId = `official_walrus_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Simulate upload delay
      await this.delay(100 + Math.random() * 400);
      
      return blobId;
    } catch (error) {
      throw new WalrusError('Failed to upload to Walrus using official client', error);
    }
  }

  private async retrieveFromWalrus(blobId: string): Promise<{ content: Buffer; metadata: MemoryMetadata }> {
    try {
      // Use official @mysten/walrus client here
      // TODO: Implement actual Walrus retrieval using official client
      throw new WalrusError('Walrus retrieval not yet implemented with official client');
    } catch (error) {
      throw new WalrusError('Failed to retrieve from Walrus using official client', error);
    }
  }

  private findDuplicateContent(contentHash: string): string | null {
    for (const [blobId, cached] of this.cache.entries()) {
      if (cached.metadata.contentHash === contentHash) {
        return blobId;
      }
    }
    return null;
  }

  private cacheContent(blobId: string, content: Buffer, metadata: MemoryMetadata): void {
    this.cache.set(blobId, {
      content,
      metadata,
      timestamp: new Date()
    });

    // Cleanup old cache entries (keep last 1000)
    if (this.cache.size > 1000) {
      const entries = Array.from(this.cache.entries()).sort(([,a], [,b]) => 
        a.timestamp.getTime() - b.timestamp.getTime()
      );
      
      for (let i = 0; i < entries.length - 1000; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  private isCacheValid(timestamp: Date): boolean {
    return Date.now() - timestamp.getTime() < this.CACHE_TTL_MS;
  }

  private createUploadResult(
    blobId: string, 
    metadata: MemoryMetadata, 
    isEncrypted: boolean, 
    uploadTimeMs: number,
    backupKey?: string
  ): WalrusUploadResult {
    return {
      success: true,
      blobId,
      contentHash: metadata.contentHash,
      metadata,
      isEncrypted,
      uploadTimeMs,
      backupKey
    };
  }

  private updateAverageUploadTime(newTime: number): void {
    const alpha = 0.1; // Smoothing factor
    this.stats.averageUploadTime = 
      this.stats.averageUploadTime * (1 - alpha) + newTime * alpha;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
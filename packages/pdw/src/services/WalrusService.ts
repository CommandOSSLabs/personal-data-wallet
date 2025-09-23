/**
 * WalrusService - Decentralized storage on Walrus network
 */

import { WalrusClient, TESTNET_WALRUS_PACKAGE_CONFIG, MAINNET_WALRUS_PACKAGE_CONFIG } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusConfig, WalrusUploadResult, WalrusRetrievalResult, PDWMemoryMetadata } from '../types';

export class WalrusService {
  private config: Required<WalrusConfig>;
  private walrusClient!: WalrusClient;
  private suiClient!: SuiClient;
  private defaultSigner?: any; // Optional default signer
  private cache = new Map<string, { data: Uint8Array; timestamp: number; metadata?: PDWMemoryMetadata }>();
  private readonly cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes cache

  constructor(config: WalrusConfig & { defaultSigner?: any } = {}) {
    this.config = {
      network: config.network || 'testnet',
      enableEncryption: config.enableEncryption || false,
      enableBatching: config.enableBatching || false,
      batchSize: config.batchSize || 10,
      batchDelayMs: config.batchDelayMs || 5000
    };
    
    this.defaultSigner = config.defaultSigner;
    this.initializeClients();
  }

  /**
   * Initialize Walrus client
   */
  private initializeClients(): void {
    try {
      console.log(`🌊 Initializing Walrus client for ${this.config.network}`);
      
      // Initialize SUI client
      const suiUrl = getFullnodeUrl(this.config.network === 'mainnet' ? 'mainnet' : 'testnet');
      this.suiClient = new SuiClient({ url: suiUrl });
      
      // Initialize Walrus client
      const walrusConfig = this.config.network === 'mainnet' 
        ? MAINNET_WALRUS_PACKAGE_CONFIG
        : TESTNET_WALRUS_PACKAGE_CONFIG;
        
      this.walrusClient = new WalrusClient({
        suiClient: this.suiClient,
        packageConfig: walrusConfig,
        network: this.config.network === 'mainnet' ? 'mainnet' : 'testnet'
      });
      
      console.log('✅ Walrus client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Walrus client:', error);
      throw error;
    }
  }

  /**
   * Store data on Walrus
   * Note: This method requires a signer for blockchain operations
   */
  async store(
    data: string | Uint8Array,
    metadata: Partial<PDWMemoryMetadata> = {},
    options: {
      signer?: any; // Should be a Signer from @mysten/sui
      epochs?: number;
      deletable?: boolean;
      owner?: string;
    } = {}
  ): Promise<WalrusUploadResult> {
    const startTime = Date.now();
    
    if (!this.walrusClient) {
      throw new Error('Walrus client not initialized. Please check your configuration.');
    }

    const signer = options.signer || this.defaultSigner;
    if (!signer) {
      throw new Error('Signer is required for Walrus write operations. Provide a signer in options or set a defaultSigner in the constructor.');
    }

    try {
      // Convert string to Uint8Array if needed
      const binaryData = typeof data === 'string' 
        ? new TextEncoder().encode(data)
        : data;

      // Store on Walrus using client with retry logic
      const result = await this.retryOperation(
        () => this.walrusClient.writeBlob({
          blob: binaryData,
          epochs: options.epochs || 5,
          signer: signer,
          deletable: options.deletable !== false,
          owner: options.owner
        }),
        'store blob'
      );
      
      const fullMetadata: PDWMemoryMetadata = {
        owner: metadata.owner || options.owner || 'unknown',
        contentType: metadata.contentType || 'application/octet-stream',
        contentSize: binaryData.length,
        contentHash: await this.hashData(binaryData),
        category: metadata.category || 'default',
        topic: metadata.topic,
        importance: metadata.importance || 5,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        additionalTags: metadata.additionalTags
      };

      return {
        blobId: result.blobId,
        isEncrypted: this.config.enableEncryption,
        uploadTimeMs: Date.now() - startTime,
        metadata: fullMetadata
      };
    } catch (error) {
      throw new Error(`Failed to store data on Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve data from Walrus
   */
  async retrieve(blobId: string): Promise<WalrusRetrievalResult> {
    const startTime = Date.now();
    
    if (!this.walrusClient) {
      throw new Error('Walrus client not initialized');
    }

    try {
      // Check cache first
      const cachedData = this.getFromCache(blobId);
      if (cachedData) {
        console.log(`📋 Retrieved blob ${blobId} from cache`);
        return {
          content: cachedData.data,
          metadata: cachedData.metadata!,
          retrievalTimeMs: Date.now() - startTime,
          isFromCache: true
        };
      }

      const data = await this.retryOperation(
        () => this.walrusClient.readBlob({ blobId }),
        'read blob'
      );
      
      // Mock metadata - in production, this would be stored separately or as attributes
      const metadata: PDWMemoryMetadata = {
        owner: 'unknown',
        contentType: 'application/octet-stream',
        contentSize: data.length,
        contentHash: await this.hashData(data),
        category: 'default',
        importance: 5,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Add to cache for future use
      this.addToCache(blobId, data, metadata);

      return {
        content: data,
        metadata,
        retrievalTimeMs: Date.now() - startTime,
        isFromCache: false
      };
    } catch (error) {
      throw new Error(`Failed to retrieve data from Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store vector index on Walrus
   */
  async storeVectorIndex(
    userId: string,
    indexData: Uint8Array,
    signer?: any
  ): Promise<WalrusUploadResult> {
    const metadata: Partial<PDWMemoryMetadata> = {
      owner: userId,
      contentType: 'application/x-hnsw-index',
      category: 'vector-index',
      topic: 'memory-search',
      importance: 10 // High importance for indices
    };

    return await this.store(indexData, metadata, { 
      signer: signer || this.defaultSigner,
      owner: userId,
      epochs: 10 // Longer storage for indices
    });
  }

  /**
   * Retrieve vector index from Walrus
   */
  async retrieveVectorIndex(blobId: string): Promise<Uint8Array> {
    const result = await this.retrieve(blobId);
    return result.content as Uint8Array;
  }

  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          console.error(`❌ ${operationName} failed after ${maxRetries + 1} attempts:`, lastError.message);
          throw new Error(`Failed to ${operationName} after ${maxRetries + 1} attempts: ${lastError.message}`);
        }
        
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`⚠️  ${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Add data to cache
   */
  private addToCache(blobId: string, data: Uint8Array, metadata?: PDWMemoryMetadata): void {
    this.cache.set(blobId, {
      data,
      timestamp: Date.now(),
      metadata
    });
    
    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Get data from cache if not expired
   */
  private getFromCache(blobId: string): { data: Uint8Array; metadata?: PDWMemoryMetadata } | null {
    const cached = this.cache.get(blobId);
    if (!cached) return null;
    
    // Check if cache entry is expired
    if (Date.now() - cached.timestamp > this.cacheTimeoutMs) {
      this.cache.delete(blobId);
      return null;
    }
    
    return { data: cached.data, metadata: cached.metadata };
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    for (const [blobId, cached] of entries) {
      if (now - cached.timestamp > this.cacheTimeoutMs) {
        this.cache.delete(blobId);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Generate hash for data integrity
   */
  private async hashData(data: Uint8Array): Promise<string> {
    try {
      // Use Node.js crypto for hashing
      const crypto = require('crypto');
      const hash = crypto.createHash('sha256');
      hash.update(data);
      return hash.digest('hex');
    } catch (error) {
      // Fallback to simple checksum
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      return sum.toString(16);
    }
  }

  /**
   * Set default signer for Walrus operations
   */
  setDefaultSigner(signer: any): void {
    this.defaultSigner = signer;
  }

  /**
   * Check if blob exists on Walrus
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      await this.walrusClient.readBlob({ blobId });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get blob size without downloading full content
   */
  async getBlobSize(blobId: string): Promise<number> {
    try {
      const metadata = await this.walrusClient.getBlobMetadata({ blobId });
      return parseInt(metadata.metadata.V1.unencoded_length);
    } catch (error) {
      throw new Error(`Failed to get blob size: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store multiple items in batch
   */
  async storeBatch(
    items: Array<{
      data: string | Uint8Array;
      metadata?: Partial<PDWMemoryMetadata>;
      options?: { epochs?: number; deletable?: boolean; };
    }>,
    batchOptions: {
      signer?: any;
      owner?: string;
      maxConcurrent?: number;
    } = {}
  ): Promise<Array<WalrusUploadResult | { error: string }>> {
    const maxConcurrent = batchOptions.maxConcurrent || this.config.batchSize;
    const results: Array<WalrusUploadResult | { error: string }> = [];
    
    // Process items in batches to avoid overwhelming the network
    for (let i = 0; i < items.length; i += maxConcurrent) {
      const batch = items.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (item) => {
        try {
          return await this.store(item.data, item.metadata, {
            ...item.options,
            signer: batchOptions.signer || this.defaultSigner,
            owner: batchOptions.owner
          });
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches if configured
      if (i + maxConcurrent < items.length && this.config.batchDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.batchDelayMs));
      }
    }
    
    return results;
  }

  /**
   * Retrieve multiple items in batch
   */
  async retrieveBatch(
    blobIds: string[],
    options: { maxConcurrent?: number } = {}
  ): Promise<Array<WalrusRetrievalResult | { error: string }>> {
    const maxConcurrent = options.maxConcurrent || this.config.batchSize;
    const results: Array<WalrusRetrievalResult | { error: string }> = [];
    
    for (let i = 0; i < blobIds.length; i += maxConcurrent) {
      const batch = blobIds.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (blobId) => {
        try {
          return await this.retrieve(blobId);
        } catch (error) {
          return { error: error instanceof Error ? error.message : 'Unknown error' };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches if configured
      if (i + maxConcurrent < blobIds.length && this.config.batchDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.batchDelayMs));
      }
    }
    
    return results;
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      network: this.config.network,
      encryption: this.config.enableEncryption,
      batching: this.config.enableBatching,
      clientInitialized: !!this.walrusClient,
      hasDefaultSigner: !!this.defaultSigner,
      cache: {
        size: this.cache.size,
        timeoutMs: this.cacheTimeoutMs
      }
    };
  }
}
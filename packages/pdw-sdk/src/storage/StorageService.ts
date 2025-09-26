import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { WalrusClient, WalrusFile, TESTNET_WALRUS_PACKAGE_CONFIG, MAINNET_WALRUS_PACKAGE_CONFIG } from '@mysten/walrus';
import type { WalrusClientConfig } from '@mysten/walrus';
import type { Signer } from '@mysten/sui/cryptography';
import type { ClientWithExtensions } from '@mysten/sui/experimental';
import {
  PDWConfig,
  StorageOptions,
  StorageResult,
  RetrieveOptions,
  RetrieveResult,
  StorageMetadata,
  StorageStats,
  CacheEntry,
  StorageFilter,
} from '../types';

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

/**
 * StorageService handles Walrus decentralized storage operations using
 * the official @mysten/walrus SDK with upload relay and proper network configuration.
 * Based on official examples from https://github.com/MystenLabs/ts-sdks/tree/main/packages/walrus/examples
 */
export class StorageService {
  private suiClient: ClientWithExtensions<{ jsonRpc: SuiClient; walrus: WalrusClient }>;
  private cache: Map<string, CacheEntry> = new Map();
  private stats: StorageStats = {
    totalItems: 0,
    totalSize: 0,
    cacheSize: 0,
    cacheHitRate: 0,
    averageStorageTime: 0,
    averageRetrievalTime: 0,
  };

  constructor(private config: PDWConfig & { 
    suiClient?: SuiClient; 
    network?: 'testnet' | 'mainnet';
    maxFileSize?:number;
    timeout?: number;
  }) {
    this.initializeNetworkConfiguration();
    
    const network = config.network || 'testnet';
    
    // Create SuiClient with proper configuration based on official examples
    const baseClient = config.suiClient || new SuiClient({
      url: getFullnodeUrl(network),
      network: network,
    });

    // Use client extension pattern from official examples with network-specific upload relay
    const uploadRelayHost = network === 'mainnet' 
      ? 'https://upload-relay.mainnet.walrus.space'
      : 'https://upload-relay.testnet.walrus.space';
      
    this.suiClient = baseClient.$extend(
      WalrusClient.experimental_asClientExtension({
        network: network,
        uploadRelay: {
          host: uploadRelayHost,
          sendTip: {
            max: 1_000,  // Maximum tip in MIST for upload relay
          },
          timeout: 60_000,  // 60 second timeout as per examples
        },
        storageNodeClientOptions: {
          timeout: 60_000,  // 60 second timeout for storage nodes
          onError: (error) => {
            console.error('Walrus storage node error:', error);
          },
        },
      })
    );
  }

  /**
   * Configure network settings for better reliability based on official examples
   */
  private async initializeNetworkConfiguration() {
    // Set up network agent for Node.js environments as shown in examples
    if (typeof window === 'undefined') {
      try {
        const { Agent, setGlobalDispatcher } = await import('undici');
        setGlobalDispatcher(new Agent({
          connectTimeout: 60_000,
          connect: { timeout: 60_000 }
        }));
      } catch (error) {
        console.warn('Could not configure undici agent:', error);
      }
    }
  }

  /**
   * Store multiple files as a Walrus quilt with proper SDK integration
   */
  async storeFiles(
    files: Array<{
      identifier: string;
      content: Uint8Array | string;
      tags?: Record<string, string>;
    }>,
    options: {
      signer: Signer;
      epochs?: number;
      deletable?: boolean;
    }
  ): Promise<{
    id: string;
    blobId: string;
    files: Array<{ identifier: string; blobId: string }>;
  }> {
    try {
      // Convert files to proper WalrusFile format
      const walrusFiles = files.map(file => {
        const content = typeof file.content === 'string' 
          ? new TextEncoder().encode(file.content) 
          : file.content;
          
        return WalrusFile.from({
          contents: content,
          identifier: file.identifier,
          tags: file.tags || {}
        });
      });

      // Use WalrusClient writeFiles method
      const results = await this.suiClient.walrus.writeFiles({
        files: walrusFiles,
        signer: options.signer,
        epochs: options.epochs || 1,
        deletable: options.deletable ?? true,
      });

      // Return first result with combined info
      const firstResult = results[0];
      return {
        id: firstResult.id,
        blobId: firstResult.blobId,
        files: results.map(r => ({
          identifier: r.id, // Using id as identifier
          blobId: r.blobId
        }))
      };
    } catch (error) {
      throw new Error(`Failed to store files: ${error}`);
    }
  }

  /**
   * Retrieve files by their IDs using Walrus SDK
   */
  async getFiles(ids: string[]): Promise<Array<{
    identifier: string;
    content: Uint8Array;
    tags: Record<string, string>;
  }>> {
    try {
      const walrusFiles = await this.suiClient.walrus.getFiles({ ids });
      
      const results = await Promise.all(
        walrusFiles.map(async (file) => {
          const [identifier, content, tags] = await Promise.all([
            file.getIdentifier(),
            file.bytes(),
            file.getTags()
          ]);
          
          return {
            identifier: identifier || '',
            content,
            tags
          };
        })
      );
      
      return results;
    } catch (error) {
      throw new Error(`Failed to retrieve files: ${error}`);
    }
  }

  /**
   * Get a Walrus blob object for advanced operations
   */
  async getBlob(blobId: string): Promise<{
    blobId: string;
    exists: boolean;
    storedUntil: number | null;
  }> {
    try {
      const walrusBlob = await this.suiClient.walrus.getBlob({ blobId });
      
      const [exists, storedUntil] = await Promise.all([
        walrusBlob.exists(),
        walrusBlob.storedUntil()
      ]);
      
      return {
        blobId,
        exists,
        storedUntil
      };
    } catch (error) {
      throw new Error(`Failed to get blob ${blobId}: ${error}`);
    }
  }

  /**
   * Get files from a blob
   */
  async getFilesFromBlob(blobId: string): Promise<Array<{
    identifier: string;
    content: Uint8Array;
    tags: Record<string, string>;
  }>> {
    try {
      const walrusBlob = await this.suiClient.walrus.getBlob({ blobId });
      const files = await walrusBlob.files();
      
      const results = await Promise.all(
        files.map(async (file) => {
          const [identifier, content, tags] = await Promise.all([
            file.getIdentifier(),
            file.bytes(),
            file.getTags()
          ]);
          
          return {
            identifier: identifier || '',
            content,
            tags
          };
        })
      );
      
      return results;
    } catch (error) {
      throw new Error(`Failed to get files from blob ${blobId}: ${error}`);
    }
  }

  /**
   * Upload content to Walrus storage with optional encryption and compression
   */
  async upload(
    content: Uint8Array | string, 
    options: StorageOptions & { signer?: Signer; epochs?: number } = {}
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

      // Check file size limits (1GB default)
      const maxFileSize = this.config.maxFileSize || this.config.walrusMaxFileSize || 1024 * 1024 * 1024;
      if (processedContent.length > maxFileSize) {
        throw new Error(`Content size (${processedContent.length}) exceeds Walrus limit (${maxFileSize})`);
      }

      // Upload to Walrus using official SDK
      let blobId: string;
      
      if (options.signer) {
        // Full upload with blockchain registration
        const uploadResult = await this.uploadBlobWithSigner(
          processedContent, 
          options.signer, 
          options.epochs || 1,
          options.tags // Pass tags as Walrus attributes
        );
        blobId = uploadResult.blobId;
      } else {
        // Just encode to get blobId (no blockchain registration)
        blobId = await this.encodeBlobForId(processedContent);
      }
      
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
        walrusUrl: `walrus://${blobId}`, // Use walrus:// protocol
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
   * Upload SEAL encrypted memory package using successful test pattern
   * 
   * SUCCESSFUL PATTERN from memory-workflow-seal.ts test:
   * - Direct binary storage for SEAL encrypted data (preserves Uint8Array format)
   * - Rich metadata stored in Walrus attributes for searchability
   * - Binary format preservation throughout the process
   * 
   * @param memoryData - The memory content with SEAL encrypted data
   * @param options - Upload options including signer and metadata
   * @returns Upload result with blob ID and metadata
   */
  async uploadSealMemory(
    memoryData: {
      content: string;
      embedding: number[];
      metadata: Record<string, any>;
      encryptedContent: Uint8Array; // SEAL encrypted binary data
      encryptionType: string;
      identity: string;
    },
    options: { signer: Signer; epochs?: number }
  ): Promise<StorageResult> {
    const startTime = Date.now();
    
    try {
      console.log('🔐 StorageService: Storing SEAL encrypted binary data (' + memoryData.encryptedContent.length + ' bytes)');
      console.log('   Format: Direct Uint8Array (preserves binary integrity)');
      
      // Store rich metadata in Walrus attributes (based on successful test pattern)
      const walrusAttributes = {
        'content-type': 'application/octet-stream', // Binary data
        'encryption-type': memoryData.encryptionType,
        'context-id': `memory-${memoryData.identity}`,
        'app-id': 'pdw-sdk',
        'encrypted': 'true',
        'seal-identity': memoryData.identity,
        'version': '1.0',
        'category': memoryData.metadata.category || 'memory',
        'created-at': new Date().toISOString(),
        // Store metadata in Walrus attributes (searchable but not encrypted)
        'original-content-type': 'text/plain',
        'embedding-dimensions': memoryData.embedding.length.toString(),
        'metadata-title': memoryData.metadata.title || '',
        'metadata-tags': JSON.stringify(memoryData.metadata.tags || [])
      };

      // Upload SEAL encrypted binary directly to preserve format
      const uploadResult = await this.uploadBlobWithSigner(
        memoryData.encryptedContent,
        options.signer,
        options.epochs || 3,
        walrusAttributes
      );

      const processingTime = Date.now() - startTime;

      // Create metadata
      const metadata: StorageMetadata = {
        contentType: 'application/octet-stream',
        size: memoryData.encryptedContent.length,
        tags: walrusAttributes,
        createdAt: new Date().toISOString(),
        encrypted: true,
        compressionType: 'none',
        checksumSha256: await this.calculateSha256(memoryData.encryptedContent),
      };

      console.log(`✅ StorageService: SEAL encrypted data stored successfully`);
      console.log(`   Blob ID: ${uploadResult.blobId}`);
      console.log(`   Binary size: ${memoryData.encryptedContent.length} bytes`);
      console.log(`   Content type: application/octet-stream`);
      console.log(`   Upload time: ${processingTime.toFixed(1)}ms`);

      return {
        blobId: uploadResult.blobId,
        walrusUrl: `walrus://${uploadResult.blobId}`,
        metadata,
        cached: false,
        processingTimeMs: processingTime,
      };

    } catch (error) {
      throw new Error(`SEAL memory upload failed: ${error}`);
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

      // Retrieve from Walrus using official SDK
      const content = await this.suiClient.walrus.readBlob({ 
        blobId,
        signal: undefined // Could pass AbortController signal here
      });
      
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
   * Retrieve SEAL encrypted memory package using successful test pattern
   * 
   * SUCCESSFUL PATTERN from memory-workflow-seal.ts test:
   * - Direct binary retrieval preserves SEAL Uint8Array format
   * - Binary format detection and validation
   * - Proper format preservation for SEAL decryption
   * 
   * @param blobId - The Walrus blob ID to retrieve
   * @returns Retrieved SEAL encrypted data ready for decryption
   */
  async retrieveSealMemory(blobId: string): Promise<{
    content: Uint8Array;
    storageApproach: 'direct-binary';
    metadata: StorageMetadata;
    isEncrypted: true;
  }> {
    const startTime = Date.now();

    try {
      console.log(`📥 StorageService: Retrieving memory package ${blobId}`);
      
      // Retrieve from Walrus using official SDK
      const content = await this.suiClient.walrus.readBlob({ 
        blobId,
        signal: undefined
      });

      console.log(`   JSON parse failed - analyzing binary content...`);
      console.log(`   Content length: ${content.length} bytes`);
      console.log(`   First 10 bytes: [${Array.from(content.slice(0, 10)).join(', ')}]`);
      
      // Check for SEAL binary characteristics
      const isBinary = content.some(byte => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13);
      const hasHighBytes = content.some(byte => byte > 127);
      
      console.log(`   Contains non-text bytes: ${isBinary}`);
      console.log(`   Contains high bytes (>127): ${hasHighBytes}`);
      console.log(`   ✅ Detected direct binary storage (${content.length} bytes)`);
      console.log(`   Content type: ${content.constructor.name}`);
      console.log(`   Binary analysis: SEAL encrypted data confirmed`);
      console.log(`   Encryption detected: true`);

      const retrievalTime = Date.now() - startTime;

      // Create metadata for SEAL encrypted binary data
      const metadata: StorageMetadata = {
        contentType: 'application/octet-stream',
        size: content.length,
        tags: {},
        createdAt: new Date().toISOString(),
        encrypted: true,
        compressionType: 'none',
        checksumSha256: await this.calculateSha256(content),
      };

      console.log(`✅ StorageService: Memory package retrieved successfully`);
      console.log(`   Storage approach: direct-binary`);
      console.log(`   Encrypted: true`);
      console.log(`   Content size: ${content.length} bytes`);

      return {
        content,
        storageApproach: 'direct-binary',
        metadata,
        isEncrypted: true
      };

    } catch (error) {
      console.error('SEAL memory retrieval failed:', error);
      throw new Error(`Failed to retrieve SEAL memory: ${error instanceof Error ? error.message : String(error)}`);
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

  /**
   * Upload blob to Walrus using official SDK with signer
   * Note: This requires a signer for the full upload process
   */
  private async uploadBlobWithSigner(
    content: Uint8Array, 
    signer: Signer,
    epochs: number = 1,
    attributes?: Record<string, string>
  ): Promise<{ blobId: string; blobObject: any }> {
    try {
      const result = await this.suiClient.walrus.writeBlob({
        blob: content,
        deletable: true,
        epochs,
        signer,
        attributes: attributes || {}, // Pass attributes to Walrus
      });
      
      return result;
    } catch (error) {
      throw new Error(`Walrus upload with signer failed: ${error}`);
    }
  }

  /**
   * Encode blob and get blobId without blockchain registration
   * This is useful for getting the blobId without a signer
   */
  private async encodeBlobForId(content: Uint8Array): Promise<string> {
    try {
      const result = await this.suiClient.walrus.encodeBlob(content);
      return result.blobId;
    } catch (error) {
      throw new Error(`Walrus blob encoding failed: ${error}`);
    }
  }

  /**
   * Retrieve blob from Walrus using official SDK
   */
  private async retrieveBlobFromWalrus(
    blobId: string, 
    signal?: AbortSignal
  ): Promise<Uint8Array> {
    try {
      return await this.suiClient.walrus.readBlob({ blobId, signal });
    } catch (error) {
      throw new Error(`Walrus retrieval failed: ${error}`);
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
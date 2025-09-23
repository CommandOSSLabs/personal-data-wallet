/**
 * Streamlined WalrusService for Vector Index Storage
 */

import { createHash } from 'crypto';
import { WalrusClient, TESTNET_WALRUS_PACKAGE_CONFIG, MAINNET_WALRUS_PACKAGE_CONFIG } from '@mysten/walrus';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { 
  WalrusUploadResult, 
  WalrusRetrievalResult, 
  PDWMemoryMetadata
} from '../types';

export interface WalrusConfig {
  network?: 'testnet' | 'mainnet';
  publisherUrl?: string;
  aggregatorUrl?: string;
  enableLocalFallback?: boolean;
}

export class WalrusService {
  private readonly network: 'testnet' | 'mainnet';
  private readonly enableLocalFallback: boolean;
  private walrusClient!: WalrusClient;
  private suiClient!: SuiClient;
  private signer!: Ed25519Keypair;
  private localCache = new Map<string, Buffer>();

  constructor(config: WalrusConfig = {}) {
    this.network = config.network || 'testnet';
    this.enableLocalFallback = config.enableLocalFallback !== false;
    
    // Initialize SUI client
    const suiUrl = getFullnodeUrl(this.network === 'mainnet' ? 'mainnet' : 'testnet');
    this.suiClient = new SuiClient({ url: suiUrl });
    
    // Create a keypair for signing transactions (in production, this should be passed in)
    this.signer = new Ed25519Keypair();
    
    // Initialize Walrus client
    const walrusConfig = this.network === 'mainnet' 
      ? MAINNET_WALRUS_PACKAGE_CONFIG
      : TESTNET_WALRUS_PACKAGE_CONFIG;
      
    this.walrusClient = new WalrusClient({
      suiClient: this.suiClient,
      packageConfig: walrusConfig,
      network: this.network === 'mainnet' ? 'mainnet' : 'testnet'
    });
    
    console.log(`✅ WalrusService initialized on ${this.network} network`);
  }

  /**
   * Upload vector index buffer to Walrus
   */
  async uploadVectorIndex(
    buffer: Buffer,
    metadata: {
      userId: string;
      indexType: 'hnsw' | 'metadata';
      category?: string;
    }
  ): Promise<WalrusUploadResult> {
    const startTime = Date.now();
    
    try {
      // Calculate content hash
      const contentHash = createHash('sha256').update(buffer).digest('hex');
      
      // Try uploading to Walrus
      const blobId = await this.uploadToWalrus(buffer);
      
      const walrusMetadata: PDWMemoryMetadata = {
        owner: metadata.userId,
        contentType: 'application/octet-stream',
        contentSize: buffer.length,
        contentHash,
        category: metadata.category || 'vector-index',
        topic: `${metadata.indexType}-index`,
        importance: 8, // High importance for indices
        createdAt: Date.now(),
        updatedAt: Date.now(),
        additionalTags: {
          userId: metadata.userId,
          indexType: metadata.indexType,
          network: this.network
        }
      };

      return {
        blobId,
        uploadTimeMs: Date.now() - startTime,
        isEncrypted: false,
        metadata: walrusMetadata
      };
    } catch (error) {
      // Fallback to local storage if enabled
      if (this.enableLocalFallback) {
        const localBlobId = `local_${createHash('sha256').update(buffer).digest('hex')}`;
        this.localCache.set(localBlobId, buffer);
        
        console.warn('Walrus upload failed, using local fallback:', error);
        
        return {
          blobId: localBlobId,
          uploadTimeMs: Date.now() - startTime,
          isEncrypted: false,
          metadata: {
            owner: metadata.userId,
            contentType: 'application/octet-stream',
            contentSize: buffer.length,
            contentHash: createHash('sha256').update(buffer).digest('hex'),
            category: metadata.category || 'vector-index',
            topic: 'local-fallback',
            importance: 5,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        };
      }
      
      throw new Error(`Failed to upload to Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve vector index buffer from Walrus
   */
  async retrieveVectorIndex(blobId: string): Promise<WalrusRetrievalResult> {
    const startTime = Date.now();
    
    try {
      // Check local cache first
      if (blobId.startsWith('local_') && this.localCache.has(blobId)) {
        const content = this.localCache.get(blobId)!;
        
        return {
          content,
          metadata: {
            owner: 'unknown',
            contentType: 'application/octet-stream',
            contentSize: content.length,
            contentHash: createHash('sha256').update(content).digest('hex'),
            category: 'vector-index',
            topic: 'local-cache',
            importance: 5,
            createdAt: Date.now(),
            updatedAt: Date.now()
          },
          retrievalTimeMs: Date.now() - startTime,
          isFromCache: true
        };
      }

      // Retrieve from Walrus
      const content = await this.retrieveFromWalrus(blobId);
      
      return {
        content,
        metadata: {
          owner: 'unknown',
          contentType: 'application/octet-stream',
          contentSize: content.length,
          contentHash: createHash('sha256').update(content).digest('hex'),
          category: 'vector-index',
          topic: 'walrus-storage',
          importance: 8,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        retrievalTimeMs: Date.now() - startTime,
        isFromCache: false
      };
    } catch (error) {
      throw new Error(`Failed to retrieve from Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if blob exists
   */
  async blobExists(blobId: string): Promise<boolean> {
    try {
      if (blobId.startsWith('local_')) {
        return this.localCache.has(blobId);
      }
      
      // Try reading the blob to check existence
      await this.walrusClient.readBlob({ blobId });
      
      return true; // If read succeeds, blob exists
    } catch (error) {
      return false;
    }
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      network: this.network,
      walrusClientReady: !!this.walrusClient,
      suiClientReady: !!this.suiClient,
      localCacheSize: this.localCache.size,
      enableLocalFallback: this.enableLocalFallback
    };
  }

  /**
   * Clear local cache
   */
  clearCache(): void {
    this.localCache.clear();
  }

  private async uploadToWalrus(buffer: Buffer): Promise<string> {
    try {
      // Convert Buffer to Uint8Array for Walrus SDK
      const data = new Uint8Array(buffer);
      
      // Store using Walrus SDK
      const result = await this.walrusClient.writeBlob({
        blob: data,
        deletable: true,
        epochs: 5, // Store for 5 epochs by default
        signer: this.signer
      });
      
      return result.blobId;
    } catch (error) {
      throw new Error(`Walrus upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async retrieveFromWalrus(blobId: string): Promise<Buffer> {
    try {
      // Retrieve using Walrus SDK
      const data = await this.walrusClient.readBlob({ blobId });
      
      // Convert Uint8Array to Buffer
      return Buffer.from(data);
    } catch (error) {
      throw new Error(`Walrus retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
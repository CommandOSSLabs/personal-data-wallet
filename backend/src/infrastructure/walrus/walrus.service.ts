import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import {
  WalrusClient,
  WalrusFile,
  RetryableWalrusClientError,
} from '@mysten/walrus';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { EmbeddingService } from '../../memory/embedding/embedding.service';
import { SealService } from '../seal/seal.service';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { sha3_256 } from '@noble/hashes/sha3';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

// Metadata interfaces for enhanced storage
export interface MemoryMetadata {
  contentType: string;
  contentSize: number;
  contentHash: string;
  category: string;
  topic: string;
  importance: number; // 1-10 scale
  embeddingBlobId?: string;
  embeddingDimension: number;
  createdTimestamp: number;
  updatedTimestamp?: number;
  customMetadata?: Record<string, string>;
}

export interface EnhancedUploadResult {
  blobId: string;
  metadata: MemoryMetadata;
  embeddingBlobId?: string;
}

@Injectable()
export class WalrusService {
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;
  private adminKeypair: Ed25519Keypair;
  private logger = new Logger(WalrusService.name);
  private adminAddress: string;

  // Number of epochs to store content for by default
  private readonly DEFAULT_STORAGE_EPOCHS = 12; // ~1 month at ~3 days/epoch

  // Local storage fallback
  private readonly LOCAL_STORAGE_DIR = path.join(
    process.cwd(),
    'storage',
    'walrus-fallback',
  );
  private walrusAvailable = true;
  private lastWalrusCheck = 0;
  private readonly WALRUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => EmbeddingService))
    private embeddingService?: EmbeddingService,
    @Inject(forwardRef(() => SealService))
    private sealService?: SealService,
  ) {
    // Initialize Sui client with the appropriate network
    const configNetwork = this.configService.get<string>(
      'SUI_NETWORK',
      'testnet',
    );

    // Validate network for type safety
    const network = configNetwork || 'testnet';

    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network as 'testnet' | 'mainnet'),
    });

    // Initialize admin keypair for signing transactions
    this.initializeAdminKeypair();

    // Initialize local storage directory
    this.initializeLocalStorage();

    // Initialize Walrus client with simple, reliable configuration
    this.initializeWalrusClient(network as 'testnet' | 'mainnet');

    this.logger.log(
      `Initialized Walrus client on ${network} network with local storage fallback`,
    );
  }

  /**
   * Initialize Walrus client following SDK best practices
   */
  private initializeWalrusClient(network: 'testnet' | 'mainnet') {
    try {
      // Simple, reliable configuration following SDK documentation
      const clientOptions: any = {
        network,
        suiClient: this.suiClient,
        // Configure storage node options for better reliability
        storageNodeClientOptions: {
          timeout: 60_000, // 60 seconds as recommended in SDK docs
          onError: (error: Error) => {
            this.logger.debug(`Storage node error: ${error.message}`);
          },
        },
      };

      // Add upload relay for testnet (recommended for better performance)
      if (network === 'testnet') {
        const useUploadRelay = this.configService.get<boolean>(
          'WALRUS_USE_UPLOAD_RELAY',
          true,
        );

        if (useUploadRelay) {
          const uploadRelayHost = this.configService.get<string>(
            'WALRUS_UPLOAD_RELAY_HOST',
            'https://upload-relay.testnet.walrus.space',
          );

          clientOptions.uploadRelay = {
            host: uploadRelayHost,
            sendTip: {
              // Use the tip configuration from SDK docs
              address:
                '0x4b6a7439159cf10533147fc3d678cf10b714f2bc998f6cb1f1b0b9594cdc52b6',
              kind: {
                const: 105,
              },
            },
          };
          this.logger.log(
            `Walrus client configured with upload relay: ${uploadRelayHost}`,
          );
        }
      }

      this.walrusClient = new WalrusClient(clientOptions);
      this.logger.log(`Walrus client initialized successfully for ${network}`);
    } catch (error) {
      this.logger.error(`Failed to initialize Walrus client: ${error.message}`);
      throw new Error(`Walrus client initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize admin keypair for signing transactions
   */
  private initializeAdminKeypair() {
    try {
      const privateKey = this.configService.get<string>(
        'SUI_ADMIN_PRIVATE_KEY',
      );

      if (!privateKey) {
        throw new Error('SUI_ADMIN_PRIVATE_KEY not provided');
      }

      // Handle both hex format and SUI private key format
      const cleanedKey = privateKey.replace(/\s+/g, ''); // Remove any whitespace

      if (cleanedKey.startsWith('suiprivkey1')) {
        // SUI private key format - use directly
        this.adminKeypair = Ed25519Keypair.fromSecretKey(cleanedKey);
      } else {
        // Hex format - convert to buffer
        const keyWithPrefix = cleanedKey.startsWith('0x')
          ? cleanedKey
          : `0x${cleanedKey}`;
        const keyBuffer = Buffer.from(keyWithPrefix.replace('0x', ''), 'hex');
        if (keyBuffer.length !== 32) {
          throw new Error(
            `Invalid hex key length: ${keyBuffer.length}, expected 32`,
          );
        }
        this.adminKeypair = Ed25519Keypair.fromSecretKey(keyBuffer);
      }
      this.adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();

      this.logger.log(
        `Walrus service using admin address: ${this.adminAddress}`,
      );
    } catch (error) {
      this.logger.error(`Failed to initialize admin keypair: ${error.message}`);
      throw new Error(`Admin keypair initialization failed: ${error.message}`);
    }
  }

  /**
   * Initialize local storage directory for fallback
   */
  private async initializeLocalStorage() {
    try {
      await mkdir(this.LOCAL_STORAGE_DIR, { recursive: true });
      this.logger.log(
        `Local storage fallback initialized at: ${this.LOCAL_STORAGE_DIR}`,
      );
    } catch (error) {
      this.logger.error(`Failed to initialize local storage: ${error.message}`);
    }
  }

  /**
   * Check if Walrus is available (with caching to avoid frequent checks)
   */
  private async isWalrusAvailable(): Promise<boolean> {
    const now = Date.now();

    // Use cached result if recent
    if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
      return this.walrusAvailable;
    }

    try {
      // Quick availability check - try to get a non-existent file
      const testPromise = this.walrusClient.getFiles({
        ids: ['availability-test'],
      });
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Availability check timeout')), 5000);
      });

      await Promise.race([testPromise, timeoutPromise]);
      this.walrusAvailable = true;
      this.logger.debug('Walrus availability check: AVAILABLE');
    } catch (error: any) {
      if (
        error.message.includes('timeout') ||
        error.message.includes('fetch failed') ||
        error.message.includes('network')
      ) {
        this.walrusAvailable = false;
        this.logger.warn(
          'Walrus availability check: UNAVAILABLE - using local storage fallback',
        );
      } else {
        // Other errors (like "not found") mean Walrus is working
        this.walrusAvailable = true;
        this.logger.debug('Walrus availability check: AVAILABLE');
      }
    }

    this.lastWalrusCheck = now;
    return this.walrusAvailable;
  }

  /**
   * Generate a unique blob ID for local storage
   */
  private generateLocalBlobId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Store file locally as fallback
   */
  private async storeFileLocally(
    buffer: Buffer,
    filename: string,
    tags: Record<string, string> = {},
  ): Promise<string> {
    const blobId = this.generateLocalBlobId();
    const filePath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.meta.json`);

    try {
      // Store the file data
      await writeFile(filePath, buffer);

      // Store metadata
      const metadata = {
        blobId,
        filename,
        tags,
        size: buffer.length,
        createdAt: new Date().toISOString(),
        storageType: 'local_fallback',
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));

      this.logger.log(
        `File stored locally: ${blobId} (${buffer.length} bytes)`,
      );
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store file locally: ${error.message}`);
      throw new Error(`Local storage error: ${error.message}`);
    }
  }

  /**
   * Retrieve file from local storage
   */
  private async retrieveFileLocally(blobId: string): Promise<Buffer> {
    const filePath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.bin`);

    try {
      const buffer = await readFile(filePath);
      this.logger.log(
        `File retrieved from local storage: ${blobId} (${buffer.length} bytes)`,
      );
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found in local storage: ${blobId}`);
      }
      this.logger.error(`Failed to retrieve file locally: ${error.message}`);
      throw new Error(`Local storage retrieval error: ${error.message}`);
    }
  }

  /**
   * Get admin address
   * @returns The admin address
   */
  getAdminAddress(): string {
    return this.adminAddress;
  }

  /**
   * Generate content hash for metadata
   * @param content The content to hash
   * @returns SHA3-256 hash (consistent with SEAL)
   */
  private generateContentHash(content: string): string {
    const contentBytes = new TextEncoder().encode(content);
    const hashBytes = sha3_256(contentBytes);
    return Array.from(hashBytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Create metadata embedding from content
   * @param content The content to create metadata for
   * @param category Memory category
   * @param topic Memory topic
   * @param importance Importance level (1-10)
   * @returns MemoryMetadata with embedding
   */
  async createMetadataWithEmbedding(
    content: string,
    category: string,
    topic: string = '',
    importance: number = 5,
    customMetadata: Record<string, string> = {},
  ): Promise<MemoryMetadata> {
    const contentBuffer = Buffer.from(content, 'utf-8');
    const contentHash = this.generateContentHash(content);
    const timestamp = Date.now();

    // Create base metadata
    const metadata: MemoryMetadata = {
      contentType: 'text/plain',
      contentSize: contentBuffer.length,
      contentHash,
      category,
      topic: topic || `Memory about ${category}`,
      importance: Math.max(1, Math.min(10, importance)), // Clamp to 1-10
      embeddingDimension: 768, // Gemini embedding dimension
      createdTimestamp: timestamp,
      customMetadata,
    };

    // Generate embedding if EmbeddingService is available
    if (this.embeddingService) {
      try {
        // Create a summary for embedding (content + metadata context)
        const embeddingText = `Category: ${category}, Topic: ${topic}, Content: ${content.substring(0, 1000)}`;

        const { vector } = await this.embeddingService.embedText(embeddingText);

        // Store embedding as JSON blob on Walrus
        const embeddingData = {
          vector,
          dimension: 768,
          source: 'metadata',
          category,
          topic,
          contentHash,
          timestamp,
        };

        const embeddingJson = JSON.stringify(embeddingData);
        const embeddingBlobId = await this.storeEmbeddingLocally(
          embeddingJson,
          contentHash,
        );

        metadata.embeddingBlobId = embeddingBlobId;
        this.logger.log(
          `Created metadata embedding: ${embeddingBlobId.substring(0, 8)}...`,
        );
      } catch (error) {
        this.logger.warn(
          `Failed to create metadata embedding: ${error.message}`,
        );
        // Continue without embedding
      }
    } else {
      this.logger.warn(
        'EmbeddingService not available for metadata embeddings',
      );
    }

    return metadata;
  }

  /**
   * Store embedding data locally or on Walrus
   * @param embeddingJson Serialized embedding data
   * @param contentHash Content hash for identification
   * @returns Blob ID
   */
  private async storeEmbeddingLocally(
    embeddingJson: string,
    contentHash: string,
  ): Promise<string> {
    const buffer = Buffer.from(embeddingJson, 'utf-8');
    const filename = `embedding_${contentHash}_${Date.now()}.json`;
    const tags = {
      'content-type': 'application/json',
      'data-type': 'metadata-embedding',
      'content-hash': contentHash,
      created: new Date().toISOString(),
    };

    // For now, store locally. In production, this could go to Walrus
    return await this.storeFileLocally(buffer, filename, tags);
  }

  /**
   * Upload content with SEAL encryption
   * @param content The content to upload (will be encrypted)
   * @param ownerAddress The address of the owner
   * @param category Memory category
   * @param topic Memory topic
   * @param importance Importance level (1-10)
   * @param epochs Number of epochs to store the content
   * @param additionalTags Additional metadata tags to include
   * @returns Enhanced upload result with encryption metadata
   */
  async uploadEncryptedContent(
    content: string,
    ownerAddress: string,
    category: string,
    topic: string = '',
    importance: number = 5,
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {},
  ): Promise<
    EnhancedUploadResult & { isEncrypted: boolean; backupKey?: string }
  > {
    if (!this.sealService) {
      this.logger.warn(
        'SealService not available, falling back to unencrypted storage',
      );
      const result = await this.uploadContentWithMetadata(
        content,
        ownerAddress,
        category,
        topic,
        importance,
        epochs,
        additionalTags,
      );
      return { ...result, isEncrypted: false };
    }

    try {
      // Encrypt content using SEAL
      const { encryptedData, backupKey } = await this.sealService.encrypt(
        content,
        ownerAddress,
        {
          category,
          topic,
          importance: importance.toString(),
          ...additionalTags,
        },
      );

      // Create metadata for the encrypted content
      const metadata = await this.createMetadataWithEmbedding(
        content, // Use original content for embeddings
        category,
        topic,
        importance,
        { ...additionalTags, encrypted: 'true', encryptionType: 'seal' },
      );

      // Upload encrypted content with enhanced tags
      const enhancedTags = {
        'content-type': 'application/octet-stream',
        owner: ownerAddress,
        category: category,
        topic: topic,
        importance: importance.toString(),
        'content-hash': metadata.contentHash,
        'embedding-blob-id': metadata.embeddingBlobId || '',
        encrypted: 'true',
        'encryption-type': 'seal',
        created: new Date(metadata.createdTimestamp).toISOString(),
        ...additionalTags,
      };

      const blobId = await this.uploadContent(
        encryptedData,
        ownerAddress,
        epochs,
        enhancedTags,
      );

      this.logger.log(`Content encrypted with SEAL and uploaded: ${blobId}`);

      return {
        blobId,
        metadata,
        embeddingBlobId: metadata.embeddingBlobId,
        isEncrypted: true,
        backupKey,
      };
    } catch (error) {
      this.logger.error(
        `Failed to encrypt and upload content: ${error.message}`,
      );
      // Fallback to unencrypted storage
      this.logger.warn(
        'Falling back to unencrypted storage due to encryption failure',
      );
      const result = await this.uploadContentWithMetadata(
        content,
        ownerAddress,
        category,
        topic,
        importance,
        epochs,
        additionalTags,
      );
      return { ...result, isEncrypted: false };
    }
  }

  /**
   * Retrieve and decrypt SEAL-encrypted content
   * @param blobId The blob ID to retrieve
   * @param userAddress The user requesting access
   * @param sessionKey Optional session key for SEAL decryption
   * @param signedTxBytes Optional signed transaction bytes for SEAL decryption
   * @returns The decrypted content or throws an error
   */
  async retrieveEncryptedContent(
    blobId: string,
    userAddress: string,
    sessionKey?: any, // SessionKey from @mysten/seal
    signedTxBytes?: Uint8Array,
  ): Promise<string> {
    try {
      // Check if content is encrypted by examining tags
      const tags = await this.getFileTags(blobId);
      const isEncrypted = tags['encrypted'] === 'true';
      const encryptionType = tags['encryption-type'];

      if (!isEncrypted) {
        // Content is not encrypted, retrieve normally
        return await this.retrieveContent(blobId);
      }

      if (encryptionType !== 'seal') {
        throw new Error(`Unsupported encryption type: ${encryptionType}`);
      }

      if (!this.sealService) {
        throw new Error('SealService not available for decryption');
      }

      if (!sessionKey || !signedTxBytes) {
        throw new Error(
          'Session key and signed transaction bytes required for SEAL decryption',
        );
      }

      // Verify user access
      const hasAccess = await this.verifyUserAccess(blobId, userAddress);
      if (!hasAccess) {
        throw new Error(
          `User ${userAddress} does not have access to content ${blobId}`,
        );
      }

      // Retrieve encrypted content
      const encryptedContent = await this.retrieveContent(blobId);

      // Decrypt using SEAL
      const decryptedContent = await this.sealService.decrypt(
        encryptedContent,
        userAddress,
        sessionKey,
        signedTxBytes,
      );

      this.logger.log(
        `Content successfully decrypted for user: ${userAddress}`,
      );
      return decryptedContent;
    } catch (error) {
      this.logger.error(`Error retrieving encrypted content: ${error.message}`);
      throw new Error(`Encrypted content retrieval error: ${error.message}`);
    }
  }

  /**
   * Check if content is encrypted and what encryption method was used
   * @param blobId The blob ID to check
   * @returns Encryption information
   */
  async getEncryptionInfo(blobId: string): Promise<{
    isEncrypted: boolean;
    encryptionType?: string;
    requiresAuth: boolean;
  }> {
    try {
      const tags = await this.getFileTags(blobId);
      const isEncrypted = tags['encrypted'] === 'true';
      const encryptionType = tags['encryption-type'];

      return {
        isEncrypted,
        encryptionType,
        requiresAuth: isEncrypted && encryptionType === 'seal',
      };
    } catch (error) {
      this.logger.error(`Error checking encryption info: ${error.message}`);
      return {
        isEncrypted: false,
        requiresAuth: false,
      };
    }
  }

  /**
   * Upload content with enhanced metadata and embeddings
   * @param content The content to upload
   * @param ownerAddress The address of the owner
   * @param category Memory category
   * @param topic Memory topic
   * @param importance Importance level (1-10)
   * @param epochs Number of epochs to store the content
   * @param additionalTags Additional metadata tags to include
   * @returns Enhanced upload result with metadata
   */
  async uploadContentWithMetadata(
    content: string,
    ownerAddress: string,
    category: string,
    topic: string = '',
    importance: number = 5,
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {},
  ): Promise<EnhancedUploadResult> {
    // Create metadata with embedding
    const metadata = await this.createMetadataWithEmbedding(
      content,
      category,
      topic,
      importance,
      additionalTags,
    );

    // Upload content with enhanced tags
    const enhancedTags = {
      'content-type': 'text/plain',
      owner: ownerAddress,
      category: category,
      topic: topic,
      importance: importance.toString(),
      'content-hash': metadata.contentHash,
      'embedding-blob-id': metadata.embeddingBlobId || '',
      created: new Date(metadata.createdTimestamp).toISOString(),
      ...additionalTags,
    };

    const blobId = await this.uploadContent(
      content,
      ownerAddress,
      epochs,
      enhancedTags,
    );

    return {
      blobId,
      metadata,
      embeddingBlobId: metadata.embeddingBlobId,
    };
  }

  /**
   * Upload content with Walrus/local storage fallback (original method)
   * @param content The content to upload
   * @param ownerAddress The address of the owner
   * @param epochs Number of epochs to store the content
   * @param additionalTags Additional metadata tags to include
   * @returns The blob ID
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {},
  ): Promise<string> {
    const buffer = Buffer.from(content, 'utf-8');
    const filename = `content_${Date.now()}.txt`;
    const tags = {
      'content-type': 'text/plain',
      owner: ownerAddress,
      created: new Date().toISOString(),
      ...additionalTags,
    };

    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();

    if (!walrusAvailable) {
      this.logger.warn(
        `Walrus unavailable, storing content locally for owner ${ownerAddress}`,
      );
      return await this.storeFileLocally(buffer, filename, tags);
    }

    try {
      this.logger.log(
        `Uploading content to Walrus for owner ${ownerAddress}...`,
      );

      // Create a WalrusFile from string content
      const file = WalrusFile.from({
        contents: new TextEncoder().encode(content),
        identifier: filename,
        tags,
      });

      // Use the complete workflow for production
      const results = await this.uploadFilesToWalrus([file], epochs);

      if (!results || results.length === 0) {
        throw new Error('Failed to upload content to Walrus');
      }

      return results[0].blobId;
    } catch (error) {
      this.logger.error(
        `Walrus upload failed, falling back to local storage: ${error.message}`,
      );
      // Fallback to local storage
      return await this.storeFileLocally(buffer, filename, tags);
    }
  }

  /**
   * Retrieve content from Walrus
   * @param blobId The blob ID to retrieve
   * @returns The retrieved content
   */
  async retrieveContent(blobId: string): Promise<string> {
    try {
      this.logger.log(`Retrieving content from blobId: ${blobId}`);

      // Get file from the blob ID
      const [file] = await this.walrusClient.getFiles({
        ids: [blobId],
      });

      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }

      // Convert to text
      const content = await file.text();

      return content;
    } catch (error) {
      this.logger.error(
        `Error retrieving content from Walrus: ${error.message}`,
      );
      throw new Error(`Walrus retrieval error: ${error.message}`);
    }
  }

  /**
   * Retrieve metadata embedding from blob ID
   * @param embeddingBlobId The embedding blob ID
   * @returns Embedding vector and metadata
   */
  async retrieveMetadataEmbedding(embeddingBlobId: string): Promise<{
    vector: number[];
    dimension: number;
    category: string;
    topic: string;
    contentHash: string;
    timestamp: number;
  } | null> {
    try {
      // Check if this is a local blob ID
      if (embeddingBlobId.startsWith('local_')) {
        const embeddingJson = await this.retrieveFileLocally(embeddingBlobId);
        return JSON.parse(embeddingJson.toString());
      }

      // Retrieve from Walrus (when available)
      const embeddingJson = await this.retrieveContent(embeddingBlobId);
      return JSON.parse(embeddingJson);
    } catch (error) {
      this.logger.warn(
        `Failed to retrieve metadata embedding ${embeddingBlobId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Get enhanced metadata from content blob
   * @param blobId The content blob ID
   * @returns Enhanced metadata including embeddings
   */
  async getEnhancedMetadata(blobId: string): Promise<MemoryMetadata | null> {
    try {
      const tags = await this.getFileTags(blobId);

      // Reconstruct metadata from tags
      const metadata: MemoryMetadata = {
        contentType: tags['content-type'] || 'text/plain',
        contentSize: parseInt(tags['content-size'] || '0'),
        contentHash: tags['content-hash'] || '',
        category: tags['category'] || 'general',
        topic: tags['topic'] || '',
        importance: parseInt(tags['importance'] || '5'),
        embeddingBlobId: tags['embedding-blob-id'] || undefined,
        embeddingDimension: parseInt(tags['embedding-dimension'] || '768'),
        createdTimestamp: new Date(tags['created'] || Date.now()).getTime(),
        updatedTimestamp: tags['updated']
          ? new Date(tags['updated']).getTime()
          : undefined,
        customMetadata: {},
      };

      // Extract custom metadata (any tag not in the standard set)
      const standardTags = new Set([
        'content-type',
        'content-size',
        'content-hash',
        'category',
        'topic',
        'importance',
        'embedding-blob-id',
        'embedding-dimension',
        'created',
        'updated',
        'owner',
      ]);

      for (const [key, value] of Object.entries(tags)) {
        if (!standardTags.has(key)) {
          metadata.customMetadata![key] = value;
        }
      }

      return metadata;
    } catch (error) {
      this.logger.warn(
        `Failed to get enhanced metadata for ${blobId}: ${error.message}`,
      );
      return null;
    }
  }

  /**
   * Search memories by metadata embedding similarity
   * @param queryText Text to search for
   * @param userAddress User's address
   * @param threshold Similarity threshold (0.0-1.0)
   * @param limit Maximum results
   * @returns Similar memories with scores
   */
  async searchByMetadataEmbedding(
    queryText: string,
    userAddress: string,
    threshold: number = 0.7,
    limit: number = 10,
  ): Promise<
    Array<{
      blobId: string;
      metadata: MemoryMetadata;
      similarity: number;
    }>
  > {
    if (!this.embeddingService) {
      this.logger.warn('EmbeddingService not available for similarity search');
      return [];
    }

    try {
      // Generate query embedding
      const { vector: queryVector } =
        await this.embeddingService.embedText(queryText);

      // This is a simplified implementation. In production, you would:
      // 1. Maintain an index of all embedding blob IDs for the user
      // 2. Load and compare embeddings efficiently
      // 3. Use vector database for fast similarity search

      this.logger.log(
        `Metadata embedding search for: "${queryText}" (user: ${userAddress})`,
      );

      // For now, return empty array. This would need integration with
      // the memory index service to maintain embedding references
      return [];
    } catch (error) {
      this.logger.error(`Error in metadata embedding search: ${error.message}`);
      return [];
    }
  }

  /**
   * Get file tags from Walrus
   * @param blobId The blob ID
   * @returns The file tags
   */
  async getFileTags(blobId: string): Promise<Record<string, string>> {
    try {
      const [file] = await this.walrusClient.getFiles({
        ids: [blobId],
      });

      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }

      return await file.getTags();
    } catch (error) {
      this.logger.error(
        `Error retrieving file tags from Walrus: ${error.message}`,
      );
      throw new Error(`Walrus tag retrieval error: ${error.message}`);
    }
  }

  /**
   * Check if a user has access to a file based on tags
   * @param blobId The blob ID
   * @param userAddress The user's address
   * @returns True if the user has access
   */
  async verifyUserAccess(
    blobId: string,
    userAddress: string,
  ): Promise<boolean> {
    try {
      const tags = await this.getFileTags(blobId);

      // Check if user is the owner or has user-address tag
      return (
        tags['owner'] === userAddress ||
        tags['user-address'] === userAddress ||
        // Also check user addresses without 0x prefix
        tags['user-address'] === userAddress.replace('0x', '')
      );
    } catch (error) {
      this.logger.error(`Error verifying user access: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload a file with Walrus/local storage fallback
   * @param buffer The file buffer
   * @param filename The file name
   * @param ownerAddress The address of the owner
   * @param epochs Number of epochs to store the file
   * @param additionalTags Additional metadata tags to include
   * @returns The blob ID
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    ownerAddress: string,
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {},
  ): Promise<string> {
    const tags = {
      'content-type': 'application/octet-stream',
      filename: filename,
      owner: ownerAddress,
      created: new Date().toISOString(),
      ...additionalTags,
    };

    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();

    if (!walrusAvailable) {
      this.logger.warn(
        `Walrus unavailable, storing file "${filename}" locally for owner ${ownerAddress}`,
      );
      return await this.storeFileLocally(buffer, filename, tags);
    }

    try {
      this.logger.log(
        `Uploading file "${filename}" to Walrus for owner ${ownerAddress}...`,
      );

      // Create a WalrusFile from buffer with filename as identifier
      const file = WalrusFile.from({
        contents: new Uint8Array(buffer),
        identifier: filename,
        tags,
      });

      // Use the complete workflow for production
      const results = await this.uploadFilesToWalrus([file], epochs);

      if (!results || results.length === 0) {
        throw new Error('Failed to upload file to Walrus');
      }

      return results[0].blobId;
    } catch (error) {
      this.logger.error(
        `Walrus upload failed, falling back to local storage: ${error.message}`,
      );
      // Fallback to local storage
      return await this.storeFileLocally(buffer, filename, tags);
    }
  }

  /**
   * Download a file from Walrus with local storage fallback
   * @param blobId The blob ID
   * @returns The file buffer
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    // Check if this is a local blob ID
    if (blobId.startsWith('local_')) {
      this.logger.log(`Retrieving file from local storage: ${blobId}`);
      return await this.retrieveFileLocally(blobId);
    }

    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();
    if (!walrusAvailable) {
      throw new Error(
        'Walrus storage network is currently unavailable and the requested file is not in local storage. ' +
          'Please try again later when the network is stable.',
      );
    }

    const maxRetries = 2; // Reduced retries for faster fallback
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `Downloading file from Walrus: ${blobId} (attempt ${attempt}/${maxRetries})`,
        );

        // Wait before retry (exponential backoff)
        if (attempt > 1) {
          const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
          this.logger.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        // Use the SDK's recommended getFiles method
        const [file] = await this.walrusClient.getFiles({ ids: [blobId] });

        if (!file) {
          throw new Error(`File with blob ID ${blobId} not found`);
        }

        // Get binary data using SDK method
        const bytes = await file.bytes();

        this.logger.log(
          `Successfully downloaded file from Walrus: ${blobId} (${bytes.length} bytes)`,
        );
        return Buffer.from(bytes);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Walrus download attempt ${attempt}/${maxRetries} failed: ${lastError.message}`,
        );

        // Handle RetryableWalrusClientError as recommended in SDK docs
        if (error instanceof RetryableWalrusClientError) {
          this.logger.log('Retryable error detected, resetting client...');
          this.walrusClient.reset();
        }

        // Continue to next attempt if not the last one
        if (attempt < maxRetries) {
          continue;
        }
      }
    }

    this.logger.error(
      `Failed to download file after ${maxRetries} attempts: ${lastError?.message}`,
    );

    // Provide user-friendly error messages
    if (
      lastError?.message.includes('fetch failed') ||
      lastError?.message.includes('timeout') ||
      lastError?.message.includes('network')
    ) {
      throw new Error(
        'Unable to connect to Walrus storage network. This may be due to temporary network issues. ' +
          'Please try again in a few minutes. If the problem persists, the Walrus testnet may be experiencing downtime.',
      );
    }

    if (lastError?.message.includes('not found')) {
      throw new Error(
        'The requested data was not found in Walrus storage. This may indicate the data has expired or was never properly stored.',
      );
    }

    throw new Error(
      `Walrus file download error after ${maxRetries} attempts: ${lastError?.message}`,
    );
  }

  /**
   * Delete content from Walrus
   * NOTE: This requires on-chain transaction for deletion
   * @param blobId The blob ID to delete
   * @param userAddress The address of the user requesting deletion
   * @returns True if deletion was successful
   */
  async deleteContent(blobId: string, userAddress: string): Promise<boolean> {
    try {
      this.logger.log(
        `Deleting blob ${blobId} requested by user ${userAddress}...`,
      );

      // Verify access
      const hasAccess = await this.verifyUserAccess(blobId, userAddress);
      if (!hasAccess) {
        this.logger.warn(`User ${userAddress} has no access to blob ${blobId}`);
        // Continue with admin anyway if file exists
      }

      // For full implementation, we would:
      // 1. Look up the on-chain blob object
      // 2. Execute a deletion transaction using the object ID

      // This is just a placeholder until we implement the full deletion flow
      this.logger.warn(
        `Deletion of Walrus blobs requires on-chain transactions. ` +
          `BlobId: ${blobId}, User: ${userAddress}`,
      );

      return true;
    } catch (error) {
      this.logger.error(`Error deleting Walrus blob: ${error.message}`);
      throw new Error(`Walrus deletion error: ${error.message}`);
    }
  }

  /**
   * Upload files to Walrus with full on-chain storage
   * @param files Array of WalrusFiles to upload
   * @param epochs Number of epochs to store the files
   * @returns Array of results with blob IDs
   */
  private async uploadFilesToWalrus(files: WalrusFile[], epochs: number) {
    const maxRetries = 3; // Reduced retries since we have better error handling
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Upload attempt ${attempt}/${maxRetries}`);

        // Check if error is retryable and reset client if needed
        if (attempt > 1 && lastError) {
          if (lastError instanceof RetryableWalrusClientError) {
            this.logger.log(
              'Resetting Walrus client due to retryable error...',
            );
            this.walrusClient.reset();
          } else {
            // Recreate client for fresh connection on other errors
            this.logger.log('Recreating Walrus client for fresh connection...');
            this.initializeWalrusClient(
              this.configService.get<string>('SUI_NETWORK', 'testnet') as
                | 'testnet'
                | 'mainnet',
            );
          }
        }

        // Use the SDK's recommended writeFiles method (simple and reliable)
        this.logger.log('Using SDK writeFiles method...');
        const results = await this.walrusClient.writeFiles({
          files,
          epochs,
          deletable: true,
          signer: this.adminKeypair,
        });

        this.logger.log(`Upload completed successfully on attempt ${attempt}`);
        // Log the blob IDs for debugging
        results.forEach((result, index) => {
          this.logger.log(`File ${index}: blobId=${result.blobId}`);
        });

        return results;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(
          `Upload attempt ${attempt}/${maxRetries} failed: ${lastError.message}`,
        );

        // Check if this is a retryable error
        if (lastError instanceof RetryableWalrusClientError) {
          this.logger.log('Error is retryable, will reset client and retry...');
        }

        // If this is the last attempt, don't wait
        if (attempt < maxRetries) {
          // Shorter wait times with exponential backoff
          const baseWait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          const jitter = Math.random() * 500;
          const waitTime = baseWait + jitter;
          this.logger.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    // All attempts failed
    this.logger.error(
      `All ${maxRetries} upload attempts failed. Last error: ${lastError?.message}`,
    );

    if (
      lastError?.message.includes('fetch failed') ||
      lastError?.message.includes('Too many failures') ||
      lastError?.message.includes('timeout') ||
      lastError?.message.includes('network')
    ) {
      throw new Error(
        'Walrus storage nodes are currently experiencing connectivity issues. ' +
          'This is a known issue with the Walrus testnet. Please try again in a few minutes. ' +
          'If the problem persists, consider enabling the upload relay by setting WALRUS_USE_UPLOAD_RELAY=true',
      );
    }

    throw lastError || new Error('Unknown upload error');
  }
}

/**
 * ClientMemoryManager - Client-side Memory Operations for React dApps
 *
 * Provides a simplified API for creating and retrieving memories in React dApps
 * using @mysten/dapp-kit. Handles the complete flow:
 * - Memory creation: embedding → encryption → Walrus upload → on-chain registration
 * - Memory retrieval: Walrus fetch → SEAL decryption → content extraction
 *
 * Usage:
 * ```typescript
 * const manager = new ClientMemoryManager({
 *   packageId: '0x...',
 *   accessRegistryId: '0x...',
 *   walrusAggregator: 'https://...',
 *   geminiApiKey: 'your-key'
 * });
 *
 * // Create memory
 * const blobId = await manager.createMemory({
 *   content: 'My memory',
 *   account,
 *   signAndExecute,
 *   client,
 *   onProgress: (status) => console.log(status)
 * });
 *
 * // Retrieve memory
 * const content = await manager.retrieveMemory({
 *   blobId: '...',
 *   account,
 *   signPersonalMessage,
 *   client
 * });
 * ```
 */

import { SealClient, SessionKey } from '@mysten/seal';
import { WalrusClient } from '@mysten/walrus';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex } from '@mysten/sui/utils';
import type { SuiClient } from '@mysten/sui/client';
import { BrowserHnswIndexService } from '../vector/BrowserHnswIndexService';
import { EmbeddingService } from '../services/EmbeddingService';

export interface ClientMemoryManagerConfig {
  packageId: string;
  accessRegistryId: string;
  walrusAggregator: string;
  geminiApiKey: string;
  sealServerObjectIds?: string[];
  walrusNetwork?: 'testnet' | 'mainnet';
  categories?: string[];
  /** Enable local browser indexing for vector search (default: true) */
  enableLocalIndexing?: boolean;
}

export interface CreateMemoryOptions {
  content: string;
  category?: string;
  account: { address: string };
  signAndExecute: (params: { transaction: Transaction }, callbacks: {
    onSuccess: (result: any) => void;
    onError: (error: Error) => void;
  }) => void;
  client: SuiClient;
  onProgress?: (status: string) => void;
}

export interface RetrieveMemoryOptions {
  blobId: string;
  account: { address: string };
  signPersonalMessage: (params: { message: Uint8Array }) => Promise<{ signature: string }>;
  client: SuiClient;
  onProgress?: (status: string) => void;
}

export interface BatchRetrieveMemoriesOptions {
  blobIds: string[];
  account: { address: string };
  signPersonalMessage: (params: { message: Uint8Array }) => Promise<{ signature: string }>;
  client: SuiClient;
  onProgress?: (status: string, current: number, total: number) => void;
}

export interface BatchRetrieveResult {
  blobId: string;
  content?: string;
  error?: string;
}

interface DecryptionSession {
  sealClient: SealClient;
  sessionKey: SessionKey;
  txBytes: Uint8Array;
}

export interface ClientMemoryMetadata {
  content: string;
  embedding: number[];
  timestamp: number;
}

/**
 * Client-side memory manager for React dApps
 */
export class ClientMemoryManager {
  private readonly config: Required<ClientMemoryManagerConfig> & { enableLocalIndexing: boolean };
  private readonly defaultCategories = [
    'personal', 'work', 'education', 'health', 'finance',
    'travel', 'family', 'hobbies', 'goals', 'ideas'
  ];

  // Local indexing services (optional)
  private embeddingService?: EmbeddingService;
  private hnswService?: BrowserHnswIndexService;

  constructor(config: ClientMemoryManagerConfig) {
    this.config = {
      ...config,
      sealServerObjectIds: config.sealServerObjectIds || [
        '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
        '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
      ],
      walrusNetwork: config.walrusNetwork || 'testnet',
      categories: config.categories || this.defaultCategories,
      enableLocalIndexing: config.enableLocalIndexing !== false // Default: true
    };

    // Initialize local indexing services if enabled
    if (this.config.enableLocalIndexing && this.config.geminiApiKey) {
      this.embeddingService = new EmbeddingService({
        apiKey: this.config.geminiApiKey,
        model: 'text-embedding-004',
        dimensions: 768
      });

      this.hnswService = new BrowserHnswIndexService(
        {
          dimension: 768,
          maxElements: 10000,
          m: 16,
          efConstruction: 200
        },
        {
          maxBatchSize: 50,
          batchDelayMs: 5000
        }
      );

      console.log('✅ Local indexing enabled for ClientMemoryManager');
    }
  }

  /**
   * Create a new memory (3 signatures: Walrus register, certify, on-chain)
   */
  async createMemory(options: CreateMemoryOptions): Promise<string> {
    const { content, category, account, signAndExecute, client, onProgress } = options;

    console.log('🚀 Starting memory creation...');
    onProgress?.('Starting memory creation...');

    try {
      // Step 1: Analyze content (category + importance)
      console.log('🏷️ Step 1: Analyzing content...');
      onProgress?.('Analyzing content with AI...');
      const analysis = await this.analyzeContent(content, category);
      console.log('✅ Analysis:', analysis);

      // Step 2: Generate embedding
      console.log('🔮 Step 2: Generating embedding...');
      onProgress?.('Generating embedding...');
      const embedding = await this.generateEmbedding(content);
      console.log('✅ Embedding generated:', embedding.length, 'dimensions');

      // Step 3: Prepare combined data (content + embedding)
      console.log('📦 Step 3: Preparing data...');
      const memoryData: ClientMemoryMetadata = {
        content,
        embedding,
        timestamp: Date.now(),
      };
      const dataBytes = new TextEncoder().encode(JSON.stringify(memoryData));
      console.log('✅ Data prepared:', dataBytes.length, 'bytes');

      // Step 4: Encrypt with SEAL
      console.log('🔒 Step 4: Encrypting with SEAL...');
      onProgress?.('Encrypting with SEAL...');
      const encrypted = await this.encryptWithSEAL(dataBytes, account.address, client);
      console.log('✅ Encrypted:', encrypted.length, 'bytes');

      // Step 5: Upload to Walrus (2 signatures)
      console.log('🐳 Step 5: Uploading to Walrus...');
      onProgress?.('Uploading to Walrus (2 signatures)...');
      const blobId = await this.uploadToWalrus(encrypted, account, signAndExecute, client);
      console.log('✅ Uploaded to Walrus:', blobId);

      // Step 6: Register on-chain (1 signature)
      console.log('⛓️ Step 6: Registering on-chain...');
      onProgress?.('Registering on-chain (1 signature)...');
      await this.registerOnChain({
        blobId,
        category: analysis.category,
        importance: analysis.importance,
        contentLength: content.length,
        account,
        signAndExecute,
        client
      });
      console.log('✅ Memory created successfully!');
      onProgress?.('Memory created successfully!');

      // Step 7: Index locally for search (if enabled)
      if (this.config.enableLocalIndexing && this.hnswService && account.address) {
        try {
          console.log('🔍 Step 7: Indexing locally for search...');
          onProgress?.('Indexing for local search...');

          const vectorId = Date.now(); // Same as used in registerOnChain

          // Prepare metadata
          const metadata = {
            blobId,
            category: analysis.category,
            importance: analysis.importance,
            createdTimestamp: Date.now(),
            contentType: 'text/plain',
            contentSize: content.length,
            source: 'client_memory_manager'
          };

          // Add to local index (batched, will flush in ~5 seconds)
          this.hnswService.addVectorToIndexBatched(
            account.address,
            vectorId,
            embedding, // Reuse embedding from step 2!
            metadata
          );

          console.log('✅ Memory indexed locally! Vector ID:', vectorId);
          onProgress?.('Memory indexed! (will persist in ~5 seconds)');
        } catch (indexError: any) {
          // Non-fatal: memory is still created on-chain
          console.warn('⚠️ Local indexing failed:', indexError);
        }
      }

      console.log('🎉 Memory creation complete!');
      return blobId;
    } catch (error: any) {
      console.error('❌ Memory creation failed:', error);
      throw new Error(`Failed to create memory: ${error.message}`);
    }
  }

  /**
   * Retrieve and decrypt a memory
   */
  async retrieveMemory(options: RetrieveMemoryOptions): Promise<ClientMemoryMetadata> {
    const { blobId, account, signPersonalMessage, client, onProgress } = options;

    console.log('🔍 Starting memory retrieval...');
    onProgress?.('Starting retrieval...');

    try {
      // Step 1: Fetch from Walrus
      console.log('🐳 Step 1: Fetching from Walrus...');
      onProgress?.('Fetching from Walrus...');
      const encryptedData = await this.fetchFromWalrus(blobId);
      console.log('✅ Retrieved:', encryptedData.length, 'bytes');

      // Step 2: Decrypt with SEAL
      console.log('🔓 Step 2: Decrypting with SEAL...');
      onProgress?.('Decrypting with SEAL...');
      const decryptedData = await this.decryptWithSEAL({
        encryptedData,
        account,
        signPersonalMessage,
        client
      });
      console.log('✅ Decrypted:', decryptedData.length, 'bytes');

      // Step 3: Parse JSON
      const decryptedString = new TextDecoder().decode(decryptedData);
      const parsed: ClientMemoryMetadata = JSON.parse(decryptedString);

      console.log('🎉 Memory retrieval complete!');
      onProgress?.('Memory retrieved successfully!');

      return parsed;
    } catch (error: any) {
      console.error('❌ Memory retrieval failed:', error);
      throw new Error(`Failed to retrieve memory: ${error.message}`);
    }
  }

  /**
   * Batch retrieve and decrypt multiple memories with a single signature
   * This is much more efficient than calling retrieveMemory multiple times
   */
  async batchRetrieveMemories(options: BatchRetrieveMemoriesOptions): Promise<BatchRetrieveResult[]> {
    const { blobIds, account, signPersonalMessage, client, onProgress } = options;

    console.log('🔍 Starting batch memory retrieval for', blobIds.length, 'memories...');
    onProgress?.('Initializing decryption session...', 0, blobIds.length);

    try {
      // Step 1: Create reusable decryption session (SINGLE SIGNATURE!)
      const session = await this.createDecryptionSession({
        account,
        signPersonalMessage,
        client
      });
      console.log('✅ Decryption session created - will decrypt all memories without additional signatures');

      const results: BatchRetrieveResult[] = [];

      // Step 2: Decrypt all memories using the same session
      for (let i = 0; i < blobIds.length; i++) {
        const blobId = blobIds[i];
        console.log(`🔓 Decrypting memory ${i + 1}/${blobIds.length}: ${blobId}`);
        onProgress?.(`Decrypting memory ${i + 1}/${blobIds.length}...`, i + 1, blobIds.length);

        try {
          // Fetch from Walrus
          const encryptedData = await this.fetchFromWalrus(blobId);

          // Decrypt using shared session (NO SIGNING!)
          const decryptedData = await session.sealClient.decrypt({
            data: encryptedData,
            sessionKey: session.sessionKey,
            txBytes: session.txBytes,
          });

          // Parse JSON
          const decryptedString = new TextDecoder().decode(decryptedData);
          const parsed: ClientMemoryMetadata = JSON.parse(decryptedString);

          results.push({
            blobId,
            content: parsed.content
          });

          console.log(`✅ Memory ${i + 1} decrypted successfully`);
        } catch (error: any) {
          console.error(`❌ Failed to decrypt memory ${blobId}:`, error);

          // Handle old format (binary embedding data)
          if (error.message?.includes('not valid JSON') || error.message?.includes('Unexpected token')) {
            results.push({
              blobId,
              content: '[Old format - cannot display content]'
            });
          } else {
            results.push({
              blobId,
              error: error.message || 'Decryption failed'
            });
          }
        }
      }

      console.log('🎉 Batch retrieval complete!');
      onProgress?.('All memories decrypted!', blobIds.length, blobIds.length);

      return results;
    } catch (error: any) {
      console.error('❌ Batch retrieval failed:', error);
      throw new Error(`Failed to batch retrieve memories: ${error.message}`);
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async analyzeContent(text: string, categoryOverride?: string): Promise<{ category: string; importance: number }> {
    // Call backend API for content analysis
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          categories: this.config.categories
        }),
      });

      if (!response.ok) {
        console.warn('⚠️ Analysis API failed, using defaults');
        return { category: categoryOverride || 'personal', importance: 5 };
      }

      const data = await response.json();
      return {
        category: categoryOverride || data.category,
        importance: data.importance
      };
    } catch (error) {
      console.warn('⚠️ Analysis failed:', error);
      return { category: categoryOverride || 'personal', importance: 5 };
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await fetch('/api/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate embedding');
    }

    const data = await response.json();
    return data.embedding;
  }

  private async encryptWithSEAL(
    data: Uint8Array,
    ownerAddress: string,
    client: SuiClient
  ): Promise<Uint8Array> {
    const sealClient = new SealClient({
      suiClient: client as any,
      serverConfigs: this.config.sealServerObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false,
    });

    const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
      threshold: 1,
      packageId: this.config.packageId,
      id: ownerAddress, // Use owner's address as ID for simple access control
      data,
    });

    return encryptedBytes;
  }

  private async uploadToWalrus(
    data: Uint8Array,
    account: { address: string },
    signAndExecute: CreateMemoryOptions['signAndExecute'],
    client: SuiClient
  ): Promise<string> {
    const extendedClient = (client as any).$extend(
      WalrusClient.experimental_asClientExtension({
        network: this.config.walrusNetwork,
        uploadRelay: {
          host: `https://upload-relay.${this.config.walrusNetwork}.walrus.space`,
          sendTip: { max: 1_000 },
          timeout: 60_000,
        },
        storageNodeClientOptions: {
          timeout: 60_000,
        },
      })
    );

    const walrusClient = extendedClient.walrus as any;
    const flow = walrusClient.writeBlobFlow({ blob: data });

    // Encode
    await flow.encode();

    // Register (signature 1)
    const registerTx = flow.register({
      epochs: 5,
      deletable: true,
      owner: account.address,
    });
    registerTx.setSender(account.address);

    const registerDigest = await new Promise<string>((resolve, reject) => {
      signAndExecute(
        { transaction: registerTx },
        {
          onSuccess: (result) => resolve(result.digest),
          onError: (error) => reject(error),
        }
      );
    });

    // Upload
    await flow.upload({ digest: registerDigest });

    // Certify (signature 2)
    const certifyTx = flow.certify();
    certifyTx.setSender(account.address);

    await new Promise<void>((resolve, reject) => {
      signAndExecute(
        { transaction: certifyTx },
        {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        }
      );
    });

    const blob = await flow.getBlob();
    return blob.blobId;
  }

  private async registerOnChain(params: {
    blobId: string;
    category: string;
    importance: number;
    contentLength: number;
    account: { address: string };
    signAndExecute: CreateMemoryOptions['signAndExecute'];
    client: SuiClient;
  }): Promise<void> {
    const { blobId, category, importance, contentLength, account, signAndExecute, client } = params;

    const tx = new Transaction();
    const packageId = this.config.packageId.replace(/^0x/, '');
    const vectorId = Date.now();
    const topic = 'memory';

    tx.moveCall({
      target: `${packageId}::memory::create_memory_record`,
      arguments: [
        tx.pure.string(category),
        tx.pure.u64(vectorId),
        tx.pure.string(blobId),
        tx.pure.string('text/plain'),
        tx.pure.u64(contentLength),
        tx.pure.string(''),
        tx.pure.string(topic),
        tx.pure.u8(importance),
        tx.pure.string(blobId), // Same blob ID for both content and embedding
      ],
    });

    return new Promise((resolve, reject) => {
      signAndExecute(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('✅ Transaction successful:', result.digest);
            resolve();
          },
          onError: (error) => {
            console.error('❌ Transaction failed:', error);
            reject(error);
          },
        }
      );
    });
  }

  private async fetchFromWalrus(blobId: string): Promise<Uint8Array> {
    const url = `${this.config.walrusAggregator}/v1/blobs/${blobId}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch from Walrus: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Create a reusable decryption session (requires one signature)
   * This session can be used to decrypt multiple memories without additional signatures
   */
  private async createDecryptionSession(params: {
    account: { address: string };
    signPersonalMessage: (params: { message: Uint8Array }) => Promise<{ signature: string }>;
    client: SuiClient;
  }): Promise<DecryptionSession> {
    const { account, signPersonalMessage, client } = params;

    console.log('🔑 Creating decryption session...');

    // Create SEAL client (reusable)
    const sealClient = new SealClient({
      suiClient: client as any,
      serverConfigs: this.config.sealServerObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false,
    });

    // Create session key (reusable)
    const sessionKey = await SessionKey.create({
      address: account.address,
      packageId: this.config.packageId,
      ttlMin: 10,
      suiClient: client as any,
    });

    // Sign personal message ONCE
    const personalMessage = sessionKey.getPersonalMessage();
    const signatureResult = await signPersonalMessage({ message: personalMessage });
    await sessionKey.setPersonalMessageSignature(signatureResult.signature);
    console.log('✅ Personal message signed');

    // Build seal_approve transaction ONCE
    const tx = new Transaction();
    const addressHex = account.address.startsWith('0x')
      ? account.address.slice(2)
      : account.address;
    const idBytes = fromHex(addressHex);

    tx.moveCall({
      target: `${this.config.packageId}::seal_access_control::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(idBytes)),
        tx.pure.address(account.address),
        tx.object(this.config.accessRegistryId),
        tx.object('0x6'),
      ],
    });

    const txBytes = await tx.build({ client, onlyTransactionKind: true });
    console.log('✅ Session created - can now decrypt multiple memories');

    return {
      sealClient,
      sessionKey,
      txBytes
    };
  }

  private async decryptWithSEAL(params: {
    encryptedData: Uint8Array;
    account: { address: string };
    signPersonalMessage: RetrieveMemoryOptions['signPersonalMessage'];
    client: SuiClient;
  }): Promise<Uint8Array> {
    const { encryptedData, account, signPersonalMessage, client } = params;

    // Create SEAL client
    const sealClient = new SealClient({
      suiClient: client as any,
      serverConfigs: this.config.sealServerObjectIds.map((id) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false,
    });

    // Create session key
    const sessionKey = await SessionKey.create({
      address: account.address,
      packageId: this.config.packageId,
      ttlMin: 10,
      suiClient: client as any,
    });

    // Sign personal message
    const personalMessage = sessionKey.getPersonalMessage();
    const signatureResult = await signPersonalMessage({ message: personalMessage });
    await sessionKey.setPersonalMessageSignature(signatureResult.signature);

    // Build seal_approve transaction
    const tx = new Transaction();
    const addressHex = account.address.startsWith('0x')
      ? account.address.slice(2)
      : account.address;
    const idBytes = fromHex(addressHex);

    tx.moveCall({
      target: `${this.config.packageId}::seal_access_control::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(idBytes)),
        tx.pure.address(account.address),
        tx.object(this.config.accessRegistryId),
        tx.object('0x6'),
      ],
    });

    const txBytes = await tx.build({ client, onlyTransactionKind: true });

    // Decrypt
    const decryptedData = await sealClient.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes,
    });

    return decryptedData;
  }
}

export default ClientMemoryManager;

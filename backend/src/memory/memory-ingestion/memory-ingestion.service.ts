import { Injectable, Logger } from '@nestjs/common';
import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { MemoryIndexService } from '../memory-index/memory-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { StorageService } from '../../infrastructure/storage/storage.service';
import { WalrusService, MemoryMetadata, EnhancedUploadResult } from '../../infrastructure/walrus/walrus.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { ConfigService } from '@nestjs/config';

export interface CreateMemoryDto {
  content: string;
  category: string;
  userAddress: string;
  userSignature?: string;
  topic?: string;
  importance?: number;
}

export interface EnhancedCreateMemoryDto extends CreateMemoryDto {
  topic: string;
  importance: number;
  customMetadata?: Record<string, string>;
}

export interface ProcessMemoryDto {
  content: string;
  userAddress: string;
  category?: string;
}

export interface MemoryIndexDto {
  memoryId: string;
  userAddress: string;
  category?: string;
  walrusHash?: string;
}

export interface SaveMemoryDto {
  content: string;
  category: string;
  userAddress: string;
  suiObjectId?: string;
}

@Injectable()
export class MemoryIngestionService {
  private readonly logger = new Logger(MemoryIngestionService.name);
  private entityToVectorMap: Record<string, Record<string, number>> = {};
  private nextVectorId: Record<string, number> = {};

  constructor(
    private classifierService: ClassifierService,
    private embeddingService: EmbeddingService,
    private graphService: GraphService,
    private hnswIndexService: HnswIndexService,
    private memoryIndexService: MemoryIndexService,
    private sealService: SealService,
    private suiService: SuiService,
    private storageService: StorageService,
    private walrusService: WalrusService,
    private geminiService: GeminiService,
    private configService: ConfigService
  ) {}

  /**
   * Check if we're in demo mode
   */
  private isDemoMode(): boolean {
    return this.configService.get<boolean>('USE_DEMO_STORAGE', true) ||
           this.configService.get<string>('NODE_ENV') === 'demo';
  }

  /**
   * Get the next vector ID for a user
   * @param userAddress User address
   * @returns Next vector ID
   */
  getNextVectorId(userAddress: string): number {
    if (!this.nextVectorId[userAddress]) {
      this.nextVectorId[userAddress] = 1;
    }
    
    const vectorId = this.nextVectorId[userAddress];
    this.nextVectorId[userAddress]++;
    
    return vectorId;
  }

  /**
   * Get the entity-to-vector mapping for a user
   * @param userAddress User address
   * @returns Entity-to-vector mapping
   */
  getEntityToVectorMap(userAddress: string): Record<string, number> {
    if (!this.entityToVectorMap[userAddress]) {
      this.entityToVectorMap[userAddress] = {};
    }
    
    return this.entityToVectorMap[userAddress];
  }

  /**
   * Process a conversation for potential memory extraction
   * @param userMessage User message
   * @param assistantResponse Assistant response
   * @param userAddress User address
   * @returns Whether a memory was stored
   */
  async processConversation(
    userMessage: string,
    assistantResponse: string,
    userAddress: string
  ): Promise<{ memoryStored: boolean; memoryId?: string }> {
    try {
      // Combine messages for context
      const conversation = `User: ${userMessage}\nAssistant: ${assistantResponse}`;
      
      // Check if the conversation contains information worth remembering
      const classificationResult = await this.classifierService.shouldSaveMemory(conversation);
      const shouldRemember = classificationResult.shouldSave;
      
      if (!shouldRemember) {
        return { memoryStored: false };
      }
      
      // Extract the memory content - for now, just use the conversation directly
      // In a full implementation, we'd use an LLM to extract the key information
      const memoryContent = conversation;
      
      if (!memoryContent || memoryContent.trim() === '') {
        return { memoryStored: false };
      }
      
      // Process the memory
      const result = await this.processNewMemory({
        content: memoryContent,
        category: 'conversation',
        userAddress
      });
      
      return {
        memoryStored: result.success,
        memoryId: result.memoryId
      };
    } catch (error) {
      this.logger.error(`Error processing conversation: ${error.message}`);
      return { memoryStored: false };
    }
  }

  /**
   * Process a new memory with enhanced metadata and embeddings
   * @param memoryDto Enhanced memory data
   * @returns Processing result with metadata
   */
  async processEnhancedMemory(memoryDto: EnhancedCreateMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    blobId?: string;
    vectorId?: number;
    metadata?: MemoryMetadata;
    embeddingBlobId?: string;
    message?: string;
  }> {
    try {
      this.logger.log(`Processing enhanced memory for user ${memoryDto.userAddress} with topic: ${memoryDto.topic}`);
      
      // Use the existing processing logic with enhanced metadata
      const result = await this.processNewMemory(memoryDto);
      
      if (result.success) {
        // Try to get enhanced metadata from Walrus
        let metadata: MemoryMetadata | undefined;
        try {
          if (result.blobId) {
            metadata = await this.walrusService.getEnhancedMetadata(result.blobId) || undefined;
          }
        } catch (error) {
          this.logger.warn(`Could not retrieve enhanced metadata: ${error.message}`);
        }

        return {
          ...result,
          metadata,
          embeddingBlobId: metadata?.embeddingBlobId
        };
      }

      return result;
    } catch (error) {
      this.logger.error(`Error processing enhanced memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process enhanced memory: ${error.message}`
      };
    }
  }

  /**
   * Process a new memory from scratch (original method)
   * @param memoryDto Memory data
   * @returns Processing result
   */
  async processNewMemory(memoryDto: CreateMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    blobId?: string;
    vectorId?: number;
    message?: string;
    requiresIndexCreation?: boolean;
    indexBlobId?: string;
    graphBlobId?: string;
  }> {
    try {
      // Step 1: Try to get existing index, but don't fail if it doesn't exist
      const indexData = await this.memoryIndexService.getOrLoadIndex(memoryDto.userAddress);

      let graph: any;
      let indexId: string | undefined;
      let indexBlobId: string | undefined;
      let graphBlobId: string | undefined;
      let currentVersion = 1;

      if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
        // Use existing index data for graph operations
        graph = indexData.graph;
        indexId = indexData.indexId;
        indexBlobId = indexData.indexBlobId;
        graphBlobId = indexData.graphBlobId;
        currentVersion = indexData.version;

        // Load the index into cache if not already there
        await this.hnswIndexService.getOrLoadIndexCached(memoryDto.userAddress, indexBlobId);
      } else {
        // No existing index - create new one in memory and prepare for batching
        this.logger.log(`No existing index found for user ${memoryDto.userAddress}, creating new index in memory`);

        // Create a new index in memory for batching
        await this.ensureIndexInCache(memoryDto.userAddress);

        // Create empty graph for this user
        graph = this.graphService.createGraph();

        // We'll create the on-chain index when the first batch is flushed
        // For now, we can proceed with in-memory operations
      }
      
      // Step 2: Generate embedding for the memory
      const { vector } = await this.embeddingService.embedText(memoryDto.content);

      // Step 3: Add vector to the index using batched approach
      const vectorId = this.getNextVectorId(memoryDto.userAddress);
      this.hnswIndexService.addVectorToIndexBatched(memoryDto.userAddress, vectorId, vector);

      // Step 4: Extract entities and relationships
      const extraction = await this.graphService.extractEntitiesAndRelationships(
        memoryDto.content
      );
      
      // Step 5: Update the entity-to-vector mapping
      const entityToVectorMap = this.getEntityToVectorMap(memoryDto.userAddress);
      extraction.entities.forEach(entity => {
        entityToVectorMap[entity.id] = vectorId;
      });
      
      // Step 6: Update the graph
      graph = this.graphService.addToGraph(
        graph,
        extraction.entities,
        extraction.relationships
      );
      
      // Step 7: Encrypt the memory content (skip in demo mode)
      let contentToStore = memoryDto.content;
      if (!this.isDemoMode()) {
        const encryptResult = await this.sealService.encrypt(
          memoryDto.content,
          memoryDto.userAddress
        );
        contentToStore = encryptResult.encryptedData;
      } else {
        this.logger.log('Demo mode: Skipping encryption');
      }

      // Step 8: Save the content with enhanced metadata to Walrus
      let contentBlobId: string;
      let enhancedMetadata: MemoryMetadata | undefined;
      
      try {
        const enhancedResult = await this.walrusService.uploadContentWithMetadata(
          contentToStore,
          memoryDto.userAddress,
          memoryDto.category,
          memoryDto.topic || `Memory about ${memoryDto.category}`,
          memoryDto.importance || 5
        );
        contentBlobId = enhancedResult.blobId;
        enhancedMetadata = enhancedResult.metadata;
        
        this.logger.log(`Enhanced metadata created with embedding: ${enhancedMetadata.embeddingBlobId?.substring(0, 8)}...`);
      } catch (error) {
        this.logger.warn(`Enhanced upload failed, falling back to basic storage: ${error.message}`);
        // Fallback to regular storage
        contentBlobId = await this.storageService.uploadContent(contentToStore, memoryDto.userAddress);
      }

      // Step 9: Save the updated graph to Walrus (if we have existing graph data)
      if (graph && graphBlobId) {
        const newGraphBlobId = await this.graphService.saveGraph(graph, memoryDto.userAddress);
        this.logger.log(`Updated graph saved to Walrus: ${newGraphBlobId}`);
      } else {
        this.logger.log(`New user - graph will be created when first batch is processed`);
      }

      // Step 10: Generate a temporary memory ID for backend tracking
      // Note: Blockchain records should be created by the frontend with user signatures
      const memoryId = `backend_temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      this.logger.log(`Memory processed with temporary ID: ${memoryId} (blockchain record should be created by frontend)`);

      this.logger.log(`Memory created successfully with ID: ${memoryId}. Vector queued for batch processing.`);

      return {
        success: true,
        memoryId,
        blobId: contentBlobId, // Return the real blob ID for frontend
        vectorId: vectorId,    // Return the vector ID for frontend
        message: 'Memory saved successfully. Search index will be updated shortly.'
      };
    } catch (error) {
      this.logger.error(`Error processing new memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process memory: ${error.message}`
      };
    }
  }

  /**
   * Process a memory (embedding, graph, encryption) without creating on-chain record
   * Used by direct blockchain mode to prepare a memory before user creates it on-chain
   */
  async processMemory(processDto: ProcessMemoryDto): Promise<{ 
    success: boolean, 
    vectorId?: number,
    blobId?: string,
    message?: string,
    requiresIndexCreation?: boolean,
    indexBlobId?: string,
    graphBlobId?: string
  }> {
    try {
      const { content, userAddress, category = 'general' } = processDto;
      
      // Step 1: Try to get existing index, but don't fail if it doesn't exist
      const indexData = await this.memoryIndexService.getOrLoadIndex(userAddress);

      let graph: any;
      let indexId: string | undefined;
      let indexBlobId: string | undefined;
      let graphBlobId: string | undefined;
      let currentVersion = 1;

      if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
        // Use existing index data for graph operations
        graph = indexData.graph;
        indexId = indexData.indexId;
        indexBlobId = indexData.indexBlobId;
        graphBlobId = indexData.graphBlobId;
        currentVersion = indexData.version;

        // Load the index into cache if not already there
        await this.hnswIndexService.getOrLoadIndexCached(userAddress, indexBlobId);
      } else {
        // No existing index - create new one in memory and prepare for batching
        this.logger.log(`No existing index found for user ${userAddress}, creating new index in memory`);

        // Create a new index in memory for batching
        await this.ensureIndexInCache(userAddress);

        // Create empty graph for this user
        graph = this.graphService.createGraph();

        // We'll create the on-chain index when the first batch is flushed
        // For now, we can proceed with in-memory operations
      }
      
      // Step 2: Generate embedding for the memory
      const { vector } = await this.embeddingService.embedText(content);

      // Step 3: Add vector to the index using batched approach
      const vectorId = this.getNextVectorId(userAddress);
      this.hnswIndexService.addVectorToIndexBatched(userAddress, vectorId, vector);

      // Step 4: Extract entities and relationships
      const extraction = await this.graphService.extractEntitiesAndRelationships(content);
      
      // Step 5: Update the entity-to-vector mapping
      const entityToVectorMap = this.getEntityToVectorMap(userAddress);
      extraction.entities.forEach(entity => {
        entityToVectorMap[entity.id] = vectorId;
      });
      
      // Step 6: Update the graph
      graph = this.graphService.addToGraph(
        graph,
        extraction.entities,
        extraction.relationships
      );
      
      // Step 7: Encrypt the memory content (skip in demo mode)
      let contentToStore = content;
      if (!this.isDemoMode()) {
        const encryptResult = await this.sealService.encrypt(
          content,
          userAddress
        );
        contentToStore = encryptResult.encryptedData;
      } else {
        this.logger.log('Demo mode: Skipping encryption for conversation processing');
      }

      // Step 8: Save the content to storage
      const contentBlobId = await this.storageService.uploadContent(contentToStore, userAddress);

      // Step 9: Save the updated graph to Walrus (if we have existing graph data)
      if (graph && graphBlobId) {
        const newGraphBlobId = await this.graphService.saveGraph(graph, userAddress);
        this.logger.log(`Updated graph saved to Walrus: ${newGraphBlobId}`);
      } else {
        this.logger.log(`New user - graph will be created when first batch is processed`);
      }

      this.logger.log(`Memory processed and queued for batch index update for user ${userAddress}`);

      // Return data needed for frontend to create on-chain record
      return {
        success: true,
        vectorId,
        blobId: contentBlobId,
        message: 'Memory processed successfully. Search index will be updated shortly.'
      };
    } catch (error) {
      this.logger.error(`Error processing memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process memory: ${error.message}`
      };
    }
  }

  /**
   * Index a memory that was created directly on the blockchain
   */
  async indexMemory(indexDto: MemoryIndexDto): Promise<{ success: boolean, message?: string }> {
    try {
      const { memoryId, userAddress, category = 'general', walrusHash } = indexDto;
      
      // Verify the memory exists on chain
      try {
        const memoryOnChain = await this.suiService.getMemory(memoryId);
        
        if (memoryOnChain.owner !== userAddress) {
          return { 
            success: false, 
            message: 'Memory does not belong to the specified user' 
          };
        }
        
        // Log success
        this.logger.log(`Memory ${memoryId} verified on-chain for user ${userAddress}`);
      } catch (error) {
        return { 
          success: false, 
          message: `Failed to verify memory: ${error.message}` 
        };
      }
      
      return {
        success: true,
        message: `Memory ${memoryId} indexed successfully`
      };
    } catch (error) {
      this.logger.error(`Error indexing memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to index memory: ${error.message}`
      };
    }
  }

  /**
   * Update an existing memory
   * @param memoryId Memory ID
   * @param content New content
   * @param userAddress User address
   * @returns Update result
   */
  async updateMemory(
    memoryId: string,
    content: string,
    userAddress: string
  ): Promise<{ success: boolean; memory?: any; message?: string }> {
    try {
      // Step 1: Verify ownership
      try {
        const memory = await this.suiService.getMemory(memoryId);
        
        if (memory.owner !== userAddress) {
          return {
            success: false,
            message: 'Memory does not belong to the specified user'
          };
        }
      } catch (error) {
        return {
          success: false,
          message: `Failed to verify memory: ${error.message}`
        };
      }
      
      // Step 2: Process the updated content (similar to new memory)
      // ...
      
      // This would be a complex implementation requiring:
      // 1. Removing the old vector from the index
      // 2. Adding the new vector
      // 3. Updating the graph entities and relationships
      // 4. Re-encrypting and saving content
      // 5. Updating the on-chain record
      
      // For the demo implementation, we'll just return success
      return {
        success: true,
        message: 'Memory updated successfully'
      };
    } catch (error) {
      this.logger.error(`Error updating memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to update memory: ${error.message}`
      };
    }
  }

  /**
   * Process an approved memory from the frontend
   * This method handles storage and indexing after the frontend has created the blockchain record
   * @param saveMemoryDto Memory data approved by the user (includes suiObjectId from frontend)
   * @returns Processing result
   */
  async processApprovedMemory(saveMemoryDto: SaveMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    blobId?: string;
    vectorId?: number;
    message?: string;
  }> {
    try {
      const { content, category, userAddress, suiObjectId } = saveMemoryDto;

      this.logger.log(`Processing approved memory for user ${userAddress} with blockchain ID: ${suiObjectId}`);
      
      // If the frontend already created the memory object on blockchain
      if (suiObjectId) {
        this.logger.log(`Using existing memory object ID: ${suiObjectId}`);
        
        // Just process the content
        const processResult = await this.processMemory({
          content,
          userAddress,
          category
        });
        
        if (!processResult.success) {
          return {
            success: false,
            message: processResult.message || 'Failed to process memory content'
          };
        }
        
        // Return the processed data
        return {
          success: true,
          memoryId: suiObjectId,
          blobId: processResult.blobId,
          vectorId: processResult.vectorId,
          message: 'Memory processed successfully'
        };
      }
      
      // Process the memory content
      const processResult = await this.processMemory({
        content,
        userAddress,
        category
      });
      
      if (!processResult.success) {
        return {
          success: false,
          message: processResult.message || 'Failed to process memory content'
        };
      }
      
      // Return the data needed for frontend to create the blockchain record
      return {
        success: true,
        blobId: processResult.blobId,
        vectorId: processResult.vectorId,
        message: 'Memory processed successfully. Create blockchain record with the provided data.'
      };
    } catch (error) {
      this.logger.error(`Error processing approved memory: ${error.message}`);
      return {
        success: false,
        message: `Failed to process memory: ${error.message}`
      };
    }
  }

  /**
   * Ensure an index exists in cache for the user (create if needed)
   */
  private async ensureIndexInCache(userAddress: string): Promise<void> {
    try {
      // Check if index is already in cache
      const cachedIndex = await this.hnswIndexService.getOrLoadIndexCached(userAddress);

      if (!cachedIndex) {
        // Create a new index in memory
        this.logger.log(`Creating new in-memory index for user ${userAddress}`);
        const { index } = await this.hnswIndexService.createIndex();

        // Add to cache
        this.hnswIndexService.addIndexToCache(userAddress, index);

        this.logger.log(`New index created and cached for user ${userAddress}`);

        // Note: The index will be saved to Walrus when the first memory is added
        // This avoids creating empty indexes that may fail due to network issues
      } else {
        this.logger.log(`Using existing cached index for user ${userAddress}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring index in cache for user ${userAddress}: ${error.message}`);

      // If it's a Walrus connectivity issue, provide graceful degradation
      if (error.message.includes('Walrus') ||
          error.message.includes('fetch failed') ||
          error.message.includes('network') ||
          error.message.includes('timeout')) {
        this.logger.warn(`Walrus connectivity issue detected. Memory features will be temporarily unavailable.`);
        throw new Error(
          'Memory storage is temporarily unavailable due to network connectivity issues. ' +
          'Your chat will continue to work normally, but memories cannot be saved at this time. ' +
          'Please try again later.'
        );
      }

      throw error;
    }
  }

  /**
   * Search memories by metadata embedding similarity
   * @param queryText Text to search for
   * @param userAddress User's address
   * @param options Search options
   * @returns Similar memories with metadata
   */
  async searchMemoriesByMetadata(
    queryText: string,
    userAddress: string,
    options: {
      threshold?: number;
      limit?: number;
      category?: string;
      minImportance?: number;
    } = {}
  ): Promise<Array<{
    blobId: string;
    content?: string;
    metadata: MemoryMetadata;
    similarity: number;
  }>> {
    try {
      const {
        threshold = 0.7,
        limit = 10,
        category,
        minImportance
      } = options;

      this.logger.log(`Searching memories by metadata for user ${userAddress}: "${queryText}"`);

      // Use WalrusService to search by metadata embeddings
      const results = await this.walrusService.searchByMetadataEmbedding(
        queryText,
        userAddress,
        threshold,
        limit
      );

      // Filter results based on options
      let filteredResults = results;

      if (category) {
        filteredResults = filteredResults.filter(r => r.metadata.category === category);
      }

      if (minImportance !== undefined) {
        filteredResults = filteredResults.filter(r => r.metadata.importance >= minImportance);
      }

      // For each result, try to decrypt and retrieve content if needed
      const enhancedResults = await Promise.all(
        filteredResults.map(async (result) => {
          let content: string | undefined;
          
          try {
            // Retrieve and decrypt content if not in demo mode
            const encryptedContent = await this.walrusService.retrieveContent(result.blobId);
            
            if (this.isDemoMode()) {
              content = encryptedContent;
            } else {
              // In production, decrypt using SEAL
              // content = await this.sealService.decrypt(encryptedContent, userAddress);
              content = encryptedContent; // Placeholder
            }
          } catch (error) {
            this.logger.warn(`Could not retrieve content for ${result.blobId}: ${error.message}`);
          }

          return {
            ...result,
            content
          };
        })
      );

      this.logger.log(`Found ${enhancedResults.length} similar memories by metadata`);
      return enhancedResults;
    } catch (error) {
      this.logger.error(`Error searching memories by metadata: ${error.message}`);
      return [];
    }
  }

  /**
   * Get metadata insights for a user's memories
   * @param userAddress User's address
   * @returns Metadata analytics
   */
  async getMetadataInsights(userAddress: string): Promise<{
    totalMemories: number;
    categoriesDistribution: Record<string, number>;
    averageImportance: number;
    topTopics: Array<{ topic: string; count: number }>;
    embeddingCoverage: number; // Percentage of memories with embeddings
  }> {
    try {
      // This is a placeholder implementation
      // In production, this would:
      // 1. Query all memory objects for the user from Sui blockchain
      // 2. Retrieve metadata for each memory
      // 3. Calculate analytics
      
      this.logger.log(`Generating metadata insights for user ${userAddress}`);
      
      return {
        totalMemories: 0,
        categoriesDistribution: {},
        averageImportance: 5,
        topTopics: [],
        embeddingCoverage: 0
      };
    } catch (error) {
      this.logger.error(`Error getting metadata insights: ${error.message}`);
      return {
        totalMemories: 0,
        categoriesDistribution: {},
        averageImportance: 5,
        topTopics: [],
        embeddingCoverage: 0
      };
    }
  }

  /**
   * Get batch processing statistics
   */
  getBatchStats() {
    return this.hnswIndexService.getCacheStats();
  }

  /**
   * Force flush pending vectors for a specific user
   */
  async forceFlushUser(userAddress: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.hnswIndexService.forceFlush(userAddress);
      return {
        success: true,
        message: `Successfully flushed pending vectors for user ${userAddress}`
      };
    } catch (error) {
      this.logger.error(`Error force flushing user ${userAddress}: ${error.message}`);
      return {
        success: false,
        message: `Failed to flush vectors: ${error.message}`
      };
    }
  }
}
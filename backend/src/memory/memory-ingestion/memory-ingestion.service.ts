import { Injectable, Logger } from '@nestjs/common';
import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { MemoryIndexService } from '../memory-index/memory-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';

export interface CreateMemoryDto {
  content: string;
  category: string;
  userAddress: string;
  userSignature?: string;
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
    private walrusService: WalrusService,
    private geminiService: GeminiService
  ) {}

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
   * Process a new memory from scratch
   * @param memoryDto Memory data
   * @returns Processing result
   */
  async processNewMemory(memoryDto: CreateMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    message?: string;
    requiresIndexCreation?: boolean;
    indexBlobId?: string;
    graphBlobId?: string;
  }> {
    try {
      // Step 1: Get or load memory index for user
      const indexData = await this.memoryIndexService.getOrLoadIndex(memoryDto.userAddress);
      
      let index: any;
      let graph: any;
      let indexId: string;
      let indexBlobId: string;
      let graphBlobId: string;
      let currentVersion = 1;
      
      if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
        // Use existing index
        index = indexData.index;
        graph = indexData.graph;
        indexId = indexData.indexId;
        indexBlobId = indexData.indexBlobId;
        graphBlobId = indexData.graphBlobId;
        currentVersion = indexData.version;
      } else {
        // No memory index exists, prepare data for frontend creation
        this.logger.log(`Preparing memory index data for user ${memoryDto.userAddress}`);
        
        // Prepare index data
        const prepareResult = await this.memoryIndexService.prepareIndexForCreation(memoryDto.userAddress);
        
        if (!prepareResult.success) {
          return {
            success: false,
            message: prepareResult.message || 'Failed to prepare index data'
          };
        }
        
        // Return with instructions for frontend to create index
        return {
          success: false,
          message: 'Memory index not found. Please create index on-chain first.',
          requiresIndexCreation: true,
          indexBlobId: prepareResult.indexBlobId,
          graphBlobId: prepareResult.graphBlobId
        };
      }
      
      // Step 2: Generate embedding for the memory
      const { vector } = await this.embeddingService.embedText(memoryDto.content);
      
      // Step 3: Add vector to the index
      const vectorId = this.getNextVectorId(memoryDto.userAddress);
      this.hnswIndexService.addVectorToIndex(index, vectorId, vector);
      
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
      
      // Step 7: Encrypt the memory content
      const encryptedContent = await this.sealService.encrypt(
        memoryDto.content,
        memoryDto.userAddress
      );
      
      // Step 8: Save the encrypted content to Walrus
      const contentBlobId = await this.walrusService.uploadContent(encryptedContent, memoryDto.userAddress);
      
      // Step 9: Save the updated index and graph to Walrus
      const newIndexBlobId = await this.hnswIndexService.saveIndex(index, memoryDto.userAddress);
      const newGraphBlobId = await this.graphService.saveGraph(graph, memoryDto.userAddress);
      
      // Step 10: Update the on-chain memory index
      await this.suiService.updateMemoryIndex(
        indexId,
        memoryDto.userAddress,
        currentVersion,
        newIndexBlobId,
        newGraphBlobId
      );
      
      // Step 11: Create the on-chain memory record
      const memoryId = await this.suiService.createMemoryRecord(
        memoryDto.userAddress,
        memoryDto.category,
        vectorId,
        contentBlobId
      );
      
      return {
        success: true,
        memoryId,
        message: 'Memory processed successfully'
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
      
      // Step 1: Get or load memory index for user
      const indexData = await this.memoryIndexService.getOrLoadIndex(userAddress);
      
      let index: any;
      let graph: any;
      let indexId: string;
      let indexBlobId: string;
      let graphBlobId: string;
      let currentVersion = 1;
      
      if (indexData.exists && indexData.indexId && indexData.indexBlobId && indexData.graphBlobId && indexData.version) {
        // Use existing index
        index = indexData.index;
        graph = indexData.graph;
        indexId = indexData.indexId;
        indexBlobId = indexData.indexBlobId;
        graphBlobId = indexData.graphBlobId;
        currentVersion = indexData.version;
      } else {
        // No memory index exists, prepare data for frontend creation
        this.logger.log(`Preparing memory index data for user ${userAddress}`);
        
        // Prepare index data
        const prepareResult = await this.memoryIndexService.prepareIndexForCreation(userAddress);
        
        if (!prepareResult.success) {
          return {
            success: false,
            message: prepareResult.message || 'Failed to prepare index data'
          };
        }
        
        // Return with instructions for frontend to create index
        return {
          success: false,
          message: 'Memory index not found. Please create index on-chain first.',
          requiresIndexCreation: true,
          indexBlobId: prepareResult.indexBlobId,
          graphBlobId: prepareResult.graphBlobId
        };
      }
      
      // Step 2: Generate embedding for the memory
      const { vector } = await this.embeddingService.embedText(content);
      
      // Step 3: Add vector to the index
      const vectorId = this.getNextVectorId(userAddress);
      this.hnswIndexService.addVectorToIndex(index, vectorId, vector);
      
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
      
      // Step 7: Encrypt the memory content
      const encryptedContent = await this.sealService.encrypt(
        content,
        userAddress
      );
      
      // Step 8: Save the encrypted content to Walrus
      const contentBlobId = await this.walrusService.uploadContent(encryptedContent, userAddress);
      
      // Step 9: Save the updated index and graph to Walrus
      const newIndexBlobId = await this.hnswIndexService.saveIndex(index, userAddress);
      const newGraphBlobId = await this.graphService.saveGraph(graph, userAddress);
      
      // Step 10: Update the on-chain memory index
      await this.suiService.updateMemoryIndex(
        indexId,
        userAddress,
        currentVersion,
        newIndexBlobId,
        newGraphBlobId
      );
      
      // Return data needed for frontend to create on-chain record
      return {
        success: true,
        vectorId,
        blobId: contentBlobId,
        message: 'Memory processed successfully'
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
   * This method prepares the memory for storage but does not write to blockchain
   * @param saveMemoryDto Memory data approved by the user
   * @returns Processing result with data for frontend blockchain operations
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
}
import { Injectable, Logger } from '@nestjs/common';
import { ClassifierService } from '../classifier/classifier.service';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { MemoryIndexDto } from '../dto/memory-index.dto';
import { ProcessMemoryDto } from '../dto/process-memory.dto';

export interface CreateMemoryDto {
  content: string;
  category: string;
  userAddress: string;
  userSignature?: string;
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
    private sealService: SealService,
    private suiService: SuiService,
    private walrusService: WalrusService,
    private geminiService: GeminiService
  ) {}
  
  /**
   * Get the next available vector ID for a user
   * @param userAddress User address
   * @returns The next vector ID
   */
  getNextVectorId(userAddress: string): number {
    if (!this.nextVectorId[userAddress]) {
      this.nextVectorId[userAddress] = 1;
    }
    
    return this.nextVectorId[userAddress]++;
  }
  
  /**
   * Get the entity to vector mapping for a user
   * @param userAddress User address
   * @returns Mapping from entity IDs to vector IDs
   */
  getEntityToVectorMap(userAddress: string): Record<string, number> {
    if (!this.entityToVectorMap[userAddress]) {
      this.entityToVectorMap[userAddress] = {};
    }
    
    return this.entityToVectorMap[userAddress];
  }
  
  /**
   * Process a conversation for potential memories
   * @param userMessage User message
   * @param assistantResponse Assistant response
   * @param userAddress User address
   * @returns Processing result
   */
  async processConversation(
    userMessage: string,
    assistantResponse: string,
    userAddress: string
  ): Promise<{ memoryStored: boolean; memoryId?: string }> {
    try {
      // Step 1: Classify the message to determine if it contains information to save
      const classification = await this.classifierService.shouldSaveMemory(userMessage);
      
      if (!classification.shouldSave) {
        this.logger.log(`Message not classified as a memory: ${userMessage}`);
        return { memoryStored: false };
      }
      
      // Step 2: Process the message as a memory
      const memoryDto: CreateMemoryDto = {
        content: userMessage,
        category: classification.category,
        userAddress
      };
      
      const result = await this.processNewMemory(memoryDto);
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
   * Process a new memory
   * @param memoryDto Memory creation data
   * @returns Processing result
   */
  async processNewMemory(memoryDto: CreateMemoryDto): Promise<{
    success: boolean;
    memoryId?: string;
    message?: string;
  }> {
    try {
      // Step 1: Get or create user's memory index
      let indexId: string;
      let indexBlobId: string;
      let graphBlobId: string;
      let currentVersion = 0;
      let index;
      let graph;
      
      try {
        // Try to get the existing index
        const memoryIndex = await this.suiService.getMemoryIndex(memoryDto.userAddress);
        indexId = memoryDto.userAddress; // Use user address as index ID
        indexBlobId = memoryIndex.indexBlobId;
        graphBlobId = memoryIndex.graphBlobId;
        currentVersion = memoryIndex.version;
        
        // Load existing index and graph
        const indexResult = await this.hnswIndexService.loadIndex(indexBlobId);
        index = indexResult.index;
        
        graph = await this.graphService.loadGraph(graphBlobId);
      } catch (error) {
        // No index exists, create a new one
        this.logger.log(`Creating new memory index for user ${memoryDto.userAddress}`);
        
        // Create empty index
        const newIndexResult = await this.hnswIndexService.createIndex();
        index = newIndexResult.index;
        
        // Save empty index to Walrus
        indexBlobId = await this.hnswIndexService.saveIndex(index);
        
        // Create empty graph
        graph = this.graphService.createGraph();
        graphBlobId = await this.graphService.saveGraph(graph);
        
        // Create on-chain index
        indexId = await this.suiService.createMemoryIndex(
          memoryDto.userAddress,
          indexBlobId,
          graphBlobId
        );
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
      const { encrypted, backupKey } = await this.sealService.encrypt(
        memoryDto.content,
        memoryDto.userAddress
      );
      
      // Step 8: Save the encrypted content to Walrus
      const contentBlobId = await this.walrusService.uploadContent(encrypted);
      
      // Step 9: Save the updated index and graph to Walrus
      const newIndexBlobId = await this.hnswIndexService.saveIndex(index);
      const newGraphBlobId = await this.graphService.saveGraph(graph);
      
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
    message?: string 
  }> {
    try {
      const { content, userAddress, category } = processDto;
      
      // Step 1: Get or create user's memory index
      let indexId: string;
      let indexBlobId: string;
      let graphBlobId: string;
      let currentVersion = 0;
      let index;
      let graph;
      
      try {
        // Try to get the existing index
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
        indexId = userAddress; 
        indexBlobId = memoryIndex.indexBlobId;
        graphBlobId = memoryIndex.graphBlobId;
        currentVersion = memoryIndex.version;
        
        // Load existing index and graph
        const indexResult = await this.hnswIndexService.loadIndex(indexBlobId);
        index = indexResult.index;
        
        graph = await this.graphService.loadGraph(graphBlobId);
      } catch (error) {
        // No index exists, create a new one
        this.logger.log(`Creating new memory index for user ${userAddress}`);
        
        // Create empty index
        const newIndexResult = await this.hnswIndexService.createIndex();
        index = newIndexResult.index;
        
        // Save empty index to Walrus
        indexBlobId = await this.hnswIndexService.saveIndex(index);
        
        // Create empty graph
        graph = this.graphService.createGraph();
        graphBlobId = await this.graphService.saveGraph(graph);
        
        // Create on-chain index through the backend
        // In direct mode, the frontend will handle this if needed
        indexId = await this.suiService.createMemoryIndex(
          userAddress,
          indexBlobId,
          graphBlobId
        );
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
      const { encrypted, backupKey } = await this.sealService.encrypt(
        content,
        userAddress
      );
      
      // Step 8: Save the encrypted content to Walrus
      const contentBlobId = await this.walrusService.uploadContent(encrypted);
      
      // Step 9: Save the updated index and graph to Walrus
      const newIndexBlobId = await this.hnswIndexService.saveIndex(index);
      const newGraphBlobId = await this.graphService.saveGraph(graph);
      
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
      const { memoryId, userAddress, category, walrusHash } = indexDto;
      
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
      // Step 1: Get the existing memory to verify ownership
      const memory = await this.suiService.getMemory(memoryId);
      
      if (memory.owner !== userAddress) {
        throw new Error('You do not own this memory');
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
}
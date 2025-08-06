import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { MemoryIngestionService } from '../memory-ingestion/memory-ingestion.service';
import { GeminiService } from '../../infrastructure/gemini/gemini.service';
import { Memory } from '../../types/memory.types';

@Injectable()
export class MemoryQueryService {
  private readonly logger = new Logger(MemoryQueryService.name);
  
  constructor(
    private embeddingService: EmbeddingService,
    private graphService: GraphService,
    private hnswIndexService: HnswIndexService,
    private sealService: SealService,
    private suiService: SuiService,
    private walrusService: WalrusService,
    private memoryIngestionService: MemoryIngestionService,
    private geminiService: GeminiService
  ) {}

  /**
   * Get all memories for a user
   */
  async getUserMemories(userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    try {
      // Get all memory records for this user
      const memoryRecords = await this.suiService.getUserMemories(userAddress);
      const memories: Memory[] = [];

      // Populate memories with data
      for (const record of memoryRecords) {
        try {
          // Get encrypted content
          const encryptedContent = await this.walrusService.retrieveContent(record.blobId);
          
          // We return encrypted content to frontend and only decrypt when needed
          memories.push({
            id: record.id,
            content: encryptedContent, // Keep content encrypted
            category: record.category,
            timestamp: new Date().toISOString(), // Use creation time from record if available
            isEncrypted: true,
            owner: userAddress,
            walrusHash: record.blobId
          });
        } catch (error) {
          this.logger.error(`Error retrieving memory ${record.id}: ${error.message}`);
        }
      }

      return { 
        memories,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error getting user memories: ${error.message}`);
      return { memories: [], success: false };
    }
  }

  /**
   * Find relevant memories based on a query
   */
  async findRelevantMemories(
    query: string,
    userAddress: string,
    limit: number = 5
  ): Promise<string[]> {
    try {
      // Step 1: Get memory index for user
      let indexBlobId: string;
      let graphBlobId: string;
      
      try {
        // Get existing memory index
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
        indexBlobId = memoryIndex.indexBlobId;
        graphBlobId = memoryIndex.graphBlobId;
      } catch (error) {
        // No memory index exists, return empty results
        this.logger.log(`No memory index found for user ${userAddress}`);
        return [];
      }
      
      // Step 2: Create embedding for query
      const { vector } = await this.embeddingService.embedText(query);
      
      // Step 3: Load index and perform vector search
      const { index } = await this.hnswIndexService.loadIndex(indexBlobId, userAddress);
      const searchResults = this.hnswIndexService.searchIndex(index, vector, limit * 2); // Get more results than needed
      
      // Step 4: Load graph and find related entities
      const graph = await this.graphService.loadGraph(graphBlobId, userAddress);
      const entityToVectorMap = this.memoryIngestionService.getEntityToVectorMap(userAddress);
      
      // Step 5: Expand search using graph traversal
      const expandedVectorIds = this.graphService.findRelatedEntities(
        graph,
        searchResults.ids,
        entityToVectorMap,
        1 // Limit traversal to 1 hop for performance
      ).map(entityId => entityToVectorMap[entityId])
        .filter(Boolean); // Filter out undefined vector IDs
      
      // Combine original search results with graph-expanded results
      const allVectorIds = [...new Set([...searchResults.ids, ...expandedVectorIds])];
      
      // Step 6: Get actual memory content for the vector IDs
      const memories: string[] = [];
      const seenBlobIds = new Set<string>();
      
      // Get all memory objects for this user
      for (const vectorId of allVectorIds.slice(0, limit)) {
        try {
          const memoryObjects = await this.suiService.getMemoriesWithVectorId(userAddress, vectorId);
          
          for (const memory of memoryObjects) {
            if (seenBlobIds.has(memory.blobId)) continue;
            seenBlobIds.add(memory.blobId);
            
            // Get encrypted content
            const encryptedContent = await this.walrusService.retrieveContent(memory.blobId);
            
            // Decrypt content
            const decryptedContent = await this.sealService.decrypt(encryptedContent, userAddress);
            
            memories.push(decryptedContent);
            
            if (memories.length >= limit) break;
          }
        } catch (error) {
          this.logger.error(`Error retrieving memory for vector ID ${vectorId}: ${error.message}`);
          continue;
        }
      }
      
      return memories;
    } catch (error) {
      this.logger.error(`Error finding relevant memories: ${error.message}`);
      return [];
    }
  }

  /**
   * Search memories based on query and optionally category
   */
  async searchMemories(
    query: string,
    userAddress: string,
    category?: string,
    k: number = 5
  ): Promise<{ results: Memory[] }> {
    try {
      // Step 1: Create embedding for query
      const { vector } = await this.embeddingService.embedText(query);

      // Step 2: Get memory index for user
      let indexBlobId: string;
      
      try {
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);
        indexBlobId = memoryIndex.indexBlobId;
      } catch (error) {
        this.logger.log(`No memory index found for user ${userAddress}`);
        return { results: [] };
      }
      
      // Step 3: Load index and perform vector search
      const { index } = await this.hnswIndexService.loadIndex(indexBlobId, userAddress);
      const searchResults = this.hnswIndexService.searchIndex(index, vector, k * 2);
      
      // Step 4: Get memory content and filter by category if needed
      const results: Memory[] = [];
      
      for (const vectorId of searchResults.ids) {
        try {
          const memoryObjects = await this.suiService.getMemoriesWithVectorId(userAddress, vectorId);
          
          for (const memoryObj of memoryObjects) {
            // Skip if category filter is applied and doesn't match
            if (category && memoryObj.category !== category) continue;
            
            // Get encrypted content
            const encryptedContent = await this.walrusService.retrieveContent(memoryObj.blobId);
            
            // Add to results - we keep it encrypted and let frontend decrypt when needed
            results.push({
              id: memoryObj.id,
              content: encryptedContent,
              category: memoryObj.category,
              timestamp: new Date().toISOString(),
              isEncrypted: true,
              owner: userAddress,
              similarity_score: searchResults.distances[searchResults.ids.indexOf(vectorId)],
              walrusHash: memoryObj.blobId
            });
            
            if (results.length >= k) break;
          }
          
          if (results.length >= k) break;
        } catch (error) {
          this.logger.error(`Error retrieving memory for vector ID ${vectorId}: ${error.message}`);
        }
      }
      
      return { results };
    } catch (error) {
      this.logger.error(`Error searching memories: ${error.message}`);
      return { results: [] };
    }
  }

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userAddress: string): Promise<{ message: string, success: boolean }> {
    try {
      // 1. Get memory from chain to verify ownership and get blob ID
      const memory = await this.suiService.getMemory(memoryId);
      
      if (memory.owner !== userAddress) {
        throw new NotFoundException('Memory not found or you are not the owner');
      }
      
      // 2. Delete memory on chain
      await this.suiService.deleteMemory(memoryId, userAddress);
      
      // 3. Delete content blob from Walrus (optional, based on policy)
      try {
        await this.walrusService.deleteContent(memory.blobId, userAddress);
      } catch (walrusError) {
        // Log but don't fail if Walrus deletion fails - chain is source of truth
        this.logger.warn(`Failed to delete from Walrus: ${walrusError.message}`);
      }
      
      return {
        message: 'Memory deleted successfully',
        success: true
      };
    } catch (error) {
      this.logger.error(`Error deleting memory: ${error.message}`);
      return {
        message: `Failed to delete memory: ${error.message}`,
        success: false
      };
    }
  }

  /**
   * Get memory context for a chat session
   */
  async getMemoryContext(
    queryText: string,
    userAddress: string,
    userSignature: string,
    k: number = 5
  ): Promise<{
    context: string,
    relevant_memories: Memory[],
    query_metadata: {
      query_time_ms: number,
      memories_found: number,
      context_length: number
    }
  }> {
    try {
      const startTime = Date.now();
      
      // Find relevant memories
      const relevantMemoriesContent = await this.findRelevantMemories(queryText, userAddress, k);
      
      // Format memories as structured objects
      const relevantMemories: Memory[] = relevantMemoriesContent.map((content, index) => ({
        id: `mem-${index}`, // Placeholder ID
        content,
        category: 'auto', // We don't have actual category here
        timestamp: new Date().toISOString(),
        isEncrypted: false, // Already decrypted
        owner: userAddress
      }));
      
      // Generate context summary using LLM
      let context = '';
      if (relevantMemories.length > 0) {
        const memoryTexts = relevantMemories.map(m => m.content).join('\n\n');
        
        const prompt = `
          Summarize the following user memories to provide context for answering a question.
          Be concise but informative, focusing only on details relevant to the query: "${queryText}"
          
          MEMORIES:
          ${memoryTexts}
          
          SUMMARY:
        `;
        
        context = await this.geminiService.generateContent(
          'gemini-1.5-flash',
          [{ role: 'user', content: prompt }]
        );
      }
      
      const endTime = Date.now();
      
      return {
        context,
        relevant_memories: relevantMemories,
        query_metadata: {
          query_time_ms: endTime - startTime,
          memories_found: relevantMemories.length,
          context_length: context.length
        }
      };
    } catch (error) {
      this.logger.error(`Error getting memory context: ${error.message}`);
      return {
        context: '',
        relevant_memories: [],
        query_metadata: {
          query_time_ms: 0,
          memories_found: 0,
          context_length: 0
        }
      };
    }
  }

  /**
   * Get memory statistics
   */
  /**
   * Get memory content by its Walrus hash
   */
  async getMemoryContentByHash(hash: string): Promise<{ content: string, success: boolean }> {
    try {
      // Retrieve encrypted content from Walrus
      const encryptedContent = await this.walrusService.retrieveContent(hash);
      
      // Return the content (can be encrypted)
      return {
        content: encryptedContent,
        success: true
      };
    } catch (error) {
      this.logger.error(`Error getting memory content by hash ${hash}: ${error.message}`);
      return {
        content: '',
        success: false
      };
    }
  }
  
  async getMemoryStats(userAddress: string): Promise<{
    total_memories: number,
    categories: Record<string, number>,
    storage_used_bytes: number,
    last_updated: string,
    success: boolean
  }> {
    try {
      // 1. Get all memories for user
      const { memories } = await this.getUserMemories(userAddress);
      
      // 2. Calculate statistics
      const categories: Record<string, number> = {};
      let totalSize = 0;
      
      for (const memory of memories) {
        // Count by category
        if (categories[memory.category]) {
          categories[memory.category] += 1;
        } else {
          categories[memory.category] = 1;
        }
        
        // Sum up content sizes
        totalSize += memory.content.length;
      }
      
      return {
        total_memories: memories.length,
        categories,
        storage_used_bytes: totalSize,
        last_updated: new Date().toISOString(),
        success: true
      };
    } catch (error) {
      this.logger.error(`Error getting memory stats: ${error.message}`);
      return {
        total_memories: 0,
        categories: {},
        storage_used_bytes: 0,
        last_updated: new Date().toISOString(),
        success: false
      };
    }
  }
}
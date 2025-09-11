import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EmbeddingService } from '../embedding/embedding.service';
import { GraphService } from '../graph/graph.service';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { SealService } from '../../infrastructure/seal/seal.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import { CachedWalrusService } from '../../infrastructure/walrus/cached-walrus.service';
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
    private cachedWalrusService: CachedWalrusService,
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
          // Get content from Walrus with caching
          const content = await this.cachedWalrusService.retrieveContent(record.blobId);
          
          memories.push({
            id: record.id,
            content: content, // Unencrypted content
            category: record.category,
            timestamp: new Date().toISOString(), // Use creation time from record if available
            isEncrypted: false,
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
    userSignature?: string,
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
            
            // Get content from Walrus with caching
            const content = await this.cachedWalrusService.retrieveContent(memory.blobId);
            
            memories.push(content);
            
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
            
            // Get content from Walrus with caching
            const content = await this.cachedWalrusService.retrieveContent(memoryObj.blobId);
            
            // Add to results
            results.push({
              id: memoryObj.id,
              content: content,
              category: memoryObj.category,
              timestamp: new Date().toISOString(),
              isEncrypted: false,
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
      const relevantMemoriesContent = await this.findRelevantMemories(queryText, userAddress, userSignature, k);
      
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
   * Decrypt memory with access control validation
   */
  async decryptMemoryWithAccessControl(
    encryptedContent: string,
    userAddress: string,
    identityId: string
  ): Promise<{ content: string; success: boolean; error?: string }> {
    try {
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));

      // Determine access type from identity ID
      let moveCallConstructor;

      if (identityId.startsWith('timelock_')) {
        // Time-lock access
        const decryptedBytes = await this.sealService.decryptTimelock(encryptedBytes, userAddress);
        const content = new TextDecoder().decode(decryptedBytes);
        return { content, success: true };
      } else if (identityId.startsWith('allowlist_')) {
        // Allowlist access - would need to get allowlist details
        moveCallConstructor = this.sealService.createSelfAccessTransaction(userAddress);
      } else if (identityId.startsWith('role_')) {
        // Role-based access - would need to validate role permissions
        moveCallConstructor = this.sealService.createSelfAccessTransaction(userAddress);
      } else {
        // Default self access
        moveCallConstructor = this.sealService.createSelfAccessTransaction(userAddress);
      }

      const decryptedBytes = await this.sealService.decrypt(encryptedBytes, moveCallConstructor);
      const content = new TextDecoder().decode(decryptedBytes);

      return { content, success: true };
    } catch (error) {
      this.logger.error(`Error decrypting memory with access control: ${error.message}`);
      return {
        content: '',
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get memories with enhanced access control information
   */
  async getUserMemoriesWithAccessControl(userAddress: string): Promise<{
    memories: (Memory & {
      accessType: 'self' | 'allowlist' | 'timelock' | 'role' | 'unknown';
      canDecrypt: boolean;
      accessDetails?: any;
    })[],
    success: boolean
  }> {
    try {
      const { memories, success } = await this.getUserMemories(userAddress);

      if (!success) {
        return { memories: [], success: false };
      }

      // Enhance memories with access control information
      const enhancedMemories = memories.map(memory => {
        // Try to determine access type from content or metadata
        // This is a simplified approach - in a real implementation,
        // you'd store access control metadata with the memory
        let accessType: 'self' | 'allowlist' | 'timelock' | 'role' | 'unknown' = 'self';
        let canDecrypt = true;
        let accessDetails = {};

        // For demo purposes, randomly assign some access types
        const rand = Math.random();
        if (rand < 0.1) {
          accessType = 'timelock';
          canDecrypt = Math.random() > 0.5; // 50% chance it's unlocked
          accessDetails = {
            unlockTime: Date.now() + (canDecrypt ? -1000 : 60000),
            unlockTimeISO: new Date(Date.now() + (canDecrypt ? -1000 : 60000)).toISOString()
          };
        } else if (rand < 0.2) {
          accessType = 'allowlist';
          canDecrypt = true; // User is owner, so can access
          accessDetails = { allowlistId: 'demo_allowlist_123' };
        } else if (rand < 0.3) {
          accessType = 'role';
          canDecrypt = true; // User has required role
          accessDetails = { requiredRole: 'viewer' };
        }

        return {
          ...memory,
          accessType,
          canDecrypt,
          accessDetails
        };
      });

      return { memories: enhancedMemories, success: true };
    } catch (error) {
      this.logger.error(`Error getting user memories with access control: ${error.message}`);
      return { memories: [], success: false };
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
      // Retrieve content from Walrus with caching
      const content = await this.cachedWalrusService.retrieveContent(hash);
      
      // Return the content
      return {
        content: content,
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
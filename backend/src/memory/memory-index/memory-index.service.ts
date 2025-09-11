import { Injectable, Logger } from '@nestjs/common';
import { HnswIndexService } from '../hnsw-index/hnsw-index.service';
import { GraphService } from '../graph/graph.service';
import { SuiService } from '../../infrastructure/sui/sui.service';
import { PrepareIndexResponseDto } from '../dto/prepare-index.dto';

@Injectable()
export class MemoryIndexService {
  private readonly logger = new Logger(MemoryIndexService.name);
  
  // Map userAddress to their memory index ID (for frontend-created indexes)
  private userIndexMap = new Map<string, string>();

  constructor(
    private hnswIndexService: HnswIndexService,
    private graphService: GraphService,
    private suiService: SuiService
  ) {}

  /**
   * Prepare index data for frontend creation
   * Returns the blob IDs needed for the frontend to create the index on-chain
   */
  async prepareIndexForCreation(userAddress: string): Promise<PrepareIndexResponseDto> {
    try {
      // Validate userAddress
      if (!userAddress || userAddress === 'undefined') {
        return {
          success: false,
          message: 'User address is required'
        };
      }
      
      this.logger.log(`Preparing memory index data for user ${userAddress}`);
      
      // Create empty index
      const { index } = await this.hnswIndexService.createIndex();
      
      // Save empty index to Walrus
      const indexBlobId = await this.hnswIndexService.saveIndex(index, userAddress);
      
      // Create empty graph
      const graph = this.graphService.createGraph();
      const graphBlobId = await this.graphService.saveGraph(graph, userAddress);
      
      this.logger.log(`Prepared index data - indexBlobId: ${indexBlobId}, graphBlobId: ${graphBlobId}`);
      
      return {
        success: true,
        indexBlobId,
        graphBlobId,
        message: 'Index data prepared for on-chain creation'
      };
    } catch (error) {
      this.logger.error(`Error preparing index: ${error.message}`);
      return {
        success: false,
        message: `Failed to prepare index: ${error.message}`
      };
    }
  }
  
  /**
   * Register a frontend-created memory index
   */
  async registerMemoryIndex(userAddress: string, indexId: string): Promise<{
    success: boolean;
    message?: string;
  }> {
    try {
      // Verify the index exists on-chain
      const memoryIndex = await this.suiService.getMemoryIndex(indexId);
      
      if (memoryIndex.owner !== userAddress) {
        return {
          success: false,
          message: 'Index does not belong to the specified user'
        };
      }
      
      // Store the mapping
      this.userIndexMap.set(userAddress, indexId);
      
      this.logger.log(`Registered memory index ${indexId} for user ${userAddress}`);
      
      return {
        success: true,
        message: 'Memory index registered successfully'
      };
    } catch (error) {
      this.logger.error(`Error registering index: ${error.message}`);
      return {
        success: false,
        message: `Failed to register index: ${error.message}`
      };
    }
  }
  
  /**
   * Get the memory index ID for a user
   */
  getIndexId(userAddress: string): string | undefined {
    return this.userIndexMap.get(userAddress);
  }
  
  /**
   * Set the memory index ID for a user
   */
  setIndexId(userAddress: string, indexId: string): void {
    this.userIndexMap.set(userAddress, indexId);
  }
  
  /**
   * Clear the memory index ID for a user
   */
  clearIndexId(userAddress: string): void {
    this.userIndexMap.delete(userAddress);
  }
  
  /**
   * Get or load memory index for a user
   * Returns the index data and metadata
   */
  async getOrLoadIndex(userAddress: string): Promise<{
    index?: any;
    graph?: any;
    indexId?: string;
    indexBlobId?: string;
    graphBlobId?: string;
    version?: number;
    exists: boolean;
  }> {
    try {
      // Check if we have a stored index ID for this user
      let indexId = this.userIndexMap.get(userAddress);

      if (indexId) {
        try {
          // Get existing memory index using the stored ID
          const memoryIndex = await this.suiService.getMemoryIndex(indexId);

          // Verify ownership
          if (memoryIndex.owner !== userAddress) {
            this.logger.warn(`Index ${indexId} does not belong to user ${userAddress}`);
            this.userIndexMap.delete(userAddress);
            indexId = undefined;
          } else {
            // Load index and graph from Walrus
            const indexResult = await this.hnswIndexService.loadIndex(memoryIndex.indexBlobId, userAddress);
            const graph = await this.graphService.loadGraph(memoryIndex.graphBlobId, userAddress);

            return {
              index: indexResult.index,
              graph,
              indexId,
              indexBlobId: memoryIndex.indexBlobId,
              graphBlobId: memoryIndex.graphBlobId,
              version: memoryIndex.version,
              exists: true
            };
          }
        } catch (error) {
          this.logger.warn(`Failed to load index ${indexId}: ${error.message}`);
          // Clear the invalid mapping
          this.userIndexMap.delete(userAddress);
          indexId = undefined;
        }
      }

      // Try to get memory index by user address (backward compatibility)
      // But skip loading if we know Walrus is likely down
      try {
        const memoryIndex = await this.suiService.getMemoryIndex(userAddress);

        // Use userAddress as the index ID for backward compatibility
        indexId = userAddress;

        // Store the mapping
        this.userIndexMap.set(userAddress, indexId);

        // Check if we should attempt to load from Walrus
        // Skip if we've had recent Walrus failures to avoid delays
        const shouldAttemptWalrusLoad = true; // For now, always attempt but handle failures gracefully

        if (shouldAttemptWalrusLoad) {
          // Load index and graph from Walrus with better error handling
          try {
            this.logger.log(`Attempting to load existing index for user ${userAddress} from Walrus`);
            const indexResult = await this.hnswIndexService.loadIndex(memoryIndex.indexBlobId, userAddress);
            const graph = await this.graphService.loadGraph(memoryIndex.graphBlobId, userAddress);

            this.logger.log(`Successfully loaded existing index for user ${userAddress}`);
            return {
              index: indexResult.index,
              graph,
              indexId,
              indexBlobId: memoryIndex.indexBlobId,
              graphBlobId: memoryIndex.graphBlobId,
              version: memoryIndex.version,
              exists: true
            };
          } catch (loadError) {
            this.logger.warn(`Failed to load index data for user ${userAddress}: ${loadError.message}`);

            // If it's a Walrus connectivity issue, log warning but continue to create new local index
            if (loadError.message.includes('Walrus') ||
                loadError.message.includes('fetch failed') ||
                loadError.message.includes('network') ||
                loadError.message.includes('timeout') ||
                loadError.message.includes('404') ||
                loadError.message.includes('unavailable') ||
                loadError.message.includes('permission')) {
              this.logger.warn(`Walrus connectivity/permission issue for user ${userAddress}. Will create new local index instead.`);
            }

            // Clear the invalid mapping and continue to create new index
            this.userIndexMap.delete(userAddress);
            // Don't throw error - let it fall through to create new index
          }
        } else {
          this.logger.log(`Skipping Walrus load due to recent failures, creating new local index for user ${userAddress}`);
          this.userIndexMap.delete(userAddress);
        }
      } catch (error) {
        this.logger.debug(`No index found for user ${userAddress}: ${error.message}`);
      }

      // Try to find any memory index owned by this user
      try {
        const userIndexes = await this.suiService.getUserMemoryIndexes(userAddress);

        if (userIndexes && userIndexes.length > 0) {
          // Use the first (most recent) index
          const latestIndex = userIndexes[0];
          indexId = latestIndex.id;

          // Store the mapping
          this.userIndexMap.set(userAddress, indexId);

          // Load index and graph from Walrus
          const indexResult = await this.hnswIndexService.loadIndex(latestIndex.indexBlobId, userAddress);
          const graph = await this.graphService.loadGraph(latestIndex.graphBlobId, userAddress);

          this.logger.log(`Found existing index ${indexId} for user ${userAddress}`);

          return {
            index: indexResult.index,
            graph,
            indexId,
            indexBlobId: latestIndex.indexBlobId,
            graphBlobId: latestIndex.graphBlobId,
            version: latestIndex.version,
            exists: true
          };
        }
      } catch (error) {
        this.logger.debug(`Failed to find user indexes: ${error.message}`);
      }

      // No index exists
      return {
        exists: false
      };
    } catch (error) {
      this.logger.error(`Error getting or loading index: ${error.message}`);
      return {
        exists: false
      };
    }
  }
}

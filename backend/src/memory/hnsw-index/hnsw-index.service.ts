import { Injectable, Logger } from '@nestjs/common';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';
import * as hnswlib from 'hnswlib-node';

@Injectable()
export class HnswIndexService {
  private logger = new Logger(HnswIndexService.name);

  constructor(private walrusService: WalrusService) {}

  /**
   * Create a new HNSW index
   * @param dimensions The number of dimensions for the vectors
   * @param maxElements The maximum number of elements in the index
   * @returns The index and its serialized representation
   */
  async createIndex(
    dimensions: number = 512, 
    maxElements: number = 10000
  ): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      // Create a new index
      const index = new hnswlib.HierarchicalNSW('cosine', dimensions);
      index.initIndex(maxElements);
      
      // Serialize the empty index
      const serialized = (index as any).getIndexBuffer();
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error creating HNSW index: ${error.message}`);
      throw new Error(`Index creation error: ${error.message}`);
    }
  }

  /**
   * Add a vector to the index
   * @param index The HNSW index
   * @param id The vector ID
   * @param vector The vector to add
   */
  addVectorToIndex(index: hnswlib.HierarchicalNSW, id: number, vector: number[]): void {
    try {
      index.addPoint(vector, id);
    } catch (error) {
      this.logger.error(`Error adding vector to index: ${error.message}`);
      throw new Error(`Vector addition error: ${error.message}`);
    }
  }

  /**
   * Search the index for similar vectors
   * @param index The HNSW index
   * @param vector The query vector
   * @param k The number of results to return
   * @returns The IDs and distances of the most similar vectors
   */
  searchIndex(
    index: hnswlib.HierarchicalNSW, 
    vector: number[], 
    k: number
  ): { ids: number[]; distances: number[] } {
    try {
      const results = index.searchKnn(vector, k);
      return {
        ids: results.neighbors,
        distances: results.distances
      };
    } catch (error) {
      this.logger.error(`Error searching index: ${error.message}`);
      throw new Error(`Index search error: ${error.message}`);
    }
  }

  /**
   * Serialize and save the index to Walrus
   * @param index The HNSW index
   * @returns The blob ID of the saved index
   */
  async saveIndex(index: hnswlib.HierarchicalNSW): Promise<string> {
    try {
      // Serialize the index
      const serialized = (index as any).getIndexBuffer();
      
      // Save to Walrus
      const blobId = await this.walrusService.uploadFile(
        serialized, 
        `index_${Date.now()}.hnsw`
      );
      
      return blobId;
    } catch (error) {
      this.logger.error(`Error saving index: ${error.message}`);
      throw new Error(`Index save error: ${error.message}`);
    }
  }

  /**
   * Load an index from Walrus
   * @param blobId The blob ID of the index
   * @returns The loaded index and its serialized form
   */
  async loadIndex(blobId: string): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      // Download the index file
      const serialized = await this.walrusService.downloadFile(blobId);
      
      // Reconstruct the index
      const index = new hnswlib.HierarchicalNSW('cosine', 0); // Dimensions will be loaded from file
      (index as any).readIndexFromBuffer(serialized);
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error loading index: ${error.message}`);
      throw new Error(`Index load error: ${error.message}`);
    }
  }

  /**
   * Get the number of elements in the index
   * @param index The HNSW index
   * @returns The number of elements
   */
  getIndexSize(index: hnswlib.HierarchicalNSW): number {
    try {
      return index.getCurrentCount();
    } catch (error) {
      this.logger.error(`Error getting index size: ${error.message}`);
      throw new Error(`Index size error: ${error.message}`);
    }
  }

  /**
   * Remove a vector from the index
   * @param index The HNSW index
   * @param id The vector ID to remove
   */
  removeVectorFromIndex(index: hnswlib.HierarchicalNSW, id: number): void {
    try {
      index.markDelete(id);
    } catch (error) {
      this.logger.error(`Error removing vector from index: ${error.message}`);
      throw new Error(`Vector removal error: ${error.message}`);
    }
  }
}
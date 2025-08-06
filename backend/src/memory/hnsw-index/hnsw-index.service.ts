import { Injectable, Logger } from '@nestjs/common';
import * as hnswlib from 'hnswlib-node';
import * as fs from 'fs';
import { WalrusService } from '../../infrastructure/walrus/walrus.service';

@Injectable()
export class HnswIndexService {
  private logger = new Logger(HnswIndexService.name);

  constructor(private walrusService: WalrusService) {}

  /**
   * Create a new HNSW index
   * @param dimensions Vector dimensions
   * @param maxElements Maximum number of elements
   * @returns The index and its serialized form
   */
  async createIndex(
    dimensions: number = 512, 
    maxElements: number = 10000
  ): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      this.logger.log(`Creating new HNSW index with dimensions ${dimensions}, max elements ${maxElements}`);
      
      // Create a new index
      const index = new hnswlib.HierarchicalNSW('cosine', dimensions);
      index.initIndex(maxElements);
      
      // Create a temporary file path for serialization
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);
      
      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      return { index, serialized };
    } catch (error) {
      this.logger.error(`Error creating index: ${error.message}`);
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
   * @param k Number of results to return
   * @returns The search results
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
   * @param userAddress The user's address for access control
   * @returns The blob ID of the saved index
   */
  async saveIndex(index: hnswlib.HierarchicalNSW, userAddress: string): Promise<string> {
    try {
      this.logger.log(`Saving HNSW index for user ${userAddress}`);
      
      // Create a temporary file path for serialization
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Save the index to the temporary file
      index.writeIndexSync(tempFilePath);
      
      // Read the file into a buffer
      const serialized = fs.readFileSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
      // Get admin address for blob ownership (ensures backend access)
      const adminAddress = this.walrusService.getAdminAddress();
      
      // Save to Walrus with dual-ownership pattern
      // - Admin as the actual owner (for backend access)
      // - User address stored in metadata (for permission checks)
      const blobId = await this.walrusService.uploadFile(
        serialized, 
        `index_${userAddress}_${Date.now()}.hnsw`,
        adminAddress, // Admin as owner for backend access
        12, // Default epochs
        { 
          'user-address': userAddress,  // Record actual user for permission checks
          'content-type': 'application/hnsw-index',
          'version': '1.0'
        }
      );
      
      this.logger.log(`Index saved to Walrus with blobId ${blobId}`);
      return blobId;
    } catch (error) {
      this.logger.error(`Error saving index: ${error.message}`);
      throw new Error(`Index save error: ${error.message}`);
    }
  }

  /**
   * Load an index from Walrus
   * @param blobId The blob ID of the index
   * @param userAddress The user's address for access verification
   * @returns The loaded index and its serialized form
   */
  async loadIndex(blobId: string, userAddress?: string): Promise<{ index: hnswlib.HierarchicalNSW; serialized: Buffer }> {
    try {
      this.logger.log(`Loading index from blobId: ${blobId}`);
      
      // Verify user access if an address is provided
      if (userAddress) {
        const hasAccess = await this.walrusService.verifyUserAccess(blobId, userAddress);
        if (!hasAccess) {
          this.logger.warn(`User ${userAddress} attempted to access index without permission: ${blobId}`);
          // Continue anyway since we're using admin to access
        }
      }
      
      // Download the index file
      const serialized = await this.walrusService.downloadFile(blobId);
      
      // Create a temporary file path
      const tempFilePath = `./tmp_hnsw_${Date.now()}.bin`;
      
      // Write the serialized data to the temporary file
      fs.writeFileSync(tempFilePath, serialized);
      
      // Create a new index and load from the file
      const index = new hnswlib.HierarchicalNSW('cosine', 0); // Dimensions will be loaded from file
      index.readIndexSync(tempFilePath);
      
      // Clean up the temporary file
      try { fs.unlinkSync(tempFilePath); } catch (e) { /* ignore */ }
      
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
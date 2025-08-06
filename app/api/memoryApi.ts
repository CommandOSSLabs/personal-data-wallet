import { httpApi } from './httpApi';

export interface SaveMemoryRequest {
  content: string;
  category: string;
  userAddress: string;
  suiObjectId?: string;
}

export interface MemoryResponse {
  success: boolean;
  memoryId?: string;
  blobId?: string;
  vectorId?: number;
  message?: string;
}

export interface SearchMemoryRequest {
  query: string;
  userAddress: string;
  category?: string;
  k?: number;
}

export interface Memory {
  id: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  blobId?: string;
}

export const memoryApi = {
  /**
   * Get all memories for a user
   */
  async getMemories(userAddress: string): Promise<{ memories: Memory[], success: boolean }> {
    try {
      const response = await httpApi.get(`/api/memories?user=${userAddress}`);
      return response;
    } catch (error) {
      console.error('Error fetching memories:', error);
      return { memories: [], success: false };
    }
  },

  /**
   * Save a user-approved memory
   */
  async saveApprovedMemory(saveRequest: SaveMemoryRequest): Promise<MemoryResponse> {
    try {
      const response = await httpApi.post('/api/memories/save-approved', saveRequest);
      return response;
    } catch (error) {
      console.error('Error saving approved memory:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Search memories by query
   */
  async searchMemories(searchRequest: SearchMemoryRequest): Promise<{ results: Memory[] }> {
    try {
      const response = await httpApi.post('/api/memories/search', searchRequest);
      return response;
    } catch (error) {
      console.error('Error searching memories:', error);
      return { results: [] };
    }
  },

  /**
   * Delete a memory
   */
  async deleteMemory(memoryId: string, userAddress: string): Promise<{ success: boolean }> {
    try {
      const response = await httpApi.delete(`/api/memories/${memoryId}`, {
        data: { userAddress }
      });
      return response;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return { success: false };
    }
  }
};
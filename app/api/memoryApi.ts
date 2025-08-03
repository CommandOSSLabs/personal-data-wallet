import { httpApi, ApiResponse } from './httpApi'

// Types for memory API
export interface Memory {
  id: string
  content: string
  category: string
  timestamp: string
  isEncrypted: boolean
  owner: string
  similarity_score?: number
}

export interface CreateMemoryRequest {
  content: string
  category: string
  userAddress: string
  userSignature?: string
}

export interface SearchMemoryRequest {
  query: string
  userAddress: string
  category?: string
  k?: number
  userSignature?: string
}

export interface MemorySearchResult {
  memories: Memory[]
  total_found: number
  query_time_ms: number
}

export interface MemoryContextRequest {
  query_text: string
  user_address: string
  user_signature: string
  k?: number
}

export interface MemoryContextResponse {
  context: string
  relevant_memories: Memory[]
  query_metadata: {
    query_time_ms: number
    memories_found: number
    context_length: number
  }
}

// Memory API methods
export const memoryApi = {
  // Get all memories for a user
  getMemories: async (userAddress: string): Promise<{ memories: Memory[], success: boolean }> => {
    return httpApi.get(`/api/memories?user=${userAddress}`)
  },

  // Create a new memory
  createMemory: async (request: CreateMemoryRequest): Promise<{ success: boolean, embeddingId?: string, message?: string }> => {
    return httpApi.post('/api/memories', request)
  },

  // Search memories
  searchMemories: async (request: SearchMemoryRequest): Promise<{ results: Memory[] }> => {
    return httpApi.post('/api/memories/search', request)
  },

  // Delete a memory
  deleteMemory: async (memoryId: string, userAddress: string): Promise<ApiResponse<{ message: string }>> => {
    return httpApi.delete(`/api/memories/${memoryId}`, {
      data: { userAddress }
    })
  },

  // Update a memory
  updateMemory: async (memoryId: string, content: string, userAddress: string): Promise<ApiResponse<{ memory: Memory }>> => {
    return httpApi.put(`/api/memories/${memoryId}`, {
      content,
      userAddress
    })
  },

  // Get memory context for chat
  getMemoryContext: async (request: MemoryContextRequest): Promise<MemoryContextResponse> => {
    return httpApi.post('/api/memories/context', request)
  },

  // Get memory statistics
  getMemoryStats: async (userAddress: string): Promise<ApiResponse<{
    total_memories: number
    categories: Record<string, number>
    storage_used_bytes: number
    last_updated: string
  }>> => {
    return httpApi.get(`/api/memories/stats?userAddress=${userAddress}`)
  }
}

export default memoryApi

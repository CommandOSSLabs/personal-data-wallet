// Export all API modules
export { httpApi, httpClient, type ApiResponse } from './httpApi'
export { chatApi, type ChatSession, type ChatMessage, type CreateSessionRequest, type AddMessageRequest, type StreamChatRequest, type StreamChatResponse } from './chatApi'
export { memoryApi, type Memory, type CreateMemoryRequest, type SearchMemoryRequest, type MemorySearchResult, type MemoryContextRequest, type MemoryContextResponse } from './memoryApi'

// Import for default export
import { chatApi } from './chatApi'
import { memoryApi } from './memoryApi'
import { httpApi } from './httpApi'

// Re-export for convenience
export default {
  chat: chatApi,
  memory: memoryApi,
  http: httpApi
}

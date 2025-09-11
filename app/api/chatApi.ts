import { httpApi, ApiResponse } from './httpApi'

export interface ChatSession {
  id: string
  owner: string
  title: string
  messages: ChatMessage[]
  created_at: string
  updated_at: string
  message_count: number
  sui_object_id: string
}

export interface ChatMessage {
  id?: string
  content: string
  role?: string  
  type?: 'user' | 'assistant'  
  timestamp?: string
  memory_detected?: boolean
  memory_id?: string
}

export interface CreateSessionRequest {
  userAddress: string
  title?: string
  modelName: string
  suiObjectId?: string // Used when session is created directly on blockchain
}

export interface AddMessageRequest {
  userAddress: string
  content: string
  type: 'user' | 'assistant'
  memoryId?: string
  walrusHash?: string
}

export interface StreamChatRequest {
  text: string
  user_id: string
  session_id?: string
  model?: string
  originalUserMessage?: string
  memoryContext?: string
}

export interface StreamChatResponse {
  chunk?: string
  done?: boolean
  intent?: string
  entities?: any
  error?: string
}

export interface BackendSessionsResponse {
  success: boolean
  sessions: ChatSession[]
}

export interface BackendSessionResponse {
  success: boolean
  session: ChatSession
}

export interface BackendMessageResponse {
  success: boolean
  message: string
}

export const chatApi = {
  // Get all sessions for a user
  getSessions: async (userAddress: string): Promise<BackendSessionsResponse> => {
    return httpApi.get(`/api/chat/sessions?userAddress=${userAddress}`)
  },

  // Get a specific session
  getSession: async (sessionId: string, userAddress: string): Promise<BackendSessionResponse> => {
    return httpApi.get(`/api/chat/sessions/${sessionId}?userAddress=${userAddress}`)
  },

  // Create a new session
  createSession: async (request: CreateSessionRequest): Promise<BackendSessionResponse> => {
    // Ensure modelName is set (use default if not provided)
    const requestWithModel = {
      ...request,
      modelName: request.modelName || 'gemini-2.0-flash'
    };
    return httpApi.post('/api/chat/sessions', requestWithModel)
  },

  // Add a message to a session
  addMessage: async (sessionId: string, request: AddMessageRequest): Promise<BackendMessageResponse> => {
    return httpApi.post(`/api/chat/sessions/${sessionId}/messages`, request)
  },

  // Delete a session
  deleteSession: async (sessionId: string, userAddress: string): Promise<BackendMessageResponse> => {
    return httpApi.delete(`/api/chat/sessions/${sessionId}`, {
      data: { userAddress }
    })
  },

  // Update session title
  updateSessionTitle: async (sessionId: string, userAddress: string, newTitle: string): Promise<ApiResponse<{ message: string }>> => {
    return httpApi.put(`/api/chat/sessions/${sessionId}/title`, {
      userAddress,
      title: newTitle
    })
  },

  // Stream chat (returns a Response object for streaming)
  streamChat: async (request: StreamChatRequest): Promise<Response> => {
    // Format request for backend
    const backendRequest = {
      text: request.text,
      userId: request.user_id,
      sessionId: request.session_id,
      model: request.model || 'gemini-2.0-flash',
      originalUserMessage: request.originalUserMessage,
      memoryContext: request.memoryContext
    };
    
    return httpApi.stream('/api/chat/stream', backendRequest)
  },

  // Send regular (non-streaming) chat message
  sendMessage: async (request: StreamChatRequest): Promise<ApiResponse<any>> => {
    const backendRequest = {
      text: request.text,
      userId: request.user_id,
      sessionId: request.session_id,
      model: request.model || 'gemini-2.0-flash',
      originalUserMessage: request.originalUserMessage,
      memoryContext: request.memoryContext
    };
    
    return httpApi.post('/api/chat', backendRequest)
  }
}

export default chatApi

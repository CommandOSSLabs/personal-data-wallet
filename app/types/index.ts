export interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: string // ISO string for consistency with backend
  memoryDetected?: boolean
  memoryId?: string | null
  memoryExtraction?: any // Memory extraction data from backend
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface MemoryItem {
  id: string
  content: string
  type: 'fact' | 'preference' | 'context'
  category: string
  createdAt: Date
  relatedSessions: string[]
}

export interface SendMessageRequest {
  text: string
  userId?: string
}

export interface SendMessageResponse {
  response: string
  intent: 'FACT_ADDITION' | 'QUERY' | 'CONVERSATIONAL'
  entities?: {
    nodes: string[]
    edges: Array<{
      source: string
      target: string
      label: string
    }>
  }
}

export interface ApiError {
  detail: string
}
export interface ChatMessage {
  id: string;
  type: string;
  content: string;
  timestamp: string;
  memoryId?: string;
  walrusHash?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  title: string;
  owner: string;
  summary?: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  message_count: number;
  sui_object_id?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessageResponse {
  content: string;
  type: string;
  memoryExtraction?: any;
  memoryStored?: boolean;
  memoryId?: string;
}

export interface ChatSessionResponse {
  session: ChatSession;
  success: boolean;
  message?: string;
}
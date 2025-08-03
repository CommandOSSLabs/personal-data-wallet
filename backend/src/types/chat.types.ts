/**
 * Common chat types used across the application
 */

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatSession {
  id: string;
  owner: string;
  title: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
  message_count: number;
  sui_object_id: string;
}
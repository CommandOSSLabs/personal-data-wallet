import { PDWApiClient } from '../api/client';
import { ChatSession, ChatMessageRequest, ChatMessageResponse, CreateChatSessionRequest, ChatSessionResponse, ChatSessionsResponse, AddMessageRequest, SaveSummaryRequest, ChatStreamOptions } from '../types';
/**
 * ChatService handles all chat-related operations including session management,
 * message sending, and streaming responses with memory context integration.
 */
export declare class ChatService {
    private apiClient;
    constructor(apiClient: PDWApiClient);
    /**
     * Get all chat sessions for a user
     */
    getSessions(userAddress: string): Promise<ChatSessionsResponse>;
    /**
     * Get a specific chat session with messages
     */
    getSession(sessionId: string, userAddress: string): Promise<ChatSessionResponse>;
    /**
     * Create a new chat session
     */
    createSession(request: CreateChatSessionRequest): Promise<ChatSessionResponse>;
    /**
     * Delete a chat session
     */
    deleteSession(sessionId: string, userAddress: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Update the title of a chat session
     */
    updateSessionTitle(sessionId: string, userAddress: string, title: string): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Add a message to a chat session
     */
    addMessage(sessionId: string, request: AddMessageRequest): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Save a summary for a chat session
     */
    saveSummary(request: SaveSummaryRequest): Promise<{
        success: boolean;
        message?: string;
    }>;
    /**
     * Send a non-streaming chat message
     */
    sendMessage(request: ChatMessageRequest): Promise<ChatMessageResponse>;
    /**
     * Stream chat responses using Server-Sent Events
     * Returns a promise that resolves when the stream completes
     */
    streamChat(request: ChatMessageRequest, options?: ChatStreamOptions): Promise<void>;
    /**
     * Stream chat using fetch API with streaming response
     */
    private streamChatWithFetch;
    /**
     * Convenient method to stream chat with simple callback
     */
    streamChatSimple(request: ChatMessageRequest, onMessage: (content: string) => void, onError?: (error: string) => void, onDone?: () => void): Promise<void>;
    /**
     * Create a convenient chat interface with session management
     */
    createChatInterface(userAddress: string, modelName?: string): Promise<{
        sessionId: string;
        session: ChatSession;
        sendMessage: (text: string) => Promise<ChatMessageResponse>;
        streamMessage: (text: string, options?: ChatStreamOptions) => Promise<void>;
        updateTitle: (title: string) => Promise<{
            success: boolean;
            message?: string;
        }>;
        addMessage: (content: string, type?: "user" | "assistant" | "system") => Promise<{
            success: boolean;
            message?: string;
        }>;
        delete: () => Promise<{
            success: boolean;
            message?: string;
        }>;
    }>;
}
//# sourceMappingURL=ChatService.d.ts.map
/**
 * Chat Service
 *
 * Handles chat operations with SSE streaming, session management,
 * memory context injection, and real-time AI responses.
 */
import { PDWApiClient } from '../api/client';
export class ChatService {
    constructor(client, config) {
        this.client = client;
        this.config = config;
        this.apiClient = new PDWApiClient(config.apiUrl);
    }
    // ==================== TOP-LEVEL METHODS ====================
    /**
     * Start a chat session with memory context integration
     */
    async startChat(options) {
        // Create session if not provided
        if (!options.sessionId) {
            const session = await this.createSession({
                userAddress: options.userAddress || options.userId,
            });
            options.sessionId = session.id;
        }
        // Send message and get response
        await this.apiClient.sendChatMessage(options);
        // Return session info
        return this.view.getChatSession(options.sessionId, options.userId);
    }
    /**
     * Stream chat responses with Server-Sent Events
     */
    streamChat(options) {
        return new Promise((resolve, reject) => {
            const eventSource = this.apiClient.createChatStream(options);
            const stream = new ReadableStream({
                start(controller) {
                    eventSource.onmessage = (event) => {
                        try {
                            const data = JSON.parse(event.data);
                            controller.enqueue(data);
                            if (data.type === 'end' || data.type === 'error') {
                                controller.close();
                                eventSource.close();
                            }
                        }
                        catch (error) {
                            controller.error(error);
                            eventSource.close();
                        }
                    };
                    eventSource.onerror = (error) => {
                        controller.error(error);
                        eventSource.close();
                    };
                },
                cancel() {
                    eventSource.close();
                }
            });
            resolve(stream);
        });
    }
    /**
     * Create a new chat session
     */
    async createSession(options) {
        const response = await this.apiClient.createChatSession(options);
        if (!response.success) {
            throw new Error(response.message || 'Failed to create chat session');
        }
        return response.data;
    }
    // ==================== VIEW METHODS ====================
    get view() {
        return {
            /**
             * Get all chat sessions for a user
             */
            getChatSessions: async (userAddress) => {
                const response = await this.apiClient.getChatSessions(userAddress);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to get chat sessions');
                }
                return response.data.sessions;
            },
            /**
             * Get specific chat session with messages
             */
            getChatSession: async (sessionId, userAddress) => {
                const response = await this.apiClient.getChatSession(sessionId, userAddress);
                if (!response.success) {
                    throw new Error(response.message || 'Failed to get chat session');
                }
                return response.data;
            },
        };
    }
    // ==================== SESSION MANAGEMENT ====================
    /**
     * Delete a chat session
     */
    async deleteSession(sessionId, userAddress) {
        const response = await this.apiClient.deleteChatSession(sessionId, userAddress);
        if (!response.success) {
            throw new Error(response.message || 'Failed to delete chat session');
        }
    }
}
//# sourceMappingURL=ChatService.js.map
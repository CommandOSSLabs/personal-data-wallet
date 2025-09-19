/**
 * API Client for Personal Data Wallet Backend
 *
 * Handles HTTP communication with the NestJS backend API
 */
export class PDWApiClient {
    constructor(apiUrl) {
        this.baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
        this.headers = {
            'Content-Type': 'application/json',
        };
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.headers,
                ...options.headers,
            },
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${errorText}`);
        }
        return response.json();
    }
    // ==================== MEMORY API ====================
    async createMemory(options) {
        return this.request('/memories', {
            method: 'POST',
            body: JSON.stringify({
                content: options.content,
                category: options.category,
                userAddress: options.userAddress,
                topic: options.topic,
                importance: options.importance,
                customMetadata: options.customMetadata,
            }),
        });
    }
    async getUserMemories(userAddress) {
        return this.request(`/memories?user=${encodeURIComponent(userAddress)}`);
    }
    async searchMemories(options) {
        return this.request('/memories/search', {
            method: 'POST',
            body: JSON.stringify(options),
        });
    }
    async getMemoryContext(options) {
        return this.request('/memories/context', {
            method: 'POST',
            body: JSON.stringify(options),
        });
    }
    async getMemoryStats(userAddress) {
        return this.request(`/memories/stats?userAddress=${encodeURIComponent(userAddress)}`);
    }
    async deleteMemory(memoryId, userAddress) {
        return this.request(`/memories/${memoryId}`, {
            method: 'DELETE',
            body: JSON.stringify({ userAddress }),
        });
    }
    async getBatchStats() {
        return this.request('/memories/batch-stats');
    }
    // ==================== CHAT API ====================
    async getChatSessions(userAddress) {
        return this.request(`/chat/sessions?userAddress=${encodeURIComponent(userAddress)}`);
    }
    async getChatSession(sessionId, userAddress) {
        return this.request(`/chat/sessions/${sessionId}?userAddress=${encodeURIComponent(userAddress)}`);
    }
    async createChatSession(options) {
        return this.request('/chat/sessions', {
            method: 'POST',
            body: JSON.stringify(options),
        });
    }
    async deleteChatSession(sessionId, userAddress) {
        return this.request(`/chat/sessions/${sessionId}`, {
            method: 'DELETE',
            body: JSON.stringify({ userAddress }),
        });
    }
    async sendChatMessage(options) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({
                text: options.text,
                userId: options.userId,
                sessionId: options.sessionId,
                model: options.model,
                userAddress: options.userAddress,
                memoryContext: options.memoryContext,
            }),
        });
    }
    /**
     * Create EventSource for streaming chat responses
     */
    createChatStream(options) {
        const params = new URLSearchParams({
            text: options.text,
            userId: options.userId,
            ...(options.sessionId && { sessionId: options.sessionId }),
            ...(options.model && { model: options.model }),
            ...(options.userAddress && { userAddress: options.userAddress }),
            ...(options.memoryContext && { memoryContext: options.memoryContext }),
        });
        return new EventSource(`${this.baseUrl}/chat/stream?${params.toString()}`);
    }
}
//# sourceMappingURL=client.js.map
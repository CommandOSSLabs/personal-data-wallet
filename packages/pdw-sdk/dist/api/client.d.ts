/**
 * API Client for Personal Data Wallet Backend
 *
 * Handles HTTP communication with the NestJS backend API
 */
import type { APIResponse, MemoryCreateOptions, MemorySearchOptions, MemorySearchResult, MemoryContext, MemoryContextOptions, ChatOptions, ChatSession, CreateSessionOptions, MemoryStatsResponse } from '../types';
import type { BatchStats } from '../core';
export declare class PDWApiClient {
    private baseUrl;
    private headers;
    get baseURL(): string;
    get defaultHeaders(): Record<string, string>;
    constructor(apiUrl: string);
    private request;
    createMemory(options: MemoryCreateOptions): Promise<APIResponse<{
        memoryId: string;
    }>>;
    getUserMemories(userAddress: string): Promise<APIResponse<{
        memories: MemorySearchResult[];
    }>>;
    searchMemories(options: MemorySearchOptions): Promise<APIResponse<{
        results: MemorySearchResult[];
    }>>;
    getMemoryContext(options: MemoryContextOptions): Promise<APIResponse<MemoryContext>>;
    getMemoryStats(userAddress: string): Promise<APIResponse<MemoryStatsResponse>>;
    deleteMemory(memoryId: string, userAddress: string): Promise<APIResponse<void>>;
    getBatchStats(): Promise<APIResponse<BatchStats>>;
    getChatSessions(userAddress: string): Promise<APIResponse<{
        sessions: ChatSession[];
    }>>;
    getChatSession(sessionId: string, userAddress: string): Promise<APIResponse<ChatSession>>;
    createChatSession(options: CreateSessionOptions): Promise<APIResponse<ChatSession>>;
    deleteChatSession(sessionId: string, userAddress: string): Promise<APIResponse<void>>;
    sendChatMessage(options: ChatOptions): Promise<APIResponse<any>>;
    updateChatSessionTitle(sessionId: string, userAddress: string, title: string): Promise<APIResponse<void>>;
    addMessageToSession(sessionId: string, content: string, type: string, userAddress: string): Promise<APIResponse<void>>;
    saveChatSummary(sessionId: string, summary: string, userAddress: string): Promise<APIResponse<void>>;
    /**
     * Create EventSource for streaming chat responses
     */
    createChatStream(options: ChatOptions): EventSource;
}
//# sourceMappingURL=client.d.ts.map
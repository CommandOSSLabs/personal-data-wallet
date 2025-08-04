import { ConfigService } from '@nestjs/config';
import { ChatMessage, ChatSession } from '../../types/chat.types';
export declare class SuiService {
    private configService;
    private client;
    private packageId;
    private adminKeypair;
    private logger;
    constructor(configService: ConfigService);
    getChatSessions(userAddress: string): Promise<ChatSession[]>;
    createChatSession(userAddress: string, modelName: string): Promise<string>;
    addMessageToSession(sessionId: string, userAddress: string, role: string, content: string): Promise<boolean>;
    saveSessionSummary(sessionId: string, userAddress: string, summary: string): Promise<boolean>;
    getChatSession(sessionId: string): Promise<{
        owner: string;
        modelName: string;
        messages: ChatMessage[];
        summary: string;
    }>;
    deleteSession(sessionId: string, userAddress: string): Promise<boolean>;
    updateSessionTitle(sessionId: string, userAddress: string, title: string): Promise<boolean>;
    createMemoryRecord(userAddress: string, category: string, vectorId: number, blobId: string): Promise<string>;
    createMemoryIndex(userAddress: string, indexBlobId: string, graphBlobId: string): Promise<string>;
    updateMemoryIndex(indexId: string, userAddress: string, expectedVersion: number, newIndexBlobId: string, newGraphBlobId: string): Promise<boolean>;
    getMemoryIndex(indexId: string): Promise<{
        owner: string;
        version: number;
        indexBlobId: string;
        graphBlobId: string;
    }>;
    getMemoriesWithVectorId(userAddress: string, vectorId: number): Promise<{
        id: string;
        category: string;
        blobId: string;
    }[]>;
    getUserMemories(userAddress: string): Promise<{
        id: string;
        category: string;
        blobId: string;
    }[]>;
    getMemory(memoryId: string): Promise<{
        id: string;
        owner: string;
        category: string;
        blobId: string;
        vectorId: number;
    }>;
    deleteMemory(memoryId: string, userAddress: string): Promise<boolean>;
    grantAppPermission(userAddress: string, appAddress: string, dataIds: string[], expiresAt: number): Promise<string>;
    revokeAppPermission(permissionId: string, userAddress: string): Promise<boolean>;
    getAppPermission(permissionId: string): Promise<{
        user: string;
        app: string;
        grantedAt: number;
        expiresAt: number;
        revoked: boolean;
        dataIds: string[];
    }>;
    getUserAppPermissions(userAddress: string): Promise<Array<{
        id: string;
        app: string;
        grantedAt: number;
        expiresAt: number;
        revoked: boolean;
    }>>;
    private executeTransaction;
    private extractCreatedObjectId;
    private deserializeMessages;
}

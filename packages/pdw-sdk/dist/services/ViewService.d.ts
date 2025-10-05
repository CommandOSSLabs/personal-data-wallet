/**
 * ViewService - Read-only blockchain query methods
 *
 * Provides methods for querying blockchain state without creating transactions.
 * Follows MystenLabs patterns for view/query operations.
 */
import type { PDWConfig, ClientWithCoreApi } from '../types';
export interface MemoryRecord {
    id: string;
    owner: string;
    category: string;
    vectorId: number;
    blobId: string;
    contentType: string;
    contentSize: number;
    contentHash: string;
    topic: string;
    importance: number;
    embeddingBlobId: string;
    createdAt: number;
    updatedAt: number;
}
export interface MemoryIndex {
    id: string;
    owner: string;
    version: number;
    indexBlobId: string;
    graphBlobId: string;
    memoryCount: number;
    lastUpdated: number;
}
export interface MemoryStats {
    totalMemories: number;
    categoryCounts: Record<string, number>;
    totalSize: number;
    averageImportance: number;
    lastActivityTime: number;
}
export interface AccessPermission {
    id: string;
    grantor: string;
    grantee: string;
    contentId: string;
    permissionType: string;
    expiresAt?: number;
    createdAt: number;
    isActive: boolean;
}
export interface ContentRegistry {
    id: string;
    owner: string;
    contentHash: string;
    encryptionInfo: string;
    accessCount: number;
    createdAt: number;
}
export declare class ViewService {
    private static readonly MAX_QUERY_LIMIT;
    private client;
    private config;
    constructor(client: ClientWithCoreApi, config: PDWConfig);
    /**
     * Get all memories owned by a user
     */
    getUserMemories(userAddress: string, options?: {
        limit?: number;
        cursor?: string;
        category?: string;
    }): Promise<{
        data: MemoryRecord[];
        nextCursor?: string;
        hasMore: boolean;
    }>;
    /**
     * Get a specific memory by ID
     */
    getMemory(memoryId: string): Promise<MemoryRecord | null>;
    /**
     * Get memory index for a user
     */
    getMemoryIndex(userAddress: string): Promise<MemoryIndex | null>;
    /**
     * Get memory statistics for a user
     */
    getMemoryStats(userAddress: string): Promise<MemoryStats>;
    /**
     * Get access permissions for a user
     */
    getAccessPermissions(userAddress: string, options?: {
        asGrantor?: boolean;
        asGrantee?: boolean;
        activeOnly?: boolean;
    }): Promise<AccessPermission[]>;
    /**
     * Get content registry entries
     */
    getContentRegistry(options?: {
        owner?: string;
        limit?: number;
        cursor?: string;
    }): Promise<{
        data: ContentRegistry[];
        nextCursor?: string;
        hasMore: boolean;
    }>;
    /**
     * Check if an object exists and is accessible
     */
    objectExists(objectId: string): Promise<boolean>;
    /**
     * Get object type information
     */
    getObjectType(objectId: string): Promise<string | null>;
    /**
     * Search memories by content hash
     * Note: This requires event-based indexing or a search service in production
     */
    findMemoryByContentHash(contentHash: string): Promise<MemoryRecord[]>;
}
//# sourceMappingURL=ViewService.d.ts.map
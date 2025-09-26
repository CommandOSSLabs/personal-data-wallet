"use strict";
/**
 * ViewService - Read-only blockchain query methods
 *
 * Provides methods for querying blockchain state without creating transactions.
 * Follows MystenLabs patterns for view/query operations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewService = void 0;
class ViewService {
    constructor(client, config) {
        // Extract SuiClient from the core API wrapper
        this.client = client.client || client;
        this.config = config;
    }
    // ==================== MEMORY QUERIES ====================
    /**
     * Get all memories owned by a user
     */
    async getUserMemories(userAddress, options) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.config.packageId}::memory::Memory`,
                },
                options: {
                    showContent: true,
                    showType: true,
                },
                limit: options?.limit || 50,
                cursor: options?.cursor,
            });
            const memories = [];
            for (const obj of response.data) {
                if (obj.data?.content && 'fields' in obj.data.content) {
                    const fields = obj.data.content.fields;
                    // Filter by category if specified
                    if (options?.category && fields.category !== options.category) {
                        continue;
                    }
                    memories.push({
                        id: obj.data.objectId,
                        owner: fields.owner,
                        category: fields.category,
                        vectorId: parseInt(fields.vector_id),
                        blobId: fields.blob_id,
                        contentType: fields.content_type,
                        contentSize: parseInt(fields.content_size),
                        contentHash: fields.content_hash,
                        topic: fields.topic,
                        importance: parseInt(fields.importance),
                        embeddingBlobId: fields.embedding_blob_id,
                        createdAt: parseInt(fields.created_at || '0'),
                        updatedAt: parseInt(fields.updated_at || '0'),
                    });
                }
            }
            return {
                data: memories,
                nextCursor: response.nextCursor || undefined,
                hasMore: response.hasNextPage,
            };
        }
        catch (error) {
            throw new Error(`Failed to get user memories: ${error}`);
        }
    }
    /**
     * Get a specific memory by ID
     */
    async getMemory(memoryId) {
        try {
            const response = await this.client.getObject({
                id: memoryId,
                options: {
                    showContent: true,
                    showType: true,
                },
            });
            if (!response.data?.content || !('fields' in response.data.content)) {
                return null;
            }
            const fields = response.data.content.fields;
            return {
                id: response.data.objectId,
                owner: fields.owner,
                category: fields.category,
                vectorId: parseInt(fields.vector_id),
                blobId: fields.blob_id,
                contentType: fields.content_type,
                contentSize: parseInt(fields.content_size),
                contentHash: fields.content_hash,
                topic: fields.topic,
                importance: parseInt(fields.importance),
                embeddingBlobId: fields.embedding_blob_id,
                createdAt: parseInt(fields.created_at || '0'),
                updatedAt: parseInt(fields.updated_at || '0'),
            };
        }
        catch (error) {
            throw new Error(`Failed to get memory: ${error}`);
        }
    }
    /**
     * Get memory index for a user
     */
    async getMemoryIndex(userAddress) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.config.packageId}::memory::MemoryIndex`,
                },
                options: {
                    showContent: true,
                    showType: true,
                },
                limit: 1,
            });
            if (response.data.length === 0) {
                return null;
            }
            const obj = response.data[0];
            if (!obj.data?.content || !('fields' in obj.data.content)) {
                return null;
            }
            const fields = obj.data.content.fields;
            return {
                id: obj.data.objectId,
                owner: fields.owner,
                version: parseInt(fields.version),
                indexBlobId: fields.index_blob_id,
                graphBlobId: fields.graph_blob_id,
                memoryCount: parseInt(fields.memory_count || '0'),
                lastUpdated: parseInt(fields.last_updated || '0'),
            };
        }
        catch (error) {
            throw new Error(`Failed to get memory index: ${error}`);
        }
    }
    /**
     * Get memory statistics for a user
     */
    async getMemoryStats(userAddress) {
        try {
            const memories = await this.getUserMemories(userAddress, { limit: 1000 });
            const categoryCounts = {};
            let totalSize = 0;
            let totalImportance = 0;
            let lastActivityTime = 0;
            for (const memory of memories.data) {
                // Count categories
                categoryCounts[memory.category] = (categoryCounts[memory.category] || 0) + 1;
                // Sum sizes
                totalSize += memory.contentSize;
                // Sum importance for average
                totalImportance += memory.importance;
                // Track latest activity
                if (memory.updatedAt > lastActivityTime) {
                    lastActivityTime = memory.updatedAt;
                }
            }
            return {
                totalMemories: memories.data.length,
                categoryCounts,
                totalSize,
                averageImportance: memories.data.length > 0 ? totalImportance / memories.data.length : 0,
                lastActivityTime,
            };
        }
        catch (error) {
            throw new Error(`Failed to get memory stats: ${error}`);
        }
    }
    // ==================== ACCESS CONTROL QUERIES ====================
    /**
     * Get access permissions for a user
     */
    async getAccessPermissions(userAddress, options) {
        try {
            const permissions = [];
            // Query as grantor (permissions granted by user)
            if (options?.asGrantor !== false) {
                const grantorResponse = await this.client.getOwnedObjects({
                    owner: userAddress,
                    filter: {
                        StructType: `${this.config.packageId}::seal_access_control::AccessPermission`,
                    },
                    options: {
                        showContent: true,
                        showType: true,
                    },
                });
                for (const obj of grantorResponse.data) {
                    if (obj.data?.content && 'fields' in obj.data.content) {
                        const fields = obj.data.content.fields;
                        const expiresAt = fields.expires_at ? parseInt(fields.expires_at) : undefined;
                        const isActive = !expiresAt || expiresAt > Date.now();
                        if (!options?.activeOnly || isActive) {
                            permissions.push({
                                id: obj.data.objectId,
                                grantor: fields.grantor,
                                grantee: fields.grantee,
                                contentId: fields.content_id,
                                permissionType: fields.permission_type,
                                expiresAt,
                                createdAt: parseInt(fields.created_at),
                                isActive,
                            });
                        }
                    }
                }
            }
            // Query as grantee (permissions granted to user) - would need events or indexing
            if (options?.asGrantee !== false) {
                // Note: In a real implementation, this would require event querying
                // or a secondary index to find permissions where user is the grantee
                // For now, we'll note this limitation
            }
            return permissions;
        }
        catch (error) {
            throw new Error(`Failed to get access permissions: ${error}`);
        }
    }
    /**
     * Get content registry entries
     */
    async getContentRegistry(options) {
        try {
            const queryOptions = {
                filter: {
                    StructType: `${this.config.packageId}::seal_access_control::ContentRegistry`,
                },
                options: {
                    showContent: true,
                    showType: true,
                },
                limit: options?.limit || 50,
                cursor: options?.cursor,
            };
            // If owner specified, query owned objects
            if (options?.owner) {
                queryOptions.owner = options.owner;
            }
            // Query objects - for non-owned queries, we'll use a different approach
            let response;
            if (options?.owner) {
                response = await this.client.getOwnedObjects(queryOptions);
            }
            else {
                // For general queries without owner, we'll need to use events or other indexing
                // For now, return empty result as this requires additional infrastructure
                response = { data: [], nextCursor: null, hasNextPage: false };
            }
            const registries = [];
            for (const obj of response.data) {
                if (obj.data?.content && 'fields' in obj.data.content) {
                    const fields = obj.data.content.fields;
                    registries.push({
                        id: obj.data.objectId,
                        owner: fields.owner,
                        contentHash: fields.content_hash,
                        encryptionInfo: fields.encryption_info,
                        accessCount: parseInt(fields.access_count || '0'),
                        createdAt: parseInt(fields.created_at),
                    });
                }
            }
            return {
                data: registries,
                nextCursor: response.nextCursor || undefined,
                hasMore: response.hasNextPage,
            };
        }
        catch (error) {
            throw new Error(`Failed to get content registry: ${error}`);
        }
    }
    // ==================== UTILITY QUERIES ====================
    /**
     * Check if an object exists and is accessible
     */
    async objectExists(objectId) {
        try {
            const response = await this.client.getObject({
                id: objectId,
                options: { showType: true },
            });
            return response.data !== null;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get object type information
     */
    async getObjectType(objectId) {
        try {
            const response = await this.client.getObject({
                id: objectId,
                options: { showType: true },
            });
            return response.data?.type || null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Search memories by content hash
     * Note: This requires event-based indexing or a search service in production
     */
    async findMemoryByContentHash(contentHash) {
        try {
            // Note: This would typically require an event-based search or indexing service
            // For now, we'll return empty as this requires additional infrastructure
            // In a real implementation, this would use event queries or an indexing service
            console.warn('findMemoryByContentHash: This method requires event indexing infrastructure');
            return [];
        }
        catch (error) {
            throw new Error(`Failed to find memory by content hash: ${error}`);
        }
    }
}
exports.ViewService = ViewService;
//# sourceMappingURL=ViewService.js.map
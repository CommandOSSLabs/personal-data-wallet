/**
 * ViewService Integration Tests
 * 
 * Tests read-only blockchain query methods for memory and access control operations.
 * Based on established Jest patterns with comprehensive mocking and error handling.
 */

require('dotenv').config({ path: '.env.test' });

const { ViewService } = require('../../dist/view/ViewService');
const { SuiClient } = require('@mysten/sui/client');

describe('ViewService', () => {
  let viewService: any;
  let mockSuiClient: any;
  let testConfig: any;
  const testAddress = '0x1234567890abcdef1234567890abcdef12345678';
  const testPackageId = '0x8765432109fedcba8765432109fedcba87654321';

  beforeAll(async () => {
    // Test configuration
    testConfig = {
      packageId: testPackageId,
      apiUrl: 'https://test-api.example.com',
    };

    // Mock SuiClient with comprehensive method stubs
    mockSuiClient = {
      getOwnedObjects: jest.fn(),
      getObject: jest.fn(),
      queryEvents: jest.fn(),
      getCheckpoint: jest.fn(),
    };

    // Initialize ViewService with mocked client
    viewService = new ViewService(mockSuiClient, testConfig);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  // ==================== OBJECT EXISTENCE TESTS ====================

  describe('objectExists', () => {
    test('should return true for existing object', async () => {
      const testObjectId = '0xabcdef1234567890abcdef1234567890abcdef12';
      
      mockSuiClient.getObject.mockResolvedValue({
        data: {
          objectId: testObjectId,
          type: `${testPackageId}::memory::Memory`,
        }
      });

      const exists = await viewService.objectExists(testObjectId);
      
      expect(exists).toBe(true);
      expect(mockSuiClient.getObject).toHaveBeenCalledWith({
        id: testObjectId,
        options: { showType: true }
      });
    });

    test('should return false for non-existent object', async () => {
      const testObjectId = '0xnonexistent1234567890abcdef1234567890';
      
      mockSuiClient.getObject.mockResolvedValue({
        data: null
      });

      const exists = await viewService.objectExists(testObjectId);
      
      expect(exists).toBe(false);
    });

    test('should return false when client throws error', async () => {
      const testObjectId = '0xerror1234567890abcdef1234567890abcd';
      
      mockSuiClient.getObject.mockRejectedValue(new Error('Network error'));

      const exists = await viewService.objectExists(testObjectId);
      
      expect(exists).toBe(false);
    });

    test('should handle invalid object ID format gracefully', async () => {
      const invalidObjectId = 'invalid-object-id';
      
      mockSuiClient.getObject.mockRejectedValue(new Error('Invalid object ID'));

      const exists = await viewService.objectExists(invalidObjectId);
      
      expect(exists).toBe(false);
    });
  });

  describe('getObjectType', () => {
    test('should return object type for valid object', async () => {
      const testObjectId = '0xabcdef1234567890abcdef1234567890abcdef12';
      const expectedType = `${testPackageId}::memory::Memory`;
      
      mockSuiClient.getObject.mockResolvedValue({
        data: {
          objectId: testObjectId,
          type: expectedType,
        }
      });

      const objectType = await viewService.getObjectType(testObjectId);
      
      expect(objectType).toBe(expectedType);
    });

    test('should return null for non-existent object', async () => {
      const testObjectId = '0xnonexistent1234567890abcdef1234567890';
      
      mockSuiClient.getObject.mockResolvedValue({
        data: null
      });

      const objectType = await viewService.getObjectType(testObjectId);
      
      expect(objectType).toBe(null);
    });

    test('should return null when client throws error', async () => {
      const testObjectId = '0xerror1234567890abcdef1234567890abcd';
      
      mockSuiClient.getObject.mockRejectedValue(new Error('Network error'));

      const objectType = await viewService.getObjectType(testObjectId);
      
      expect(objectType).toBe(null);
    });
  });

  // ==================== USER MEMORY QUERIES ====================

  describe('getUserMemories', () => {
    const mockMemoryData = [
      {
        data: {
          objectId: '0xmemory1234567890abcdef1234567890abcdef',
          content: {
            fields: {
              owner: testAddress,
              category: 'personal',
              vector_id: '123',
              blob_id: 'walrus_blob_123',
              content_type: 'text/plain',
              content_size: '1024',
              content_hash: 'hash123',
              topic: 'Test Memory',
              importance: '5',
              embedding_blob_id: 'embedding_123',
              created_at: '1234567890',
              updated_at: '1234567890',
            }
          }
        }
      },
      {
        data: {
          objectId: '0xmemory2345678901bcdef2345678901bcdef2',
          content: {
            fields: {
              owner: testAddress,
              category: 'work',
              vector_id: '124',
              blob_id: 'walrus_blob_124',
              content_type: 'application/json',
              content_size: '2048',
              content_hash: 'hash124',
              topic: 'Work Memory',
              importance: '8',
              embedding_blob_id: 'embedding_124',
              created_at: '1234567891',
              updated_at: '1234567891',
            }
          }
        }
      }
    ];

    test('should get user memories with default options', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: mockMemoryData,
        nextCursor: null,
        hasNextPage: false,
      });

      const result = await viewService.getUserMemories(testAddress);
      
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
      expect(result.nextCursor).toBeUndefined();
      
      expect(result.data[0]).toEqual({
        id: '0xmemory1234567890abcdef1234567890abcdef',
        owner: testAddress,
        category: 'personal',
        vectorId: 123,
        blobId: 'walrus_blob_123',
        contentType: 'text/plain',
        contentSize: 1024,
        contentHash: 'hash123',
        topic: 'Test Memory',
        importance: 5,
        embeddingBlobId: 'embedding_123',
        createdAt: 1234567890,
        updatedAt: 1234567890,
      });

      expect(mockSuiClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: testAddress,
        filter: {
          StructType: `${testPackageId}::memory::Memory`,
        },
        options: {
          showContent: true,
          showType: true,
        },
        limit: 50,
        cursor: undefined,
      });
    });

    test('should get user memories with pagination', async () => {
      const cursor = 'test_cursor_123';
      const limit = 25;

      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: mockMemoryData.slice(0, 1),
        nextCursor: 'next_cursor_456',
        hasNextPage: true,
      });

      const result = await viewService.getUserMemories(testAddress, {
        limit,
        cursor,
      });
      
      expect(result.data).toHaveLength(1);
      expect(result.hasMore).toBe(true);
      expect(result.nextCursor).toBe('next_cursor_456');

      expect(mockSuiClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: testAddress,
        filter: {
          StructType: `${testPackageId}::memory::Memory`,
        },
        options: {
          showContent: true,
          showType: true,
        },
        limit,
        cursor,
      });
    });

    test('should filter memories by category', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: mockMemoryData,
        nextCursor: null,
        hasNextPage: false,
      });

      const result = await viewService.getUserMemories(testAddress, {
        category: 'work',
      });
      
      // Should filter out 'personal' category, leaving only 'work'
      expect(result.data).toHaveLength(1);
      expect(result.data[0].category).toBe('work');
    });

    test('should handle empty result', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: [],
        nextCursor: null,
        hasNextPage: false,
      });

      const result = await viewService.getUserMemories(testAddress);
      
      expect(result.data).toHaveLength(0);
      expect(result.hasMore).toBe(false);
    });

    test('should handle client error', async () => {
      mockSuiClient.getOwnedObjects.mockRejectedValue(new Error('Network failure'));

      await expect(viewService.getUserMemories(testAddress))
        .rejects.toThrow('Failed to get user memories: Error: Network failure');
    });
  });

  // ==================== SPECIFIC MEMORY QUERIES ====================

  describe('getMemory', () => {
    const testMemoryId = '0xmemory1234567890abcdef1234567890abcdef';
    const mockMemoryResponse = {
      data: {
        objectId: testMemoryId,
        content: {
          fields: {
            owner: testAddress,
            category: 'personal',
            vector_id: '123',
            blob_id: 'walrus_blob_123',
            content_type: 'text/plain',
            content_size: '1024',
            content_hash: 'hash123',
            topic: 'Test Memory',
            importance: '5',
            embedding_blob_id: 'embedding_123',
            created_at: '1234567890',
            updated_at: '1234567890',
          }
        }
      }
    };

    test('should get specific memory by ID', async () => {
      mockSuiClient.getObject.mockResolvedValue(mockMemoryResponse);

      const memory = await viewService.getMemory(testMemoryId);
      
      expect(memory).toEqual({
        id: testMemoryId,
        owner: testAddress,
        category: 'personal',
        vectorId: 123,
        blobId: 'walrus_blob_123',
        contentType: 'text/plain',
        contentSize: 1024,
        contentHash: 'hash123',
        topic: 'Test Memory',
        importance: 5,
        embeddingBlobId: 'embedding_123',
        createdAt: 1234567890,
        updatedAt: 1234567890,
      });

      expect(mockSuiClient.getObject).toHaveBeenCalledWith({
        id: testMemoryId,
        options: {
          showContent: true,
          showType: true,
        },
      });
    });

    test('should return null for non-existent memory', async () => {
      mockSuiClient.getObject.mockResolvedValue({
        data: null
      });

      const memory = await viewService.getMemory(testMemoryId);
      
      expect(memory).toBe(null);
    });

    test('should return null for object without content', async () => {
      mockSuiClient.getObject.mockResolvedValue({
        data: {
          objectId: testMemoryId,
          content: null
        }
      });

      const memory = await viewService.getMemory(testMemoryId);
      
      expect(memory).toBe(null);
    });

    test('should handle client error', async () => {
      mockSuiClient.getObject.mockRejectedValue(new Error('Object not found'));

      await expect(viewService.getMemory(testMemoryId))
        .rejects.toThrow('Failed to get memory: Error: Object not found');
    });
  });

  // ==================== MEMORY INDEX QUERIES ====================

  describe('getMemoryIndex', () => {
    const mockIndexResponse = {
      data: [
        {
          data: {
            objectId: '0xindex1234567890abcdef1234567890abcdef',
            content: {
              fields: {
                owner: testAddress,
                version: '1',
                index_blob_id: 'index_blob_123',
                graph_blob_id: 'graph_blob_123',
                memory_count: '42',
                last_updated: '1234567890',
              }
            }
          }
        }
      ],
      nextCursor: null,
      hasNextPage: false,
    };

    test('should get memory index for user', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue(mockIndexResponse);

      const index = await viewService.getMemoryIndex(testAddress);
      
      expect(index).toEqual({
        id: '0xindex1234567890abcdef1234567890abcdef',
        owner: testAddress,
        version: 1,
        indexBlobId: 'index_blob_123',
        graphBlobId: 'graph_blob_123',
        memoryCount: 42,
        lastUpdated: 1234567890,
      });

      expect(mockSuiClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: testAddress,
        filter: {
          StructType: `${testPackageId}::memory::MemoryIndex`,
        },
        options: {
          showContent: true,
          showType: true,
        },
        limit: 1,
      });
    });

    test('should return null when no index exists', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: [],
        nextCursor: null,
        hasNextPage: false,
      });

      const index = await viewService.getMemoryIndex(testAddress);
      
      expect(index).toBe(null);
    });

    test('should return null for object without content', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: [
          {
            data: {
              objectId: '0xindex1234567890abcdef1234567890abcdef',
              content: null
            }
          }
        ],
        nextCursor: null,
        hasNextPage: false,
      });

      const index = await viewService.getMemoryIndex(testAddress);
      
      expect(index).toBe(null);
    });

    test('should handle client error', async () => {
      mockSuiClient.getOwnedObjects.mockRejectedValue(new Error('Network error'));

      await expect(viewService.getMemoryIndex(testAddress))
        .rejects.toThrow('Failed to get memory index: Error: Network error');
    });
  });

  // ==================== MEMORY STATISTICS ====================

  describe('getMemoryStats', () => {
    const mockStatsMemories = {
      data: [
        {
          id: '0xmemory1',
          owner: testAddress,
          category: 'personal',
          vectorId: 1,
          blobId: 'blob1',
          contentType: 'text/plain',
          contentSize: 1000,
          contentHash: 'hash1',
          topic: 'Memory 1',
          importance: 5,
          embeddingBlobId: 'embed1',
          createdAt: 1234567890,
          updatedAt: 1234567890,
        },
        {
          id: '0xmemory2',
          owner: testAddress,
          category: 'work',
          vectorId: 2,
          blobId: 'blob2',
          contentType: 'text/plain',
          contentSize: 2000,
          contentHash: 'hash2',
          topic: 'Memory 2',
          importance: 8,
          embeddingBlobId: 'embed2',
          createdAt: 1234567891,
          updatedAt: 1234567892,
        },
        {
          id: '0xmemory3',
          owner: testAddress,
          category: 'personal',
          vectorId: 3,
          blobId: 'blob3',
          contentType: 'application/json',
          contentSize: 1500,
          contentHash: 'hash3',
          topic: 'Memory 3',
          importance: 3,
          embeddingBlobId: 'embed3',
          createdAt: 1234567893,
          updatedAt: 1234567894,
        }
      ],
      nextCursor: undefined,
      hasMore: false,
    };

    test('should calculate memory statistics correctly', async () => {
      // Mock getUserMemories to return test data
      jest.spyOn(viewService, 'getUserMemories').mockResolvedValue(mockStatsMemories);

      const stats = await viewService.getMemoryStats(testAddress);
      
      expect(stats).toEqual({
        totalMemories: 3,
        categoryCounts: {
          personal: 2,
          work: 1,
        },
        totalSize: 4500,
        averageImportance: (5 + 8 + 3) / 3, // 5.33...
        lastActivityTime: 1234567894,
      });

      expect(viewService.getUserMemories).toHaveBeenCalledWith(testAddress, { limit: 1000 });
    });

    test('should handle empty memories', async () => {
      jest.spyOn(viewService, 'getUserMemories').mockResolvedValue({
        data: [],
        nextCursor: undefined,
        hasMore: false,
      });

      const stats = await viewService.getMemoryStats(testAddress);
      
      expect(stats).toEqual({
        totalMemories: 0,
        categoryCounts: {},
        totalSize: 0,
        averageImportance: 0,
        lastActivityTime: 0,
      });
    });

    test('should handle getUserMemories error', async () => {
      jest.spyOn(viewService, 'getUserMemories').mockRejectedValue(new Error('Memory fetch failed'));

      await expect(viewService.getMemoryStats(testAddress))
        .rejects.toThrow('Failed to get memory stats: Error: Memory fetch failed');
    });
  });

  // ==================== ACCESS CONTROL QUERIES ====================

  describe('getAccessPermissions', () => {
    const mockPermissionData = [
      {
        data: {
          objectId: '0xperm1234567890abcdef1234567890abcdef',
          content: {
            fields: {
              grantor: testAddress,
              grantee: '0x9876543210fedcba9876543210fedcba98765432',
              content_id: '0xcontent123',
              permission_type: 'read',
              expires_at: (Date.now() + 3600000).toString(), // 1 hour from now
              created_at: '1234567890',
            }
          }
        }
      },
      {
        data: {
          objectId: '0xperm2345678901bcdef2345678901bcdef2',
          content: {
            fields: {
              grantor: testAddress,
              grantee: '0x8765432109fedcba8765432109fedcba87654321',
              content_id: '0xcontent124',
              permission_type: 'write',
              expires_at: (Date.now() - 3600000).toString(), // 1 hour ago (expired)
              created_at: '1234567891',
            }
          }
        }
      }
    ];

    test('should get access permissions as grantor', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: mockPermissionData,
        nextCursor: null,
        hasNextPage: false,
      });

      const permissions = await viewService.getAccessPermissions(testAddress);
      
      expect(permissions).toHaveLength(2);
      expect(permissions[0].grantor).toBe(testAddress);
      expect(permissions[0].permissionType).toBe('read');
      expect(permissions[0].isActive).toBe(true);
      expect(permissions[1].isActive).toBe(false); // expired

      expect(mockSuiClient.getOwnedObjects).toHaveBeenCalledWith({
        owner: testAddress,
        filter: {
          StructType: `${testPackageId}::seal_access_control::AccessPermission`,
        },
        options: {
          showContent: true,
          showType: true,
        },
      });
    });

    test('should filter active permissions only', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: mockPermissionData,
        nextCursor: null,
        hasNextPage: false,
      });

      const permissions = await viewService.getAccessPermissions(testAddress, {
        activeOnly: true,
      });
      
      expect(permissions).toHaveLength(1);
      expect(permissions[0].isActive).toBe(true);
    });

    test('should handle permissions without expiration', async () => {
      const neverExpiringPermission = [{
        data: {
          objectId: '0xperm3456789012cdef3456789012cdef3',
          content: {
            fields: {
              grantor: testAddress,
              grantee: '0x7654321098fedcba7654321098fedcba76543210',
              content_id: '0xcontent125',
              permission_type: 'admin',
              expires_at: null,
              created_at: '1234567892',
            }
          }
        }
      }];

      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: neverExpiringPermission,
        nextCursor: null,
        hasNextPage: false,
      });

      const permissions = await viewService.getAccessPermissions(testAddress);
      
      expect(permissions).toHaveLength(1);
      expect(permissions[0].expiresAt).toBeUndefined();
      expect(permissions[0].isActive).toBe(true);
    });

    test('should handle client error', async () => {
      mockSuiClient.getOwnedObjects.mockRejectedValue(new Error('Permission query failed'));

      await expect(viewService.getAccessPermissions(testAddress))
        .rejects.toThrow('Failed to get access permissions: Error: Permission query failed');
    });
  });

  // ==================== BCS TYPE VALIDATION ====================

  describe('BCS integration patterns', () => {
    test('should handle object type validation with package structure', async () => {
      const memoryType = `${testPackageId}::memory::Memory`;
      const indexType = `${testPackageId}::memory::MemoryIndex`;
      const permissionType = `${testPackageId}::seal_access_control::AccessPermission`;

      // Test memory type
      mockSuiClient.getObject.mockResolvedValueOnce({
        data: { objectId: '0xtest1', type: memoryType }
      });
      
      const type1 = await viewService.getObjectType('0xtest1');
      expect(type1).toBe(memoryType);

      // Test index type  
      mockSuiClient.getObject.mockResolvedValueOnce({
        data: { objectId: '0xtest2', type: indexType }
      });
      
      const type2 = await viewService.getObjectType('0xtest2');
      expect(type2).toBe(indexType);

      // Test permission type
      mockSuiClient.getObject.mockResolvedValueOnce({
        data: { objectId: '0xtest3', type: permissionType }
      });
      
      const type3 = await viewService.getObjectType('0xtest3');
      expect(type3).toBe(permissionType);
    });

    test('should validate struct type filters in queries', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: [],
        nextCursor: null,
        hasNextPage: false,
      });

      await viewService.getUserMemories(testAddress);
      
      expect(mockSuiClient.getOwnedObjects).toHaveBeenCalledWith(
        expect.objectContaining({
          filter: {
            StructType: `${testPackageId}::memory::Memory`,
          }
        })
      );
    });
  });

  // ==================== ERROR HANDLING AND NETWORK FAILURES ====================

  describe('Error handling and resilience', () => {
    test('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      
      mockSuiClient.getOwnedObjects.mockRejectedValue(timeoutError);

      await expect(viewService.getUserMemories(testAddress))
        .rejects.toThrow('Failed to get user memories: TimeoutError: Request timeout');
    });

    test('should handle invalid response structure', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: [
          {
            data: {
              objectId: '0xtest',
              content: {
                // Missing 'fields' property
                invalidStructure: true
              }
            }
          }
        ],
        nextCursor: null,
        hasNextPage: false,
      });

      const result = await viewService.getUserMemories(testAddress);
      
      // Should gracefully handle invalid structure by filtering out invalid objects
      expect(result.data).toHaveLength(0);
    });

    test('should handle malformed field data', async () => {
      mockSuiClient.getOwnedObjects.mockResolvedValue({
        data: [
          {
            data: {
              objectId: '0xtest',
              content: {
                fields: {
                  owner: testAddress,
                  category: 'test',
                  vector_id: 'invalid_number',
                  blob_id: 'blob1',
                  content_type: 'text/plain',
                  content_size: 'invalid_size',
                  content_hash: 'hash1',
                  topic: 'Test',
                  importance: 'invalid_importance',
                  embedding_blob_id: 'embed1',
                  created_at: 'invalid_timestamp',
                  updated_at: 'invalid_timestamp',
                }
              }
            }
          }
        ],
        nextCursor: null,
        hasNextPage: false,
      });

      const result = await viewService.getUserMemories(testAddress);
      
      // Should handle malformed data by parsing with fallbacks
      expect(result.data).toHaveLength(1);
      expect(result.data[0].vectorId).toBeNaN();
      expect(result.data[0].contentSize).toBeNaN();
      expect(result.data[0].importance).toBeNaN();
    });

    test('should handle rate limiting errors', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      
      mockSuiClient.getObject.mockRejectedValue(rateLimitError);

      await expect(viewService.getMemory('0xtest'))
        .rejects.toThrow('Failed to get memory: RateLimitError: Rate limit exceeded');
    });
  });

  console.log('✅ ViewService comprehensive tests created successfully');
  console.log('📋 Tests cover: object queries, memory operations, indexing, permissions, BCS validation, error handling');
});
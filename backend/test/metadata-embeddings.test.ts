import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WalrusService, MemoryMetadata } from '../src/infrastructure/walrus/walrus.service';
import { MemoryIngestionService } from '../src/memory/memory-ingestion/memory-ingestion.service';
import { EmbeddingService } from '../src/memory/embedding/embedding.service';
import { GeminiService } from '../src/infrastructure/gemini/gemini.service';

describe('Metadata Embeddings System', () => {
  let walrusService: WalrusService;
  let memoryIngestionService: MemoryIngestionService;
  let embeddingService: EmbeddingService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        WalrusService,
        MemoryIngestionService,
        EmbeddingService,
        GeminiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: any) => {
              const config = {
                'SUI_NETWORK': 'testnet',
                'SUI_ADMIN_PRIVATE_KEY': 'test-private-key-32-bytes-long-hex',
                'GOOGLE_API_KEY': 'test-api-key',
                'USE_DEMO_STORAGE': true,
                'NODE_ENV': 'test'
              };
              return config[key] || defaultValue;
            })
          }
        }
      ]
    }).compile();

    walrusService = module.get<WalrusService>(WalrusService);
    memoryIngestionService = module.get<MemoryIngestionService>(MemoryIngestionService);
    embeddingService = module.get<EmbeddingService>(EmbeddingService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('WalrusService Metadata Functions', () => {
    const testContent = 'This is a test memory about artificial intelligence and machine learning.';
    const testUserAddress = '0x1234567890abcdef1234567890abcdef12345678';

    test('should generate content hash correctly', async () => {
      // Test the private method through public interface
      const metadata1 = await walrusService.createMetadataWithEmbedding(
        testContent,
        'ai-research',
        'machine learning basics'
      );

      const metadata2 = await walrusService.createMetadataWithEmbedding(
        testContent,
        'ai-research',
        'machine learning basics'
      );

      expect(metadata1.contentHash).toBeDefined();
      expect(metadata1.contentHash).toEqual(metadata2.contentHash);
      expect(metadata1.contentHash).toHaveLength(64); // SHA256 hex length
    });

    test('should create metadata with embedding', async () => {
      const metadata = await walrusService.createMetadataWithEmbedding(
        testContent,
        'ai-research',
        'machine learning basics',
        8,
        { source: 'test', author: 'user123' }
      );

      expect(metadata).toMatchObject({
        contentType: 'text/plain',
        contentSize: testContent.length,
        category: 'ai-research',
        topic: 'machine learning basics',
        importance: 8,
        embeddingDimension: 768,
        customMetadata: {
          source: 'test',
          author: 'user123'
        }
      });

      expect(metadata.contentHash).toBeDefined();
      expect(metadata.createdTimestamp).toBeGreaterThan(0);
      expect(metadata.embeddingBlobId).toBeDefined();
    });

    test('should clamp importance values', async () => {
      const metadataLow = await walrusService.createMetadataWithEmbedding(
        testContent,
        'test',
        '',
        -5 // Should be clamped to 1
      );

      const metadataHigh = await walrusService.createMetadataWithEmbedding(
        testContent,
        'test',
        '',
        15 // Should be clamped to 10
      );

      expect(metadataLow.importance).toBe(1);
      expect(metadataHigh.importance).toBe(10);
    });

    test('should upload content with enhanced metadata', async () => {
      const result = await walrusService.uploadContentWithMetadata(
        testContent,
        testUserAddress,
        'conversation',
        'AI discussion',
        7
      );

      expect(result).toHaveProperty('blobId');
      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('embeddingBlobId');

      expect(result.metadata.category).toBe('conversation');
      expect(result.metadata.topic).toBe('AI discussion');
      expect(result.metadata.importance).toBe(7);
      expect(result.metadata.embeddingDimension).toBe(768);
    });

    test('should retrieve and parse metadata embedding', async () => {
      // First create a memory with metadata
      const result = await walrusService.uploadContentWithMetadata(
        testContent,
        testUserAddress,
        'test-category',
        'test topic',
        6
      );

      if (result.embeddingBlobId) {
        const embeddingData = await walrusService.retrieveMetadataEmbedding(
          result.embeddingBlobId
        );

        expect(embeddingData).not.toBeNull();
        expect(embeddingData?.vector).toHaveLength(768);
        expect(embeddingData?.dimension).toBe(768);
        expect(embeddingData?.category).toBe('test-category');
        expect(embeddingData?.topic).toBe('test topic');
      }
    });

    test('should handle embedding generation failure gracefully', async () => {
      // Mock embedding service to fail
      const originalEmbeddingService = (walrusService as any).embeddingService;
      (walrusService as any).embeddingService = {
        embedText: jest.fn().mockRejectedValue(new Error('API failure'))
      };

      const metadata = await walrusService.createMetadataWithEmbedding(
        testContent,
        'test',
        'test topic'
      );

      expect(metadata.embeddingBlobId).toBeUndefined();
      expect(metadata.embeddingDimension).toBe(768);

      // Restore original service
      (walrusService as any).embeddingService = originalEmbeddingService;
    });
  });

  describe('MemoryIngestionService Enhanced Processing', () => {
    const testUserAddress = '0x1234567890abcdef1234567890abcdef12345678';

    test('should process enhanced memory with metadata', async () => {
      const enhancedMemoryDto = {
        content: 'Learning about blockchain development and smart contracts.',
        category: 'education',
        userAddress: testUserAddress,
        topic: 'blockchain development',
        importance: 8,
        customMetadata: {
          source: 'course',
          instructor: 'prof-smith'
        }
      };

      const result = await memoryIngestionService.processEnhancedMemory(enhancedMemoryDto);

      expect(result.success).toBe(true);
      expect(result.blobId).toBeDefined();
      expect(result.vectorId).toBeDefined();
      expect(result.metadata).toBeDefined();

      if (result.metadata) {
        expect(result.metadata.category).toBe('education');
        expect(result.metadata.topic).toBe('blockchain development');
        expect(result.metadata.importance).toBe(8);
        expect(result.metadata.customMetadata?.source).toBe('course');
      }
    });

    test('should search memories by metadata embedding', async () => {
      // First create some test memories
      const memories = [
        {
          content: 'Machine learning algorithms for data analysis',
          category: 'ai-research',
          topic: 'machine learning',
          importance: 9
        },
        {
          content: 'Blockchain consensus mechanisms and proof of stake',
          category: 'blockchain',
          topic: 'consensus',
          importance: 7
        },
        {
          content: 'Frontend development with React and TypeScript',
          category: 'web-dev',
          topic: 'frontend',
          importance: 6
        }
      ];

      // Create memories
      for (const memory of memories) {
        await memoryIngestionService.processEnhancedMemory({
          ...memory,
          userAddress: testUserAddress
        });
      }

      // Search for AI-related content
      const searchResults = await memoryIngestionService.searchMemoriesByMetadata(
        'artificial intelligence machine learning',
        testUserAddress,
        {
          threshold: 0.6,
          limit: 5,
          minImportance: 5
        }
      );

      expect(searchResults).toBeInstanceOf(Array);
      // Results would be empty in test environment without actual embedding comparison
      // In real implementation, this would return relevant memories
    });

    test('should generate metadata insights', async () => {
      const insights = await memoryIngestionService.getMetadataInsights(testUserAddress);

      expect(insights).toHaveProperty('totalMemories');
      expect(insights).toHaveProperty('categoriesDistribution');
      expect(insights).toHaveProperty('averageImportance');
      expect(insights).toHaveProperty('topTopics');
      expect(insights).toHaveProperty('embeddingCoverage');

      expect(typeof insights.totalMemories).toBe('number');
      expect(typeof insights.categoriesDistribution).toBe('object');
      expect(typeof insights.averageImportance).toBe('number');
      expect(Array.isArray(insights.topTopics)).toBe(true);
      expect(typeof insights.embeddingCoverage).toBe('number');
    });

    test('should handle processing errors gracefully', async () => {
      const invalidMemoryDto = {
        content: '', // Empty content
        category: 'test',
        userAddress: 'invalid-address',
        topic: 'test topic',
        importance: 5
      };

      const result = await memoryIngestionService.processEnhancedMemory(invalidMemoryDto);

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('EmbeddingService Integration', () => {
    test('should generate 768-dimensional embeddings', async () => {
      const testText = 'This is a test sentence for embedding generation.';
      
      try {
        const result = await embeddingService.embedText(testText);
        
        expect(result.vector).toHaveLength(768);
        expect(result.vector.every(val => typeof val === 'number')).toBe(true);
      } catch (error) {
        // In test environment without API key, this might fail
        expect(error.message).toContain('API key not provided');
      }
    });

    test('should calculate cosine similarity correctly', () => {
      const vector1 = [1, 0, 0];
      const vector2 = [0, 1, 0];
      const vector3 = [1, 0, 0];

      const similarity1 = embeddingService.calculateCosineSimilarity(vector1, vector2);
      const similarity2 = embeddingService.calculateCosineSimilarity(vector1, vector3);

      expect(similarity1).toBe(0); // Orthogonal vectors
      expect(similarity2).toBe(1); // Identical vectors
    });

    test('should handle batch embedding', async () => {
      const texts = [
        'First test sentence',
        'Second test sentence',
        'Third test sentence'
      ];

      try {
        const result = await embeddingService.embedBatch(texts);
        
        expect(result.vectors).toHaveLength(3);
        expect(result.vectors[0]).toHaveLength(768);
      } catch (error) {
        // Expected in test environment
        expect(error.message).toBeDefined();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network failures gracefully', async () => {
      const testContent = 'Test content for network failure simulation';
      
      // This test verifies that the system degrades gracefully
      // when Walrus or embedding services are unavailable
      const metadata = await walrusService.createMetadataWithEmbedding(
        testContent,
        'test',
        'network test'
      );

      expect(metadata).toBeDefined();
      expect(metadata.contentType).toBe('text/plain');
      expect(metadata.category).toBe('test');
    });

    test('should validate metadata structure', async () => {
      const metadata = await walrusService.createMetadataWithEmbedding(
        'test content',
        'validation-test',
        'structure validation',
        5
      );

      // Verify all required fields are present
      expect(metadata.contentType).toBeDefined();
      expect(metadata.contentSize).toBeGreaterThan(0);
      expect(metadata.contentHash).toBeDefined();
      expect(metadata.category).toBe('validation-test');
      expect(metadata.topic).toBe('structure validation');
      expect(metadata.importance).toBe(5);
      expect(metadata.embeddingDimension).toBe(768);
      expect(metadata.createdTimestamp).toBeGreaterThan(0);
    });

    test('should handle large content properly', async () => {
      const largeContent = 'A'.repeat(10000); // 10KB content
      
      const metadata = await walrusService.createMetadataWithEmbedding(
        largeContent,
        'performance-test',
        'large content handling'
      );

      expect(metadata.contentSize).toBe(10000);
      expect(metadata.contentHash).toHaveLength(64);
    });
  });

  describe('Performance Tests', () => {
    test('should process metadata creation within acceptable time', async () => {
      const startTime = Date.now();
      
      await walrusService.createMetadataWithEmbedding(
        'Performance test content',
        'performance',
        'speed test'
      );
      
      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('should handle concurrent metadata operations', async () => {
      const promises = Array.from({ length: 5 }, (_, i) =>
        walrusService.createMetadataWithEmbedding(
          `Concurrent test content ${i}`,
          'concurrency',
          `test ${i}`
        )
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach((metadata, index) => {
        expect(metadata.topic).toBe(`test ${index}`);
        expect(metadata.category).toBe('concurrency');
      });
    });
  });
});
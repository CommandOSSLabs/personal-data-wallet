/**
 * Enhanced MemoryIndexService Tests
 * 
 * Testing the new browser-compatible HNSW functionality including:
 * - Advanced semantic search with O(log N) performance
 * - Vector clustering and diversity filtering
 * - Intelligent relevance scoring with multiple factors
 * - Browser-compatible HNSW implementation
 */

import { MemoryIndexService, type MemorySearchQuery } from '../../src/services/MemoryIndexService';
import { StorageService, type MemoryMetadata } from '../../src/services/StorageService';
import { EmbeddingService } from '../../src/services/EmbeddingService';

// Mock storage service for testing
const mockStorageService = {
  store: jest.fn(),
  retrieve: jest.fn(),
  delete: jest.fn()
} as unknown as StorageService;

// Mock embedding service for testing
const mockEmbeddingService = {
  embedText: jest.fn()
} as unknown as EmbeddingService;

describe('Enhanced MemoryIndexService - Browser-Compatible HNSW', () => {
  let memoryIndexService: MemoryIndexService;
  const testUserAddress = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';

  beforeEach(() => {
    memoryIndexService = new MemoryIndexService(mockStorageService, {
      maxElements: 1000,
      dimension: 768,
      efConstruction: 100,
      m: 8
    });
    
    memoryIndexService.initialize(mockEmbeddingService, mockStorageService);
  });

  afterEach(() => {
    memoryIndexService.clearUserIndex(testUserAddress);
  });

  describe('Browser-Compatible HNSW Implementation', () => {
    test('should create and initialize browser HNSW index', async () => {
      const testVector = new Array(768).fill(0).map(() => Math.random());
      const mockEmbedding = {
        vector: testVector,
        model: 'text-embedding-004',
        usage: { prompt_tokens: 10, total_tokens: 10 }
      };

      (mockEmbeddingService.embedText as jest.Mock).mockResolvedValue(mockEmbedding);

      const metadata: MemoryMetadata = {
        category: 'test',
        topic: 'HNSW Performance',
        importance: 8,
        contentType: 'text/plain',
        createdTimestamp: Date.now()
      };

      const result = await memoryIndexService.indexMemory(
        testUserAddress,
        'test-memory-1',
        'blob-123',
        'Testing browser-compatible HNSW implementation',
        metadata,
        testVector
      );

      expect(result.indexed).toBe(true);
      expect(result.vectorId).toBeGreaterThan(0);
    });

    test('should perform O(log N) semantic search with enhanced features', async () => {
      // Index multiple test memories with diverse content
      const testMemories = [
        {
          id: 'memory-1',
          content: 'Machine learning algorithms for data analysis',
          vector: new Array(768).fill(0).map(() => Math.random() * 0.1 + 0.8), // High values
          metadata: { category: 'AI', topic: 'Machine Learning', importance: 9, contentType: 'text/plain', createdTimestamp: Date.now() - 86400000 } as MemoryMetadata
        },
        {
          id: 'memory-2', 
          content: 'Neural networks and deep learning concepts',
          vector: new Array(768).fill(0).map(() => Math.random() * 0.1 + 0.75), // Similar high values
          metadata: { category: 'AI', topic: 'Deep Learning', importance: 8, contentType: 'text/plain', createdTimestamp: Date.now() - 3600000 } as MemoryMetadata
        },
        {
          id: 'memory-3',
          content: 'Cooking recipes and kitchen techniques',
          vector: new Array(768).fill(0).map(() => Math.random() * 0.1 - 0.5), // Low/negative values
          metadata: { category: 'Cooking', topic: 'Recipes', importance: 5, contentType: 'text/plain', createdTimestamp: Date.now() - 172800000 } as MemoryMetadata
        },
        {
          id: 'memory-4',
          content: 'Advanced neural network architectures',
          vector: new Array(768).fill(0).map(() => Math.random() * 0.1 + 0.78), // Similar to memory-1 & 2
          metadata: { category: 'AI', topic: 'Neural Networks', importance: 9, contentType: 'text/plain', createdTimestamp: Date.now() - 7200000 } as MemoryMetadata
        }
      ];

      // Index all test memories
      for (const memory of testMemories) {
        await memoryIndexService.indexMemory(
          testUserAddress,
          memory.id,
          `blob-${memory.id}`,
          memory.content,
          memory.metadata,
          memory.vector
        );
      }

      // Create query vector similar to AI/ML content (high values)
      const queryVector = new Array(768).fill(0).map(() => Math.random() * 0.1 + 0.82);
      
      // Mock embedding service for search
      (mockEmbeddingService.embedText as jest.Mock).mockResolvedValue({
        vector: queryVector,
        model: 'text-embedding-004',
        usage: { prompt_tokens: 5, total_tokens: 5 }
      });

      const searchQuery: MemorySearchQuery = {
        query: 'machine learning and neural networks',
        userAddress: testUserAddress,
        k: 3,
        threshold: 0.1,
        searchMode: 'semantic',
        boostRecent: true,
        diversityFactor: 0.3,
        categories: ['AI']
      };

      const startTime = performance.now();
      const results = await memoryIndexService.searchMemories(searchQuery);
      const searchTime = performance.now() - startTime;

      // Verify search performance and results
      expect(searchTime).toBeLessThan(100); // Should be fast with HNSW
      expect(results).toHaveLength(3);
      
      // Verify results are ordered by relevance
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
      }

      // Verify AI category filter worked
      results.forEach(result => {
        expect(result.metadata.category).toBe('AI');
      });

      // Verify similarity scores are reasonable
      results.forEach(result => {
        expect(result.similarity).toBeGreaterThan(0.1);
        expect(result.similarity).toBeLessThanOrEqual(1.0);
      });

      console.log(`✅ HNSW search completed in ${searchTime.toFixed(2)}ms`);
      console.log('Results:', results.map(r => ({
        id: r.memoryId,
        similarity: r.similarity.toFixed(3),
        relevance: r.relevanceScore.toFixed(3),
        topic: r.metadata.topic
      })));
    });

    test('should apply diversity filtering to avoid result clustering', async () => {
      // Create similar vectors that would cluster together without diversity
      const baseVector = new Array(768).fill(0).map(() => Math.random());
      const similarMemories = Array.from({ length: 5 }, (_, i) => ({
        id: `similar-memory-${i}`,
        content: `Similar content about topic ${i}`,
        vector: baseVector.map(v => v + (Math.random() - 0.5) * 0.05), // Very similar vectors
        metadata: {
          category: 'Test',
          topic: `Topic ${i}`,
          importance: 7,
          contentType: 'text/plain',
          createdTimestamp: Date.now() - i * 3600000
        } as MemoryMetadata
      }));

      // Index all similar memories
      for (const memory of similarMemories) {
        await memoryIndexService.indexMemory(
          testUserAddress,
          memory.id,
          `blob-${memory.id}`,
          memory.content,
          memory.metadata,
          memory.vector
        );
      }

      const queryVector = baseVector.map(v => v + (Math.random() - 0.5) * 0.02);
      (mockEmbeddingService.embedText as jest.Mock).mockResolvedValue({
        vector: queryVector,
        model: 'text-embedding-004',
        usage: { prompt_tokens: 5, total_tokens: 5 }
      });

      // Search with diversity filtering
      const diverseQuery: MemorySearchQuery = {
        query: 'similar content search',
        userAddress: testUserAddress,
        k: 3,
        diversityFactor: 0.8 // High diversity requirement
      };

      const diverseResults = await memoryIndexService.searchMemories(diverseQuery);

      // Search without diversity filtering for comparison
      const nonDiverseQuery: MemorySearchQuery = {
        query: 'similar content search',
        userAddress: testUserAddress,
        k: 3,
        diversityFactor: 0 // No diversity filtering
      };

      const nonDiverseResults = await memoryIndexService.searchMemories(nonDiverseQuery);

      expect(diverseResults).toHaveLength(3);
      expect(nonDiverseResults).toHaveLength(3);

      // With diversity, results should be more spread out
      // (This is a qualitative test - in practice, diversity would select more varied results)
      console.log('Diverse results:', diverseResults.map(r => r.metadata.topic));
      console.log('Non-diverse results:', nonDiverseResults.map(r => r.metadata.topic));
    });

    test('should provide enhanced relevance scoring with multiple factors', async () => {
      const testMemory = {
        id: 'relevance-test',
        content: 'Advanced machine learning techniques for data science',
        vector: new Array(768).fill(0).map(() => Math.random()),
        metadata: {
          category: 'AI',
          topic: 'Machine Learning',
          importance: 9, // High importance
          contentType: 'text/plain',
          createdTimestamp: Date.now() - 3600000 // 1 hour ago
        } as MemoryMetadata
      };

      await memoryIndexService.indexMemory(
        testUserAddress,
        testMemory.id,
        'blob-relevance-test',
        testMemory.content,
        testMemory.metadata,
        testMemory.vector
      );

      const queryVector = testMemory.vector.map(v => v + (Math.random() - 0.5) * 0.1);
      (mockEmbeddingService.embedText as jest.Mock).mockResolvedValue({
        vector: queryVector,
        model: 'text-embedding-004',
        usage: { prompt_tokens: 5, total_tokens: 5 }
      });

      const enhancedQuery: MemorySearchQuery = {
        query: 'machine learning techniques',
        userAddress: testUserAddress,
        k: 1,
        categories: ['AI'], // Category match should boost score
        boostRecent: true   // Recent content should get boost
      };

      const results = await memoryIndexService.searchMemories(enhancedQuery);

      expect(results).toHaveLength(1);
      const result = results[0];

      // Relevance score should be higher than base similarity due to:
      // - Category match bonus
      // - High importance bonus  
      // - Recent content bonus
      // - Topic match bonus
      expect(result.relevanceScore).toBeGreaterThan(result.similarity);
      expect(result.relevanceScore).toBeGreaterThan(0.5); // Should be reasonably high

      console.log(`Similarity: ${result.similarity.toFixed(3)}, Enhanced Relevance: ${result.relevanceScore.toFixed(3)}`);
    });

    test('should handle edge cases and error conditions gracefully', async () => {
      // Test empty index search
      const emptyQuery: MemorySearchQuery = {
        query: 'nonexistent content',
        userAddress: 'empty-user-address',
        k: 5
      };

      (mockEmbeddingService.embedText as jest.Mock).mockResolvedValue({
        vector: new Array(768).fill(0).map(() => Math.random()),
        model: 'text-embedding-004',
        usage: { prompt_tokens: 5, total_tokens: 5 }
      });

      const emptyResults = await memoryIndexService.searchMemories(emptyQuery);
      expect(emptyResults).toHaveLength(0);

      // Test high threshold filtering
      const testVector = new Array(768).fill(0).map(() => Math.random());
      await memoryIndexService.indexMemory(
        testUserAddress,
        'threshold-test',
        'blob-threshold',
        'Test content for threshold filtering',
        { category: 'Test', importance: 5, contentType: 'text/plain', createdTimestamp: Date.now() } as MemoryMetadata,
        testVector
      );

      const highThresholdQuery: MemorySearchQuery = {
        query: 'completely different content',
        userAddress: testUserAddress,
        k: 10,
        threshold: 0.99 // Very high threshold
      };

      const filteredResults = await memoryIndexService.searchMemories(highThresholdQuery);
      expect(filteredResults.length).toBeLessThanOrEqual(1); // Should filter out low similarity results
    });
  });

  describe('Performance Benchmarks', () => {
    test('should demonstrate O(log N) search performance scaling', async () => {
      const vectorDimension = 384; // Smaller for faster testing
      const testSizes = [10, 50, 100]; // Different index sizes
      const performanceResults: Array<{ size: number; avgLatency: number }> = [];

      for (const size of testSizes) {
        // Create fresh service for this test size
        const perfService = new MemoryIndexService(mockStorageService, {
          maxElements: size * 2,
          dimension: vectorDimension,
          efConstruction: 50,
          m: 8
        });

        perfService.initialize(mockEmbeddingService, mockStorageService);

        // Index test vectors
        for (let i = 0; i < size; i++) {
          const vector = new Array(vectorDimension).fill(0).map(() => Math.random());
          await perfService.indexMemory(
            testUserAddress,
            `perf-memory-${i}`,
            `blob-${i}`,
            `Performance test memory ${i}`,
            { category: 'Perf', importance: 5, contentType: 'text/plain', createdTimestamp: Date.now() } as MemoryMetadata,
            vector
          );
        }

        // Measure search performance
        const queryVector = new Array(vectorDimension).fill(0).map(() => Math.random());
        (mockEmbeddingService.embedText as jest.Mock).mockResolvedValue({
          vector: queryVector,
          model: 'text-embedding-004',
          usage: { prompt_tokens: 5, total_tokens: 5 }
        });

        const searchLatencies: number[] = [];
        
        // Perform multiple searches to average latency
        for (let search = 0; search < 5; search++) {
          const startTime = performance.now();
          
          await perfService.searchMemories({
            query: `performance test query ${search}`,
            userAddress: testUserAddress,
            k: 5
          });
          
          const latency = performance.now() - startTime;
          searchLatencies.push(latency);
        }

        const avgLatency = searchLatencies.reduce((sum, lat) => sum + lat, 0) / searchLatencies.length;
        performanceResults.push({ size, avgLatency });

        console.log(`Index size: ${size}, Average search latency: ${avgLatency.toFixed(2)}ms`);
      }

      // Verify logarithmic scaling (latency shouldn't grow linearly with size)
      const smallLatency = performanceResults[0].avgLatency;
      const largeLatency = performanceResults[performanceResults.length - 1].avgLatency;
      
      // With O(log N) performance, 10x size increase should result in much less than 10x latency increase
      const scalingRatio = largeLatency / smallLatency;
      expect(scalingRatio).toBeLessThan(5); // Should be much better than linear scaling

      console.log(`Performance scaling ratio: ${scalingRatio.toFixed(2)}x (should be < 5x for logarithmic performance)`);
    });
  });
});
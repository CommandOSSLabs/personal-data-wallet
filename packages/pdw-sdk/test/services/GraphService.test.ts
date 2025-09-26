/**
 * GraphService Test Suite
 * 
 * Comprehensive tests for knowledge graph extraction and management
 * following the established pattern from ClassifierService.test.ts
 */

import { GraphService } from '../../src/graph/GraphService';
import { EmbeddingService } from '../../src/embedding/EmbeddingService';
import type { 
  KnowledgeGraph, 
  Entity, 
  Relationship, 
  GraphConfig,
  GraphExtractionResult,
  GraphQueryResult
} from '../../src/graph/GraphService';

describe('GraphService', () => {
  let graphService: GraphService;
  let mockEmbeddingService: jest.Mocked<EmbeddingService>;

  beforeEach(() => {
    // Create mock embedding service
    mockEmbeddingService = {
      generateEmbedding: jest.fn(),
      batchGenerateEmbeddings: jest.fn(),
      cosineSimilarity: jest.fn(),
      findSimilarEmbeddings: jest.fn(),
      createEmbeddingSpace: jest.fn(),
      getEmbeddingSpace: jest.fn(),
    } as any;

    // Initialize GraphService with test configuration (using mock AI)
    const config: Partial<GraphConfig> = {
      extractionModel: 'gemini-1.5-flash',
      confidenceThreshold: 0.7,
      maxHops: 3,
      enableEmbeddings: true,
      deduplicationThreshold: 0.85,
      useMockAI: true // Use mock AI for consistent testing
    };

    graphService = new GraphService(config, mockEmbeddingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GRAPH CREATION & MANAGEMENT TESTS ====================

  describe('Graph Creation and Management', () => {
    test('should create empty knowledge graph', () => {
      const graph = graphService.createGraph();

      expect(graph).toBeDefined();
      expect(graph.entities).toEqual([]);
      expect(graph.relationships).toEqual([]);
      expect(graph.metadata).toMatchObject({
        version: '1.0',
        totalEntities: 0,
        totalRelationships: 0,
        sourceMemories: []
      });
      expect(graph.metadata.createdAt).toBeInstanceOf(Date);
      expect(graph.metadata.lastUpdated).toBeInstanceOf(Date);
    });

    test('should create and cache user graph', () => {
      const userId = 'user-123';
      const graph = graphService.createGraph(userId);

      expect(graphService.getUserGraph(userId)).toBe(graph);
    });

    test('should get cached user graph', () => {
      const userId = 'user-456';
      const graph = graphService.createGraph();
      
      graphService.setUserGraph(userId, graph);
      const retrievedGraph = graphService.getUserGraph(userId);

      expect(retrievedGraph).toBe(graph);
    });

    test('should return undefined for non-existent user graph', () => {
      const result = graphService.getUserGraph('non-existent-user');
      expect(result).toBeUndefined();
    });
  });

  // ==================== ENTITY & RELATIONSHIP EXTRACTION TESTS ====================

  describe('Entity and Relationship Extraction', () => {
    test('should extract entities and relationships from content', async () => {
      const content = 'John Smith works at Microsoft as a Software Engineer. He lives in Seattle.';
      const memoryId = 'memory-123';

      // Mock the Gemini AI service to return structured data
      const mockGeminiAI = {
        extractEntitiesAndRelationships: jest.fn().mockResolvedValue({
          entities: [
            {id: "john_smith", label: "John Smith", type: "person", confidence: 0.95, properties: {}},
            {id: "microsoft", label: "Microsoft", type: "organization", confidence: 0.90, properties: {}},
            {id: "seattle", label: "Seattle", type: "location", confidence: 0.85, properties: {}}
          ],
          relationships: [
            {source: "john_smith", target: "microsoft", label: "works_at", confidence: 0.90, type: "employment"},
            {source: "john_smith", target: "seattle", label: "lives_in", confidence: 0.85, type: "location"}
          ],
          processingTimeMs: 10
        })
      };

      // Replace the Gemini AI service with our mock
      (graphService as any).geminiAI = mockGeminiAI;
      (graphService as any).config.useMockAI = false;

      const result = await graphService.extractEntitiesAndRelationships(content, memoryId);

      expect(result.entities).toHaveLength(3);
      expect(result.relationships).toHaveLength(2);
      expect(result.extractedFromMemory).toBe(memoryId);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.processingTimeMs).toBeGreaterThan(0);

      // Verify entity details
      const johnEntity = result.entities.find(e => e.id === 'john_smith');
      expect(johnEntity).toMatchObject({
        id: 'john_smith',
        label: 'John Smith',
        type: 'person',
        confidence: 0.95
      });

      // Verify relationship details
      const worksAtRel = result.relationships.find(r => r.label === 'works_at');
      expect(worksAtRel).toMatchObject({
        source: 'john_smith',
        target: 'microsoft',
        label: 'works_at',
        confidence: 0.90
      });
    });

    test('should handle extraction errors gracefully', async () => {
      const content = 'Test content';
      const memoryId = 'memory-error';

      // Mock extraction to throw error
      jest.spyOn(graphService as any, 'mockGeminiResponse').mockRejectedValue(new Error('AI service unavailable'));

      const result = await graphService.extractEntitiesAndRelationships(content, memoryId);

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
      expect(result.confidence).toBe(0);
      expect(result.extractedFromMemory).toBe(memoryId);
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    test('should handle empty content extraction', async () => {
      const content = '';
      const memoryId = 'memory-empty';

      jest.spyOn(graphService as any, 'mockGeminiResponse').mockResolvedValue('{"entities": [], "relationships": []}');

      const result = await graphService.extractEntitiesAndRelationships(content, memoryId);

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
      expect(result.confidence).toBe(0);
    });

    test('should process batch extraction', async () => {
      const memories = [
        { id: 'mem1', content: 'Alice works at Google' },
        { id: 'mem2', content: 'Bob lives in New York' }
      ];

      // Mock individual extractions
      jest.spyOn(graphService, 'extractEntitiesAndRelationships')
        .mockResolvedValueOnce({
          entities: [{ id: 'alice', label: 'Alice', type: 'person', confidence: 0.9 }],
          relationships: [{ source: 'alice', target: 'google', label: 'works_at', confidence: 0.8 }],
          confidence: 0.85,
          processingTimeMs: 100,
          extractedFromMemory: 'mem1'
        })
        .mockResolvedValueOnce({
          entities: [{ id: 'bob', label: 'Bob', type: 'person', confidence: 0.9 }],
          relationships: [{ source: 'bob', target: 'newyork', label: 'lives_in', confidence: 0.8 }],
          confidence: 0.85,
          processingTimeMs: 100,
          extractedFromMemory: 'mem2'
        });

      const results = await graphService.extractFromMemoriesBatch(memories);

      expect(results).toHaveLength(2);
      expect(results[0].extractedFromMemory).toBe('mem1');
      expect(results[1].extractedFromMemory).toBe('mem2');
    });
  });

  // ==================== GRAPH BUILDING TESTS ====================

  describe('Graph Building and Updates', () => {
    let baseGraph: KnowledgeGraph;

    beforeEach(() => {
      baseGraph = graphService.createGraph();
      // Add some initial data
      baseGraph.entities = [
        { id: 'existing_person', label: 'Existing Person', type: 'person', confidence: 0.9 }
      ];
      baseGraph.relationships = [];
    });

    test('should add new entities and relationships to graph', () => {
      const newEntities: Entity[] = [
        { id: 'new_person', label: 'New Person', type: 'person', confidence: 0.95 },
        { id: 'company', label: 'Company Inc', type: 'organization', confidence: 0.90 }
      ];

      const newRelationships: Relationship[] = [
        { source: 'new_person', target: 'company', label: 'works_at', confidence: 0.85 }
      ];

      const updatedGraph = graphService.addToGraph(baseGraph, newEntities, newRelationships, 'memory-123');

      expect(updatedGraph.entities).toHaveLength(3); // 1 existing + 2 new
      expect(updatedGraph.relationships).toHaveLength(1);
      expect(updatedGraph.metadata.totalEntities).toBe(3);
      expect(updatedGraph.metadata.totalRelationships).toBe(1);
      expect(updatedGraph.metadata.sourceMemories).toContain('memory-123');
    });

    test('should merge duplicate entities', () => {
      const duplicateEntity: Entity = {
        id: 'existing_person',
        label: 'Existing Person Updated',
        type: 'person',
        confidence: 0.95,
        properties: { role: 'manager' }
      };

      const updatedGraph = graphService.addToGraph(baseGraph, [duplicateEntity], [], 'memory-456');

      expect(updatedGraph.entities).toHaveLength(1); // Should still be 1
      const entity = updatedGraph.entities[0];
      expect(entity.label).toBe('Existing Person Updated'); // Should be updated
      expect(entity.properties).toMatchObject({ role: 'manager' });
    });

    test('should skip relationships with missing entities', () => {
      const invalidRelationship: Relationship = {
        source: 'non_existent_entity',
        target: 'another_non_existent',
        label: 'invalid_relation',
        confidence: 0.8
      };

      const updatedGraph = graphService.addToGraph(baseGraph, [], [invalidRelationship], 'memory-789');

      expect(updatedGraph.relationships).toHaveLength(0);
    });

    test('should handle graph building errors gracefully', () => {
      // Create malformed entities that might cause errors
      const malformedEntities = [null as any, undefined as any];

      const result = graphService.addToGraph(baseGraph, malformedEntities, [], 'memory-error');

      // Should return original graph on error
      expect(result).toBe(baseGraph);
    });
  });

  // ==================== GRAPH TRAVERSAL TESTS ====================  

  describe('Graph Traversal and Related Entity Finding', () => {
    let complexGraph: KnowledgeGraph;

    beforeEach(() => {
      complexGraph = {
        entities: [
          { id: 'person1', label: 'Alice', type: 'person', confidence: 0.9 },
          { id: 'person2', label: 'Bob', type: 'person', confidence: 0.9 },
          { id: 'company1', label: 'TechCorp', type: 'organization', confidence: 0.8 },
          { id: 'location1', label: 'San Francisco', type: 'location', confidence: 0.85 }
        ],
        relationships: [
          { id: 'rel1', source: 'person1', target: 'company1', label: 'works_at', confidence: 0.9 },
          { id: 'rel2', source: 'person2', target: 'company1', label: 'works_at', confidence: 0.9 },
          { id: 'rel3', source: 'person1', target: 'location1', label: 'lives_in', confidence: 0.8 },
          { id: 'rel4', source: 'company1', target: 'location1', label: 'located_in', confidence: 0.7 }
        ],
        metadata: {
          version: '1.0',
          createdAt: new Date(),
          lastUpdated: new Date(),
          totalEntities: 4,
          totalRelationships: 4,
          sourceMemories: []
        }
      };
    });

    test('should find directly related entities', () => {
      const result = graphService.findRelatedEntities(complexGraph, ['person1'], { maxHops: 1 });

      expect(result.entities).toContainEqual(
        expect.objectContaining({ id: 'company1' })
      );
      expect(result.entities).toContainEqual(
        expect.objectContaining({ id: 'location1' })
      );
      expect(result.totalResults).toBeGreaterThan(0);
    });

    test('should find entities through multiple hops', () => {
      const result = graphService.findRelatedEntities(complexGraph, ['person1'], { maxHops: 2 });

      // person1 -> company1 -> person2 (2 hops)
      expect(result.entities).toContainEqual(
        expect.objectContaining({ id: 'person2' })
      );
    });

    test('should filter by relationship types', () => {
      const result = graphService.findRelatedEntities(
        complexGraph, 
        ['person1'], 
        { maxHops: 1, relationshipTypes: ['works_at'] }
      );

      // Should only find company1 through works_at relationship
      expect(result.entities).toContainEqual(
        expect.objectContaining({ id: 'company1' })
      );
      expect(result.entities).not.toContainEqual(
        expect.objectContaining({ id: 'location1' })
      );
    });

    test('should handle empty seed entities', () => {
      const result = graphService.findRelatedEntities(complexGraph, [], { maxHops: 1 });

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
      expect(result.totalResults).toBe(0);
    });
  });

  // ==================== GRAPH QUERY TESTS ====================

  describe('Graph Querying', () => {
    let queryGraph: KnowledgeGraph;

    beforeEach(() => {
      queryGraph = {
        entities: [
          { id: 'dev1', label: 'Alice Smith', type: 'developer', confidence: 0.9, properties: { skill: 'JavaScript' } },
          { id: 'dev2', label: 'Bob Jones', type: 'developer', confidence: 0.9, properties: { skill: 'Python' } },
          { id: 'mgr1', label: 'Carol Admin', type: 'manager', confidence: 0.8, properties: { team: 'Engineering' } },
          { id: 'proj1', label: 'Web App', type: 'project', confidence: 0.85 }
        ],
        relationships: [
          { id: 'r1', source: 'dev1', target: 'proj1', label: 'works_on', type: 'assignment', confidence: 0.9 },
          { id: 'r2', source: 'dev2', target: 'proj1', label: 'works_on', type: 'assignment', confidence: 0.9 },
          { id: 'r3', source: 'mgr1', target: 'dev1', label: 'manages', type: 'supervision', confidence: 0.8 }
        ],
        metadata: {
          version: '1.0',
          createdAt: new Date(),
          lastUpdated: new Date(),
          totalEntities: 4,
          totalRelationships: 3,
          sourceMemories: []
        }
      };
    });

    test('should query by entity types', () => {
      const result = graphService.queryGraph(queryGraph, { entityTypes: ['developer'] });

      expect(result.entities).toHaveLength(2);
      expect(result.entities.every(e => e.type === 'developer')).toBe(true);
    });

    test('should query by relationship types', () => {
      const result = graphService.queryGraph(queryGraph, { relationshipTypes: ['assignment'] });

      expect(result.relationships).toHaveLength(2);
      expect(result.relationships.every(r => r.type === 'assignment')).toBe(true);
    });

    test('should perform text search', () => {
      const result = graphService.queryGraph(queryGraph, { searchText: 'Alice' });

      expect(result.entities.some(e => e.label.includes('Alice'))).toBe(true);
    });

    test('should search in properties', () => {
      const result = graphService.queryGraph(queryGraph, { searchText: 'JavaScript' });

      expect(result.entities.some(e => e.properties?.skill === 'JavaScript')).toBe(true);
    });

    test('should apply query limit', () => {
      const result = graphService.queryGraph(queryGraph, { limit: 2 });

      expect(result.entities.length).toBeLessThanOrEqual(2);
    });

    test('should handle empty query', () => {
      const result = graphService.queryGraph(queryGraph, {});

      expect(result.entities).toHaveLength(4);
      expect(result.relationships).toHaveLength(3);
    });

    test('should handle query with no matches', () => {
      const result = graphService.queryGraph(queryGraph, { entityTypes: ['nonexistent'] });

      expect(result.entities).toHaveLength(0);
      expect(result.totalResults).toBe(result.entities.length + result.relationships.length);
    });
  });

  // ==================== PERFORMANCE TESTS ====================

  describe('Performance Tests', () => {
    test('should handle large entity extraction efficiently', async () => {
      const largeContent = 'This is a large document with many entities. '.repeat(100) +
        'John works at Microsoft. Alice lives in Seattle. Bob manages the team.';
      const memoryId = 'large-memory';

      jest.spyOn(graphService as any, 'mockGeminiResponse').mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms delay for large content
        return `{
          "entities": [
            {"id": "john", "label": "John", "type": "person", "confidence": 0.9},
            {"id": "alice", "label": "Alice", "type": "person", "confidence": 0.9},
            {"id": "bob", "label": "Bob", "type": "person", "confidence": 0.9}
          ],
          "relationships": []
        }`;
      });

      const startTime = Date.now();
      const result = await graphService.extractEntitiesAndRelationships(largeContent, memoryId);
      const endTime = Date.now();

      expect(result.entities).toHaveLength(3);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    test('should handle complex graph traversal efficiently', () => {
      // Create a graph with many entities
      const largeGraph: KnowledgeGraph = {
        entities: Array.from({ length: 100 }, (_, i) => ({
          id: `entity_${i}`,
          label: `Entity ${i}`,
          type: 'test',
          confidence: 0.8
        })),
        relationships: Array.from({ length: 200 }, (_, i) => ({
          id: `rel_${i}`,
          source: `entity_${i % 50}`,
          target: `entity_${(i + 1) % 50}`,
          label: 'connects_to',
          confidence: 0.7
        })),
        metadata: {
          version: '1.0',
          createdAt: new Date(),
          lastUpdated: new Date(),
          totalEntities: 100,
          totalRelationships: 200,
          sourceMemories: []
        }
      };

      const startTime = Date.now();
      const result = graphService.findRelatedEntities(largeGraph, ['entity_0'], { maxHops: 3 });
      const endTime = Date.now();

      expect(result.entities.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe('Error Handling', () => {
    test('should handle null graph gracefully', () => {
      expect(() => {
        graphService.queryGraph(null as any, {});
      }).not.toThrow();
    });

    test('should handle malformed query parameters', () => {
      const graph = graphService.createGraph();
      
      expect(() => {
        graphService.queryGraph(graph, { entityTypes: null as any });
      }).not.toThrow();
    });

    test('should handle invalid relationship data during graph building', () => {
      const graph = graphService.createGraph();
      const invalidRelationships = [
        { source: '', target: '', label: '', confidence: NaN } as any
      ];

      expect(() => {
        graphService.addToGraph(graph, [], invalidRelationships);
      }).not.toThrow();
    });
  });
});
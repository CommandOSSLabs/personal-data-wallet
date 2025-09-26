/**
 * GeminiAIService Test Suite
 * 
 * Tests real Google Gemini AI integration for entity extraction and content analysis
 */

import { GeminiAIService } from '../../src/services/GeminiAIService';
import type { GeminiConfig, EntityExtractionRequest } from '../../src/services/GeminiAIService';

// Mock Google Generative AI for testing
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue('{"entities": [], "relationships": []}')
        }
      })
    })
  }))
}));

describe('GeminiAIService', () => {
  let aiService: GeminiAIService;
  const mockConfig: GeminiConfig = {
    apiKey: 'test-api-key',
    model: 'gemini-1.5-flash',
    temperature: 0.1,
    maxTokens: 4096
  };

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new GeminiAIService(mockConfig);
  });

  // ==================== INITIALIZATION TESTS ====================

  describe('Service Initialization', () => {
    test('should initialize with default configuration', () => {
      const minimalConfig = { apiKey: 'test-key' };
      const service = new GeminiAIService(minimalConfig);
      const config = service.getConfig();

      expect(config.model).toBe('gemini-1.5-flash');
      expect(config.temperature).toBe(0.1);
      expect(config.maxTokens).toBe(4096);
      expect(config.apiKeyConfigured).toBe(true);
    });

    test('should initialize with custom configuration', () => {
      const customConfig: GeminiConfig = {
        apiKey: 'custom-key',
        model: 'gemini-pro',
        temperature: 0.5,
        maxTokens: 2048,
        timeout: 60000
      };

      const service = new GeminiAIService(customConfig);
      const config = service.getConfig();

      expect(config.model).toBe('gemini-pro');
      expect(config.temperature).toBe(0.5);
      expect(config.maxTokens).toBe(2048);
      expect(config.timeout).toBe(60000);
    });

    test('should get configuration without exposing API key', () => {
      const config = aiService.getConfig();

      expect(config).not.toHaveProperty('apiKey');
      expect(config.apiKeyConfigured).toBe(true);
      expect(config.model).toBeDefined();
      expect(config.temperature).toBeDefined();
    });
  });

  // ==================== ENTITY EXTRACTION TESTS ====================

  describe('Entity and Relationship Extraction', () => {
    test('should extract entities and relationships from simple text', async () => {
      const mockResponse = JSON.stringify({
        entities: [
          { id: 'john_doe', label: 'John Doe', type: 'person', confidence: 0.9 },
          { id: 'google', label: 'Google', type: 'organization', confidence: 0.85 }
        ],
        relationships: [
          { source: 'john_doe', target: 'google', label: 'works_at', confidence: 0.8 }
        ]
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => mockResponse }
        })
      };

      // Override the mock for this test
      (aiService as any).model = mockModel;

      const request: EntityExtractionRequest = {
        content: 'John Doe works at Google as a software engineer.',
        confidenceThreshold: 0.7
      };

      const result = await aiService.extractEntitiesAndRelationships(request);

      expect(result.entities).toHaveLength(2);
      expect(result.relationships).toHaveLength(1);
      expect(result.processingTimeMs).toBeGreaterThan(0);

      // Verify entity structure
      const johnEntity = result.entities.find(e => e.id === 'john_doe');
      expect(johnEntity).toMatchObject({
        id: 'john_doe',
        label: 'John Doe',
        type: 'person',
        confidence: 0.9
      });

      // Verify relationship structure
      const workRelation = result.relationships.find(r => r.label === 'works_at');
      expect(workRelation).toMatchObject({
        source: 'john_doe',
        target: 'google',
        label: 'works_at',
        confidence: 0.8
      });
    });

    test('should handle extraction with context', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => '{"entities": [], "relationships": []}' }
        })
      };

      (aiService as any).model = mockModel;

      const request: EntityExtractionRequest = {
        content: 'He started the project last year.',
        context: 'Previous discussion about John Doe working at Google on AI projects.',
        confidenceThreshold: 0.6
      };

      await aiService.extractEntitiesAndRelationships(request);

      // Verify the prompt includes context
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        expect.stringContaining('CONTEXT: Previous discussion about John Doe')
      );
    });

    test('should filter entities by confidence threshold', async () => {
      const mockResponse = JSON.stringify({
        entities: [
          { id: 'high_conf', label: 'High Confidence', type: 'concept', confidence: 0.9 },
          { id: 'low_conf', label: 'Low Confidence', type: 'concept', confidence: 0.5 }
        ],
        relationships: []
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => mockResponse }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: 'Test content',
        confidenceThreshold: 0.7
      });

      // Only high confidence entity should remain
      expect(result.entities).toHaveLength(1);
      expect(result.entities[0].confidence).toBe(0.9);
    });

    test('should handle extraction errors gracefully', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('API Error'))
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: 'Test content'
      });

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
      expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    test('should handle malformed AI responses', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => 'Invalid JSON response' }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: 'Test content'
      });

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
    });

    test('should sanitize entity IDs properly', async () => {
      const mockResponse = JSON.stringify({
        entities: [
          { id: 'John Doe!@#', label: 'John Doe', type: 'person', confidence: 0.9 },
          { id: 'AI/ML Tech', label: 'AI/ML Technology', type: 'concept', confidence: 0.8 }
        ],
        relationships: []
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => mockResponse }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: 'Test content'
      });

      expect(result.entities[0].id).toBe('john_doe');
      expect(result.entities[1].id).toBe('ai_ml_tech');
    });
  });

  // ==================== BATCH PROCESSING TESTS ====================

  describe('Batch Processing', () => {
    test('should process multiple extraction requests', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => '{"entities": [], "relationships": []}' }
        })
      };

      (aiService as any).model = mockModel;

      const requests: EntityExtractionRequest[] = [
        { content: 'First text content' },
        { content: 'Second text content' },
        { content: 'Third text content' }
      ];

      const results = await aiService.extractBatch(requests);

      expect(results).toHaveLength(3);
      expect(mockModel.generateContent).toHaveBeenCalledTimes(3);
    });

    test('should respect batch processing limits', async () => {
      // Mock delay to track batch timing
      const delaySpy = jest.spyOn(aiService as any, 'delay').mockResolvedValue(undefined);
      
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => '{"entities": [], "relationships": []}' }
        })
      };

      (aiService as any).model = mockModel;

      // Create 7 requests (more than batch size of 3)
      const requests = Array.from({ length: 7 }, (_, i) => ({
        content: `Content ${i + 1}`
      }));

      await aiService.extractBatch(requests);

      // Should have been called for delays between batches
      expect(delaySpy).toHaveBeenCalledWith(500);
      
      delaySpy.mockRestore();
    });
  });

  // ==================== CONTENT ANALYSIS TESTS ====================

  describe('Content Analysis', () => {
    test('should analyze content for categories and sentiment', async () => {
      const mockResponse = JSON.stringify({
        categories: ['technology', 'career'],
        sentiment: 'positive',
        topics: ['software development', 'artificial intelligence'],
        confidence: 0.85
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => mockResponse }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.analyzeContent('I love working on AI projects!');

      expect(result.categories).toContain('technology');
      expect(result.sentiment).toBe('positive');
      expect(result.topics).toContain('artificial intelligence');
      expect(result.confidence).toBe(0.85);
    });

    test('should handle analysis errors gracefully', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Analysis failed'))
      };

      (aiService as any).model = mockModel;

      const result = await aiService.analyzeContent('Test content');

      expect(result.categories).toEqual([]);
      expect(result.sentiment).toBe('neutral');
      expect(result.topics).toEqual([]);
      expect(result.confidence).toBe(0);
    });
  });

  // ==================== CONNECTION TESTS ====================

  describe('Connection Testing', () => {
    test('should test API connection successfully', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => 'OK' }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.testConnection();

      expect(result).toBe(true);
      expect(mockModel.generateContent).toHaveBeenCalledWith(
        'Test connection. Respond with "OK".'
      );
    });

    test('should handle connection failures', async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error('Connection failed'))
      };

      (aiService as any).model = mockModel;

      const result = await aiService.testConnection();

      expect(result).toBe(false);
    });
  });

  // ==================== EDGE CASES AND ERROR HANDLING ====================

  describe('Edge Cases and Error Handling', () => {
    test('should handle empty content gracefully', async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => '{"entities": [], "relationships": []}' }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: ''
      });

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
    });

    test('should handle relationships with invalid entity references', async () => {
      const mockResponse = JSON.stringify({
        entities: [
          { id: 'valid_entity', label: 'Valid Entity', type: 'concept', confidence: 0.8 }
        ],
        relationships: [
          { source: 'valid_entity', target: 'invalid_entity', label: 'relates_to', confidence: 0.7 },
          { source: 'invalid_source', target: 'valid_entity', label: 'connects_to', confidence: 0.6 }
        ]
      });

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => mockResponse }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: 'Test content'
      });

      // Should filter out relationships with invalid entity references
      expect(result.entities).toHaveLength(1);
      expect(result.relationships).toHaveLength(0);
    });

    test('should handle JSON responses with markdown formatting', async () => {
      const mockResponse = '```json\n{"entities": [], "relationships": []}\n```';

      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: { text: () => mockResponse }
        })
      };

      (aiService as any).model = mockModel;

      const result = await aiService.extractEntitiesAndRelationships({
        content: 'Test content'
      });

      expect(result.entities).toEqual([]);
      expect(result.relationships).toEqual([]);
    });
  });
});
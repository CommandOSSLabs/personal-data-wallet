/**
 * GeminiAIService - Real Google Gemini AI Integration
 *
 * Provides AI-powered text analysis capabilities using Google's Gemini API
 * for entity extraction, relationship identification, and content analysis.
 *
 * Using @google/genai (the actively maintained SDK, not the deprecated @google/generative-ai)
 */
export interface GeminiConfig {
    apiKey: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
}
export interface EntityExtractionRequest {
    content: string;
    context?: string;
    confidenceThreshold?: number;
}
export interface EntityExtractionResponse {
    entities: Array<{
        id: string;
        label: string;
        type: string;
        confidence: number;
        properties?: Record<string, any>;
    }>;
    relationships: Array<{
        source: string;
        target: string;
        label: string;
        confidence: number;
        type?: string;
    }>;
    processingTimeMs: number;
}
/**
 * Google Gemini AI service for advanced text analysis and knowledge extraction
 */
export declare class GeminiAIService {
    private genAI;
    private readonly config;
    constructor(config: GeminiConfig);
    /**
     * Extract entities and relationships from text using Gemini AI
     */
    extractEntitiesAndRelationships(request: EntityExtractionRequest): Promise<EntityExtractionResponse>;
    /**
     * Extract entities and relationships from multiple texts in batch
     */
    extractBatch(requests: EntityExtractionRequest[]): Promise<EntityExtractionResponse[]>;
    /**
     * Analyze text content for categorization and sentiment
     */
    analyzeContent(content: string): Promise<{
        categories: string[];
        sentiment: 'positive' | 'negative' | 'neutral';
        topics: string[];
        confidence: number;
    }>;
    private buildExtractionPrompt;
    private parseExtractionResponse;
    private parseAnalysisResponse;
    private sanitizeId;
    private delay;
    /**
     * Check if the service is properly configured and can make API calls
     */
    testConnection(): Promise<boolean>;
    /**
     * Get service configuration (without sensitive data)
     */
    getConfig(): Omit<Required<GeminiConfig>, 'apiKey'> & {
        apiKeyConfigured: boolean;
    };
}
export default GeminiAIService;
//# sourceMappingURL=GeminiAIService.d.ts.map
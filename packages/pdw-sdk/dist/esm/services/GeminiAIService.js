/**
 * GeminiAIService - Real Google Gemini AI Integration
 *
 * Provides AI-powered text analysis capabilities using Google's Gemini API
 * for entity extraction, relationship identification, and content analysis.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';
/**
 * Google Gemini AI service for advanced text analysis and knowledge extraction
 */
export class GeminiAIService {
    constructor(config) {
        this.config = {
            model: config.model || 'gemini-1.5-flash',
            temperature: config.temperature || 0.1,
            maxTokens: config.maxTokens || 4096,
            timeout: config.timeout || 30000,
            ...config
        };
        this.genAI = new GoogleGenerativeAI(this.config.apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: this.config.model,
            generationConfig: {
                temperature: this.config.temperature,
                maxOutputTokens: this.config.maxTokens,
            }
        });
    }
    /**
     * Extract entities and relationships from text using Gemini AI
     */
    async extractEntitiesAndRelationships(request) {
        const startTime = Date.now();
        try {
            const prompt = this.buildExtractionPrompt(request.content, request.context);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const parsed = this.parseExtractionResponse(text);
            const processingTimeMs = Date.now() - startTime;
            return {
                entities: parsed.entities,
                relationships: parsed.relationships,
                processingTimeMs
            };
        }
        catch (error) {
            console.error('Gemini AI extraction failed:', error);
            // Return empty result with processing time on error
            return {
                entities: [],
                relationships: [],
                processingTimeMs: Date.now() - startTime
            };
        }
    }
    /**
     * Extract entities and relationships from multiple texts in batch
     */
    async extractBatch(requests) {
        const results = [];
        // Process in batches to avoid rate limiting
        const batchSize = 3;
        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchPromises = batch.map(request => this.extractEntitiesAndRelationships(request));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Small delay between batches to respect rate limits
            if (i + batchSize < requests.length) {
                await this.delay(500);
            }
        }
        return results;
    }
    /**
     * Analyze text content for categorization and sentiment
     */
    async analyzeContent(content) {
        try {
            const prompt = `
Analyze the following text and provide a JSON response with:
- "categories": array of relevant categories (max 3)
- "sentiment": "positive", "negative", or "neutral"  
- "topics": array of main topics/themes (max 5)
- "confidence": overall analysis confidence (0.0-1.0)

TEXT: ${content}

JSON:`;
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return this.parseAnalysisResponse(text);
        }
        catch (error) {
            console.error('Content analysis failed:', error);
            return {
                categories: [],
                sentiment: 'neutral',
                topics: [],
                confidence: 0
            };
        }
    }
    // ==================== PRIVATE METHODS ====================
    buildExtractionPrompt(content, context) {
        const contextSection = context ? `\nCONTEXT: ${context}\n` : '';
        return `
Extract meaningful entities and relationships from the following text. Focus on:
- People (names, roles, professions)
- Organizations (companies, institutions, groups)  
- Locations (cities, countries, places)
- Concepts (technologies, ideas, skills)
- Events (meetings, projects, activities)
- Objects (products, tools, resources)

Return a valid JSON response with "entities" and "relationships" arrays.

For entities:
- "id": unique identifier using snake_case (e.g., "john_doe", "machine_learning")
- "label": human-readable name (e.g., "John Doe", "Machine Learning")
- "type": entity category (person, organization, location, concept, event, object)
- "confidence": confidence score 0.0-1.0
- "properties": optional additional attributes

For relationships:
- "source": source entity id
- "target": target entity id  
- "label": relationship description (e.g., "works_at", "located_in", "uses")
- "confidence": confidence score 0.0-1.0
- "type": optional relationship category

Only include entities with confidence >= 0.6 and clear, meaningful relationships.
${contextSection}
TEXT: ${content}

JSON:`;
    }
    parseExtractionResponse(response) {
        try {
            // Clean up the response text (remove markdown formatting if present)
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
            }
            else if (cleanResponse.startsWith('```')) {
                cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/```\s*$/, '');
            }
            const parsed = JSON.parse(cleanResponse);
            if (!parsed.entities || !Array.isArray(parsed.entities)) {
                throw new Error('Invalid entities format');
            }
            if (!parsed.relationships || !Array.isArray(parsed.relationships)) {
                throw new Error('Invalid relationships format');
            }
            // Validate and sanitize entities
            const entities = parsed.entities
                .filter((e) => e.id && e.label && e.type)
                .map((e) => ({
                id: this.sanitizeId(e.id),
                label: e.label.trim(),
                type: e.type.toLowerCase(),
                confidence: Math.max(0, Math.min(1, e.confidence || 0.7)),
                properties: e.properties || {}
            }));
            // Create entity ID map for relationship validation
            const entityIds = new Set(entities.map((e) => e.id));
            // Validate and sanitize relationships
            const relationships = parsed.relationships
                .filter((r) => r.source && r.target && r.label)
                .filter((r) => entityIds.has(this.sanitizeId(r.source)) && entityIds.has(this.sanitizeId(r.target)))
                .map((r) => ({
                source: this.sanitizeId(r.source),
                target: this.sanitizeId(r.target),
                label: r.label.trim(),
                confidence: Math.max(0, Math.min(1, r.confidence || 0.7)),
                type: r.type || 'general'
            }));
            return { entities, relationships };
        }
        catch (error) {
            console.error('Failed to parse Gemini response:', error);
            console.error('Raw response:', response);
            return { entities: [], relationships: [] };
        }
    }
    parseAnalysisResponse(response) {
        try {
            let cleanResponse = response.trim();
            if (cleanResponse.startsWith('```json')) {
                cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
            }
            const parsed = JSON.parse(cleanResponse);
            return {
                categories: parsed.categories || [],
                sentiment: parsed.sentiment || 'neutral',
                topics: parsed.topics || [],
                confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
            };
        }
        catch (error) {
            console.error('Failed to parse analysis response:', error);
            return {
                categories: [],
                sentiment: 'neutral',
                topics: [],
                confidence: 0
            };
        }
    }
    sanitizeId(id) {
        return id
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Check if the service is properly configured and can make API calls
     */
    async testConnection() {
        try {
            const result = await this.model.generateContent('Test connection. Respond with "OK".');
            const response = await result.response;
            const text = response.text();
            return text.includes('OK');
        }
        catch {
            return false;
        }
    }
    /**
     * Get service configuration (without sensitive data)
     */
    getConfig() {
        return {
            model: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            timeout: this.config.timeout,
            apiKeyConfigured: !!this.config.apiKey
        };
    }
}
export default GeminiAIService;
//# sourceMappingURL=GeminiAIService.js.map
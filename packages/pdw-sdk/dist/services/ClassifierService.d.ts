/**
 * ClassifierService - Content Classification and Filtering
 *
 * Determines if content should be saved as memory using pattern matching
 * and AI classification. Provides category classification for content organization.
 */
import { EmbeddingService } from './EmbeddingService';
import type { ClientWithCoreApi, PDWConfig } from '../types';
export interface ClassificationResult {
    shouldSave: boolean;
    confidence: number;
    category: string;
    reasoning: string;
}
export interface ClassificationOptions {
    useAI?: boolean;
    confidenceThreshold?: number;
    categories?: string[];
    patterns?: RegExp[];
}
export interface PatternAnalysisResult {
    patterns: string[];
    categories: string[];
    matches: Array<{
        pattern: string;
        match: string;
        category: string;
        confidence: number;
    }>;
}
/**
 * Content classification service for determining memory worthiness
 */
export declare class ClassifierService {
    private client?;
    private config?;
    private embeddingService?;
    private aiApiKey?;
    private readonly factPatterns;
    private readonly categoryMap;
    constructor(client?: ClientWithCoreApi | undefined, config?: PDWConfig | undefined, embeddingService?: EmbeddingService, aiApiKey?: string);
    /**
     * Determine if a message contains information worth saving
     * @param message User message to classify
     * @param options Classification options
     * @returns Classification result
     */
    shouldSaveMemory(message: string, options?: ClassificationOptions): Promise<ClassificationResult>;
    /**
     * Classify content into categories
     * @param content Content to classify
     * @param options Classification options
     * @returns Category string
     */
    classifyContent(content: string, options?: ClassificationOptions): Promise<string>;
    /**
     * Analyze patterns in text
     * @param text Text to analyze
     * @param patterns Optional custom patterns
     * @returns Pattern analysis result
     */
    analyzePatterns(text: string, patterns?: RegExp[]): Promise<PatternAnalysisResult>;
    /**
     * Match patterns against text
     * @param text Text to match
     * @param patterns Patterns to use
     * @returns Match result
     */
    private matchPatterns;
    /**
     * Get category for a regex pattern
     * @param patternString String representation of the regex
     * @returns Category string
     */
    private getCategoryForPattern;
    /**
     * Calculate confidence score for pattern match
     * @param pattern The regex pattern
     * @param match The matched text
     * @returns Confidence score (0-1)
     */
    private calculatePatternConfidence;
    /**
     * Use AI for classification (fallback/enhancement)
     * @param message Message to classify
     * @param options Classification options
     * @returns Classification result
     */
    private classifyWithAI;
    /**
     * Classify using embeddings (semantic similarity approach)
     * @param message Message to classify
     * @param options Classification options
     * @returns Classification result
     */
    private classifyWithEmbeddings;
}
//# sourceMappingURL=ClassifierService.d.ts.map
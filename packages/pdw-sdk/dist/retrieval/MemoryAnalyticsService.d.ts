/**
 * MemoryAnalyticsService - Memory Analytics & Insights
 *
 * Provides comprehensive analytics and insights for memory data including:
 * - Usage pattern analysis
 * - Similarity clustering
 * - Trend analysis and forecasting
 * - Knowledge discovery
 * - Content sentiment analysis
 * - Recommendation engines
 */
import { UnifiedMemoryResult } from './MemoryRetrievalService';
import { KnowledgeGraphManager } from '../graph/KnowledgeGraphManager';
import { VectorManager } from '../vector/VectorManager';
export interface MemoryAnalytics {
    userId: string;
    periodStart: Date;
    periodEnd: Date;
    totalMemories: number;
    totalSize: number;
    averageImportance: number;
    usagePatterns: UsagePattern[];
    topCategories: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
    topTags: Array<{
        tag: string;
        count: number;
        coOccurrences: string[];
    }>;
    contentDistribution: {
        textContent: number;
        multimedia: number;
        documents: number;
        other: number;
    };
    temporalTrends: {
        creationTrend: TrendAnalysis;
        accessTrend: TrendAnalysis;
        sizeTrend: TrendAnalysis;
    };
    similarityClusters: SimilarityCluster[];
    knowledgeInsights: MemoryInsights;
    retrievalPerformance: {
        averageRetrievalTime: number;
        cacheHitRate: number;
        popularMemories: string[];
    };
}
export interface UsagePattern {
    type: 'creation' | 'access' | 'modification' | 'sharing';
    pattern: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'irregular';
    peakTimes: Array<{
        period: string;
        intensity: number;
    }>;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    anomalies: Array<{
        date: Date;
        type: 'spike' | 'drop' | 'outlier';
        severity: number;
        possibleCauses?: string[];
    }>;
}
export interface SimilarityCluster {
    id: string;
    label: string;
    memories: string[];
    centroid: number[];
    coherence: number;
    size: number;
    characteristics: {
        dominantTopics: string[];
        averageImportance: number;
        timeSpread: {
            start: Date;
            end: Date;
        };
        commonTags: string[];
    };
    relationships: Array<{
        clusterId: string;
        similarity: number;
        sharedMemories: number;
    }>;
}
export interface TrendAnalysis {
    direction: 'up' | 'down' | 'stable' | 'volatile';
    strength: number;
    seasonality: {
        detected: boolean;
        period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
        amplitude?: number;
    };
    forecast: Array<{
        date: Date;
        predicted: number;
        confidence: number;
        upper: number;
        lower: number;
    }>;
    changePoints: Array<{
        date: Date;
        significance: number;
        description: string;
    }>;
}
export interface MemoryInsights {
    knowledgeDomains: Array<{
        domain: string;
        expertise: number;
        memories: string[];
        keyEntities: string[];
        growthRate: number;
    }>;
    learningProgression: Array<{
        topic: string;
        startDate: Date;
        currentLevel: number;
        progressRate: number;
        milestones: Array<{
            date: Date;
            achievement: string;
            memoryId: string;
        }>;
    }>;
    conceptualConnections: Array<{
        concept1: string;
        concept2: string;
        connectionStrength: number;
        bridgeMemories: string[];
        evolutionOverTime: Array<{
            date: Date;
            strength: number;
        }>;
    }>;
    contentQuality: {
        averageSentiment: number;
        clarityScore: number;
        completenessScore: number;
        originalityScore: number;
    };
    recommendations: Array<{
        type: 'explore' | 'review' | 'connect' | 'expand';
        priority: number;
        title: string;
        description: string;
        memoryIds: string[];
        reasoning: string;
    }>;
}
/**
 * Memory Analytics Service
 */
export declare class MemoryAnalyticsService {
    private graphManager;
    private vectorManager;
    private analyticsCache;
    private readonly ANALYTICS_CACHE_TTL;
    constructor(config?: {
        graphManager?: KnowledgeGraphManager;
        vectorManager?: VectorManager;
    });
    /**
     * Generate comprehensive analytics for a user's memories
     */
    generateMemoryAnalytics(userId: string, memories: UnifiedMemoryResult[], options?: {
        includeForecasting?: boolean;
        includeClustering?: boolean;
        includeInsights?: boolean;
        periodStart?: Date;
        periodEnd?: Date;
    }): Promise<MemoryAnalytics>;
    /**
     * Analyze usage patterns over time
     */
    analyzeUsagePatterns(memories: UnifiedMemoryResult[], userId: string): Promise<UsagePattern[]>;
    /**
     * Perform similarity-based clustering
     */
    performSimilarityClustering(memories: UnifiedMemoryResult[], options?: {
        numberOfClusters?: number;
        similarityThreshold?: number;
        algorithm?: 'kmeans' | 'hierarchical' | 'dbscan';
    }): Promise<SimilarityCluster[]>;
    /**
     * Generate knowledge insights from memories
     */
    generateKnowledgeInsights(memories: UnifiedMemoryResult[], userId: string): Promise<MemoryInsights>;
    private calculateBasicStats;
    private analyzeContent;
    private analyzeCreationPattern;
    private analyzeAccessPattern;
    private determinePattern;
    private calculateVariance;
    private analyzeTempralTrends;
    private calculatePerformanceMetrics;
    private extractEmbeddings;
    private performClustering;
    private buildCluster;
    private findCommonTags;
    private calculateClusterRelationships;
    private calculateClusterSimilarity;
    private countSharedMemories;
    private identifyKnowledgeDomains;
    private analyzeLearningProgression;
    private findConceptualConnections;
    private analyzeContentQuality;
    private generateRecommendations;
    private getCachedAnalytics;
    private cacheAnalytics;
    /**
     * Clear analytics cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        entries: number;
        totalSize: number;
    };
}
//# sourceMappingURL=MemoryAnalyticsService.d.ts.map
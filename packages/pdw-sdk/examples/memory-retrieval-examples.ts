/**
 * Enhanced Memory Retrieval Examples
 * 
 * Comprehensive examples showing the powerful memory retrieval and analytics
 * capabilities in the PDW SDK, including advanced search, analytics, and insights.
 */

import {
  MemoryRetrievalService,
  AdvancedSearchService,
  MemoryAnalyticsService,
  UnifiedMemoryQuery,
  SearchFilter,
  SearchAggregation,
  createQuickStartPipeline
} from '@personal-data-wallet/sdk';

// ========================================
// 🔍 1. UNIFIED MEMORY SEARCH
// ========================================

console.log('🔍 1. Advanced Memory Search Examples');

async function demonstrateUnifiedSearch() {
  const retrievalService = new MemoryRetrievalService();

  // Basic vector similarity search
  const basicQuery: UnifiedMemoryQuery = {
    query: "machine learning concepts",
    userId: "user_123",
    searchType: 'vector',
    similarity: {
      threshold: 0.75,
      k: 10
    },
    includeContent: true,
    includeAnalytics: true
  };

  const basicResults = await retrievalService.searchMemories(basicQuery);
  console.log('📊 Basic Search Results:', {
    totalFound: basicResults.results.length,
    processingTime: basicResults.stats.processingTime,
    suggestions: basicResults.suggestions.relatedQueries
  });

  // Advanced hybrid search with multiple criteria
  const hybridQuery: UnifiedMemoryQuery = {
    query: "project planning and management",
    userId: "user_123",
    searchType: 'hybrid',
    
    // Multi-dimensional filtering
    categories: ['work', 'projects'],
    dateRange: {
      start: new Date('2024-01-01'),
      end: new Date('2024-12-31')
    },
    importanceRange: {
      min: 0.7,
      max: 1.0
    },
    tags: ['important', 'deadline'],
    
    // Vector search parameters
    similarity: {
      threshold: 0.6,
      k: 20,
      efSearch: 200
    },
    
    // Graph traversal
    graphTraversal: {
      maxDepth: 2,
      includeEntities: ['Person', 'Project', 'Task']
    },
    
    // Rich result options
    includeContent: true,
    includeMetadata: true,
    includeEmbeddings: false,
    includeAnalytics: true,
    useCache: true
  };

  const hybridResults = await retrievalService.searchMemories(hybridQuery);
  
  console.log('🎯 Hybrid Search Results:', {
    totalResults: hybridResults.results.length,
    searchBreakdown: hybridResults.stats.searchBreakdown,
    qualityMetrics: hybridResults.stats.qualityMetrics,
    dataSourcesUsed: hybridResults.stats.dataSourcesUsed
  });

  // Display top results with rich metadata
  hybridResults.results.slice(0, 3).forEach((result, index) => {
    console.log(`📝 Result ${index + 1}:`, {
      id: result.id,
      category: result.category,
      relevanceScore: result.relevanceScore.toFixed(3),
      searchRelevance: result.searchRelevance,
      created: result.created.toISOString(),
      tags: result.metadata.tags,
      importance: result.metadata.importance,
      relationships: result.relationships?.relatedMemories.length || 0
    });
  });
}

// ========================================
// 📊 2. ADVANCED FACETED SEARCH
// ========================================

console.log('📊 2. Faceted Search with Aggregations');

async function demonstrateFacetedSearch() {
  const searchService = new AdvancedSearchService();

  const baseQuery: UnifiedMemoryQuery = {
    query: "learning and development",
    userId: "user_123",
    searchType: 'semantic'
  };

  // Define search filters
  const filters: SearchFilter[] = [
    {
      type: 'category',
      field: 'category',
      operator: 'in',
      value: ['education', 'work', 'personal'],
      weight: 0.8
    },
    {
      type: 'importance',
      field: 'importance',
      operator: 'range',
      value: { min: 0.5, max: 1.0 },
      weight: 0.6
    },
    {
      type: 'dateRange',
      field: 'created',
      operator: 'range',
      value: {
        start: new Date('2024-06-01'),
        end: new Date('2024-12-31')
      }
    }
  ];

  // Define aggregations for analytics
  const aggregations: SearchAggregation[] = [
    {
      name: 'categories_count',
      type: 'terms',
      field: 'category',
      size: 10
    },
    {
      name: 'monthly_creation',
      type: 'dateHistogram',
      field: 'created',
      interval: 'month'
    },
    {
      name: 'importance_ranges',
      type: 'histogram',
      field: 'importance',
      ranges: [
        { from: 0.0, to: 0.3, key: 'low' },
        { from: 0.3, to: 0.7, key: 'medium' },
        { from: 0.7, to: 1.0, key: 'high' }
      ]
    }
  ];

  const facetedResults = await searchService.facetedSearch(
    baseQuery,
    filters,
    aggregations,
    {
      includeFacets: true,
      facetSize: 20
    }
  );

  console.log('📈 Faceted Search Results:', {
    totalResults: facetedResults.results.length,
    facets: {
      categories: facetedResults.facets.categories.length,
      topCategories: facetedResults.facets.categories.slice(0, 3),
      dateRanges: facetedResults.facets.dateRanges.length,
      tags: facetedResults.facets.tags.slice(0, 5)
    },
    aggregations: facetedResults.aggregations,
    suggestions: facetedResults.suggestions.recommendedFilters.length,
    performance: facetedResults.performance
  });
}

// ========================================
// 🕒 3. TEMPORAL SEARCH & ANALYSIS  
// ========================================

console.log('🕒 3. Temporal Search & Pattern Analysis');

async function demonstrateTemporalSearch() {
  const searchService = new AdvancedSearchService();

  // Search within specific time periods with pattern analysis
  const temporalResults = await searchService.temporalSearch(
    {
      timeframe: 'this_month',
      temporalPattern: 'trends',
      groupBy: 'week'
    },
    {
      query: "productivity and workflow",
      userId: "user_123",
      searchType: 'hybrid'
    }
  );

  console.log('📅 Temporal Analysis Results:', {
    totalMemories: temporalResults.results.length,
    timelineEvents: temporalResults.timeline.length,
    patterns: {
      peakDays: temporalResults.patterns.peakDays,
      seasonality: temporalResults.patterns.seasonality,
      correlations: temporalResults.patterns.correlations.slice(0, 3)
    }
  });

  // Display timeline insights
  temporalResults.timeline.forEach((period, index) => {
    console.log(`📊 Period ${index + 1}:`, {
      period: period.period,
      memoryCount: period.count,
      trend: period.trends.direction,
      hasAnomalies: period.trends.anomalies
    });
  });
}

// ========================================
// 🕸️ 4. KNOWLEDGE GRAPH SEARCH
// ========================================

console.log('🕸️ 4. Knowledge Graph Traversal Search');

async function demonstrateGraphSearch() {
  const searchService = new AdvancedSearchService();

  // Graph-based exploration starting from specific entities
  const graphResults = await searchService.graphSearch(
    {
      startNodes: ['Machine Learning', 'Python', 'Data Science'],
      maxDepth: 3,
      relationshipTypes: ['related_to', 'part_of', 'used_in'],
      pathFinding: 'weighted',
      includeMetadata: true,
      traversalDirection: 'both'
    },
    {
      userId: "user_123",
      searchType: 'graph',
      includeContent: true
    }
  );

  console.log('🌐 Graph Search Results:', {
    memoriesFound: graphResults.results.length,
    significantPaths: graphResults.paths.length,
    subgraphs: graphResults.subgraphs.length
  });

  // Display significant knowledge paths
  graphResults.paths.slice(0, 3).forEach((path, index) => {
    console.log(`🛤️  Knowledge Path ${index + 1}:`, {
      from: path.startNode,
      to: path.endNode,
      pathLength: path.path.length,
      relationshipCount: path.relationships.length,
      relevanceScore: path.score.toFixed(3)
    });
  });
}

// ========================================
// 📈 5. COMPREHENSIVE MEMORY ANALYTICS
// ========================================

console.log('📈 5. Memory Analytics & Insights');

async function demonstrateMemoryAnalytics() {
  const analyticsService = new MemoryAnalyticsService();

  // Get user's memories (would typically come from MemoryRetrievalService)
  const userMemories = []; // Placeholder - would be actual memory data

  // Generate comprehensive analytics
  const analytics = await analyticsService.generateMemoryAnalytics(
    "user_123",
    userMemories,
    {
      includeForecasting: true,
      includeClustering: true,
      includeInsights: true,
      periodStart: new Date('2024-01-01'),
      periodEnd: new Date('2024-12-31')
    }
  );

  console.log('📊 Memory Analytics Overview:', {
    totalMemories: analytics.totalMemories,
    averageImportance: analytics.averageImportance.toFixed(2),
    usagePatterns: analytics.usagePatterns.length,
    topCategories: analytics.topCategories.slice(0, 3),
    similarityClusters: analytics.similarityClusters.length,
    knowledgeDomains: analytics.knowledgeInsights.knowledgeDomains.length,
    recommendations: analytics.knowledgeInsights.recommendations.length
  });

  // Display usage patterns
  analytics.usagePatterns.forEach((pattern, index) => {
    console.log(`📊 Usage Pattern ${index + 1}:`, {
      type: pattern.type,
      pattern: pattern.pattern,
      trend: pattern.trend,
      frequency: pattern.frequency,
      peakTimes: pattern.peakTimes.slice(0, 2)
    });
  });

  // Display similarity clusters
  analytics.similarityClusters.slice(0, 3).forEach((cluster, index) => {
    console.log(`🎯 Memory Cluster ${index + 1}:`, {
      label: cluster.label,
      size: cluster.size,
      coherence: cluster.coherence.toFixed(2),
      dominantTopics: cluster.characteristics.dominantTopics,
      commonTags: cluster.characteristics.commonTags
    });
  });

  // Display knowledge insights and recommendations
  console.log('💡 Knowledge Insights:', {
    contentQuality: analytics.knowledgeInsights.contentQuality,
    learningProgression: analytics.knowledgeInsights.learningProgression.length,
    conceptualConnections: analytics.knowledgeInsights.conceptualConnections.length
  });

  analytics.knowledgeInsights.recommendations.slice(0, 3).forEach((rec, index) => {
    console.log(`💡 Recommendation ${index + 1}:`, {
      type: rec.type,
      priority: rec.priority,
      title: rec.title,
      reasoning: rec.reasoning
    });
  });
}

// ========================================
// 🚀 6. INTEGRATED PIPELINE WITH RETRIEVAL
// ========================================

console.log('🚀 6. Complete Memory Processing + Retrieval Pipeline');

async function demonstrateIntegratedWorkflow() {
  // Create pipeline with enhanced retrieval capabilities
  const pipeline = createQuickStartPipeline('DECENTRALIZED', {
    // Enhanced with retrieval configuration
    retrieval: {
      enableSemanticSearch: true,
      enableAnalytics: true,
      cacheSize: 1000,
      analyticsDepth: 'comprehensive'
    }
  });

  const retrievalService = new MemoryRetrievalService();
  const analyticsService = new MemoryAnalyticsService();

  // 1. Process new memory
  const newMemory = {
    id: 'mem_' + Date.now(),
    content: 'Today I learned about advanced neural network architectures, specifically transformers and their application in natural language processing. The attention mechanism is particularly fascinating.',
    category: 'learning',
    createdAt: new Date()
  };

  console.log('📝 Processing new memory...');
  const processingResult = await pipeline.processMemory(newMemory, 'user_123');
  
  console.log('✅ Memory processed successfully:', {
    steps: processingResult.steps.length,
    completedSteps: processingResult.steps.filter(s => s.status === 'completed').length,
    processingTime: processingResult.totalProcessingTime
  });

  // 2. Immediate contextual search
  console.log('🔍 Finding related memories...');
  const relatedMemories = await retrievalService.searchMemories({
    query: newMemory.content,
    userId: 'user_123',
    searchType: 'semantic',
    similarity: { k: 5, threshold: 0.7 },
    includeContent: true,
    categories: ['learning', 'work', 'research']
  });

  console.log('🎯 Related memories found:', {
    count: relatedMemories.results.length,
    topSimilarities: relatedMemories.results.slice(0, 3).map(r => r.similarity),
    processingTime: relatedMemories.stats.processingTime
  });

  // 3. Update analytics with new data
  console.log('📊 Updating analytics...');
  // In a real implementation, this would include the new memory
  const updatedAnalytics = await analyticsService.generateMemoryAnalytics(
    'user_123',
    [...relatedMemories.results], // Would include all user memories
    { includeInsights: true }
  );

  console.log('📈 Analytics updated:', {
    totalMemories: updatedAnalytics.totalMemories,
    newInsights: updatedAnalytics.knowledgeInsights.recommendations.length,
    performanceImprovement: updatedAnalytics.retrievalPerformance.cacheHitRate
  });
}

// ========================================
// 🏃 RUN ALL EXAMPLES
// ========================================

export async function runMemoryRetrievalExamples() {
  console.log('🚀 Personal Data Wallet SDK - Enhanced Memory Retrieval Examples\n');
  
  try {
    await demonstrateUnifiedSearch();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await demonstrateFacetedSearch();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await demonstrateTemporalSearch();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await demonstrateGraphSearch();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await demonstrateMemoryAnalytics();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await demonstrateIntegratedWorkflow();
    
    console.log('\n✅ All memory retrieval examples completed successfully!');
    
  } catch (error) {
    console.error('❌ Example execution failed:', error);
  }
}

// Export individual examples for selective testing
export {
  demonstrateUnifiedSearch,
  demonstrateFacetedSearch,
  demonstrateTemporalSearch,
  demonstrateGraphSearch,
  demonstrateMemoryAnalytics,
  demonstrateIntegratedWorkflow
};

// Example usage summary
console.log(`
📖 MEMORY RETRIEVAL CAPABILITIES SUMMARY

✅ IMPLEMENTED:
1. 🔍 Unified Memory Search - Vector, semantic, keyword, graph, temporal, hybrid
2. 📊 Advanced Faceted Search - Multi-dimensional filtering with aggregations  
3. 🕒 Temporal Analysis - Time-based patterns, trends, anomaly detection
4. 🕸️  Knowledge Graph Search - Entity traversal, relationship discovery
5. 📈 Memory Analytics - Usage patterns, clustering, insights, recommendations
6. ⚡ Performance Optimization - Multi-tier caching, batch processing
7. 🎯 Smart Relevance - Combined scoring from multiple search dimensions
8. 💡 AI-Powered Insights - Semantic understanding, learning progression tracking

🔧 INTEGRATION READY:
- Seamless integration with existing MemoryPipeline
- Compatible with all storage backends (Walrus, SEAL encryption)
- Real-time search with caching for performance
- Extensible architecture for custom search algorithms
- Comprehensive analytics and monitoring

🚀 NEXT STEPS:
- Add real-time streaming capabilities
- Implement memory export/backup system
- Enhanced relationship discovery algorithms
- Advanced decryption pipeline integration
`);
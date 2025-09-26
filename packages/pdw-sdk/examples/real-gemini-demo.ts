/**
 * Real Google Gemini AI Integration Demo
 * 
 * This demo showcases the GraphService working with real Google Gemini AI
 * to extract entities and relationships from text content.
 */

import { GraphService } from '../src/graph/GraphService';
import { GeminiAIService } from '../src/services/GeminiAIService';

async function demoRealGeminiIntegration() {
  console.log('🚀 Real Google Gemini AI Integration Demo');
  console.log('==========================================\n');

  // Check for API key
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Missing API key. Please set GOOGLE_AI_API_KEY or GEMINI_API_KEY environment variable.');
    console.log('\nTo get your API key:');
    console.log('1. Visit https://makersuite.google.com/app/apikey');
    console.log('2. Create a new API key');
    console.log('3. Set the environment variable: export GOOGLE_AI_API_KEY="your-key-here"');
    return;
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log('📝 Testing real AI-powered entity extraction...\n');

  try {
    // Test direct GeminiAIService
    console.log('=== STEP 1: Direct GeminiAIService Test ===');
    const geminiAI = new GeminiAIService({ apiKey });
    
    // Test connection
    console.log('🔌 Testing AI connection...');
    const connected = await geminiAI.testConnection();
    console.log(`   Connection: ${connected ? '✅ SUCCESS' : '❌ FAILED'}\n`);
    
    if (!connected) {
      console.error('❌ Cannot connect to Gemini API. Please check your API key.');
      return;
    }

    // Test entity extraction
    console.log('🧠 Testing entity extraction...');
    const testContent = 'Elon Musk is the CEO of Tesla and SpaceX. He lives in Austin, Texas and is working on neural interfaces through Neuralink.';
    
    const extractionResult = await geminiAI.extractEntitiesAndRelationships({
      content: testContent,
      confidenceThreshold: 0.7
    });

    console.log(`✅ Extracted ${extractionResult.entities.length} entities and ${extractionResult.relationships.length} relationships`);
    console.log(`   Processing time: ${extractionResult.processingTimeMs}ms\n`);

    console.log('📊 Entities found:');
    extractionResult.entities.forEach((entity, i) => {
      console.log(`   ${i + 1}. ${entity.label} (${entity.type}) - confidence: ${entity.confidence.toFixed(2)}`);
    });

    console.log('\n🔗 Relationships found:');
    extractionResult.relationships.forEach((rel, i) => {
      console.log(`   ${i + 1}. ${rel.source} → ${rel.label} → ${rel.target} (confidence: ${rel.confidence.toFixed(2)})`);
    });

    // Test GraphService integration
    console.log('\n=== STEP 2: GraphService Integration Test ===');
    const graphService = new GraphService({
      geminiApiKey: apiKey,
      confidenceThreshold: 0.7,
      useMockAI: false // Use real AI
    });

    // Test AI connectivity through GraphService
    const aiStatus = await graphService.testAIConnection();
    console.log(`🔌 GraphService AI Status: ${aiStatus.connected ? '✅ CONNECTED' : '❌ DISCONNECTED'}`);
    console.log(`   Service: ${aiStatus.service}, Using mock: ${aiStatus.usingMock}\n`);

    // Extract entities using GraphService
    console.log('🔄 Extracting entities through GraphService...');
    const graphResult = await graphService.extractEntitiesAndRelationships(
      testContent,
      'demo-memory-1'
    );

    console.log(`✅ GraphService extracted ${graphResult.entities.length} entities and ${graphResult.relationships.length} relationships`);
    console.log(`   Overall confidence: ${graphResult.confidence.toFixed(2)}`);
    console.log(`   Processing time: ${graphResult.processingTimeMs}ms\n`);

    // Build a knowledge graph
    console.log('=== STEP 3: Knowledge Graph Building ===');
    const knowledgeGraph = graphService.createGraph('demo-user');
    
    const updatedGraph = graphService.addToGraph(
      knowledgeGraph,
      graphResult.entities,
      graphResult.relationships,
      'demo-memory-1'
    );

    console.log('📈 Knowledge Graph Statistics:');
    const stats = graphService.getGraphStats(updatedGraph);
    console.log(`   Total entities: ${stats.totalEntities}`);
    console.log(`   Total relationships: ${stats.totalRelationships}`);
    console.log(`   Entity types: ${Object.keys(stats.entityTypes).join(', ')}`);
    console.log(`   Average connections: ${stats.averageConnections.toFixed(2)}`);
    console.log(`   Graph density: ${stats.graphDensity.toFixed(4)}\n`);

    // Test graph querying
    console.log('=== STEP 4: Graph Querying ===');
    const personEntities = graphService.queryGraph(updatedGraph, {
      entityTypes: ['person']
    });

    console.log(`🔍 Found ${personEntities.entities.length} person entities:`);
    personEntities.entities.forEach(entity => {
      console.log(`   - ${entity.label} (confidence: ${entity.confidence?.toFixed(2)})`);
    });

    // Find related entities
    if (personEntities.entities.length > 0) {
      const relatedEntities = graphService.findRelatedEntities(
        updatedGraph,
        [personEntities.entities[0].id],
        { maxHops: 2 }
      );

      console.log(`\n🕸️  Found ${relatedEntities.entities.length} entities related to ${personEntities.entities[0].label}:`);
      relatedEntities.entities.forEach(entity => {
        console.log(`   - ${entity.label} (${entity.type})`);
      });
    }

    console.log('\n🎉 Demo completed successfully!');
    console.log('✅ Real Google Gemini AI integration is working correctly');

  } catch (error) {
    console.error('❌ Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo
demoRealGeminiIntegration().catch(console.error);
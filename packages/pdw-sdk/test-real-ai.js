/**
 * Simple Real AI Integration Test
 * 
 * Quick test of Google Gemini integration using Node.js require
 */

const { GraphService } = require('../dist/graph/GraphService');
const { GeminiAIService } = require('../dist/services/GeminiAIService');
require('dotenv').config({ path: '.env.test' });

async function testRealAI() {
  console.log('🚀 Testing Real Google Gemini AI Integration');
  console.log('===========================================\n');

  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    console.error('❌ No Google AI API key found');
    return;
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);

  try {
    // Test GeminiAIService directly
    console.log('🧠 Testing GeminiAIService...');
    const geminiAI = new GeminiAIService({ apiKey });
    
    const testContent = 'Tesla is led by Elon Musk. The company makes electric vehicles in Austin, Texas.';
    console.log(`📝 Content: "${testContent}"`);
    
    console.log('⏳ Extracting entities and relationships...');
    const result = await geminiAI.extractEntitiesAndRelationships({
      content: testContent,
      confidenceThreshold: 0.6
    });

    console.log(`✅ Success! Found ${result.entities.length} entities and ${result.relationships.length} relationships`);
    console.log(`⏱️  Processing time: ${result.processingTimeMs}ms\n`);

    console.log('📊 Entities:');
    result.entities.forEach((entity, i) => {
      console.log(`   ${i + 1}. ${entity.label} (${entity.type}) - ${entity.confidence.toFixed(2)}`);
    });

    console.log('\n🔗 Relationships:');
    result.relationships.forEach((rel, i) => {
      console.log(`   ${i + 1}. ${rel.source} → ${rel.label} → ${rel.target} (${rel.confidence.toFixed(2)})`);
    });

    // Test GraphService integration
    console.log('\n🕸️  Testing GraphService with real AI...');
    const graphService = new GraphService({
      geminiApiKey: apiKey,
      useMockAI: false,
      confidenceThreshold: 0.6
    });

    const graphResult = await graphService.extractEntitiesAndRelationships(testContent, 'test-memory');
    console.log(`✅ GraphService: ${graphResult.entities.length} entities, ${graphResult.relationships.length} relationships`);
    console.log(`   Confidence: ${graphResult.confidence.toFixed(2)}, Time: ${graphResult.processingTimeMs}ms`);

    console.log('\n🎉 Real AI integration is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealAI();
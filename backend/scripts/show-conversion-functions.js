/**
 * Metadata Conversion Functions for Gemini Service
 * 
 * This script shows the exact functions used to convert memory content 
 * and metadata into embeddings using the Gemini API.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔄 METADATA CONVERSION FUNCTIONS - GEMINI SERVICE\n');
console.log('═'.repeat(60));

// Initialize Gemini API (same as in GeminiService)
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

/**
 * CORE FUNCTION 1: Basic Text Embedding (from GeminiService.embedText)
 * This is the foundation function that converts any text to a 768D vector
 */
async function embedText(text, modelName = 'text-embedding-004') {
  try {
    console.log('🧠 FUNCTION: embedText()');
    console.log('📝 Input text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));
    console.log('🤖 Model:', modelName);
    
    const embeddingModel = genAI.getGenerativeModel({ model: modelName });
    const result = await embeddingModel.embedContent(text);
    const vector = result.embedding.values;
    
    console.log('✅ Output vector dimension:', vector.length);
    console.log('📊 Sample values:', vector.slice(0, 5).map(v => v.toFixed(6)));
    console.log('');
    
    return { vector };
  } catch (error) {
    console.error('❌ Error in embedText:', error.message);
    throw error;
  }
}

/**
 * CORE FUNCTION 2: Metadata-Enhanced Embedding
 * This function creates embeddings specifically for metadata by combining 
 * category, topic, and content into a structured format
 */
async function createMetadataEmbedding(content, category, topic, additionalContext = {}) {
  try {
    console.log('🏷️  FUNCTION: createMetadataEmbedding()');
    console.log('📂 Category:', category);
    console.log('🏷️  Topic:', topic);
    console.log('📝 Content preview:', content.substring(0, 60) + '...');
    
    // STEP 1: Create structured embedding text
    // This is the key function that combines metadata with content
    const embeddingText = createStructuredEmbeddingText(content, category, topic, additionalContext);
    
    console.log('🔤 Structured text for embedding:');
    console.log('   "' + embeddingText.substring(0, 120) + '..."');
    
    // STEP 2: Generate embedding using the structured text
    const result = await embedText(embeddingText);
    
    // STEP 3: Create embedding metadata
    const embeddingMetadata = {
      originalContent: content,
      category,
      topic,
      embeddingText,
      vector: result.vector,
      dimension: result.vector.length,
      timestamp: Date.now(),
      additionalContext
    };
    
    console.log('✅ Metadata embedding created successfully');
    console.log('');
    
    return embeddingMetadata;
  } catch (error) {
    console.error('❌ Error in createMetadataEmbedding:', error.message);
    throw error;
  }
}

/**
 * CORE FUNCTION 3: Structured Embedding Text Creation
 * This function formats the input data into an optimal structure for embedding generation
 */
function createStructuredEmbeddingText(content, category, topic, additionalContext = {}) {
  console.log('📋 FUNCTION: createStructuredEmbeddingText()');
  
  // Create different embedding text formats for different use cases
  const formats = {
    // Format 1: Simple concatenation (basic)
    simple: `Category: ${category}, Topic: ${topic}, Content: ${content}`,
    
    // Format 2: Structured with context (enhanced)
    structured: `Memory Classification:
Category: ${category}
Topic: ${topic}
${Object.keys(additionalContext).length > 0 ? 
  'Context: ' + Object.entries(additionalContext).map(([k,v]) => `${k}=${v}`).join(', ') + '\n' : 
  ''}Content: ${content}`,
    
    // Format 3: Natural language (semantic)
    natural: `This is a ${category} memory about ${topic}. ${
      Object.keys(additionalContext).length > 0 ? 
      'Additional context: ' + Object.entries(additionalContext).map(([k,v]) => `${k} is ${v}`).join(', ') + '. ' : 
      ''
    }The content is: ${content}`,
    
    // Format 4: Query-optimized (for search)
    queryOptimized: `${category} ${topic} ${Object.values(additionalContext).join(' ')} ${content}`
  };
  
  // Log all format options
  console.log('📝 Available embedding text formats:');
  Object.entries(formats).forEach(([name, text]) => {
    console.log(`   ${name}: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`);
  });
  
  // For this implementation, we use the 'structured' format as it provides
  // the best balance of structure and semantic meaning
  const selectedFormat = formats.structured;
  console.log(`✅ Selected format: structured (${selectedFormat.length} chars)`);
  
  return selectedFormat;
}

/**
 * CORE FUNCTION 4: Batch Metadata Embedding
 * This function processes multiple memories with their metadata simultaneously
 */
async function createBatchMetadataEmbeddings(memories) {
  try {
    console.log('📦 FUNCTION: createBatchMetadataEmbeddings()');
    console.log('📊 Processing', memories.length, 'memories');
    
    const results = [];
    
    for (let i = 0; i < memories.length; i++) {
      const memory = memories[i];
      console.log(`\n📝 Processing memory ${i + 1}/${memories.length}:`);
      
      const embeddingResult = await createMetadataEmbedding(
        memory.content,
        memory.category,
        memory.topic,
        memory.additionalContext || {}
      );
      
      results.push({
        index: i,
        originalMemory: memory,
        embedding: embeddingResult
      });
    }
    
    console.log('\n✅ Batch processing complete');
    console.log('📊 Results summary:');
    console.log(`   Total processed: ${results.length}`);
    console.log(`   Total dimensions: ${results.length * 768}`);
    console.log(`   Average content length: ${Math.round(results.reduce((sum, r) => sum + r.originalMemory.content.length, 0) / results.length)} chars`);
    
    return results;
  } catch (error) {
    console.error('❌ Error in createBatchMetadataEmbeddings:', error.message);
    throw error;
  }
}

/**
 * CORE FUNCTION 5: Memory Similarity Calculation
 * This function compares metadata embeddings to find semantic similarities
 */
function calculateMemorySimilarity(embeddingA, embeddingB) {
  console.log('🎯 FUNCTION: calculateMemorySimilarity()');
  
  const vectorA = embeddingA.vector;
  const vectorB = embeddingB.vector;
  
  // Cosine similarity calculation
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] ** 2;
    normB += vectorB[i] ** 2;
  }
  
  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  
  console.log('📊 Similarity calculation:');
  console.log(`   Memory A: ${embeddingA.category} - ${embeddingA.topic}`);
  console.log(`   Memory B: ${embeddingB.category} - ${embeddingB.topic}`);
  console.log(`   Similarity score: ${similarity.toFixed(6)}`);
  console.log('');
  
  return {
    similarity,
    memoryA: { category: embeddingA.category, topic: embeddingA.topic },
    memoryB: { category: embeddingB.category, topic: embeddingB.topic },
    vectorDimensions: vectorA.length
  };
}

/**
 * DEMONSTRATION: Complete Metadata Conversion Workflow
 */
async function demonstrateMetadataConversion() {
  console.log('🚀 DEMONSTRATION: Complete Metadata Conversion Workflow');
  console.log('═'.repeat(60));
  
  // Sample memories for demonstration
  const sampleMemories = [
    {
      content: "Learned about React hooks, specifically useState and useEffect. The key insight is that hooks allow functional components to have state and lifecycle methods.",
      category: "learning",
      topic: "React development",
      additionalContext: { difficulty: "intermediate", source: "tutorial" }
    },
    {
      content: "Team standup: Discussed sprint planning for the new authentication system. Need to implement OAuth2 integration and JWT token management.",
      category: "work",
      topic: "Sprint planning meeting",
      additionalContext: { attendees: "5", priority: "high" }
    },
    {
      content: "Grocery shopping reminder: Need to buy organic vegetables, quinoa, Greek yogurt, and salmon for meal prep this week.",
      category: "personal",
      topic: "Meal planning and shopping",
      additionalContext: { budget: "100", store: "whole-foods" }
    }
  ];
  
  try {
    // Step 1: Create embeddings for all memories
    console.log('\n📊 STEP 1: Creating embeddings for all memories');
    const embeddingResults = await createBatchMetadataEmbeddings(sampleMemories);
    
    // Step 2: Demonstrate similarity calculations
    console.log('\n🎯 STEP 2: Calculating cross-memory similarities');
    const similarities = [];
    
    for (let i = 0; i < embeddingResults.length; i++) {
      for (let j = i + 1; j < embeddingResults.length; j++) {
        const simResult = calculateMemorySimilarity(
          embeddingResults[i].embedding,
          embeddingResults[j].embedding
        );
        similarities.push(simResult);
      }
    }
    
    // Step 3: Show search functionality
    console.log('\n🔍 STEP 3: Demonstrating search functionality');
    const searchQuery = "software development and programming";
    console.log(`Search query: "${searchQuery}"`);
    
    const queryEmbedding = await embedText(searchQuery);
    
    const searchResults = embeddingResults.map((result, index) => ({
      index,
      category: result.embedding.category,
      topic: result.embedding.topic,
      similarity: calculateMemorySimilarity(
        { vector: queryEmbedding.vector, category: 'query', topic: searchQuery },
        result.embedding
      ).similarity
    }));
    
    searchResults.sort((a, b) => b.similarity - a.similarity);
    
    console.log('🏆 Search results (ranked by similarity):');
    searchResults.forEach((result, rank) => {
      console.log(`${rank + 1}. ${result.category} - ${result.topic}: ${result.similarity.toFixed(4)}`);
    });
    
    // Step 4: Show storage format
    console.log('\n💾 STEP 4: Storage format for Walrus');
    const storageExample = {
      blobId: 'example_blob_123',
      metadata: {
        vector: embeddingResults[0].embedding.vector,
        dimension: 768,
        category: embeddingResults[0].embedding.category,
        topic: embeddingResults[0].embedding.topic,
        contentHash: require('crypto').createHash('sha256').update(embeddingResults[0].embedding.originalContent).digest('hex'),
        timestamp: embeddingResults[0].embedding.timestamp
      }
    };
    
    console.log('📁 Storage format preview:');
    console.log('   Blob ID:', storageExample.blobId);
    console.log('   Vector dimension:', storageExample.metadata.dimension);
    console.log('   Category:', storageExample.metadata.category);
    console.log('   Topic:', storageExample.metadata.topic);
    console.log('   File size estimate:', JSON.stringify(storageExample).length, 'bytes');
    
    return {
      embeddings: embeddingResults,
      similarities,
      searchResults,
      storageExample
    };
    
  } catch (error) {
    console.error('❌ Error in demonstration:', error.message);
    throw error;
  }
}

// Run the demonstration
async function main() {
  try {
    const results = await demonstrateMetadataConversion();
    
    console.log('\n✅ METADATA CONVERSION DEMONSTRATION COMPLETE!');
    console.log('═'.repeat(60));
    console.log('📋 Key Functions Demonstrated:');
    console.log('• embedText() - Basic text to vector conversion');
    console.log('• createMetadataEmbedding() - Enhanced metadata embedding');
    console.log('• createStructuredEmbeddingText() - Text formatting for optimal embeddings');
    console.log('• createBatchMetadataEmbeddings() - Batch processing');
    console.log('• calculateMemorySimilarity() - Similarity calculations');
    console.log('');
    console.log('🎯 These functions are the core of the metadata embedding system');
    console.log('🔧 They can be integrated directly into the WalrusService and MemoryIngestionService');
    
  } catch (error) {
    console.error('❌ Demonstration failed:', error.message);
  }
}

main().catch(console.error);
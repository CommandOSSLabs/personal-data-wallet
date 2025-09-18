/**
 * Metadata Output Display Script
 * 
 * This script generates and displays detailed metadata examples
 * to show the complete structure and content of our metadata embedding system.
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const crypto = require('crypto');

console.log('📊 METADATA EMBEDDING SYSTEM - OUTPUT DISPLAY\n');
console.log('═'.repeat(60));

// Initialize Gemini API
const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

async function generateMetadata(content, category, topic, importance = 5, customMetadata = {}) {
  // 1. Basic content analysis
  const contentBuffer = Buffer.from(content, 'utf-8');
  const contentHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
  const timestamp = Date.now();
  
  // 2. Generate embedding
  const embeddingText = `Category: ${category}, Topic: ${topic}, Content: ${content}`;
  const result = await model.embedContent(embeddingText);
  const vector = result.embedding.values;
  
  // 3. Generate embedding blob ID (simulated storage)
  const embeddingBlobId = `local_${timestamp}_${Math.random().toString(36).substring(2, 11)}`;
  
  // 4. Create complete metadata structure
  return {
    // Content identification
    contentType: 'text/plain',
    contentSize: contentBuffer.length,
    contentHash,
    
    // Memory classification
    category,
    topic,
    importance: Math.max(1, Math.min(10, importance)),
    
    // Vector embedding data
    embeddingBlobId,
    embeddingDimension: vector.length,
    embeddingVector: vector, // Full 768D vector
    
    // Temporal metadata
    createdTimestamp: timestamp,
    updatedTimestamp: timestamp,
    
    // Extensible custom metadata
    customMetadata: {
      source: 'metadata-display-script',
      apiVersion: 'text-embedding-004',
      processingTime: Date.now() - timestamp,
      ...customMetadata
    },
    
    // Statistics
    vectorStats: {
      min: Math.min(...vector),
      max: Math.max(...vector),
      mean: vector.reduce((sum, val) => sum + val, 0) / vector.length,
      norm: Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
    }
  };
}

async function displayMetadataExamples() {
  console.log('🧠 GENERATING METADATA WITH REAL EMBEDDINGS...\n');
  
  // Example 1: Learning Memory
  console.log('📚 EXAMPLE 1: LEARNING MEMORY');
  console.log('-'.repeat(40));
  
  const learningMemory = await generateMetadata(
    "Today I learned about React's useEffect hook and how it handles component lifecycle. The dependency array is crucial for preventing infinite re-renders. I also discovered how to cleanup side effects properly.",
    "learning",
    "React hooks and lifecycle",
    8,
    { 
      source: "personal-study", 
      difficulty: "intermediate",
      tags: "react,hooks,useEffect,lifecycle" 
    }
  );
  
  console.log('📋 METADATA STRUCTURE:');
  console.log(JSON.stringify({
    contentType: learningMemory.contentType,
    contentSize: learningMemory.contentSize,
    contentHash: learningMemory.contentHash.substring(0, 16) + '...',
    category: learningMemory.category,
    topic: learningMemory.topic,
    importance: learningMemory.importance,
    embeddingBlobId: learningMemory.embeddingBlobId,
    embeddingDimension: learningMemory.embeddingDimension,
    createdTimestamp: learningMemory.createdTimestamp,
    customMetadata: learningMemory.customMetadata
  }, null, 2));
  
  console.log('\n🔢 EMBEDDING VECTOR SAMPLE:');
  console.log(`First 10 values: [${learningMemory.embeddingVector.slice(0, 10).map(v => v.toFixed(6)).join(', ')}]`);
  console.log(`Last 10 values:  [${learningMemory.embeddingVector.slice(-10).map(v => v.toFixed(6)).join(', ')}]`);
  
  console.log('\n📊 VECTOR STATISTICS:');
  console.log(`Dimension: ${learningMemory.vectorStats}`);
  console.log(`Min value: ${learningMemory.vectorStats.min.toFixed(6)}`);
  console.log(`Max value: ${learningMemory.vectorStats.max.toFixed(6)}`);
  console.log(`Mean: ${learningMemory.vectorStats.mean.toFixed(6)}`);
  console.log(`Norm: ${learningMemory.vectorStats.norm.toFixed(6)}`);
  
  // Example 2: Work Memory
  console.log('\n\n💼 EXAMPLE 2: WORK MEMORY');
  console.log('-'.repeat(40));
  
  const workMemory = await generateMetadata(
    "Team meeting recap: We decided to implement microservices architecture for the new payment system. Key concerns were data consistency and transaction reliability. Action items assigned to backend team.",
    "work",
    "Architecture planning meeting",
    9,
    { 
      attendees: "5", 
      department: "engineering",
      project: "payment-system-v2",
      priority: "high"
    }
  );
  
  console.log('📋 METADATA STRUCTURE:');
  console.log(JSON.stringify({
    contentType: workMemory.contentType,
    contentSize: workMemory.contentSize,
    contentHash: workMemory.contentHash.substring(0, 16) + '...',
    category: workMemory.category,
    topic: workMemory.topic,
    importance: workMemory.importance,
    embeddingBlobId: workMemory.embeddingBlobId,
    embeddingDimension: workMemory.embeddingDimension,
    customMetadata: workMemory.customMetadata
  }, null, 2));
  
  // Example 3: Personal Memory
  console.log('\n\n👤 EXAMPLE 3: PERSONAL MEMORY');
  console.log('-'.repeat(40));
  
  const personalMemory = await generateMetadata(
    "Grocery list for weekend: organic vegetables, whole grain bread, Greek yogurt, salmon fillets, quinoa, blueberries. Need to remember to use the discount coupon.",
    "personal",
    "Shopping and meal planning",
    4,
    { 
      location: "whole-foods", 
      budget: "150",
      dietary: "healthy-eating"
    }
  );
  
  console.log('📋 METADATA STRUCTURE:');
  console.log(JSON.stringify({
    contentType: personalMemory.contentType,
    contentSize: personalMemory.contentSize,
    contentHash: personalMemory.contentHash.substring(0, 16) + '...',
    category: personalMemory.category,
    topic: personalMemory.topic,
    importance: personalMemory.importance,
    embeddingDimension: personalMemory.embeddingDimension,
    customMetadata: personalMemory.customMetadata
  }, null, 2));
  
  // Similarity Analysis
  console.log('\n\n🎯 SIMILARITY ANALYSIS');
  console.log('-'.repeat(40));
  
  function calculateCosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] ** 2;
      normB += vectorB[i] ** 2;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  const memories = [
    { name: "Learning Memory", metadata: learningMemory },
    { name: "Work Memory", metadata: workMemory },
    { name: "Personal Memory", metadata: personalMemory }
  ];
  
  console.log('🔍 CROSS-MEMORY SIMILARITIES:');
  for (let i = 0; i < memories.length; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const similarity = calculateCosineSimilarity(
        memories[i].metadata.embeddingVector,
        memories[j].metadata.embeddingVector
      );
      console.log(`${memories[i].name} ↔ ${memories[j].name}: ${similarity.toFixed(4)}`);
    }
  }
  
  // Storage Simulation
  console.log('\n\n💾 STORAGE SIMULATION');
  console.log('-'.repeat(40));
  
  console.log('📤 WALRUS STORAGE TAGS:');
  const walrusTags = {
    'content-type': learningMemory.contentType,
    'owner': '0x1234...abcd',
    'category': learningMemory.category,
    'topic': learningMemory.topic,
    'importance': learningMemory.importance.toString(),
    'content-hash': learningMemory.contentHash,
    'embedding-blob-id': learningMemory.embeddingBlobId,
    'embedding-dimension': learningMemory.embeddingDimension.toString(),
    'created': new Date(learningMemory.createdTimestamp).toISOString(),
    'source': learningMemory.customMetadata.source
  };
  
  console.log(JSON.stringify(walrusTags, null, 2));
  
  // Move Contract Data
  console.log('\n\n⛓️  MOVE CONTRACT STRUCTURE:');
  console.log('-'.repeat(40));
  
  const moveContractData = {
    memory_id: '0x' + crypto.randomBytes(32).toString('hex'),
    owner: '0x1234567890abcdef1234567890abcdef12345678',
    category: learningMemory.category,
    vector_id: 12345,
    blob_id: `blob_${learningMemory.embeddingBlobId}`,
    metadata: {
      content_type: learningMemory.contentType,
      content_size: learningMemory.contentSize,
      content_hash: learningMemory.contentHash,
      category: learningMemory.category,
      topic: learningMemory.topic,
      importance: learningMemory.importance,
      embedding_blob_id: learningMemory.embeddingBlobId,
      embedding_dimension: learningMemory.embeddingDimension,
      created_timestamp: learningMemory.createdTimestamp,
      updated_timestamp: learningMemory.updatedTimestamp
    }
  };
  
  console.log(JSON.stringify(moveContractData, null, 2));
  
  // Full Embedding Data (JSON format as stored on Walrus)
  console.log('\n\n🗄️  EMBEDDING STORAGE FORMAT:');
  console.log('-'.repeat(40));
  
  const embeddingStorageData = {
    vector: learningMemory.embeddingVector,
    dimension: learningMemory.embeddingDimension,
    source: 'metadata',
    category: learningMemory.category,
    topic: learningMemory.topic,
    contentHash: learningMemory.contentHash,
    timestamp: learningMemory.createdTimestamp,
    stats: learningMemory.vectorStats
  };
  
  console.log('📁 File size estimate:', JSON.stringify(embeddingStorageData).length, 'bytes');
  console.log('🔢 Vector dimension:', embeddingStorageData.dimension);
  console.log('📊 First 5 vector values:', embeddingStorageData.vector.slice(0, 5).map(v => v.toFixed(6)));
  
  // System Performance
  console.log('\n\n⚡ SYSTEM PERFORMANCE METRICS:');
  console.log('-'.repeat(40));
  
  const totalProcessingTime = memories.reduce((sum, m) => sum + m.metadata.customMetadata.processingTime, 0);
  
  console.log(`📈 Total memories processed: ${memories.length}`);
  console.log(`⏱️  Total processing time: ${totalProcessingTime}ms`);
  console.log(`📊 Average processing time: ${(totalProcessingTime / memories.length).toFixed(2)}ms per memory`);
  console.log(`💾 Total metadata size: ${JSON.stringify(memories).length} bytes`);
  console.log(`🧠 Total embedding dimensions: ${memories.length * 768} values`);
  
  return memories;
}

// Search Query Example
async function demonstrateSearch(memories) {
  console.log('\n\n🔍 SEARCH DEMONSTRATION');
  console.log('═'.repeat(60));
  
  const searchQuery = "programming and software development";
  console.log(`🔎 Search Query: "${searchQuery}"`);
  
  // Generate embedding for search query
  const queryResult = await model.embedContent(searchQuery);
  const queryVector = queryResult.embedding.values;
  
  console.log(`🧠 Query embedding generated (${queryVector.length}D)`);
  
  // Calculate similarities
  function calculateCosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] ** 2;
      normB += vectorB[i] ** 2;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  const searchResults = memories.map((memory, index) => ({
    index,
    name: memory.name,
    category: memory.metadata.category,
    topic: memory.metadata.topic,
    similarity: calculateCosineSimilarity(queryVector, memory.metadata.embeddingVector),
    contentPreview: memory.metadata.customMetadata.source
  }));
  
  // Sort by similarity
  searchResults.sort((a, b) => b.similarity - a.similarity);
  
  console.log('\n📊 SEARCH RESULTS (ranked by similarity):');
  searchResults.forEach((result, rank) => {
    console.log(`\n${rank + 1}. ${result.name}`);
    console.log(`   📊 Similarity Score: ${result.similarity.toFixed(4)}`);
    console.log(`   📂 Category: ${result.category}`);
    console.log(`   🏷️  Topic: ${result.topic}`);
    console.log(`   📝 Source: ${result.contentPreview}`);
  });
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting metadata output display...\n');
    
    const memories = await displayMetadataExamples();
    await demonstrateSearch(memories);
    
    console.log('\n\n✅ METADATA OUTPUT DISPLAY COMPLETE!');
    console.log('═'.repeat(60));
    console.log('📊 Summary:');
    console.log('• Generated 3 complete metadata examples with real embeddings');
    console.log('• Showed 768-dimensional vector data and statistics');
    console.log('• Demonstrated similarity calculations between memories');
    console.log('• Simulated Walrus storage tag structure');
    console.log('• Displayed Move contract data format');
    console.log('• Showed embedding storage JSON format');
    console.log('• Demonstrated semantic search functionality');
    console.log('\n🎉 Your metadata embedding system is working perfectly!');
    
  } catch (error) {
    console.error('❌ Error displaying metadata:', error.message);
    console.error(error.stack);
  }
}

main().catch(console.error);
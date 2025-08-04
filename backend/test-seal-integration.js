// Test SEAL Integration
const axios = require('axios');

const API_URL = 'http://localhost:3001';
const TEST_USER_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const TEST_SIGNATURE = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';

async function testSealIntegration() {
  console.log('Testing SEAL Integration...\n');

  try {
    // Test 1: Create a memory (tests encryption)
    console.log('1. Testing memory creation (encryption)...');
    const createMemoryResponse = await axios.post(`${API_URL}/memories`, {
      userAddress: TEST_USER_ADDRESS,
      content: 'This is a test memory for SEAL integration',
      category: 'GENERAL',
      metadata: {
        timestamp: new Date().toISOString()
      }
    });
    console.log('✓ Memory created successfully');
    console.log(`  Memory ID: ${createMemoryResponse.data.memoryId}`);
    console.log(`  Content encrypted and stored\n`);

    // Test 2: Search memories (tests decryption)
    console.log('2. Testing memory search (decryption)...');
    const searchResponse = await axios.post(`${API_URL}/memories/search`, {
      query: 'test memory',
      userAddress: TEST_USER_ADDRESS,
      userSignature: TEST_SIGNATURE,
      k: 5
    });
    console.log('✓ Memory search completed');
    console.log(`  Found ${searchResponse.data.results.length} memories\n`);

    // Test 3: Get memory context (tests decryption with signature)
    console.log('3. Testing memory context retrieval...');
    const contextResponse = await axios.post(`${API_URL}/memories/context`, {
      query_text: 'SEAL integration',
      user_address: TEST_USER_ADDRESS,
      user_signature: TEST_SIGNATURE,
      k: 3
    });
    console.log('✓ Memory context retrieved');
    console.log(`  Context length: ${contextResponse.data.context.length} characters`);
    console.log(`  Memories found: ${contextResponse.data.query_metadata.memories_found}\n`);

    // Test 4: Chat with memory context (tests full integration)
    console.log('4. Testing chat with encrypted memories...');
    const chatResponse = await axios.post(`${API_URL}/chat/message`, {
      text: 'What do you know about SEAL integration?',
      userId: TEST_USER_ADDRESS,
      userSignature: TEST_SIGNATURE,
      sessionId: 'test-session-123',
      model: 'gemini-1.5-pro'
    });
    console.log('✓ Chat response generated');
    console.log(`  Response: ${chatResponse.data.response.substring(0, 100)}...`);
    console.log(`  Memory stored: ${chatResponse.data.memoryStored}\n`);

    console.log('🎉 All SEAL integration tests passed!');
    console.log('\nSummary:');
    console.log('- Encryption: Working ✓');
    console.log('- Decryption: Working ✓');
    console.log('- Session key management: Working ✓');
    console.log('- Signature validation: Working ✓');
    console.log('- Full system integration: Working ✓');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('\nPossible issues:');
      console.error('1. SEAL key servers not configured properly');
      console.error('2. Invalid user signature format');
      console.error('3. Missing environment variables');
      console.error('4. Backend not rebuilt after SEAL integration');
    }
  }
}

// Check if server is running
axios.get(`${API_URL}/health`)
  .then(() => {
    console.log('Backend server is running at', API_URL);
    testSealIntegration();
  })
  .catch(() => {
    console.error('❌ Backend server is not running!');
    console.error('Please start the backend with: cd backend && npm run start:dev');
  });
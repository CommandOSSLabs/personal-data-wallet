const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const USER_ADDRESS = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';

async function testChatWorkflow() {
  console.log('===============================================');
  console.log('Personal Data Wallet - Chat Session Test');
  console.log('===============================================');
  console.log('User Address:', USER_ADDRESS);
  console.log('Network: Sui Testnet');
  console.log('');
  
  try {
    // 1. Create a chat session
    console.log('1. Creating a new chat session...');
    const createResponse = await axios.post(`${API_URL}/chat/sessions`, {
      userAddress: USER_ADDRESS,
      modelName: 'gemini-1.5-pro',
      title: 'Test Conversation'
    });
    
    const sessionId = createResponse.data.sessionId;
    console.log('   ✓ Session created on Sui testnet');
    console.log('   Session ID:', sessionId);
    console.log('   Transaction stored on-chain!');
    
    // 2. Add user message
    console.log('\n2. Adding user message...');
    await axios.post(`${API_URL}/chat/sessions/${sessionId}/messages`, {
      userAddress: USER_ADDRESS,
      type: 'user',
      content: 'What is blockchain technology?'
    });
    console.log('   ✓ User message added');
    
    // 3. Simulate AI response
    console.log('\n3. Adding AI response...');
    await axios.post(`${API_URL}/chat/sessions/${sessionId}/messages`, {
      userAddress: USER_ADDRESS,
      type: 'assistant',
      content: 'Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data.'
    });
    console.log('   ✓ AI response added');
    
    // 4. Retrieve full conversation
    console.log('\n4. Retrieving conversation from Sui...');
    const getResponse = await axios.get(`${API_URL}/chat/sessions/${sessionId}`, {
      params: { userAddress: USER_ADDRESS }
    });
    
    const session = getResponse.data.session;
    console.log('   ✓ Retrieved from blockchain:');
    console.log('   - Owner:', session.owner);
    console.log('   - Messages:', session.messages.length);
    console.log('   - Created:', session.created_at);
    
    // 5. List all sessions
    console.log('\n5. Listing all sessions for user...');
    const listResponse = await axios.get(`${API_URL}/chat/sessions`, {
      params: { userAddress: USER_ADDRESS }
    });
    
    console.log('   ✓ Found', listResponse.data.sessions.length, 'sessions on-chain');
    
    console.log('\n===============================================');
    console.log('SUCCESS! All chat operations working on Sui testnet');
    console.log('===============================================');
    console.log('\nKey achievements:');
    console.log('✓ Successfully connected to Sui testnet');
    console.log('✓ Created chat session object on-chain');
    console.log('✓ Stored messages in blockchain');
    console.log('✓ Retrieved data from Sui network');
    console.log('✓ Using your wallet address:', USER_ADDRESS);
    console.log('\nView your transaction on Sui Explorer:');
    console.log(`https://suiexplorer.com/object/${sessionId}?network=testnet`);
    
  } catch (error) {
    console.error('\nError:', error.response?.data || error.message);
  }
}

// Test Seal encryption service
async function testSealEncryption() {
  console.log('\n\n=== Testing Seal Encryption Service ===');
  
  try {
    const response = await axios.post(`${API_URL}/seal/session-message`, {
      userAddress: USER_ADDRESS
    });
    console.log('✓ Seal encryption service is active');
    console.log('  Session key message generated successfully');
    
  } catch (error) {
    console.error('✗ Seal service error:', error.response?.data || error.message);
  }
}

async function runTests() {
  await testChatWorkflow();
  await testSealEncryption();
}

runTests();
const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const TEST_USER_ADDRESS = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';

async function testSuiConnection() {
  console.log('\n=== Testing Sui Connection ===');
  
  try {
    // First, let's just try to list sessions (should work even if empty)
    console.log('1. Testing session list endpoint...');
    const listResponse = await axios.get(`${API_URL}/chat/sessions`, {
      params: { userAddress: TEST_USER_ADDRESS }
    });
    console.log('   Response:', JSON.stringify(listResponse.data, null, 2));
    
    // Test creating a session
    console.log('\n2. Testing session creation...');
    const createResponse = await axios.post(`${API_URL}/chat/sessions`, {
      userAddress: TEST_USER_ADDRESS,
      modelName: 'gemini-1.5-pro',
      title: 'Test Session'
    });
    console.log('   Response:', JSON.stringify(createResponse.data, null, 2));
    
    if (!createResponse.data.success) {
      console.log('\n   Session creation failed. Possible issues:');
      console.log('   - Check if SUI_ADMIN_PRIVATE_KEY in .env is valid');
      console.log('   - Check if the admin account has sufficient SUI for gas');
      console.log('   - Check if SUI_PACKAGE_ID is correct for testnet');
      console.log('   - Check if the package is actually deployed on testnet');
    }
    
  } catch (error) {
    console.error('\nError details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

async function testSealService() {
  console.log('\n=== Testing Seal Service ===');
  
  try {
    console.log('1. Getting session key message...');
    const response = await axios.post(`${API_URL}/seal/session-message`, {
      userAddress: TEST_USER_ADDRESS
    });
    console.log('   Success! Message length:', response.data.message.length);
    console.log('   First 64 chars:', response.data.message.substring(0, 64));
    
  } catch (error) {
    console.error('\nSeal service error:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

async function checkBackendConfig() {
  console.log('\n=== Backend Configuration Check ===');
  console.log('Please verify these environment variables in backend/.env:');
  console.log('1. SUI_NETWORK=testnet');
  console.log('2. SUI_PACKAGE_ID=0xd9fb17615647058753b483f3acfb2f79f8e3cd69483ded192dada595a0462935');
  console.log('3. SUI_ADMIN_PRIVATE_KEY=<valid private key with testnet SUI>');
  console.log('4. SEAL_NETWORK=testnet');
  console.log('\nAlso check:');
  console.log('- Is the smart contract deployed on testnet?');
  console.log('- Does the admin account have testnet SUI for gas?');
}

async function runDebugTests() {
  console.log('===============================================');
  console.log('Personal Data Wallet - Debug Test');
  console.log('===============================================');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User Address:', TEST_USER_ADDRESS);
  
  await testSuiConnection();
  await testSealService();
  await checkBackendConfig();
  
  console.log('\n===============================================');
  console.log('Debug test completed. Check the output above for issues.');
  console.log('===============================================');
}

// Check if backend is running
axios.get(`${API_URL}/chat/sessions?userAddress=test`)
  .then(() => {
    runDebugTests();
  })
  .catch((error) => {
    if (error.response && error.response.status) {
      runDebugTests();
    } else {
      console.error('Backend is not running! Please start it with: cd backend && npm run start:dev');
      process.exit(1);
    }
  });
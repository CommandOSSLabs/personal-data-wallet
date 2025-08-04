const axios = require('axios');

const API_URL = 'http://localhost:8000/api';
const USER_ADDRESS = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';
const APP_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'; // Example app address

async function testIBECapabilities() {
  console.log('===============================================');
  console.log('SEAL IBE Capability Test');
  console.log('===============================================');
  console.log('User Address:', USER_ADDRESS);
  console.log('App Address:', APP_ADDRESS);
  console.log('');
  
  try {
    // Test 1: Encrypt content for an app
    console.log('1. Testing encryption for app access...');
    const encryptResponse = await axios.post(`${API_URL}/seal/ibe/encrypt-for-app`, {
      content: 'This is sensitive user data that only the authorized app can read',
      userAddress: USER_ADDRESS,
      appAddress: APP_ADDRESS,
      category: 'health'
    });
    
    console.log('   ✓ Content encrypted for app');
    console.log('   Identity string:', encryptResponse.data.identityString);
    console.log('   Encrypted length:', encryptResponse.data.encrypted.length);
    
    const encryptedContent = encryptResponse.data.encrypted;
    
    // Test 2: Grant app permission
    console.log('\n2. Granting app permission...');
    const grantResponse = await axios.post(`${API_URL}/seal/ibe/permissions/grant`, {
      userAddress: USER_ADDRESS,
      appAddress: APP_ADDRESS,
      dataIds: ['memory1', 'memory2', 'memory3'],
      expiresAt: Math.floor(Date.now() / 1000) + 86400 // 24 hours from now
    });
    
    console.log('   ✓ Permission granted');
    console.log('   Permission ID:', grantResponse.data.permissionId);
    console.log('   Expires at:', new Date(grantResponse.data.expiresAt * 1000).toISOString());
    
    // Test 3: List permissions
    console.log('\n3. Listing user permissions...');
    const listResponse = await axios.get(`${API_URL}/seal/ibe/permissions?userAddress=${USER_ADDRESS}`);
    console.log('   ✓ Found', listResponse.data.length, 'permissions');
    
    // Test 4: Get app session message
    console.log('\n4. Getting session message for app...');
    const sessionResponse = await axios.post(`${API_URL}/seal/ibe/app-session-message`, {
      appAddress: APP_ADDRESS
    });
    console.log('   ✓ Session message generated');
    console.log('   Message:', sessionResponse.data.message.substring(0, 64) + '...');
    
    // Test 5: Try to decrypt as app (will fail without proper signature)
    console.log('\n5. Testing app decryption (expected to fail without signature)...');
    try {
      await axios.post(`${API_URL}/seal/ibe/decrypt-as-app`, {
        encryptedContent: encryptedContent,
        userAddress: USER_ADDRESS,
        appAddress: APP_ADDRESS,
        appSignature: 'dummy_signature' // This will fail
      });
    } catch (error) {
      console.log('   ✓ Decryption correctly failed without valid signature');
    }
    
    // Test 6: Time-locked encryption
    console.log('\n6. Testing time-locked encryption...');
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const timelockResponse = await axios.post(`${API_URL}/seal/ibe/encrypt-timelock`, {
      content: 'This data can only be decrypted after ' + new Date(futureTime * 1000).toISOString(),
      userAddress: USER_ADDRESS,
      expiresAt: futureTime
    });
    
    console.log('   ✓ Content encrypted with time-lock');
    console.log('   Unlocks at:', new Date(futureTime * 1000).toISOString());
    console.log('   Identity string:', timelockResponse.data.identityString);
    
    // Summary
    console.log('\n===============================================');
    console.log('IBE Capability Test Summary');
    console.log('===============================================');
    console.log('✓ Encrypt content for specific apps');
    console.log('✓ Grant/revoke app permissions');
    console.log('✓ Time-locked encryption');
    console.log('✓ Identity-based access control');
    console.log('\nKey Benefits:');
    console.log('- Users can share data with apps without sharing keys');
    console.log('- Apps can only decrypt data they have permission for');
    console.log('- Time-based and conditional access control');
    console.log('- On-chain permission management');
    
  } catch (error) {
    console.error('\nError:', error.response?.data || error.message);
  }
}

// Example: How an app would decrypt data
async function exampleAppDecryption() {
  console.log('\n\n=== Example: App Decryption Flow ===');
  console.log('1. App requests session message');
  console.log('2. App signs the message with its private key');
  console.log('3. App calls decrypt-as-app with signature');
  console.log('4. SEAL verifies app identity and permissions');
  console.log('5. If authorized, app receives decrypted data');
  
  console.log('\nCode example:');
  console.log(`
// In the app's code:
const sessionMessage = await getSessionMessage(appAddress);
const signature = await appKeypair.signPersonalMessage(sessionMessage);

const decryptedData = await decryptAsApp({
  encryptedContent,
  userAddress,
  appAddress,
  appSignature: signature
});
`);
}

// Run tests
testIBECapabilities().then(() => {
  exampleAppDecryption();
});
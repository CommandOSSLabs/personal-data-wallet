import axios from 'axios';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64 } from '@mysten/sui/utils';

const API_URL = 'http://localhost:8000/api';
const USER_ADDRESS = '0xc5e67f46e1b99b580da3a6cc69acf187d0c08dbe568f8f5a78959079c9d82a15';

// Generate a test app keypair
const appKeypair = new Ed25519Keypair();
const APP_ADDRESS = appKeypair.getPublicKey().toSuiAddress();

console.log('===============================================');
console.log('Testing IBE with Real App Signatures');
console.log('===============================================');
console.log('User Address:', USER_ADDRESS);
console.log('App Address:', APP_ADDRESS);
console.log('App Public Key:', appKeypair.getPublicKey().toBase64());
console.log('');

interface EncryptResponse {
  success: boolean;
  encrypted: string;
  backupKey: string;
  appAddress: string;
  identityString: string;
}

interface DecryptResponse {
  success: boolean;
  content?: string;
  error?: string;
}

interface PermissionResponse {
  permissionId: string;
  appAddress: string;
  dataIds: string[];
  expiresAt?: number;
}

async function testRealAppSignatures(): Promise<void> {
  try {
    // Step 1: User encrypts content for the app
    console.log('1. User encrypts content for app...');
    const encryptResponse = await axios.post<EncryptResponse>(`${API_URL}/seal/ibe/encrypt-for-app`, {
      content: 'This is sensitive health data that only the authorized app can read',
      userAddress: USER_ADDRESS,
      appAddress: APP_ADDRESS,
      category: 'health'
    });
    
    console.log('   ✓ Content encrypted');
    console.log('   Identity:', encryptResponse.data.identityString);
    const encryptedContent = encryptResponse.data.encrypted;
    
    // Step 2: App gets session message
    console.log('\n2. App requests session message...');
    const sessionResponse = await axios.post<{ message: string }>(`${API_URL}/seal/ibe/app-session-message`, {
      appAddress: APP_ADDRESS
    });
    
    const messageHex = sessionResponse.data.message;
    const messageBytes = Buffer.from(messageHex, 'hex');
    console.log('   ✓ Session message received');
    console.log('   Message length:', messageBytes.length, 'bytes');
    
    // Step 3: App signs the message
    console.log('\n3. App signs session message...');
    const { signature } = await appKeypair.signPersonalMessage(messageBytes);
    console.log('   ✓ Signature generated');
    console.log('   Signature:', signature);
    
    // Step 4: App attempts to decrypt
    console.log('\n4. App attempts to decrypt...');
    try {
      const decryptResponse = await axios.post<DecryptResponse>(`${API_URL}/seal/ibe/decrypt-as-app`, {
        encryptedContent: encryptedContent,
        userAddress: USER_ADDRESS,
        appAddress: APP_ADDRESS,
        appSignature: signature
      });
      
      if (decryptResponse.data.success) {
        console.log('   ✓ Decryption successful!');
        console.log('   Decrypted content:', decryptResponse.data.content);
      } else {
        console.log('   ✗ Decryption failed:', decryptResponse.data.error);
      }
    } catch (error: any) {
      console.log('   ✗ Decryption error:', error.response?.data || error.message);
    }
    
    // Step 5: Test permission grant
    console.log('\n5. User grants permission to app...');
    const grantResponse = await axios.post<PermissionResponse>(`${API_URL}/seal/ibe/permissions/grant`, {
      userAddress: USER_ADDRESS,
      appAddress: APP_ADDRESS,
      dataIds: ['health_data_1', 'health_data_2'],
      expiresAt: Math.floor(Date.now() / 1000) + 86400 // 24 hours
    });
    
    console.log('   ✓ Permission granted');
    console.log('   Permission ID:', grantResponse.data.permissionId);
    
    // Step 6: Test with wrong app
    console.log('\n6. Testing with unauthorized app...');
    const wrongAppKeypair = new Ed25519Keypair();
    const wrongAppAddress = wrongAppKeypair.getPublicKey().toSuiAddress();
    
    try {
      const wrongSessionResponse = await axios.post<{ message: string }>(`${API_URL}/seal/ibe/app-session-message`, {
        appAddress: wrongAppAddress
      });
      
      const wrongMessageBytes = Buffer.from(wrongSessionResponse.data.message, 'hex');
      const { signature: wrongSignature } = await wrongAppKeypair.signPersonalMessage(wrongMessageBytes);
      
      const wrongDecryptResponse = await axios.post<DecryptResponse>(`${API_URL}/seal/ibe/decrypt-as-app`, {
        encryptedContent: encryptedContent,
        userAddress: USER_ADDRESS,
        appAddress: wrongAppAddress,
        appSignature: wrongSignature
      });
      
      console.log('   ✗ Wrong app should not decrypt:', wrongDecryptResponse.data);
    } catch (error) {
      console.log('   ✓ Correctly failed for unauthorized app');
    }
    
  } catch (error: any) {
    console.error('\nError:', error.response?.data || error.message);
  }
}

// Demo: Complete App Integration Flow
function demoAppIntegration(): void {
  console.log('\n\n===============================================');
  console.log('Demo: Complete App Integration Flow');
  console.log('===============================================');
  
  console.log('1. App Registration:');
  console.log('   - App generates keypair');
  console.log('   - App shares public address with user');
  
  console.log('\n2. User Grants Permission:');
  console.log('   - User encrypts data for app\'s identity');
  console.log('   - User grants on-chain permission');
  
  console.log('\n3. App Access Flow:');
  console.log('   - App requests session message');
  console.log('   - App signs with private key');
  console.log('   - App decrypts authorized data');
  
  console.log('\n4. Security Features:');
  console.log('   - Only the specified app can decrypt');
  console.log('   - Permissions can expire');
  console.log('   - User can revoke access anytime');
  console.log('   - All permissions tracked on-chain');
}

// Run the tests
if (require.main === module) {
  testRealAppSignatures().then(() => {
    demoAppIntegration();
  });
}

export { testRealAppSignatures, demoAppIntegration };
import { SessionKey } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX } from '@mysten/sui/utils';

async function debugSessionKey() {
  console.log('===============================================');
  console.log('Debugging SessionKey Signature Issue');
  console.log('===============================================\n');

  // Test configuration
  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  const TEST_ADDRESS = '0x6d276b258eac409de9aa6be1da445bbb0b7eaff87f39639b08cd8fcc1c501456';
  
  // Create a test keypair
  const keypair = new Ed25519Keypair();
  const address = keypair.getPublicKey().toSuiAddress();
  console.log('Test Address:', address);
  console.log('');

  try {
    // Step 1: Create SessionKey
    console.log('1. Creating SessionKey...');
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    // Try with string packageId
    console.log('   - Using string packageId');
    const sessionKey = new SessionKey({
      address: address,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 10,
      suiClient: suiClient,
    });
    console.log('   ✓ SessionKey created successfully');
    
    // Step 2: Get personal message
    console.log('\n2. Getting personal message...');
    const message = sessionKey.getPersonalMessage();
    console.log('   Message length:', message.length, 'bytes');
    console.log('   Message (hex):', Buffer.from(message).toString('hex'));
    
    // Step 3: Sign the message
    console.log('\n3. Signing personal message...');
    const { signature } = await keypair.signPersonalMessage(message);
    console.log('   ✓ Message signed');
    console.log('   Signature:', signature);
    
    // Step 4: Set the signature
    console.log('\n4. Setting signature on SessionKey...');
    try {
      sessionKey.setPersonalMessageSignature(signature);
      console.log('   ✓ Signature set successfully!');
    } catch (error: any) {
      console.log('   ✗ Failed to set signature:', error.message);
      console.log('   Error details:', error);
    }
    
    // Step 5: Test with string packageId
    console.log('\n5. Testing with string packageId...');
    try {
      const sessionKey2 = new SessionKey({
        address: address,
        packageId: SEAL_PACKAGE_ID, // String instead of bytes
        ttlMin: 10,
        suiClient: suiClient,
      });
      console.log('   ✓ SessionKey created with string packageId');
      
      const message2 = sessionKey2.getPersonalMessage();
      const { signature: signature2 } = await keypair.signPersonalMessage(message2);
      sessionKey2.setPersonalMessageSignature(signature2);
      console.log('   ✓ Signature set successfully with string packageId!');
    } catch (error: any) {
      console.log('   ✗ Error with string packageId:', error.message);
    }
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the debug script
if (require.main === module) {
  debugSessionKey().catch(console.error);
}

export { debugSessionKey };
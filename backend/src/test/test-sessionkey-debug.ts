import { SessionKey } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function testSessionKeyDebug() {
  console.log('===============================================');
  console.log('SessionKey Debug Test');
  console.log('===============================================\n');

  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
  
  // Create test keypair
  const keypair = new Ed25519Keypair();
  const address = keypair.getPublicKey().toSuiAddress();
  
  console.log('Test Address:', address);
  console.log('');

  try {
    // Test 1: Check if SessionKey has any internal state we can inspect
    console.log('1. Creating SessionKey and inspecting it...');
    const sessionKey = new SessionKey({
      address: address,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 30,
      suiClient: suiClient,
    });
    
    console.log('   SessionKey type:', typeof sessionKey);
    console.log('   SessionKey constructor:', sessionKey.constructor.name);
    console.log('   SessionKey properties:', Object.keys(sessionKey));
    console.log('   SessionKey methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(sessionKey)));
    
    // Get personal message
    const message = sessionKey.getPersonalMessage();
    console.log('\n2. Personal message obtained');
    console.log('   Length:', message.length);
    
    // Sign it
    const { signature } = await keypair.signPersonalMessage(message);
    console.log('\n3. Message signed');
    
    // Try to inspect internal state before setting signature
    console.log('\n4. Inspecting SessionKey before setting signature...');
    const sessionKeyAny = sessionKey as any;
    console.log('   hasSignature:', sessionKeyAny.hasSignature);
    console.log('   _signature:', sessionKeyAny._signature);
    console.log('   signature:', sessionKeyAny.signature);
    console.log('   personalMessageSignature:', sessionKeyAny.personalMessageSignature);
    
    // Set signature
    console.log('\n5. Setting signature...');
    try {
      sessionKey.setPersonalMessageSignature(signature);
      console.log('   ✓ Signature set successfully');
    } catch (error: any) {
      console.log('   ✗ Failed to set signature:', error.message);
      return;
    }
    
    // Inspect after setting signature
    console.log('\n6. Inspecting SessionKey after setting signature...');
    console.log('   hasSignature:', sessionKeyAny.hasSignature);
    console.log('   _signature:', sessionKeyAny._signature);
    console.log('   signature:', sessionKeyAny.signature);
    console.log('   personalMessageSignature:', sessionKeyAny.personalMessageSignature);
    
    // Check if there's a getter method
    console.log('\n7. Checking for getter methods...');
    if (typeof sessionKeyAny.getPersonalMessageSignature === 'function') {
      console.log('   getPersonalMessageSignature exists');
      try {
        const sig = sessionKeyAny.getPersonalMessageSignature();
        console.log('   Retrieved signature:', sig ? 'Present' : 'Not present');
      } catch (e: any) {
        console.log('   Error calling getPersonalMessageSignature:', e.message);
      }
    }
    
    // Test if signature persists
    console.log('\n8. Testing signature persistence...');
    const message2 = sessionKey.getPersonalMessage();
    console.log('   Message still same:', Buffer.from(message).equals(Buffer.from(message2)));
    
    // Try to set signature again
    console.log('\n9. Setting signature again...');
    try {
      sessionKey.setPersonalMessageSignature(signature);
      console.log('   ✓ Signature set again successfully');
    } catch (error: any) {
      console.log('   ✗ Failed to set signature again:', error.message);
    }
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSessionKeyDebug().catch(console.error);
}

export { testSessionKeyDebug };
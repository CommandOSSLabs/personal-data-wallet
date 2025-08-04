import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

async function testSealNetwork() {
  console.log('===============================================');
  console.log('SEAL Network and Configuration Test');
  console.log('===============================================\n');

  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  const CUSTOM_PACKAGE_ID = '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
  
  try {
    // Test different network configurations
    const networks = ['testnet'] as const;
    
    for (const network of networks) {
      console.log(`\n=== Testing on ${network} ===`);
      
      const suiClient = new SuiClient({ url: getFullnodeUrl(network) });
      const keyServers = getAllowlistedKeyServers(network);
      
      console.log(`Key servers for ${network}:`, keyServers);
      console.log(`Number of key servers: ${keyServers.length}`);
      
      // Check if SEAL package exists
      console.log(`\nChecking SEAL package on ${network}...`);
      try {
        const sealPackage = await suiClient.getObject({
          id: SEAL_PACKAGE_ID,
          options: { showType: true, showContent: true }
        });
        console.log('SEAL package exists:', sealPackage.data ? '✓' : '✗');
        if (sealPackage.data) {
          console.log('Package type:', sealPackage.data.type);
        }
      } catch (error: any) {
        console.log('Failed to fetch SEAL package:', error.message);
      }
      
      // Check custom package
      console.log(`\nChecking custom package on ${network}...`);
      try {
        const customPackage = await suiClient.getObject({
          id: CUSTOM_PACKAGE_ID,
          options: { showType: true, showContent: true }
        });
        console.log('Custom package exists:', customPackage.data ? '✓' : '✗');
        if (customPackage.data) {
          console.log('Package type:', customPackage.data.type);
        }
      } catch (error: any) {
        console.log('Failed to fetch custom package:', error.message);
      }
      
      // Test basic SEAL flow
      console.log(`\n\nTesting SEAL flow on ${network}...`);
      
      const sealClient = new SealClient({
        suiClient,
        serverConfigs: keyServers.map((id) => ({
          objectId: id,
          weight: 1,
        })),
      });
      
      // Create test keypair
      const keypair = new Ed25519Keypair();
      const address = keypair.getPublicKey().toSuiAddress();
      console.log('Test address:', address);
      
      // Test encryption
      console.log('\n1. Testing encryption...');
      const testData = new TextEncoder().encode(`Test on ${network}`);
      const packageIdBytes = fromHEX(SEAL_PACKAGE_ID);
      const addressBytes = fromHEX(address);
      const identity = new Uint8Array(packageIdBytes.length + addressBytes.length);
      identity.set(packageIdBytes, 0);
      identity.set(addressBytes, packageIdBytes.length);
      const identityHex = toHEX(identity);
      
      try {
        const { encryptedObject, key: backupKey } = await sealClient.encrypt({
          threshold: 2,
          packageId: SEAL_PACKAGE_ID,
          id: identityHex,
          data: testData,
        });
        console.log('   ✓ Encryption successful');
        console.log('   Encrypted size:', encryptedObject.length);
        
        // Test SessionKey
        console.log('\n2. Testing SessionKey...');
        const sessionKey = new SessionKey({
          address: address,
          packageId: SEAL_PACKAGE_ID,
          ttlMin: 30,
          suiClient: suiClient,
        });
        
        const message = sessionKey.getPersonalMessage();
        console.log('   Personal message obtained');
        console.log('   Message preview:', Buffer.from(message).toString('utf8').substring(0, 100) + '...');
        
        // Check if message contains expected elements
        const messageStr = Buffer.from(message).toString('utf8');
        console.log('   Contains package ID:', messageStr.includes(SEAL_PACKAGE_ID));
        console.log('   Contains "testnet":', messageStr.includes('testnet'));
        console.log('   Contains address:', messageStr.includes(address));
        
        // Sign
        const { signature } = await keypair.signPersonalMessage(message);
        console.log('\n3. Signature created');
        
        // Try to set signature
        try {
          sessionKey.setPersonalMessageSignature(signature);
          console.log('   ✓ Signature set successfully');
          
          // Export session key to check its state
          const exported = sessionKey.export();
          console.log('\n4. Exported SessionKey:');
          console.log('   Address matches:', exported.address === address);
          console.log('   Exported keys:', Object.keys(exported));
          console.log('   Exported data:', JSON.stringify(exported, null, 2));
          
        } catch (error: any) {
          console.log('   ✗ Failed to set signature:', error.message);
        }
        
      } catch (error: any) {
        console.log('   ✗ Encryption failed:', error.message);
      }
    }
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSealNetwork().catch(console.error);
}

export { testSealNetwork };
import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

async function testSealApproveCall() {
  console.log('===============================================');
  console.log('SEAL seal_approve Function Call Test');
  console.log('===============================================\n');

  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  
  try {
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
    const sealClient = new SealClient({
      suiClient,
      serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
        objectId: id,
        weight: 1,
      })),
    });
    
    const keypair = new Ed25519Keypair();
    const userAddress = keypair.getPublicKey().toSuiAddress();
    console.log('User Address:', userAddress);
    
    // Encrypt test data
    console.log('\n1. Encrypting test data...');
    const testData = new TextEncoder().encode('Test data for seal_approve');
    const identityBytes = new TextEncoder().encode(userAddress);
    const id = toHEX(identityBytes);
    
    const { encryptedObject, key: backupKey } = await sealClient.encrypt({
      threshold: 2,
      packageId: SEAL_PACKAGE_ID,
      id: id,
      data: testData,
    });
    
    console.log('✓ Encrypted successfully');
    
    // Create session key
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 30,
      suiClient: suiClient,
    });
    
    const message = sessionKey.getPersonalMessage();
    const { signature } = await keypair.signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);
    
    // Try to decrypt without seal_approve - this should fail
    console.log('\n2. Testing decrypt without seal_approve call...');
    try {
      const tx = new Transaction();
      tx.setSender(userAddress);
      const txBytes = await tx.build({ 
        client: suiClient, 
        onlyTransactionKind: true 
      });
      
      await sealClient.decrypt({
        data: encryptedObject,
        sessionKey,
        txBytes,
      });
      
      console.log('Unexpected: Decryption succeeded without seal_approve!');
    } catch (error: any) {
      console.log('✓ Expected failure:', error.message);
    }
    
    // Now let's try with a seal_approve call
    // Since we don't have our own package deployed, let's try calling
    // a seal_approve function in the SEAL package itself (if it exists)
    console.log('\n3. Checking SEAL package for seal_approve functions...');
    
    const modules = await suiClient.getNormalizedMoveModulesByPackage({
      package: SEAL_PACKAGE_ID,
    });
    
    let approveFound = false;
    for (const [moduleName, moduleData] of Object.entries(modules)) {
      const approveFunctions = Object.entries(moduleData.exposedFunctions || {})
        .filter(([name]) => name.includes('seal_approve'))
        .map(([name, func]: [string, any]) => ({
          name,
          module: moduleName,
          params: func.parameters,
          isEntry: func.isEntry,
        }));
      
      if (approveFunctions.length > 0) {
        approveFound = true;
        console.log(`Found seal_approve functions in module ${moduleName}:`);
        approveFunctions.forEach(f => {
          console.log(`  - ${f.name}: ${f.params.join(', ')} (entry: ${f.isEntry})`);
        });
      }
    }
    
    if (!approveFound) {
      console.log('No seal_approve functions found in SEAL package');
      console.log('\n4. Conclusion:');
      console.log('SEAL decryption requires calling a seal_approve function from YOUR package.');
      console.log('Since we don\'t have a deployed package with seal_approve, we cannot decrypt.');
      console.log('\nTo use SEAL properly, you need to:');
      console.log('1. Deploy your own Move package');
      console.log('2. Implement seal_approve functions in your package');
      console.log('3. Use your package ID when encrypting data');
      console.log('4. Call your seal_approve function when decrypting');
    }
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSealApproveCall().catch(console.error);
}

export { testSealApproveCall };
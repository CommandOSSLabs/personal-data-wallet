import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function testSealWithOurPackage() {
  console.log('===============================================');
  console.log('SEAL Test with Our Deployed Package');
  console.log('===============================================\n');

  const OUR_PACKAGE_ID = process.env.SEAL_PACKAGE_ID || '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
  const MODULE_NAME = process.env.SEAL_MODULE_NAME || 'seal_access_control';
  
  console.log('Our Package ID:', OUR_PACKAGE_ID);
  console.log('Module Name:', MODULE_NAME);
  
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
    console.log('\nUser Address:', userAddress);
    
    // Test 1: Encrypt with our package
    console.log('\n=== Test 1: Encrypt with Our Package ===');
    const testData = new TextEncoder().encode('Hello from our SEAL package!');
    const identityString = `self:${userAddress}`;
    const identityBytes = new TextEncoder().encode(identityString);
    const id = toHEX(identityBytes);
    
    console.log('Identity string:', identityString);
    console.log('Identity hex:', id.substring(0, 50) + '...');
    
    const { encryptedObject, key: backupKey } = await sealClient.encrypt({
      threshold: 2,
      packageId: OUR_PACKAGE_ID,
      id: id,
      data: testData,
    });
    
    console.log('✓ Encryption successful');
    console.log('  Encrypted size:', encryptedObject.length);
    console.log('  Backup key:', toHEX(backupKey).substring(0, 20) + '...');
    
    // Test 2: Create session key
    console.log('\n=== Test 2: Create Session Key ===');
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: OUR_PACKAGE_ID,
      ttlMin: 30,
      suiClient: suiClient,
    });
    
    const message = sessionKey.getPersonalMessage();
    const { signature } = await keypair.signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);
    console.log('✓ Session key created and signed');
    
    // Test 3: Decrypt with seal_approve call
    console.log('\n=== Test 3: Decrypt with seal_approve ===');
    
    // Build transaction calling our seal_approve
    const tx = new Transaction();
    tx.moveCall({
      target: `${OUR_PACKAGE_ID}::${MODULE_NAME}::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(identityBytes))
      ]
    });
    
    console.log('Building transaction with seal_approve call...');
    const txBytes = await tx.build({ 
      client: suiClient, 
      onlyTransactionKind: true 
    });
    
    console.log('Transaction size:', txBytes.length, 'bytes');
    
    try {
      const decryptedBytes = await sealClient.decrypt({
        data: encryptedObject,
        sessionKey,
        txBytes,
      });
      
      const decrypted = new TextDecoder().decode(decryptedBytes);
      console.log('\n✅ DECRYPTION SUCCESSFUL!');
      console.log('Decrypted:', decrypted);
      console.log('\n🎉 SEAL is working with our deployed package!');
      
    } catch (error: any) {
      console.log('\n❌ Decryption failed:', error.message);
      
      // Try to understand the error
      if (error.message.includes('ENoAccess')) {
        console.log('→ Access denied by seal_approve function');
      } else if (error.message.includes('Invalid PTB')) {
        console.log('→ Transaction format issue');
      } else if (error.message.includes('not found')) {
        console.log('→ Package or function not found');
      }
    }
    
    // Test 4: Test app access pattern
    console.log('\n\n=== Test 4: App Access Pattern ===');
    const appAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const appIdentityString = `app:${userAddress}:${appAddress}`;
    const appIdentityBytes = new TextEncoder().encode(appIdentityString);
    const appId = toHEX(appIdentityBytes);
    
    console.log('App identity:', appIdentityString);
    
    const { encryptedObject: appEncrypted } = await sealClient.encrypt({
      threshold: 2,
      packageId: OUR_PACKAGE_ID,
      id: appId,
      data: new TextEncoder().encode('Data accessible by app'),
    });
    
    console.log('✓ Encrypted with app identity');
    
    // Try to decrypt with seal_approve_app
    const appTx = new Transaction();
    appTx.moveCall({
      target: `${OUR_PACKAGE_ID}::${MODULE_NAME}::seal_approve_app`,
      arguments: [
        appTx.pure.vector('u8', Array.from(appIdentityBytes)),
        appTx.pure.address(appAddress)
      ]
    });
    
    const appTxBytes = await appTx.build({ 
      client: suiClient, 
      onlyTransactionKind: true 
    });
    
    try {
      await sealClient.decrypt({
        data: appEncrypted,
        sessionKey,
        txBytes: appTxBytes,
      });
      console.log('✓ App decryption would work (if proper permissions were set)');
    } catch (error: any) {
      console.log('✗ App decryption failed (expected):', error.message);
    }
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSealWithOurPackage().catch(console.error);
}

export { testSealWithOurPackage };
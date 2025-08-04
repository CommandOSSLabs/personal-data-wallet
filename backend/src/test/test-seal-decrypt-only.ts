import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

async function testSealDecryptOnly() {
  console.log('===============================================');
  console.log('SEAL Decrypt-Only Test');
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
    
    // Step 1: Encrypt data with simplest possible identity
    console.log('\n1. Encrypting with minimal identity...');
    const testData = new TextEncoder().encode('Hello SEAL');
    
    // Try the absolute minimal identity - empty
    const identities = [
      { name: 'Empty identity', id: '' },
      { name: 'Single byte', id: '00' },
      { name: 'User address only', id: userAddress.replace('0x', '') },
    ];
    
    for (const identity of identities) {
      console.log(`\nTrying identity: ${identity.name}`);
      try {
        const { encryptedObject, key: backupKey } = await sealClient.encrypt({
          threshold: 2,
          packageId: SEAL_PACKAGE_ID,
          id: identity.id,
          data: testData,
        });
        
        console.log('✓ Encryption successful');
        
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
        
        // Try decryption with minimal transaction
        console.log('Attempting decrypt...');
        
        // Build the absolute minimal valid transaction
        const tx = new Transaction();
        tx.setSender(userAddress);
        
        try {
          // First try: just build without any commands
          const txBytes = await tx.build({ 
            client: suiClient, 
            onlyTransactionKind: false // Try with full transaction
          });
          
          console.log('Transaction built, size:', txBytes.length);
          
          const decryptedBytes = await sealClient.decrypt({
            data: encryptedObject,
            sessionKey,
            txBytes,
          });
          
          const decrypted = new TextDecoder().decode(decryptedBytes);
          console.log('✅ DECRYPTION SUCCESSFUL!');
          console.log('Decrypted:', decrypted);
          console.log('\nWorking configuration:');
          console.log('- Identity:', identity.name, '(', identity.id, ')');
          console.log('- Transaction type: Minimal with sender');
          console.log('- Transaction size:', txBytes.length);
          
          return;
        } catch (e: any) {
          console.log('Decrypt failed:', e.message);
          
          // Try with a programmable transaction
          const tx2 = new Transaction();
          tx2.setSender(userAddress);
          // Add a no-op that might make it valid
          const result = tx2.pure.bool(true);
          
          try {
            const txBytes2 = await tx2.build({ 
              client: suiClient, 
              onlyTransactionKind: true
            });
            
            const decryptedBytes = await sealClient.decrypt({
              data: encryptedObject,
              sessionKey,
              txBytes: txBytes2,
            });
            
            const decrypted = new TextDecoder().decode(decryptedBytes);
            console.log('✅ DECRYPTION SUCCESSFUL with pure bool!');
            console.log('Decrypted:', decrypted);
            
            return;
          } catch (e2: any) {
            console.log('Pure bool also failed:', e2.message);
          }
        }
        
      } catch (error: any) {
        console.log('Failed:', error.message);
      }
    }
    
    console.log('\n\n=== Trying with SEAL fetchKeys method ===');
    // Try using fetchKeys directly
    const { encryptedObject } = await sealClient.encrypt({
      threshold: 2,
      packageId: SEAL_PACKAGE_ID,
      id: userAddress.replace('0x', ''),
      data: testData,
    });
    
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 30,
      suiClient: suiClient,
    });
    
    const message = sessionKey.getPersonalMessage();
    const { signature } = await keypair.signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);
    
    // Create a transaction that might work
    const tx = new Transaction();
    const dummyTx = new Uint8Array([0, 0, 0]); // Minimal bytes
    
    try {
      console.log('Trying fetchKeys with minimal transaction...');
      const keys = await sealClient.fetchKeys({
        ids: [userAddress.replace('0x', '')],
        sessionKey,
        txBytes: dummyTx,
        threshold: 2,
      });
      
      console.log('✅ fetchKeys successful!');
      console.log('Keys returned:', keys);
    } catch (error: any) {
      console.log('fetchKeys failed:', error.message);
      console.log('Error type:', error.constructor.name);
    }
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testSealDecryptOnly().catch(console.error);
}

export { testSealDecryptOnly };
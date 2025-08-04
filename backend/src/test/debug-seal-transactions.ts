import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';

async function debugSealTransactions() {
  console.log('===============================================');
  console.log('SEAL Transaction Requirements Debug');
  console.log('===============================================\n');

  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  
  try {
    // Setup
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
    
    // Encrypt some test data
    console.log('\n1. Encrypting test data...');
    const testData = new TextEncoder().encode('Test data for transaction debugging');
    const identityBytes = new TextEncoder().encode(userAddress);
    const id = toHEX(identityBytes);
    
    const { encryptedObject, key: backupKey } = await sealClient.encrypt({
      threshold: 2,
      packageId: SEAL_PACKAGE_ID,
      id: id,
      data: testData,
    });
    
    console.log('✓ Encrypted successfully');
    console.log('  Encrypted size:', encryptedObject.length);
    
    // Create and sign session key
    console.log('\n2. Creating session key...');
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 30,
      suiClient: suiClient,
    });
    
    const message = sessionKey.getPersonalMessage();
    const { signature } = await keypair.signPersonalMessage(message);
    sessionKey.setPersonalMessageSignature(signature);
    console.log('✓ Session key created and signed');
    
    // Test different transaction types
    console.log('\n3. Testing different transaction types...');
    
    const transactionTests = [
      {
        name: 'Split coin transaction',
        build: async () => {
          const tx = new Transaction();
          tx.splitCoins(tx.gas, [1000]);
          return tx;
        }
      },
      {
        name: 'Merge coins transaction',
        build: async () => {
          const tx = new Transaction();
          // This creates a valid transaction structure even if we don't have coins to merge
          const coin = tx.splitCoins(tx.gas, [1]);
          tx.mergeCoins(tx.gas, [coin]);
          return tx;
        }
      },
      {
        name: 'Move call to clock',
        build: async () => {
          const tx = new Transaction();
          // Call a read-only function on the clock module
          tx.moveCall({
            target: '0x2::clock::timestamp_ms',
            arguments: [tx.object('0x6')], // Clock object
          });
          return tx;
        }
      },
      {
        name: 'Create vector',
        build: async () => {
          const tx = new Transaction();
          // Create an empty vector
          tx.makeMoveVec({ elements: [] });
          return tx;
        }
      },
      {
        name: 'Pure value transaction',
        build: async () => {
          const tx = new Transaction();
          tx.pure.u64(12345);
          return tx;
        }
      },
    ];
    
    for (const test of transactionTests) {
      console.log(`\n  Testing: ${test.name}`);
      try {
        const tx = await test.build();
        
        // Build transaction bytes
        const txBytes = await tx.build({ 
          client: suiClient, 
          onlyTransactionKind: true 
        });
        
        console.log(`    Transaction size: ${txBytes.length} bytes`);
        console.log(`    Transaction (hex): ${toHEX(txBytes).substring(0, 50)}...`);
        
        // Try to decrypt
        const decryptedBytes = await sealClient.decrypt({
          data: encryptedObject,
          sessionKey,
          txBytes,
        });
        
        const decrypted = new TextDecoder().decode(decryptedBytes);
        console.log('    ✅ DECRYPTION SUCCESSFUL!');
        console.log('    Decrypted:', decrypted);
        
        // If we found a working transaction, analyze it
        console.log('\n    Transaction analysis:');
        console.log('    - Type:', test.name);
        console.log('    - Size:', txBytes.length);
        console.log('    - First 20 bytes:', Array.from(txBytes.slice(0, 20)));
        
        return; // Exit on first success
        
      } catch (error: any) {
        console.log(`    ❌ Failed: ${error.message}`);
        if (error.message.includes('PTB')) {
          console.log('       (Transaction format issue)');
        } else if (error.message.includes('Unprocessable')) {
          console.log('       (SEAL server rejection)');
        }
      }
    }
    
    console.log('\n❌ No transaction format worked for decryption');
    
  } catch (error: any) {
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  debugSealTransactions().catch(console.error);
}

export { debugSealTransactions };
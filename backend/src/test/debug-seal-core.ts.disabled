import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SealSimpleService } from '../infrastructure/seal/seal-simple.service';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX, toHEX } from '@mysten/sui/utils';

async function debugSealCore() {
  console.log('===============================================');
  console.log('SEAL Core Functionality Debug');
  console.log('===============================================\n');

  let app: any;
  
  try {
    // Create the application
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const sealSimpleService = app.get(SealSimpleService);
    
    // Create test keypair
    const keypair = new Ed25519Keypair();
    const userAddress = keypair.getPublicKey().toSuiAddress();
    
    console.log('User Address:', userAddress);
    console.log('');

    // Test 1: Direct SEAL test with different identity formats
    console.log('=== Test 1: Direct SEAL with Different Identities ===');
    await testDirectSeal(userAddress, keypair);
    
    // Test 2: Test through our simple service
    console.log('\n=== Test 2: Simple Service Test ===');
    
    // Get session message
    console.log('2.1 Getting session message...');
    const message = await sealSimpleService.getSessionKeyMessage(userAddress);
    console.log('Message received, length:', message.length);
    console.log('Message (UTF8):', Buffer.from(message).toString('utf8'));
    
    // Sign message
    console.log('\n2.2 Signing message...');
    const { signature } = await keypair.signPersonalMessage(message);
    console.log('Signature:', signature);
    
    // Test complete flow
    console.log('\n2.3 Testing complete flow...');
    const result = await sealSimpleService.testCompleteFlow(userAddress, signature);
    console.log('Result:', result);
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

async function testDirectSeal(userAddress: string, keypair: Ed25519Keypair) {
  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
  const sealClient = new SealClient({
    suiClient,
    serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
      objectId: id,
      weight: 1,
    })),
  });

  const testData = new TextEncoder().encode('Test data for debugging');
  
  // Try different identity formats
  const identityTests = [
    {
      name: 'Just address',
      id: toHEX(new TextEncoder().encode(userAddress)),
    },
    {
      name: 'Address with prefix',
      id: toHEX(new TextEncoder().encode(`user:${userAddress}`)),
    },
    {
      name: 'Raw address bytes',
      id: userAddress.replace('0x', ''),
    },
    {
      name: 'Package + address',
      id: (() => {
        const pkgBytes = fromHEX(SEAL_PACKAGE_ID);
        const addrBytes = fromHEX(userAddress);
        const combined = new Uint8Array(pkgBytes.length + addrBytes.length);
        combined.set(pkgBytes, 0);
        combined.set(addrBytes, pkgBytes.length);
        return toHEX(combined);
      })(),
    },
  ];

  for (const test of identityTests) {
    console.log(`\nTesting identity: ${test.name}`);
    console.log(`ID: ${test.id.substring(0, 50)}...`);
    
    try {
      // Encrypt
      const { encryptedObject, key: backupKey } = await sealClient.encrypt({
        threshold: 2,
        packageId: SEAL_PACKAGE_ID,
        id: test.id,
        data: testData,
      });
      
      console.log('✓ Encryption successful');
      console.log('  Encrypted size:', encryptedObject.length);
      console.log('  Backup key:', toHEX(backupKey).substring(0, 20) + '...');
      
      // Try to decrypt
      const sessionKey = new SessionKey({
        address: userAddress,
        packageId: SEAL_PACKAGE_ID,
        ttlMin: 30,
        suiClient: suiClient,
      });
      
      const message = sessionKey.getPersonalMessage();
      const { signature } = await keypair.signPersonalMessage(message);
      sessionKey.setPersonalMessageSignature(signature);
      
      // Try different transaction formats
      const txTests = [
        {
          name: 'Empty transaction',
          build: async () => {
            const tx = new Transaction();
            return await tx.build({ client: suiClient, onlyTransactionKind: true });
          }
        },
        {
          name: 'Simple transfer to self',
          build: async () => {
            const tx = new Transaction();
            tx.transferObjects([tx.gas], userAddress);
            return await tx.build({ client: suiClient, onlyTransactionKind: true });
          }
        },
      ];
      
      for (const txTest of txTests) {
        console.log(`  Testing with ${txTest.name}...`);
        try {
          const txBytes = await txTest.build();
          const decryptedBytes = await sealClient.decrypt({
            data: encryptedObject,
            sessionKey,
            txBytes,
          });
          
          const decrypted = new TextDecoder().decode(decryptedBytes);
          console.log('  ✓ Decryption successful!');
          console.log('    Decrypted:', decrypted);
          break; // If one works, stop trying
        } catch (error: any) {
          console.log(`  ✗ Failed: ${error.message}`);
        }
      }
      
    } catch (error: any) {
      console.log(`✗ Encryption failed: ${error.message}`);
    }
  }
}

// Run the test
if (require.main === module) {
  debugSealCore().catch(console.error);
}

export { debugSealCore };
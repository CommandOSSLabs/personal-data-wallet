import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SealService } from '../infrastructure/seal/seal.service';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SessionKey, SealClient, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX, toHEX } from '@mysten/sui/utils';

async function testSealMinimal() {
  console.log('===============================================');
  console.log('Minimal SEAL Test');
  console.log('===============================================\n');

  let app: any;
  
  try {
    // Create the application
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const sealService = app.get(SealService);
    
    // Create test keypair
    const keypair = new Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    
    console.log('User Address:', address);
    
    // Test direct SEAL usage first
    console.log('\n=== Direct SEAL Client Test ===');
    
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const CUSTOM_PACKAGE_ID = '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
    
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
    const sealClient = new SealClient({
      suiClient,
      serverConfigs: getAllowlistedKeyServers('testnet').map((id) => ({
        objectId: id,
        weight: 1,
      })),
    });
    
    // 1. Encrypt
    console.log('1. Encrypting with direct SEAL client...');
    const testData = new TextEncoder().encode('Direct SEAL test');
    const packageIdBytes = fromHEX(SEAL_PACKAGE_ID);
    const addressBytes = fromHEX(address);
    const identity = new Uint8Array(packageIdBytes.length + addressBytes.length);
    identity.set(packageIdBytes, 0);
    identity.set(addressBytes, packageIdBytes.length);
    const identityHex = toHEX(identity);
    
    const { encryptedObject, key: backupKey } = await sealClient.encrypt({
      threshold: 2,
      packageId: SEAL_PACKAGE_ID,
      id: identityHex,
      data: testData,
    });
    console.log('   ✓ Encrypted');
    
    // 2. Create SessionKey
    console.log('\n2. Creating SessionKey...');
    const sessionKey = new SessionKey({
      address: address,
      packageId: SEAL_PACKAGE_ID,
      ttlMin: 30,
      suiClient: suiClient,
    });
    
    const message = sessionKey.getPersonalMessage();
    console.log('   Personal message length:', message.length);
    
    // 3. Sign
    console.log('\n3. Signing message...');
    const { signature } = await keypair.signPersonalMessage(message);
    console.log('   ✓ Signed');
    
    // 4. Set signature
    console.log('\n4. Setting signature...');
    sessionKey.setPersonalMessageSignature(signature);
    console.log('   ✓ Signature set');
    
    // 5. Build transaction
    console.log('\n5. Building transaction...');
    const tx = new Transaction();
    tx.moveCall({
      target: `${CUSTOM_PACKAGE_ID}::seal_access_control::seal_approve`,
      arguments: [
        tx.pure.vector("u8", fromHEX(identityHex)),
      ],
    });
    
    const txBytes = await tx.build({ 
      client: suiClient, 
      onlyTransactionKind: true 
    });
    console.log('   ✓ Transaction built');
    
    // 6. Decrypt
    console.log('\n6. Attempting decrypt...');
    try {
      const decryptedBytes = await sealClient.decrypt({
        data: encryptedObject,
        sessionKey,
        txBytes,
      });
      
      const decryptedText = new TextDecoder().decode(decryptedBytes);
      console.log('   ✓ Decrypted:', decryptedText);
    } catch (error: any) {
      console.log('   ✗ Decrypt failed:', error.message);
      console.log('   Error type:', error.constructor.name);
      console.log('   Full error:', error);
    }
    
    // Now test through service
    console.log('\n\n=== Service Test ===');
    
    // 1. Get message
    console.log('1. Getting session message...');
    const serviceMessage = await sealService.getSessionKeyMessage(address);
    console.log('   ✓ Message obtained');
    
    // 2. Sign
    console.log('\n2. Signing message...');
    const { signature: serviceSig } = await keypair.signPersonalMessage(serviceMessage);
    console.log('   ✓ Signed');
    
    // 3. Encrypt
    console.log('\n3. Encrypting...');
    const encrypted = await sealService.encrypt('Service test data', address);
    console.log('   ✓ Encrypted');
    
    // 4. Decrypt
    console.log('\n4. Decrypting...');
    try {
      const decrypted = await sealService.decrypt(
        encrypted.encrypted,
        address,
        serviceSig
      );
      console.log('   ✓ Decrypted:', decrypted);
    } catch (error: any) {
      console.log('   ✗ Decrypt failed:', error.message);
    }
    
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (app) {
      await app.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testSealMinimal().catch(console.error);
}

export { testSealMinimal };
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SealService } from '../infrastructure/seal/seal.service';
import { SealIBEService } from '../infrastructure/seal/seal-ibe.service';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

async function testSessionStore() {
  console.log('===============================================');
  console.log('Testing SessionStore Integration');
  console.log('===============================================\n');

  try {
    // Create the application
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Get services
    const sealService = app.get(SealService);
    const sealIBEService = app.get(SealIBEService);

    // Create test keypairs
    const userKeypair = new Ed25519Keypair();
    const userAddress = userKeypair.getPublicKey().toSuiAddress();
    const appKeypair = new Ed25519Keypair();
    const appAddress = appKeypair.getPublicKey().toSuiAddress();

    console.log('User Address:', userAddress);
    console.log('App Address:', appAddress);
    console.log('');

    // Step 1: Get session message for user
    console.log('1. Getting session message for user...');
    const message1 = await sealService.getSessionKeyMessage(userAddress);
    console.log('   Message length:', message1.length);
    console.log('   Message (hex):', Buffer.from(message1).toString('hex'));

    // Step 2: Get session message again (should be same)
    console.log('\n2. Getting session message again (should be same)...');
    const message2 = await sealService.getSessionKeyMessage(userAddress);
    console.log('   Messages match:', Buffer.from(message1).equals(Buffer.from(message2)));

    // Step 3: Sign message
    console.log('\n3. Signing message...');
    const { signature } = await userKeypair.signPersonalMessage(message1);
    console.log('   Signature:', signature);

    // Step 4: Encrypt for self
    console.log('\n4. Encrypting content for self...');
    const testContent = 'Test content for session store';
    const encrypted = await sealService.encrypt(testContent, userAddress);
    console.log('   ✓ Content encrypted');

    // Step 5: Decrypt with signature (first time)
    console.log('\n5. Decrypting with signature (first time)...');
    try {
      const decrypted = await sealService.decrypt(encrypted.encrypted, userAddress, signature);
      console.log('   ✓ Decrypted:', decrypted);
    } catch (error: any) {
      console.log('   ✗ Decryption failed:', error.message);
    }

    // Step 6: Decrypt without signature (should use cached)
    console.log('\n6. Decrypting without signature (should use cached)...');
    try {
      const decrypted = await sealService.decrypt(encrypted.encrypted, userAddress);
      console.log('   ✓ Decrypted with cached session:', decrypted);
    } catch (error: any) {
      console.log('   ✗ Decryption failed:', error.message);
    }

    // Step 7: Test app-based encryption
    console.log('\n7. Testing app-based encryption...');
    
    // Get session message for app
    const appMessage = await sealIBEService.getSessionKeyMessage(appAddress);
    const { signature: appSignature } = await appKeypair.signPersonalMessage(appMessage);
    
    // Encrypt for app
    const appEncrypted = await sealIBEService.encryptForApp(
      'Secret data for app',
      userAddress,
      appAddress
    );
    console.log('   ✓ Content encrypted for app');

    // Decrypt as app
    try {
      const appDecrypted = await sealIBEService.decryptWithIdentity(
        appEncrypted.encrypted,
        {
          type: 'APP' as any,
          userAddress,
          targetAddress: appAddress,
        },
        appSignature
      );
      console.log('   ✓ Decrypted as app:', appDecrypted);
    } catch (error: any) {
      console.log('   ✗ App decryption failed:', error.message);
    }

    console.log('\n✅ SessionStore integration test completed');
    
    await app.close();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testSessionStore().catch(console.error);
}

export { testSessionStore };
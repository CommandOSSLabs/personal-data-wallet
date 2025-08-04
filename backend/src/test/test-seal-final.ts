import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SealService } from '../infrastructure/seal/seal.service';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { ConfigService } from '@nestjs/config';

async function testSealFinal() {
  console.log('===============================================');
  console.log('Final SEAL Test - Checking Configuration');
  console.log('===============================================\n');

  let app: any;
  
  try {
    // Create the application
    app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    const sealService = app.get(SealService);
    const configService = app.get(ConfigService);
    
    // Check configuration
    console.log('=== Configuration ===');
    console.log('SEAL_NETWORK:', configService.get('SEAL_NETWORK'));
    console.log('SEAL_PACKAGE_ID:', configService.get('SEAL_PACKAGE_ID'));
    console.log('SEAL_MODULE_NAME:', configService.get('SEAL_MODULE_NAME'));
    console.log('SEAL_THRESHOLD:', configService.get('SEAL_THRESHOLD'));
    console.log('SUI_RPC_URL:', configService.get('SUI_RPC_URL'));
    
    // Create test keypair
    const keypair = new Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    
    console.log('\n=== Test Account ===');
    console.log('Address:', address);
    
    // Test 1: Get session message
    console.log('\n=== Test 1: Session Message ===');
    const message = await sealService.getSessionKeyMessage(address);
    console.log('Message length:', message.length);
    console.log('Message (hex):', Buffer.from(message).toString('hex').substring(0, 100) + '...');
    console.log('Message (utf8 preview):', Buffer.from(message).toString('utf8').substring(0, 150) + '...');
    
    // Test 2: Sign message
    console.log('\n=== Test 2: Sign Message ===');
    const { signature } = await keypair.signPersonalMessage(message);
    console.log('Signature:', signature);
    
    // Test 3: Encrypt
    console.log('\n=== Test 3: Encrypt ===');
    const testContent = 'Hello SEAL';
    const encrypted = await sealService.encrypt(testContent, address);
    console.log('Encrypted length:', encrypted.encrypted.length);
    console.log('Backup key:', encrypted.backupKey.substring(0, 40) + '...');
    
    // Test 4: Try decrypt with debug info
    console.log('\n=== Test 4: Decrypt ===');
    
    // First, let's check what's in the session store
    const sealServiceAny = sealService as any;
    const sessionStore = sealServiceAny.sessionStore;
    const sessionData = sessionStore.get(address);
    console.log('Session data exists:', !!sessionData);
    if (sessionData) {
      console.log('Session data keys:', Object.keys(sessionData));
      console.log('Has signature in store:', !!sessionData.signature);
    }
    
    // Check cached session key
    const cachedKey = sealServiceAny.sessionKeys.get(address);
    console.log('Cached SessionKey exists:', !!cachedKey);
    
    try {
      const decrypted = await sealService.decrypt(
        encrypted.encrypted,
        address,
        signature
      );
      console.log('✓ Decryption successful!');
      console.log('Decrypted content:', decrypted);
    } catch (error: any) {
      console.log('✗ Decryption failed:', error.message);
      
      // Try to understand the error better
      if (error.message.includes('Personal message signature is not set')) {
        console.log('\nDEBUG: Signature not being set properly');
        
        // Try to manually get the session key and check
        try {
          const sessionKey = await sealServiceAny.getOrCreateSessionKey(address, signature);
          console.log('SessionKey obtained manually');
          
          // Try to export it
          try {
            const exported = sessionKey.export();
            console.log('Exported address:', exported.address);
            console.log('Has personalMessageSignature:', !!exported.personalMessageSignature);
          } catch (e: any) {
            console.log('Cannot export SessionKey:', e.message);
          }
        } catch (e: any) {
          console.log('Failed to get SessionKey manually:', e.message);
        }
      }
    }
    
    // Test 5: Try decrypt without signature (should use cached)
    console.log('\n=== Test 5: Decrypt with Cached Session ===');
    try {
      const decrypted2 = await sealService.decrypt(
        encrypted.encrypted,
        address
      );
      console.log('✓ Cached decryption successful!');
      console.log('Decrypted content:', decrypted2);
    } catch (error: any) {
      console.log('✗ Cached decryption failed:', error.message);
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
  testSealFinal().catch(console.error);
}

export { testSealFinal };
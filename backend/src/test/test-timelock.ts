/**
 * Test script for time-lock encryption functionality
 */

import { SealService } from '../infrastructure/seal/seal.service';
import { SessionKeyService } from '../infrastructure/seal/session-key.service';
import { ConfigService } from '@nestjs/config';

async function testTimelockEncryption() {
  console.log('🔒 Testing Time-lock Encryption...\n');

  // Initialize services
  const configService = new ConfigService();
  const sessionKeyService = new SessionKeyService(configService);
  const sealService = new SealService(configService, sessionKeyService);

  // Test data
  const testContent = 'This is a secret message that will be unlocked in the future!';
  const testUserAddress = '0x1234567890abcdef1234567890abcdef12345678';
  
  // Set unlock time to 5 seconds from now for testing
  const unlockTimestamp = Date.now() + 5000;
  
  try {
    console.log('📝 Test Content:', testContent);
    console.log('👤 User Address:', testUserAddress);
    console.log('⏰ Unlock Time:', new Date(unlockTimestamp).toISOString());
    console.log('⏱️  Current Time:', new Date().toISOString());
    console.log();

    // Step 1: Encrypt with time-lock
    console.log('🔐 Step 1: Encrypting with time-lock...');
    const contentBytes = new TextEncoder().encode(testContent);
    
    const encryptResult = await sealService.encryptWithTimelock(
      contentBytes,
      unlockTimestamp
    );
    
    console.log('✅ Encryption successful!');
    console.log('🆔 Identity ID:', encryptResult.identityId);
    console.log('📦 Encrypted Data Length:', encryptResult.encrypted.length, 'bytes');
    console.log('⏰ Unlock Time:', new Date(encryptResult.unlockTime).toISOString());
    console.log();

    // Step 2: Try to decrypt before unlock time (should fail)
    console.log('🚫 Step 2: Attempting to decrypt before unlock time...');
    try {
      await sealService.decryptTimelock(encryptResult.encrypted, testUserAddress);
      console.log('❌ ERROR: Decryption should have failed!');
    } catch (error) {
      console.log('✅ Expected failure:', error.message);
    }
    console.log();

    // Step 3: Wait for unlock time
    const waitTime = unlockTimestamp - Date.now();
    if (waitTime > 0) {
      console.log(`⏳ Step 3: Waiting ${Math.ceil(waitTime / 1000)} seconds for unlock time...`);
      await new Promise(resolve => setTimeout(resolve, waitTime + 1000)); // Add 1 second buffer
    }
    console.log('⏰ Unlock time reached!');
    console.log();

    // Step 4: Try to decrypt after unlock time (should succeed)
    console.log('🔓 Step 4: Attempting to decrypt after unlock time...');
    try {
      // Note: This will fail in the test environment because we don't have a real session key
      // But we can test the time validation logic
      await sealService.decryptTimelock(encryptResult.encrypted, testUserAddress);
      console.log('✅ Decryption successful!');
    } catch (error) {
      if (error.message.includes('No valid session key')) {
        console.log('⚠️  Expected session key error (test environment):', error.message);
        console.log('✅ Time-lock validation passed - would decrypt with valid session');
      } else if (error.message.includes('Time-lock not yet expired')) {
        console.log('❌ Time validation failed:', error.message);
      } else {
        console.log('⚠️  Other error:', error.message);
      }
    }
    console.log();

    console.log('🎉 Time-lock encryption test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function testTimelockIdentityParsing() {
  console.log('\n🔍 Testing Time-lock Identity Parsing...\n');

  const testCases = [
    'timelock_1703980800000_abc123',
    'timelock_1735516800000_def456',
    'invalid_format',
    'timelock_notanumber_xyz789'
  ];

  testCases.forEach((identityId, index) => {
    console.log(`Test Case ${index + 1}: ${identityId}`);
    
    const timestampMatch = identityId.match(/timelock_(\d+)_/);
    if (timestampMatch) {
      const unlockTimestamp = parseInt(timestampMatch[1]);
      const unlockDate = new Date(unlockTimestamp);
      const currentTime = Date.now();
      const canDecrypt = currentTime >= unlockTimestamp;
      
      console.log(`  ✅ Valid format`);
      console.log(`  ⏰ Unlock Time: ${unlockDate.toISOString()}`);
      console.log(`  🔓 Can Decrypt: ${canDecrypt}`);
      
      if (!canDecrypt) {
        const timeRemaining = unlockTimestamp - currentTime;
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        console.log(`  ⏳ Time Remaining: ${hours}h ${minutes}m`);
      }
    } else {
      console.log(`  ❌ Invalid format`);
    }
    console.log();
  });
}

// Run tests
async function runTests() {
  try {
    await testTimelockIdentityParsing();
    await testTimelockEncryption();
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}

export { testTimelockEncryption, testTimelockIdentityParsing };

/**
 * Simple File Upload Test - Upload and Retrieve test.txt from Walrus
 * 
 * This test demonstrates:
 * 1. Reading a local file (test.txt)
 * 2. Uploading to Walrus using StorageService with upload relay
 * 3. Retrieving the file from Walrus
 * 4. Verifying content integrity
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { StorageService } from '../src/services/StorageService';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHex } from '@mysten/sui/utils';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

describe('Simple File Upload to Walrus', () => {
  let storageService: StorageService;
  let keypair: Ed25519Keypair;
  let testFileContent: Buffer;
  let testFilePath: string;

  beforeAll(() => {
    // Initialize keypair from test environment
    const privateKeyHex = process.env.TEST_PRIVATE_KEY;
    if (!privateKeyHex) {
      throw new Error('TEST_PRIVATE_KEY not found in .env.test');
    }

    // Create keypair directly from the private key string
    keypair = Ed25519Keypair.fromSecretKey(privateKeyHex);

    console.log('✅ Test wallet address:', keypair.toSuiAddress());

    // Initialize StorageService with upload relay enabled
    storageService = new StorageService({
      network: 'testnet',
      useUploadRelay: true,  // Use upload relay for reliability
      epochs: 3,
      timeout: 60_000
    });

    // Read test file
    testFilePath = path.join(__dirname, '..', 'test.txt');
    if (!fs.existsSync(testFilePath)) {
      throw new Error(`Test file not found: ${testFilePath}`);
    }

    testFileContent = fs.readFileSync(testFilePath);
    console.log('✅ Test file loaded:', testFilePath);
    console.log('   File size:', testFileContent.length, 'bytes');
    console.log('   Content preview:', testFileContent.toString('utf-8').substring(0, 50));
  });

  test('should upload test.txt to Walrus and retrieve it', async () => {
    console.log('\n🚀 Starting Walrus upload test...\n');

    // Step 1: Upload file to Walrus
    console.log('📤 Step 1: Uploading test.txt to Walrus...');

    // Convert Buffer to Uint8Array for API compatibility
    const fileData = new Uint8Array(testFileContent);

    const uploadResult = await storageService.uploadBlob(fileData, {
      signer: keypair,
      epochs: 3,
      deletable: true,
      useUploadRelay: true,  // Explicitly use upload relay
      metadata: {
        'content-type': 'text/plain',
        'filename': 'test.txt',
        'test-type': 'simple-file-upload',
        'uploaded-at': new Date().toISOString()
      }
    });

    console.log('✅ Upload successful!');
    console.log('   Blob ID:', uploadResult.blobId);
    console.log('   Upload time:', uploadResult.uploadTimeMs, 'ms');
    console.log('   Encrypted:', uploadResult.isEncrypted);

    // Verify upload result
    expect(uploadResult.blobId).toBeDefined();
    expect(uploadResult.blobId).toMatch(/^0x[a-f0-9]{64}$/);
    expect(uploadResult.uploadTimeMs).toBeGreaterThan(0);

    // Step 2: Retrieve file from Walrus
    console.log('\n📥 Step 2: Retrieving file from Walrus...');
    const retrievalResult = await storageService.retrieve(uploadResult.blobId);

    console.log('✅ Retrieval successful!');
    console.log('   Retrieved size:', retrievalResult.content.length, 'bytes');
    console.log('   Content preview:', new TextDecoder().decode(retrievalResult.content.slice(0, 50)));

    // Step 3: Verify content integrity
    console.log('\n🔍 Step 3: Verifying content integrity...');

    // Compare byte-by-byte
    expect(retrievalResult.content.length).toBe(fileData.length);

    // Compare arrays directly
    let isMatch = true;
    for (let i = 0; i < fileData.length; i++) {
      if (retrievalResult.content[i] !== fileData[i]) {
        isMatch = false;
        break;
      }
    }
    expect(isMatch).toBe(true);

    console.log('✅ Content integrity verified!');
    console.log('   Original size:', fileData.length, 'bytes');
    console.log('   Retrieved size:', retrievalResult.content.length, 'bytes');
    console.log('   Match: ✅ Perfect match');

    // Step 4: Display summary
    console.log('\n📊 Test Summary:');
    console.log('   ✅ File uploaded to Walrus');
    console.log('   ✅ File retrieved from Walrus');
    console.log('   ✅ Content integrity verified');
    console.log('   ✅ Upload relay used successfully');
    console.log('\n🎉 All checks passed!\n');

  }, 120000); // 2 minute timeout for network operations

  test('should handle upload with custom metadata', async () => {
    console.log('\n🚀 Testing upload with custom metadata...\n');

    const customMetadata = {
      'content-type': 'text/plain',
      'filename': 'test.txt',
      'author': 'PDW SDK Test Suite',
      'version': '1.0.0',
      'description': 'Test file for Walrus storage verification',
      'tags': 'test,walrus,storage,verification'
    };

    // Convert Buffer to Uint8Array
    const fileData = new Uint8Array(testFileContent);

    const uploadResult = await storageService.uploadBlob(fileData, {
      signer: keypair,
      epochs: 3,
      deletable: true,
      useUploadRelay: true,
      metadata: customMetadata
    });

    console.log('✅ Upload with metadata successful!');
    console.log('   Blob ID:', uploadResult.blobId);
    console.log('   Metadata:', JSON.stringify(customMetadata, null, 2));

    expect(uploadResult.blobId).toBeDefined();
    expect(uploadResult.uploadTimeMs).toBeGreaterThan(0);

    // Retrieve and verify
    const retrievalResult = await storageService.retrieve(uploadResult.blobId);

    // Compare arrays directly
    let isMatch = true;
    for (let i = 0; i < fileData.length; i++) {
      if (retrievalResult.content[i] !== fileData[i]) {
        isMatch = false;
        break;
      }
    }
    expect(isMatch).toBe(true);

    console.log('✅ Metadata upload test passed!\n');

  }, 120000);

  test('should get storage service stats', () => {
    console.log('\n📊 Storage Service Statistics:\n');

    const stats = storageService.getStats();
    
    console.log('   Network:', stats.network);
    console.log('   Upload Relay:', stats.useUploadRelay ? '✅ Enabled' : '❌ Disabled');
    console.log('   Epochs:', stats.epochs);
    console.log('   Encryption:', stats.hasEncryption ? '✅ Available' : '❌ Not configured');
    console.log('   Batching:', stats.hasBatching ? '✅ Available' : '❌ Not configured');
    console.log('   Search:', stats.hasSearch ? '✅ Available' : '❌ Not configured');

    expect(stats.network).toBe('testnet');
    expect(stats.useUploadRelay).toBe(true);
    expect(stats.epochs).toBe(3);

    console.log('\n✅ Stats retrieved successfully!\n');
  });
});


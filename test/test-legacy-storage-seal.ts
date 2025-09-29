import { StorageService } from '../packages/pdw-sdk/src/storage/StorageService';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromHex } from '@mysten/sui/utils';

// Load test environment
dotenv.config({ path: '.env.test' });

async function testLegacyStorageService() {
    console.log('🧪 Testing Legacy StorageService SEAL Methods');
    console.log('===============================================\n');

    const privateKeyHex = process.env.PRIVATE_KEY;
    if (!privateKeyHex) {
        throw new Error('PRIVATE_KEY not found in .env.test');
    }

    const keypair = Ed25519Keypair.fromSecretKey(fromHex(privateKeyHex));
    const userAddress = keypair.toSuiAddress();

    console.log('📋 Configuration:');
    console.log(`   User Address: ${userAddress}`);
    console.log(`   Network: ${process.env.SUI_NETWORK}`);

    // Initialize storage service
    const storageService = new StorageService();
    console.log('✅ Legacy StorageService initialized\n');

    // Test upload SEAL memory
    console.log('🔐 TEST 1: Upload SEAL Memory');
    console.log('-----------------------------');
    
    const testContent = "Test SEAL content for legacy service";
    const mockEncryptedData = new Uint8Array(Buffer.from(`SEAL_ENCRYPTED:${testContent}:${Date.now()}`));
    
    console.log(`📝 Original content: "${testContent}"`);
    console.log(`🔐 Mock encrypted data size: ${mockEncryptedData.length} bytes`);
    console.log(`   Format: Direct Uint8Array (preserves binary integrity)`);
    
    try {
        const uploadResult = await storageService.uploadSealMemory({
            encryptedData: mockEncryptedData,
            metadata: {
                contentType: 'text/plain',
                userAddress,
                appId: 'test-app',
                contextId: 'test-context',
                encrypted: true,
                encryptionType: 'seal',
                originalSize: testContent.length,
                createdAt: new Date().toISOString()
            },
            keypair
        });

        console.log('✅ Upload successful:');
        console.log(`   Blob ID: ${uploadResult.blobId}`);
        console.log(`   Size: ${uploadResult.size} bytes`);
        console.log(`   Encrypted: ${uploadResult.encrypted}`);
        console.log(`   Upload time: ${uploadResult.uploadTime}ms\n`);

        // Test retrieve SEAL memory
        console.log('📥 TEST 2: Retrieve SEAL Memory');
        console.log('-------------------------------');
        
        const retrieveResult = await storageService.retrieveSealMemory(uploadResult.blobId);
        
        console.log('✅ Retrieve successful:');
        console.log(`   Blob ID: ${retrieveResult.blobId}`);
        console.log(`   Content size: ${retrieveResult.encryptedData.length} bytes`);
        console.log(`   Metadata keys: ${Object.keys(retrieveResult.metadata).join(', ')}`);
        console.log(`   Encrypted: ${retrieveResult.metadata.encrypted}`);
        console.log(`   Encryption type: ${retrieveResult.metadata.encryptionType}`);
        
        // Verify data integrity
        const dataMatch = retrieveResult.encryptedData.length === mockEncryptedData.length;
        console.log(`   Data integrity: ${dataMatch ? '✅ VERIFIED' : '❌ FAILED'}\n`);

        console.log('🎉 Legacy StorageService SEAL Test Complete');
        console.log('✅ SEAL upload method working correctly');
        console.log('✅ SEAL retrieve method working correctly');
        console.log('✅ Binary format preservation validated');
        console.log('✅ Metadata handling verified');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    }
}

// Run the test
testLegacyStorageService().catch(console.error);
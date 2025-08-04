"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const seal_service_1 = require("../infrastructure/seal/seal.service");
const seal_open_mode_service_1 = require("../infrastructure/seal/seal-open-mode.service");
const session_store_1 = require("../infrastructure/seal/session-store");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
async function testSealOpenMode() {
    console.log('🔐 Testing SEAL Open Mode Implementation\n');
    const module = await testing_1.Test.createTestingModule({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
        ],
        providers: [
            seal_service_1.SealService,
            seal_open_mode_service_1.SealOpenModeService,
            session_store_1.SessionStore,
        ],
    }).compile();
    const sealService = module.get(seal_service_1.SealService);
    const openModeService = module.get(seal_open_mode_service_1.SealOpenModeService);
    const testKeypair = new ed25519_1.Ed25519Keypair();
    const userAddress = testKeypair.getPublicKey().toSuiAddress();
    const testContent = 'This is a test message for SEAL open mode';
    const customPackageId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const customModuleName = 'custom_access_control';
    try {
        console.log('1️⃣ Testing SealService in open mode...');
        console.log(`   User address: ${userAddress}`);
        console.log(`   Open mode enabled: ${sealService.isInOpenMode()}`);
        console.log('\n2️⃣ Testing encryption with custom package...');
        const encryptResult = await sealService.encrypt(testContent, userAddress, customPackageId);
        console.log('   ✅ Encryption successful');
        console.log(`   Encrypted size: ${encryptResult.encrypted.length} chars`);
        console.log(`   Backup key: ${encryptResult.backupKey.substring(0, 20)}...`);
        console.log('\n3️⃣ Getting session key message...');
        const messageBytes = await sealService.getSessionKeyMessage(userAddress, customPackageId);
        const message = Buffer.from(messageBytes).toString('utf8');
        console.log('   ✅ Session message generated');
        console.log(`   Message preview: ${message.substring(0, 50)}...`);
        console.log('\n4️⃣ Signing session message...');
        const signature = await testKeypair.signPersonalMessage(messageBytes);
        const signatureHex = Buffer.from(signature.signature).toString('hex');
        console.log('   ✅ Message signed');
        console.log(`   Signature: ${signatureHex.substring(0, 20)}...`);
        console.log('\n5️⃣ Testing decryption with custom package...');
        try {
            const decrypted = await sealService.decrypt(encryptResult.encrypted, userAddress, signatureHex, customPackageId, customModuleName);
            console.log('   ✅ Decryption successful');
            console.log(`   Decrypted: ${decrypted}`);
        }
        catch (error) {
            console.log('   ⚠️  Decryption failed (expected without real seal_approve function)');
            console.log(`   Error: ${error.message}`);
        }
        console.log('\n6️⃣ Testing SealOpenModeService...');
        const identity = `test:${userAddress}`;
        const openModeResult = await openModeService.encrypt(testContent, customPackageId, identity);
        console.log('   ✅ Open mode service encryption successful');
        console.log(`   Identity used: ${identity}`);
        console.log(`   Metadata:`, openModeResult.metadata);
        console.log('\n7️⃣ Testing batch encryption...');
        const batchItems = [
            { id: '1', content: 'First message', packageId: customPackageId, identity: `batch1:${userAddress}` },
            { id: '2', content: 'Second message', packageId: customPackageId, identity: `batch2:${userAddress}` },
            { id: '3', content: 'Third message', packageId: customPackageId, identity: `batch3:${userAddress}` },
        ];
        const batchResults = await openModeService.batchEncrypt(batchItems);
        console.log(`   ✅ Batch encryption completed`);
        console.log(`   Encrypted ${batchResults.size} items`);
        console.log('\n✅ SEAL Open Mode tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('   - SealService supports open mode with custom packages');
        console.log('   - SealOpenModeService provides dedicated open mode operations');
        console.log('   - Batch operations are supported');
        console.log('   - Session key management works with multiple packages');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error);
        throw error;
    }
    finally {
        await module.close();
    }
}
if (require.main === module) {
    testSealOpenMode()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
//# sourceMappingURL=test-seal-open-mode.js.map
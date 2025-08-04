"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSealComplete = testSealComplete;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seal_service_1 = require("../infrastructure/seal/seal.service");
const seal_ibe_service_1 = require("../infrastructure/seal/seal-ibe.service");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const identity_types_1 = require("../infrastructure/seal/identity-types");
async function testSealComplete() {
    console.log('===============================================');
    console.log('Complete SEAL Functionality Test');
    console.log('===============================================\n');
    let app;
    try {
        app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const sealService = app.get(seal_service_1.SealService);
        const sealIBEService = app.get(seal_ibe_service_1.SealIBEService);
        const userKeypair = new ed25519_1.Ed25519Keypair();
        const userAddress = userKeypair.getPublicKey().toSuiAddress();
        const appKeypair = new ed25519_1.Ed25519Keypair();
        const appAddress = appKeypair.getPublicKey().toSuiAddress();
        const app2Keypair = new ed25519_1.Ed25519Keypair();
        const app2Address = app2Keypair.getPublicKey().toSuiAddress();
        console.log('Test Addresses:');
        console.log('  User:', userAddress);
        console.log('  App1:', appAddress);
        console.log('  App2:', app2Address);
        console.log('');
        console.log('=== Test 1: Basic Self Encryption/Decryption ===');
        console.log('1.1 Getting session message for user...');
        const userMessage = await sealService.getSessionKeyMessage(userAddress);
        console.log('   ✓ Message obtained, length:', userMessage.length);
        console.log('1.2 User signing message...');
        const { signature: userSignature } = await userKeypair.signPersonalMessage(userMessage);
        console.log('   ✓ Signature created');
        console.log('1.3 Encrypting content for self...');
        const selfContent = 'This is my private data';
        const selfEncrypted = await sealService.encrypt(selfContent, userAddress);
        console.log('   ✓ Content encrypted');
        console.log('   Backup key:', selfEncrypted.backupKey.substring(0, 20) + '...');
        console.log('1.4 Decrypting content (with signature)...');
        try {
            const selfDecrypted = await sealService.decrypt(selfEncrypted.encrypted, userAddress, userSignature);
            console.log('   ✓ Successfully decrypted:', selfDecrypted);
        }
        catch (error) {
            console.log('   ✗ Decryption failed:', error.message);
        }
        console.log('1.5 Decrypting again (should use cached session)...');
        try {
            const selfDecrypted2 = await sealService.decrypt(selfEncrypted.encrypted, userAddress);
            console.log('   ✓ Successfully decrypted with cached session:', selfDecrypted2);
        }
        catch (error) {
            console.log('   ✗ Cached decryption failed:', error.message);
        }
        console.log('\n=== Test 2: App-based Encryption/Decryption ===');
        console.log('2.1 Getting session message for app...');
        const appMessage = await sealIBEService.getSessionKeyMessage(appAddress);
        console.log('   ✓ Message obtained for app');
        console.log('2.2 App signing message...');
        const { signature: appSignature } = await appKeypair.signPersonalMessage(appMessage);
        console.log('   ✓ App signature created');
        console.log('2.3 Encrypting content for app access...');
        const appContent = 'Secret data only the app can decrypt';
        const appEncrypted = await sealIBEService.encryptForApp(appContent, userAddress, appAddress);
        console.log('   ✓ Content encrypted for app');
        console.log('   Identity string:', appEncrypted.identityString);
        console.log('2.4 App attempting to decrypt...');
        try {
            const appDecrypted = await sealIBEService.decryptWithIdentity(appEncrypted.encrypted, {
                type: identity_types_1.IdentityType.APP,
                userAddress,
                targetAddress: appAddress,
            }, appSignature);
            console.log('   ✓ App successfully decrypted:', appDecrypted);
        }
        catch (error) {
            console.log('   ✗ App decryption failed:', error.message);
        }
        console.log('2.5 Different app attempting to decrypt (should fail)...');
        const app2Message = await sealIBEService.getSessionKeyMessage(app2Address);
        const { signature: app2Signature } = await app2Keypair.signPersonalMessage(app2Message);
        try {
            const app2Decrypted = await sealIBEService.decryptWithIdentity(appEncrypted.encrypted, {
                type: identity_types_1.IdentityType.APP,
                userAddress,
                targetAddress: app2Address,
            }, app2Signature);
            console.log('   ✗ SECURITY ISSUE: Different app could decrypt!');
        }
        catch (error) {
            console.log('   ✓ Different app correctly rejected:', error.message);
        }
        console.log('\n=== Test 3: Time-locked Encryption ===');
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        const pastTime = Math.floor(Date.now() / 1000) - 3600;
        console.log('3.1 Encrypting with future timelock...');
        const timelockContent = 'This data is time-locked';
        const timelockEncrypted = await sealIBEService.encryptWithTimelock(timelockContent, userAddress, futureTime);
        console.log('   ✓ Content encrypted with timelock');
        console.log('   Expires at:', new Date(futureTime * 1000).toISOString());
        console.log('3.2 Attempting to decrypt time-locked content...');
        try {
            const timelockDecrypted = await sealIBEService.decryptWithIdentity(timelockEncrypted.encrypted, {
                type: identity_types_1.IdentityType.TIME_LOCKED,
                userAddress,
                expiresAt: futureTime,
            }, userSignature);
            console.log('   Result:', timelockDecrypted);
        }
        catch (error) {
            console.log('   Time-lock decrypt error:', error.message);
        }
        console.log('\n=== Test 4: Multiple Encryptions ===');
        console.log('4.1 Encrypting multiple items for same app...');
        const items = ['Item 1', 'Item 2', 'Item 3'];
        const encryptedItems = [];
        for (let i = 0; i < items.length; i++) {
            const encrypted = await sealIBEService.encryptForApp(items[i], userAddress, appAddress);
            encryptedItems.push(encrypted);
            console.log(`   ✓ Encrypted "${items[i]}"`);
        }
        console.log('4.2 App decrypting all items...');
        for (let i = 0; i < encryptedItems.length; i++) {
            try {
                const decrypted = await sealIBEService.decryptWithIdentity(encryptedItems[i].encrypted, {
                    type: identity_types_1.IdentityType.APP,
                    userAddress,
                    targetAddress: appAddress,
                }, appSignature);
                console.log(`   ✓ Decrypted item ${i + 1}:`, decrypted);
            }
            catch (error) {
                console.log(`   ✗ Failed to decrypt item ${i + 1}:`, error.message);
            }
        }
        console.log('\n=== Test 5: Session Persistence ===');
        console.log('5.1 Getting new service instance...');
        const sealService2 = app.get(seal_service_1.SealService);
        console.log('5.2 Decrypting with new service instance (using stored session)...');
        try {
            const decryptedWithNewInstance = await sealService2.decrypt(selfEncrypted.encrypted, userAddress);
            console.log('   ✓ Successfully decrypted with stored session:', decryptedWithNewInstance);
        }
        catch (error) {
            console.log('   ✗ Failed with new instance:', error.message);
        }
        console.log('\n=== Test 6: Error Handling ===');
        console.log('6.1 Attempting decrypt without session...');
        const randomAddress = new ed25519_1.Ed25519Keypair().getPublicKey().toSuiAddress();
        try {
            await sealService.decrypt(selfEncrypted.encrypted, randomAddress);
            console.log('   ✗ Should have failed!');
        }
        catch (error) {
            console.log('   ✓ Correctly failed:', error.message);
        }
        console.log('6.2 Attempting decrypt with wrong signature...');
        const wrongMessage = await sealService.getSessionKeyMessage(randomAddress);
        const wrongKeypair = new ed25519_1.Ed25519Keypair();
        const { signature: wrongSig } = await wrongKeypair.signPersonalMessage(wrongMessage);
        try {
            await sealService.decrypt(selfEncrypted.encrypted, randomAddress, wrongSig);
            console.log('   ✗ Should have failed!');
        }
        catch (error) {
            console.log('   ✓ Correctly failed:', error.message);
        }
        console.log('\n✅ All SEAL functionality tests completed!');
    }
    catch (error) {
        console.error('\n❌ Test failed with error:', error.message);
        console.error('Stack:', error.stack);
    }
    finally {
        if (app) {
            await app.close();
        }
    }
}
if (require.main === module) {
    testSealComplete().catch(console.error);
}
//# sourceMappingURL=test-seal-complete.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSessionStore = testSessionStore;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seal_service_1 = require("../infrastructure/seal/seal.service");
const seal_ibe_service_1 = require("../infrastructure/seal/seal-ibe.service");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
async function testSessionStore() {
    console.log('===============================================');
    console.log('Testing SessionStore Integration');
    console.log('===============================================\n');
    try {
        const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const sealService = app.get(seal_service_1.SealService);
        const sealIBEService = app.get(seal_ibe_service_1.SealIBEService);
        const userKeypair = new ed25519_1.Ed25519Keypair();
        const userAddress = userKeypair.getPublicKey().toSuiAddress();
        const appKeypair = new ed25519_1.Ed25519Keypair();
        const appAddress = appKeypair.getPublicKey().toSuiAddress();
        console.log('User Address:', userAddress);
        console.log('App Address:', appAddress);
        console.log('');
        console.log('1. Getting session message for user...');
        const message1 = await sealService.getSessionKeyMessage(userAddress);
        console.log('   Message length:', message1.length);
        console.log('   Message (hex):', Buffer.from(message1).toString('hex'));
        console.log('\n2. Getting session message again (should be same)...');
        const message2 = await sealService.getSessionKeyMessage(userAddress);
        console.log('   Messages match:', Buffer.from(message1).equals(Buffer.from(message2)));
        console.log('\n3. Signing message...');
        const { signature } = await userKeypair.signPersonalMessage(message1);
        console.log('   Signature:', signature);
        console.log('\n4. Encrypting content for self...');
        const testContent = 'Test content for session store';
        const encrypted = await sealService.encrypt(testContent, userAddress);
        console.log('   ✓ Content encrypted');
        console.log('\n5. Decrypting with signature (first time)...');
        try {
            const decrypted = await sealService.decrypt(encrypted.encrypted, userAddress, signature);
            console.log('   ✓ Decrypted:', decrypted);
        }
        catch (error) {
            console.log('   ✗ Decryption failed:', error.message);
        }
        console.log('\n6. Decrypting without signature (should use cached)...');
        try {
            const decrypted = await sealService.decrypt(encrypted.encrypted, userAddress);
            console.log('   ✓ Decrypted with cached session:', decrypted);
        }
        catch (error) {
            console.log('   ✗ Decryption failed:', error.message);
        }
        console.log('\n7. Testing app-based encryption...');
        const appMessage = await sealIBEService.getSessionKeyMessage(appAddress);
        const { signature: appSignature } = await appKeypair.signPersonalMessage(appMessage);
        const appEncrypted = await sealIBEService.encryptForApp('Secret data for app', userAddress, appAddress);
        console.log('   ✓ Content encrypted for app');
        try {
            const appDecrypted = await sealIBEService.decryptWithIdentity(appEncrypted.encrypted, {
                type: 'APP',
                userAddress,
                targetAddress: appAddress,
            }, appSignature);
            console.log('   ✓ Decrypted as app:', appDecrypted);
        }
        catch (error) {
            console.log('   ✗ App decryption failed:', error.message);
        }
        console.log('\n✅ SessionStore integration test completed');
        await app.close();
    }
    catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}
if (require.main === module) {
    testSessionStore().catch(console.error);
}
//# sourceMappingURL=test-session-store.js.map
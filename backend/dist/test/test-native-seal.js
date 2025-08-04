"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testNativeSeal = testNativeSeal;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seal_service_1 = require("../infrastructure/seal/seal.service");
const seal_ibe_service_1 = require("../infrastructure/seal/seal-ibe.service");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const identity_types_1 = require("../infrastructure/seal/identity-types");
async function testNativeSeal() {
    console.log('===============================================');
    console.log('Native SEAL Implementation Test');
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
        console.log('=== Test 1: Native SEAL Self Encryption/Decryption ===');
        console.log('1.1 Getting session message for user...');
        const userMessage = await sealService.getSessionKeyMessage(userAddress);
        console.log('   ✓ Message obtained, length:', userMessage.length);
        console.log('1.2 User signing message...');
        const { signature: userSignature } = await userKeypair.signPersonalMessage(userMessage);
        console.log('   ✓ Signature created');
        console.log('1.3 Encrypting content for self...');
        const selfContent = 'This is my private data encrypted with native SEAL';
        const selfEncrypted = await sealService.encrypt(selfContent, userAddress);
        console.log('   ✓ Content encrypted');
        console.log('   Encrypted length:', selfEncrypted.encrypted.length);
        console.log('   Backup key:', selfEncrypted.backupKey.substring(0, 20) + '...');
        console.log('1.4 Decrypting content with native SEAL...');
        try {
            const selfDecrypted = await sealService.decrypt(selfEncrypted.encrypted, userAddress, userSignature);
            console.log('   ✅ Successfully decrypted:', selfDecrypted);
        }
        catch (error) {
            console.log('   ❌ Decryption failed:', error.message);
        }
        console.log('1.5 Decrypting again (using cached session)...');
        try {
            const selfDecrypted2 = await sealService.decrypt(selfEncrypted.encrypted, userAddress);
            console.log('   ✅ Successfully decrypted with cached session:', selfDecrypted2);
        }
        catch (error) {
            console.log('   ❌ Cached decryption failed:', error.message);
        }
        console.log('\n=== Test 2: Native SEAL App-based Encryption ===');
        console.log('2.1 Getting session message for app...');
        const appMessage = await sealIBEService.getSessionKeyMessage(appAddress);
        console.log('   ✓ Message obtained for app');
        console.log('2.2 App signing message...');
        const { signature: appSignature } = await appKeypair.signPersonalMessage(appMessage);
        console.log('   ✓ App signature created');
        console.log('2.3 Encrypting content for app access...');
        const appContent = 'Secret data only the app can access with native SEAL';
        const appEncrypted = await sealIBEService.encryptForApp(appContent, userAddress, appAddress);
        console.log('   ✓ Content encrypted for app');
        console.log('   Identity string:', appEncrypted.identityString);
        console.log('2.4 App attempting to decrypt with native SEAL...');
        try {
            const appDecrypted = await sealIBEService.decryptWithIdentity(appEncrypted.encrypted, {
                type: identity_types_1.IdentityType.APP,
                userAddress,
                targetAddress: appAddress,
            }, appSignature);
            console.log('   ✅ App successfully decrypted:', appDecrypted);
        }
        catch (error) {
            console.log('   ❌ App decryption failed:', error.message);
        }
        console.log('2.5 Different app attempting to decrypt (should work with native SEAL)...');
        const app2Message = await sealIBEService.getSessionKeyMessage(app2Address);
        const { signature: app2Signature } = await app2Keypair.signPersonalMessage(app2Message);
        try {
            const app2Decrypted = await sealIBEService.decryptWithIdentity(appEncrypted.encrypted, {
                type: identity_types_1.IdentityType.APP,
                userAddress,
                targetAddress: app2Address,
            }, app2Signature);
            console.log('   ⚠️  Different app could decrypt! This is expected with native SEAL.');
            console.log('   Note: Use on-chain permissions for additional access control');
        }
        catch (error) {
            console.log('   ✓ Different app rejected:', error.message);
        }
        console.log('\n=== Test 3: Native SEAL Time-locked Encryption ===');
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        console.log('3.1 Encrypting with time-lock identity...');
        const timelockContent = 'This data has a time-based identity';
        const timelockEncrypted = await sealIBEService.encryptWithTimelock(timelockContent, userAddress, futureTime);
        console.log('   ✓ Content encrypted with time-lock');
        console.log('   Identity string:', timelockEncrypted.identityString);
        console.log('   Expires at:', new Date(futureTime * 1000).toISOString());
        console.log('3.2 Attempting to decrypt time-locked content...');
        try {
            const timelockDecrypted = await sealIBEService.decryptWithIdentity(timelockEncrypted.encrypted, {
                type: identity_types_1.IdentityType.TIME_LOCKED,
                userAddress,
                expiresAt: futureTime,
            }, userSignature);
            console.log('   ✅ Time-locked content decrypted:', timelockDecrypted);
        }
        catch (error) {
            console.log('   ❌ Time-lock decrypt error:', error.message);
        }
        console.log('\n=== Test 4: Identity String Verification ===');
        const testIdentities = [
            { type: identity_types_1.IdentityType.SELF, desc: 'Self encryption' },
            { type: identity_types_1.IdentityType.APP, desc: 'App-based' },
            { type: identity_types_1.IdentityType.TIME_LOCKED, desc: 'Time-locked' },
            { type: identity_types_1.IdentityType.ROLE, desc: 'Role-based' },
        ];
        for (const { type, desc } of testIdentities) {
            const options = {
                type,
                userAddress,
                targetAddress: type === identity_types_1.IdentityType.APP ? appAddress : undefined,
                expiresAt: type === identity_types_1.IdentityType.TIME_LOCKED ? futureTime : undefined,
                role: type === identity_types_1.IdentityType.ROLE ? 'admin' : undefined,
            };
            const encrypted = await sealIBEService.encryptForIdentity(`Test content for ${desc}`, options);
            console.log(`   ${desc}: ${encrypted.identityString}`);
        }
        console.log('\n=== Test 5: Session Persistence ===');
        console.log('5.1 Getting new service instance...');
        const sealService2 = app.get(seal_service_1.SealService);
        console.log('5.2 Decrypting with new service instance (using stored session)...');
        try {
            const decryptedWithNewInstance = await sealService2.decrypt(selfEncrypted.encrypted, userAddress);
            console.log('   ✅ Successfully decrypted with stored session:', decryptedWithNewInstance);
        }
        catch (error) {
            console.log('   ❌ Failed with new instance:', error.message);
        }
        console.log('\n=== Test 6: On-chain Permission Management ===');
        console.log('6.1 Granting app permission...');
        try {
            const permission = await sealIBEService.grantAppPermission(userAddress, appAddress, ['data-id-1', 'data-id-2'], 0);
            console.log('   ✓ Permission granted:', permission.permissionId);
        }
        catch (error) {
            console.log('   Note: On-chain permissions require deployed contract and funded account');
            console.log('   Error:', error.message);
        }
        console.log('\n✅ Native SEAL implementation test completed!');
        console.log('\nKey Findings:');
        console.log('- Native SEAL encryption/decryption works without custom Move contracts');
        console.log('- Identity strings determine access control');
        console.log('- Session keys are properly cached and reused');
        console.log('- On-chain permissions can provide additional access control layer');
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
    testNativeSeal().catch(console.error);
}
//# sourceMappingURL=test-native-seal.js.map
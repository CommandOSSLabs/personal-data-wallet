"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSealFinal = testSealFinal;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seal_service_1 = require("../infrastructure/seal/seal.service");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const config_1 = require("@nestjs/config");
async function testSealFinal() {
    console.log('===============================================');
    console.log('Final SEAL Test - Checking Configuration');
    console.log('===============================================\n');
    let app;
    try {
        app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const sealService = app.get(seal_service_1.SealService);
        const configService = app.get(config_1.ConfigService);
        console.log('=== Configuration ===');
        console.log('SEAL_NETWORK:', configService.get('SEAL_NETWORK'));
        console.log('SEAL_PACKAGE_ID:', configService.get('SEAL_PACKAGE_ID'));
        console.log('SEAL_MODULE_NAME:', configService.get('SEAL_MODULE_NAME'));
        console.log('SEAL_THRESHOLD:', configService.get('SEAL_THRESHOLD'));
        console.log('SUI_RPC_URL:', configService.get('SUI_RPC_URL'));
        const keypair = new ed25519_1.Ed25519Keypair();
        const address = keypair.getPublicKey().toSuiAddress();
        console.log('\n=== Test Account ===');
        console.log('Address:', address);
        console.log('\n=== Test 1: Session Message ===');
        const message = await sealService.getSessionKeyMessage(address);
        console.log('Message length:', message.length);
        console.log('Message (hex):', Buffer.from(message).toString('hex').substring(0, 100) + '...');
        console.log('Message (utf8 preview):', Buffer.from(message).toString('utf8').substring(0, 150) + '...');
        console.log('\n=== Test 2: Sign Message ===');
        const { signature } = await keypair.signPersonalMessage(message);
        console.log('Signature:', signature);
        console.log('\n=== Test 3: Encrypt ===');
        const testContent = 'Hello SEAL';
        const encrypted = await sealService.encrypt(testContent, address);
        console.log('Encrypted length:', encrypted.encrypted.length);
        console.log('Backup key:', encrypted.backupKey.substring(0, 40) + '...');
        console.log('\n=== Test 4: Decrypt ===');
        const sealServiceAny = sealService;
        const sessionStore = sealServiceAny.sessionStore;
        const sessionData = sessionStore.get(address);
        console.log('Session data exists:', !!sessionData);
        if (sessionData) {
            console.log('Session data keys:', Object.keys(sessionData));
            console.log('Has signature in store:', !!sessionData.signature);
        }
        const cachedKey = sealServiceAny.sessionKeys.get(address);
        console.log('Cached SessionKey exists:', !!cachedKey);
        try {
            const decrypted = await sealService.decrypt(encrypted.encrypted, address, signature);
            console.log('✓ Decryption successful!');
            console.log('Decrypted content:', decrypted);
        }
        catch (error) {
            console.log('✗ Decryption failed:', error.message);
            if (error.message.includes('Personal message signature is not set')) {
                console.log('\nDEBUG: Signature not being set properly');
                try {
                    const sessionKey = await sealServiceAny.getOrCreateSessionKey(address, signature);
                    console.log('SessionKey obtained manually');
                    try {
                        const exported = sessionKey.export();
                        console.log('Exported address:', exported.address);
                        console.log('Has personalMessageSignature:', !!exported.personalMessageSignature);
                    }
                    catch (e) {
                        console.log('Cannot export SessionKey:', e.message);
                    }
                }
                catch (e) {
                    console.log('Failed to get SessionKey manually:', e.message);
                }
            }
        }
        console.log('\n=== Test 5: Decrypt with Cached Session ===');
        try {
            const decrypted2 = await sealService.decrypt(encrypted.encrypted, address);
            console.log('✓ Cached decryption successful!');
            console.log('Decrypted content:', decrypted2);
        }
        catch (error) {
            console.log('✗ Cached decryption failed:', error.message);
        }
    }
    catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
    finally {
        if (app) {
            await app.close();
        }
    }
}
if (require.main === module) {
    testSealFinal().catch(console.error);
}
//# sourceMappingURL=test-seal-final.js.map
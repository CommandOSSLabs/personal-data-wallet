"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSealMinimal = testSealMinimal;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seal_service_1 = require("../infrastructure/seal/seal.service");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
async function testSealMinimal() {
    console.log('===============================================');
    console.log('Minimal SEAL Test');
    console.log('===============================================\n');
    let app;
    try {
        app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const sealService = app.get(seal_service_1.SealService);
        const keypair = new ed25519_1.Ed25519Keypair();
        const address = keypair.getPublicKey().toSuiAddress();
        console.log('User Address:', address);
        console.log('\n=== Direct SEAL Client Test ===');
        const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
        const CUSTOM_PACKAGE_ID = '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
        const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
        const sealClient = new seal_1.SealClient({
            suiClient,
            serverConfigs: (0, seal_1.getAllowlistedKeyServers)('testnet').map((id) => ({
                objectId: id,
                weight: 1,
            })),
        });
        console.log('1. Encrypting with direct SEAL client...');
        const testData = new TextEncoder().encode('Direct SEAL test');
        const packageIdBytes = (0, utils_1.fromHEX)(SEAL_PACKAGE_ID);
        const addressBytes = (0, utils_1.fromHEX)(address);
        const identity = new Uint8Array(packageIdBytes.length + addressBytes.length);
        identity.set(packageIdBytes, 0);
        identity.set(addressBytes, packageIdBytes.length);
        const identityHex = (0, utils_1.toHEX)(identity);
        const { encryptedObject, key: backupKey } = await sealClient.encrypt({
            threshold: 2,
            packageId: SEAL_PACKAGE_ID,
            id: identityHex,
            data: testData,
        });
        console.log('   ✓ Encrypted');
        console.log('\n2. Creating SessionKey...');
        const sessionKey = new seal_1.SessionKey({
            address: address,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        const message = sessionKey.getPersonalMessage();
        console.log('   Personal message length:', message.length);
        console.log('\n3. Signing message...');
        const { signature } = await keypair.signPersonalMessage(message);
        console.log('   ✓ Signed');
        console.log('\n4. Setting signature...');
        sessionKey.setPersonalMessageSignature(signature);
        console.log('   ✓ Signature set');
        console.log('\n5. Building transaction...');
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${CUSTOM_PACKAGE_ID}::seal_access_control::seal_approve`,
            arguments: [
                tx.pure.vector("u8", (0, utils_1.fromHEX)(identityHex)),
            ],
        });
        const txBytes = await tx.build({
            client: suiClient,
            onlyTransactionKind: true
        });
        console.log('   ✓ Transaction built');
        console.log('\n6. Attempting decrypt...');
        try {
            const decryptedBytes = await sealClient.decrypt({
                data: encryptedObject,
                sessionKey,
                txBytes,
            });
            const decryptedText = new TextDecoder().decode(decryptedBytes);
            console.log('   ✓ Decrypted:', decryptedText);
        }
        catch (error) {
            console.log('   ✗ Decrypt failed:', error.message);
            console.log('   Error type:', error.constructor.name);
            console.log('   Full error:', error);
        }
        console.log('\n\n=== Service Test ===');
        console.log('1. Getting session message...');
        const serviceMessage = await sealService.getSessionKeyMessage(address);
        console.log('   ✓ Message obtained');
        console.log('\n2. Signing message...');
        const { signature: serviceSig } = await keypair.signPersonalMessage(serviceMessage);
        console.log('   ✓ Signed');
        console.log('\n3. Encrypting...');
        const encrypted = await sealService.encrypt('Service test data', address);
        console.log('   ✓ Encrypted');
        console.log('\n4. Decrypting...');
        try {
            const decrypted = await sealService.decrypt(encrypted.encrypted, address, serviceSig);
            console.log('   ✓ Decrypted:', decrypted);
        }
        catch (error) {
            console.log('   ✗ Decrypt failed:', error.message);
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
    testSealMinimal().catch(console.error);
}
//# sourceMappingURL=test-seal-minimal.js.map
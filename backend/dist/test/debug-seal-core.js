"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugSealCore = debugSealCore;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const seal_simple_service_1 = require("../infrastructure/seal/seal-simple.service");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
async function debugSealCore() {
    console.log('===============================================');
    console.log('SEAL Core Functionality Debug');
    console.log('===============================================\n');
    let app;
    try {
        app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log', 'debug', 'verbose'],
        });
        const sealSimpleService = app.get(seal_simple_service_1.SealSimpleService);
        const keypair = new ed25519_1.Ed25519Keypair();
        const userAddress = keypair.getPublicKey().toSuiAddress();
        console.log('User Address:', userAddress);
        console.log('');
        console.log('=== Test 1: Direct SEAL with Different Identities ===');
        await testDirectSeal(userAddress, keypair);
        console.log('\n=== Test 2: Simple Service Test ===');
        console.log('2.1 Getting session message...');
        const message = await sealSimpleService.getSessionKeyMessage(userAddress);
        console.log('Message received, length:', message.length);
        console.log('Message (UTF8):', Buffer.from(message).toString('utf8'));
        console.log('\n2.2 Signing message...');
        const { signature } = await keypair.signPersonalMessage(message);
        console.log('Signature:', signature);
        console.log('\n2.3 Testing complete flow...');
        const result = await sealSimpleService.testCompleteFlow(userAddress, signature);
        console.log('Result:', result);
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
async function testDirectSeal(userAddress, keypair) {
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
    const sealClient = new seal_1.SealClient({
        suiClient,
        serverConfigs: (0, seal_1.getAllowlistedKeyServers)('testnet').map((id) => ({
            objectId: id,
            weight: 1,
        })),
    });
    const testData = new TextEncoder().encode('Test data for debugging');
    const identityTests = [
        {
            name: 'Just address',
            id: (0, utils_1.toHEX)(new TextEncoder().encode(userAddress)),
        },
        {
            name: 'Address with prefix',
            id: (0, utils_1.toHEX)(new TextEncoder().encode(`user:${userAddress}`)),
        },
        {
            name: 'Raw address bytes',
            id: userAddress.replace('0x', ''),
        },
        {
            name: 'Package + address',
            id: (() => {
                const pkgBytes = (0, utils_1.fromHEX)(SEAL_PACKAGE_ID);
                const addrBytes = (0, utils_1.fromHEX)(userAddress);
                const combined = new Uint8Array(pkgBytes.length + addrBytes.length);
                combined.set(pkgBytes, 0);
                combined.set(addrBytes, pkgBytes.length);
                return (0, utils_1.toHEX)(combined);
            })(),
        },
    ];
    for (const test of identityTests) {
        console.log(`\nTesting identity: ${test.name}`);
        console.log(`ID: ${test.id.substring(0, 50)}...`);
        try {
            const { encryptedObject, key: backupKey } = await sealClient.encrypt({
                threshold: 2,
                packageId: SEAL_PACKAGE_ID,
                id: test.id,
                data: testData,
            });
            console.log('✓ Encryption successful');
            console.log('  Encrypted size:', encryptedObject.length);
            console.log('  Backup key:', (0, utils_1.toHEX)(backupKey).substring(0, 20) + '...');
            const sessionKey = new seal_1.SessionKey({
                address: userAddress,
                packageId: SEAL_PACKAGE_ID,
                ttlMin: 30,
                suiClient: suiClient,
            });
            const message = sessionKey.getPersonalMessage();
            const { signature } = await keypair.signPersonalMessage(message);
            sessionKey.setPersonalMessageSignature(signature);
            const txTests = [
                {
                    name: 'Empty transaction',
                    build: async () => {
                        const tx = new transactions_1.Transaction();
                        return await tx.build({ client: suiClient, onlyTransactionKind: true });
                    }
                },
                {
                    name: 'Simple transfer to self',
                    build: async () => {
                        const tx = new transactions_1.Transaction();
                        tx.transferObjects([tx.gas], userAddress);
                        return await tx.build({ client: suiClient, onlyTransactionKind: true });
                    }
                },
            ];
            for (const txTest of txTests) {
                console.log(`  Testing with ${txTest.name}...`);
                try {
                    const txBytes = await txTest.build();
                    const decryptedBytes = await sealClient.decrypt({
                        data: encryptedObject,
                        sessionKey,
                        txBytes,
                    });
                    const decrypted = new TextDecoder().decode(decryptedBytes);
                    console.log('  ✓ Decryption successful!');
                    console.log('    Decrypted:', decrypted);
                    break;
                }
                catch (error) {
                    console.log(`  ✗ Failed: ${error.message}`);
                }
            }
        }
        catch (error) {
            console.log(`✗ Encryption failed: ${error.message}`);
        }
    }
}
if (require.main === module) {
    debugSealCore().catch(console.error);
}
//# sourceMappingURL=debug-seal-core.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSealDecryptOnly = testSealDecryptOnly;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const transactions_1 = require("@mysten/sui/transactions");
async function testSealDecryptOnly() {
    console.log('===============================================');
    console.log('SEAL Decrypt-Only Test');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    try {
        const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
        const sealClient = new seal_1.SealClient({
            suiClient,
            serverConfigs: (0, seal_1.getAllowlistedKeyServers)('testnet').map((id) => ({
                objectId: id,
                weight: 1,
            })),
        });
        const keypair = new ed25519_1.Ed25519Keypair();
        const userAddress = keypair.getPublicKey().toSuiAddress();
        console.log('User Address:', userAddress);
        console.log('\n1. Encrypting with minimal identity...');
        const testData = new TextEncoder().encode('Hello SEAL');
        const identities = [
            { name: 'Empty identity', id: '' },
            { name: 'Single byte', id: '00' },
            { name: 'User address only', id: userAddress.replace('0x', '') },
        ];
        for (const identity of identities) {
            console.log(`\nTrying identity: ${identity.name}`);
            try {
                const { encryptedObject, key: backupKey } = await sealClient.encrypt({
                    threshold: 2,
                    packageId: SEAL_PACKAGE_ID,
                    id: identity.id,
                    data: testData,
                });
                console.log('✓ Encryption successful');
                const sessionKey = new seal_1.SessionKey({
                    address: userAddress,
                    packageId: SEAL_PACKAGE_ID,
                    ttlMin: 30,
                    suiClient: suiClient,
                });
                const message = sessionKey.getPersonalMessage();
                const { signature } = await keypair.signPersonalMessage(message);
                sessionKey.setPersonalMessageSignature(signature);
                console.log('Attempting decrypt...');
                const tx = new transactions_1.Transaction();
                tx.setSender(userAddress);
                try {
                    const txBytes = await tx.build({
                        client: suiClient,
                        onlyTransactionKind: false
                    });
                    console.log('Transaction built, size:', txBytes.length);
                    const decryptedBytes = await sealClient.decrypt({
                        data: encryptedObject,
                        sessionKey,
                        txBytes,
                    });
                    const decrypted = new TextDecoder().decode(decryptedBytes);
                    console.log('✅ DECRYPTION SUCCESSFUL!');
                    console.log('Decrypted:', decrypted);
                    console.log('\nWorking configuration:');
                    console.log('- Identity:', identity.name, '(', identity.id, ')');
                    console.log('- Transaction type: Minimal with sender');
                    console.log('- Transaction size:', txBytes.length);
                    return;
                }
                catch (e) {
                    console.log('Decrypt failed:', e.message);
                    const tx2 = new transactions_1.Transaction();
                    tx2.setSender(userAddress);
                    const result = tx2.pure.bool(true);
                    try {
                        const txBytes2 = await tx2.build({
                            client: suiClient,
                            onlyTransactionKind: true
                        });
                        const decryptedBytes = await sealClient.decrypt({
                            data: encryptedObject,
                            sessionKey,
                            txBytes: txBytes2,
                        });
                        const decrypted = new TextDecoder().decode(decryptedBytes);
                        console.log('✅ DECRYPTION SUCCESSFUL with pure bool!');
                        console.log('Decrypted:', decrypted);
                        return;
                    }
                    catch (e2) {
                        console.log('Pure bool also failed:', e2.message);
                    }
                }
            }
            catch (error) {
                console.log('Failed:', error.message);
            }
        }
        console.log('\n\n=== Trying with SEAL fetchKeys method ===');
        const { encryptedObject } = await sealClient.encrypt({
            threshold: 2,
            packageId: SEAL_PACKAGE_ID,
            id: userAddress.replace('0x', ''),
            data: testData,
        });
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        const message = sessionKey.getPersonalMessage();
        const { signature } = await keypair.signPersonalMessage(message);
        sessionKey.setPersonalMessageSignature(signature);
        const tx = new transactions_1.Transaction();
        const dummyTx = new Uint8Array([0, 0, 0]);
        try {
            console.log('Trying fetchKeys with minimal transaction...');
            const keys = await sealClient.fetchKeys({
                ids: [userAddress.replace('0x', '')],
                sessionKey,
                txBytes: dummyTx,
                threshold: 2,
            });
            console.log('✅ fetchKeys successful!');
            console.log('Keys returned:', keys);
        }
        catch (error) {
            console.log('fetchKeys failed:', error.message);
            console.log('Error type:', error.constructor.name);
        }
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    testSealDecryptOnly().catch(console.error);
}
//# sourceMappingURL=test-seal-decrypt-only.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugSealTransactions = debugSealTransactions;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const utils_1 = require("@mysten/sui/utils");
const transactions_1 = require("@mysten/sui/transactions");
async function debugSealTransactions() {
    console.log('===============================================');
    console.log('SEAL Transaction Requirements Debug');
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
        console.log('\n1. Encrypting test data...');
        const testData = new TextEncoder().encode('Test data for transaction debugging');
        const identityBytes = new TextEncoder().encode(userAddress);
        const id = (0, utils_1.toHEX)(identityBytes);
        const { encryptedObject, key: backupKey } = await sealClient.encrypt({
            threshold: 2,
            packageId: SEAL_PACKAGE_ID,
            id: id,
            data: testData,
        });
        console.log('✓ Encrypted successfully');
        console.log('  Encrypted size:', encryptedObject.length);
        console.log('\n2. Creating session key...');
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        const message = sessionKey.getPersonalMessage();
        const { signature } = await keypair.signPersonalMessage(message);
        sessionKey.setPersonalMessageSignature(signature);
        console.log('✓ Session key created and signed');
        console.log('\n3. Testing different transaction types...');
        const transactionTests = [
            {
                name: 'Split coin transaction',
                build: async () => {
                    const tx = new transactions_1.Transaction();
                    tx.splitCoins(tx.gas, [1000]);
                    return tx;
                }
            },
            {
                name: 'Merge coins transaction',
                build: async () => {
                    const tx = new transactions_1.Transaction();
                    const coin = tx.splitCoins(tx.gas, [1]);
                    tx.mergeCoins(tx.gas, [coin]);
                    return tx;
                }
            },
            {
                name: 'Move call to clock',
                build: async () => {
                    const tx = new transactions_1.Transaction();
                    tx.moveCall({
                        target: '0x2::clock::timestamp_ms',
                        arguments: [tx.object('0x6')],
                    });
                    return tx;
                }
            },
            {
                name: 'Create vector',
                build: async () => {
                    const tx = new transactions_1.Transaction();
                    tx.makeMoveVec({ elements: [] });
                    return tx;
                }
            },
            {
                name: 'Pure value transaction',
                build: async () => {
                    const tx = new transactions_1.Transaction();
                    tx.pure.u64(12345);
                    return tx;
                }
            },
        ];
        for (const test of transactionTests) {
            console.log(`\n  Testing: ${test.name}`);
            try {
                const tx = await test.build();
                const txBytes = await tx.build({
                    client: suiClient,
                    onlyTransactionKind: true
                });
                console.log(`    Transaction size: ${txBytes.length} bytes`);
                console.log(`    Transaction (hex): ${(0, utils_1.toHEX)(txBytes).substring(0, 50)}...`);
                const decryptedBytes = await sealClient.decrypt({
                    data: encryptedObject,
                    sessionKey,
                    txBytes,
                });
                const decrypted = new TextDecoder().decode(decryptedBytes);
                console.log('    ✅ DECRYPTION SUCCESSFUL!');
                console.log('    Decrypted:', decrypted);
                console.log('\n    Transaction analysis:');
                console.log('    - Type:', test.name);
                console.log('    - Size:', txBytes.length);
                console.log('    - First 20 bytes:', Array.from(txBytes.slice(0, 20)));
                return;
            }
            catch (error) {
                console.log(`    ❌ Failed: ${error.message}`);
                if (error.message.includes('PTB')) {
                    console.log('       (Transaction format issue)');
                }
                else if (error.message.includes('Unprocessable')) {
                    console.log('       (SEAL server rejection)');
                }
            }
        }
        console.log('\n❌ No transaction format worked for decryption');
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    debugSealTransactions().catch(console.error);
}
//# sourceMappingURL=debug-seal-transactions.js.map
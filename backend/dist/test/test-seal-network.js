"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSealNetwork = testSealNetwork;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const utils_1 = require("@mysten/sui/utils");
async function testSealNetwork() {
    console.log('===============================================');
    console.log('SEAL Network and Configuration Test');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const CUSTOM_PACKAGE_ID = '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
    try {
        const networks = ['testnet'];
        for (const network of networks) {
            console.log(`\n=== Testing on ${network} ===`);
            const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
            const keyServers = (0, seal_1.getAllowlistedKeyServers)(network);
            console.log(`Key servers for ${network}:`, keyServers);
            console.log(`Number of key servers: ${keyServers.length}`);
            console.log(`\nChecking SEAL package on ${network}...`);
            try {
                const sealPackage = await suiClient.getObject({
                    id: SEAL_PACKAGE_ID,
                    options: { showType: true, showContent: true }
                });
                console.log('SEAL package exists:', sealPackage.data ? '✓' : '✗');
                if (sealPackage.data) {
                    console.log('Package type:', sealPackage.data.type);
                }
            }
            catch (error) {
                console.log('Failed to fetch SEAL package:', error.message);
            }
            console.log(`\nChecking custom package on ${network}...`);
            try {
                const customPackage = await suiClient.getObject({
                    id: CUSTOM_PACKAGE_ID,
                    options: { showType: true, showContent: true }
                });
                console.log('Custom package exists:', customPackage.data ? '✓' : '✗');
                if (customPackage.data) {
                    console.log('Package type:', customPackage.data.type);
                }
            }
            catch (error) {
                console.log('Failed to fetch custom package:', error.message);
            }
            console.log(`\n\nTesting SEAL flow on ${network}...`);
            const sealClient = new seal_1.SealClient({
                suiClient,
                serverConfigs: keyServers.map((id) => ({
                    objectId: id,
                    weight: 1,
                })),
            });
            const keypair = new ed25519_1.Ed25519Keypair();
            const address = keypair.getPublicKey().toSuiAddress();
            console.log('Test address:', address);
            console.log('\n1. Testing encryption...');
            const testData = new TextEncoder().encode(`Test on ${network}`);
            const packageIdBytes = (0, utils_1.fromHEX)(SEAL_PACKAGE_ID);
            const addressBytes = (0, utils_1.fromHEX)(address);
            const identity = new Uint8Array(packageIdBytes.length + addressBytes.length);
            identity.set(packageIdBytes, 0);
            identity.set(addressBytes, packageIdBytes.length);
            const identityHex = (0, utils_1.toHEX)(identity);
            try {
                const { encryptedObject, key: backupKey } = await sealClient.encrypt({
                    threshold: 2,
                    packageId: SEAL_PACKAGE_ID,
                    id: identityHex,
                    data: testData,
                });
                console.log('   ✓ Encryption successful');
                console.log('   Encrypted size:', encryptedObject.length);
                console.log('\n2. Testing SessionKey...');
                const sessionKey = new seal_1.SessionKey({
                    address: address,
                    packageId: SEAL_PACKAGE_ID,
                    ttlMin: 30,
                    suiClient: suiClient,
                });
                const message = sessionKey.getPersonalMessage();
                console.log('   Personal message obtained');
                console.log('   Message preview:', Buffer.from(message).toString('utf8').substring(0, 100) + '...');
                const messageStr = Buffer.from(message).toString('utf8');
                console.log('   Contains package ID:', messageStr.includes(SEAL_PACKAGE_ID));
                console.log('   Contains "testnet":', messageStr.includes('testnet'));
                console.log('   Contains address:', messageStr.includes(address));
                const { signature } = await keypair.signPersonalMessage(message);
                console.log('\n3. Signature created');
                try {
                    sessionKey.setPersonalMessageSignature(signature);
                    console.log('   ✓ Signature set successfully');
                    const exported = sessionKey.export();
                    console.log('\n4. Exported SessionKey:');
                    console.log('   Address matches:', exported.address === address);
                    console.log('   Exported keys:', Object.keys(exported));
                    console.log('   Exported data:', JSON.stringify(exported, null, 2));
                }
                catch (error) {
                    console.log('   ✗ Failed to set signature:', error.message);
                }
            }
            catch (error) {
                console.log('   ✗ Encryption failed:', error.message);
            }
        }
    }
    catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    testSealNetwork().catch(console.error);
}
//# sourceMappingURL=test-seal-network.js.map
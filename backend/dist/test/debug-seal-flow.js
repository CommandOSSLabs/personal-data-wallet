"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugSealFlow = debugSealFlow;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const utils_1 = require("@mysten/sui/utils");
const transactions_1 = require("@mysten/sui/transactions");
async function debugSealFlow() {
    console.log('===============================================');
    console.log('Debugging Complete SEAL Flow');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const CUSTOM_PACKAGE_ID = '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
    const userKeypair = new ed25519_1.Ed25519Keypair();
    const userAddress = userKeypair.getPublicKey().toSuiAddress();
    const appKeypair = new ed25519_1.Ed25519Keypair();
    const appAddress = appKeypair.getPublicKey().toSuiAddress();
    console.log('User Address:', userAddress);
    console.log('App Address:', appAddress);
    console.log('');
    try {
        const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
        const sealClient = new seal_1.SealClient({
            suiClient,
            serverConfigs: (0, seal_1.getAllowlistedKeyServers)('testnet').map((id) => ({
                objectId: id,
                weight: 1,
            })),
        });
        console.log('1. Creating identity for app-based encryption...');
        const identityString = `app:${userAddress}:${appAddress}`;
        const packageIdBytes = (0, utils_1.fromHEX)(SEAL_PACKAGE_ID);
        const identityBytes = new TextEncoder().encode(identityString);
        const fullIdentity = new Uint8Array(packageIdBytes.length + identityBytes.length);
        fullIdentity.set(packageIdBytes, 0);
        fullIdentity.set(identityBytes, packageIdBytes.length);
        const identityHex = (0, utils_1.toHEX)(fullIdentity);
        console.log('   Identity string:', identityString);
        console.log('   Identity hex:', identityHex);
        console.log('\n2. Encrypting data...');
        const testData = 'Secret data for app access';
        const dataBytes = new TextEncoder().encode(testData);
        const { encryptedObject, key: backupKey } = await sealClient.encrypt({
            threshold: 2,
            packageId: SEAL_PACKAGE_ID,
            id: identityHex,
            data: dataBytes,
        });
        console.log('   ✓ Data encrypted');
        console.log('   Encrypted size:', encryptedObject.length, 'bytes');
        console.log('   Backup key:', (0, utils_1.toHEX)(backupKey));
        console.log('\n3. Creating SessionKey for app...');
        const sessionKey = new seal_1.SessionKey({
            address: appAddress,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 10,
            suiClient: suiClient,
        });
        const message = sessionKey.getPersonalMessage();
        console.log('   Personal message length:', message.length);
        console.log('   Personal message (hex):', Buffer.from(message).toString('hex'));
        console.log('\n4. App signing personal message...');
        const { signature } = await appKeypair.signPersonalMessage(message);
        console.log('   ✓ Message signed');
        console.log('   Signature:', signature);
        console.log('\n5. Setting signature on SessionKey...');
        try {
            sessionKey.setPersonalMessageSignature(signature);
            console.log('   ✓ Signature set successfully');
        }
        catch (error) {
            console.log('   ✗ Failed to set signature:', error.message);
            return;
        }
        console.log('\n6. Building transaction for seal_approve_app...');
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${CUSTOM_PACKAGE_ID}::seal_access_control::seal_approve_app`,
            arguments: [
                tx.pure.vector("u8", (0, utils_1.fromHEX)(identityHex)),
                tx.pure.address(appAddress),
            ],
        });
        const txBytes = await tx.build({
            client: suiClient,
            onlyTransactionKind: true
        });
        console.log('   ✓ Transaction built');
        console.log('   Transaction bytes length:', txBytes.length);
        console.log('\n7. Attempting to decrypt...');
        try {
            const decryptedBytes = await sealClient.decrypt({
                data: encryptedObject,
                sessionKey,
                txBytes,
            });
            const decryptedText = new TextDecoder().decode(decryptedBytes);
            console.log('   ✓ Decryption successful!');
            console.log('   Decrypted text:', decryptedText);
        }
        catch (error) {
            console.log('   ✗ Decryption failed:', error.message);
            console.log('   Error stack:', error.stack);
        }
        console.log('\n8. Testing with fresh SessionKey (simulating API flow)...');
        const sessionKey2 = new seal_1.SessionKey({
            address: appAddress,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 10,
            suiClient: suiClient,
        });
        const message2 = sessionKey2.getPersonalMessage();
        const { signature: signature2 } = await appKeypair.signPersonalMessage(message2);
        console.log('   Messages match:', Buffer.from(message).equals(Buffer.from(message2)));
        console.log('   Signatures match:', signature === signature2);
        try {
            sessionKey2.setPersonalMessageSignature(signature2);
            console.log('   ✓ Signature set on fresh SessionKey');
            const decryptedBytes2 = await sealClient.decrypt({
                data: encryptedObject,
                sessionKey: sessionKey2,
                txBytes,
            });
            console.log('   ✓ Decryption with fresh SessionKey successful!');
        }
        catch (error) {
            console.log('   ✗ Fresh SessionKey decrypt failed:', error.message);
        }
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    debugSealFlow().catch(console.error);
}
//# sourceMappingURL=debug-seal-flow.js.map
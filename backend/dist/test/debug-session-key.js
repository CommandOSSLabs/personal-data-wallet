"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugSessionKey = debugSessionKey;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
async function debugSessionKey() {
    console.log('===============================================');
    console.log('Debugging SessionKey Signature Issue');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const TEST_ADDRESS = '0x6d276b258eac409de9aa6be1da445bbb0b7eaff87f39639b08cd8fcc1c501456';
    const keypair = new ed25519_1.Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    console.log('Test Address:', address);
    console.log('');
    try {
        console.log('1. Creating SessionKey...');
        const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
        console.log('   - Using string packageId');
        const sessionKey = new seal_1.SessionKey({
            address: address,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 10,
            suiClient: suiClient,
        });
        console.log('   ✓ SessionKey created successfully');
        console.log('\n2. Getting personal message...');
        const message = sessionKey.getPersonalMessage();
        console.log('   Message length:', message.length, 'bytes');
        console.log('   Message (hex):', Buffer.from(message).toString('hex'));
        console.log('\n3. Signing personal message...');
        const { signature } = await keypair.signPersonalMessage(message);
        console.log('   ✓ Message signed');
        console.log('   Signature:', signature);
        console.log('\n4. Setting signature on SessionKey...');
        try {
            sessionKey.setPersonalMessageSignature(signature);
            console.log('   ✓ Signature set successfully!');
        }
        catch (error) {
            console.log('   ✗ Failed to set signature:', error.message);
            console.log('   Error details:', error);
        }
        console.log('\n5. Testing with string packageId...');
        try {
            const sessionKey2 = new seal_1.SessionKey({
                address: address,
                packageId: SEAL_PACKAGE_ID,
                ttlMin: 10,
                suiClient: suiClient,
            });
            console.log('   ✓ SessionKey created with string packageId');
            const message2 = sessionKey2.getPersonalMessage();
            const { signature: signature2 } = await keypair.signPersonalMessage(message2);
            sessionKey2.setPersonalMessageSignature(signature2);
            console.log('   ✓ Signature set successfully with string packageId!');
        }
        catch (error) {
            console.log('   ✗ Error with string packageId:', error.message);
        }
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    debugSessionKey().catch(console.error);
}
//# sourceMappingURL=debug-session-key.js.map
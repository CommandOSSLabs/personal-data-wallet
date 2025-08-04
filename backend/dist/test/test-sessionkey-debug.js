"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSessionKeyDebug = testSessionKeyDebug;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
async function testSessionKeyDebug() {
    console.log('===============================================');
    console.log('SessionKey Debug Test');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
    const keypair = new ed25519_1.Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    console.log('Test Address:', address);
    console.log('');
    try {
        console.log('1. Creating SessionKey and inspecting it...');
        const sessionKey = new seal_1.SessionKey({
            address: address,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        console.log('   SessionKey type:', typeof sessionKey);
        console.log('   SessionKey constructor:', sessionKey.constructor.name);
        console.log('   SessionKey properties:', Object.keys(sessionKey));
        console.log('   SessionKey methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(sessionKey)));
        const message = sessionKey.getPersonalMessage();
        console.log('\n2. Personal message obtained');
        console.log('   Length:', message.length);
        const { signature } = await keypair.signPersonalMessage(message);
        console.log('\n3. Message signed');
        console.log('\n4. Inspecting SessionKey before setting signature...');
        const sessionKeyAny = sessionKey;
        console.log('   hasSignature:', sessionKeyAny.hasSignature);
        console.log('   _signature:', sessionKeyAny._signature);
        console.log('   signature:', sessionKeyAny.signature);
        console.log('   personalMessageSignature:', sessionKeyAny.personalMessageSignature);
        console.log('\n5. Setting signature...');
        try {
            sessionKey.setPersonalMessageSignature(signature);
            console.log('   ✓ Signature set successfully');
        }
        catch (error) {
            console.log('   ✗ Failed to set signature:', error.message);
            return;
        }
        console.log('\n6. Inspecting SessionKey after setting signature...');
        console.log('   hasSignature:', sessionKeyAny.hasSignature);
        console.log('   _signature:', sessionKeyAny._signature);
        console.log('   signature:', sessionKeyAny.signature);
        console.log('   personalMessageSignature:', sessionKeyAny.personalMessageSignature);
        console.log('\n7. Checking for getter methods...');
        if (typeof sessionKeyAny.getPersonalMessageSignature === 'function') {
            console.log('   getPersonalMessageSignature exists');
            try {
                const sig = sessionKeyAny.getPersonalMessageSignature();
                console.log('   Retrieved signature:', sig ? 'Present' : 'Not present');
            }
            catch (e) {
                console.log('   Error calling getPersonalMessageSignature:', e.message);
            }
        }
        console.log('\n8. Testing signature persistence...');
        const message2 = sessionKey.getPersonalMessage();
        console.log('   Message still same:', Buffer.from(message).equals(Buffer.from(message2)));
        console.log('\n9. Setting signature again...');
        try {
            sessionKey.setPersonalMessageSignature(signature);
            console.log('   ✓ Signature set again successfully');
        }
        catch (error) {
            console.log('   ✗ Failed to set signature again:', error.message);
        }
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    testSessionKeyDebug().catch(console.error);
}
//# sourceMappingURL=test-sessionkey-debug.js.map
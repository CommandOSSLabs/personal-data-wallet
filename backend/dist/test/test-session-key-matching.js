"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSessionKeyMatching = testSessionKeyMatching;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
async function testSessionKeyMatching() {
    console.log('===============================================');
    console.log('Testing SessionKey Message Matching');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
    const keypair = new ed25519_1.Ed25519Keypair();
    const address = keypair.getPublicKey().toSuiAddress();
    console.log('Test Address:', address);
    console.log('');
    try {
        console.log('1. Creating first SessionKey...');
        const sessionKey1 = new seal_1.SessionKey({
            address: address,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        const message1 = sessionKey1.getPersonalMessage();
        console.log('   Message 1 length:', message1.length);
        console.log('   Message 1 (hex):', Buffer.from(message1).toString('hex'));
        console.log('\n2. Signing message from first SessionKey...');
        const { signature } = await keypair.signPersonalMessage(message1);
        console.log('   Signature:', signature);
        console.log('\n3. Setting signature on first SessionKey...');
        try {
            sessionKey1.setPersonalMessageSignature(signature);
            console.log('   ✓ Signature set successfully on first SessionKey');
        }
        catch (error) {
            console.log('   ✗ Failed to set signature on first SessionKey:', error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('\n4. Creating second SessionKey with same parameters...');
        const sessionKey2 = new seal_1.SessionKey({
            address: address,
            packageId: SEAL_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        const message2 = sessionKey2.getPersonalMessage();
        console.log('   Message 2 length:', message2.length);
        console.log('   Message 2 (hex):', Buffer.from(message2).toString('hex'));
        console.log('\n5. Comparing messages...');
        console.log('   Messages are equal:', Buffer.from(message1).equals(Buffer.from(message2)));
        console.log('   Message 1 substring:', Buffer.from(message1).toString('hex').substring(0, 50));
        console.log('   Message 2 substring:', Buffer.from(message2).toString('hex').substring(0, 50));
        console.log('\n6. Trying to set first signature on second SessionKey...');
        try {
            sessionKey2.setPersonalMessageSignature(signature);
            console.log('   ✓ Signature set successfully on second SessionKey!');
        }
        catch (error) {
            console.log('   ✗ Failed to set signature on second SessionKey:', error.message);
            console.log('\n7. Signing message from second SessionKey...');
            const { signature: signature2 } = await keypair.signPersonalMessage(message2);
            console.log('   Signature 2:', signature2);
            try {
                sessionKey2.setPersonalMessageSignature(signature2);
                console.log('   ✓ Signature 2 set successfully on second SessionKey');
            }
            catch (error2) {
                console.log('   ✗ Failed to set signature 2:', error2.message);
            }
        }
        console.log('\n8. Analyzing message structure...');
        const msg1Str = Buffer.from(message1).toString('utf8');
        const msg2Str = Buffer.from(message2).toString('utf8');
        console.log('   Message 1 preview:', msg1Str.substring(0, 100) + '...');
        console.log('   Message 2 preview:', msg2Str.substring(0, 100) + '...');
        const timestampMatch1 = msg1Str.match(/from ([\d-]+ [\d:]+) UTC/);
        const timestampMatch2 = msg2Str.match(/from ([\d-]+ [\d:]+) UTC/);
        if (timestampMatch1 && timestampMatch2) {
            console.log('   Timestamp 1:', timestampMatch1[1]);
            console.log('   Timestamp 2:', timestampMatch2[1]);
        }
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    testSessionKeyMatching().catch(console.error);
}
//# sourceMappingURL=test-session-key-matching.js.map
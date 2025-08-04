"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSealWithOurPackage = testSealWithOurPackage;
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const utils_1 = require("@mysten/sui/utils");
const transactions_1 = require("@mysten/sui/transactions");
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
dotenv.config({ path: path.join(__dirname, '../../.env') });
async function testSealWithOurPackage() {
    console.log('===============================================');
    console.log('SEAL Test with Our Deployed Package');
    console.log('===============================================\n');
    const OUR_PACKAGE_ID = process.env.SEAL_PACKAGE_ID || '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
    const MODULE_NAME = process.env.SEAL_MODULE_NAME || 'seal_access_control';
    console.log('Our Package ID:', OUR_PACKAGE_ID);
    console.log('Module Name:', MODULE_NAME);
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
        console.log('\nUser Address:', userAddress);
        console.log('\n=== Test 1: Encrypt with Our Package ===');
        const testData = new TextEncoder().encode('Hello from our SEAL package!');
        const identityString = `self:${userAddress}`;
        const identityBytes = new TextEncoder().encode(identityString);
        const id = (0, utils_1.toHEX)(identityBytes);
        console.log('Identity string:', identityString);
        console.log('Identity hex:', id.substring(0, 50) + '...');
        const { encryptedObject, key: backupKey } = await sealClient.encrypt({
            threshold: 2,
            packageId: OUR_PACKAGE_ID,
            id: id,
            data: testData,
        });
        console.log('✓ Encryption successful');
        console.log('  Encrypted size:', encryptedObject.length);
        console.log('  Backup key:', (0, utils_1.toHEX)(backupKey).substring(0, 20) + '...');
        console.log('\n=== Test 2: Create Session Key ===');
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: OUR_PACKAGE_ID,
            ttlMin: 30,
            suiClient: suiClient,
        });
        const message = sessionKey.getPersonalMessage();
        const { signature } = await keypair.signPersonalMessage(message);
        sessionKey.setPersonalMessageSignature(signature);
        console.log('✓ Session key created and signed');
        console.log('\n=== Test 3: Decrypt with seal_approve ===');
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${OUR_PACKAGE_ID}::${MODULE_NAME}::seal_approve`,
            arguments: [
                tx.pure.vector('u8', Array.from(identityBytes))
            ]
        });
        console.log('Building transaction with seal_approve call...');
        const txBytes = await tx.build({
            client: suiClient,
            onlyTransactionKind: true
        });
        console.log('Transaction size:', txBytes.length, 'bytes');
        try {
            const decryptedBytes = await sealClient.decrypt({
                data: encryptedObject,
                sessionKey,
                txBytes,
            });
            const decrypted = new TextDecoder().decode(decryptedBytes);
            console.log('\n✅ DECRYPTION SUCCESSFUL!');
            console.log('Decrypted:', decrypted);
            console.log('\n🎉 SEAL is working with our deployed package!');
        }
        catch (error) {
            console.log('\n❌ Decryption failed:', error.message);
            if (error.message.includes('ENoAccess')) {
                console.log('→ Access denied by seal_approve function');
            }
            else if (error.message.includes('Invalid PTB')) {
                console.log('→ Transaction format issue');
            }
            else if (error.message.includes('not found')) {
                console.log('→ Package or function not found');
            }
        }
        console.log('\n\n=== Test 4: App Access Pattern ===');
        const appAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        const appIdentityString = `app:${userAddress}:${appAddress}`;
        const appIdentityBytes = new TextEncoder().encode(appIdentityString);
        const appId = (0, utils_1.toHEX)(appIdentityBytes);
        console.log('App identity:', appIdentityString);
        const { encryptedObject: appEncrypted } = await sealClient.encrypt({
            threshold: 2,
            packageId: OUR_PACKAGE_ID,
            id: appId,
            data: new TextEncoder().encode('Data accessible by app'),
        });
        console.log('✓ Encrypted with app identity');
        const appTx = new transactions_1.Transaction();
        appTx.moveCall({
            target: `${OUR_PACKAGE_ID}::${MODULE_NAME}::seal_approve_app`,
            arguments: [
                appTx.pure.vector('u8', Array.from(appIdentityBytes)),
                appTx.pure.address(appAddress)
            ]
        });
        const appTxBytes = await appTx.build({
            client: suiClient,
            onlyTransactionKind: true
        });
        try {
            await sealClient.decrypt({
                data: appEncrypted,
                sessionKey,
                txBytes: appTxBytes,
            });
            console.log('✓ App decryption would work (if proper permissions were set)');
        }
        catch (error) {
            console.log('✗ App decryption failed (expected):', error.message);
        }
    }
    catch (error) {
        console.error('\nError:', error.message);
        console.error('Stack:', error.stack);
    }
}
if (require.main === module) {
    testSealWithOurPackage().catch(console.error);
}
//# sourceMappingURL=test-seal-with-our-package.js.map
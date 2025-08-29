#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
async function testSealBasics() {
    console.log('🔐 Testing SEAL Basic Configuration\n');
    console.log('1️⃣ Checking SEAL Environment Variables:');
    const requiredEnvVars = [
        'SEAL_NETWORK',
        'SEAL_PACKAGE_ID',
        'SEAL_MODULE_NAME',
        'SEAL_THRESHOLD'
    ];
    const envStatus = {};
    for (const envVar of requiredEnvVars) {
        const value = process.env[envVar];
        envStatus[envVar] = value || 'NOT_SET';
        console.log(`   ${envVar}: ${value || '❌ NOT SET'}`);
    }
    console.log('');
    console.log('2️⃣ Testing SEAL Package Import:');
    try {
        const { SealClient } = await import('@mysten/seal');
        console.log('   ✅ @mysten/seal package imported successfully');
        console.log(`   📦 Package version: ${require('@mysten/seal/package.json').version}`);
    }
    catch (error) {
        console.log('   ❌ Failed to import @mysten/seal:', error.message);
        return;
    }
    console.log('\n3️⃣ Testing Sui Client:');
    try {
        const { SuiClient, getFullnodeUrl } = await import('@mysten/sui/client');
        const network = process.env.SEAL_NETWORK || 'testnet';
        const rpcUrl = getFullnodeUrl(network);
        const suiClient = new SuiClient({ url: rpcUrl });
        console.log(`   ✅ Sui client created for network: ${network}`);
        console.log(`   📡 RPC URL: ${rpcUrl}`);
        const chainId = await suiClient.getChainIdentifier();
        console.log(`   🔗 Chain ID: ${chainId}`);
    }
    catch (error) {
        console.log('   ❌ Failed to create Sui client:', error.message);
    }
    console.log('\n4️⃣ Testing Package ID validation:');
    const packageId = process.env.SEAL_PACKAGE_ID;
    if (packageId && packageId.startsWith('0x') && packageId.length === 66) {
        console.log('   ✅ Package ID format is valid');
    }
    else {
        console.log('   ❌ Invalid package ID format');
    }
    console.log('\n🎯 Basic SEAL test completed!');
}
testSealBasics().catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
});
//# sourceMappingURL=test-seal-basic.js.map
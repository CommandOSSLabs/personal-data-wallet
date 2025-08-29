#!/usr/bin/env ts-node
/**
 * Basic SEAL Service Test
 * Tests core functionality without complex dependencies
 */

import { config } from 'dotenv';

// Load environment variables
config();

async function testSealBasics() {
  console.log('🔐 Testing SEAL Basic Configuration\n');

  // Test 1: Environment Variables
  console.log('1️⃣ Checking SEAL Environment Variables:');
  const requiredEnvVars = [
    'SEAL_NETWORK',
    'SEAL_PACKAGE_ID', 
    'SEAL_MODULE_NAME',
    'SEAL_THRESHOLD'
  ];

  const envStatus: Record<string, any> = {};
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    envStatus[envVar] = value || 'NOT_SET';
    console.log(`   ${envVar}: ${value || '❌ NOT SET'}`);
  }
  console.log('');

  // Test 2: Package Import
  console.log('2️⃣ Testing SEAL Package Import:');
  try {
    const { SealClient } = await import('@mysten/seal');
    console.log('   ✅ @mysten/seal package imported successfully');
    console.log(`   📦 Package version: ${require('@mysten/seal/package.json').version}`);
  } catch (error) {
    console.log('   ❌ Failed to import @mysten/seal:', error.message);
    return;
  }

  // Test 3: Sui Client
  console.log('\n3️⃣ Testing Sui Client:');
  try {
    const { SuiClient, getFullnodeUrl } = await import('@mysten/sui/client');
    const network = process.env.SEAL_NETWORK || 'testnet';
    const rpcUrl = getFullnodeUrl(network as any);
    const suiClient = new SuiClient({ url: rpcUrl });
    console.log(`   ✅ Sui client created for network: ${network}`);
    console.log(`   📡 RPC URL: ${rpcUrl}`);
    
    // Test basic connectivity
    const chainId = await suiClient.getChainIdentifier();
    console.log(`   🔗 Chain ID: ${chainId}`);
  } catch (error) {
    console.log('   ❌ Failed to create Sui client:', error.message);
  }

  // Test 4: Package validation
  console.log('\n4️⃣ Testing Package ID validation:');
  const packageId = process.env.SEAL_PACKAGE_ID;
  if (packageId && packageId.startsWith('0x') && packageId.length === 66) {
    console.log('   ✅ Package ID format is valid');
  } else {
    console.log('   ❌ Invalid package ID format');
  }

  console.log('\n🎯 Basic SEAL test completed!');
}

// Run the test
testSealBasics().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
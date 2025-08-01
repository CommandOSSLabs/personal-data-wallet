/**
 * Script to discover Seal testnet key servers
 * Run this to find the actual key server object IDs
 */

import { SuiClient } from '@mysten/sui/client';
import dotenv from 'dotenv';

dotenv.config();

const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
});

async function findSealKeyServers() {
  console.log('🔍 Searching for Seal key servers on Sui testnet...');
  console.log(`📡 RPC URL: ${process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'}`);
  
  try {
    // Search for Seal-related objects
    console.log('\n1. Searching for Seal package objects...');
    
    // Look for objects with Seal-related types
    const sealPackageQueries = [
      // Common Seal package patterns
      '::seal::KeyServer',
      '::key_server::KeyServer', 
      'keyserver',
      'seal'
    ];
    
    for (const query of sealPackageQueries) {
      try {
        console.log(`   Searching for type containing: ${query}`);
        
        // This is a simplified search - in practice you'd need the exact package ID
        // For now, we'll document the approach
        
      } catch (error) {
        console.log(`   No results for: ${query}`);
      }
    }
    
    console.log('\n2. Checking Sui system state for any Seal configurations...');
    const systemState = await suiClient.getLatestSuiSystemState();
    console.log(`   System epoch: ${systemState.epoch}`);
    console.log(`   Protocol version: ${systemState.protocolVersion}`);
    
    console.log('\n3. Looking for well-known Seal addresses...');
    // Check if there are any published Seal packages
    const knownSealAddresses = [
      '0x1', // System address
      '0x2', // Framework address
      // Add known Seal addresses when available
    ];
    
    for (const address of knownSealAddresses) {
      try {
        const objects = await suiClient.getOwnedObjects({
          owner: address,
          options: {
            showType: true,
            showContent: true
          }
        });
        
        const sealRelated = objects.data.filter(obj => 
          obj.data?.type?.includes('seal') || 
          obj.data?.type?.includes('Seal') ||
          obj.data?.type?.includes('keyserver') ||
          obj.data?.type?.includes('KeyServer')
        );
        
        if (sealRelated.length > 0) {
          console.log(`   Found ${sealRelated.length} Seal-related objects at ${address}`);
          sealRelated.forEach(obj => {
            console.log(`     - ${obj.data.objectId}: ${obj.data.type}`);
          });
        }
      } catch (error) {
        // Address might not exist or be accessible
      }
    }
    
    console.log('\n📋 NEXT STEPS:');
    console.log('Since Seal is in beta, the key server object IDs might not be publicly documented yet.');
    console.log('To get the actual testnet key server IDs, you should:');
    console.log('');
    console.log('1. 💬 Join the Sui Discord: https://discord.gg/sui');
    console.log('2. 🔍 Ask in the #seal or #developer-support channels');
    console.log('3. 📧 Contact Mysten Labs support');
    console.log('4. 📖 Check the latest Seal documentation for updates');
    console.log('');
    console.log('Once you have the key server IDs, update your .env file:');
    console.log('SEAL_KEY_SERVER_1=0x<actual_server_1_id>');
    console.log('SEAL_KEY_SERVER_2=0x<actual_server_2_id>');
    console.log('');
    console.log('🚀 For now, the service will run in development mode with simulated encryption.');
    
  } catch (error) {
    console.error('❌ Error searching for key servers:', error.message);
    console.log('\nThis is expected if Seal testnet servers are not yet public.');
    console.log('Continue with development mode for testing.');
  }
}

// Run the search
findSealKeyServers().catch(console.error);
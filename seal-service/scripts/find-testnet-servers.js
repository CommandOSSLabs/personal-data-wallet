/**
 * Find existing Seal key servers on Sui testnet
 */

import { SuiClient } from '@mysten/sui/client';
import dotenv from 'dotenv';

dotenv.config();

const suiClient = new SuiClient({
  url: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
});

// Known Seal package ID from documentation
const SEAL_PACKAGE_ID = '0xe3d7e7a08ec189788f24840d27b02fee45cf3afc0fb579d6e3fd8450c5153d26';

async function findTestnetKeyServers() {
  console.log('🔍 Searching for Seal key servers on Sui testnet...');
  console.log(`📡 RPC URL: ${suiClient.connection.fullnode}`);
  console.log(`📦 Package ID: ${SEAL_PACKAGE_ID}`);
  console.log('');

  try {
    // Method 1: Query objects by type
    console.log('1️⃣ Searching for KeyServer objects by type...');
    try {
      const keyServerType = `${SEAL_PACKAGE_ID}::key_server::KeyServer`;
      console.log(`   Type: ${keyServerType}`);
      
      const objects = await suiClient.getOwnedObjects({
        owner: SEAL_PACKAGE_ID,
        options: {
          showType: true,
          showContent: true,
          showOwner: true
        }
      });
      
      console.log(`   Found ${objects.data.length} objects owned by package`);
      
      const keyServers = objects.data.filter(obj => 
        obj.data?.type?.includes('KeyServer')
      );
      
      if (keyServers.length > 0) {
        console.log(`   ✅ Found ${keyServers.length} key servers:`);
        keyServers.forEach((server, i) => {
          console.log(`      ${i + 1}. Object ID: ${server.data.objectId}`);
          console.log(`         Type: ${server.data.type}`);
          console.log(`         Owner: ${server.data.owner}`);
        });
      } else {
        console.log('   ❌ No KeyServer objects found');
      }
      
    } catch (error) {
      console.log(`   ❌ Error querying by type: ${error.message}`);
    }

    // Method 2: Check package objects
    console.log('\n2️⃣ Checking package objects...');
    try {
      const packageObject = await suiClient.getObject({
        id: SEAL_PACKAGE_ID,
        options: {
          showContent: true,
          showType: true
        }
      });
      
      console.log(`   Package exists: ${!!packageObject.data}`);
      if (packageObject.data) {
        console.log(`   Package type: ${packageObject.data.type || 'N/A'}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error checking package: ${error.message}`);
    }

    // Method 3: Search for objects with KeyServer in the type
    console.log('\n3️⃣ Searching all objects for KeyServer type...');
    try {
      // This is a more comprehensive search but may be rate-limited
      const allObjects = await suiClient.queryEvents({
        query: { MoveModule: { package: SEAL_PACKAGE_ID, module: 'key_server' } },
        limit: 50
      });
      
      console.log(`   Found ${allObjects.data.length} events from key_server module`);
      
      // Look for object creation events
      const creationEvents = allObjects.data.filter(event => 
        event.type.includes('Created') || event.type.includes('NewObject')
      );
      
      if (creationEvents.length > 0) {
        console.log(`   ✅ Found ${creationEvents.length} creation events`);
        creationEvents.forEach((event, i) => {
          console.log(`      ${i + 1}. Event: ${event.type}`);
          console.log(`         ID: ${event.id.eventSeq}`);
        });
      }
      
    } catch (error) {
      console.log(`   ❌ Error searching events: ${error.message}`);
    }

    // Method 4: Try common testnet addresses
    console.log('\n4️⃣ Checking known testnet addresses...');
    const testnetAddresses = [
      '0x1',  // System
      '0x2',  // Framework  
      '0x3',  // DeepBook
      // Add other known testnet addresses
    ];
    
    for (const address of testnetAddresses) {
      try {
        const objects = await suiClient.getOwnedObjects({
          owner: address,
          options: { showType: true },
          limit: 10
        });
        
        const sealObjects = objects.data.filter(obj =>
          obj.data?.type?.toLowerCase().includes('seal') ||
          obj.data?.type?.toLowerCase().includes('keyserver')
        );
        
        if (sealObjects.length > 0) {
          console.log(`   ✅ Found Seal objects at ${address}:`);
          sealObjects.forEach(obj => {
            console.log(`      - ${obj.data.objectId}: ${obj.data.type}`);
          });
        }
      } catch (error) {
        // Skip addresses that don't exist
      }
    }

    console.log('\n📋 RESULTS SUMMARY:');
    console.log('==================');
    console.log('If no key servers were found above, this means:');
    console.log('1. 🏗️  Testnet key servers may not be deployed yet');
    console.log('2. 🔒 They might be at different package/object IDs');
    console.log('3. 🚧 Seal testnet infrastructure is still being set up');
    console.log('');
    console.log('📞 NEXT STEPS:');
    console.log('1. Join Sui Discord: https://discord.gg/sui');
    console.log('2. Ask in #seal channel for testnet key server object IDs');
    console.log('3. Check Seal GitHub issues for updates');
    console.log('4. Monitor Sui testnet explorer for new Seal deployments');
    console.log('');
    console.log('🚀 FOR NOW: Continue with development mode');
    console.log('   The service will simulate encryption for testing');

  } catch (error) {
    console.error('❌ Fatal error during search:', error);
  }
}

// Run the search
findTestnetKeyServers().catch(console.error);
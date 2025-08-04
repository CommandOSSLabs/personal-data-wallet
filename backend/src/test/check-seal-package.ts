import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

async function checkSealPackage() {
  console.log('===============================================');
  console.log('SEAL Package Analysis');
  console.log('===============================================\n');

  const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

  try {
    // Get the SEAL package
    console.log('1. Fetching SEAL package...');
    const sealPackage = await suiClient.getObject({
      id: SEAL_PACKAGE_ID,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
        showPreviousTransaction: true,
      }
    });

    if (sealPackage.data) {
      console.log('Package exists:', sealPackage.data.objectId);
      console.log('Type:', sealPackage.data.type);
      console.log('Owner:', sealPackage.data.owner);
    }

    // Get normalized modules
    console.log('\n2. Getting package modules...');
    const modules = await suiClient.getNormalizedMoveModulesByPackage({
      package: SEAL_PACKAGE_ID,
    });

    console.log('Modules found:', Object.keys(modules));

    // Look for seal-related functions
    for (const [moduleName, moduleData] of Object.entries(modules)) {
      console.log(`\n3. Module: ${moduleName}`);
      
      // Check exposed functions
      const exposedFunctions = Object.entries(moduleData.exposedFunctions || {})
        .filter(([name, func]: [string, any]) => func.isEntry)
        .map(([name]) => name);
      
      if (exposedFunctions.length > 0) {
        console.log('   Entry functions:', exposedFunctions);
      }

      // Look for approve-related functions
      const approveFunctions = Object.entries(moduleData.exposedFunctions || {})
        .filter(([name]) => name.includes('approve') || name.includes('decrypt'))
        .map(([name, func]: [string, any]) => ({
          name,
          params: func.parameters,
          isEntry: func.isEntry,
        }));

      if (approveFunctions.length > 0) {
        console.log('   Approve/Decrypt functions:');
        approveFunctions.forEach(f => {
          console.log(`     - ${f.name}: ${f.params.join(', ')} (entry: ${f.isEntry})`);
        });
      }
    }

    // Check if there's a specific pattern for transaction building
    console.log('\n4. Looking for transaction patterns...');
    
    // Try to find events related to SEAL
    const events = await suiClient.queryEvents({
      query: {
        MoveModule: {
          package: SEAL_PACKAGE_ID,
          module: 'seal', // Guessing module name
        }
      },
      limit: 5,
    });

    if (events.data.length > 0) {
      console.log('Recent SEAL events found:', events.data.length);
      events.data.forEach((event, i) => {
        console.log(`   Event ${i + 1}: ${event.type}`);
      });
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run the check
if (require.main === module) {
  checkSealPackage().catch(console.error);
}

export { checkSealPackage };
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function verifyOurPackage() {
  console.log('===============================================');
  console.log('Verify Our Package on Testnet');
  console.log('===============================================\n');

  const OUR_PACKAGE_ID = process.env.SEAL_PACKAGE_ID || '0x8052a08c703d3a741cd8b6b13192bec8052ff94b536956085e43f786f652c884';
  
  try {
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    console.log('1. Checking if package exists...');
    console.log('Package ID:', OUR_PACKAGE_ID);
    
    const packageObject = await suiClient.getObject({
      id: OUR_PACKAGE_ID,
      options: {
        showContent: true,
        showType: true,
        showOwner: true,
      }
    });
    
    if (!packageObject.data) {
      console.log('❌ Package NOT found on testnet!');
      console.log('This explains why SEAL servers reject our transactions.');
      return;
    }
    
    console.log('✓ Package exists on testnet');
    console.log('Type:', packageObject.data.type);
    console.log('Owner:', packageObject.data.owner);
    
    // Get modules
    console.log('\n2. Getting package modules...');
    const modules = await suiClient.getNormalizedMoveModulesByPackage({
      package: OUR_PACKAGE_ID,
    });
    
    console.log('Modules found:', Object.keys(modules));
    
    // Check for seal_access_control module
    const sealModule = modules['seal_access_control'];
    if (!sealModule) {
      console.log('❌ seal_access_control module NOT found!');
      return;
    }
    
    console.log('\n3. Checking seal_approve functions...');
    const sealApproveFunctions = Object.entries(sealModule.exposedFunctions || {})
      .filter(([name]) => name.startsWith('seal_approve'))
      .map(([name, func]: [string, any]) => ({
        name,
        isEntry: func.isEntry,
        parameters: func.parameters,
      }));
    
    if (sealApproveFunctions.length === 0) {
      console.log('❌ No seal_approve functions found!');
      return;
    }
    
    console.log('✓ Found seal_approve functions:');
    sealApproveFunctions.forEach(f => {
      console.log(`  - ${f.name} (entry: ${f.isEntry})`);
      console.log(`    Parameters: ${f.parameters.join(', ')}`);
    });
    
    // Check recent transactions
    console.log('\n4. Checking recent transactions...');
    const txs = await suiClient.queryTransactionBlocks({
      filter: {
        InputObject: OUR_PACKAGE_ID
      },
      limit: 5,
    });
    
    console.log(`Found ${txs.data.length} recent transactions involving this package`);
    
    console.log('\n✅ Package verification complete!');
    console.log('\nConclusion:');
    if (packageObject.data && sealModule && sealApproveFunctions.length > 0) {
      console.log('✓ Package is properly deployed with seal_approve functions');
      console.log('✓ Should work with SEAL if registered with SEAL servers');
      console.log('\n⚠️  However, if you\'re getting "Unprocessable Entity" errors, it likely means:');
      console.log('1. The package needs to be registered with SEAL infrastructure');
      console.log('2. Or SEAL servers don\'t recognize this specific package yet');
    }
    
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.message.includes('not found')) {
      console.log('\n❌ Package does not exist on testnet!');
      console.log('You need to deploy the Move package first.');
    }
  }
}

// Run verification
if (require.main === module) {
  verifyOurPackage().catch(console.error);
}

export { verifyOurPackage };
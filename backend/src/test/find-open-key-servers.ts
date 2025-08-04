import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { getAllowlistedKeyServers } from '@mysten/seal';

async function findOpenKeyServers() {
  console.log('===============================================');
  console.log('Finding Open Mode Key Servers');
  console.log('===============================================\n');

  try {
    const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
    
    // Get all allowlisted key servers
    const keyServerIds = getAllowlistedKeyServers('testnet');
    console.log(`Found ${keyServerIds.length} allowlisted key servers on testnet:`);
    
    for (const serverId of keyServerIds) {
      console.log(`\nChecking server: ${serverId}`);
      
      try {
        const serverObject = await suiClient.getObject({
          id: serverId,
          options: {
            showContent: true,
            showType: true,
          }
        });
        
        if (serverObject.data && serverObject.data.content && 'fields' in serverObject.data.content) {
          const fields = serverObject.data.content.fields as any;
          console.log('  Name:', fields.name || 'N/A');
          console.log('  URL:', fields.url || 'N/A');
          
          // Check if we can determine if it's Open mode
          // Note: The mode might not be directly visible in the object
          if (fields.mode) {
            console.log('  Mode:', fields.mode);
          }
        }
      } catch (error: any) {
        console.log('  Error fetching server details:', error.message);
      }
    }
    
    console.log('\n\nNOTE: The allowlisted key servers from Mysten are likely in Closed mode.');
    console.log('For Open mode, you would need to either:');
    console.log('1. Find community-run Open mode key servers');
    console.log('2. Run your own key server in Open mode');
    console.log('3. Use a test/demo package that\'s already allowlisted');
    
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Run the check
if (require.main === module) {
  findOpenKeyServers().catch(console.error);
}

export { findOpenKeyServers };
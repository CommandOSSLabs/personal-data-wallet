"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOpenKeyServers = findOpenKeyServers;
const client_1 = require("@mysten/sui/client");
const seal_1 = require("@mysten/seal");
async function findOpenKeyServers() {
    console.log('===============================================');
    console.log('Finding Open Mode Key Servers');
    console.log('===============================================\n');
    try {
        const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
        const keyServerIds = (0, seal_1.getAllowlistedKeyServers)('testnet');
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
                    const fields = serverObject.data.content.fields;
                    console.log('  Name:', fields.name || 'N/A');
                    console.log('  URL:', fields.url || 'N/A');
                    if (fields.mode) {
                        console.log('  Mode:', fields.mode);
                    }
                }
            }
            catch (error) {
                console.log('  Error fetching server details:', error.message);
            }
        }
        console.log('\n\nNOTE: The allowlisted key servers from Mysten are likely in Closed mode.');
        console.log('For Open mode, you would need to either:');
        console.log('1. Find community-run Open mode key servers');
        console.log('2. Run your own key server in Open mode');
        console.log('3. Use a test/demo package that\'s already allowlisted');
    }
    catch (error) {
        console.error('Error:', error.message);
    }
}
if (require.main === module) {
    findOpenKeyServers().catch(console.error);
}
//# sourceMappingURL=find-open-key-servers.js.map
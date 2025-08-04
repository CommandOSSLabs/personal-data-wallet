"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSealPackage = checkSealPackage;
const client_1 = require("@mysten/sui/client");
async function checkSealPackage() {
    console.log('===============================================');
    console.log('SEAL Package Analysis');
    console.log('===============================================\n');
    const SEAL_PACKAGE_ID = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    const suiClient = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)('testnet') });
    try {
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
        console.log('\n2. Getting package modules...');
        const modules = await suiClient.getNormalizedMoveModulesByPackage({
            package: SEAL_PACKAGE_ID,
        });
        console.log('Modules found:', Object.keys(modules));
        for (const [moduleName, moduleData] of Object.entries(modules)) {
            console.log(`\n3. Module: ${moduleName}`);
            const exposedFunctions = Object.entries(moduleData.exposedFunctions || {})
                .filter(([name, func]) => func.isEntry)
                .map(([name]) => name);
            if (exposedFunctions.length > 0) {
                console.log('   Entry functions:', exposedFunctions);
            }
            const approveFunctions = Object.entries(moduleData.exposedFunctions || {})
                .filter(([name]) => name.includes('approve') || name.includes('decrypt'))
                .map(([name, func]) => ({
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
        console.log('\n4. Looking for transaction patterns...');
        const events = await suiClient.queryEvents({
            query: {
                MoveModule: {
                    package: SEAL_PACKAGE_ID,
                    module: 'seal',
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
    }
    catch (error) {
        console.error('Error:', error.message);
    }
}
if (require.main === module) {
    checkSealPackage().catch(console.error);
}
//# sourceMappingURL=check-seal-package.js.map
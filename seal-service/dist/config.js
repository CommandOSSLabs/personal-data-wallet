/**
 * Configuration management for Seal service
 */
import dotenv from 'dotenv';
dotenv.config();
export const config = {
    port: parseInt(process.env.PORT || '8080'),
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    sui: {
        network: process.env.SUI_NETWORK || 'testnet',
        rpcUrl: process.env.SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
    },
    seal: {
        threshold: parseInt(process.env.SEAL_THRESHOLD || '1'),
        verifyKeyServers: process.env.SEAL_VERIFY_KEY_SERVERS === 'true',
        keyServerIds: [
            process.env.SEAL_KEY_SERVER_1,
            process.env.SEAL_KEY_SERVER_2,
        ].filter(Boolean),
    },
};
// Validation
if (config.seal.keyServerIds.length === 0) {
    console.warn('Warning: No key server IDs configured. Running in development mode.');
    // For development mode, add testnet server IDs
    // For development, use empty array to let Seal SDK use default testnet servers
    config.seal.keyServerIds = [];
    config.seal.threshold = 1; // Set threshold to 1 for development
}
if (config.seal.threshold > config.seal.keyServerIds.length) {
    throw new Error(`Threshold (${config.seal.threshold}) cannot be greater than number of key servers (${config.seal.keyServerIds.length})`);
}
export default config;

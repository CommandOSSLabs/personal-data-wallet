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
// Validation - we'll use real testnet servers via getAllowlistedKeyServers()
console.log('Using real Seal testnet key servers via getAllowlistedKeyServers()');
export default config;

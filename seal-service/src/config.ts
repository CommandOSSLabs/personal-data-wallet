/**
 * Configuration management for Seal service
 */

import dotenv from 'dotenv';
import { SealConfig } from './types.js';

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
    ].filter(Boolean) as string[],
  } as SealConfig,
};

// Validation
if (config.seal.keyServerIds.length === 0) {
  console.warn('Warning: No key server IDs configured. Service will use default testnet servers.');
  // Add default testnet servers when available from Mysten Labs docs
  config.seal.keyServerIds = [
    // These would be actual testnet server object IDs
    // Will be updated when we get access to testnet
  ];
}

if (config.seal.threshold > config.seal.keyServerIds.length) {
  throw new Error(`Threshold (${config.seal.threshold}) cannot be greater than number of key servers (${config.seal.keyServerIds.length})`);
}

export default config;
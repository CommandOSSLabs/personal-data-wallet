/**
 * Seal SDK Configuration for Testnet
 * 
 * This configuration provides the necessary key servers and network settings
 * for Seal Identity-Based Encryption (IBE) on Sui testnet.
 */

export const SEAL_CONFIG = {
  // Sui Network Configuration
  network: 'testnet' as const,
  
  // MystenLabs Key Server Configuration for Testnet (Client Mode)
  keyServers: [
    {
      objectId: process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_1_OBJECT_ID || '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
      weight: 1,
      url: process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_1_URL || 'https://seal-key-server-testnet-1.mystenlabs.com'
    },
    {
      objectId: process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_2_OBJECT_ID || '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
      weight: 1,
      url: process.env.NEXT_PUBLIC_SEAL_KEY_SERVER_2_URL || 'https://seal-key-server-testnet-2.mystenlabs.com'
    }
  ],
  
  // Encryption Configuration
  encryption: {
    // Default encryption algorithm
    algorithm: 'ibe-bls12381',
    
    // Key derivation settings
    keyDerivation: {
      iterations: 100000,
      salt: 'personal-data-wallet-seal'
    }
  },
  
  // Policy Configuration
  policy: {
    // Default NFT types for access control
    defaultNftTypes: [
      'sui::nft::NFT',
      'sui::coin::Coin'
    ],
    
    // Policy description template
    descriptionTemplate: 'Personal Data Wallet Access Policy - {nftType}',
    
    // Maximum policy age before refresh (in milliseconds)
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  // Cache Configuration
  cache: {
    // Enable caching of decrypted data
    enabled: true,
    
    // Cache TTL in milliseconds
    ttl: 60 * 60 * 1000, // 1 hour
    
    // Maximum cache size (number of entries)
    maxSize: 100
  },
  
  // Debug Configuration
  debug: {
    // Enable debug logging in development
    enabled: process.env.NODE_ENV === 'development',
    
    // Log levels: 'error', 'warn', 'info', 'debug'
    logLevel: 'info' as const
  }
} as const;

// Type definitions for configuration
export type SealNetworkConfig = typeof SEAL_CONFIG;
export type KeyServerConfig = typeof SEAL_CONFIG.keyServers[0];
export type EncryptionConfig = typeof SEAL_CONFIG.encryption;
export type PolicyConfig = typeof SEAL_CONFIG.policy;

// Validation functions
export function validateSealConfig(): boolean {
  try {
    // Validate required fields
    if (!SEAL_CONFIG.keyServers || SEAL_CONFIG.keyServers.length === 0) {
      throw new Error('At least one key server is required');
    }
    
    for (const keyServer of SEAL_CONFIG.keyServers) {
      if (!keyServer.objectId) {
        throw new Error('Key server object ID is required');
      }
      if (!keyServer.url) {
        throw new Error('Key server URL is required');
      }
    }
    
    if (!SEAL_CONFIG.network) {
      throw new Error('Network configuration is required');
    }
    
    return true;
  } catch (error) {
    console.error('Seal configuration validation failed:', error);
    return false;
  }
}

// Helper functions
export function getKeyServers(): KeyServerConfig[] {
  return SEAL_CONFIG.keyServers;
}

export function getNetworkConfig(): string {
  return SEAL_CONFIG.network;
}

export function isDebugEnabled(): boolean {
  return SEAL_CONFIG.debug.enabled || process.env.SEAL_DEBUG === 'true';
}
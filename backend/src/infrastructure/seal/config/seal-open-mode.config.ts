/**
 * SEAL Open Mode Configuration
 * 
 * Configuration for running SEAL in open mode where key servers
 * accept decryption requests for any onchain package
 */

export interface SealOpenModeConfig {
  // Network configuration
  network: 'mainnet' | 'testnet' | 'devnet';
  
  // Threshold for encryption/decryption
  threshold: number;
  
  // Session key TTL in minutes
  sessionTtlMin: number;
  
  // Key server configuration
  keyServers: {
    // Use allowlisted servers or custom servers
    useAllowlisted: boolean;
    
    // Custom key server object IDs (if not using allowlisted)
    customServerIds?: string[];
    
    // Whether to verify key servers (false for open mode)
    verifyServers: boolean;
  };
  
  // Sui RPC configuration
  suiRpc: {
    // Custom RPC URL or use default for network
    customUrl?: string;
  };
  
  // Open mode specific settings
  openMode: {
    // Allow any package ID for encryption/decryption
    allowAnyPackage: boolean;
    
    // Log all encryption/decryption operations
    enableDetailedLogging: boolean;
    
    // Cache settings
    cache: {
      // Maximum number of session keys to cache
      maxSessionKeys: number;
      
      // Session key cache TTL in minutes
      sessionKeyCacheTtl: number;
    };
    
    // Rate limiting (optional)
    rateLimiting?: {
      enabled: boolean;
      maxRequestsPerMinute: number;
      maxRequestsPerHour: number;
    };
  };
}

/**
 * Default configuration for SEAL open mode
 */
export const defaultOpenModeConfig: SealOpenModeConfig = {
  network: 'testnet',
  threshold: 2,
  sessionTtlMin: 60,
  
  keyServers: {
    useAllowlisted: true,
    verifyServers: false, // Don't verify in open mode
  },
  
  suiRpc: {
    // Use default RPC for network
  },
  
  openMode: {
    allowAnyPackage: true,
    enableDetailedLogging: true,
    
    cache: {
      maxSessionKeys: 1000,
      sessionKeyCacheTtl: 60,
    },
  },
};

/**
 * Production configuration for SEAL open mode
 */
export const productionOpenModeConfig: SealOpenModeConfig = {
  network: 'mainnet',
  threshold: 3, // Higher threshold for production
  sessionTtlMin: 30, // Shorter TTL for production
  
  keyServers: {
    useAllowlisted: false,
    customServerIds: [
      // Add your production key server IDs here
    ],
    verifyServers: false,
  },
  
  suiRpc: {
    // Add custom RPC URL if needed
  },
  
  openMode: {
    allowAnyPackage: true,
    enableDetailedLogging: false, // Less logging in production
    
    cache: {
      maxSessionKeys: 10000,
      sessionKeyCacheTtl: 30,
    },
    
    rateLimiting: {
      enabled: true,
      maxRequestsPerMinute: 100,
      maxRequestsPerHour: 1000,
    },
  },
};

/**
 * Get configuration based on environment
 */
export function getOpenModeConfig(env: string = 'development'): SealOpenModeConfig {
  switch (env) {
    case 'production':
      return productionOpenModeConfig;
    case 'development':
    case 'test':
    default:
      return defaultOpenModeConfig;
  }
}
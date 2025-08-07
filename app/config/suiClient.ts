import { SuiClient } from '@mysten/sui/client'
import type { SealCompatibleClient } from '@mysten/seal'

// Get SUI network configuration from environment
const getSuiNetworkUrl = (): string => {
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet'
  
  switch (network) {
    case 'mainnet':
      return 'https://fullnode.mainnet.sui.io:443'
    case 'testnet':
      return 'https://fullnode.testnet.sui.io:443'
    case 'devnet':
      return 'https://fullnode.devnet.sui.io:443'
    case 'localnet':
      return 'http://localhost:9000'
    default:
      return 'https://fullnode.testnet.sui.io:443'
  }
}

// Create shared SUI client instance
let sharedSuiClient: SealCompatibleClient | null = null

export function getSuiClient(): SealCompatibleClient {
  if (!sharedSuiClient) {
    const client = new SuiClient({
      url: getSuiNetworkUrl()
    })
    
    // Extend the client to make it Seal-compatible
    sharedSuiClient = client.withExtensions()
  }
  
  return sharedSuiClient
}

export function resetSuiClient(): void {
  sharedSuiClient = null
}

// Export the network configuration
export const SUI_CONFIG = {
  network: process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet',
  packageId: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID,
  url: getSuiNetworkUrl()
}
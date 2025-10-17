/**
 * useMemoryManager - Foundation hook for Personal Data Wallet
 *
 * Creates and maintains a stable ClientMemoryManager instance.
 * Auto-configured from environment variables with optional overrides.
 *
 * @example
 * ```tsx
 * import { useMemoryManager } from 'personal-data-wallet-sdk/hooks';
 * import { useCurrentAccount } from '@mysten/dapp-kit';
 *
 * function MyComponent() {
 *   const account = useCurrentAccount();
 *   const manager = useMemoryManager({
 *     packageId: process.env.NEXT_PUBLIC_PACKAGE_ID
 *   });
 *
 *   if (!manager) return <div>Connect wallet to continue</div>;
 *
 *   return <div>Manager ready!</div>;
 * }
 * ```
 */
import { ClientMemoryManager } from '../client/ClientMemoryManager';
import type { MemoryManagerConfig } from './utils/types';
export type { MemoryManagerConfig };
/**
 * Initialize and provide access to ClientMemoryManager instance
 *
 * @param config - Optional configuration (uses env vars as defaults)
 * @returns ClientMemoryManager instance or null if wallet not connected
 */
export declare function useMemoryManager(config?: MemoryManagerConfig): ClientMemoryManager | null;
export default useMemoryManager;
//# sourceMappingURL=useMemoryManager.d.ts.map
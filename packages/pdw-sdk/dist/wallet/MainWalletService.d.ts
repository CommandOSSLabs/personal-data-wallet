/**
 * MainWalletService - Core wallet identity and key management
 *
 * Manages the primary wallet identity for users, including:
 * - Wallet creation and metadata management
 * - Context ID derivation for app isolation
 * - SEAL key rotation and session management
 * - On-chain wallet registry integration
 */
import { SuiClient } from '@mysten/sui/client';
import { MainWallet, CreateMainWalletOptions, DeriveContextIdOptions, RotateKeysOptions, RotateKeysResult } from '../types/wallet';
/**
 * Configuration for MainWalletService
 */
export interface MainWalletServiceConfig {
    /** Sui client instance */
    suiClient: SuiClient;
    /** Package ID for Move contracts */
    packageId: string;
}
/**
 * MainWalletService handles core wallet identity management
 */
export declare class MainWalletService {
    private suiClient;
    private packageId;
    constructor(config: MainWalletServiceConfig);
    /**
     * Get main wallet metadata for a user
     * @param userAddress - User's Sui address
     * @returns MainWallet metadata or null if not found
     */
    getMainWallet(userAddress: string): Promise<MainWallet | null>;
    /**
     * Create a new main wallet for a user
     * @param options - Creation options
     * @returns Created MainWallet metadata
     */
    createMainWallet(options: CreateMainWalletOptions): Promise<MainWallet>;
    /**
     * Derive a deterministic context ID for app isolation
     * @param options - Derivation options
     * @returns Deterministic context ID
     */
    deriveContextId(options: DeriveContextIdOptions): Promise<string>;
    /**
     * Rotate SEAL session and backup keys for a user
     * @param options - Rotation options
     * @returns Result of key rotation
     */
    rotateKeys(options: RotateKeysOptions): Promise<RotateKeysResult>;
    /**
     * Check if a main wallet exists for a user
     * @param userAddress - User's Sui address
     * @returns True if main wallet exists
     */
    hasMainWallet(userAddress: string): Promise<boolean>;
    /**
     * Generate a cryptographically secure salt
     * @returns Random salt as hex string
     */
    private generateSalt;
    /**
     * Validate a user address format
     * @param address - Address to validate
     * @returns True if valid Sui address format
     */
    private isValidSuiAddress;
    /**
     * Get main wallet with validation
     * @param userAddress - User's Sui address
     * @returns MainWallet metadata
     * @throws Error if wallet not found or address invalid
     */
    getMainWalletRequired(userAddress: string): Promise<MainWallet>;
    /**
     * Create main wallet if it doesn't exist
     * @param userAddress - User's Sui address
     * @returns Existing or newly created MainWallet
     */
    ensureMainWallet(userAddress: string): Promise<MainWallet>;
}
//# sourceMappingURL=MainWalletService.d.ts.map
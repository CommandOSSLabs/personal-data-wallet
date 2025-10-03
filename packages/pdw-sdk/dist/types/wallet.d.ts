/**
 * Wallet Architecture Types for Personal Data Wallet SDK
 *
 * Defines the TypeScript interfaces for the wallet system including:
 * - Main wallet (per user identity)
 * - Context wallets (per app per user)
 * - Access control and permissions
 * - Cross-app consent and grants
 */
/**
 * Main wallet represents a user's primary identity anchor
 * Contains derivation salts and key management metadata
 */
export interface MainWallet {
    /** Sui address of the wallet owner */
    owner: string;
    /** Unique identifier for this main wallet */
    walletId: string;
    /** Timestamp when wallet was created */
    createdAt: number;
    /** Cryptographic salts for key derivation */
    salts: {
        /** Salt used for deriving context IDs */
        context: string;
    };
}
/**
 * Context wallet represents an app-scoped data container
 * Stored as dynamic field on MainWallet for easy lookup
 * Provides isolation between different applications
 */
export interface ContextWallet {
    /** Sui object ID of the ContextWallet */
    id: string;
    /** Application ID that owns this context */
    appId: string;
    /** Deterministic context ID (sha3_256 hash) */
    contextId: string;
    /** Sui address of the wallet owner */
    owner: string;
    /** Parent MainWallet object ID */
    mainWalletId: string;
    /** Optional reference to access control policy */
    policyRef?: string;
    /** Timestamp when context was created */
    createdAt: number;
    /** Granted permissions for this context */
    permissions: string[];
}
/**
 * Combined view of derived context information
 * Includes both the deterministic hash ID and the actual Sui object address
 */
export interface DerivedContext {
    /** Deterministic context ID (sha3_256 hash) - used for SEAL keys, tags */
    contextId: string;
    /** Application identifier */
    appId: string;
    /** Actual Sui object address (if context wallet has been created on-chain) */
    objectAddress?: string;
    /** Whether the context wallet exists on-chain */
    exists: boolean;
}
/**
 * Request for user consent to access data across contexts
 * Used in OAuth-style permission flow
 */
export interface ConsentRequest {
    /** Application requesting access */
    requesterAppId: string;
    /** Specific permission scopes being requested */
    targetScopes: string[];
    /** Human-readable purpose for the access request */
    purpose: string;
    /** Optional expiration timestamp for the request */
    expiresAt?: number;
}
/**
 * Granted access permission from user to app
 * Stored on-chain and mirrored in Walrus for quick lookups
 */
export interface AccessGrant {
    /** Unique grant identifier */
    id: string;
    /** Context ID that access is granted to */
    contextId: string;
    /** Application that is granted access */
    granteeAppId: string;
    /** Specific permission scopes granted */
    scopes: string[];
    /** Expiration timestamp for this grant */
    expiresAt?: number;
}
/**
 * Options for creating a new main wallet
 */
export interface CreateMainWalletOptions {
    /** User's Sui address */
    userAddress: string;
    /** Optional custom salts (will be generated if not provided) */
    salts?: {
        context?: string;
    };
}
/**
 * Options for creating a new context wallet
 */
export interface CreateContextWalletOptions {
    /** Application identifier */
    appId: string;
    /** Optional policy reference for access control */
    policyRef?: string;
    /** Optional metadata for the context */
    metadata?: Record<string, any>;
}
/**
 * Options for deriving a context ID
 */
export interface DeriveContextIdOptions {
    /** User's Sui address */
    userAddress: string;
    /** Application identifier */
    appId: string;
    /** Optional custom salt (uses main wallet salt if not provided) */
    salt?: string;
}
/**
 * Options for key rotation
 */
export interface RotateKeysOptions {
    /** User's Sui address */
    userAddress: string;
    /** Optional TTL for new session key in minutes */
    sessionKeyTtlMin?: number;
}
/**
 * Result of key rotation operation
 */
export interface RotateKeysResult {
    /** New session key identifier */
    sessionKeyId: string;
    /** Expiration timestamp for the new session key */
    expiresAt: number;
    /** Whether backup key was also rotated */
    backupKeyRotated: boolean;
}
/**
 * Permission scope constants for OAuth-style access control
 */
export declare const PermissionScopes: {
    /** Can decrypt and read user's memory data */
    readonly READ_MEMORIES: "read:memories";
    /** Can create/modify memory entries */
    readonly WRITE_MEMORIES: "write:memories";
    /** Can access user settings/preferences */
    readonly READ_PREFERENCES: "read:preferences";
    /** Can modify user settings */
    readonly WRITE_PREFERENCES: "write:preferences";
    /** Can list user's app contexts */
    readonly READ_CONTEXTS: "read:contexts";
    /** Can create new contexts for user */
    readonly WRITE_CONTEXTS: "write:contexts";
};
/**
 * Type for permission scope values
 */
export type PermissionScope = typeof PermissionScopes[keyof typeof PermissionScopes];
/**
 * Options for requesting consent
 */
export interface RequestConsentOptions {
    /** Application requesting access */
    appId: string;
    /** Permission scopes being requested */
    scopes: PermissionScope[];
    /** Human-readable purpose */
    purpose: string;
    /** Optional expiration in milliseconds from now */
    expiresIn?: number;
}
/**
 * Options for granting permissions
 */
export interface GrantPermissionsOptions {
    /** Context ID to grant access to */
    contextId: string;
    /** Application receiving access */
    recipientAppId: string;
    /** Permission scopes to grant */
    scopes: PermissionScope[];
    /** Optional expiration timestamp */
    expiresAt?: number;
}
/**
 * Options for revoking permissions
 */
export interface RevokePermissionsOptions {
    /** Grant ID to revoke */
    grantId: string;
}
/**
 * Options for aggregated queries across contexts
 */
export interface AggregatedQueryOptions {
    /** App contexts to query (must have permissions) */
    apps: string[];
    /** User address for permission validation */
    userAddress: string;
    /** Search query */
    query: string;
    /** Required permission scope */
    scope: PermissionScope;
    /** Optional result limit */
    limit?: number;
}
//# sourceMappingURL=wallet.d.ts.map
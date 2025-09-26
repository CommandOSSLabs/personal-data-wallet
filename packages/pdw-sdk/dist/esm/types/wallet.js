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
 * Permission scope constants for OAuth-style access control
 */
export const PermissionScopes = {
    /** Can decrypt and read user's memory data */
    READ_MEMORIES: 'read:memories',
    /** Can create/modify memory entries */
    WRITE_MEMORIES: 'write:memories',
    /** Can access user settings/preferences */
    READ_PREFERENCES: 'read:preferences',
    /** Can modify user settings */
    WRITE_PREFERENCES: 'write:preferences',
    /** Can list user's app contexts */
    READ_CONTEXTS: 'read:contexts',
    /** Can create new contexts for user */
    WRITE_CONTEXTS: 'write:contexts',
};
//# sourceMappingURL=wallet.js.map
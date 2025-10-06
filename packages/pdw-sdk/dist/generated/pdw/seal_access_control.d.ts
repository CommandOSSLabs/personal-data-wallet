/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, type RawTransactionArgument } from '../utils/index.js';
import { type Transaction } from '@mysten/sui/transactions';
export declare const RegistryCreated: MoveStruct<{
    registry_id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    creator: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::RegistryCreated">;
export declare const ContentRegistered: MoveStruct<{
    content_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::seal_access_control::ContentRegistered">;
export declare const AccessChanged: MoveStruct<{
    content_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    recipient: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    access_level: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    granted: import("@mysten/sui/bcs").BcsType<boolean, boolean, "bool">;
    expires_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::AccessChanged">;
export declare const ContextRegistered: MoveStruct<{
    context_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    app_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::seal_access_control::ContextRegistered">;
export declare const CrossContextAccessChanged: MoveStruct<{
    source_context_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    requesting_app_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    access_level: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    granted: import("@mysten/sui/bcs").BcsType<boolean, boolean, "bool">;
    expires_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::CrossContextAccessChanged">;
export declare const ContextWalletRegistered: MoveStruct<{
    main_wallet: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    context_wallet: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    derivation_index: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    scope_hint: import("@mysten/sui/bcs").BcsType<string | null, string | null | undefined, "Option<string>">;
    timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::seal_access_control::ContextWalletRegistered">;
export declare const WalletAllowlistChanged: MoveStruct<{
    requester_wallet: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    target_wallet: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    scope: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    access_level: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    granted: import("@mysten/sui/bcs").BcsType<boolean, boolean, "bool">;
    expires_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::WalletAllowlistChanged">;
export declare const AccessRegistry: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    /** Maps content_id -> owner address */
    owners: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps (content_id, user_address) -> AccessPermission */
    permissions: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps context_id -> owner address (for context-level ownership) */
    context_owners: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps (context_id, app_id) -> AccessPermission (for cross-context access) */
    context_permissions: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps context wallet address -> metadata */
    context_wallets: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps content_id -> context wallet address (wallet-based contexts) */
    content_contexts: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps (requester_wallet, target_wallet, scope) -> WalletAllowlistEntry */
    wallet_allowlist: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
}, "@local-pkg/pdw::seal_access_control::AccessRegistry">;
export declare const AccessPermission: MoveStruct<{
    access_level: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    granted_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    expires_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::AccessPermission">;
export declare const ContextWalletInfo: MoveStruct<{
    main_wallet: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    derivation_index: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    registered_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    app_hint: import("@mysten/sui/bcs").BcsType<string | null, string | null | undefined, "Option<string>">;
}, "@local-pkg/pdw::seal_access_control::ContextWalletInfo">;
export declare const WalletAllowlistEntry: MoveStruct<{
    scope: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    access_level: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    granted_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    expires_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::WalletAllowlistEntry">;
export declare const AccessLog: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    content_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    requester: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    access_type: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    success: import("@mysten/sui/bcs").BcsType<boolean, boolean, "bool">;
}, "@local-pkg/pdw::seal_access_control::AccessLog">;
export interface SealApproveArguments {
    id: RawTransactionArgument<number[]>;
    requestingWallet: RawTransactionArgument<string>;
    registry: RawTransactionArgument<string>;
}
export interface SealApproveOptions {
    package?: string;
    arguments: SealApproveArguments | [
        id: RawTransactionArgument<number[]>,
        requestingWallet: RawTransactionArgument<string>,
        registry: RawTransactionArgument<string>
    ];
}
/**
 * SEAL-compliant access approval function with cross-context support Must be entry
 * function that aborts on access denial (per SEAL requirements)
 *
 * Flow:
 *
 * 1.  User owns all data (verified via tx_context::sender)
 * 2.  Apps can access their own context without permission
 * 3.  Apps need explicit permission to access other contexts
 *
 * @param id: Content identifier (SEAL key ID) @param requesting_app_id: App
 * requesting access (must match actual calling app) @param registry: Access
 * control registry @param clock: Clock for timestamp validation @param ctx:
 * Transaction context
 */
export declare function sealApprove(options: SealApproveOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RegisterContentArguments {
    registry: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
}
export interface RegisterContentOptions {
    package?: string;
    arguments: RegisterContentArguments | [
        registry: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>
    ];
}
/**
 * Register encrypted content with an owner Emits ContentRegistered event for
 * tracking
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * content_id: Unique identifier for the content being registered @param clock:
 * Reference to the global clock for timestamp @param ctx: Transaction context
 */
export declare function registerContent(options: RegisterContentOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RegisterContentV2Arguments {
    registry: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
    contextWallet: RawTransactionArgument<string>;
}
export interface RegisterContentV2Options {
    package?: string;
    arguments: RegisterContentV2Arguments | [
        registry: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>,
        contextWallet: RawTransactionArgument<string>
    ];
}
/** Register encrypted content against a context wallet address */
export declare function registerContentV2(options: RegisterContentV2Options): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RegisterContextArguments {
    registry: RawTransactionArgument<string>;
    contextId: RawTransactionArgument<string>;
    appId: RawTransactionArgument<string>;
}
export interface RegisterContextOptions {
    package?: string;
    arguments: RegisterContextArguments | [
        registry: RawTransactionArgument<string>,
        contextId: RawTransactionArgument<string>,
        appId: RawTransactionArgument<string>
    ];
}
/**
 * Register a context wallet for an app Called when an app creates a context wallet
 * for a user
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * context_id: Unique identifier for the context (derived from MainWallet) @param
 * app_id: Application identifier @param clock: Reference to the global clock for
 * timestamp @param ctx: Transaction context
 */
export declare function registerContext(options: RegisterContextOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RegisterContextWalletArguments {
    registry: RawTransactionArgument<string>;
    contextWallet: RawTransactionArgument<string>;
    derivationIndex: RawTransactionArgument<number | bigint>;
    appHint: RawTransactionArgument<string>;
}
export interface RegisterContextWalletOptions {
    package?: string;
    arguments: RegisterContextWalletArguments | [
        registry: RawTransactionArgument<string>,
        contextWallet: RawTransactionArgument<string>,
        derivationIndex: RawTransactionArgument<number | bigint>,
        appHint: RawTransactionArgument<string>
    ];
}
/** Register a hierarchical context wallet that is derived from the main wallet */
export declare function registerContextWallet(options: RegisterContextWalletOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GrantAccessArguments {
    registry: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
    accessLevel: RawTransactionArgument<string>;
    expiresAt: RawTransactionArgument<number | bigint>;
}
export interface GrantAccessOptions {
    package?: string;
    arguments: GrantAccessArguments | [
        registry: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>,
        accessLevel: RawTransactionArgument<string>,
        expiresAt: RawTransactionArgument<number | bigint>
    ];
}
/** Grant access to another user */
export declare function grantAccess(options: GrantAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RevokeAccessArguments {
    registry: RawTransactionArgument<string>;
    recipient: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
}
export interface RevokeAccessOptions {
    package?: string;
    arguments: RevokeAccessArguments | [
        registry: RawTransactionArgument<string>,
        recipient: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>
    ];
}
/** Revoke access from a user */
export declare function revokeAccess(options: RevokeAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GrantCrossContextAccessArguments {
    registry: RawTransactionArgument<string>;
    requestingAppId: RawTransactionArgument<string>;
    sourceContextId: RawTransactionArgument<string>;
    accessLevel: RawTransactionArgument<string>;
    expiresAt: RawTransactionArgument<number | bigint>;
}
export interface GrantCrossContextAccessOptions {
    package?: string;
    arguments: GrantCrossContextAccessArguments | [
        registry: RawTransactionArgument<string>,
        requestingAppId: RawTransactionArgument<string>,
        sourceContextId: RawTransactionArgument<string>,
        accessLevel: RawTransactionArgument<string>,
        expiresAt: RawTransactionArgument<number | bigint>
    ];
}
/**
 * Grant cross-context access: Allow requesting_app to access source_context data
 * User must own the source context
 *
 * Example: User grants Social App permission to read Medical App context
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * requesting_app_id: App that will access the data @param source_context_id:
 * Context being accessed @param access_level: "read" or "write" @param expires_at:
 * Expiration timestamp in milliseconds @param clock: Reference to the global clock
 * @param ctx: Transaction context
 */
export declare function grantCrossContextAccess(options: GrantCrossContextAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RevokeCrossContextAccessArguments {
    registry: RawTransactionArgument<string>;
    requestingAppId: RawTransactionArgument<string>;
    sourceContextId: RawTransactionArgument<string>;
}
export interface RevokeCrossContextAccessOptions {
    package?: string;
    arguments: RevokeCrossContextAccessArguments | [
        registry: RawTransactionArgument<string>,
        requestingAppId: RawTransactionArgument<string>,
        sourceContextId: RawTransactionArgument<string>
    ];
}
/**
 * Revoke cross-context access from an app
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * requesting_app_id: App to revoke access from @param source_context_id: Context
 * to revoke access to @param ctx: Transaction context
 */
export declare function revokeCrossContextAccess(options: RevokeCrossContextAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GrantWalletAllowlistAccessArguments {
    registry: RawTransactionArgument<string>;
    requesterWallet: RawTransactionArgument<string>;
    targetWallet: RawTransactionArgument<string>;
    scope: RawTransactionArgument<string>;
    accessLevel: RawTransactionArgument<string>;
    expiresAt: RawTransactionArgument<number | bigint>;
}
export interface GrantWalletAllowlistAccessOptions {
    package?: string;
    arguments: GrantWalletAllowlistAccessArguments | [
        registry: RawTransactionArgument<string>,
        requesterWallet: RawTransactionArgument<string>,
        targetWallet: RawTransactionArgument<string>,
        scope: RawTransactionArgument<string>,
        accessLevel: RawTransactionArgument<string>,
        expiresAt: RawTransactionArgument<number | bigint>
    ];
}
/** Grant wallet-based allowlist access between two context wallets */
export declare function grantWalletAllowlistAccess(options: GrantWalletAllowlistAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RevokeWalletAllowlistAccessArguments {
    registry: RawTransactionArgument<string>;
    requesterWallet: RawTransactionArgument<string>;
    targetWallet: RawTransactionArgument<string>;
    scope: RawTransactionArgument<string>;
}
export interface RevokeWalletAllowlistAccessOptions {
    package?: string;
    arguments: RevokeWalletAllowlistAccessArguments | [
        registry: RawTransactionArgument<string>,
        requesterWallet: RawTransactionArgument<string>,
        targetWallet: RawTransactionArgument<string>,
        scope: RawTransactionArgument<string>
    ];
}
/** Revoke wallet-based allowlist access */
export declare function revokeWalletAllowlistAccess(options: RevokeWalletAllowlistAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface CheckAccessArguments {
    registry: RawTransactionArgument<string>;
    user: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
}
export interface CheckAccessOptions {
    package?: string;
    arguments: CheckAccessArguments | [
        registry: RawTransactionArgument<string>,
        user: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>
    ];
}
/** Check if a user has access (for off-chain queries) */
export declare function checkAccess(options: CheckAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetPermissionArguments {
    registry: RawTransactionArgument<string>;
    user: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
}
export interface GetPermissionOptions {
    package?: string;
    arguments: GetPermissionArguments | [
        registry: RawTransactionArgument<string>,
        user: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>
    ];
}
/** Get permission details */
export declare function getPermission(options: GetPermissionOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface LogAccessArguments {
    contentId: RawTransactionArgument<string>;
    accessType: RawTransactionArgument<string>;
    success: RawTransactionArgument<boolean>;
}
export interface LogAccessOptions {
    package?: string;
    arguments: LogAccessArguments | [
        contentId: RawTransactionArgument<string>,
        accessType: RawTransactionArgument<string>,
        success: RawTransactionArgument<boolean>
    ];
}
/** Log access attempt (can be called by Seal integration) */
export declare function logAccess(options: LogAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface CleanupExpiredPermissionArguments {
    registry: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
    user: RawTransactionArgument<string>;
}
export interface CleanupExpiredPermissionOptions {
    package?: string;
    arguments: CleanupExpiredPermissionArguments | [
        registry: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>,
        user: RawTransactionArgument<string>
    ];
}
/**
 * Clean up expired permissions for a specific content_id and user This is a
 * maintenance function that can be called by anyone
 */
export declare function cleanupExpiredPermission(options: CleanupExpiredPermissionOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
//# sourceMappingURL=seal_access_control.d.ts.map
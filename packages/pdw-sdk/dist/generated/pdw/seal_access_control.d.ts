/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, type RawTransactionArgument } from '../utils/index.js';
import { type Transaction } from '@mysten/sui/transactions';
export declare const RegistryCreated: MoveStruct<{
    registry_id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    creator: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::RegistryCreated">;
export declare const ContentRegistered: MoveStruct<{
    content_id: import("@mysten/bcs").BcsType<string, string, "string">;
    context_wallet: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    owner: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    timestamp: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::seal_access_control::ContentRegistered">;
export declare const ContextWalletRegistered: MoveStruct<{
    main_wallet: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    context_wallet: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    derivation_index: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    scope_hint: import("@mysten/bcs").BcsType<string | null, string | null | undefined, "Option<string>">;
    timestamp: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::seal_access_control::ContextWalletRegistered">;
export declare const WalletAllowlistChanged: MoveStruct<{
    requester_wallet: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    target_wallet: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    scope: import("@mysten/bcs").BcsType<string, string, "string">;
    access_level: import("@mysten/bcs").BcsType<string, string, "string">;
    granted: import("@mysten/bcs").BcsType<boolean, boolean, "bool">;
    expires_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::WalletAllowlistChanged">;
export declare const AccessRegistry: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    /** Maps context wallet address -> metadata */
    context_wallets: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps content_id -> context wallet address (wallet-based contexts) */
    content_contexts: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
    /** Maps (requester_wallet, target_wallet, scope) -> WalletAllowlistEntry */
    wallet_allowlist: MoveStruct<{
        id: MoveStruct<{
            id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
        }, "0x2::object::UID">;
        size: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    }, "0x2::table::Table">;
}, "@local-pkg/pdw::seal_access_control::AccessRegistry">;
export declare const ContextWalletInfo: MoveStruct<{
    main_wallet: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    derivation_index: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    registered_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    app_hint: import("@mysten/bcs").BcsType<string | null, string | null | undefined, "Option<string>">;
}, "@local-pkg/pdw::seal_access_control::ContextWalletInfo">;
export declare const WalletAllowlistEntry: MoveStruct<{
    scope: import("@mysten/bcs").BcsType<string, string, "string">;
    access_level: import("@mysten/bcs").BcsType<string, string, "string">;
    granted_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    expires_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::WalletAllowlistEntry">;
export declare const AccessLog: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    content_id: import("@mysten/bcs").BcsType<string, string, "string">;
    requester: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    access_type: import("@mysten/bcs").BcsType<string, string, "string">;
    timestamp: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    success: import("@mysten/bcs").BcsType<boolean, boolean, "bool">;
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
 * SEAL-compliant access approval function with wallet-based access control Must be
 * entry function that aborts on access denial (per SEAL requirements)
 *
 * Flow:
 *
 * 1.  Self-access: Owner can always decrypt their own content
 * 2.  Content must be registered to a context wallet
 * 3.  Context wallet owner verification
 * 4.  Same context: If requesting wallet = context wallet, grant access
 * 5.  Wallet allowlist: Check if requester has allowlist permission for read/write
 *     scope
 *
 * @param id: Content identifier (SEAL key ID) @param requesting_wallet: Wallet
 * requesting access @param registry: Access control registry @param clock: Clock
 * for timestamp validation @param ctx: Transaction context
 */
export declare function sealApprove(options: SealApproveOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface RegisterContentArguments {
    registry: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
    contextWallet: RawTransactionArgument<string>;
}
export interface RegisterContentOptions {
    package?: string;
    arguments: RegisterContentArguments | [
        registry: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>,
        contextWallet: RawTransactionArgument<string>
    ];
}
/**
 * Register encrypted content against a context wallet address This is the ONLY way
 * to register content in the wallet-based system
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * content_id: Unique identifier for the content being registered @param
 * context_wallet: The context wallet that owns this content @param clock:
 * Reference to the global clock for timestamp @param ctx: Transaction context
 */
export declare function registerContent(options: RegisterContentOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
/**
 * Register a hierarchical context wallet that is derived from the main wallet
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * context_wallet: Address of the derived context wallet @param derivation_index:
 * Derivation path index used to generate this wallet @param app_hint: Optional
 * hint about which app this context belongs to @param clock: Reference to the
 * global clock for timestamp @param ctx: Transaction context
 */
export declare function registerContextWallet(options: RegisterContextWalletOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
/**
 * Grant wallet-based allowlist access between two context wallets
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * requester_wallet: Wallet that will be granted access @param target_wallet:
 * Wallet whose content will be accessible @param scope: Access scope ("read" or
 * "write") @param access_level: Access level ("read" or "write") @param
 * expires_at: Expiration timestamp in milliseconds @param clock: Reference to the
 * global clock @param ctx: Transaction context
 */
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
/**
 * Revoke wallet-based allowlist access
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * requester_wallet: Wallet to revoke access from @param target_wallet: Wallet
 * whose content access is being revoked @param scope: Access scope being revoked
 * @param ctx: Transaction context
 */
export declare function revokeWalletAllowlistAccess(options: RevokeWalletAllowlistAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetContextWalletInfoArguments {
    registry: RawTransactionArgument<string>;
    contextWallet: RawTransactionArgument<string>;
}
export interface GetContextWalletInfoOptions {
    package?: string;
    arguments: GetContextWalletInfoArguments | [
        registry: RawTransactionArgument<string>,
        contextWallet: RawTransactionArgument<string>
    ];
}
/**
 * Check if a context wallet exists and get its info
 *
 * @param registry: Reference to the AccessRegistry @param context_wallet: The
 * context wallet address to check @return (exists, main_wallet, derivation_index,
 * registered_at)
 */
export declare function getContextWalletInfo(options: GetContextWalletInfoOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface GetContentContextArguments {
    registry: RawTransactionArgument<string>;
    contentId: RawTransactionArgument<string>;
}
export interface GetContentContextOptions {
    package?: string;
    arguments: GetContentContextArguments | [
        registry: RawTransactionArgument<string>,
        contentId: RawTransactionArgument<string>
    ];
}
/**
 * Check if content is registered and get its context wallet
 *
 * @param registry: Reference to the AccessRegistry @param content_id: The content
 * identifier @return (exists, context_wallet)
 */
export declare function getContentContext(options: GetContentContextOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface CheckWalletAllowlistArguments {
    registry: RawTransactionArgument<string>;
    requesterWallet: RawTransactionArgument<string>;
    targetWallet: RawTransactionArgument<string>;
    scope: RawTransactionArgument<string>;
}
export interface CheckWalletAllowlistOptions {
    package?: string;
    arguments: CheckWalletAllowlistArguments | [
        registry: RawTransactionArgument<string>,
        requesterWallet: RawTransactionArgument<string>,
        targetWallet: RawTransactionArgument<string>,
        scope: RawTransactionArgument<string>
    ];
}
/**
 * Check if wallet allowlist entry exists and is active
 *
 * @param registry: Reference to the AccessRegistry @param requester_wallet:
 * Requesting wallet address @param target_wallet: Target wallet address @param
 * scope: Access scope @param clock: Reference to the Clock @return (exists,
 * is_active, access_level, expires_at)
 */
export declare function checkWalletAllowlist(options: CheckWalletAllowlistOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
/**
 * Log access attempt (can be called by Seal integration)
 *
 * @param content_id: The content being accessed @param access_type: Type of access
 * attempted @param success: Whether the access was successful @param clock:
 * Reference to the Clock @param ctx: Transaction context
 */
export declare function logAccess(options: LogAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
export interface CleanupExpiredAllowlistArguments {
    registry: RawTransactionArgument<string>;
    requesterWallet: RawTransactionArgument<string>;
    targetWallet: RawTransactionArgument<string>;
    scope: RawTransactionArgument<string>;
}
export interface CleanupExpiredAllowlistOptions {
    package?: string;
    arguments: CleanupExpiredAllowlistArguments | [
        registry: RawTransactionArgument<string>,
        requesterWallet: RawTransactionArgument<string>,
        targetWallet: RawTransactionArgument<string>,
        scope: RawTransactionArgument<string>
    ];
}
/**
 * Clean up expired wallet allowlist entry This is a maintenance function that can
 * be called by anyone
 *
 * @param registry: Mutable reference to the AccessRegistry @param
 * requester_wallet: Requesting wallet address @param target_wallet: Target wallet
 * address @param scope: Access scope @param clock: Reference to the Clock @param
 * ctx: Transaction context
 */
export declare function cleanupExpiredAllowlist(options: CleanupExpiredAllowlistOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
//# sourceMappingURL=seal_access_control.d.ts.map
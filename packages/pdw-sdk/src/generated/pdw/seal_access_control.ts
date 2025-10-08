/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object.js';
import * as table from './deps/sui/table.js';
const $moduleName = '@local-pkg/pdw::seal_access_control';
export const RegistryCreated = new MoveStruct({ name: `${$moduleName}::RegistryCreated`, fields: {
        registry_id: bcs.Address,
        creator: bcs.Address
    } });
export const ContentRegistered = new MoveStruct({ name: `${$moduleName}::ContentRegistered`, fields: {
        content_id: bcs.string(),
        context_wallet: bcs.Address,
        owner: bcs.Address,
        timestamp: bcs.u64()
    } });
export const ContextWalletRegistered = new MoveStruct({ name: `${$moduleName}::ContextWalletRegistered`, fields: {
        main_wallet: bcs.Address,
        context_wallet: bcs.Address,
        derivation_index: bcs.u64(),
        scope_hint: bcs.option(bcs.string()),
        timestamp: bcs.u64()
    } });
export const WalletAllowlistChanged = new MoveStruct({ name: `${$moduleName}::WalletAllowlistChanged`, fields: {
        requester_wallet: bcs.Address,
        target_wallet: bcs.Address,
        scope: bcs.string(),
        access_level: bcs.string(),
        granted: bcs.bool(),
        expires_at: bcs.u64(),
        granted_by: bcs.Address
    } });
export const AccessRegistry = new MoveStruct({ name: `${$moduleName}::AccessRegistry`, fields: {
        id: object.UID,
        /** Maps context wallet address -> metadata */
        context_wallets: table.Table,
        /** Maps content_id -> context wallet address (wallet-based contexts) */
        content_contexts: table.Table,
        /** Maps (requester_wallet, target_wallet, scope) -> WalletAllowlistEntry */
        wallet_allowlist: table.Table
    } });
export const ContextWalletInfo = new MoveStruct({ name: `${$moduleName}::ContextWalletInfo`, fields: {
        main_wallet: bcs.Address,
        derivation_index: bcs.u64(),
        registered_at: bcs.u64(),
        app_hint: bcs.option(bcs.string())
    } });
export const WalletAllowlistEntry = new MoveStruct({ name: `${$moduleName}::WalletAllowlistEntry`, fields: {
        scope: bcs.string(),
        access_level: bcs.string(),
        granted_at: bcs.u64(),
        expires_at: bcs.u64(),
        granted_by: bcs.Address
    } });
export const AccessLog = new MoveStruct({ name: `${$moduleName}::AccessLog`, fields: {
        id: object.UID,
        content_id: bcs.string(),
        requester: bcs.Address,
        access_type: bcs.string(),
        timestamp: bcs.u64(),
        success: bcs.bool()
    } });
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
export function sealApprove(options: SealApproveOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'address',
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["id", "requestingWallet", "registry"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'seal_approve',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function registerContent(options: RegisterContentOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["registry", "contentId", "contextWallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'register_content',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function registerContextWallet(options: RegisterContextWalletOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["registry", "contextWallet", "derivationIndex", "appHint"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'register_context_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function grantWalletAllowlistAccess(options: GrantWalletAllowlistAccessOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["registry", "requesterWallet", "targetWallet", "scope", "accessLevel", "expiresAt"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'grant_wallet_allowlist_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function revokeWalletAllowlistAccess(options: RevokeWalletAllowlistAccessOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["registry", "requesterWallet", "targetWallet", "scope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'revoke_wallet_allowlist_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function getContextWalletInfo(options: GetContextWalletInfoOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address'
    ] satisfies string[];
    const parameterNames = ["registry", "contextWallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'get_context_wallet_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function getContentContext(options: GetContentContextOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["registry", "contentId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'get_content_context',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function checkWalletAllowlist(options: CheckWalletAllowlistOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["registry", "requesterWallet", "targetWallet", "scope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'check_wallet_allowlist',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function logAccess(options: LogAccessOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'bool',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["contentId", "accessType", "success"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'log_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
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
export function cleanupExpiredAllowlist(options: CleanupExpiredAllowlistOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ] satisfies string[];
    const parameterNames = ["registry", "requesterWallet", "targetWallet", "scope"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'cleanup_expired_allowlist',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
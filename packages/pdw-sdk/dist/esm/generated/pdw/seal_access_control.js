/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import * as object from './deps/sui/object.js';
import * as table from './deps/sui/table.js';
const $moduleName = '@local-pkg/pdw::seal_access_control';
export const RegistryCreated = new MoveStruct({ name: `${$moduleName}::RegistryCreated`, fields: {
        registry_id: bcs.Address,
        creator: bcs.Address
    } });
export const ContentRegistered = new MoveStruct({ name: `${$moduleName}::ContentRegistered`, fields: {
        content_id: bcs.string(),
        owner: bcs.Address,
        timestamp: bcs.u64()
    } });
export const AccessChanged = new MoveStruct({ name: `${$moduleName}::AccessChanged`, fields: {
        content_id: bcs.string(),
        recipient: bcs.Address,
        access_level: bcs.string(),
        granted: bcs.bool(),
        expires_at: bcs.u64(),
        granted_by: bcs.Address
    } });
export const ContextRegistered = new MoveStruct({ name: `${$moduleName}::ContextRegistered`, fields: {
        context_id: bcs.string(),
        app_id: bcs.string(),
        owner: bcs.Address,
        timestamp: bcs.u64()
    } });
export const CrossContextAccessChanged = new MoveStruct({ name: `${$moduleName}::CrossContextAccessChanged`, fields: {
        source_context_id: bcs.string(),
        requesting_app_id: bcs.string(),
        access_level: bcs.string(),
        granted: bcs.bool(),
        expires_at: bcs.u64(),
        granted_by: bcs.Address
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
        /** Maps content_id -> owner address */
        owners: table.Table,
        /** Maps (content_id, user_address) -> AccessPermission */
        permissions: table.Table,
        /** Maps context_id -> owner address (for context-level ownership) */
        context_owners: table.Table,
        /** Maps (context_id, app_id) -> AccessPermission (for cross-context access) */
        context_permissions: table.Table,
        /** Maps context wallet address -> metadata */
        context_wallets: table.Table,
        /** Maps content_id -> context wallet address (wallet-based contexts) */
        content_contexts: table.Table,
        /** Maps (requester_wallet, target_wallet, scope) -> WalletAllowlistEntry */
        wallet_allowlist: table.Table
    } });
export const AccessPermission = new MoveStruct({ name: `${$moduleName}::AccessPermission`, fields: {
        access_level: bcs.string(),
        granted_at: bcs.u64(),
        expires_at: bcs.u64(),
        granted_by: bcs.Address
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
export function sealApprove(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'address',
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["id", "requestingWallet", "registry"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'seal_approve',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Register encrypted content with an owner Emits ContentRegistered event for
 * tracking
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * content_id: Unique identifier for the content being registered @param clock:
 * Reference to the global clock for timestamp @param ctx: Transaction context
 */
export function registerContent(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "contentId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'register_content',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Register encrypted content against a context wallet address */
export function registerContentV2(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "contentId", "contextWallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'register_content_v2',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
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
export function registerContext(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "contextId", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'register_context',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Register a hierarchical context wallet that is derived from the main wallet */
export function registerContextWallet(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "contextWallet", "derivationIndex", "appHint"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'register_context_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Grant access to another user */
export function grantAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "recipient", "contentId", "accessLevel", "expiresAt"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'grant_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Revoke access from a user */
export function revokeAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["registry", "recipient", "contentId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'revoke_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
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
export function grantCrossContextAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "requestingAppId", "sourceContextId", "accessLevel", "expiresAt"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'grant_cross_context_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Revoke cross-context access from an app
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * requesting_app_id: App to revoke access from @param source_context_id: Context
 * to revoke access to @param ctx: Transaction context
 */
export function revokeCrossContextAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["registry", "requestingAppId", "sourceContextId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'revoke_cross_context_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Grant wallet-based allowlist access between two context wallets */
export function grantWalletAllowlistAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'u64',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "requesterWallet", "targetWallet", "scope", "accessLevel", "expiresAt"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'grant_wallet_allowlist_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Revoke wallet-based allowlist access */
export function revokeWalletAllowlistAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["registry", "requesterWallet", "targetWallet", "scope"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'revoke_wallet_allowlist_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Check if a user has access (for off-chain queries) */
export function checkAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "user", "contentId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'check_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get permission details */
export function getPermission(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["registry", "user", "contentId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'get_permission',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Log access attempt (can be called by Seal integration) */
export function logAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'bool',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["contentId", "accessType", "success"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'log_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Clean up expired permissions for a specific content_id and user This is a
 * maintenance function that can be called by anyone
 */
export function cleanupExpiredPermission(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::seal_access_control::AccessRegistry`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String',
        'address',
        '0x0000000000000000000000000000000000000000000000000000000000000002::clock::Clock'
    ];
    const parameterNames = ["registry", "contentId", "user"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'seal_access_control',
        function: 'cleanup_expired_permission',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=seal_access_control.js.map
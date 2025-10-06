/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
/**
 * Wallet management module for Personal Data Wallet
 *
 * This module provides core wallet identity management including:
 *
 * - Main wallet creation and management
 * - App-specific context wallet creation via dynamic fields
 * - Deterministic context ID derivation for app isolation
 * - Cross-context permissions (read-only, no delete)
 */
import { MoveStruct, normalizeMoveArguments } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import * as object from '~root/deps/sui/object.js';
const $moduleName = '@local-pkg/pdw::wallet';
export const MainWallet = new MoveStruct({ name: `${$moduleName}::MainWallet`, fields: {
        id: object.UID,
        owner: bcs.Address,
        created_at: bcs.u64(),
        context_salt: bcs.vector(bcs.u8()),
        version: bcs.u64()
    } });
export const ContextWallet = new MoveStruct({ name: `${$moduleName}::ContextWallet`, fields: {
        id: object.UID,
        app_id: bcs.string(),
        owner: bcs.Address,
        context_id: bcs.vector(bcs.u8()),
        main_wallet_id: bcs.Address,
        policy_ref: bcs.option(bcs.string()),
        created_at: bcs.u64(),
        permissions: bcs.vector(bcs.string())
    } });
export const WalletRegistry = new MoveStruct({ name: `${$moduleName}::WalletRegistry`, fields: {
        id: object.UID,
        wallets: bcs.vector(bcs.Address)
    } });
export const MainWalletCreated = new MoveStruct({ name: `${$moduleName}::MainWalletCreated`, fields: {
        wallet_id: bcs.Address,
        owner: bcs.Address,
        created_at: bcs.u64()
    } });
export const ContextWalletCreated = new MoveStruct({ name: `${$moduleName}::ContextWalletCreated`, fields: {
        wallet_id: bcs.Address,
        app_id: bcs.string(),
        context_id: bcs.vector(bcs.u8()),
        owner: bcs.Address,
        main_wallet_id: bcs.Address,
        created_at: bcs.u64()
    } });
export const ContextWalletAccessed = new MoveStruct({ name: `${$moduleName}::ContextWalletAccessed`, fields: {
        context_id: bcs.vector(bcs.u8()),
        app_id: bcs.string(),
        accessed_by: bcs.Address,
        operation: bcs.string(),
        timestamp: bcs.u64()
    } });
/**
 * Create a new main wallet for a user Each user should call this once to establish
 * their identity
 */
export function createMainWallet(options = {}) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'create_main_wallet',
    });
}
/**
 * Create a context wallet for a specific app (stores as dynamic field) This can be
 * called by 3rd party apps to create their context Links to the user's main wallet
 * for identity verification
 */
export function createContextWallet(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["mainWallet", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'create_context_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context wallet by app_id (returns reference) */
export function getContextWallet(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["mainWallet", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get mutable context wallet by app_id (for updates) */
export function getContextWalletMut(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["mainWallet", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet_mut',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Check if context wallet exists for app */
export function contextExists(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["mainWallet", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'context_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Derive a deterministic context ID for app isolation Uses:
 * keccak256(owner_address || app_id || context_salt) Returns the hash bytes (not
 * an address, used as identifier)
 */
export function deriveContextId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["mainWallet", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'derive_context_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Update policy reference for a context wallet */
export function setPolicyRef(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["contextWallet", "policyRef"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'set_policy_ref',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Add permission to context wallet */
export function addPermission(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["contextWallet", "permission"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'add_permission',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get main wallet details */
export function getMainWalletInfo(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_main_wallet_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context wallet details */
export function getContextWalletInfo(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context ID from context wallet */
export function getContextId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Check if context wallet has specific permission */
export function hasPermission(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["wallet", "permission"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'has_permission',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get all permissions for context wallet */
export function getPermissions(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_permissions',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get policy reference */
export function getPolicyRef(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_policy_ref',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context salt from main wallet */
export function getContextSalt(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_salt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Log context access (for audit trail) Can be called by apps when they access
 * context data
 */
export function logContextAccess(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["contextWallet", "operation"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'log_context_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=wallet.js.map
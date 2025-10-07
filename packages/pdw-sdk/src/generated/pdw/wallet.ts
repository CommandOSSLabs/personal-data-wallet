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

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
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
export interface CreateMainWalletOptions {
    package?: string;
    arguments?: [
    ];
}
/**
 * Create a new main wallet for a user Each user should call this once to establish
 * their identity
 */
export function createMainWallet(options: CreateMainWalletOptions = {}) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'create_main_wallet',
    });
}
export interface CreateContextWalletArguments {
    mainWallet: RawTransactionArgument<string>;
    appId: RawTransactionArgument<string>;
}
export interface CreateContextWalletOptions {
    package?: string;
    arguments: CreateContextWalletArguments | [
        mainWallet: RawTransactionArgument<string>,
        appId: RawTransactionArgument<string>
    ];
}
/**
 * Create a context wallet for a specific app (stores as dynamic field) This can be
 * called by 3rd party apps to create their context Links to the user's main wallet
 * for identity verification
 */
export function createContextWallet(options: CreateContextWalletOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["mainWallet", "appId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'create_context_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContextWalletArguments {
    mainWallet: RawTransactionArgument<string>;
    appId: RawTransactionArgument<string>;
}
export interface GetContextWalletOptions {
    package?: string;
    arguments: GetContextWalletArguments | [
        mainWallet: RawTransactionArgument<string>,
        appId: RawTransactionArgument<string>
    ];
}
/** Get context wallet by app_id (returns reference) */
export function getContextWallet(options: GetContextWalletOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["mainWallet", "appId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContextWalletMutArguments {
    mainWallet: RawTransactionArgument<string>;
    appId: RawTransactionArgument<string>;
}
export interface GetContextWalletMutOptions {
    package?: string;
    arguments: GetContextWalletMutArguments | [
        mainWallet: RawTransactionArgument<string>,
        appId: RawTransactionArgument<string>
    ];
}
/** Get mutable context wallet by app_id (for updates) */
export function getContextWalletMut(options: GetContextWalletMutOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["mainWallet", "appId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet_mut',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ContextExistsArguments {
    mainWallet: RawTransactionArgument<string>;
    appId: RawTransactionArgument<string>;
}
export interface ContextExistsOptions {
    package?: string;
    arguments: ContextExistsArguments | [
        mainWallet: RawTransactionArgument<string>,
        appId: RawTransactionArgument<string>
    ];
}
/** Check if context wallet exists for app */
export function contextExists(options: ContextExistsOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["mainWallet", "appId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'context_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DeriveContextIdArguments {
    mainWallet: RawTransactionArgument<string>;
    appId: RawTransactionArgument<string>;
}
export interface DeriveContextIdOptions {
    package?: string;
    arguments: DeriveContextIdArguments | [
        mainWallet: RawTransactionArgument<string>,
        appId: RawTransactionArgument<string>
    ];
}
/**
 * Derive a deterministic context ID for app isolation Uses:
 * keccak256(owner_address || app_id || context_salt) Returns the hash bytes (not
 * an address, used as identifier)
 */
export function deriveContextId(options: DeriveContextIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["mainWallet", "appId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'derive_context_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SetPolicyRefArguments {
    contextWallet: RawTransactionArgument<string>;
    policyRef: RawTransactionArgument<string>;
}
export interface SetPolicyRefOptions {
    package?: string;
    arguments: SetPolicyRefArguments | [
        contextWallet: RawTransactionArgument<string>,
        policyRef: RawTransactionArgument<string>
    ];
}
/** Update policy reference for a context wallet */
export function setPolicyRef(options: SetPolicyRefOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["contextWallet", "policyRef"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'set_policy_ref',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface AddPermissionArguments {
    contextWallet: RawTransactionArgument<string>;
    permission: RawTransactionArgument<string>;
}
export interface AddPermissionOptions {
    package?: string;
    arguments: AddPermissionArguments | [
        contextWallet: RawTransactionArgument<string>,
        permission: RawTransactionArgument<string>
    ];
}
/** Add permission to context wallet */
export function addPermission(options: AddPermissionOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["contextWallet", "permission"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'add_permission',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetMainWalletInfoArguments {
    wallet: RawTransactionArgument<string>;
}
export interface GetMainWalletInfoOptions {
    package?: string;
    arguments: GetMainWalletInfoArguments | [
        wallet: RawTransactionArgument<string>
    ];
}
/** Get main wallet details */
export function getMainWalletInfo(options: GetMainWalletInfoOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`
    ] satisfies string[];
    const parameterNames = ["wallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_main_wallet_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContextWalletInfoArguments {
    wallet: RawTransactionArgument<string>;
}
export interface GetContextWalletInfoOptions {
    package?: string;
    arguments: GetContextWalletInfoArguments | [
        wallet: RawTransactionArgument<string>
    ];
}
/** Get context wallet details */
export function getContextWalletInfo(options: GetContextWalletInfoOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ] satisfies string[];
    const parameterNames = ["wallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet_info',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContextIdArguments {
    wallet: RawTransactionArgument<string>;
}
export interface GetContextIdOptions {
    package?: string;
    arguments: GetContextIdArguments | [
        wallet: RawTransactionArgument<string>
    ];
}
/** Get context ID from context wallet */
export function getContextId(options: GetContextIdOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ] satisfies string[];
    const parameterNames = ["wallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_id',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HasPermissionArguments {
    wallet: RawTransactionArgument<string>;
    permission: RawTransactionArgument<string>;
}
export interface HasPermissionOptions {
    package?: string;
    arguments: HasPermissionArguments | [
        wallet: RawTransactionArgument<string>,
        permission: RawTransactionArgument<string>
    ];
}
/** Check if context wallet has specific permission */
export function hasPermission(options: HasPermissionOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["wallet", "permission"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'has_permission',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetPermissionsArguments {
    wallet: RawTransactionArgument<string>;
}
export interface GetPermissionsOptions {
    package?: string;
    arguments: GetPermissionsArguments | [
        wallet: RawTransactionArgument<string>
    ];
}
/** Get all permissions for context wallet */
export function getPermissions(options: GetPermissionsOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ] satisfies string[];
    const parameterNames = ["wallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_permissions',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetPolicyRefArguments {
    wallet: RawTransactionArgument<string>;
}
export interface GetPolicyRefOptions {
    package?: string;
    arguments: GetPolicyRefArguments | [
        wallet: RawTransactionArgument<string>
    ];
}
/** Get policy reference */
export function getPolicyRef(options: GetPolicyRefOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ] satisfies string[];
    const parameterNames = ["wallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_policy_ref',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GetContextSaltArguments {
    wallet: RawTransactionArgument<string>;
}
export interface GetContextSaltOptions {
    package?: string;
    arguments: GetContextSaltArguments | [
        wallet: RawTransactionArgument<string>
    ];
}
/** Get context salt from main wallet */
export function getContextSalt(options: GetContextSaltOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`
    ] satisfies string[];
    const parameterNames = ["wallet"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_salt',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface LogContextAccessArguments {
    contextWallet: RawTransactionArgument<string>;
    operation: RawTransactionArgument<string>;
}
export interface LogContextAccessOptions {
    package?: string;
    arguments: LogContextAccessArguments | [
        contextWallet: RawTransactionArgument<string>,
        operation: RawTransactionArgument<string>
    ];
}
/**
 * Log context access (for audit trail) Can be called by apps when they access
 * context data
 */
export function logContextAccess(options: LogContextAccessOptions) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["contextWallet", "operation"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'log_context_access',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
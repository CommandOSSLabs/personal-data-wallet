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
import { MoveStruct, type RawTransactionArgument } from '../utils/index.js';
import { type Transaction } from '@mysten/sui/transactions';
export declare const MainWallet: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    owner: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    created_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    context_salt: import("@mysten/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    version: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::MainWallet">;
export declare const ContextWallet: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    app_id: import("@mysten/bcs").BcsType<string, string, "string">;
    owner: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    context_id: import("@mysten/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    main_wallet_id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    policy_ref: import("@mysten/bcs").BcsType<string | null, string | null | undefined, "Option<string>">;
    created_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
    permissions: import("@mysten/bcs").BcsType<string[], Iterable<string> & {
        length: number;
    }, string>;
}, "@local-pkg/pdw::wallet::ContextWallet">;
export declare const WalletRegistry: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    wallets: import("@mysten/bcs").BcsType<string[], Iterable<string | Uint8Array<ArrayBufferLike>> & {
        length: number;
    }, string>;
}, "@local-pkg/pdw::wallet::WalletRegistry">;
export declare const MainWalletCreated: MoveStruct<{
    wallet_id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    owner: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    created_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::MainWalletCreated">;
export declare const ContextWalletCreated: MoveStruct<{
    wallet_id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    app_id: import("@mysten/bcs").BcsType<string, string, "string">;
    context_id: import("@mysten/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    owner: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    main_wallet_id: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    created_at: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::ContextWalletCreated">;
export declare const ContextWalletAccessed: MoveStruct<{
    context_id: import("@mysten/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    app_id: import("@mysten/bcs").BcsType<string, string, "string">;
    accessed_by: import("@mysten/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    operation: import("@mysten/bcs").BcsType<string, string, "string">;
    timestamp: import("@mysten/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::ContextWalletAccessed">;
export interface CreateMainWalletOptions {
    package?: string;
    arguments?: [
    ];
}
/**
 * Create a new main wallet for a user Each user should call this once to establish
 * their identity
 */
export declare function createMainWallet(options?: CreateMainWalletOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function createContextWallet(options: CreateContextWalletOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getContextWallet(options: GetContextWalletOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getContextWalletMut(options: GetContextWalletMutOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function contextExists(options: ContextExistsOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function deriveContextId(options: DeriveContextIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function setPolicyRef(options: SetPolicyRefOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function addPermission(options: AddPermissionOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getMainWalletInfo(options: GetMainWalletInfoOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getContextWalletInfo(options: GetContextWalletInfoOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getContextId(options: GetContextIdOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function hasPermission(options: HasPermissionOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getPermissions(options: GetPermissionsOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getPolicyRef(options: GetPolicyRefOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function getContextSalt(options: GetContextSaltOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
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
export declare function logContextAccess(options: LogContextAccessOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
//# sourceMappingURL=wallet.d.ts.map
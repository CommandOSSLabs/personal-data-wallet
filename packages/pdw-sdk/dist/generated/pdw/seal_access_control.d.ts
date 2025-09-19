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
export declare const AccessRegistry: MoveStruct<{
    id: any;
    /** Maps content_id -> owner address */
    owners: any;
    /** Maps (content_id, user_address) -> AccessPermission */
    permissions: any;
}, "@local-pkg/pdw::seal_access_control::AccessRegistry">;
export declare const AccessPermission: MoveStruct<{
    access_level: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    granted_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    expires_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    granted_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
}, "@local-pkg/pdw::seal_access_control::AccessPermission">;
export declare const AccessLog: MoveStruct<{
    id: any;
    content_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    requester: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    access_type: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    success: import("@mysten/sui/bcs").BcsType<boolean, boolean, "bool">;
}, "@local-pkg/pdw::seal_access_control::AccessLog">;
export interface SealApproveArguments {
    id: RawTransactionArgument<number[]>;
    accessType: RawTransactionArgument<number[]>;
    timestamp: RawTransactionArgument<number | bigint>;
    registry: RawTransactionArgument<string>;
}
export interface SealApproveOptions {
    package?: string;
    arguments: SealApproveArguments | [
        id: RawTransactionArgument<number[]>,
        accessType: RawTransactionArgument<number[]>,
        timestamp: RawTransactionArgument<number | bigint>,
        registry: RawTransactionArgument<string>
    ];
}
/**
 * Main function called by Seal SDK for access approval This is the critical
 * function that Seal key servers will evaluate
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
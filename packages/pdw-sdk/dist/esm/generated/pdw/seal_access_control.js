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
export const AccessRegistry = new MoveStruct({ name: `${$moduleName}::AccessRegistry`, fields: {
        id: object.UID,
        /** Maps content_id -> owner address */
        owners: table.Table,
        /** Maps (content_id, user_address) -> AccessPermission */
        permissions: table.Table
    } });
export const AccessPermission = new MoveStruct({ name: `${$moduleName}::AccessPermission`, fields: {
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
 * Main function called by Seal SDK for access approval This is the critical
 * function that Seal key servers will evaluate
 */
export function sealApprove(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        'vector<u8>',
        'vector<u8>',
        'u64',
        `${packageAddress}::seal_access_control::AccessRegistry`
    ];
    const parameterNames = ["id", "accessType", "timestamp", "registry"];
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
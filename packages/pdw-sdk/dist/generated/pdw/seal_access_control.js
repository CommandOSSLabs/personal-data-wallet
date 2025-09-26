"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessLog = exports.AccessPermission = exports.AccessRegistry = exports.AccessChanged = exports.ContentRegistered = exports.RegistryCreated = void 0;
exports.sealApprove = sealApprove;
exports.registerContent = registerContent;
exports.grantAccess = grantAccess;
exports.revokeAccess = revokeAccess;
exports.checkAccess = checkAccess;
exports.getPermission = getPermission;
exports.logAccess = logAccess;
exports.cleanupExpiredPermission = cleanupExpiredPermission;
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
const index_1 = require("../utils/index");
const bcs_1 = require("@mysten/sui/bcs");
const object = __importStar(require("./deps/sui/object"));
const table = __importStar(require("./deps/sui/table"));
const $moduleName = '@local-pkg/pdw::seal_access_control';
exports.RegistryCreated = new index_1.MoveStruct({ name: `${$moduleName}::RegistryCreated`, fields: {
        registry_id: bcs_1.bcs.Address,
        creator: bcs_1.bcs.Address
    } });
exports.ContentRegistered = new index_1.MoveStruct({ name: `${$moduleName}::ContentRegistered`, fields: {
        content_id: bcs_1.bcs.string(),
        owner: bcs_1.bcs.Address,
        timestamp: bcs_1.bcs.u64()
    } });
exports.AccessChanged = new index_1.MoveStruct({ name: `${$moduleName}::AccessChanged`, fields: {
        content_id: bcs_1.bcs.string(),
        recipient: bcs_1.bcs.Address,
        access_level: bcs_1.bcs.string(),
        granted: bcs_1.bcs.bool(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.AccessRegistry = new index_1.MoveStruct({ name: `${$moduleName}::AccessRegistry`, fields: {
        id: object.UID,
        /** Maps content_id -> owner address */
        owners: table.Table,
        /** Maps (content_id, user_address) -> AccessPermission */
        permissions: table.Table
    } });
exports.AccessPermission = new index_1.MoveStruct({ name: `${$moduleName}::AccessPermission`, fields: {
        access_level: bcs_1.bcs.string(),
        granted_at: bcs_1.bcs.u64(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.AccessLog = new index_1.MoveStruct({ name: `${$moduleName}::AccessLog`, fields: {
        id: object.UID,
        content_id: bcs_1.bcs.string(),
        requester: bcs_1.bcs.Address,
        access_type: bcs_1.bcs.string(),
        timestamp: bcs_1.bcs.u64(),
        success: bcs_1.bcs.bool()
    } });
/**
 * Main function called by Seal SDK for access approval This is the critical
 * function that Seal key servers will evaluate
 */
function sealApprove(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
function registerContent(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Grant access to another user */
function grantAccess(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Revoke access from a user */
function revokeAccess(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Check if a user has access (for off-chain queries) */
function checkAccess(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get permission details */
function getPermission(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Log access attempt (can be called by Seal integration) */
function logAccess(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Clean up expired permissions for a specific content_id and user This is a
 * maintenance function that can be called by anyone
 */
function cleanupExpiredPermission(options) {
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
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=seal_access_control.js.map
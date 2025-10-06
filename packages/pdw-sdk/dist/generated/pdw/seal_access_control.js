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
exports.AccessLog = exports.WalletAllowlistEntry = exports.ContextWalletInfo = exports.AccessPermission = exports.AccessRegistry = exports.WalletAllowlistChanged = exports.ContextWalletRegistered = exports.CrossContextAccessChanged = exports.ContextRegistered = exports.AccessChanged = exports.ContentRegistered = exports.RegistryCreated = void 0;
exports.sealApprove = sealApprove;
exports.registerContent = registerContent;
exports.registerContentV2 = registerContentV2;
exports.registerContext = registerContext;
exports.registerContextWallet = registerContextWallet;
exports.grantAccess = grantAccess;
exports.revokeAccess = revokeAccess;
exports.grantCrossContextAccess = grantCrossContextAccess;
exports.revokeCrossContextAccess = revokeCrossContextAccess;
exports.grantWalletAllowlistAccess = grantWalletAllowlistAccess;
exports.revokeWalletAllowlistAccess = revokeWalletAllowlistAccess;
exports.checkAccess = checkAccess;
exports.getPermission = getPermission;
exports.logAccess = logAccess;
exports.cleanupExpiredPermission = cleanupExpiredPermission;
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
const index_js_1 = require("../utils/index.js");
const bcs_1 = require("@mysten/sui/bcs");
const object = __importStar(require("~root/deps/sui/object.js"));
const table = __importStar(require("~root/deps/sui/table.js"));
const $moduleName = '@local-pkg/pdw::seal_access_control';
exports.RegistryCreated = new index_js_1.MoveStruct({ name: `${$moduleName}::RegistryCreated`, fields: {
        registry_id: bcs_1.bcs.Address,
        creator: bcs_1.bcs.Address
    } });
exports.ContentRegistered = new index_js_1.MoveStruct({ name: `${$moduleName}::ContentRegistered`, fields: {
        content_id: bcs_1.bcs.string(),
        owner: bcs_1.bcs.Address,
        timestamp: bcs_1.bcs.u64()
    } });
exports.AccessChanged = new index_js_1.MoveStruct({ name: `${$moduleName}::AccessChanged`, fields: {
        content_id: bcs_1.bcs.string(),
        recipient: bcs_1.bcs.Address,
        access_level: bcs_1.bcs.string(),
        granted: bcs_1.bcs.bool(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.ContextRegistered = new index_js_1.MoveStruct({ name: `${$moduleName}::ContextRegistered`, fields: {
        context_id: bcs_1.bcs.string(),
        app_id: bcs_1.bcs.string(),
        owner: bcs_1.bcs.Address,
        timestamp: bcs_1.bcs.u64()
    } });
exports.CrossContextAccessChanged = new index_js_1.MoveStruct({ name: `${$moduleName}::CrossContextAccessChanged`, fields: {
        source_context_id: bcs_1.bcs.string(),
        requesting_app_id: bcs_1.bcs.string(),
        access_level: bcs_1.bcs.string(),
        granted: bcs_1.bcs.bool(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.ContextWalletRegistered = new index_js_1.MoveStruct({ name: `${$moduleName}::ContextWalletRegistered`, fields: {
        main_wallet: bcs_1.bcs.Address,
        context_wallet: bcs_1.bcs.Address,
        derivation_index: bcs_1.bcs.u64(),
        scope_hint: bcs_1.bcs.option(bcs_1.bcs.string()),
        timestamp: bcs_1.bcs.u64()
    } });
exports.WalletAllowlistChanged = new index_js_1.MoveStruct({ name: `${$moduleName}::WalletAllowlistChanged`, fields: {
        requester_wallet: bcs_1.bcs.Address,
        target_wallet: bcs_1.bcs.Address,
        scope: bcs_1.bcs.string(),
        access_level: bcs_1.bcs.string(),
        granted: bcs_1.bcs.bool(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.AccessRegistry = new index_js_1.MoveStruct({ name: `${$moduleName}::AccessRegistry`, fields: {
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
exports.AccessPermission = new index_js_1.MoveStruct({ name: `${$moduleName}::AccessPermission`, fields: {
        access_level: bcs_1.bcs.string(),
        granted_at: bcs_1.bcs.u64(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.ContextWalletInfo = new index_js_1.MoveStruct({ name: `${$moduleName}::ContextWalletInfo`, fields: {
        main_wallet: bcs_1.bcs.Address,
        derivation_index: bcs_1.bcs.u64(),
        registered_at: bcs_1.bcs.u64(),
        app_hint: bcs_1.bcs.option(bcs_1.bcs.string())
    } });
exports.WalletAllowlistEntry = new index_js_1.MoveStruct({ name: `${$moduleName}::WalletAllowlistEntry`, fields: {
        scope: bcs_1.bcs.string(),
        access_level: bcs_1.bcs.string(),
        granted_at: bcs_1.bcs.u64(),
        expires_at: bcs_1.bcs.u64(),
        granted_by: bcs_1.bcs.Address
    } });
exports.AccessLog = new index_js_1.MoveStruct({ name: `${$moduleName}::AccessLog`, fields: {
        id: object.UID,
        content_id: bcs_1.bcs.string(),
        requester: bcs_1.bcs.Address,
        access_type: bcs_1.bcs.string(),
        timestamp: bcs_1.bcs.u64(),
        success: bcs_1.bcs.bool()
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
function sealApprove(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Register encrypted content against a context wallet address */
function registerContentV2(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
function registerContext(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Register a hierarchical context wallet that is derived from the main wallet */
function registerContextWallet(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
function grantCrossContextAccess(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Revoke cross-context access from an app
 *
 * @param registry: Mutable reference to the shared AccessRegistry @param
 * requesting_app_id: App to revoke access from @param source_context_id: Context
 * to revoke access to @param ctx: Transaction context
 */
function revokeCrossContextAccess(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Grant wallet-based allowlist access between two context wallets */
function grantWalletAllowlistAccess(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Revoke wallet-based allowlist access */
function revokeWalletAllowlistAccess(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=seal_access_control.js.map
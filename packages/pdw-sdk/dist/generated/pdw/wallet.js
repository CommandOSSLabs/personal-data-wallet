"use strict";
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
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
exports.ContextWalletAccessed = exports.ContextWalletCreated = exports.MainWalletCreated = exports.WalletRegistry = exports.ContextWallet = exports.MainWallet = void 0;
exports.createMainWallet = createMainWallet;
exports.createContextWallet = createContextWallet;
exports.getContextWallet = getContextWallet;
exports.getContextWalletMut = getContextWalletMut;
exports.contextExists = contextExists;
exports.deriveContextId = deriveContextId;
exports.setPolicyRef = setPolicyRef;
exports.addPermission = addPermission;
exports.getMainWalletInfo = getMainWalletInfo;
exports.getContextWalletInfo = getContextWalletInfo;
exports.getContextId = getContextId;
exports.hasPermission = hasPermission;
exports.getPermissions = getPermissions;
exports.getPolicyRef = getPolicyRef;
exports.getContextSalt = getContextSalt;
exports.logContextAccess = logContextAccess;
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
const index_js_1 = require("../utils/index.js");
const bcs_1 = require("@mysten/sui/bcs");
const object = __importStar(require("~root/deps/sui/object.js"));
const $moduleName = '@local-pkg/pdw::wallet';
exports.MainWallet = new index_js_1.MoveStruct({ name: `${$moduleName}::MainWallet`, fields: {
        id: object.UID,
        owner: bcs_1.bcs.Address,
        created_at: bcs_1.bcs.u64(),
        context_salt: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        version: bcs_1.bcs.u64()
    } });
exports.ContextWallet = new index_js_1.MoveStruct({ name: `${$moduleName}::ContextWallet`, fields: {
        id: object.UID,
        app_id: bcs_1.bcs.string(),
        owner: bcs_1.bcs.Address,
        context_id: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        main_wallet_id: bcs_1.bcs.Address,
        policy_ref: bcs_1.bcs.option(bcs_1.bcs.string()),
        created_at: bcs_1.bcs.u64(),
        permissions: bcs_1.bcs.vector(bcs_1.bcs.string())
    } });
exports.WalletRegistry = new index_js_1.MoveStruct({ name: `${$moduleName}::WalletRegistry`, fields: {
        id: object.UID,
        wallets: bcs_1.bcs.vector(bcs_1.bcs.Address)
    } });
exports.MainWalletCreated = new index_js_1.MoveStruct({ name: `${$moduleName}::MainWalletCreated`, fields: {
        wallet_id: bcs_1.bcs.Address,
        owner: bcs_1.bcs.Address,
        created_at: bcs_1.bcs.u64()
    } });
exports.ContextWalletCreated = new index_js_1.MoveStruct({ name: `${$moduleName}::ContextWalletCreated`, fields: {
        wallet_id: bcs_1.bcs.Address,
        app_id: bcs_1.bcs.string(),
        context_id: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        owner: bcs_1.bcs.Address,
        main_wallet_id: bcs_1.bcs.Address,
        created_at: bcs_1.bcs.u64()
    } });
exports.ContextWalletAccessed = new index_js_1.MoveStruct({ name: `${$moduleName}::ContextWalletAccessed`, fields: {
        context_id: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        app_id: bcs_1.bcs.string(),
        accessed_by: bcs_1.bcs.Address,
        operation: bcs_1.bcs.string(),
        timestamp: bcs_1.bcs.u64()
    } });
/**
 * Create a new main wallet for a user Each user should call this once to establish
 * their identity
 */
function createMainWallet(options = {}) {
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
function createContextWallet(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context wallet by app_id (returns reference) */
function getContextWallet(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get mutable context wallet by app_id (for updates) */
function getContextWalletMut(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Check if context wallet exists for app */
function contextExists(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Derive a deterministic context ID for app isolation Uses:
 * keccak256(owner_address || app_id || context_salt) Returns the hash bytes (not
 * an address, used as identifier)
 */
function deriveContextId(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Update policy reference for a context wallet */
function setPolicyRef(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Add permission to context wallet */
function addPermission(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get main wallet details */
function getMainWalletInfo(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_main_wallet_info',
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context wallet details */
function getContextWalletInfo(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_wallet_info',
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context ID from context wallet */
function getContextId(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_id',
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Check if context wallet has specific permission */
function hasPermission(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get all permissions for context wallet */
function getPermissions(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_permissions',
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get policy reference */
function getPolicyRef(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::ContextWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_policy_ref',
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/** Get context salt from main wallet */
function getContextSalt(options) {
    const packageAddress = options.package ?? '@local-pkg/pdw';
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`
    ];
    const parameterNames = ["wallet"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'get_context_salt',
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Log context access (for audit trail) Can be called by apps when they access
 * context data
 */
function logContextAccess(options) {
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
        arguments: (0, index_js_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
//# sourceMappingURL=wallet.js.map
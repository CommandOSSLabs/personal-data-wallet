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
exports.ContextWalletAccessed = exports.ContextWalletCreated = exports.MainWalletCreated = exports.WalletRegistry = exports.ContextWallet = exports.MainWallet = void 0;
exports.createContextWallet = createContextWallet;
exports.createMainWallet = createMainWallet;
/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
const index_1 = require("../utils/index");
const bcs_1 = require("@mysten/sui/bcs");
const object = __importStar(require("./deps/sui/object"));
const $moduleName = '@local-pkg/pdw::wallet';
const $packageId = '0x6dc2fe501926b17f441e46c3ac121ad0924da3aa7c5bc78781ddd7df1080694a';
// ===== Structs =====
exports.MainWallet = new index_1.MoveStruct({
    name: `${$moduleName}::MainWallet`,
    fields: {
        id: object.UID,
        owner: bcs_1.bcs.Address,
        created_at: bcs_1.bcs.u64(),
        context_salt: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        version: bcs_1.bcs.u64(),
    }
});
exports.ContextWallet = new index_1.MoveStruct({
    name: `${$moduleName}::ContextWallet`,
    fields: {
        id: object.UID,
        app_id: bcs_1.bcs.string(),
        owner: bcs_1.bcs.Address,
        context_id: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        main_wallet_id: bcs_1.bcs.Address,
        policy_ref: bcs_1.bcs.option(bcs_1.bcs.string()),
        created_at: bcs_1.bcs.u64(),
        permissions: bcs_1.bcs.vector(bcs_1.bcs.string()),
    }
});
exports.WalletRegistry = new index_1.MoveStruct({
    name: `${$moduleName}::WalletRegistry`,
    fields: {
        id: object.UID,
        wallets: bcs_1.bcs.vector(bcs_1.bcs.Address),
    }
});
// ===== Events =====
exports.MainWalletCreated = new index_1.MoveStruct({
    name: `${$moduleName}::MainWalletCreated`,
    fields: {
        wallet_id: bcs_1.bcs.Address,
        owner: bcs_1.bcs.Address,
        created_at: bcs_1.bcs.u64(),
    }
});
exports.ContextWalletCreated = new index_1.MoveStruct({
    name: `${$moduleName}::ContextWalletCreated`,
    fields: {
        wallet_id: bcs_1.bcs.Address,
        app_id: bcs_1.bcs.string(),
        context_id: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        owner: bcs_1.bcs.Address,
        main_wallet_id: bcs_1.bcs.Address,
        created_at: bcs_1.bcs.u64(),
    }
});
exports.ContextWalletAccessed = new index_1.MoveStruct({
    name: `${$moduleName}::ContextWalletAccessed`,
    fields: {
        context_id: bcs_1.bcs.vector(bcs_1.bcs.u8()),
        app_id: bcs_1.bcs.string(),
        accessed_by: bcs_1.bcs.Address,
        operation: bcs_1.bcs.string(),
        timestamp: bcs_1.bcs.u64(),
    }
});
/**
 * Create a context wallet for a specific app
 * Stores the wallet as a dynamic field on the main wallet
 */
function createContextWallet(options) {
    const packageAddress = options.package ?? $packageId;
    const argumentsTypes = [
        `${packageAddress}::wallet::MainWallet`,
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ];
    const parameterNames = ["mainWallet", "appId"];
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'create_context_wallet',
        arguments: (0, index_1.normalizeMoveArguments)(options.arguments, argumentsTypes, parameterNames),
    });
}
/**
 * Create a new main wallet for a user
 */
function createMainWallet(options = {}) {
    const packageAddress = options.package ?? $packageId;
    return (tx) => tx.moveCall({
        package: packageAddress,
        module: 'wallet',
        function: 'create_main_wallet',
        arguments: [],
    });
}
//# sourceMappingURL=wallet.js.map
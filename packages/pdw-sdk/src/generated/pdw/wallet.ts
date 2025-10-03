/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object';

const $moduleName = '@local-pkg/pdw::wallet';
const $packageId = '0x6dc2fe501926b17f441e46c3ac121ad0924da3aa7c5bc78781ddd7df1080694a';

// ===== Structs =====

export const MainWallet = new MoveStruct({
  name: `${$moduleName}::MainWallet`,
  fields: {
    id: object.UID,
    owner: bcs.Address,
    created_at: bcs.u64(),
    context_salt: bcs.vector(bcs.u8()),
    version: bcs.u64(),
  }
});

export const ContextWallet = new MoveStruct({
  name: `${$moduleName}::ContextWallet`,
  fields: {
    id: object.UID,
    app_id: bcs.string(),
    owner: bcs.Address,
    context_id: bcs.vector(bcs.u8()),
    main_wallet_id: bcs.Address,
    policy_ref: bcs.option(bcs.string()),
    created_at: bcs.u64(),
    permissions: bcs.vector(bcs.string()),
  }
});

export const WalletRegistry = new MoveStruct({
  name: `${$moduleName}::WalletRegistry`,
  fields: {
    id: object.UID,
    wallets: bcs.vector(bcs.Address),
  }
});

// ===== Events =====

export const MainWalletCreated = new MoveStruct({
  name: `${$moduleName}::MainWalletCreated`,
  fields: {
    wallet_id: bcs.Address,
    owner: bcs.Address,
    created_at: bcs.u64(),
  }
});

export const ContextWalletCreated = new MoveStruct({
  name: `${$moduleName}::ContextWalletCreated`,
  fields: {
    wallet_id: bcs.Address,
    app_id: bcs.string(),
    context_id: bcs.vector(bcs.u8()),
    owner: bcs.Address,
    main_wallet_id: bcs.Address,
    created_at: bcs.u64(),
  }
});

export const ContextWalletAccessed = new MoveStruct({
  name: `${$moduleName}::ContextWalletAccessed`,
  fields: {
    context_id: bcs.vector(bcs.u8()),
    app_id: bcs.string(),
    accessed_by: bcs.Address,
    operation: bcs.string(),
    timestamp: bcs.u64(),
  }
});

// ===== Transaction Building Functions =====

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
 * Create a context wallet for a specific app
 * Stores the wallet as a dynamic field on the main wallet
 */
export function createContextWallet(options: CreateContextWalletOptions) {
  const packageAddress = options.package ?? $packageId;
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

/**
 * Create a new main wallet for a user
 */
export function createMainWallet(options: { package?: string } = {}) {
  const packageAddress = options.package ?? $packageId;
  return (tx: Transaction) => tx.moveCall({
    package: packageAddress,
    module: 'wallet',
    function: 'create_main_wallet',
    arguments: [],
  });
}

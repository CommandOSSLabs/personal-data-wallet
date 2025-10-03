/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/
import { MoveStruct, type RawTransactionArgument } from '../utils/index';
import { type Transaction } from '@mysten/sui/transactions';
export declare const MainWallet: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    created_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    context_salt: import("@mysten/sui/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    version: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::MainWallet">;
export declare const ContextWallet: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    app_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    context_id: import("@mysten/sui/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    main_wallet_id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    policy_ref: import("@mysten/sui/bcs").BcsType<string | null, string | null | undefined, "Option<string>">;
    created_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
    permissions: import("@mysten/sui/bcs").BcsType<string[], Iterable<string> & {
        length: number;
    }, string>;
}, "@local-pkg/pdw::wallet::ContextWallet">;
export declare const WalletRegistry: MoveStruct<{
    id: MoveStruct<{
        id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    }, "0x2::object::UID">;
    wallets: import("@mysten/sui/bcs").BcsType<string[], Iterable<string | Uint8Array<ArrayBufferLike>> & {
        length: number;
    }, string>;
}, "@local-pkg/pdw::wallet::WalletRegistry">;
export declare const MainWalletCreated: MoveStruct<{
    wallet_id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    created_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::MainWalletCreated">;
export declare const ContextWalletCreated: MoveStruct<{
    wallet_id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    app_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    context_id: import("@mysten/sui/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    owner: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    main_wallet_id: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    created_at: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::ContextWalletCreated">;
export declare const ContextWalletAccessed: MoveStruct<{
    context_id: import("@mysten/sui/bcs").BcsType<number[], Iterable<number> & {
        length: number;
    }, string>;
    app_id: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    accessed_by: import("@mysten/sui/bcs").BcsType<string, string | Uint8Array<ArrayBufferLike>, "bytes[32]">;
    operation: import("@mysten/sui/bcs").BcsType<string, string, "string">;
    timestamp: import("@mysten/sui/bcs").BcsType<string, string | number | bigint, "u64">;
}, "@local-pkg/pdw::wallet::ContextWalletAccessed">;
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
export declare function createContextWallet(options: CreateContextWalletOptions): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
/**
 * Create a new main wallet for a user
 */
export declare function createMainWallet(options?: {
    package?: string;
}): (tx: Transaction) => import("@mysten/sui/transactions").TransactionResult;
//# sourceMappingURL=wallet.d.ts.map
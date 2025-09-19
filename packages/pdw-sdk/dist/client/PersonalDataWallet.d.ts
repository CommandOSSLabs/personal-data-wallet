/**
 * PersonalDataWallet Client Extension
 *
 * Main client extension that follows MystenLabs patterns for Sui ecosystem SDKs.
 * Provides a composable API for memory management, chat, storage, and encryption.
 */
import type { ClientWithCoreApi, PDWConfig } from '../types';
import { MemoryService } from '../memory/MemoryService';
import { ChatService } from '../chat/ChatService';
import { StorageService } from '../storage/StorageService';
import { EncryptionService } from '../encryption/EncryptionService';
import { TransactionService } from '../transactions/TransactionService';
import { ViewService } from '../view/ViewService';
export interface PersonalDataWalletExtension {
    createMemory: MemoryService['createMemory'];
    searchMemories: MemoryService['searchMemories'];
    getMemoryContext: MemoryService['getMemoryContext'];
    uploadToStorage: StorageService['upload'];
    retrieveFromStorage: StorageService['retrieve'];
    tx: {
        createMemoryRecord: TransactionService['buildCreateMemoryRecord'];
        updateMemoryMetadata: TransactionService['buildUpdateMemoryMetadata'];
        deleteMemoryRecord: TransactionService['buildDeleteMemoryRecord'];
        grantAccess: TransactionService['buildGrantAccess'];
        revokeAccess: TransactionService['buildRevokeAccess'];
        registerContent: TransactionService['buildRegisterContent'];
        executeBatch: TransactionService['executeBatch'];
    };
    call: {
        createMemoryRecord: TransactionService['createMemoryRecord'];
        updateMemoryMetadata: TransactionService['updateMemoryMetadata'];
        deleteMemoryRecord: TransactionService['deleteMemoryRecord'];
        grantAccess: TransactionService['grantAccess'];
        revokeAccess: TransactionService['revokeAccess'];
        executeBatch: TransactionService['executeBatch'];
    };
    view: {
        getUserMemories: ViewService['getUserMemories'];
        getMemoryIndex: ViewService['getMemoryIndex'];
        getMemory: ViewService['getMemory'];
        getMemoryStats: ViewService['getMemoryStats'];
        getChatSessions: ChatService['getSessions'];
        getChatSession: ChatService['getSession'];
        getAccessPermissions: ViewService['getAccessPermissions'];
        getContentRegistry: ViewService['getContentRegistry'];
        objectExists: ViewService['objectExists'];
        getObjectType: ViewService['getObjectType'];
        findMemoryByContentHash: ViewService['findMemoryByContentHash'];
    };
    bcs: {
        Memory: () => any;
        MemoryIndex: () => any;
        MemoryMetadata: () => any;
        AccessControl: () => any;
    };
    memory: MemoryService;
    chat: ChatService;
    storage: StorageService;
    encryption: EncryptionService;
    viewService: ViewService;
    config: PDWConfig;
}
export declare class PersonalDataWallet {
    #private;
    constructor(client: ClientWithCoreApi, config?: Partial<PDWConfig>);
    createMemory: MemoryService['createMemory'];
    searchMemories: MemoryService['searchMemories'];
    getMemoryContext: MemoryService['getMemoryContext'];
    uploadToStorage: StorageService['upload'];
    retrieveFromStorage: StorageService['retrieve'];
    get tx(): {
        createMemoryRecord: (options: import("../types").CreateMemoryRecordTxOptions) => import("@mysten/sui/dist/cjs/transactions").Transaction;
        updateMemoryMetadata: (options: import("../types").UpdateMemoryMetadataTxOptions) => import("@mysten/sui/dist/cjs/transactions").Transaction;
        deleteMemoryRecord: (options: import("../types").DeleteMemoryRecordTxOptions) => import("@mysten/sui/dist/cjs/transactions").Transaction;
        grantAccess: (options: import("../types").GrantAccessTxOptions) => import("@mysten/sui/dist/cjs/transactions").Transaction;
        revokeAccess: (options: import("../types").RevokeAccessTxOptions) => import("@mysten/sui/dist/cjs/transactions").Transaction;
        registerContent: (options: import("../types").RegisterContentTxOptions) => import("@mysten/sui/dist/cjs/transactions").Transaction;
        executeBatch: (operations: Array<{
            type: "createMemory" | "updateMemory" | "deleteMemory" | "grantAccess" | "revokeAccess";
            options: any;
        }>, signer: any, txOptions?: import("../types").TransactionOptions) => Promise<import("../types").TransactionResult>;
    };
    get call(): {
        createMemoryRecord: (options: import("../types").CreateMemoryRecordTxOptions, signer: any) => Promise<import("../types").TransactionResult>;
        updateMemoryMetadata: (options: import("../types").UpdateMemoryMetadataTxOptions, signer: any) => Promise<import("../types").TransactionResult>;
        deleteMemoryRecord: (options: import("../types").DeleteMemoryRecordTxOptions, signer: any) => Promise<import("../types").TransactionResult>;
        grantAccess: (options: import("../types").GrantAccessTxOptions, signer: any) => Promise<import("../types").TransactionResult>;
        revokeAccess: (options: import("../types").RevokeAccessTxOptions, signer: any) => Promise<import("../types").TransactionResult>;
        executeBatch: (operations: Array<{
            type: "createMemory" | "updateMemory" | "deleteMemory" | "grantAccess" | "revokeAccess";
            options: any;
        }>, signer: any, txOptions?: import("../types").TransactionOptions) => Promise<import("../types").TransactionResult>;
    };
    get view(): {
        getUserMemories: (userAddress: string, options?: {
            limit?: number;
            cursor?: string;
            category?: string;
        }) => Promise<{
            data: import("../view/ViewService").MemoryRecord[];
            nextCursor?: string;
            hasMore: boolean;
        }>;
        getMemoryIndex: (userAddress: string) => Promise<import("../view/ViewService").MemoryIndex | null>;
        getMemory: (memoryId: string) => Promise<import("../view/ViewService").MemoryRecord | null>;
        getMemoryStats: (userAddress: string) => Promise<import("../view/ViewService").MemoryStats>;
        getChatSessions: (userAddress: string) => Promise<import("../types").ChatSessionsResponse>;
        getChatSession: (sessionId: string, userAddress: string) => Promise<import("../types").ChatSessionResponse>;
        getStorageStats: () => import("../types").StorageStats;
        listStoredItems: (filter?: import("../types").StorageFilter) => Promise<Array<{
            blobId: string;
            metadata: import("../types").StorageMetadata;
        }>>;
        getAccessPermissions: (userAddress: string, options?: {
            asGrantor?: boolean;
            asGrantee?: boolean;
            activeOnly?: boolean;
        }) => Promise<import("../view/ViewService").AccessPermission[]>;
        getContentRegistry: (options?: {
            owner?: string;
            limit?: number;
            cursor?: string;
        }) => Promise<{
            data: import("../view/ViewService").ContentRegistry[];
            nextCursor?: string;
            hasMore: boolean;
        }>;
        objectExists: (objectId: string) => Promise<boolean>;
        getObjectType: (objectId: string) => Promise<string | null>;
        findMemoryByContentHash: (contentHash: string) => Promise<import("../view/ViewService").MemoryRecord[]>;
    };
    get bcs(): {
        Memory: any;
        MemoryIndex: any;
        MemoryMetadata: any;
        MemoryCreated: any;
        MemoryIndexUpdated: any;
        MemoryMetadataUpdated: any;
        ContentRegistry: any;
        AccessPermission: any;
        AccessLog: any;
        RegistryCreated: any;
        AccessGranted: any;
        AccessRevoked: any;
    };
    get memory(): MemoryService;
    get chat(): ChatService;
    get storage(): StorageService;
    get encryption(): EncryptionService;
    get config(): PDWConfig;
    get viewService(): ViewService;
    static asClientExtension(config?: Partial<PDWConfig>): {
        name: "pdw";
        register: (client: any) => PersonalDataWallet;
    };
}
export default PersonalDataWallet;
//# sourceMappingURL=PersonalDataWallet.d.ts.map
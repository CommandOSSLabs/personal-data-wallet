/**
 * PersonalDataWallet Client Extension
 *
 * Main client extension that follows MystenLabs patterns for Sui ecosystem SDKs.
 * Provides a composable API for memory management, chat, storage, and encryption.
 */
import type { ClientWithCoreApi, PDWConfig } from '../types';
import { MemoryService } from '../services/MemoryService';
import { ChatService } from '../services/ChatService';
import { StorageService } from '../services/StorageService';
import { EncryptionService } from '../services/EncryptionService';
import { TransactionService } from '../services/TransactionService';
import { ViewService } from '../view/ViewService';
import { MainWalletService } from '../wallet/MainWalletService';
import { ContextWalletService } from '../wallet/ContextWalletService';
import { PermissionService } from '../access/PermissionService';
import { AggregationService } from '../aggregation/AggregationService';
import type { ConsentRepository } from '../permissions/ConsentRepository';
export interface PersonalDataWalletExtension {
    createMemory: MemoryService['createMemory'];
    searchMemories: MemoryService['searchMemories'];
    getMemoryContext: MemoryService['getMemoryContext'];
    setConsentRepository: (repository?: ConsentRepository) => void;
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
    wallet: {
        getMainWallet: MainWalletService['getMainWallet'];
        createMainWallet: MainWalletService['createMainWallet'];
        deriveContextId: MainWalletService['deriveContextId'];
        rotateKeys: MainWalletService['rotateKeys'];
        ensureMainWallet: MainWalletService['ensureMainWallet'];
    };
    context: {
        create: ContextWalletService['create'];
        getContext: ContextWalletService['getContext'];
        listUserContexts: ContextWalletService['listUserContexts'];
        addData: ContextWalletService['addData'];
        removeData: ContextWalletService['removeData'];
        listData: ContextWalletService['listData'];
        ensureContext: ContextWalletService['ensureContext'];
    };
    access: {
        requestConsent: PermissionService['requestConsent'];
        grantPermissions: PermissionService['grantPermissions'];
        revokePermissions: PermissionService['revokePermissions'];
        checkPermission: PermissionService['checkPermission'];
        getGrantsByUser: PermissionService['getGrantsByUser'];
        validateOAuthPermission: PermissionService['validateOAuthPermission'];
    };
    aggregate: {
        query: AggregationService['query'];
        queryWithScopes: AggregationService['queryWithScopes'];
        search: AggregationService['search'];
        getAggregatedStats: AggregationService['getAggregatedStats'];
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
    mainWalletService: MainWalletService;
    contextWalletService: ContextWalletService;
    permissionService: PermissionService;
    aggregationService: AggregationService;
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
    setConsentRepository(repository?: ConsentRepository): void;
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
        getStorageStats: () => {
            network: "testnet" | "mainnet";
            useUploadRelay: boolean;
            epochs: number;
            hasEncryption: boolean;
            hasBatching: boolean;
            hasSearch: boolean;
            indexedUsers: number;
            totalIndexedMemories: number;
            memoryIndexStats: {
                totalUsers: number;
                totalMemories: number;
                hnswStats: import("../vector").BatchStats;
                hasEmbeddingService: boolean;
                hasStorageService: boolean;
            } | undefined;
        };
        listStoredItems: (filter?: any) => Promise<Array<{
            blobId: string;
            metadata: import("../services/StorageService").MemoryMetadata;
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
    get wallet(): {
        getMainWallet: (userAddress: string) => Promise<import("..").MainWallet | null>;
        createMainWallet: (options: import("..").CreateMainWalletOptions) => Promise<import("..").MainWallet>;
        deriveContextId: (options: import("..").DeriveContextIdOptions) => Promise<string>;
        rotateKeys: (options: import("..").RotateKeysOptions) => Promise<import("..").RotateKeysResult>;
        ensureMainWallet: (userAddress: string) => Promise<import("..").MainWallet>;
    };
    get context(): {
        create: (userAddress: string, options: import("..").CreateContextWalletOptions, signer: any) => Promise<import("..").ContextWallet>;
        getContext: (contextId: string) => Promise<import("..").ContextWallet | null>;
        listUserContexts: (userAddress: string) => Promise<import("..").ContextWallet[]>;
        addData: (contextId: string, data: {
            content: string;
            category?: string;
            metadata?: Record<string, any>;
        }) => Promise<string>;
        removeData: (contextId: string, itemId: string) => Promise<boolean>;
        listData: (contextId: string, filters?: {
            category?: string;
            limit?: number;
            offset?: number;
        }) => Promise<Array<{
            id: string;
            content: string;
            category?: string;
            metadata?: Record<string, any>;
            createdAt: number;
        }>>;
        ensureContext: (userAddress: string, appId: string, signer: any) => Promise<import("..").ContextWallet>;
    };
    get access(): {
        requestConsent: (options: import("..").RequestConsentOptions) => Promise<import("..").ConsentRequestRecord>;
        grantPermissions: (userAddress: string, options: import("..").GrantPermissionsOptions & {
            signer?: import("@mysten/sui/dist/cjs/cryptography").Signer;
        }) => Promise<import("..").AccessGrant>;
        revokePermissions: (userAddress: string, options: import("..").RevokePermissionsOptions & {
            signer?: import("@mysten/sui/dist/cjs/cryptography").Signer;
        }) => Promise<boolean>;
        checkPermission: (appId: string, scope: import("..").PermissionScope, userAddressOrTargetWallet: string) => Promise<boolean>;
        getGrantsByUser: (userAddress: string) => Promise<import("..").AccessGrant[]>;
        validateOAuthPermission: (walletOwner: string, appId: string, requestedScope: string) => Promise<boolean>;
    };
    get aggregate(): {
        query: (options: import("..").AggregatedQueryOptions) => Promise<import("../aggregation/AggregationService").AggregatedQueryResult>;
        queryWithScopes: (requestingWallet: string, userAddress: string, query: string, scopes: import("..").PermissionScope[]) => Promise<import("../aggregation/AggregationService").AggregatedQueryResult>;
        search: (requestingWallet: string, userAddress: string, searchQuery: string, options?: {
            targetWallets?: string[];
            categories?: string[];
            limit?: number;
            minPermissionScope?: import("..").PermissionScope;
        }) => Promise<import("../aggregation/AggregationService").AggregatedQueryResult>;
        getAggregatedStats: (userAddress: string, targetWallets: string[]) => Promise<{
            totalContexts: number;
            totalItems: number;
            totalSize: number;
            categoryCounts: Record<string, number>;
            contextBreakdown: Record<string, {
                items: number;
                size: number;
                lastActivity: number;
            }>;
            appBreakdown?: Record<string, {
                items: number;
                size: number;
                lastActivity: number;
            }>;
        }>;
    };
    get memory(): MemoryService;
    get chat(): ChatService;
    get storage(): StorageService;
    get encryption(): EncryptionService;
    get config(): PDWConfig;
    get viewService(): ViewService;
    get mainWalletService(): MainWalletService;
    get contextWalletService(): ContextWalletService;
    get permissionService(): PermissionService;
    get aggregationService(): AggregationService;
    static asClientExtension(config?: Partial<PDWConfig>): {
        name: "pdw";
        register: (client: any) => PersonalDataWallet;
    };
}
export default PersonalDataWallet;
//# sourceMappingURL=PersonalDataWallet.d.ts.map
"use strict";
/**
 * PersonalDataWallet Client Extension
 *
 * Main client extension that follows MystenLabs patterns for Sui ecosystem SDKs.
 * Provides a composable API for memory management, chat, storage, and encryption.
 */
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PersonalDataWallet_client, _PersonalDataWallet_config, _PersonalDataWallet_apiClient, _PersonalDataWallet_transactions, _PersonalDataWallet_view, _PersonalDataWallet_memory, _PersonalDataWallet_chat, _PersonalDataWallet_storage, _PersonalDataWallet_encryption, _PersonalDataWallet_mainWallet, _PersonalDataWallet_contextWallet, _PersonalDataWallet_permission, _PersonalDataWallet_aggregation;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalDataWallet = void 0;
const MemoryService_1 = require("../services/MemoryService");
const ChatService_1 = require("../services/ChatService");
const StorageService_1 = require("../services/StorageService");
const EncryptionService_1 = require("../services/EncryptionService");
const TransactionService_1 = require("../services/TransactionService");
const ViewService_1 = require("../view/ViewService");
const MainWalletService_1 = require("../wallet/MainWalletService");
const ContextWalletService_1 = require("../wallet/ContextWalletService");
const PermissionService_1 = require("../access/PermissionService");
const AggregationService_1 = require("../aggregation/AggregationService");
const client_1 = require("../api/client");
const defaults_1 = require("../config/defaults");
const validation_1 = require("../config/validation");
class PersonalDataWallet {
    constructor(client, config) {
        _PersonalDataWallet_client.set(this, void 0);
        _PersonalDataWallet_config.set(this, void 0);
        _PersonalDataWallet_apiClient.set(this, void 0);
        _PersonalDataWallet_transactions.set(this, void 0);
        _PersonalDataWallet_view.set(this, void 0);
        _PersonalDataWallet_memory.set(this, void 0);
        _PersonalDataWallet_chat.set(this, void 0);
        _PersonalDataWallet_storage.set(this, void 0);
        _PersonalDataWallet_encryption.set(this, void 0);
        _PersonalDataWallet_mainWallet.set(this, void 0);
        _PersonalDataWallet_contextWallet.set(this, void 0);
        _PersonalDataWallet_permission.set(this, void 0);
        _PersonalDataWallet_aggregation.set(this, void 0);
        __classPrivateFieldSet(this, _PersonalDataWallet_client, client, "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_config, (0, validation_1.validateConfig)({ ...(0, defaults_1.createDefaultConfig)(), ...config }), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_apiClient, new client_1.PDWApiClient(__classPrivateFieldGet(this, _PersonalDataWallet_config, "f").apiUrl), "f");
        // Initialize services
        __classPrivateFieldSet(this, _PersonalDataWallet_transactions, new TransactionService_1.TransactionService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_view, new ViewService_1.ViewService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_memory, new MemoryService_1.MemoryService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_chat, new ChatService_1.ChatService(__classPrivateFieldGet(this, _PersonalDataWallet_apiClient, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_storage, new StorageService_1.StorageService(__classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_encryption, new EncryptionService_1.EncryptionService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        // Initialize wallet architecture services
        __classPrivateFieldSet(this, _PersonalDataWallet_mainWallet, new MainWalletService_1.MainWalletService({
            suiClient: client.client || client,
            packageId: __classPrivateFieldGet(this, _PersonalDataWallet_config, "f").packageId || ''
        }), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_contextWallet, new ContextWalletService_1.ContextWalletService({
            suiClient: client.client || client,
            packageId: __classPrivateFieldGet(this, _PersonalDataWallet_config, "f").packageId || '',
            mainWalletService: __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f"),
            storageService: __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f"),
            encryptionService: __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f")
        }), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_permission, new PermissionService_1.PermissionService({
            suiClient: client.client || client,
            packageId: __classPrivateFieldGet(this, _PersonalDataWallet_config, "f").packageId || '',
            accessRegistryId: __classPrivateFieldGet(this, _PersonalDataWallet_config, "f").accessRegistryId || '',
            apiUrl: __classPrivateFieldGet(this, _PersonalDataWallet_config, "f").apiUrl,
            contextWalletService: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")
        }), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_aggregation, new AggregationService_1.AggregationService({
            suiClient: client.client || client,
            packageId: __classPrivateFieldGet(this, _PersonalDataWallet_config, "f").packageId || '',
            permissionService: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f"),
            contextWalletService: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")
        }), "f");
        // Bind methods after services are initialized
        this.createMemory = __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").createMemory.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"));
        this.searchMemories = __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").searchMemories.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"));
        this.getMemoryContext = __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").getMemoryContext.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"));
        this.uploadToStorage = __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f").upload.bind(__classPrivateFieldGet(this, _PersonalDataWallet_storage, "f"));
        this.retrieveFromStorage = __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f").retrieve.bind(__classPrivateFieldGet(this, _PersonalDataWallet_storage, "f"));
    }
    setConsentRepository(repository) {
        __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").setConsentRepository(repository);
    }
    // Transaction builders
    get tx() {
        return {
            createMemoryRecord: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").buildCreateMemoryRecord.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            updateMemoryMetadata: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").buildUpdateMemoryMetadata.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            deleteMemoryRecord: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").buildDeleteMemoryRecord.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            grantAccess: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").buildGrantAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            revokeAccess: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").buildRevokeAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            registerContent: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").buildRegisterContent.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            executeBatch: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").executeBatch.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
        };
    }
    // Transaction execution (async thunks)
    get call() {
        return {
            createMemoryRecord: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").createMemoryRecord.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            updateMemoryMetadata: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").updateMemoryMetadata.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            deleteMemoryRecord: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").deleteMemoryRecord.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            grantAccess: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").grantAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            revokeAccess: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").revokeAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
            executeBatch: __classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f").executeBatch.bind(__classPrivateFieldGet(this, _PersonalDataWallet_transactions, "f")),
        };
    }
    // View methods
    get view() {
        return {
            getUserMemories: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getUserMemories.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            getMemoryIndex: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getMemoryIndex.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            getMemory: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getMemory.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            getMemoryStats: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getMemoryStats.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            getChatSessions: __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").getSessions.bind(__classPrivateFieldGet(this, _PersonalDataWallet_chat, "f")),
            getChatSession: __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").getSession.bind(__classPrivateFieldGet(this, _PersonalDataWallet_chat, "f")),
            getStorageStats: __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f").getStats.bind(__classPrivateFieldGet(this, _PersonalDataWallet_storage, "f")),
            listStoredItems: __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f").list.bind(__classPrivateFieldGet(this, _PersonalDataWallet_storage, "f")),
            getAccessPermissions: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getAccessPermissions.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            getContentRegistry: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getContentRegistry.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            objectExists: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").objectExists.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            getObjectType: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").getObjectType.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
            findMemoryByContentHash: __classPrivateFieldGet(this, _PersonalDataWallet_view, "f").findMemoryByContentHash.bind(__classPrivateFieldGet(this, _PersonalDataWallet_view, "f")),
        };
    }
    // BCS types from generated contracts
    get bcs() {
        // Import generated types dynamically to avoid circular dependencies
        const memoryTypes = require('../generated/pdw/memory.js');
        const sealTypes = require('../generated/pdw/seal_access_control.js');
        return {
            Memory: memoryTypes.Memory,
            MemoryIndex: memoryTypes.MemoryIndex,
            MemoryMetadata: memoryTypes.MemoryMetadata,
            MemoryCreated: memoryTypes.MemoryCreated,
            MemoryIndexUpdated: memoryTypes.MemoryIndexUpdated,
            MemoryMetadataUpdated: memoryTypes.MemoryMetadataUpdated,
            // SEAL Access Control types
            ContentRegistry: sealTypes.ContentRegistry,
            AccessPermission: sealTypes.AccessPermission,
            AccessLog: sealTypes.AccessLog,
            RegistryCreated: sealTypes.RegistryCreated,
            AccessGranted: sealTypes.AccessGranted,
            AccessRevoked: sealTypes.AccessRevoked,
        };
    }
    // Wallet architecture service getters
    get wallet() {
        return {
            getMainWallet: __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f").getMainWallet.bind(__classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f")),
            createMainWallet: __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f").createMainWallet.bind(__classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f")),
            deriveContextId: __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f").deriveContextId.bind(__classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f")),
            rotateKeys: __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f").rotateKeys.bind(__classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f")),
            ensureMainWallet: __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f").ensureMainWallet.bind(__classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f")),
        };
    }
    get context() {
        return {
            create: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").create.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
            getContext: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").getContext.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
            listUserContexts: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").listUserContexts.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
            addData: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").addData.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
            removeData: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").removeData.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
            listData: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").listData.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
            ensureContext: __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f").ensureContext.bind(__classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f")),
        };
    }
    get access() {
        return {
            requestConsent: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").requestConsent.bind(__classPrivateFieldGet(this, _PersonalDataWallet_permission, "f")),
            grantPermissions: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").grantPermissions.bind(__classPrivateFieldGet(this, _PersonalDataWallet_permission, "f")),
            revokePermissions: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").revokePermissions.bind(__classPrivateFieldGet(this, _PersonalDataWallet_permission, "f")),
            checkPermission: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").checkPermission.bind(__classPrivateFieldGet(this, _PersonalDataWallet_permission, "f")),
            getGrantsByUser: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").getGrantsByUser.bind(__classPrivateFieldGet(this, _PersonalDataWallet_permission, "f")),
            validateOAuthPermission: __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f").validateOAuthPermission.bind(__classPrivateFieldGet(this, _PersonalDataWallet_permission, "f")),
        };
    }
    get aggregate() {
        return {
            query: __classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f").query.bind(__classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f")),
            queryWithScopes: __classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f").queryWithScopes.bind(__classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f")),
            search: __classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f").search.bind(__classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f")),
            getAggregatedStats: __classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f").getAggregatedStats.bind(__classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f")),
        };
    }
    // Service instances
    get memory() { return __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"); }
    get chat() { return __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f"); }
    get storage() { return __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f"); }
    get encryption() { return __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f"); }
    get config() { return __classPrivateFieldGet(this, _PersonalDataWallet_config, "f"); }
    get viewService() { return __classPrivateFieldGet(this, _PersonalDataWallet_view, "f"); }
    get mainWalletService() { return __classPrivateFieldGet(this, _PersonalDataWallet_mainWallet, "f"); }
    get contextWalletService() { return __classPrivateFieldGet(this, _PersonalDataWallet_contextWallet, "f"); }
    get permissionService() { return __classPrivateFieldGet(this, _PersonalDataWallet_permission, "f"); }
    get aggregationService() { return __classPrivateFieldGet(this, _PersonalDataWallet_aggregation, "f"); }
    // Client extension factory
    static asClientExtension(config) {
        return {
            name: 'pdw',
            register: (client) => {
                // Adapt the client to match our expected interface
                const adaptedClient = {
                    core: {
                        getObject: (objectId) => client.getObject({ id: objectId }),
                        getObjects: (objectIds) => client.getObjects(objectIds.map(id => ({ id }))),
                        executeTransaction: (tx) => client.executeTransactionBlock({ transactionBlock: tx }),
                    },
                    $extend: client.$extend.bind(client),
                };
                return new PersonalDataWallet(adaptedClient, config);
            },
        };
    }
}
exports.PersonalDataWallet = PersonalDataWallet;
_PersonalDataWallet_client = new WeakMap(), _PersonalDataWallet_config = new WeakMap(), _PersonalDataWallet_apiClient = new WeakMap(), _PersonalDataWallet_transactions = new WeakMap(), _PersonalDataWallet_view = new WeakMap(), _PersonalDataWallet_memory = new WeakMap(), _PersonalDataWallet_chat = new WeakMap(), _PersonalDataWallet_storage = new WeakMap(), _PersonalDataWallet_encryption = new WeakMap(), _PersonalDataWallet_mainWallet = new WeakMap(), _PersonalDataWallet_contextWallet = new WeakMap(), _PersonalDataWallet_permission = new WeakMap(), _PersonalDataWallet_aggregation = new WeakMap();
// Export for easier usage
exports.default = PersonalDataWallet;
//# sourceMappingURL=PersonalDataWallet.js.map
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
var _PersonalDataWallet_client, _PersonalDataWallet_config, _PersonalDataWallet_memory, _PersonalDataWallet_chat, _PersonalDataWallet_storage, _PersonalDataWallet_encryption;
import { MemoryService } from '../memory/MemoryService';
import { ChatService } from '../chat/ChatService';
import { StorageService } from '../storage/StorageService';
import { EncryptionService } from '../encryption/EncryptionService';
import { createDefaultConfig } from '../config/defaults';
import { validateConfig } from '../config/validation';
export class PersonalDataWallet {
    constructor(client, config) {
        _PersonalDataWallet_client.set(this, void 0);
        _PersonalDataWallet_config.set(this, void 0);
        _PersonalDataWallet_memory.set(this, void 0);
        _PersonalDataWallet_chat.set(this, void 0);
        _PersonalDataWallet_storage.set(this, void 0);
        _PersonalDataWallet_encryption.set(this, void 0);
        __classPrivateFieldSet(this, _PersonalDataWallet_client, client, "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_config, validateConfig({ ...createDefaultConfig(), ...config }), "f");
        // Initialize services
        __classPrivateFieldSet(this, _PersonalDataWallet_memory, new MemoryService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_chat, new ChatService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_storage, new StorageService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        __classPrivateFieldSet(this, _PersonalDataWallet_encryption, new EncryptionService(client, __classPrivateFieldGet(this, _PersonalDataWallet_config, "f")), "f");
        // Bind methods after services are initialized
        this.createMemory = __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").createMemory.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"));
        this.searchMemories = __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").searchMemories.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"));
        this.getMemoryContext = __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").getMemoryContext.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"));
        this.startChat = __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").startChat.bind(__classPrivateFieldGet(this, _PersonalDataWallet_chat, "f"));
    }
    // Transaction builders
    get tx() {
        return {
            createMemoryRecord: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").tx.createMemoryRecord.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").tx),
            deleteMemory: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").tx.deleteMemory.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").tx),
            updateMemoryMetadata: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").tx.updateMemoryMetadata.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").tx),
            grantAccess: __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").tx.grantAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").tx),
            revokeAccess: __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").tx.revokeAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").tx),
        };
    }
    // Move call builders
    get call() {
        return {
            createMemoryRecord: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").call.createMemoryRecord.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").call),
            deleteMemory: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").call.deleteMemory.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").call),
            updateMemoryIndex: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").call.updateMemoryIndex.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").call),
            grantAccess: __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").call.grantAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").call),
            revokeAccess: __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").call.revokeAccess.bind(__classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").call),
        };
    }
    // View methods
    get view() {
        return {
            getUserMemories: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view.getUserMemories.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view),
            getMemoryIndex: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view.getMemoryIndex.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view),
            getMemory: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view.getMemory.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view),
            getMemoryStats: __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view.getMemoryStats.bind(__classPrivateFieldGet(this, _PersonalDataWallet_memory, "f").view),
            getChatSessions: __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").view.getChatSessions.bind(__classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").view),
            getChatSession: __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").view.getChatSession.bind(__classPrivateFieldGet(this, _PersonalDataWallet_chat, "f").view),
            getAccessPermissions: __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").view.getAccessPermissions.bind(__classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f").view),
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
    // Service instances
    get memory() { return __classPrivateFieldGet(this, _PersonalDataWallet_memory, "f"); }
    get chat() { return __classPrivateFieldGet(this, _PersonalDataWallet_chat, "f"); }
    get storage() { return __classPrivateFieldGet(this, _PersonalDataWallet_storage, "f"); }
    get encryption() { return __classPrivateFieldGet(this, _PersonalDataWallet_encryption, "f"); }
    get config() { return __classPrivateFieldGet(this, _PersonalDataWallet_config, "f"); }
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
_PersonalDataWallet_client = new WeakMap(), _PersonalDataWallet_config = new WeakMap(), _PersonalDataWallet_memory = new WeakMap(), _PersonalDataWallet_chat = new WeakMap(), _PersonalDataWallet_storage = new WeakMap(), _PersonalDataWallet_encryption = new WeakMap();
// Export for easier usage
export default PersonalDataWallet;
//# sourceMappingURL=PersonalDataWallet.js.map
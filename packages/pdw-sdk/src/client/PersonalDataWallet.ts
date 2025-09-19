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
import { PDWApiClient } from '../api/client';
import { createDefaultConfig } from '../config/defaults';
import { validateConfig } from '../config/validation';

export interface PersonalDataWalletExtension {
  // Top-level imperative methods
  createMemory: MemoryService['createMemory'];
  searchMemories: MemoryService['searchMemories'];
  getMemoryContext: MemoryService['getMemoryContext'];
  
  // Storage methods
  uploadToStorage: StorageService['upload'];
  retrieveFromStorage: StorageService['retrieve'];
  
  // Organized service methods
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
    // Will be populated by generated types from @mysten/codegen
    Memory: () => any;
    MemoryIndex: () => any;
    MemoryMetadata: () => any;
    AccessControl: () => any;
  };
  
  // Service instances for advanced usage
  memory: MemoryService;
  chat: ChatService;
  storage: StorageService;
  encryption: EncryptionService;
  viewService: ViewService;
  
  // Configuration
  config: PDWConfig;
}

export class PersonalDataWallet {
  #client: ClientWithCoreApi;
  #config: PDWConfig;
  #apiClient: PDWApiClient;
  #transactions: TransactionService;
  #view: ViewService;
  #memory: MemoryService;
  #chat: ChatService;
  #storage: StorageService;
  #encryption: EncryptionService;

  constructor(client: ClientWithCoreApi, config?: Partial<PDWConfig>) {
    this.#client = client;
    this.#config = validateConfig({ ...createDefaultConfig(), ...config });
    this.#apiClient = new PDWApiClient(this.#config.apiUrl!);
    
    // Initialize services
    this.#transactions = new TransactionService(client as any, this.#config);
    this.#view = new ViewService(client, this.#config);
    this.#memory = new MemoryService(client, this.#config);
    this.#chat = new ChatService(this.#apiClient);
    this.#storage = new StorageService(this.#config);
    this.#encryption = new EncryptionService(client, this.#config);
    
    // Bind methods after services are initialized
    this.createMemory = this.#memory.createMemory.bind(this.#memory);
    this.searchMemories = this.#memory.searchMemories.bind(this.#memory);
    this.getMemoryContext = this.#memory.getMemoryContext.bind(this.#memory);
    this.uploadToStorage = this.#storage.upload.bind(this.#storage);
    this.retrieveFromStorage = this.#storage.retrieve.bind(this.#storage);
  }

  // Top-level imperative methods (declarations)
  createMemory: MemoryService['createMemory'];
  searchMemories: MemoryService['searchMemories'];
  getMemoryContext: MemoryService['getMemoryContext'];
  uploadToStorage: StorageService['upload'];
  retrieveFromStorage: StorageService['retrieve'];

  // Transaction builders
  get tx() {
    return {
      createMemoryRecord: this.#transactions.buildCreateMemoryRecord.bind(this.#transactions),
      updateMemoryMetadata: this.#transactions.buildUpdateMemoryMetadata.bind(this.#transactions),
      deleteMemoryRecord: this.#transactions.buildDeleteMemoryRecord.bind(this.#transactions),
      grantAccess: this.#transactions.buildGrantAccess.bind(this.#transactions),
      revokeAccess: this.#transactions.buildRevokeAccess.bind(this.#transactions),
      registerContent: this.#transactions.buildRegisterContent.bind(this.#transactions),
      executeBatch: this.#transactions.executeBatch.bind(this.#transactions),
    };
  }

  // Transaction execution (async thunks)
  get call() {
    return {
      createMemoryRecord: this.#transactions.createMemoryRecord.bind(this.#transactions),
      updateMemoryMetadata: this.#transactions.updateMemoryMetadata.bind(this.#transactions),
      deleteMemoryRecord: this.#transactions.deleteMemoryRecord.bind(this.#transactions),
      grantAccess: this.#transactions.grantAccess.bind(this.#transactions),
      revokeAccess: this.#transactions.revokeAccess.bind(this.#transactions),
      executeBatch: this.#transactions.executeBatch.bind(this.#transactions),
    };
  }

  // View methods
  get view() {
    return {
      getUserMemories: this.#view.getUserMemories.bind(this.#view),
      getMemoryIndex: this.#view.getMemoryIndex.bind(this.#view),
      getMemory: this.#view.getMemory.bind(this.#view),
      getMemoryStats: this.#view.getMemoryStats.bind(this.#view),
      getChatSessions: this.#chat.getSessions.bind(this.#chat),
      getChatSession: this.#chat.getSession.bind(this.#chat),
      getStorageStats: this.#storage.getStats.bind(this.#storage),
      listStoredItems: this.#storage.list.bind(this.#storage),
      getAccessPermissions: this.#view.getAccessPermissions.bind(this.#view),
      getContentRegistry: this.#view.getContentRegistry.bind(this.#view),
      objectExists: this.#view.objectExists.bind(this.#view),
      getObjectType: this.#view.getObjectType.bind(this.#view),
      findMemoryByContentHash: this.#view.findMemoryByContentHash.bind(this.#view),
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
  get memory() { return this.#memory; }
  get chat() { return this.#chat; }
  get storage() { return this.#storage; }
  get encryption() { return this.#encryption; }
  get config() { return this.#config; }
  get viewService() { return this.#view; }

  // Client extension factory
  static asClientExtension(config?: Partial<PDWConfig>) {
    return {
      name: 'pdw' as const,
      register: (client: any) => {
        // Adapt the client to match our expected interface
        const adaptedClient: ClientWithCoreApi = {
          core: {
            getObject: (objectId: string) => client.getObject({ id: objectId }),
            getObjects: (objectIds: string[]) => client.getObjects(objectIds.map(id => ({ id }))),
            executeTransaction: (tx: any) => client.executeTransactionBlock({ transactionBlock: tx }),
          },
          $extend: client.$extend.bind(client),
        };
        return new PersonalDataWallet(adaptedClient, config);
      },
    };
  }
}

// Export for easier usage
export default PersonalDataWallet;
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SuiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@mysten/sui/client");
const transactions_1 = require("@mysten/sui/transactions");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
let SuiService = SuiService_1 = class SuiService {
    configService;
    client;
    packageId;
    adminKeypair;
    logger = new common_1.Logger(SuiService_1.name);
    constructor(configService) {
        this.configService = configService;
        const network = this.configService.get('SUI_NETWORK', 'testnet');
        let networkUrl;
        if (network === 'testnet') {
            networkUrl = (0, client_1.getFullnodeUrl)('testnet');
        }
        else if (network === 'mainnet') {
            networkUrl = (0, client_1.getFullnodeUrl)('mainnet');
        }
        else if (network === 'devnet') {
            networkUrl = (0, client_1.getFullnodeUrl)('devnet');
        }
        else if (network === 'localnet') {
            networkUrl = (0, client_1.getFullnodeUrl)('localnet');
        }
        else {
            this.logger.warn(`Invalid SUI_NETWORK: ${network}, falling back to testnet`);
            networkUrl = (0, client_1.getFullnodeUrl)('testnet');
        }
        this.client = new client_1.SuiClient({ url: networkUrl });
        let packageId = this.configService.get('SUI_PACKAGE_ID');
        if (packageId && packageId.length < 66 && packageId.startsWith('0x')) {
            this.logger.warn('Malformed SUI_PACKAGE_ID detected, using default instead');
            packageId = undefined;
        }
        if (!packageId) {
            this.logger.warn('SUI_PACKAGE_ID not provided or invalid, using default');
            this.packageId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
        }
        else {
            this.packageId = packageId;
        }
        this.logger.log(`Using SUI_PACKAGE_ID: ${this.packageId}`);
        let privateKey = this.configService.get('SUI_ADMIN_PRIVATE_KEY');
        try {
            if (privateKey) {
                privateKey = privateKey.replace(/\s+/g, '');
                if (!privateKey.startsWith('0x')) {
                    privateKey = '0x' + privateKey;
                }
                const keyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
                if (keyBuffer.length !== 32) {
                    throw new Error(`Invalid key length: ${keyBuffer.length}, expected 32`);
                }
                this.adminKeypair = ed25519_1.Ed25519Keypair.fromSecretKey(keyBuffer);
                const adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
                this.logger.log(`SUI admin keypair initialized successfully with address: ${adminAddress}`);
            }
            else {
                this.logger.warn('SUI_ADMIN_PRIVATE_KEY not provided, some operations may fail');
            }
        }
        catch (error) {
            this.logger.error(`Failed to initialize admin keypair: ${error.message}`);
            this.logger.warn('Using mock keypair for development');
            this.adminKeypair = new ed25519_1.Ed25519Keypair();
        }
    }
    async getChatSessions(userAddress) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.packageId}::chat_sessions::ChatSession`
                },
                options: {
                    showContent: true,
                },
            });
            const sessions = [];
            for (const item of response.data) {
                if (!item.data?.content)
                    continue;
                const content = item.data.content;
                const fields = content.fields;
                sessions.push({
                    id: item.data.objectId,
                    owner: fields.owner,
                    title: fields.model_name,
                    messages: this.deserializeMessages(fields.messages),
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    message_count: fields.messages.length,
                    sui_object_id: item.data.objectId
                });
            }
            return sessions;
        }
        catch (error) {
            this.logger.error(`Error getting chat sessions: ${error.message}`);
            throw new Error(`Failed to get chat sessions: ${error.message}`);
        }
    }
    async createChatSession(userAddress, modelName) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::chat_sessions::create_session`,
                arguments: [
                    tx.pure.string(modelName),
                ],
            });
            const result = await this.executeTransaction(tx, userAddress);
            const objectId = this.extractCreatedObjectId(result);
            return objectId;
        }
        catch (error) {
            this.logger.error(`Error creating chat session: ${error.message}`);
            throw new Error(`Failed to create chat session: ${error.message}`);
        }
    }
    async addMessageToSession(sessionId, userAddress, role, content) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::chat_sessions::add_message_to_session`,
                arguments: [
                    tx.object(sessionId),
                    tx.pure.string(role),
                    tx.pure.string(content),
                ],
            });
            await this.executeTransaction(tx, userAddress);
            return true;
        }
        catch (error) {
            this.logger.error(`Error adding message to session: ${error.message}`);
            throw new Error(`Failed to add message to session: ${error.message}`);
        }
    }
    async saveSessionSummary(sessionId, userAddress, summary) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::chat_sessions::save_session_summary`,
                arguments: [
                    tx.object(sessionId),
                    tx.pure.string(summary),
                ],
            });
            await this.executeTransaction(tx, userAddress);
            return true;
        }
        catch (error) {
            this.logger.error(`Error saving session summary: ${error.message}`);
            throw new Error(`Failed to save session summary: ${error.message}`);
        }
    }
    async getChatSession(sessionId) {
        try {
            const object = await this.client.getObject({
                id: sessionId,
                options: {
                    showContent: true,
                },
            });
            if (!object || !object.data || !object.data.content) {
                throw new Error(`Chat session ${sessionId} not found`);
            }
            const content = object.data.content;
            return {
                owner: content.fields.owner,
                modelName: content.fields.model_name,
                messages: this.deserializeMessages(content.fields.messages),
                summary: content.fields.summary,
            };
        }
        catch (error) {
            this.logger.error(`Error getting chat session: ${error.message}`);
            throw new Error(`Failed to get chat session: ${error.message}`);
        }
    }
    async deleteSession(sessionId, userAddress) {
        try {
            const session = await this.getChatSession(sessionId);
            if (session.owner !== userAddress) {
                throw new Error('You do not own this session');
            }
            const tx = new transactions_1.Transaction();
            tx.transferObjects([tx.object(sessionId)], tx.pure.address('0x000000000000000000000000000000000000000000000000000000000000dead'));
            await this.executeTransaction(tx, userAddress);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting session: ${error.message}`);
            throw new Error(`Failed to delete session: ${error.message}`);
        }
    }
    async updateSessionTitle(sessionId, userAddress, title) {
        try {
            const session = await this.getChatSession(sessionId);
            if (session.owner !== userAddress) {
                throw new Error('You do not own this session');
            }
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating session title: ${error.message}`);
            throw new Error(`Failed to update session title: ${error.message}`);
        }
    }
    async createMemoryRecord(userAddress, category, vectorId, blobId) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::memory::create_memory_record`,
                arguments: [
                    tx.pure.string(category),
                    tx.pure.u64(vectorId),
                    tx.pure.string(blobId),
                ],
            });
            const result = await this.executeTransaction(tx, userAddress);
            const objectId = this.extractCreatedObjectId(result);
            return objectId;
        }
        catch (error) {
            this.logger.error(`Error creating memory record: ${error.message}`);
            throw new Error(`Failed to create memory record: ${error.message}`);
        }
    }
    async createMemoryIndex(userAddress, indexBlobId, graphBlobId) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::memory::create_memory_index`,
                arguments: [
                    tx.pure.string(indexBlobId),
                    tx.pure.string(graphBlobId),
                ],
            });
            const result = await this.executeTransaction(tx, userAddress);
            const objectId = this.extractCreatedObjectId(result);
            return objectId;
        }
        catch (error) {
            this.logger.error(`Error creating memory index: ${error.message}`);
            throw new Error(`Failed to create memory index: ${error.message}`);
        }
    }
    async updateMemoryIndex(indexId, userAddress, expectedVersion, newIndexBlobId, newGraphBlobId) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.packageId}::memory::update_memory_index`,
                arguments: [
                    tx.object(indexId),
                    tx.pure.u64(expectedVersion),
                    tx.pure.string(newIndexBlobId),
                    tx.pure.string(newGraphBlobId),
                ],
            });
            await this.executeTransaction(tx, userAddress);
            return true;
        }
        catch (error) {
            this.logger.error(`Error updating memory index: ${error.message}`);
            throw new Error(`Failed to update memory index: ${error.message}`);
        }
    }
    async getMemoryIndex(indexId) {
        try {
            const object = await this.client.getObject({
                id: indexId,
                options: {
                    showContent: true,
                },
            });
            if (!object || !object.data || !object.data.content) {
                throw new Error(`Memory index ${indexId} not found`);
            }
            const content = object.data.content;
            return {
                owner: content.fields.owner,
                version: Number(content.fields.version),
                indexBlobId: content.fields.index_blob_id,
                graphBlobId: content.fields.graph_blob_id,
            };
        }
        catch (error) {
            this.logger.error(`Error getting memory index: ${error.message}`);
            throw new Error(`Failed to get memory index: ${error.message}`);
        }
    }
    async getMemoriesWithVectorId(userAddress, vectorId) {
        try {
            const response = await this.client.queryTransactionBlocks({
                filter: {
                    MoveFunction: {
                        package: this.packageId,
                        module: 'memory',
                        function: 'create_memory_record',
                    },
                },
                options: {
                    showInput: true,
                    showEffects: true,
                    showEvents: true,
                },
            });
            const memories = [];
            for (const tx of response.data) {
                for (const event of tx.events || []) {
                    if (event.type.includes('::memory::MemoryCreated')) {
                        const parsedData = event.parsedJson;
                        if (parsedData &&
                            parsedData.owner === userAddress &&
                            Number(parsedData.vector_id) === vectorId) {
                            const objectChanges = tx.objectChanges || [];
                            const createdMemory = objectChanges.find(change => change.type === 'created' &&
                                change.objectType.includes('::memory::Memory'));
                            if (createdMemory) {
                                const memory = await this.client.getObject({
                                    id: createdMemory.objectId || '',
                                    options: { showContent: true },
                                });
                                if (memory && memory.data && memory.data.content) {
                                    const content = memory.data.content;
                                    memories.push({
                                        id: createdMemory.objectId || '',
                                        category: content.fields.category,
                                        blobId: content.fields.blob_id,
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return memories;
        }
        catch (error) {
            this.logger.error(`Error getting memories with vector ID ${vectorId}: ${error.message}`);
            return [];
        }
    }
    async getUserMemories(userAddress) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.packageId}::memory::Memory`
                },
                options: {
                    showContent: true,
                },
            });
            const memories = [];
            for (const item of response.data) {
                if (!item.data?.content)
                    continue;
                const content = item.data.content;
                memories.push({
                    id: item.data.objectId,
                    category: content.fields.category,
                    blobId: content.fields.blob_id,
                    vectorId: Number(content.fields.vector_id)
                });
            }
            return memories;
        }
        catch (error) {
            this.logger.error(`Error getting user memories: ${error.message}`);
            return [];
        }
    }
    async getUserMemoryIndexes(userAddress) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.packageId}::memory::MemoryIndex`
                },
                options: {
                    showContent: true,
                },
            });
            const indexes = [];
            for (const item of response.data) {
                if (!item.data?.content)
                    continue;
                const content = item.data.content;
                indexes.push({
                    id: item.data.objectId,
                    owner: content.fields.owner,
                    version: Number(content.fields.version),
                    indexBlobId: content.fields.index_blob_id,
                    graphBlobId: content.fields.graph_blob_id,
                });
            }
            indexes.sort((a, b) => b.version - a.version);
            return indexes;
        }
        catch (error) {
            this.logger.error(`Error getting user memory indexes: ${error.message}`);
            return [];
        }
    }
    async getMemory(memoryId) {
        try {
            const object = await this.client.getObject({
                id: memoryId,
                options: {
                    showContent: true,
                },
            });
            if (!object || !object.data || !object.data.content) {
                throw new Error(`Memory ${memoryId} not found`);
            }
            const content = object.data.content;
            return {
                id: memoryId,
                owner: content.fields.owner,
                category: content.fields.category,
                blobId: content.fields.blob_id,
                vectorId: Number(content.fields.vector_id),
            };
        }
        catch (error) {
            this.logger.error(`Error getting memory: ${error.message}`);
            throw new Error(`Failed to get memory: ${error.message}`);
        }
    }
    async deleteMemory(memoryId, userAddress) {
        try {
            const memory = await this.getMemory(memoryId);
            if (memory.owner !== userAddress) {
                throw new Error('You do not own this memory');
            }
            const tx = new transactions_1.Transaction();
            tx.transferObjects([tx.object(memoryId)], tx.pure.address('0x000000000000000000000000000000000000000000000000000000000000dead'));
            await this.executeTransaction(tx, userAddress);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting memory: ${error.message}`);
            throw new Error(`Failed to delete memory: ${error.message}`);
        }
    }
    async executeTransaction(tx, sender) {
        tx.setSender(sender);
        this.logger.log(`Executing transaction for user ${sender}`);
        try {
            return await this.client.signAndExecuteTransaction({
                transaction: tx,
                signer: this.adminKeypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true,
                },
                requestType: 'WaitForLocalExecution',
            });
        }
        catch (error) {
            this.logger.error(`Transaction execution failed: ${error.message}`);
            throw error;
        }
    }
    extractCreatedObjectId(result) {
        try {
            const created = result.objectChanges.filter(change => change.type === 'created')[0];
            return created?.objectId || '';
        }
        catch (error) {
            return '';
        }
    }
    deserializeMessages(serializedMessages) {
        try {
            return serializedMessages.map(msg => ({
                role: msg.fields.role,
                content: msg.fields.content,
            }));
        }
        catch (error) {
            return [];
        }
    }
};
exports.SuiService = SuiService;
exports.SuiService = SuiService = SuiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SuiService);
//# sourceMappingURL=sui.service.js.map
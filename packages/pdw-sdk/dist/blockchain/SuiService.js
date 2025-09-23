"use strict";
/**
 * SuiService - Blockchain Integration for Memory Records
 *
 * Comprehensive Sui blockchain integration for memory ownership records,
 * transaction batching, and decentralized metadata management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuiService = void 0;
const client_1 = require("@mysten/sui/client");
const transactions_1 = require("@mysten/sui/transactions");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
/**
 * Sui blockchain service for memory ownership and metadata management
 */
class SuiService {
    constructor(config = {}) {
        this.batchQueue = [];
        this.pendingTransactions = new Map();
        this.stats = {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            averageGasUsed: 0,
            batchedTransactions: 0,
            totalGasCost: 0,
            networkHealth: 'healthy'
        };
        this.config = {
            network: config.network || 'testnet',
            packageId: config.packageId || '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            adminPrivateKey: config.adminPrivateKey || '',
            rpcUrl: config.rpcUrl || '',
            enableBatching: config.enableBatching !== false,
            batchSize: config.batchSize || 10,
            batchDelayMs: config.batchDelayMs || 5000,
            gasObjectId: config.gasObjectId || ''
        };
        this.initializeSuiClient();
        this.initializeAdminKeypair();
    }
    // ==================== MEMORY RECORD OPERATIONS ====================
    /**
     * Create memory record on Sui blockchain
     */
    async createMemoryRecord(userAddress, category, vectorId, blobId, metadata, options = {}) {
        if (options.enableBatching && this.config.enableBatching) {
            return this.addToBatch({
                id: this.generateTransactionId(),
                userId: userAddress,
                operation: 'create_memory',
                parameters: { category, vectorId, blobId, metadata },
                priority: options.priority || 1,
                timestamp: new Date()
            });
        }
        return await this.executeCreateMemoryRecord(userAddress, category, vectorId, blobId, metadata);
    }
    /**
     * Create memory index on Sui blockchain
     */
    async createMemoryIndex(userAddress, indexBlobId, graphBlobId, options = {}) {
        if (options.enableBatching && this.config.enableBatching) {
            return this.addToBatch({
                id: this.generateTransactionId(),
                userId: userAddress,
                operation: 'create_index',
                parameters: { indexBlobId, graphBlobId },
                priority: options.priority || 1,
                timestamp: new Date()
            });
        }
        return await this.executeCreateMemoryIndex(userAddress, indexBlobId, graphBlobId);
    }
    /**
     * Update memory index on Sui blockchain
     */
    async updateMemoryIndex(indexId, userAddress, expectedVersion, newIndexBlobId, newGraphBlobId, options = {}) {
        if (options.enableBatching && this.config.enableBatching) {
            return this.addToBatch({
                id: this.generateTransactionId(),
                userId: userAddress,
                operation: 'update_index',
                parameters: { indexId, expectedVersion, newIndexBlobId, newGraphBlobId },
                priority: options.priority || 1,
                timestamp: new Date()
            });
        }
        return await this.executeUpdateMemoryIndex(indexId, userAddress, expectedVersion, newIndexBlobId, newGraphBlobId);
    }
    /**
     * Get memory record by ID
     */
    async getMemoryRecord(objectId) {
        try {
            const response = await this.client.getObject({
                id: objectId,
                options: {
                    showContent: true,
                    showOwner: true,
                    showType: true
                }
            });
            if (!response.data) {
                return null;
            }
            const content = response.data.content;
            if (!content || content.dataType !== 'moveObject') {
                return null;
            }
            const fields = content.fields;
            return {
                id: objectId,
                owner: fields.owner,
                category: fields.category,
                vectorId: parseInt(fields.vector_id),
                blobId: fields.blob_id,
                metadata: this.parseMetadata(fields.metadata),
                createdAt: new Date(parseInt(fields.metadata.created_timestamp)),
                version: fields.version || 1
            };
        }
        catch (error) {
            console.error('Error getting memory record:', error);
            return null;
        }
    }
    /**
     * Get memory index by ID
     */
    async getMemoryIndex(indexId) {
        try {
            const response = await this.client.getObject({
                id: indexId,
                options: {
                    showContent: true,
                    showOwner: true
                }
            });
            if (!response.data) {
                return null;
            }
            const content = response.data.content;
            if (!content || content.dataType !== 'moveObject') {
                return null;
            }
            const fields = content.fields;
            return {
                id: indexId,
                owner: fields.owner,
                version: parseInt(fields.version),
                indexBlobId: fields.index_blob_id,
                graphBlobId: fields.graph_blob_id,
                lastUpdated: new Date() // TODO: Get from blockchain timestamp
            };
        }
        catch (error) {
            console.error('Error getting memory index:', error);
            return null;
        }
    }
    /**
     * Get user's memory records
     */
    async getUserMemoryRecords(userAddress, limit = 100) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.config.packageId}::memory::Memory`
                },
                options: {
                    showContent: true,
                    showType: true
                },
                limit
            });
            const memoryRecords = [];
            for (const item of response.data) {
                if (item.data && item.data.content) {
                    const content = item.data.content;
                    if (content.dataType === 'moveObject' && content.fields) {
                        const fields = content.fields;
                        memoryRecords.push({
                            id: item.data.objectId,
                            owner: fields.owner,
                            category: fields.category,
                            vectorId: parseInt(fields.vector_id),
                            blobId: fields.blob_id,
                            metadata: this.parseMetadata(fields.metadata),
                            createdAt: new Date(parseInt(fields.metadata.created_timestamp)),
                            version: fields.version || 1
                        });
                    }
                }
            }
            return memoryRecords;
        }
        catch (error) {
            console.error('Error getting user memory records:', error);
            return [];
        }
    }
    /**
     * Get user's memory indices
     */
    async getUserMemoryIndices(userAddress) {
        try {
            const response = await this.client.getOwnedObjects({
                owner: userAddress,
                filter: {
                    StructType: `${this.config.packageId}::memory::MemoryIndex`
                },
                options: {
                    showContent: true,
                    showType: true
                }
            });
            const memoryIndices = [];
            for (const item of response.data) {
                if (item.data && item.data.content) {
                    const content = item.data.content;
                    if (content.dataType === 'moveObject' && content.fields) {
                        const fields = content.fields;
                        memoryIndices.push({
                            id: item.data.objectId,
                            owner: fields.owner,
                            version: parseInt(fields.version),
                            indexBlobId: fields.index_blob_id,
                            graphBlobId: fields.graph_blob_id,
                            lastUpdated: new Date() // TODO: Get from blockchain events
                        });
                    }
                }
            }
            return memoryIndices;
        }
        catch (error) {
            console.error('Error getting user memory indices:', error);
            return [];
        }
    }
    // ==================== BATCH OPERATIONS ====================
    /**
     * Process pending batch transactions
     */
    async processBatchQueue() {
        if (this.batchQueue.length === 0) {
            return [];
        }
        const batch = [...this.batchQueue];
        this.batchQueue.length = 0; // Clear queue
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
            this.batchTimer = undefined;
        }
        console.log(`Processing batch of ${batch.length} transactions`);
        // Sort by priority (higher priority first)
        batch.sort((a, b) => b.priority - a.priority);
        const results = [];
        // Execute transactions in sequence to avoid nonce conflicts
        for (const transaction of batch) {
            try {
                let result;
                switch (transaction.operation) {
                    case 'create_memory':
                        const { category, vectorId, blobId, metadata } = transaction.parameters;
                        result = await this.executeCreateMemoryRecord(transaction.userId, category, vectorId, blobId, metadata);
                        break;
                    case 'create_index':
                        const { indexBlobId, graphBlobId } = transaction.parameters;
                        result = await this.executeCreateMemoryIndex(transaction.userId, indexBlobId, graphBlobId);
                        break;
                    case 'update_index':
                        const { indexId, expectedVersion, newIndexBlobId, newGraphBlobId } = transaction.parameters;
                        result = await this.executeUpdateMemoryIndex(indexId, transaction.userId, expectedVersion, newIndexBlobId, newGraphBlobId);
                        break;
                    default:
                        result = {
                            digest: '',
                            success: false,
                            error: `Unknown operation: ${transaction.operation}`
                        };
                }
                results.push(result);
                this.stats.batchedTransactions++;
            }
            catch (error) {
                results.push({
                    digest: '',
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        console.log(`Batch processing complete: ${results.filter(r => r.success).length}/${results.length} successful`);
        return results;
    }
    /**
     * Force process batch queue immediately
     */
    async flushBatchQueue() {
        return await this.processBatchQueue();
    }
    // ==================== NETWORK OPERATIONS ====================
    /**
     * Check network health
     */
    async checkNetworkHealth() {
        try {
            const start = Date.now();
            const response = await this.client.getLatestCheckpointSequenceNumber();
            const latency = Date.now() - start;
            if (response && latency < 5000) {
                this.stats.networkHealth = 'healthy';
            }
            else {
                this.stats.networkHealth = 'degraded';
            }
        }
        catch (error) {
            this.stats.networkHealth = 'offline';
        }
        return this.stats.networkHealth;
    }
    /**
     * Get gas price recommendations
     */
    async getGasPrice() {
        try {
            const gasPrice = await this.client.getReferenceGasPrice();
            return {
                referenceGasPrice: parseInt(gasPrice.toString()),
                recommendation: parseInt(gasPrice.toString()) > 1000 ? 'high' : 'normal'
            };
        }
        catch (error) {
            console.error('Error getting gas price:', error);
            return {
                referenceGasPrice: 1000,
                recommendation: 'normal'
            };
        }
    }
    /**
     * Get transaction by digest
     */
    async getTransaction(digest) {
        try {
            return await this.client.getTransactionBlock({
                digest,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showInput: true,
                    showObjectChanges: true
                }
            });
        }
        catch (error) {
            console.error('Error getting transaction:', error);
            return null;
        }
    }
    // ==================== STATISTICS & MONITORING ====================
    /**
     * Get service statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Get batch queue status
     */
    getBatchQueueStatus() {
        return {
            pending: this.batchQueue.length,
            nextProcessing: this.batchTimer ? new Date(Date.now() + this.config.batchDelayMs) : null,
            averageBatchSize: this.stats.batchedTransactions > 0
                ? this.config.batchSize
                : 0
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            totalTransactions: 0,
            successfulTransactions: 0,
            failedTransactions: 0,
            averageGasUsed: 0,
            batchedTransactions: 0,
            totalGasCost: 0,
            networkHealth: 'healthy'
        };
    }
    // ==================== PRIVATE METHODS ====================
    initializeSuiClient() {
        try {
            const networkUrl = this.config.rpcUrl || (0, client_1.getFullnodeUrl)(this.config.network);
            this.client = new client_1.SuiClient({ url: networkUrl });
            console.log(`Sui client initialized for ${this.config.network} network`);
        }
        catch (error) {
            console.error('Failed to initialize Sui client:', error);
            throw new Error(`Sui client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    initializeAdminKeypair() {
        if (!this.config.adminPrivateKey) {
            console.warn('No admin private key provided. Creating random keypair for development.');
            this.adminKeypair = new ed25519_1.Ed25519Keypair();
            return;
        }
        try {
            // Clean up the private key
            let privateKey = this.config.adminPrivateKey.replace(/\s+/g, '');
            if (privateKey.startsWith('suiprivkey1')) {
                // Sui private key format
                this.adminKeypair = ed25519_1.Ed25519Keypair.fromSecretKey(privateKey);
            }
            else {
                // Hex format
                if (!privateKey.startsWith('0x')) {
                    privateKey = '0x' + privateKey;
                }
                const keyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex');
                if (keyBuffer.length !== 32) {
                    throw new Error(`Invalid key length: ${keyBuffer.length}, expected 32`);
                }
                this.adminKeypair = ed25519_1.Ed25519Keypair.fromSecretKey(new Uint8Array(keyBuffer));
            }
            const adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
            console.log(`Admin keypair initialized with address: ${adminAddress}`);
        }
        catch (error) {
            console.error('Failed to initialize admin keypair:', error);
            console.warn('Using random keypair for development');
            this.adminKeypair = new ed25519_1.Ed25519Keypair();
        }
    }
    async executeCreateMemoryRecord(userAddress, category, vectorId, blobId, metadata) {
        try {
            const tx = new transactions_1.Transaction();
            // Convert metadata to Move-compatible format
            const metadataFields = this.serializeMetadata(metadata);
            tx.moveCall({
                target: `${this.config.packageId}::memory::create_memory_record`,
                arguments: [
                    tx.pure.string(category),
                    tx.pure.u64(vectorId),
                    tx.pure.string(blobId),
                    tx.pure(metadataFields) // Serialized metadata
                ]
            });
            return await this.executeTransaction(tx, userAddress);
        }
        catch (error) {
            console.error('Error creating memory record:', error);
            return {
                digest: '',
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }
    async executeCreateMemoryIndex(userAddress, indexBlobId, graphBlobId) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.config.packageId}::memory::create_memory_index`,
                arguments: [
                    tx.pure(new TextEncoder().encode(indexBlobId)),
                    tx.pure(new TextEncoder().encode(graphBlobId))
                ]
            });
            return await this.executeTransaction(tx, userAddress);
        }
        catch (error) {
            console.error('Error creating memory index:', error);
            return {
                digest: '',
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }
    async executeUpdateMemoryIndex(indexId, userAddress, expectedVersion, newIndexBlobId, newGraphBlobId) {
        try {
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${this.config.packageId}::memory::update_memory_index`,
                arguments: [
                    tx.object(indexId),
                    tx.pure.u64(expectedVersion),
                    tx.pure.string(newIndexBlobId),
                    tx.pure.string(newGraphBlobId)
                ]
            });
            return await this.executeTransaction(tx, userAddress);
        }
        catch (error) {
            console.error('Error updating memory index:', error);
            return {
                digest: '',
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }
    async executeTransaction(tx, signer) {
        const startTime = Date.now();
        this.stats.totalTransactions++;
        try {
            if (!this.adminKeypair) {
                throw new Error('Admin keypair not initialized');
            }
            // Set gas payment
            const coins = await this.client.getCoins({
                owner: this.adminKeypair.getPublicKey().toSuiAddress(),
                coinType: '0x2::sui::SUI'
            });
            if (coins.data.length === 0) {
                throw new Error('No gas coins available');
            }
            tx.setGasPayment(coins.data.slice(0, 10).map(coin => ({
                objectId: coin.coinObjectId,
                version: coin.version,
                digest: coin.digest
            })));
            // Execute transaction
            const result = await this.client.signAndExecuteTransaction({
                transaction: tx,
                signer: this.adminKeypair,
                options: {
                    showEffects: true,
                    showEvents: true,
                    showObjectChanges: true
                }
            });
            // Update statistics
            const gasUsed = result.effects?.gasUsed?.computationCost || 0;
            this.updateGasStats(typeof gasUsed === 'string' ? parseInt(gasUsed) : gasUsed);
            this.stats.successfulTransactions++;
            this.stats.lastSuccessfulTransaction = new Date();
            // Extract created object ID if any
            const objectId = this.extractCreatedObjectId(result);
            return {
                digest: result.digest,
                objectId,
                effects: result.effects,
                events: result.events || [],
                success: true,
                gasUsed: typeof gasUsed === 'string' ? parseInt(gasUsed) : gasUsed
            };
        }
        catch (error) {
            this.stats.failedTransactions++;
            console.error('Transaction execution failed:', error);
            return {
                digest: '',
                success: false,
                error: (error instanceof Error ? error.message : 'Unknown error')
            };
        }
    }
    extractCreatedObjectId(result) {
        if (result.objectChanges) {
            for (const change of result.objectChanges) {
                if (change.type === 'created') {
                    return change.objectId;
                }
            }
        }
        return undefined;
    }
    addToBatch(transaction) {
        this.batchQueue.push(transaction);
        this.scheduleBatchProcessing();
        // Return a promise that resolves when batch is processed
        return new Promise((resolve) => {
            // Simple implementation - in production, track individual transaction results
            setTimeout(() => {
                resolve({
                    digest: 'batched',
                    success: true
                });
            }, this.config.batchDelayMs + 1000);
        });
    }
    scheduleBatchProcessing() {
        if (this.batchTimer) {
            return; // Already scheduled
        }
        // Process when batch is full or after delay
        if (this.batchQueue.length >= this.config.batchSize) {
            setImmediate(() => this.processBatchQueue());
        }
        else {
            this.batchTimer = setTimeout(() => {
                this.processBatchQueue();
            }, this.config.batchDelayMs);
        }
    }
    serializeMetadata(metadata) {
        // Convert to Move-compatible format
        return {
            content_type: metadata.contentType,
            content_size: metadata.contentSize,
            content_hash: metadata.contentHash,
            category: metadata.category,
            topic: metadata.topic,
            importance: Math.max(1, Math.min(10, metadata.importance)),
            embedding_blob_id: metadata.embeddingBlobId,
            embedding_dimension: metadata.embeddingDimension,
            created_timestamp: metadata.createdTimestamp,
            updated_timestamp: metadata.updatedTimestamp || metadata.createdTimestamp,
            custom_metadata: Object.entries(metadata.customMetadata).map(([key, value]) => ({ key, value }))
        };
    }
    parseMetadata(fields) {
        return {
            contentType: fields.content_type,
            contentSize: parseInt(fields.content_size),
            contentHash: fields.content_hash,
            category: fields.category,
            topic: fields.topic,
            importance: parseInt(fields.importance),
            embeddingBlobId: fields.embedding_blob_id,
            embeddingDimension: parseInt(fields.embedding_dimension),
            createdTimestamp: parseInt(fields.created_timestamp),
            updatedTimestamp: parseInt(fields.updated_timestamp),
            customMetadata: this.parseCustomMetadata(fields.custom_metadata)
        };
    }
    parseCustomMetadata(customMetadataVec) {
        const result = {};
        if (Array.isArray(customMetadataVec)) {
            for (const item of customMetadataVec) {
                if (item.key && item.value) {
                    result[item.key] = item.value;
                }
            }
        }
        return result;
    }
    updateGasStats(gasUsed) {
        this.stats.totalGasCost += gasUsed;
        this.stats.averageGasUsed = this.stats.totalGasCost / this.stats.successfulTransactions;
    }
    generateTransactionId() {
        return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }
}
exports.SuiService = SuiService;
exports.default = SuiService;
//# sourceMappingURL=SuiService.js.map
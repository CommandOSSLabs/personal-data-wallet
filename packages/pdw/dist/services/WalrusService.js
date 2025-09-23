"use strict";
/**
 * WalrusService - Decentralized storage on Walrus network
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalrusService = void 0;
const walrus_1 = require("@mysten/walrus");
const client_1 = require("@mysten/sui/client");
class WalrusService {
    constructor(config = {}) {
        this.cache = new Map();
        this.cacheTimeoutMs = 5 * 60 * 1000; // 5 minutes cache
        this.config = {
            network: config.network || 'testnet',
            enableEncryption: config.enableEncryption || false,
            enableBatching: config.enableBatching || false,
            batchSize: config.batchSize || 10,
            batchDelayMs: config.batchDelayMs || 5000
        };
        this.defaultSigner = config.defaultSigner;
        this.initializeClients();
    }
    /**
     * Initialize Walrus client
     */
    initializeClients() {
        try {
            console.log(`🌊 Initializing Walrus client for ${this.config.network}`);
            // Initialize SUI client
            const suiUrl = (0, client_1.getFullnodeUrl)(this.config.network === 'mainnet' ? 'mainnet' : 'testnet');
            this.suiClient = new client_1.SuiClient({ url: suiUrl });
            // Initialize Walrus client
            const walrusConfig = this.config.network === 'mainnet'
                ? walrus_1.MAINNET_WALRUS_PACKAGE_CONFIG
                : walrus_1.TESTNET_WALRUS_PACKAGE_CONFIG;
            this.walrusClient = new walrus_1.WalrusClient({
                suiClient: this.suiClient,
                packageConfig: walrusConfig,
                network: this.config.network === 'mainnet' ? 'mainnet' : 'testnet'
            });
            console.log('✅ Walrus client initialized');
        }
        catch (error) {
            console.error('❌ Failed to initialize Walrus client:', error);
            throw error;
        }
    }
    /**
     * Store data on Walrus
     * Note: This method requires a signer for blockchain operations
     */
    async store(data, metadata = {}, options = {}) {
        const startTime = Date.now();
        if (!this.walrusClient) {
            throw new Error('Walrus client not initialized. Please check your configuration.');
        }
        const signer = options.signer || this.defaultSigner;
        if (!signer) {
            throw new Error('Signer is required for Walrus write operations. Provide a signer in options or set a defaultSigner in the constructor.');
        }
        try {
            // Convert string to Uint8Array if needed
            const binaryData = typeof data === 'string'
                ? new TextEncoder().encode(data)
                : data;
            // Store on Walrus using client with retry logic
            const result = await this.retryOperation(() => this.walrusClient.writeBlob({
                blob: binaryData,
                epochs: options.epochs || 5,
                signer: signer,
                deletable: options.deletable !== false,
                owner: options.owner
            }), 'store blob');
            const fullMetadata = {
                owner: metadata.owner || options.owner || 'unknown',
                contentType: metadata.contentType || 'application/octet-stream',
                contentSize: binaryData.length,
                contentHash: await this.hashData(binaryData),
                category: metadata.category || 'default',
                topic: metadata.topic,
                importance: metadata.importance || 5,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                additionalTags: metadata.additionalTags
            };
            return {
                blobId: result.blobId,
                isEncrypted: this.config.enableEncryption,
                uploadTimeMs: Date.now() - startTime,
                metadata: fullMetadata
            };
        }
        catch (error) {
            throw new Error(`Failed to store data on Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Retrieve data from Walrus
     */
    async retrieve(blobId) {
        const startTime = Date.now();
        if (!this.walrusClient) {
            throw new Error('Walrus client not initialized');
        }
        try {
            // Check cache first
            const cachedData = this.getFromCache(blobId);
            if (cachedData) {
                console.log(`📋 Retrieved blob ${blobId} from cache`);
                return {
                    content: cachedData.data,
                    metadata: cachedData.metadata,
                    retrievalTimeMs: Date.now() - startTime,
                    isFromCache: true
                };
            }
            const data = await this.retryOperation(() => this.walrusClient.readBlob({ blobId }), 'read blob');
            // Mock metadata - in production, this would be stored separately or as attributes
            const metadata = {
                owner: 'unknown',
                contentType: 'application/octet-stream',
                contentSize: data.length,
                contentHash: await this.hashData(data),
                category: 'default',
                importance: 5,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            // Add to cache for future use
            this.addToCache(blobId, data, metadata);
            return {
                content: data,
                metadata,
                retrievalTimeMs: Date.now() - startTime,
                isFromCache: false
            };
        }
        catch (error) {
            throw new Error(`Failed to retrieve data from Walrus: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Store vector index on Walrus
     */
    async storeVectorIndex(userId, indexData, signer) {
        const metadata = {
            owner: userId,
            contentType: 'application/x-hnsw-index',
            category: 'vector-index',
            topic: 'memory-search',
            importance: 10 // High importance for indices
        };
        return await this.store(indexData, metadata, {
            signer: signer || this.defaultSigner,
            owner: userId,
            epochs: 10 // Longer storage for indices
        });
    }
    /**
     * Retrieve vector index from Walrus
     */
    async retrieveVectorIndex(blobId) {
        const result = await this.retrieve(blobId);
        return result.content;
    }
    /**
     * Retry operation with exponential backoff
     */
    async retryOperation(operation, operationName, maxRetries = 3) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                if (attempt === maxRetries) {
                    console.error(`❌ ${operationName} failed after ${maxRetries + 1} attempts:`, lastError.message);
                    throw new Error(`Failed to ${operationName} after ${maxRetries + 1} attempts: ${lastError.message}`);
                }
                // Exponential backoff: 1s, 2s, 4s, etc.
                const delay = Math.pow(2, attempt) * 1000;
                console.warn(`⚠️  ${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, lastError.message);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        throw lastError;
    }
    /**
     * Add data to cache
     */
    addToCache(blobId, data, metadata) {
        this.cache.set(blobId, {
            data,
            timestamp: Date.now(),
            metadata
        });
        // Clean up old cache entries
        this.cleanupCache();
    }
    /**
     * Get data from cache if not expired
     */
    getFromCache(blobId) {
        const cached = this.cache.get(blobId);
        if (!cached)
            return null;
        // Check if cache entry is expired
        if (Date.now() - cached.timestamp > this.cacheTimeoutMs) {
            this.cache.delete(blobId);
            return null;
        }
        return { data: cached.data, metadata: cached.metadata };
    }
    /**
     * Clean up expired cache entries
     */
    cleanupCache() {
        const now = Date.now();
        const entries = Array.from(this.cache.entries());
        for (const [blobId, cached] of entries) {
            if (now - cached.timestamp > this.cacheTimeoutMs) {
                this.cache.delete(blobId);
            }
        }
    }
    /**
     * Clear all cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Generate hash for data integrity
     */
    async hashData(data) {
        try {
            // Use Node.js crypto for hashing
            const crypto = require('crypto');
            const hash = crypto.createHash('sha256');
            hash.update(data);
            return hash.digest('hex');
        }
        catch (error) {
            // Fallback to simple checksum
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
                sum += data[i];
            }
            return sum.toString(16);
        }
    }
    /**
     * Set default signer for Walrus operations
     */
    setDefaultSigner(signer) {
        this.defaultSigner = signer;
    }
    /**
     * Check if blob exists on Walrus
     */
    async blobExists(blobId) {
        try {
            await this.walrusClient.readBlob({ blobId });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get blob size without downloading full content
     */
    async getBlobSize(blobId) {
        try {
            const metadata = await this.walrusClient.getBlobMetadata({ blobId });
            return parseInt(metadata.metadata.V1.unencoded_length);
        }
        catch (error) {
            throw new Error(`Failed to get blob size: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Store multiple items in batch
     */
    async storeBatch(items, batchOptions = {}) {
        const maxConcurrent = batchOptions.maxConcurrent || this.config.batchSize;
        const results = [];
        // Process items in batches to avoid overwhelming the network
        for (let i = 0; i < items.length; i += maxConcurrent) {
            const batch = items.slice(i, i + maxConcurrent);
            const batchPromises = batch.map(async (item) => {
                try {
                    return await this.store(item.data, item.metadata, {
                        ...item.options,
                        signer: batchOptions.signer || this.defaultSigner,
                        owner: batchOptions.owner
                    });
                }
                catch (error) {
                    return { error: error instanceof Error ? error.message : 'Unknown error' };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Add delay between batches if configured
            if (i + maxConcurrent < items.length && this.config.batchDelayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, this.config.batchDelayMs));
            }
        }
        return results;
    }
    /**
     * Retrieve multiple items in batch
     */
    async retrieveBatch(blobIds, options = {}) {
        const maxConcurrent = options.maxConcurrent || this.config.batchSize;
        const results = [];
        for (let i = 0; i < blobIds.length; i += maxConcurrent) {
            const batch = blobIds.slice(i, i + maxConcurrent);
            const batchPromises = batch.map(async (blobId) => {
                try {
                    return await this.retrieve(blobId);
                }
                catch (error) {
                    return { error: error instanceof Error ? error.message : 'Unknown error' };
                }
            });
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            // Add delay between batches if configured
            if (i + maxConcurrent < blobIds.length && this.config.batchDelayMs > 0) {
                await new Promise(resolve => setTimeout(resolve, this.config.batchDelayMs));
            }
        }
        return results;
    }
    /**
     * Get service statistics
     */
    getStats() {
        return {
            network: this.config.network,
            encryption: this.config.enableEncryption,
            batching: this.config.enableBatching,
            clientInitialized: !!this.walrusClient,
            hasDefaultSigner: !!this.defaultSigner,
            cache: {
                size: this.cache.size,
                timeoutMs: this.cacheTimeoutMs
            }
        };
    }
}
exports.WalrusService = WalrusService;
//# sourceMappingURL=WalrusService.js.map
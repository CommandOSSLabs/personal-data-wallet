"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WalrusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalrusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@mysten/sui/client");
const walrus_1 = require("@mysten/walrus");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
const embedding_service_1 = require("../../memory/embedding/embedding.service");
const seal_service_1 = require("../seal/seal.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const sha3_1 = require("@noble/hashes/sha3");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const readFile = (0, util_1.promisify)(fs.readFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
let WalrusService = WalrusService_1 = class WalrusService {
    configService;
    embeddingService;
    sealService;
    walrusClient;
    suiClient;
    adminKeypair;
    logger = new common_1.Logger(WalrusService_1.name);
    adminAddress;
    DEFAULT_STORAGE_EPOCHS = 12;
    LOCAL_STORAGE_DIR = path.join(process.cwd(), 'storage', 'walrus-fallback');
    walrusAvailable = true;
    lastWalrusCheck = 0;
    WALRUS_CHECK_INTERVAL = 5 * 60 * 1000;
    constructor(configService, embeddingService, sealService) {
        this.configService = configService;
        this.embeddingService = embeddingService;
        this.sealService = sealService;
        const configNetwork = this.configService.get('SUI_NETWORK', 'testnet');
        const network = configNetwork || 'testnet';
        this.suiClient = new client_1.SuiClient({
            url: (0, client_1.getFullnodeUrl)(network),
        });
        this.initializeAdminKeypair();
        this.initializeLocalStorage();
        this.initializeWalrusClient(network);
        this.logger.log(`Initialized Walrus client on ${network} network with local storage fallback`);
    }
    initializeWalrusClient(network) {
        try {
            const clientOptions = {
                network,
                suiClient: this.suiClient,
                storageNodeClientOptions: {
                    timeout: 60_000,
                    onError: (error) => {
                        this.logger.debug(`Storage node error: ${error.message}`);
                    },
                },
            };
            if (network === 'testnet') {
                const useUploadRelay = this.configService.get('WALRUS_USE_UPLOAD_RELAY', true);
                if (useUploadRelay) {
                    const uploadRelayHost = this.configService.get('WALRUS_UPLOAD_RELAY_HOST', 'https://upload-relay.testnet.walrus.space');
                    clientOptions.uploadRelay = {
                        host: uploadRelayHost,
                        sendTip: {
                            address: '0x4b6a7439159cf10533147fc3d678cf10b714f2bc998f6cb1f1b0b9594cdc52b6',
                            kind: {
                                const: 105,
                            },
                        },
                    };
                    this.logger.log(`Walrus client configured with upload relay: ${uploadRelayHost}`);
                }
            }
            this.walrusClient = new walrus_1.WalrusClient(clientOptions);
            this.logger.log(`Walrus client initialized successfully for ${network}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize Walrus client: ${error.message}`);
            throw new Error(`Walrus client initialization failed: ${error.message}`);
        }
    }
    initializeAdminKeypair() {
        try {
            const privateKey = this.configService.get('SUI_ADMIN_PRIVATE_KEY');
            if (!privateKey) {
                throw new Error('SUI_ADMIN_PRIVATE_KEY not provided');
            }
            const cleanedKey = privateKey.replace(/\s+/g, '');
            if (cleanedKey.startsWith('suiprivkey1')) {
                this.adminKeypair = ed25519_1.Ed25519Keypair.fromSecretKey(cleanedKey);
            }
            else {
                const keyWithPrefix = cleanedKey.startsWith('0x')
                    ? cleanedKey
                    : `0x${cleanedKey}`;
                const keyBuffer = Buffer.from(keyWithPrefix.replace('0x', ''), 'hex');
                if (keyBuffer.length !== 32) {
                    throw new Error(`Invalid hex key length: ${keyBuffer.length}, expected 32`);
                }
                this.adminKeypair = ed25519_1.Ed25519Keypair.fromSecretKey(keyBuffer);
            }
            this.adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
            this.logger.log(`Walrus service using admin address: ${this.adminAddress}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize admin keypair: ${error.message}`);
            throw new Error(`Admin keypair initialization failed: ${error.message}`);
        }
    }
    async initializeLocalStorage() {
        try {
            await mkdir(this.LOCAL_STORAGE_DIR, { recursive: true });
            this.logger.log(`Local storage fallback initialized at: ${this.LOCAL_STORAGE_DIR}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize local storage: ${error.message}`);
        }
    }
    async isWalrusAvailable() {
        const now = Date.now();
        if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
            return this.walrusAvailable;
        }
        try {
            const testPromise = this.walrusClient.getFiles({
                ids: ['availability-test'],
            });
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Availability check timeout')), 5000);
            });
            await Promise.race([testPromise, timeoutPromise]);
            this.walrusAvailable = true;
            this.logger.debug('Walrus availability check: AVAILABLE');
        }
        catch (error) {
            if (error.message.includes('timeout') ||
                error.message.includes('fetch failed') ||
                error.message.includes('network')) {
                this.walrusAvailable = false;
                this.logger.warn('Walrus availability check: UNAVAILABLE - using local storage fallback');
            }
            else {
                this.walrusAvailable = true;
                this.logger.debug('Walrus availability check: AVAILABLE');
            }
        }
        this.lastWalrusCheck = now;
        return this.walrusAvailable;
    }
    generateLocalBlobId() {
        return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    async storeFileLocally(buffer, filename, tags = {}) {
        const blobId = this.generateLocalBlobId();
        const filePath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.bin`);
        const metaPath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.meta.json`);
        try {
            await writeFile(filePath, buffer);
            const metadata = {
                blobId,
                filename,
                tags,
                size: buffer.length,
                createdAt: new Date().toISOString(),
                storageType: 'local_fallback',
            };
            await writeFile(metaPath, JSON.stringify(metadata, null, 2));
            this.logger.log(`File stored locally: ${blobId} (${buffer.length} bytes)`);
            return blobId;
        }
        catch (error) {
            this.logger.error(`Failed to store file locally: ${error.message}`);
            throw new Error(`Local storage error: ${error.message}`);
        }
    }
    async retrieveFileLocally(blobId) {
        const filePath = path.join(this.LOCAL_STORAGE_DIR, `${blobId}.bin`);
        try {
            const buffer = await readFile(filePath);
            this.logger.log(`File retrieved from local storage: ${blobId} (${buffer.length} bytes)`);
            return buffer;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File not found in local storage: ${blobId}`);
            }
            this.logger.error(`Failed to retrieve file locally: ${error.message}`);
            throw new Error(`Local storage retrieval error: ${error.message}`);
        }
    }
    getAdminAddress() {
        return this.adminAddress;
    }
    generateContentHash(content) {
        const contentBytes = new TextEncoder().encode(content);
        const hashBytes = (0, sha3_1.sha3_256)(contentBytes);
        return Array.from(hashBytes)
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
    }
    async createMetadataWithEmbedding(content, category, topic = '', importance = 5, customMetadata = {}) {
        const contentBuffer = Buffer.from(content, 'utf-8');
        const contentHash = this.generateContentHash(content);
        const timestamp = Date.now();
        const metadata = {
            contentType: 'text/plain',
            contentSize: contentBuffer.length,
            contentHash,
            category,
            topic: topic || `Memory about ${category}`,
            importance: Math.max(1, Math.min(10, importance)),
            embeddingDimension: 768,
            createdTimestamp: timestamp,
            customMetadata,
        };
        if (this.embeddingService) {
            try {
                const embeddingText = `Category: ${category}, Topic: ${topic}, Content: ${content.substring(0, 1000)}`;
                const { vector } = await this.embeddingService.embedText(embeddingText);
                const embeddingData = {
                    vector,
                    dimension: 768,
                    source: 'metadata',
                    category,
                    topic,
                    contentHash,
                    timestamp,
                };
                const embeddingJson = JSON.stringify(embeddingData);
                const embeddingBlobId = await this.storeEmbeddingLocally(embeddingJson, contentHash);
                metadata.embeddingBlobId = embeddingBlobId;
                this.logger.log(`Created metadata embedding: ${embeddingBlobId.substring(0, 8)}...`);
            }
            catch (error) {
                this.logger.warn(`Failed to create metadata embedding: ${error.message}`);
            }
        }
        else {
            this.logger.warn('EmbeddingService not available for metadata embeddings');
        }
        return metadata;
    }
    async storeEmbeddingLocally(embeddingJson, contentHash) {
        const buffer = Buffer.from(embeddingJson, 'utf-8');
        const filename = `embedding_${contentHash}_${Date.now()}.json`;
        const tags = {
            'content-type': 'application/json',
            'data-type': 'metadata-embedding',
            'content-hash': contentHash,
            created: new Date().toISOString(),
        };
        return await this.storeFileLocally(buffer, filename, tags);
    }
    async uploadEncryptedContent(content, ownerAddress, category, topic = '', importance = 5, epochs = this.DEFAULT_STORAGE_EPOCHS, additionalTags = {}) {
        if (!this.sealService) {
            this.logger.warn('SealService not available, falling back to unencrypted storage');
            const result = await this.uploadContentWithMetadata(content, ownerAddress, category, topic, importance, epochs, additionalTags);
            return { ...result, isEncrypted: false };
        }
        try {
            const { encryptedData, backupKey } = await this.sealService.encrypt(content, ownerAddress, {
                category,
                topic,
                importance: importance.toString(),
                ...additionalTags,
            });
            const metadata = await this.createMetadataWithEmbedding(content, category, topic, importance, { ...additionalTags, encrypted: 'true', encryptionType: 'seal' });
            const enhancedTags = {
                'content-type': 'application/octet-stream',
                owner: ownerAddress,
                category: category,
                topic: topic,
                importance: importance.toString(),
                'content-hash': metadata.contentHash,
                'embedding-blob-id': metadata.embeddingBlobId || '',
                encrypted: 'true',
                'encryption-type': 'seal',
                created: new Date(metadata.createdTimestamp).toISOString(),
                ...additionalTags,
            };
            const blobId = await this.uploadContent(encryptedData, ownerAddress, epochs, enhancedTags);
            this.logger.log(`Content encrypted with SEAL and uploaded: ${blobId}`);
            return {
                blobId,
                metadata,
                embeddingBlobId: metadata.embeddingBlobId,
                isEncrypted: true,
                backupKey,
            };
        }
        catch (error) {
            this.logger.error(`Failed to encrypt and upload content: ${error.message}`);
            this.logger.warn('Falling back to unencrypted storage due to encryption failure');
            const result = await this.uploadContentWithMetadata(content, ownerAddress, category, topic, importance, epochs, additionalTags);
            return { ...result, isEncrypted: false };
        }
    }
    async retrieveEncryptedContent(blobId, userAddress, sessionKey, signedTxBytes) {
        try {
            const tags = await this.getFileTags(blobId);
            const isEncrypted = tags['encrypted'] === 'true';
            const encryptionType = tags['encryption-type'];
            if (!isEncrypted) {
                return await this.retrieveContent(blobId);
            }
            if (encryptionType !== 'seal') {
                throw new Error(`Unsupported encryption type: ${encryptionType}`);
            }
            if (!this.sealService) {
                throw new Error('SealService not available for decryption');
            }
            if (!sessionKey || !signedTxBytes) {
                throw new Error('Session key and signed transaction bytes required for SEAL decryption');
            }
            const hasAccess = await this.verifyUserAccess(blobId, userAddress);
            if (!hasAccess) {
                throw new Error(`User ${userAddress} does not have access to content ${blobId}`);
            }
            const encryptedContent = await this.retrieveContent(blobId);
            const decryptedContent = await this.sealService.decrypt(encryptedContent, userAddress, sessionKey, signedTxBytes);
            this.logger.log(`Content successfully decrypted for user: ${userAddress}`);
            return decryptedContent;
        }
        catch (error) {
            this.logger.error(`Error retrieving encrypted content: ${error.message}`);
            throw new Error(`Encrypted content retrieval error: ${error.message}`);
        }
    }
    async getEncryptionInfo(blobId) {
        try {
            const tags = await this.getFileTags(blobId);
            const isEncrypted = tags['encrypted'] === 'true';
            const encryptionType = tags['encryption-type'];
            return {
                isEncrypted,
                encryptionType,
                requiresAuth: isEncrypted && encryptionType === 'seal',
            };
        }
        catch (error) {
            this.logger.error(`Error checking encryption info: ${error.message}`);
            return {
                isEncrypted: false,
                requiresAuth: false,
            };
        }
    }
    async uploadContentWithMetadata(content, ownerAddress, category, topic = '', importance = 5, epochs = this.DEFAULT_STORAGE_EPOCHS, additionalTags = {}) {
        const metadata = await this.createMetadataWithEmbedding(content, category, topic, importance, additionalTags);
        const enhancedTags = {
            'content-type': 'text/plain',
            owner: ownerAddress,
            category: category,
            topic: topic,
            importance: importance.toString(),
            'content-hash': metadata.contentHash,
            'embedding-blob-id': metadata.embeddingBlobId || '',
            created: new Date(metadata.createdTimestamp).toISOString(),
            ...additionalTags,
        };
        const blobId = await this.uploadContent(content, ownerAddress, epochs, enhancedTags);
        return {
            blobId,
            metadata,
            embeddingBlobId: metadata.embeddingBlobId,
        };
    }
    async uploadContent(content, ownerAddress, epochs = this.DEFAULT_STORAGE_EPOCHS, additionalTags = {}) {
        const buffer = Buffer.from(content, 'utf-8');
        const filename = `content_${Date.now()}.txt`;
        const tags = {
            'content-type': 'text/plain',
            owner: ownerAddress,
            created: new Date().toISOString(),
            ...additionalTags,
        };
        const walrusAvailable = await this.isWalrusAvailable();
        if (!walrusAvailable) {
            this.logger.warn(`Walrus unavailable, storing content locally for owner ${ownerAddress}`);
            return await this.storeFileLocally(buffer, filename, tags);
        }
        try {
            this.logger.log(`Uploading content to Walrus for owner ${ownerAddress}...`);
            const file = walrus_1.WalrusFile.from({
                contents: new TextEncoder().encode(content),
                identifier: filename,
                tags,
            });
            const results = await this.uploadFilesToWalrus([file], epochs);
            if (!results || results.length === 0) {
                throw new Error('Failed to upload content to Walrus');
            }
            return results[0].blobId;
        }
        catch (error) {
            this.logger.error(`Walrus upload failed, falling back to local storage: ${error.message}`);
            return await this.storeFileLocally(buffer, filename, tags);
        }
    }
    async retrieveContent(blobId) {
        try {
            this.logger.log(`Retrieving content from blobId: ${blobId}`);
            const [file] = await this.walrusClient.getFiles({
                ids: [blobId],
            });
            if (!file) {
                throw new Error(`File with blob ID ${blobId} not found`);
            }
            const content = await file.text();
            return content;
        }
        catch (error) {
            this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
            throw new Error(`Walrus retrieval error: ${error.message}`);
        }
    }
    async retrieveMetadataEmbedding(embeddingBlobId) {
        try {
            if (embeddingBlobId.startsWith('local_')) {
                const embeddingJson = await this.retrieveFileLocally(embeddingBlobId);
                return JSON.parse(embeddingJson.toString());
            }
            const embeddingJson = await this.retrieveContent(embeddingBlobId);
            return JSON.parse(embeddingJson);
        }
        catch (error) {
            this.logger.warn(`Failed to retrieve metadata embedding ${embeddingBlobId}: ${error.message}`);
            return null;
        }
    }
    async getEnhancedMetadata(blobId) {
        try {
            const tags = await this.getFileTags(blobId);
            const metadata = {
                contentType: tags['content-type'] || 'text/plain',
                contentSize: parseInt(tags['content-size'] || '0'),
                contentHash: tags['content-hash'] || '',
                category: tags['category'] || 'general',
                topic: tags['topic'] || '',
                importance: parseInt(tags['importance'] || '5'),
                embeddingBlobId: tags['embedding-blob-id'] || undefined,
                embeddingDimension: parseInt(tags['embedding-dimension'] || '768'),
                createdTimestamp: new Date(tags['created'] || Date.now()).getTime(),
                updatedTimestamp: tags['updated']
                    ? new Date(tags['updated']).getTime()
                    : undefined,
                customMetadata: {},
            };
            const standardTags = new Set([
                'content-type',
                'content-size',
                'content-hash',
                'category',
                'topic',
                'importance',
                'embedding-blob-id',
                'embedding-dimension',
                'created',
                'updated',
                'owner',
            ]);
            for (const [key, value] of Object.entries(tags)) {
                if (!standardTags.has(key)) {
                    metadata.customMetadata[key] = value;
                }
            }
            return metadata;
        }
        catch (error) {
            this.logger.warn(`Failed to get enhanced metadata for ${blobId}: ${error.message}`);
            return null;
        }
    }
    async searchByMetadataEmbedding(queryText, userAddress, threshold = 0.7, limit = 10) {
        if (!this.embeddingService) {
            this.logger.warn('EmbeddingService not available for similarity search');
            return [];
        }
        try {
            const { vector: queryVector } = await this.embeddingService.embedText(queryText);
            this.logger.log(`Metadata embedding search for: "${queryText}" (user: ${userAddress})`);
            return [];
        }
        catch (error) {
            this.logger.error(`Error in metadata embedding search: ${error.message}`);
            return [];
        }
    }
    async getFileTags(blobId) {
        try {
            const [file] = await this.walrusClient.getFiles({
                ids: [blobId],
            });
            if (!file) {
                throw new Error(`File with blob ID ${blobId} not found`);
            }
            return await file.getTags();
        }
        catch (error) {
            this.logger.error(`Error retrieving file tags from Walrus: ${error.message}`);
            throw new Error(`Walrus tag retrieval error: ${error.message}`);
        }
    }
    async verifyUserAccess(blobId, userAddress) {
        try {
            const tags = await this.getFileTags(blobId);
            return (tags['owner'] === userAddress ||
                tags['user-address'] === userAddress ||
                tags['user-address'] === userAddress.replace('0x', ''));
        }
        catch (error) {
            this.logger.error(`Error verifying user access: ${error.message}`);
            return false;
        }
    }
    async uploadFile(buffer, filename, ownerAddress, epochs = this.DEFAULT_STORAGE_EPOCHS, additionalTags = {}) {
        const tags = {
            'content-type': 'application/octet-stream',
            filename: filename,
            owner: ownerAddress,
            created: new Date().toISOString(),
            ...additionalTags,
        };
        const walrusAvailable = await this.isWalrusAvailable();
        if (!walrusAvailable) {
            this.logger.warn(`Walrus unavailable, storing file "${filename}" locally for owner ${ownerAddress}`);
            return await this.storeFileLocally(buffer, filename, tags);
        }
        try {
            this.logger.log(`Uploading file "${filename}" to Walrus for owner ${ownerAddress}...`);
            const file = walrus_1.WalrusFile.from({
                contents: new Uint8Array(buffer),
                identifier: filename,
                tags,
            });
            const results = await this.uploadFilesToWalrus([file], epochs);
            if (!results || results.length === 0) {
                throw new Error('Failed to upload file to Walrus');
            }
            return results[0].blobId;
        }
        catch (error) {
            this.logger.error(`Walrus upload failed, falling back to local storage: ${error.message}`);
            return await this.storeFileLocally(buffer, filename, tags);
        }
    }
    async downloadFile(blobId) {
        if (blobId.startsWith('local_')) {
            this.logger.log(`Retrieving file from local storage: ${blobId}`);
            return await this.retrieveFileLocally(blobId);
        }
        const walrusAvailable = await this.isWalrusAvailable();
        if (!walrusAvailable) {
            throw new Error('Walrus storage network is currently unavailable and the requested file is not in local storage. ' +
                'Please try again later when the network is stable.');
        }
        const maxRetries = 2;
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Downloading file from Walrus: ${blobId} (attempt ${attempt}/${maxRetries})`);
                if (attempt > 1) {
                    const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 3000);
                    this.logger.log(`Waiting ${waitTime}ms before retry...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                }
                const [file] = await this.walrusClient.getFiles({ ids: [blobId] });
                if (!file) {
                    throw new Error(`File with blob ID ${blobId} not found`);
                }
                const bytes = await file.bytes();
                this.logger.log(`Successfully downloaded file from Walrus: ${blobId} (${bytes.length} bytes)`);
                return Buffer.from(bytes);
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Walrus download attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
                if (error instanceof walrus_1.RetryableWalrusClientError) {
                    this.logger.log('Retryable error detected, resetting client...');
                    this.walrusClient.reset();
                }
                if (attempt < maxRetries) {
                    continue;
                }
            }
        }
        this.logger.error(`Failed to download file after ${maxRetries} attempts: ${lastError?.message}`);
        if (lastError?.message.includes('fetch failed') ||
            lastError?.message.includes('timeout') ||
            lastError?.message.includes('network')) {
            throw new Error('Unable to connect to Walrus storage network. This may be due to temporary network issues. ' +
                'Please try again in a few minutes. If the problem persists, the Walrus testnet may be experiencing downtime.');
        }
        if (lastError?.message.includes('not found')) {
            throw new Error('The requested data was not found in Walrus storage. This may indicate the data has expired or was never properly stored.');
        }
        throw new Error(`Walrus file download error after ${maxRetries} attempts: ${lastError?.message}`);
    }
    async deleteContent(blobId, userAddress) {
        try {
            this.logger.log(`Deleting blob ${blobId} requested by user ${userAddress}...`);
            const hasAccess = await this.verifyUserAccess(blobId, userAddress);
            if (!hasAccess) {
                this.logger.warn(`User ${userAddress} has no access to blob ${blobId}`);
            }
            this.logger.warn(`Deletion of Walrus blobs requires on-chain transactions. ` +
                `BlobId: ${blobId}, User: ${userAddress}`);
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting Walrus blob: ${error.message}`);
            throw new Error(`Walrus deletion error: ${error.message}`);
        }
    }
    async uploadFilesToWalrus(files, epochs) {
        const maxRetries = 3;
        let lastError = null;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                this.logger.log(`Upload attempt ${attempt}/${maxRetries}`);
                if (attempt > 1 && lastError) {
                    if (lastError instanceof walrus_1.RetryableWalrusClientError) {
                        this.logger.log('Resetting Walrus client due to retryable error...');
                        this.walrusClient.reset();
                    }
                    else {
                        this.logger.log('Recreating Walrus client for fresh connection...');
                        this.initializeWalrusClient(this.configService.get('SUI_NETWORK', 'testnet'));
                    }
                }
                this.logger.log('Using SDK writeFiles method...');
                const results = await this.walrusClient.writeFiles({
                    files,
                    epochs,
                    deletable: true,
                    signer: this.adminKeypair,
                });
                this.logger.log(`Upload completed successfully on attempt ${attempt}`);
                results.forEach((result, index) => {
                    this.logger.log(`File ${index}: blobId=${result.blobId}`);
                });
                return results;
            }
            catch (error) {
                lastError = error;
                this.logger.warn(`Upload attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
                if (lastError instanceof walrus_1.RetryableWalrusClientError) {
                    this.logger.log('Error is retryable, will reset client and retry...');
                }
                if (attempt < maxRetries) {
                    const baseWait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                    const jitter = Math.random() * 500;
                    const waitTime = baseWait + jitter;
                    this.logger.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
                    await new Promise((resolve) => setTimeout(resolve, waitTime));
                }
            }
        }
        this.logger.error(`All ${maxRetries} upload attempts failed. Last error: ${lastError?.message}`);
        if (lastError?.message.includes('fetch failed') ||
            lastError?.message.includes('Too many failures') ||
            lastError?.message.includes('timeout') ||
            lastError?.message.includes('network')) {
            throw new Error('Walrus storage nodes are currently experiencing connectivity issues. ' +
                'This is a known issue with the Walrus testnet. Please try again in a few minutes. ' +
                'If the problem persists, consider enabling the upload relay by setting WALRUS_USE_UPLOAD_RELAY=true');
        }
        throw lastError || new Error('Unknown upload error');
    }
};
exports.WalrusService = WalrusService;
exports.WalrusService = WalrusService = WalrusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => embedding_service_1.EmbeddingService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => seal_service_1.SealService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        embedding_service_1.EmbeddingService,
        seal_service_1.SealService])
], WalrusService);
//# sourceMappingURL=walrus.service.js.map
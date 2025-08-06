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
var WalrusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalrusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@mysten/sui/client");
const walrus_1 = require("@mysten/walrus");
const ed25519_1 = require("@mysten/sui/keypairs/ed25519");
let WalrusService = WalrusService_1 = class WalrusService {
    configService;
    walrusClient;
    suiClient;
    adminKeypair;
    logger = new common_1.Logger(WalrusService_1.name);
    adminAddress;
    DEFAULT_STORAGE_EPOCHS = 12;
    constructor(configService) {
        this.configService = configService;
        const configNetwork = this.configService.get('SUI_NETWORK', 'testnet');
        const network = configNetwork || 'testnet';
        this.suiClient = new client_1.SuiClient({
            url: (0, client_1.getFullnodeUrl)(network),
        });
        this.initializeWalrusClient(network);
        this.initializeAdminKeypair();
        this.logger.log(`Initialized Walrus client on ${network} network`);
    }
    initializeWalrusClient(network) {
        const useUploadRelay = this.configService.get('WALRUS_USE_UPLOAD_RELAY', true);
        const uploadRelayHost = this.configService.get('WALRUS_UPLOAD_RELAY_HOST', 'https://upload-relay.testnet.walrus.space');
        const clientOptions = {
            network,
            suiClient: this.suiClient,
            storageNodeClientOptions: {
                timeout: 120_000,
                fetch: async (url, options) => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 120_000);
                    try {
                        const response = await fetch(url, {
                            ...options,
                            signal: controller.signal,
                        });
                        clearTimeout(timeoutId);
                        return response;
                    }
                    catch (error) {
                        clearTimeout(timeoutId);
                        if (error.name === 'AbortError') {
                            throw new Error(`Request timeout: ${url}`);
                        }
                        throw error;
                    }
                },
                onError: (error) => {
                    this.logger.debug(`Storage node error: ${error.message}`);
                },
            },
        };
        if (useUploadRelay && network === 'testnet') {
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
        this.walrusClient = new walrus_1.WalrusClient(clientOptions);
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
                const keyWithPrefix = cleanedKey.startsWith('0x') ? cleanedKey : `0x${cleanedKey}`;
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
    getAdminAddress() {
        return this.adminAddress;
    }
    async uploadContent(content, ownerAddress, epochs = this.DEFAULT_STORAGE_EPOCHS, additionalTags = {}) {
        try {
            this.logger.log(`Uploading content to Walrus for owner ${ownerAddress}...`);
            const file = walrus_1.WalrusFile.from({
                contents: new TextEncoder().encode(content),
                identifier: `content_${Date.now()}`,
                tags: {
                    'content-type': 'text/plain',
                    'owner': ownerAddress,
                    'created': new Date().toISOString(),
                    ...additionalTags
                },
            });
            const results = await this.uploadFilesToWalrus([file], epochs);
            if (!results || results.length === 0) {
                throw new Error('Failed to upload content to Walrus');
            }
            return results[0].blobId;
        }
        catch (error) {
            this.logger.error(`Error uploading content to Walrus: ${error.message}`);
            throw new Error(`Walrus upload error: ${error.message}`);
        }
    }
    async retrieveContent(blobId) {
        try {
            this.logger.log(`Retrieving content from blobId: ${blobId}`);
            const [file] = await this.walrusClient.getFiles({
                ids: [blobId]
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
    async getFileTags(blobId) {
        try {
            const [file] = await this.walrusClient.getFiles({
                ids: [blobId]
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
            return tags['owner'] === userAddress ||
                tags['user-address'] === userAddress ||
                tags['user-address'] === userAddress.replace('0x', '');
        }
        catch (error) {
            this.logger.error(`Error verifying user access: ${error.message}`);
            return false;
        }
    }
    async uploadFile(buffer, filename, ownerAddress, epochs = this.DEFAULT_STORAGE_EPOCHS, additionalTags = {}) {
        try {
            this.logger.log(`Uploading file "${filename}" to Walrus for owner ${ownerAddress}...`);
            const file = walrus_1.WalrusFile.from({
                contents: new Uint8Array(buffer),
                identifier: filename,
                tags: {
                    'content-type': 'application/octet-stream',
                    'filename': filename,
                    'owner': ownerAddress,
                    'created': new Date().toISOString(),
                    ...additionalTags
                },
            });
            const results = await this.uploadFilesToWalrus([file], epochs);
            if (!results || results.length === 0) {
                throw new Error('Failed to upload file to Walrus');
            }
            return results[0].blobId;
        }
        catch (error) {
            this.logger.error(`Error uploading file to Walrus: ${error.message}`);
            throw new Error(`Walrus file upload error: ${error.message}`);
        }
    }
    async downloadFile(blobId) {
        try {
            this.logger.log(`Downloading file from blobId: ${blobId}`);
            const [file] = await this.walrusClient.getFiles({
                ids: [blobId]
            });
            if (!file) {
                throw new Error(`File with blob ID ${blobId} not found`);
            }
            const bytes = await file.bytes();
            return Buffer.from(bytes);
        }
        catch (error) {
            this.logger.error(`Error downloading file from Walrus: ${error.message}`);
            throw new Error(`Walrus file download error: ${error.message}`);
        }
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
                const useUploadRelay = this.configService.get('WALRUS_USE_UPLOAD_RELAY', true);
                if (useUploadRelay) {
                    try {
                        this.logger.log('Using simplified upload with relay...');
                        const results = await this.walrusClient.writeFiles({
                            files,
                            epochs,
                            deletable: true,
                            signer: this.adminKeypair,
                        });
                        this.logger.log(`Upload completed successfully on attempt ${attempt}`);
                        return results;
                    }
                    catch (writeError) {
                        this.logger.warn(`Simplified upload failed: ${writeError.message}, trying manual flow...`);
                        if (attempt === maxRetries) {
                            throw writeError;
                        }
                    }
                }
                const flow = this.walrusClient.writeFilesFlow({ files });
                await flow.encode();
                this.logger.log('Files encoded successfully');
                const registerTx = await flow.register({
                    epochs,
                    owner: this.adminAddress,
                    deletable: true,
                });
                this.logger.log('Executing register transaction...');
                const registerResult = await this.suiClient.signAndExecuteTransaction({
                    transaction: registerTx,
                    signer: this.adminKeypair,
                    options: { showEffects: true, showEvents: true }
                });
                if (!registerResult.digest) {
                    throw new Error('Failed to register blob: No transaction digest');
                }
                this.logger.log(`Blob registered with digest: ${registerResult.digest}`);
                await new Promise(resolve => setTimeout(resolve, 3000));
                this.logger.log('Uploading data to storage nodes...');
                try {
                    await flow.upload({
                        digest: registerResult.digest,
                    });
                    this.logger.log('Data uploaded to storage nodes successfully');
                }
                catch (uploadError) {
                    this.logger.warn(`Upload reported error: ${uploadError.message}`);
                    if (uploadError.message.includes('must be executed before calling certify')) {
                        throw uploadError;
                    }
                    if (uploadError.message.includes('Too many failures')) {
                        this.logger.log('Waiting for storage nodes to sync...');
                        await new Promise(resolve => setTimeout(resolve, 5000));
                    }
                }
                this.logger.log('Certifying blob on-chain...');
                const certifyTx = flow.certify();
                await this.suiClient.signAndExecuteTransaction({
                    transaction: certifyTx,
                    signer: this.adminKeypair,
                    options: { showEffects: true, showEvents: true }
                });
                this.logger.log('Blob certified successfully');
                const result = await flow.listFiles();
                this.logger.log(`Upload completed successfully on attempt ${attempt}`);
                return result;
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
                    await new Promise(resolve => setTimeout(resolve, waitTime));
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
    __metadata("design:paramtypes", [config_1.ConfigService])
], WalrusService);
//# sourceMappingURL=walrus.service.js.map
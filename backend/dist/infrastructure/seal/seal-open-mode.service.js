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
var SealOpenModeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealOpenModeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
const session_store_1 = require("./session-store");
let SealOpenModeService = SealOpenModeService_1 = class SealOpenModeService {
    configService;
    sessionStore;
    sealClient;
    suiClient;
    logger = new common_1.Logger(SealOpenModeService_1.name);
    network;
    threshold;
    sessionKeys = new Map();
    sessionTtlMin;
    constructor(configService, sessionStore) {
        this.configService = configService;
        this.sessionStore = sessionStore;
        this.network = this.configService.get('SEAL_NETWORK', 'testnet');
        this.threshold = this.configService.get('SEAL_THRESHOLD', 2);
        this.sessionTtlMin = this.configService.get('SEAL_SESSION_TTL_MIN', 60);
        this.suiClient = new client_1.SuiClient({
            url: this.configService.get('SUI_RPC_URL', (0, client_1.getFullnodeUrl)(this.network))
        });
        const keyServerIds = this.configService.get('SEAL_KEY_SERVER_IDS', []);
        const serverConfigs = keyServerIds.length > 0
            ? keyServerIds.map(id => ({ objectId: id, weight: 1 }))
            : (0, seal_1.getAllowlistedKeyServers)(this.network).map(id => ({ objectId: id, weight: 1 }));
        this.sealClient = new seal_1.SealClient({
            suiClient: this.suiClient,
            serverConfigs,
            verifyKeyServers: false,
        });
        this.logger.log(`SEAL Open Mode service initialized with ${serverConfigs.length} key servers on ${this.network}`);
        this.logger.log(`Operating in OPEN MODE - accepting requests for any package`);
    }
    async encrypt(content, packageId, identity) {
        try {
            this.logger.log('=== SEAL OPEN MODE ENCRYPTION ===');
            this.logger.log(`Package ID: ${packageId}`);
            this.logger.log(`Identity: ${identity}`);
            this.logger.log(`Threshold: ${this.threshold}`);
            const data = new TextEncoder().encode(content);
            const identityBytes = new TextEncoder().encode(identity);
            const id = (0, utils_1.toHEX)(identityBytes);
            const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
                threshold: this.threshold,
                packageId: packageId,
                id: id,
                data,
            });
            const encrypted = Buffer.from(encryptedObject).toString('base64');
            const backupKeyHex = (0, utils_1.toHEX)(backupKey);
            this.logger.log(`✓ Encryption successful`);
            this.logger.log(`  Encrypted size: ${encryptedObject.length} bytes`);
            this.logger.log(`  Backup key: ${backupKeyHex.substring(0, 20)}...`);
            return {
                encrypted,
                backupKey: backupKeyHex,
                metadata: {
                    packageId,
                    identity,
                    threshold: this.threshold,
                    network: this.network,
                },
            };
        }
        catch (error) {
            this.logger.error(`Open mode encryption error: ${error.message}`, error.stack);
            throw new Error(`SEAL open mode encryption failed: ${error.message}`);
        }
    }
    async decrypt(encryptedContent, packageId, moduleName, identity, userAddress, signature) {
        try {
            this.logger.log('=== SEAL OPEN MODE DECRYPTION ===');
            this.logger.log(`Package ID: ${packageId}`);
            this.logger.log(`Module: ${moduleName}`);
            this.logger.log(`Identity: ${identity}`);
            this.logger.log(`User: ${userAddress}`);
            const sessionKey = await this.getOrCreateSessionKey(packageId, userAddress, signature);
            const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
            const identityBytes = new TextEncoder().encode(identity);
            const tx = new transactions_1.Transaction();
            tx.moveCall({
                target: `${packageId}::${moduleName}::seal_approve`,
                arguments: [
                    tx.pure.vector('u8', Array.from(identityBytes))
                ]
            });
            const txBytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });
            this.logger.log(`Transaction built, size: ${txBytes.length} bytes`);
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedBytes,
                sessionKey,
                txBytes,
            });
            const decrypted = new TextDecoder().decode(decryptedBytes);
            this.logger.log(`✓ Decryption successful`);
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Open mode decryption error: ${error.message}`, error.stack);
            throw new Error(`SEAL open mode decryption failed: ${error.message}`);
        }
    }
    async getSessionKeyMessage(packageId, userAddress) {
        const cacheKey = `${userAddress}:${packageId}`;
        const sessionData = this.sessionStore.get(cacheKey);
        if (sessionData && !sessionData.signature) {
            return Buffer.from(sessionData.personalMessage, 'hex');
        }
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: packageId,
            ttlMin: this.sessionTtlMin,
            suiClient: this.suiClient,
        });
        const personalMessage = sessionKey.getPersonalMessage();
        this.sessionStore.set(cacheKey, {
            address: userAddress,
            personalMessage: Buffer.from(personalMessage).toString('hex'),
            expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
        });
        this.sessionKeys.set(cacheKey, sessionKey);
        this.logger.debug(`Created session key for ${userAddress} with package ${packageId}`);
        return personalMessage;
    }
    async getOrCreateSessionKey(packageId, userAddress, signature) {
        const cacheKey = `${userAddress}:${packageId}`;
        const cached = this.sessionKeys.get(cacheKey);
        const sessionData = this.sessionStore.get(cacheKey);
        if (cached && sessionData) {
            if (signature && !sessionData.signature) {
                cached.setPersonalMessageSignature(signature);
                sessionData.signature = signature;
                this.sessionStore.set(cacheKey, sessionData);
                this.logger.debug(`Set signature on cached SessionKey`);
            }
            else if (sessionData.signature && !signature) {
                try {
                    cached.setPersonalMessageSignature(sessionData.signature);
                }
                catch (error) {
                    this.logger.warn(`Failed to set stored signature: ${error.message}`);
                }
            }
            return cached;
        }
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: packageId,
            ttlMin: this.sessionTtlMin,
            suiClient: this.suiClient,
        });
        if (signature) {
            sessionKey.setPersonalMessageSignature(signature);
        }
        this.sessionKeys.set(cacheKey, sessionKey);
        this.sessionStore.set(cacheKey, {
            address: userAddress,
            personalMessage: Buffer.from(sessionKey.getPersonalMessage()).toString('hex'),
            signature,
            expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
        });
        this.logger.debug(`Created new SessionKey for ${userAddress} with package ${packageId}`);
        return sessionKey;
    }
    async batchEncrypt(items) {
        const results = new Map();
        for (const item of items) {
            try {
                const result = await this.encrypt(item.content, item.packageId, item.identity);
                results.set(item.id, result);
            }
            catch (error) {
                this.logger.error(`Failed to encrypt item ${item.id}: ${error.message}`);
                results.set(item.id, { error: error.message });
            }
        }
        return results;
    }
    async testOpenMode(packageId, moduleName, userAddress, signature) {
        try {
            const testData = `Open mode test at ${new Date().toISOString()}`;
            const identity = `test:${userAddress}`;
            this.logger.log('=== TESTING SEAL OPEN MODE ===');
            const { encrypted, backupKey, metadata } = await this.encrypt(testData, packageId, identity);
            this.logger.log('✓ Encryption test passed');
            const decrypted = await this.decrypt(encrypted, packageId, moduleName, identity, userAddress, signature);
            this.logger.log('✓ Decryption test passed');
            const success = testData === decrypted;
            return {
                success,
                details: {
                    original: testData,
                    encrypted: encrypted.substring(0, 50) + '...',
                    decrypted,
                    backupKey: backupKey.substring(0, 20) + '...',
                    metadata,
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
                details: error.stack,
            };
        }
    }
};
exports.SealOpenModeService = SealOpenModeService;
exports.SealOpenModeService = SealOpenModeService = SealOpenModeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_store_1.SessionStore])
], SealOpenModeService);
//# sourceMappingURL=seal-open-mode.service.js.map
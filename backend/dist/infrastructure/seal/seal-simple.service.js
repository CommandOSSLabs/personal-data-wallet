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
var SealSimpleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealSimpleService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const utils_1 = require("@mysten/sui/utils");
const session_store_1 = require("./session-store");
let SealSimpleService = SealSimpleService_1 = class SealSimpleService {
    configService;
    sessionStore;
    sealClient;
    suiClient;
    logger = new common_1.Logger(SealSimpleService_1.name);
    sealPackageId = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    threshold;
    network;
    sessionKeys = new Map();
    sessionTtlMin;
    constructor(configService, sessionStore) {
        this.configService = configService;
        this.sessionStore = sessionStore;
        this.network = this.configService.get('SEAL_NETWORK', 'testnet');
        this.threshold = this.configService.get('SEAL_THRESHOLD', 2);
        this.sessionTtlMin = this.configService.get('SEAL_SESSION_TTL_MIN', 30);
        this.suiClient = new client_1.SuiClient({
            url: this.configService.get('SUI_RPC_URL', (0, client_1.getFullnodeUrl)(this.network))
        });
        const serverConfigs = (0, seal_1.getAllowlistedKeyServers)(this.network).map(id => ({ objectId: id, weight: 1 }));
        this.sealClient = new seal_1.SealClient({
            suiClient: this.suiClient,
            serverConfigs,
        });
        this.logger.log(`Simple SEAL service initialized with ${serverConfigs.length} key servers on ${this.network}`);
    }
    async encryptForUser(content, userAddress) {
        try {
            const packageId = this.configService.get('SEAL_PACKAGE_ID');
            if (!packageId) {
                throw new Error('SEAL_PACKAGE_ID not configured');
            }
            this.logger.log('=== SEAL ENCRYPTION START ===');
            this.logger.log(`Package ID: ${packageId}`);
            this.logger.log(`User Address: ${userAddress}`);
            const contentBytes = new TextEncoder().encode(content);
            const identityString = `self:${userAddress}`;
            const identityBytes = new TextEncoder().encode(identityString);
            const id = (0, utils_1.toHEX)(identityBytes);
            this.logger.log(`Identity string: ${identityString}`);
            this.logger.log(`Identity hex: ${id.substring(0, 50)}...`);
            const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
                threshold: this.threshold,
                packageId: packageId,
                id: id,
                data: contentBytes,
            });
            const encrypted = Buffer.from(encryptedObject).toString('base64');
            const backupKeyHex = (0, utils_1.toHEX)(backupKey);
            this.logger.log(`Encrypted size: ${encryptedObject.length}`);
            this.logger.log(`Backup key: ${backupKeyHex.substring(0, 20)}...`);
            this.logger.log('=== SEAL ENCRYPTION END ===');
            return {
                encrypted,
                backupKey: backupKeyHex,
                identityUsed: identityString,
            };
        }
        catch (error) {
            this.logger.error('SEAL encryption error:', error);
            throw new Error(`Failed to encrypt: ${error.message}`);
        }
    }
    async decryptForUser(encryptedContent, userAddress, signature) {
        try {
            const packageId = this.configService.get('SEAL_PACKAGE_ID');
            const moduleName = this.configService.get('SEAL_MODULE_NAME', 'seal_access_control');
            if (!packageId) {
                throw new Error('SEAL_PACKAGE_ID not configured');
            }
            this.logger.log('=== SEAL DECRYPTION START ===');
            this.logger.log(`Package ID: ${packageId}`);
            this.logger.log(`Module Name: ${moduleName}`);
            this.logger.log(`User Address: ${userAddress}`);
            const sessionKey = await this.getOrCreateSessionKey(userAddress, signature);
            const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
            const identityString = `self:${userAddress}`;
            const identityBytes = new TextEncoder().encode(identityString);
            const id = (0, utils_1.toHEX)(identityBytes);
            this.logger.log(`Identity for decrypt: ${identityString}`);
            const { Transaction } = await import('@mysten/sui/transactions');
            const tx = new Transaction();
            tx.moveCall({
                target: `${packageId}::${moduleName}::seal_approve`,
                arguments: [
                    tx.pure.vector('u8', Array.from(identityBytes))
                ]
            });
            this.logger.log('Building transaction with seal_approve call...');
            const txBytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });
            this.logger.log(`Transaction size: ${txBytes.length} bytes`);
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedBytes,
                sessionKey,
                txBytes,
            });
            const decrypted = new TextDecoder().decode(decryptedBytes);
            this.logger.log('✅ Decryption successful!');
            this.logger.log('=== SEAL DECRYPTION END ===');
            return decrypted;
        }
        catch (error) {
            this.logger.error('SEAL decryption error:', error);
            throw new Error(`Failed to decrypt: ${error.message}`);
        }
    }
    async getSessionKeyMessage(userAddress) {
        const packageId = this.configService.get('SEAL_PACKAGE_ID');
        if (!packageId) {
            throw new Error('SEAL_PACKAGE_ID not configured');
        }
        const cacheKey = `${userAddress}:${packageId}`;
        const cached = this.sessionKeys.get(cacheKey);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.sessionKey.getPersonalMessage();
        }
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: packageId,
            ttlMin: this.sessionTtlMin,
            suiClient: this.suiClient,
        });
        const personalMessage = sessionKey.getPersonalMessage();
        this.sessionKeys.set(cacheKey, {
            sessionKey,
            expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
        });
        this.logger.debug(`Created new session key for ${userAddress} with package ${packageId}`);
        this.logger.debug(`Personal message: ${Buffer.from(personalMessage).toString('utf8')}`);
        return personalMessage;
    }
    async getOrCreateSessionKey(userAddress, signature) {
        const packageId = this.configService.get('SEAL_PACKAGE_ID');
        if (!packageId) {
            throw new Error('SEAL_PACKAGE_ID not configured');
        }
        const cacheKey = `${userAddress}:${packageId}`;
        const cached = this.sessionKeys.get(cacheKey);
        if (cached) {
            const now = Date.now();
            if (now < cached.expiresAt) {
                if (signature && signature !== cached.signature) {
                    cached.sessionKey.setPersonalMessageSignature(signature);
                    cached.signature = signature;
                    this.logger.debug('Updated signature on cached SessionKey');
                }
                return cached.sessionKey;
            }
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
        this.sessionKeys.set(cacheKey, {
            sessionKey,
            expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
            signature,
        });
        this.logger.debug(`Created new session key for ${userAddress} with package ${packageId}`);
        return sessionKey;
    }
    async testCompleteFlow(userAddress, signature) {
        try {
            const testData = `Test data for ${userAddress} at ${new Date().toISOString()}`;
            this.logger.log('=== Testing Encryption ===');
            const { encrypted, backupKey, identityUsed } = await this.encryptForUser(testData, userAddress);
            this.logger.log(`✓ Encrypted successfully`);
            this.logger.log(`  Identity used: ${identityUsed}`);
            this.logger.log(`  Backup key: ${backupKey.substring(0, 20)}...`);
            this.logger.log('=== Testing Decryption ===');
            const decrypted = await this.decryptForUser(encrypted, userAddress, signature);
            this.logger.log(`✓ Decrypted successfully`);
            this.logger.log(`  Original: ${testData}`);
            this.logger.log(`  Decrypted: ${decrypted}`);
            return {
                success: true,
                encrypted,
                decrypted,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error.message,
            };
        }
    }
};
exports.SealSimpleService = SealSimpleService;
exports.SealSimpleService = SealSimpleService = SealSimpleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_store_1.SessionStore])
], SealSimpleService);
//# sourceMappingURL=seal-simple.service.js.map
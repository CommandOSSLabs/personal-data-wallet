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
var SealService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
const session_store_1 = require("./session-store");
let SealService = SealService_1 = class SealService {
    configService;
    sessionStore;
    sealClient;
    suiClient;
    logger = new common_1.Logger(SealService_1.name);
    packageId;
    sealCorePackageId = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    moduleName;
    threshold;
    network;
    sessionKeys = new Map();
    isOpenMode;
    constructor(configService, sessionStore) {
        this.configService = configService;
        this.sessionStore = sessionStore;
        this.network = this.configService.get('SEAL_NETWORK', 'testnet');
        this.packageId = this.configService.get('SEAL_PACKAGE_ID', '');
        this.moduleName = this.configService.get('SEAL_MODULE_NAME', 'seal_access_control');
        this.threshold = this.configService.get('SEAL_THRESHOLD', 2);
        this.isOpenMode = this.configService.get('SEAL_OPEN_MODE', true);
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
            verifyKeyServers: !this.isOpenMode,
        });
        this.logger.log(`SEAL service initialized with ${serverConfigs.length} key servers on ${this.network}`);
        this.logger.log(`Operating in ${this.isOpenMode ? 'OPEN' : 'PERMISSIONED'} mode`);
    }
    async encrypt(content, userAddress, customPackageId) {
        try {
            const data = new TextEncoder().encode(content);
            let packageIdToUse;
            if (this.isOpenMode && customPackageId) {
                packageIdToUse = customPackageId;
                this.logger.debug(`Open mode: Using custom package ID ${packageIdToUse}`);
            }
            else if (this.packageId) {
                packageIdToUse = this.packageId;
            }
            else {
                packageIdToUse = this.sealCorePackageId;
            }
            const identityString = this.isOpenMode
                ? `open:${userAddress}`
                : `self:${userAddress}`;
            const identityBytes = new TextEncoder().encode(identityString);
            const id = (0, utils_1.toHEX)(identityBytes);
            const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
                threshold: this.threshold,
                packageId: packageIdToUse,
                id: id,
                data,
            });
            const encrypted = Buffer.from(encryptedObject).toString('base64');
            const backupKeyHex = (0, utils_1.toHEX)(backupKey);
            this.logger.debug(`Encrypted content for user ${userAddress} with threshold ${this.threshold}`);
            this.logger.debug(`Mode: ${this.isOpenMode ? 'OPEN' : 'PERMISSIONED'}, Package: ${packageIdToUse}`);
            return {
                encrypted,
                backupKey: backupKeyHex,
            };
        }
        catch (error) {
            this.logger.error(`Error encrypting content: ${error.message}`);
            throw new Error(`SEAL encryption error: ${error.message}`);
        }
    }
    async decrypt(encryptedContent, userAddress, signature, customPackageId, customModuleName) {
        try {
            let packageIdToUse;
            let moduleNameToUse;
            if (this.isOpenMode && customPackageId && customModuleName) {
                packageIdToUse = customPackageId;
                moduleNameToUse = customModuleName;
                this.logger.debug(`Open mode: Using custom package ${packageIdToUse}::${moduleNameToUse}`);
            }
            else if (this.packageId) {
                packageIdToUse = this.packageId;
                moduleNameToUse = this.moduleName;
            }
            else {
                packageIdToUse = this.sealCorePackageId;
                moduleNameToUse = '';
            }
            const sessionKey = await this.getOrCreateSessionKey(userAddress, signature, packageIdToUse);
            const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
            const identityString = this.isOpenMode
                ? `open:${userAddress}`
                : `self:${userAddress}`;
            const identityBytes = new TextEncoder().encode(identityString);
            const id = (0, utils_1.toHEX)(identityBytes);
            const tx = new transactions_1.Transaction();
            if (moduleNameToUse) {
                tx.moveCall({
                    target: `${packageIdToUse}::${moduleNameToUse}::seal_approve`,
                    arguments: [
                        tx.pure.vector("u8", (0, utils_1.fromHEX)(id)),
                    ]
                });
            }
            const txBytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });
            this.logger.debug(`Decrypting with mode: ${this.isOpenMode ? 'OPEN' : 'PERMISSIONED'}`);
            this.logger.debug(`Package: ${packageIdToUse}, Module: ${moduleNameToUse || 'native'}`);
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedBytes,
                sessionKey,
                txBytes,
            });
            const decrypted = new TextDecoder().decode(decryptedBytes);
            this.logger.debug(`Decrypted content for user ${userAddress}`);
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Error decrypting content: ${error.message}`);
            throw new Error(`SEAL decryption error: ${error.message}`);
        }
    }
    async decryptWithBackupKey(encryptedContent, backupKey) {
        try {
            throw new Error('Backup key decryption not yet implemented');
        }
        catch (error) {
            this.logger.error(`Error decrypting with backup key: ${error.message}`);
            throw new Error(`Backup key decryption error: ${error.message}`);
        }
    }
    async getOrCreateSessionKey(userAddress, signature, packageId) {
        const pkgId = packageId || this.packageId || this.sealCorePackageId;
        const cacheKey = `${userAddress}:${pkgId}`;
        const cached = this.sessionKeys.get(cacheKey);
        const sessionData = this.sessionStore.get(cacheKey);
        if (cached && sessionData && sessionData.signature) {
            this.logger.debug(`Using cached SessionKey for ${userAddress}`);
            return cached;
        }
        if (cached && signature && (!sessionData || !sessionData.signature)) {
            this.logger.debug(`Setting signature on existing SessionKey for ${userAddress}`);
            try {
                cached.setPersonalMessageSignature(signature);
                this.logger.debug(`Signature set successfully on cached SessionKey`);
                if (sessionData) {
                    sessionData.signature = signature;
                    this.sessionStore.set(cacheKey, sessionData);
                }
                return cached;
            }
            catch (error) {
                this.logger.error(`Failed to set signature on cached SessionKey: ${error.message}`);
            }
        }
        if (sessionData && cached) {
            if (signature) {
                this.logger.debug(`Setting new signature on cached SessionKey for ${userAddress}`);
                try {
                    cached.setPersonalMessageSignature(signature);
                    this.logger.debug(`Signature set successfully`);
                    sessionData.signature = signature;
                    this.sessionStore.set(cacheKey, sessionData);
                }
                catch (error) {
                    this.logger.error(`Failed to set signature: ${error.message}`);
                    throw new Error(`Failed to set session key signature: ${error.message}`);
                }
            }
            else if (sessionData.signature) {
                try {
                    cached.setPersonalMessageSignature(sessionData.signature);
                    this.logger.debug(`Set stored signature on cached SessionKey`);
                }
                catch (error) {
                    this.logger.warn(`Failed to set stored signature: ${error.message}`);
                    throw new Error('User signature required for session key initialization');
                }
            }
            else {
                throw new Error('User signature required for session key initialization');
            }
            return cached;
        }
        throw new Error('No session found. Please request session message first.');
    }
    async getSessionKeyMessage(userAddress, packageId) {
        const pkgId = packageId || this.packageId || this.sealCorePackageId;
        const cacheKey = `${userAddress}:${pkgId}`;
        const existingSession = this.sessionStore.get(cacheKey);
        if (existingSession && !existingSession.signature) {
            return Buffer.from(existingSession.personalMessage, 'hex');
        }
        const ttlMin = this.configService.get('SEAL_SESSION_TTL_MIN', 60);
        const sessionKey = new seal_1.SessionKey({
            address: userAddress,
            packageId: pkgId,
            ttlMin,
            suiClient: this.suiClient,
        });
        const personalMessage = sessionKey.getPersonalMessage();
        this.sessionStore.set(cacheKey, {
            address: userAddress,
            personalMessage: Buffer.from(personalMessage).toString('hex'),
            expiresAt: Date.now() + (ttlMin * 60 * 1000),
        });
        this.sessionKeys.set(cacheKey, sessionKey);
        return personalMessage;
    }
    isSessionKeyExpired(sessionKey) {
        return false;
    }
    isInOpenMode() {
        return this.isOpenMode;
    }
    async fetchMultipleKeys(ids, userAddress, signature, packageId, moduleName) {
        try {
            const pkgId = (this.isOpenMode && packageId) ? packageId : (this.packageId || this.sealCorePackageId);
            const modName = (this.isOpenMode && moduleName) ? moduleName : this.moduleName;
            const sessionKey = await this.getOrCreateSessionKey(userAddress, signature, pkgId);
            const tx = new transactions_1.Transaction();
            for (const id of ids) {
                if (modName) {
                    tx.moveCall({
                        target: `${pkgId}::${modName}::seal_approve`,
                        arguments: [
                            tx.pure.vector("u8", (0, utils_1.fromHEX)(id)),
                        ],
                    });
                }
            }
            const txBytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });
            const keys = await this.sealClient.fetchKeys({
                ids: ids,
                txBytes,
                sessionKey,
                threshold: this.threshold,
            });
            const result = new Map();
            ids.forEach((id, index) => {
                if (keys[index]) {
                    result.set(id, keys[index]);
                }
            });
            return result;
        }
        catch (error) {
            this.logger.error(`Error fetching multiple keys: ${error.message}`);
            throw new Error(`SEAL batch fetch error: ${error.message}`);
        }
    }
};
exports.SealService = SealService;
exports.SealService = SealService = SealService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_store_1.SessionStore])
], SealService);
//# sourceMappingURL=seal.service.js.map
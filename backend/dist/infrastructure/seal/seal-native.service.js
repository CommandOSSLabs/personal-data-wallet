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
var SealNativeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealNativeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
const utils_1 = require("@mysten/sui/utils");
const session_store_1 = require("./session-store");
let SealNativeService = SealNativeService_1 = class SealNativeService {
    configService;
    sessionStore;
    sealClient;
    suiClient;
    logger = new common_1.Logger(SealNativeService_1.name);
    sealPackageId = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
    threshold;
    network;
    sessionKeys = new Map();
    constructor(configService, sessionStore) {
        this.configService = configService;
        this.sessionStore = sessionStore;
        this.network = this.configService.get('SEAL_NETWORK', 'testnet');
        this.threshold = this.configService.get('SEAL_THRESHOLD', 2);
        this.suiClient = new client_1.SuiClient({
            url: this.configService.get('SUI_RPC_URL', (0, client_1.getFullnodeUrl)(this.network))
        });
        const serverConfigs = (0, seal_1.getAllowlistedKeyServers)(this.network).map(id => ({ objectId: id, weight: 1 }));
        this.sealClient = new seal_1.SealClient({
            suiClient: this.suiClient,
            serverConfigs,
        });
        this.logger.log(`SEAL Native service initialized with ${serverConfigs.length} key servers on ${this.network}`);
    }
    async encrypt(content, identity) {
        try {
            const data = new TextEncoder().encode(content);
            const identityBytes = new TextEncoder().encode(identity);
            const identityHex = (0, utils_1.toHEX)(identityBytes);
            const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
                threshold: this.threshold,
                packageId: this.sealPackageId,
                id: identityHex,
                data,
            });
            const encrypted = Buffer.from(encryptedObject).toString('base64');
            const backupKeyHex = (0, utils_1.toHEX)(backupKey);
            this.logger.debug(`Encrypted content for identity ${identity}`);
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
    async decrypt(encryptedContent, identity, address, signature) {
        try {
            const sessionKey = await this.getOrCreateSessionKey(address, signature);
            const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
            const identityBytes = new TextEncoder().encode(identity);
            const identityHex = (0, utils_1.toHEX)(identityBytes);
            const { Transaction } = await import('@mysten/sui/transactions');
            const tx = new Transaction();
            tx.setSender(address);
            const txBytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedBytes,
                sessionKey,
                txBytes,
            });
            const decrypted = new TextDecoder().decode(decryptedBytes);
            this.logger.debug(`Decrypted content for identity ${identity}`);
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Error decrypting content: ${error.message}`);
            throw new Error(`SEAL decryption error: ${error.message}`);
        }
    }
    async getSessionKeyMessage(address) {
        const existingSession = this.sessionStore.get(address);
        if (existingSession && !existingSession.signature) {
            return Buffer.from(existingSession.personalMessage, 'hex');
        }
        const ttlMin = this.configService.get('SEAL_SESSION_TTL_MIN', 30);
        const sessionKey = new seal_1.SessionKey({
            address: address,
            packageId: this.sealPackageId,
            ttlMin,
            suiClient: this.suiClient,
        });
        const personalMessage = sessionKey.getPersonalMessage();
        this.sessionStore.set(address, {
            address: address,
            personalMessage: Buffer.from(personalMessage).toString('hex'),
            expiresAt: Date.now() + (ttlMin * 60 * 1000),
        });
        this.sessionKeys.set(address, sessionKey);
        return personalMessage;
    }
    async getOrCreateSessionKey(address, signature) {
        const cached = this.sessionKeys.get(address);
        const sessionData = this.sessionStore.get(address);
        if (cached && sessionData && sessionData.signature) {
            this.logger.debug(`Using cached SessionKey for ${address}`);
            return cached;
        }
        if (cached && signature) {
            this.logger.debug(`Setting signature on existing SessionKey for ${address}`);
            try {
                cached.setPersonalMessageSignature(signature);
                this.logger.debug(`Signature set successfully on cached SessionKey`);
                if (sessionData) {
                    sessionData.signature = signature;
                    this.sessionStore.set(address, sessionData);
                }
                return cached;
            }
            catch (error) {
                this.logger.error(`Failed to set signature on cached SessionKey: ${error.message}`);
                throw error;
            }
        }
        throw new Error('No session found. Please request session message first.');
    }
};
exports.SealNativeService = SealNativeService;
exports.SealNativeService = SealNativeService = SealNativeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_store_1.SessionStore])
], SealNativeService);
//# sourceMappingURL=seal-native.service.js.map
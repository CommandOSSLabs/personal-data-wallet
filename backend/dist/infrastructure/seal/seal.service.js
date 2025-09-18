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
const transactions_1 = require("@mysten/sui/transactions");
const sui_service_1 = require("../sui/sui.service");
const utils_1 = require("@mysten/sui/utils");
let SealService = SealService_1 = class SealService {
    configService;
    suiService;
    sealClient;
    logger = new common_1.Logger(SealService_1.name);
    packageId;
    moduleName;
    constructor(configService, suiService) {
        this.configService = configService;
        this.suiService = suiService;
        const keyServerIds = this.configService.get('SEAL_KEY_SERVER_IDS')?.split(',') || [];
        const isTestnet = this.configService.get('SUI_NETWORK') === 'testnet';
        if (keyServerIds.length === 0) {
            this.logger.warn('No SEAL_KEY_SERVER_IDS configured, using testnet defaults');
            keyServerIds.push('0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', '0x...');
        }
        try {
            this.sealClient = new seal_1.SealClient({
                suiClient: this.suiService.getClient(),
                serverConfigs: keyServerIds.map(id => ({
                    objectId: id.trim(),
                    weight: 1,
                })),
                verifyKeyServers: !isTestnet,
            });
            this.logger.log('SEAL client initialized successfully');
        }
        catch (error) {
            this.logger.warn(`SEAL client initialization failed: ${error.message}`);
            this.sealClient = null;
        }
        this.packageId = this.configService.get('SEAL_PACKAGE_ID') || '';
        this.moduleName = this.configService.get('SEAL_MODULE_NAME') || 'access_control';
        if (!this.packageId) {
            this.logger.warn('SEAL_PACKAGE_ID not configured - access control will not work');
        }
    }
    async encrypt(content, userAddress, metadata) {
        try {
            if (!this.sealClient) {
                throw new Error('SEAL client not initialized - encryption unavailable');
            }
            const data = new TextEncoder().encode(content);
            const identity = userAddress;
            const aad = metadata ?
                new TextEncoder().encode(JSON.stringify(metadata)) :
                undefined;
            const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
                threshold: 2,
                packageId: this.packageId,
                id: identity,
                data,
                aad,
            });
            const encryptedData = Buffer.from(encryptedObject).toString('base64');
            const backupKeyHex = (0, utils_1.toHex)(backupKey);
            this.logger.debug(`Content encrypted for user ${userAddress}`);
            return {
                encryptedData,
                backupKey: backupKeyHex,
            };
        }
        catch (error) {
            this.logger.error(`Error encrypting content: ${error.message}`);
            throw new Error(`Encryption error: ${error.message}`);
        }
    }
    async buildAccessTransaction(identity, accessType = 'read') {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::${this.moduleName}::seal_approve`,
            arguments: [
                tx.pure.vector('u8', Array.from((0, utils_1.fromHex)(identity))),
                tx.pure.string(accessType),
                tx.pure.u64(Date.now()),
            ],
        });
        return tx;
    }
    async decrypt(encryptedContent, userAddress, sessionKey, signedTxBytes) {
        try {
            if (!this.sealClient) {
                throw new Error('SEAL client not initialized - decryption unavailable');
            }
            const encryptedData = Uint8Array.from(Buffer.from(encryptedContent, 'base64'));
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedData,
                sessionKey,
                txBytes: signedTxBytes,
                checkShareConsistency: true,
            });
            const decryptedContent = new TextDecoder().decode(decryptedBytes);
            this.logger.debug(`Content decrypted for user ${userAddress}`);
            return decryptedContent;
        }
        catch (error) {
            this.logger.error(`Error decrypting content: ${error.message}`);
            throw new Error(`Decryption error: ${error.message}`);
        }
    }
    async createSessionKey(userAddress) {
        return seal_1.SessionKey.create({
            address: userAddress,
            packageId: this.packageId,
            ttlMin: 60,
            suiClient: this.suiService.getClient(),
        });
    }
    async exportSessionKey(sessionKey) {
        const exported = sessionKey.export();
        return JSON.stringify(exported);
    }
    async importSessionKey(exportedKey) {
        const keyData = JSON.parse(exportedKey);
        return seal_1.SessionKey.import(keyData, this.suiService.getClient());
    }
    async grantAccess(ownerAddress, recipientAddress, contentId, accessLevel) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::${this.moduleName}::grant_access`,
            arguments: [
                tx.pure.address(ownerAddress),
                tx.pure.address(recipientAddress),
                tx.pure.string(contentId),
                tx.pure.string(accessLevel),
                tx.pure.u64(Date.now() + 86400000),
            ],
        });
        return tx;
    }
    async revokeAccess(ownerAddress, recipientAddress, contentId) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::${this.moduleName}::revoke_access`,
            arguments: [
                tx.pure.address(ownerAddress),
                tx.pure.address(recipientAddress),
                tx.pure.string(contentId),
            ],
        });
        return tx;
    }
    async hasAccess(userAddress, contentId, ownerAddress) {
        try {
            if (userAddress === ownerAddress) {
                return true;
            }
            const client = this.suiService.getClient();
            const result = await client.devInspectTransactionBlock({
                transactionBlock: await this.buildCheckAccessTransaction(userAddress, contentId, ownerAddress),
                sender: userAddress,
            });
            return result.effects.status.status === 'success';
        }
        catch (error) {
            this.logger.error(`Error checking access: ${error.message}`);
            return false;
        }
    }
    async buildCheckAccessTransaction(userAddress, contentId, ownerAddress) {
        const tx = new transactions_1.Transaction();
        tx.moveCall({
            target: `${this.packageId}::${this.moduleName}::check_access`,
            arguments: [
                tx.pure.address(userAddress),
                tx.pure.string(contentId),
                tx.pure.address(ownerAddress),
            ],
        });
        return tx;
    }
};
exports.SealService = SealService;
exports.SealService = SealService = SealService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        sui_service_1.SuiService])
], SealService);
//# sourceMappingURL=seal.service.js.map
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
const session_key_service_1 = require("./session-key.service");
let SealService = SealService_1 = class SealService {
    configService;
    sessionKeyService;
    sealClient;
    suiClient;
    logger = new common_1.Logger(SealService_1.name);
    packageId;
    threshold = 2;
    constructor(configService, sessionKeyService) {
        this.configService = configService;
        this.sessionKeyService = sessionKeyService;
        const network = this.configService.get('SEAL_NETWORK', 'testnet');
        this.packageId = this.configService.get('SEAL_PACKAGE_ID', '0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60');
        this.suiClient = new client_1.SuiClient({
            url: this.configService.get('SUI_RPC_URL', (0, client_1.getFullnodeUrl)(network))
        });
        const keyServerIds = this.configService.get('SEAL_KEY_SERVER_IDS', [
            '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
            '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
        ]);
        const serverConfigs = keyServerIds.map(id => ({ objectId: id, weight: 1 }));
        this.sealClient = new seal_1.SealClient({
            suiClient: this.suiClient,
            serverConfigs,
            verifyKeyServers: false,
        });
        this.logger.log(`SEAL service initialized with ${serverConfigs.length} key servers on ${network}`);
        this.logger.log(`Package ID: ${this.packageId || 'Not configured'}`);
    }
    async encrypt(data, policyObjectId, nonce = Math.random().toString(36)) {
        try {
            const identityId = `${policyObjectId}:${nonce}`;
            const result = await this.sealClient.encrypt({
                threshold: this.threshold,
                packageId: this.packageId,
                id: identityId,
                data,
            });
            return {
                encrypted: result.encryptedObject,
                identityId,
            };
        }
        catch (error) {
            this.logger.error('Failed to encrypt data', error);
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }
    async decrypt(encryptedData, moveCallConstructor, userAddress) {
        try {
            const encryptedObject = seal_1.EncryptedObject.parse(encryptedData);
            const identityId = encryptedObject.id;
            this.logger.debug(`Decrypting data with identity: ${identityId} for user: ${userAddress}`);
            let sessionKey = await this.sessionKeyService.getSessionKey(userAddress, this.packageId);
            if (!sessionKey) {
                throw new Error('No valid session key found. Please create a session first.');
            }
            const tx = new transactions_1.Transaction();
            moveCallConstructor(tx, identityId);
            const txBytes = await tx.build({ client: this.suiClient, onlyTransactionKind: true });
            await this.sealClient.fetchKeys({
                ids: [identityId],
                txBytes,
                sessionKey,
                threshold: this.threshold,
            });
            const decrypted = await this.sealClient.decrypt({
                data: encryptedData,
                sessionKey,
                txBytes,
            });
            this.logger.debug(`Successfully decrypted data for user: ${userAddress}`);
            return decrypted;
        }
        catch (error) {
            this.logger.error('Failed to decrypt data', error);
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
    createSelfAccessTransaction(userAddress) {
        return (tx, id) => {
            tx.moveCall({
                target: `${this.packageId}::seal_access_control::seal_approve`,
                arguments: [
                    tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
                ],
            });
        };
    }
    createAppAccessTransaction(allowlistId) {
        return (tx, id) => {
            tx.moveCall({
                target: `${this.packageId}::seal_access_control::seal_approve_app`,
                arguments: [
                    tx.object(allowlistId),
                    tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
                ],
            });
        };
    }
    createTimelockAccessTransaction(timelockId) {
        return (tx, id) => {
            tx.moveCall({
                target: `${this.packageId}::seal_access_control::seal_approve_timelock`,
                arguments: [
                    tx.object(timelockId),
                    tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
                ],
            });
        };
    }
    createRoleAccessTransaction(roleRegistryId, userAddress, role) {
        return (tx, id) => {
            tx.moveCall({
                target: `${this.packageId}::seal_access_control::seal_approve_role`,
                arguments: [
                    tx.object(roleRegistryId),
                    tx.pure.address(userAddress),
                    tx.pure.string(role),
                    tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
                ],
            });
        };
    }
    getSuiClient() {
        return this.suiClient;
    }
    getSealClient() {
        return this.sealClient;
    }
};
exports.SealService = SealService;
exports.SealService = SealService = SealService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_key_service_1.SessionKeyService])
], SealService);
//# sourceMappingURL=seal.service.js.map
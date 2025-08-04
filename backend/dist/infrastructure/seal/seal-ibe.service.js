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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealIBEService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const transactions_1 = require("@mysten/sui/transactions");
const utils_1 = require("@mysten/sui/utils");
const identity_types_1 = require("./identity-types");
const seal_service_1 = require("./seal.service");
const sui_service_1 = require("../sui/sui.service");
const session_store_1 = require("./session-store");
let SealIBEService = class SealIBEService extends seal_service_1.SealService {
    suiService;
    constructor(configService, sessionStore, suiService) {
        super(configService, sessionStore);
        this.suiService = suiService;
    }
    async encryptForIdentity(content, identityOptions) {
        try {
            const data = new TextEncoder().encode(content);
            const identityString = (0, identity_types_1.createIdentityString)(identityOptions);
            const identityBytes = new TextEncoder().encode(identityString);
            const id = (0, utils_1.toHEX)(identityBytes);
            const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
                threshold: this.threshold,
                packageId: this.sealCorePackageId,
                id: id,
                data,
            });
            const encrypted = Buffer.from(encryptedObject).toString('base64');
            const backupKeyHex = (0, utils_1.toHEX)(backupKey);
            this.logger.debug(`Encrypted content with identity type ${identityOptions.type} for user ${identityOptions.userAddress}`);
            return {
                encrypted,
                backupKey: backupKeyHex,
                identityType: identityOptions.type,
                identityString,
            };
        }
        catch (error) {
            this.logger.error(`Error encrypting content: ${error.message}`);
            throw new Error(`SEAL encryption error: ${error.message}`);
        }
    }
    async encryptForApp(content, userAddress, appAddress) {
        const result = await this.encryptForIdentity(content, {
            type: identity_types_1.IdentityType.APP,
            userAddress,
            targetAddress: appAddress,
        });
        return {
            encrypted: result.encrypted,
            backupKey: result.backupKey,
            appAddress,
            identityString: result.identityString,
        };
    }
    async encryptWithTimelock(content, userAddress, expiresAt) {
        const result = await this.encryptForIdentity(content, {
            type: identity_types_1.IdentityType.TIME_LOCKED,
            userAddress,
            expiresAt,
        });
        return {
            encrypted: result.encrypted,
            backupKey: result.backupKey,
            expiresAt,
            identityString: result.identityString,
        };
    }
    async decryptWithIdentity(encryptedContent, identityOptions, signature) {
        try {
            const requesterAddress = identityOptions.targetAddress || identityOptions.userAddress;
            this.logger.debug(`Creating session key for requester ${requesterAddress} with signature: ${signature}`);
            const sessionKey = await this.getOrCreateSessionKey(requesterAddress, signature);
            const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
            const identityString = (0, identity_types_1.createIdentityString)(identityOptions);
            const identityBytes = new TextEncoder().encode(identityString);
            const id = (0, utils_1.toHEX)(identityBytes);
            const tx = new transactions_1.Transaction();
            const txBytes = await tx.build({
                client: this.suiClient,
                onlyTransactionKind: true
            });
            this.logger.debug(`Attempting to decrypt with native SEAL`);
            this.logger.debug(`Encrypted bytes length: ${encryptedBytes.length}`);
            this.logger.debug(`Identity: ${identityString}`);
            this.logger.debug(`Requester address: ${requesterAddress}`);
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedBytes,
                sessionKey,
                txBytes,
            });
            const decrypted = new TextDecoder().decode(decryptedBytes);
            this.logger.debug(`Decrypted content with identity type ${identityOptions.type}`);
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Error decrypting content: ${error.message}`);
            throw new Error(`SEAL decryption error: ${error.message}`);
        }
    }
    async grantAppPermission(userAddress, appAddress, dataIds, expiresAt) {
        const effectiveExpiresAt = expiresAt || 0;
        try {
            const permissionId = await this.suiService.grantAppPermission(userAddress, appAddress, dataIds, effectiveExpiresAt);
            this.logger.log(`Granted on-chain permission ${permissionId} to app ${appAddress} for user ${userAddress}`);
            return {
                permissionId,
                appAddress,
                dataIds,
                expiresAt: effectiveExpiresAt,
            };
        }
        catch (error) {
            this.logger.error(`Failed to grant app permission: ${error.message}`);
            throw error;
        }
    }
    async revokeAppPermission(userAddress, permissionId) {
        try {
            const success = await this.suiService.revokeAppPermission(permissionId, userAddress);
            this.logger.log(`Revoked on-chain permission ${permissionId} for user ${userAddress}`);
            return success;
        }
        catch (error) {
            this.logger.error(`Failed to revoke app permission: ${error.message}`);
            throw error;
        }
    }
    async listAppPermissions(userAddress) {
        try {
            const permissions = await this.suiService.getUserAppPermissions(userAddress);
            const detailedPermissions = await Promise.all(permissions.map(async (perm) => {
                try {
                    const details = await this.suiService.getAppPermission(perm.id);
                    return {
                        permissionId: perm.id,
                        appAddress: perm.app,
                        appName: undefined,
                        dataIds: details.dataIds,
                        grantedAt: new Date(perm.grantedAt),
                        expiresAt: perm.expiresAt > 0 ? new Date(perm.expiresAt) : undefined,
                        revoked: perm.revoked
                    };
                }
                catch (error) {
                    this.logger.warn(`Failed to get details for permission ${perm.id}: ${error.message}`);
                    return null;
                }
            }));
            return detailedPermissions
                .filter((p) => p !== null && !p.revoked)
                .map(({ revoked, ...rest }) => rest);
        }
        catch (error) {
            this.logger.error(`Failed to list app permissions: ${error.message}`);
            return [];
        }
    }
};
exports.SealIBEService = SealIBEService;
exports.SealIBEService = SealIBEService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => sui_service_1.SuiService))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        session_store_1.SessionStore,
        sui_service_1.SuiService])
], SealIBEService);
//# sourceMappingURL=seal-ibe.service.js.map
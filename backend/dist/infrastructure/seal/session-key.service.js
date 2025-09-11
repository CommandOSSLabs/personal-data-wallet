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
var SessionKeyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionKeyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seal_1 = require("@mysten/seal");
const client_1 = require("@mysten/sui/client");
let SessionKeyService = SessionKeyService_1 = class SessionKeyService {
    configService;
    logger = new common_1.Logger(SessionKeyService_1.name);
    sessionCache = new Map();
    suiClient;
    defaultPackageId;
    defaultTtlMinutes;
    mvrName;
    constructor(configService) {
        this.configService = configService;
        const network = this.configService.get('SEAL_NETWORK', 'testnet');
        this.suiClient = new client_1.SuiClient({
            url: this.configService.get('SUI_RPC_URL', (0, client_1.getFullnodeUrl)(network))
        });
        this.defaultPackageId = this.configService.get('SEAL_PACKAGE_ID', '0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60');
        this.defaultTtlMinutes = this.configService.get('SEAL_SESSION_TTL_MINUTES', 10);
        this.mvrName = this.configService.get('SEAL_MVR_NAME', 'personal-data-wallet');
        setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
    }
    async createSession(request) {
        try {
            const packageId = request.packageId || this.defaultPackageId;
            const ttlMinutes = request.ttlMinutes || this.defaultTtlMinutes;
            this.logger.log(`Creating session for user ${request.userAddress} with package ${packageId}`);
            const sessionKey = await seal_1.SessionKey.create({
                address: request.userAddress,
                packageId: packageId,
                ttlMin: ttlMinutes,
                suiClient: this.suiClient,
                mvrName: this.mvrName,
            });
            const sessionId = this.generateSessionId(request.userAddress, packageId);
            const sessionData = {
                sessionKey,
                exportedKey: sessionKey.export(),
                userAddress: request.userAddress,
                packageId,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
            };
            this.sessionCache.set(sessionId, sessionData);
            this.logger.log(`Session created with ID: ${sessionId}`);
            return {
                personalMessage: sessionKey.getPersonalMessage(),
                sessionId,
            };
        }
        catch (error) {
            this.logger.error('Failed to create session', error);
            throw new Error(`Session creation failed: ${error.message}`);
        }
    }
    async signSession(sessionId, request) {
        try {
            const sessionData = this.sessionCache.get(sessionId);
            if (!sessionData) {
                throw new Error('Session not found or expired');
            }
            if (sessionData.userAddress !== request.userAddress) {
                throw new Error('Session user address mismatch');
            }
            this.logger.log(`Signing session ${sessionId} for user ${request.userAddress}`);
            await sessionData.sessionKey.setPersonalMessageSignature(request.signature);
            sessionData.exportedKey = sessionData.sessionKey.export();
            this.sessionCache.set(sessionId, sessionData);
            this.logger.log(`Session ${sessionId} signed successfully`);
            return sessionData;
        }
        catch (error) {
            this.logger.error('Failed to sign session', error);
            throw new Error(`Session signing failed: ${error.message}`);
        }
    }
    async getSessionKey(userAddress, packageId) {
        try {
            const sessionId = this.generateSessionId(userAddress, packageId || this.defaultPackageId);
            const sessionData = this.sessionCache.get(sessionId);
            if (!sessionData) {
                this.logger.debug(`No session found for user ${userAddress}`);
                return null;
            }
            if (sessionData.sessionKey.isExpired() || new Date() > sessionData.expiresAt) {
                this.logger.debug(`Session expired for user ${userAddress}`);
                this.sessionCache.delete(sessionId);
                return null;
            }
            if (sessionData.sessionKey.getAddress() !== userAddress) {
                this.logger.warn(`Session address mismatch for user ${userAddress}`);
                this.sessionCache.delete(sessionId);
                return null;
            }
            this.logger.debug(`Retrieved valid session for user ${userAddress}`);
            return sessionData.sessionKey;
        }
        catch (error) {
            this.logger.error('Failed to get session key', error);
            return null;
        }
    }
    async getSessionStatus(sessionId) {
        const sessionData = this.sessionCache.get(sessionId);
        if (!sessionData) {
            return { exists: false, signed: false, expired: false };
        }
        const isExpired = sessionData.sessionKey.isExpired() || new Date() > sessionData.expiresAt;
        const isSigned = !!sessionData.exportedKey.signature;
        return {
            exists: true,
            signed: isSigned,
            expired: isExpired,
            userAddress: sessionData.userAddress,
            expiresAt: sessionData.expiresAt,
        };
    }
    async importSessionKey(exportedKey) {
        try {
            const sessionKey = await seal_1.SessionKey.import(exportedKey, this.suiClient);
            if (sessionKey.isExpired()) {
                this.logger.debug('Imported session key is expired');
                return null;
            }
            return sessionKey;
        }
        catch (error) {
            this.logger.error('Failed to import session key', error);
            return null;
        }
    }
    cleanupExpiredSessions() {
        const now = new Date();
        let cleanedCount = 0;
        for (const [sessionId, sessionData] of this.sessionCache.entries()) {
            if (sessionData.sessionKey.isExpired() || now > sessionData.expiresAt) {
                this.sessionCache.delete(sessionId);
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
        }
    }
    generateSessionId(userAddress, packageId) {
        return `${userAddress}:${packageId}`;
    }
    getStats() {
        const now = new Date();
        let activeSessions = 0;
        for (const sessionData of this.sessionCache.values()) {
            if (!sessionData.sessionKey.isExpired() && now <= sessionData.expiresAt) {
                activeSessions++;
            }
        }
        return {
            totalSessions: this.sessionCache.size,
            activeSessions,
        };
    }
};
exports.SessionKeyService = SessionKeyService;
exports.SessionKeyService = SessionKeyService = SessionKeyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SessionKeyService);
//# sourceMappingURL=session-key.service.js.map
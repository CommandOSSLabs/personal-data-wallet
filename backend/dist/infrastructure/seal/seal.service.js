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
var SealService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let SealService = SealService_1 = class SealService {
    configService;
    masterKey;
    logger = new common_1.Logger(SealService_1.name);
    constructor(configService) {
        this.configService = configService;
        const masterKeyHex = this.configService.get('SEAL_MASTER_KEY');
        if (!masterKeyHex) {
            this.logger.warn('SEAL_MASTER_KEY not provided, using a default key (NOT SECURE)');
            this.masterKey = crypto.randomBytes(32);
        }
        else {
            this.masterKey = Buffer.from(masterKeyHex, 'hex');
        }
    }
    async encrypt(content, userAddress) {
        try {
            const userKey = this.deriveUserKey(userAddress);
            const iv = crypto.randomBytes(12);
            const cipher = crypto.createCipheriv('aes-256-gcm', userKey, iv);
            let encrypted = cipher.update(content, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            const authTag = cipher.getAuthTag();
            return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
        }
        catch (error) {
            this.logger.error(`Error encrypting content: ${error.message}`);
            throw new Error(`Encryption error: ${error.message}`);
        }
    }
    async decrypt(encryptedContent, userAddress) {
        try {
            const parts = encryptedContent.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid encrypted content format');
            }
            const iv = Buffer.from(parts[0], 'base64');
            const authTag = Buffer.from(parts[1], 'base64');
            const encrypted = parts[2];
            const userKey = this.deriveUserKey(userAddress);
            const decipher = crypto.createDecipheriv('aes-256-gcm', userKey, iv);
            decipher.setAuthTag(authTag);
            let decrypted = decipher.update(encrypted, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        }
        catch (error) {
            this.logger.error(`Error decrypting content: ${error.message}`);
            throw new Error(`Decryption error: ${error.message}`);
        }
    }
    async canDecrypt(userAddress) {
        return !!userAddress && userAddress.length > 0;
    }
    async generateDecryptionKey(userAddress) {
        const userKey = this.deriveUserKey(userAddress);
        return userKey.toString('hex');
    }
    deriveUserKey(userAddress) {
        const info = Buffer.from('seal-user-key');
        const salt = crypto.createHash('sha256').update(userAddress).digest();
        const hkdf = crypto.createHmac('sha256', this.masterKey)
            .update(Buffer.concat([salt, info]))
            .digest();
        return hkdf;
    }
};
exports.SealService = SealService;
exports.SealService = SealService = SealService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SealService);
//# sourceMappingURL=seal.service.js.map
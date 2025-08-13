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
var DemoStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const readFile = (0, util_1.promisify)(fs.readFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
let DemoStorageService = DemoStorageService_1 = class DemoStorageService {
    logger = new common_1.Logger(DemoStorageService_1.name);
    STORAGE_DIR = path.join(process.cwd(), 'storage', 'demo');
    constructor() {
        this.initializeStorage();
    }
    async initializeStorage() {
        try {
            await mkdir(this.STORAGE_DIR, { recursive: true });
            this.logger.log(`Demo storage initialized at: ${this.STORAGE_DIR}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize demo storage: ${error.message}`);
        }
    }
    generateBlobId() {
        return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    async uploadContent(content, ownerAddress, epochs = 12, additionalTags = {}) {
        const blobId = this.generateBlobId();
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
        const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
        try {
            await writeFile(filePath, content, 'utf-8');
            const metadata = {
                blobId,
                ownerAddress,
                epochs,
                tags: additionalTags,
                contentType: 'text/plain',
                createdAt: new Date().toISOString(),
                storageType: 'demo'
            };
            await writeFile(metaPath, JSON.stringify(metadata, null, 2));
            this.logger.log(`Content stored: ${blobId} for ${ownerAddress}`);
            return blobId;
        }
        catch (error) {
            this.logger.error(`Failed to store content: ${error.message}`);
            throw new Error(`Demo storage error: ${error.message}`);
        }
    }
    async uploadFile(buffer, filename, ownerAddress, epochs = 12, additionalTags = {}) {
        const blobId = this.generateBlobId();
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
        try {
            await writeFile(filePath, buffer);
            const metadata = {
                blobId,
                filename,
                ownerAddress,
                epochs,
                tags: additionalTags,
                contentType: 'application/octet-stream',
                size: buffer.length,
                createdAt: new Date().toISOString(),
                storageType: 'demo'
            };
            await writeFile(metaPath, JSON.stringify(metadata, null, 2));
            this.logger.log(`File stored: ${blobId} (${filename}) for ${ownerAddress}`);
            return blobId;
        }
        catch (error) {
            this.logger.error(`Failed to store file: ${error.message}`);
            throw new Error(`Demo storage error: ${error.message}`);
        }
    }
    async downloadFile(blobId) {
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        const textPath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
        try {
            try {
                const buffer = await readFile(filePath);
                this.logger.log(`File retrieved: ${blobId} (${buffer.length} bytes)`);
                return buffer;
            }
            catch (error) {
                const content = await readFile(textPath, 'utf-8');
                const buffer = Buffer.from(content, 'utf-8');
                this.logger.log(`Content retrieved: ${blobId} (${buffer.length} bytes)`);
                return buffer;
            }
        }
        catch (error) {
            this.logger.error(`Failed to retrieve file ${blobId}: ${error.message}`);
            throw new Error(`File not found: ${blobId}`);
        }
    }
    async verifyUserAccess(blobId, userAddress) {
        return true;
    }
    getAdminAddress() {
        return 'demo_admin_address';
    }
    async exists(blobId) {
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        const textPath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
        try {
            await readFile(filePath);
            return true;
        }
        catch (error) {
            try {
                await readFile(textPath);
                return true;
            }
            catch (error) {
                return false;
            }
        }
    }
    async getStats() {
        try {
            const files = await fs.promises.readdir(this.STORAGE_DIR);
            const dataFiles = files.filter(file => file.endsWith('.bin') || file.endsWith('.txt'));
            return {
                totalFiles: dataFiles.length,
                storageDir: this.STORAGE_DIR
            };
        }
        catch (error) {
            return {
                totalFiles: 0,
                storageDir: this.STORAGE_DIR
            };
        }
    }
};
exports.DemoStorageService = DemoStorageService;
exports.DemoStorageService = DemoStorageService = DemoStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DemoStorageService);
//# sourceMappingURL=demo-storage.service.js.map
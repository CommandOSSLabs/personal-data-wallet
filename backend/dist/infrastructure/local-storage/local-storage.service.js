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
var LocalStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs.writeFile);
const readFile = (0, util_1.promisify)(fs.readFile);
const mkdir = (0, util_1.promisify)(fs.mkdir);
const unlink = (0, util_1.promisify)(fs.unlink);
const readdir = (0, util_1.promisify)(fs.readdir);
const stat = (0, util_1.promisify)(fs.stat);
let LocalStorageService = LocalStorageService_1 = class LocalStorageService {
    logger = new common_1.Logger(LocalStorageService_1.name);
    STORAGE_DIR = path.join(process.cwd(), 'storage', 'local-files');
    constructor() {
        this.initializeStorage();
    }
    async initializeStorage() {
        try {
            await mkdir(this.STORAGE_DIR, { recursive: true });
            this.logger.log(`Local storage initialized at: ${this.STORAGE_DIR}`);
        }
        catch (error) {
            this.logger.error(`Failed to initialize local storage: ${error.message}`);
            throw new Error(`Local storage initialization failed: ${error.message}`);
        }
    }
    generateBlobId() {
        return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    async storeContent(content, filename, tags = {}) {
        const buffer = Buffer.from(content, 'utf-8');
        return this.storeFile(buffer, filename, tags);
    }
    async storeFile(buffer, filename, tags = {}) {
        const blobId = this.generateBlobId();
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
        try {
            await writeFile(filePath, buffer);
            const metadata = {
                blobId,
                filename,
                tags,
                size: buffer.length,
                createdAt: new Date().toISOString(),
                storageType: 'local'
            };
            await writeFile(metaPath, JSON.stringify(metadata, null, 2));
            this.logger.log(`File stored locally: ${blobId} (${buffer.length} bytes)`);
            return blobId;
        }
        catch (error) {
            this.logger.error(`Failed to store file locally: ${error.message}`);
            throw new Error(`Local storage error: ${error.message}`);
        }
    }
    async retrieveFile(blobId) {
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        try {
            const buffer = await readFile(filePath);
            this.logger.log(`File retrieved from local storage: ${blobId} (${buffer.length} bytes)`);
            return buffer;
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`File not found in local storage: ${blobId}`);
            }
            this.logger.error(`Failed to retrieve file locally: ${error.message}`);
            throw new Error(`Local storage retrieval error: ${error.message}`);
        }
    }
    async retrieveContent(blobId) {
        const buffer = await this.retrieveFile(blobId);
        return buffer.toString('utf-8');
    }
    async getMetadata(blobId) {
        const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
        try {
            const metaContent = await readFile(metaPath, 'utf-8');
            return JSON.parse(metaContent);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                throw new Error(`Metadata not found for: ${blobId}`);
            }
            throw new Error(`Failed to read metadata: ${error.message}`);
        }
    }
    async exists(blobId) {
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        try {
            await stat(filePath);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async deleteFile(blobId) {
        const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
        const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
        try {
            await unlink(filePath);
            await unlink(metaPath);
            this.logger.log(`File deleted from local storage: ${blobId}`);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.logger.error(`Failed to delete file: ${error.message}`);
                throw new Error(`Delete error: ${error.message}`);
            }
        }
    }
    async listFiles() {
        try {
            const files = await readdir(this.STORAGE_DIR);
            const metaFiles = files.filter(file => file.endsWith('.meta.json'));
            const metadata = [];
            for (const metaFile of metaFiles) {
                try {
                    const metaPath = path.join(this.STORAGE_DIR, metaFile);
                    const metaContent = await readFile(metaPath, 'utf-8');
                    metadata.push(JSON.parse(metaContent));
                }
                catch (error) {
                    this.logger.warn(`Failed to read metadata file ${metaFile}: ${error.message}`);
                }
            }
            return metadata.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
        catch (error) {
            this.logger.error(`Failed to list files: ${error.message}`);
            return [];
        }
    }
    async getStats() {
        try {
            const files = await this.listFiles();
            const totalSize = files.reduce((sum, file) => sum + file.size, 0);
            return {
                totalFiles: files.length,
                totalSize,
                storageDir: this.STORAGE_DIR
            };
        }
        catch (error) {
            this.logger.error(`Failed to get storage stats: ${error.message}`);
            return {
                totalFiles: 0,
                totalSize: 0,
                storageDir: this.STORAGE_DIR
            };
        }
    }
    async cleanup(olderThanDays = 30) {
        try {
            const files = await this.listFiles();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
            let deletedCount = 0;
            for (const file of files) {
                const fileDate = new Date(file.createdAt);
                if (fileDate < cutoffDate) {
                    await this.deleteFile(file.blobId);
                    deletedCount++;
                }
            }
            this.logger.log(`Cleaned up ${deletedCount} old files`);
            return deletedCount;
        }
        catch (error) {
            this.logger.error(`Failed to cleanup files: ${error.message}`);
            return 0;
        }
    }
};
exports.LocalStorageService = LocalStorageService;
exports.LocalStorageService = LocalStorageService = LocalStorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocalStorageService);
//# sourceMappingURL=local-storage.service.js.map
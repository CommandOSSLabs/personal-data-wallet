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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var WalrusService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalrusService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
let WalrusService = WalrusService_1 = class WalrusService {
    configService;
    apiUrl;
    apiKey;
    logger = new common_1.Logger(WalrusService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.apiUrl = this.configService.get('WALRUS_API_URL', 'https://api.walrus.ai/v1');
        const apiKey = this.configService.get('WALRUS_API_KEY');
        if (!apiKey) {
            this.logger.warn('WALRUS_API_KEY not provided, using dummy key for development');
            this.apiKey = 'dummy_key_for_development';
        }
        else {
            this.apiKey = apiKey;
        }
    }
    async uploadContent(content) {
        try {
            const response = await axios_1.default.post(`${this.apiUrl}/blobs`, { content }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data.blob_id;
        }
        catch (error) {
            this.logger.error(`Error uploading content to Walrus: ${error.message}`);
            throw new Error(`Walrus upload error: ${error.message}`);
        }
    }
    async retrieveContent(blobId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/blobs/${blobId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data.content;
        }
        catch (error) {
            this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
            throw new Error(`Walrus retrieval error: ${error.message}`);
        }
    }
    async deleteContent(blobId) {
        try {
            await axios_1.default.delete(`${this.apiUrl}/blobs/${blobId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Error deleting content from Walrus: ${error.message}`);
            throw new Error(`Walrus deletion error: ${error.message}`);
        }
    }
    async uploadFile(buffer, filename) {
        try {
            const formData = new FormData();
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            formData.append('file', blob, filename);
            const response = await axios_1.default.post(`${this.apiUrl}/files`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            return response.data.blob_id;
        }
        catch (error) {
            this.logger.error(`Error uploading file to Walrus: ${error.message}`);
            throw new Error(`Walrus file upload error: ${error.message}`);
        }
    }
    async downloadFile(blobId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/files/${blobId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                responseType: 'arraybuffer'
            });
            return Buffer.from(response.data);
        }
        catch (error) {
            this.logger.error(`Error downloading file from Walrus: ${error.message}`);
            throw new Error(`Walrus file download error: ${error.message}`);
        }
    }
};
exports.WalrusService = WalrusService;
exports.WalrusService = WalrusService = WalrusService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WalrusService);
//# sourceMappingURL=walrus.service.js.map
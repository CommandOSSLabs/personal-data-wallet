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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealMetricsDto = exports.SealCacheMetricsDto = exports.SealHealthCheckDto = exports.SealPerformanceMetricsDto = exports.SealOperationMetricsDto = exports.DecryptContentDto = exports.EncryptContentDto = exports.SessionKeyResponseDto = exports.CompleteSessionKeyDto = exports.InitializeSessionKeyDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class InitializeSessionKeyDto {
    identity;
}
exports.InitializeSessionKeyDto = InitializeSessionKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User address/identity for session key generation',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], InitializeSessionKeyDto.prototype, "identity", void 0);
class CompleteSessionKeyDto {
    identity;
    signature;
}
exports.CompleteSessionKeyDto = CompleteSessionKeyDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User address/identity',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteSessionKeyDto.prototype, "identity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base64 encoded signature from user wallet',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CompleteSessionKeyDto.prototype, "signature", void 0);
class SessionKeyResponseDto {
    sessionKey;
    identity;
    expiresAt;
    status;
}
exports.SessionKeyResponseDto = SessionKeyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session key data or personal message to sign',
        example: 'Sign this message to initialize your session key...'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionKeyResponseDto.prototype, "sessionKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User identity/address',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionKeyResponseDto.prototype, "identity", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session expiration timestamp',
        example: 1640995200000
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SessionKeyResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session status',
        enum: ['pending_signature', 'active'],
        example: 'pending_signature'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SessionKeyResponseDto.prototype, "status", void 0);
class EncryptContentDto {
    content;
    userAddress;
    metadata;
}
exports.EncryptContentDto = EncryptContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Content to encrypt',
        example: 'This is sensitive data that needs to be encrypted'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EncryptContentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User address to encrypt for',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], EncryptContentDto.prototype, "userAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional metadata',
        required: false,
        example: { category: 'personal', tags: ['important'] }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], EncryptContentDto.prototype, "metadata", void 0);
class DecryptContentDto {
    encryptedData;
    userAddress;
    sessionKey;
}
exports.DecryptContentDto = DecryptContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Base64 encoded encrypted data',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DecryptContentDto.prototype, "encryptedData", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User address to decrypt for',
        example: '0x1234567890abcdef...'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DecryptContentDto.prototype, "userAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional session key for decryption',
        required: false,
        example: 'session_key_data...'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DecryptContentDto.prototype, "sessionKey", void 0);
class SealOperationMetricsDto {
    encryptions;
    decryptions;
    failures;
}
exports.SealOperationMetricsDto = SealOperationMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of encryption operations',
        example: 150
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealOperationMetricsDto.prototype, "encryptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of decryption operations',
        example: 89
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealOperationMetricsDto.prototype, "decryptions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of failed operations',
        example: 3
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealOperationMetricsDto.prototype, "failures", void 0);
class SealPerformanceMetricsDto {
    avgEncryptionTime;
    avgDecryptionTime;
    successRate;
}
exports.SealPerformanceMetricsDto = SealPerformanceMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average encryption time in milliseconds',
        example: 250.5
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealPerformanceMetricsDto.prototype, "avgEncryptionTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Average decryption time in milliseconds',
        example: 180.3
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealPerformanceMetricsDto.prototype, "avgDecryptionTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Success rate (0-1)',
        example: 0.97
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealPerformanceMetricsDto.prototype, "successRate", void 0);
class SealHealthCheckDto {
    keyServerId;
    url;
    isHealthy;
    responseTime;
    lastChecked;
    error;
}
exports.SealHealthCheckDto = SealHealthCheckDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Key server identifier',
        example: 'mysten-testnet-1'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SealHealthCheckDto.prototype, "keyServerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Server URL',
        example: 'https://seal-key-server.testnet.sui.io'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SealHealthCheckDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Server health status',
        example: true
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SealHealthCheckDto.prototype, "isHealthy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response time in milliseconds',
        example: 45,
        required: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealHealthCheckDto.prototype, "responseTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last health check timestamp',
        example: 1640995200000
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealHealthCheckDto.prototype, "lastChecked", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Error message if unhealthy',
        required: false,
        example: 'Connection timeout'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SealHealthCheckDto.prototype, "error", void 0);
class SealCacheMetricsDto {
    hits;
    misses;
    size;
}
exports.SealCacheMetricsDto = SealCacheMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of cache hits',
        example: 45
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealCacheMetricsDto.prototype, "hits", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of cache misses',
        example: 12
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealCacheMetricsDto.prototype, "misses", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current cache size',
        example: 28
    }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SealCacheMetricsDto.prototype, "size", void 0);
class SealMetricsDto {
    operations;
    performance;
    keyServers;
    cache;
}
exports.SealMetricsDto = SealMetricsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Operation metrics',
        type: SealOperationMetricsDto
    }),
    __metadata("design:type", SealOperationMetricsDto)
], SealMetricsDto.prototype, "operations", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Performance metrics',
        type: SealPerformanceMetricsDto
    }),
    __metadata("design:type", SealPerformanceMetricsDto)
], SealMetricsDto.prototype, "performance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Key server health checks',
        type: [SealHealthCheckDto]
    }),
    __metadata("design:type", Array)
], SealMetricsDto.prototype, "keyServers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cache metrics',
        type: SealCacheMetricsDto
    }),
    __metadata("design:type", SealCacheMetricsDto)
], SealMetricsDto.prototype, "cache", void 0);
//# sourceMappingURL=seal.dto.js.map
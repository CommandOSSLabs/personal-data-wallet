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
var AccessControlController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const seal_service_1 = require("../../infrastructure/seal/seal.service");
const memory_query_service_1 = require("../memory-query/memory-query.service");
const access_control_dto_1 = require("../dto/access-control.dto");
let AccessControlController = AccessControlController_1 = class AccessControlController {
    sealService;
    memoryQueryService;
    logger = new common_1.Logger(AccessControlController_1.name);
    constructor(sealService, memoryQueryService) {
        this.sealService = sealService;
        this.memoryQueryService = memoryQueryService;
    }
    async grantAccess(grantAccessDto, ownerAddress) {
        try {
            if (!ownerAddress) {
                throw new common_1.HttpException('Owner address is required', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`Granting ${grantAccessDto.accessLevel || 'read'} access to ${grantAccessDto.delegatedAddress} for resource ${grantAccessDto.resourceId}`);
            const permission = await this.sealService.grantAccess(ownerAddress, grantAccessDto.delegatedAddress, grantAccessDto.resourceId, grantAccessDto.accessLevel, grantAccessDto.expiresAt, grantAccessDto.metadata);
            return this.mapAccessPermissionToDto(permission);
        }
        catch (error) {
            this.logger.error(`Error granting access: ${error.message}`);
            throw new common_1.HttpException(`Failed to grant access: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async revokeAccess(permissionId, revokerAddress) {
        try {
            if (!revokerAddress) {
                throw new common_1.HttpException('Revoker address is required', common_1.HttpStatus.BAD_REQUEST);
            }
            this.logger.log(`Revoking access permission ${permissionId} by ${revokerAddress}`);
            const success = await this.sealService.revokeAccess(permissionId, revokerAddress);
            return {
                message: 'Access revoked successfully',
                success
            };
        }
        catch (error) {
            this.logger.error(`Error revoking access: ${error.message}`);
            if (error.message.includes('not found')) {
                throw new common_1.HttpException('Permission not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (error.message.includes('Only the owner')) {
                throw new common_1.HttpException('Only the owner can revoke access', common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException(`Failed to revoke access: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkAccess(checkAccessDto) {
        try {
            this.logger.log(`Checking access for ${checkAccessDto.delegatedAddress} to resource ${checkAccessDto.resourceId}`);
            const permission = await this.sealService.checkAccess(checkAccessDto.delegatedAddress, checkAccessDto.resourceId, checkAccessDto.ownerAddress, checkAccessDto.requiredAccessLevel);
            return {
                hasAccess: !!permission,
                permission: permission ? this.mapAccessPermissionToDto(permission) : undefined
            };
        }
        catch (error) {
            this.logger.error(`Error checking access: ${error.message}`);
            throw new common_1.HttpException(`Failed to check access: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async decryptWithDelegatedAccess(delegatedDecryptionDto) {
        try {
            this.logger.log(`Delegated decryption request from ${delegatedDecryptionDto.delegatedIdentity} for content owned by ${delegatedDecryptionDto.ownerIdentity}`);
            const result = await this.sealService.decryptWithDelegatedAccess({
                encryptedData: delegatedDecryptionDto.encryptedData,
                ownerIdentity: delegatedDecryptionDto.ownerIdentity,
                delegatedIdentity: delegatedDecryptionDto.delegatedIdentity,
                permissionId: delegatedDecryptionDto.permissionId,
                sessionKey: delegatedDecryptionDto.sessionKey
            });
            return {
                content: result.content,
                accessGrantedBy: result.accessGrantedBy,
                permissionId: result.permissionId,
                success: true
            };
        }
        catch (error) {
            this.logger.error(`Delegated decryption failed: ${error.message}`);
            if (error.message.includes('Access denied')) {
                throw new common_1.HttpException('Access denied', common_1.HttpStatus.FORBIDDEN);
            }
            throw new common_1.HttpException(`Failed to decrypt content: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async batchDecrypt(batchDecryptionDto) {
        try {
            this.logger.log(`Batch decryption request for ${batchDecryptionDto.encryptedDataList.length} items`);
            const batchRequest = {
                items: batchDecryptionDto.encryptedDataList.map((encryptedData, index) => ({
                    encryptedData,
                    identity: batchDecryptionDto.ownerIdentities[index] || batchDecryptionDto.requestingUserAddress
                })),
                options: {
                    parallel: batchDecryptionDto.parallel,
                    failFast: batchDecryptionDto.failFast
                }
            };
            const result = await this.sealService.batchDecrypt(batchRequest);
            const mappedResults = result.results.map((item, index) => ({
                index,
                ...(item instanceof Error
                    ? { error: item.message }
                    : { content: item.content })
            }));
            return {
                results: mappedResults,
                summary: result.summary
            };
        }
        catch (error) {
            this.logger.error(`Batch decryption failed: ${error.message}`);
            throw new common_1.HttpException(`Failed to batch decrypt: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getUserPermissions(userAddress) {
        try {
            this.logger.log(`Retrieving permissions for user ${userAddress}`);
            const permissions = await this.sealService.listUserPermissions(userAddress);
            return {
                owned: permissions.owned.map(p => this.mapAccessPermissionToDto(p)),
                delegated: permissions.delegated.map(p => this.mapAccessPermissionToDto(p))
            };
        }
        catch (error) {
            this.logger.error(`Error retrieving user permissions: ${error.message}`);
            throw new common_1.HttpException(`Failed to retrieve permissions: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async queryMemoriesWithDelegatedAccess(delegatedQueryDto) {
        try {
            this.logger.log(`Delegated memory query from ${delegatedQueryDto.requestingUserAddress} for ${delegatedQueryDto.ownerAddress}'s memories`);
            const hasAccess = await this.sealService.checkAccess(delegatedQueryDto.requestingUserAddress, 'memories_general', delegatedQueryDto.ownerAddress, 'read');
            if (!hasAccess) {
                throw new common_1.HttpException('Access denied: You do not have permission to query this user\'s memories', common_1.HttpStatus.FORBIDDEN);
            }
            const queryResult = await this.memoryQueryService.searchMemories(delegatedQueryDto.query, delegatedQueryDto.ownerAddress, delegatedQueryDto.category, delegatedQueryDto.k);
            const enhancedResults = queryResult.results.map(memory => ({
                ...memory,
                accessLevel: 'read',
                accessGrantedBy: delegatedQueryDto.ownerAddress,
                permissionId: hasAccess.id
            }));
            return {
                results: enhancedResults,
                summary: {
                    accessible: enhancedResults.length,
                    denied: 0,
                    totalFound: enhancedResults.length
                }
            };
        }
        catch (error) {
            this.logger.error(`Delegated memory query failed: ${error.message}`);
            if (error.status === common_1.HttpStatus.FORBIDDEN) {
                throw error;
            }
            throw new common_1.HttpException(`Failed to query memories: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    mapAccessPermissionToDto(permission) {
        return {
            id: permission.id,
            ownerAddress: permission.ownerAddress,
            delegatedAddress: permission.delegatedAddress,
            resourceId: permission.resourceId,
            accessLevel: permission.accessLevel,
            expiresAt: permission.expiresAt,
            createdAt: permission.createdAt,
            metadata: permission.metadata
        };
    }
};
exports.AccessControlController = AccessControlController;
__decorate([
    (0, common_1.Post)('grant'),
    (0, swagger_1.ApiOperation)({ summary: 'Grant access to another user for specific memory content' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Access granted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Forbidden - user not authorized' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('ownerAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [access_control_dto_1.GrantAccessDto, String]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "grantAccess", null);
__decorate([
    (0, common_1.Delete)('revoke/:permissionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke access permission' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access revoked successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Permission not found' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Only owner can revoke access' }),
    __param(0, (0, common_1.Param)('permissionId')),
    __param(1, (0, common_1.Query)('revokerAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "revokeAccess", null);
__decorate([
    (0, common_1.Get)('check'),
    (0, swagger_1.ApiOperation)({ summary: 'Check if user has access to a resource' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Access check result' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [access_control_dto_1.CheckAccessDto]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "checkAccess", null);
__decorate([
    (0, common_1.Post)('decrypt/delegated'),
    (0, swagger_1.ApiOperation)({ summary: 'Decrypt content with delegated access' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Content decrypted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Access denied' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [access_control_dto_1.DelegatedDecryptionDto]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "decryptWithDelegatedAccess", null);
__decorate([
    (0, common_1.Post)('decrypt/batch'),
    (0, swagger_1.ApiOperation)({ summary: 'Batch decrypt multiple items with proper access control' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Batch decryption completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [access_control_dto_1.BatchDecryptionDto]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "batchDecrypt", null);
__decorate([
    (0, common_1.Get)('permissions/:userAddress'),
    (0, swagger_1.ApiOperation)({ summary: 'List all permissions for a user' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User permissions retrieved' }),
    __param(0, (0, common_1.Param)('userAddress')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "getUserPermissions", null);
__decorate([
    (0, common_1.Post)('query/delegated'),
    (0, swagger_1.ApiOperation)({ summary: 'Query memories with delegated access' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Delegated memory query completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [access_control_dto_1.DelegatedMemoryQueryDto]),
    __metadata("design:returntype", Promise)
], AccessControlController.prototype, "queryMemoriesWithDelegatedAccess", null);
exports.AccessControlController = AccessControlController = AccessControlController_1 = __decorate([
    (0, swagger_1.ApiTags)('Memory Access Control'),
    (0, common_1.Controller)('memory/access'),
    __metadata("design:paramtypes", [seal_service_1.SealService,
        memory_query_service_1.MemoryQueryService])
], AccessControlController);
//# sourceMappingURL=access-control.controller.js.map
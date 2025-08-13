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
var AccessControlService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlService = void 0;
const common_1 = require("@nestjs/common");
const seal_service_1 = require("../../infrastructure/seal/seal.service");
const memory_query_service_1 = require("../memory-query/memory-query.service");
const sui_service_1 = require("../../infrastructure/sui/sui.service");
let AccessControlService = AccessControlService_1 = class AccessControlService {
    sealService;
    memoryQueryService;
    suiService;
    logger = new common_1.Logger(AccessControlService_1.name);
    constructor(sealService, memoryQueryService, suiService) {
        this.sealService = sealService;
        this.memoryQueryService = memoryQueryService;
        this.suiService = suiService;
    }
    async getAccessibleMemories(userAddress, includeOwnMemories = true, includeDelegatedMemories = true) {
        try {
            const ownMemories = [];
            const delegatedMemories = [];
            if (includeOwnMemories) {
                const userMemoriesResult = await this.memoryQueryService.getUserMemories(userAddress);
                if (userMemoriesResult.success) {
                    ownMemories.push(...userMemoriesResult.memories.map(memory => ({
                        ...memory,
                        accessLevel: 'owner'
                    })));
                }
            }
            if (includeDelegatedMemories) {
                const permissions = await this.sealService.listUserPermissions(userAddress);
                for (const permission of permissions.delegated) {
                    try {
                        const ownerMemories = await this.memoryQueryService.getUserMemories(permission.ownerAddress);
                        if (ownerMemories.success) {
                            const accessibleMemory = ownerMemories.memories.find(memory => memory.id === permission.resourceId ||
                                memory.walrusHash === permission.resourceId);
                            if (accessibleMemory) {
                                delegatedMemories.push({
                                    ...accessibleMemory,
                                    accessLevel: permission.accessLevel,
                                    accessGrantedBy: permission.ownerAddress,
                                    permissionId: permission.id
                                });
                            }
                        }
                    }
                    catch (error) {
                        this.logger.warn(`Failed to access memory from permission ${permission.id}: ${error.message}`);
                    }
                }
            }
            return {
                ownMemories,
                delegatedMemories,
                summary: {
                    totalOwned: ownMemories.length,
                    totalDelegated: delegatedMemories.length,
                    totalAccessible: ownMemories.length + delegatedMemories.length
                }
            };
        }
        catch (error) {
            this.logger.error(`Error getting accessible memories: ${error.message}`);
            throw new Error(`Failed to get accessible memories: ${error.message}`);
        }
    }
    async searchAccessibleMemories(userAddress, query, category, k = 5) {
        try {
            this.logger.log(`Searching accessible memories for user ${userAddress} with query: "${query}"`);
            const accessibleMemories = await this.getAccessibleMemories(userAddress);
            const allAccessibleMemories = [
                ...accessibleMemories.ownMemories,
                ...accessibleMemories.delegatedMemories
            ];
            const filteredMemories = category
                ? allAccessibleMemories.filter(memory => memory.category === category)
                : allAccessibleMemories;
            const searchResults = filteredMemories
                .filter(memory => memory.content.toLowerCase().includes(query.toLowerCase()) ||
                memory.category.toLowerCase().includes(query.toLowerCase()))
                .slice(0, k);
            const ownedResults = searchResults.filter(memory => memory.accessLevel === 'owner');
            const delegatedResults = searchResults.filter(memory => memory.accessLevel !== 'owner');
            return {
                results: searchResults,
                sources: {
                    owned: ownedResults,
                    delegated: delegatedResults
                }
            };
        }
        catch (error) {
            this.logger.error(`Error searching accessible memories: ${error.message}`);
            throw new Error(`Failed to search accessible memories: ${error.message}`);
        }
    }
    async grantBulkAccess(ownerAddress, delegatedAddress, resourceIds, accessLevel = 'read', expiresAt, metadata) {
        try {
            this.logger.log(`Granting bulk access to ${resourceIds.length} resources from ${ownerAddress} to ${delegatedAddress}`);
            const successful = [];
            const failed = [];
            for (const resourceId of resourceIds) {
                try {
                    const permission = await this.sealService.grantAccess(ownerAddress, delegatedAddress, resourceId, accessLevel, expiresAt, metadata);
                    successful.push(permission);
                }
                catch (error) {
                    failed.push({
                        resourceId,
                        error: error.message
                    });
                }
            }
            return {
                successful,
                failed,
                summary: {
                    granted: successful.length,
                    failed: failed.length,
                    total: resourceIds.length
                }
            };
        }
        catch (error) {
            this.logger.error(`Error granting bulk access: ${error.message}`);
            throw new Error(`Failed to grant bulk access: ${error.message}`);
        }
    }
    async revokeBulkAccess(revokerAddress, permissionIds) {
        try {
            this.logger.log(`Revoking bulk access for ${permissionIds.length} permissions by ${revokerAddress}`);
            const successful = [];
            const failed = [];
            for (const permissionId of permissionIds) {
                try {
                    const success = await this.sealService.revokeAccess(permissionId, revokerAddress);
                    if (success) {
                        successful.push(permissionId);
                    }
                    else {
                        failed.push({
                            permissionId,
                            error: 'Revocation returned false'
                        });
                    }
                }
                catch (error) {
                    failed.push({
                        permissionId,
                        error: error.message
                    });
                }
            }
            return {
                successful,
                failed,
                summary: {
                    revoked: successful.length,
                    failed: failed.length,
                    total: permissionIds.length
                }
            };
        }
        catch (error) {
            this.logger.error(`Error revoking bulk access: ${error.message}`);
            throw new Error(`Failed to revoke bulk access: ${error.message}`);
        }
    }
    async getUserSharingAnalytics(userAddress) {
        try {
            const permissions = await this.sealService.listUserPermissions(userAddress);
            const userMemories = await this.memoryQueryService.getUserMemories(userAddress);
            const uniqueUsersGrantedAccess = new Set(permissions.owned.map(p => p.delegatedAddress)).size;
            const sharesByAccessLevel = permissions.owned.reduce((acc, permission) => {
                acc[permission.accessLevel] = (acc[permission.accessLevel] || 0) + 1;
                return acc;
            }, {});
            const uniqueOwnersGrantingAccess = new Set(permissions.delegated.map(p => p.ownerAddress)).size;
            const accessByLevel = permissions.delegated.reduce((acc, permission) => {
                acc[permission.accessLevel] = (acc[permission.accessLevel] || 0) + 1;
                return acc;
            }, {});
            const now = Date.now();
            const expiringPermissions = permissions.delegated.filter(p => p.expiresAt && p.expiresAt < now + (7 * 24 * 60 * 60 * 1000)).length;
            return {
                ownedResources: {
                    totalResources: userMemories.memories?.length || 0,
                    totalSharedResources: permissions.owned.length,
                    uniqueUsersGrantedAccess,
                    sharesByAccessLevel
                },
                delegatedAccess: {
                    totalPermissions: permissions.delegated.length,
                    uniqueOwnersGrantingAccess,
                    accessByLevel,
                    expiringPermissions
                }
            };
        }
        catch (error) {
            this.logger.error(`Error getting user sharing analytics: ${error.message}`);
            throw new Error(`Failed to get sharing analytics: ${error.message}`);
        }
    }
};
exports.AccessControlService = AccessControlService;
exports.AccessControlService = AccessControlService = AccessControlService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [seal_service_1.SealService,
        memory_query_service_1.MemoryQueryService,
        sui_service_1.SuiService])
], AccessControlService);
//# sourceMappingURL=access-control.service.js.map
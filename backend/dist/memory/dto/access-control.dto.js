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
exports.DelegatedMemoryQueryDto = exports.UserPermissionsResponseDto = exports.AccessPermissionDto = exports.BatchDecryptionDto = exports.DelegatedDecryptionDto = exports.CheckAccessDto = exports.RevokeAccessDto = exports.GrantAccessDto = exports.AccessLevel = void 0;
const class_validator_1 = require("class-validator");
var AccessLevel;
(function (AccessLevel) {
    AccessLevel["READ"] = "read";
    AccessLevel["WRITE"] = "write";
    AccessLevel["ADMIN"] = "admin";
})(AccessLevel || (exports.AccessLevel = AccessLevel = {}));
class GrantAccessDto {
    delegatedAddress;
    resourceId;
    accessLevel = AccessLevel.READ;
    expiresAt;
    metadata;
}
exports.GrantAccessDto = GrantAccessDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrantAccessDto.prototype, "delegatedAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GrantAccessDto.prototype, "resourceId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AccessLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GrantAccessDto.prototype, "accessLevel", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], GrantAccessDto.prototype, "expiresAt", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], GrantAccessDto.prototype, "metadata", void 0);
class RevokeAccessDto {
    permissionId;
}
exports.RevokeAccessDto = RevokeAccessDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RevokeAccessDto.prototype, "permissionId", void 0);
class CheckAccessDto {
    delegatedAddress;
    resourceId;
    ownerAddress;
    requiredAccessLevel = AccessLevel.READ;
}
exports.CheckAccessDto = CheckAccessDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckAccessDto.prototype, "delegatedAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckAccessDto.prototype, "resourceId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CheckAccessDto.prototype, "ownerAddress", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AccessLevel),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CheckAccessDto.prototype, "requiredAccessLevel", void 0);
class DelegatedDecryptionDto {
    encryptedData;
    ownerIdentity;
    delegatedIdentity;
    permissionId;
    sessionKey;
}
exports.DelegatedDecryptionDto = DelegatedDecryptionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelegatedDecryptionDto.prototype, "encryptedData", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelegatedDecryptionDto.prototype, "ownerIdentity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelegatedDecryptionDto.prototype, "delegatedIdentity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DelegatedDecryptionDto.prototype, "permissionId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DelegatedDecryptionDto.prototype, "sessionKey", void 0);
class BatchDecryptionDto {
    encryptedDataList;
    ownerIdentities;
    requestingUserAddress;
    parallel = true;
    failFast = false;
}
exports.BatchDecryptionDto = BatchDecryptionDto;
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BatchDecryptionDto.prototype, "encryptedDataList", void 0);
__decorate([
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BatchDecryptionDto.prototype, "ownerIdentities", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BatchDecryptionDto.prototype, "requestingUserAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BatchDecryptionDto.prototype, "parallel", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], BatchDecryptionDto.prototype, "failFast", void 0);
class AccessPermissionDto {
    id;
    ownerAddress;
    delegatedAddress;
    resourceId;
    accessLevel;
    expiresAt;
    createdAt;
    metadata;
}
exports.AccessPermissionDto = AccessPermissionDto;
class UserPermissionsResponseDto {
    owned;
    delegated;
}
exports.UserPermissionsResponseDto = UserPermissionsResponseDto;
class DelegatedMemoryQueryDto {
    query;
    ownerAddress;
    requestingUserAddress;
    category;
    k = 5;
}
exports.DelegatedMemoryQueryDto = DelegatedMemoryQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelegatedMemoryQueryDto.prototype, "query", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelegatedMemoryQueryDto.prototype, "ownerAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DelegatedMemoryQueryDto.prototype, "requestingUserAddress", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DelegatedMemoryQueryDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DelegatedMemoryQueryDto.prototype, "k", void 0);
//# sourceMappingURL=access-control.dto.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceOwnershipException = exports.DelegatedDecryptionException = exports.BulkOperationException = exports.CrossDAppAccessException = exports.UnauthorizedRevocationException = exports.PermissionExpiredException = exports.PermissionNotFoundException = exports.AccessDeniedException = exports.AccessControlException = void 0;
class AccessControlException extends Error {
    userAddress;
    resourceId;
    originalError;
    constructor(message, userAddress, resourceId, originalError) {
        super(message);
        this.userAddress = userAddress;
        this.resourceId = resourceId;
        this.originalError = originalError;
        this.name = 'AccessControlException';
    }
}
exports.AccessControlException = AccessControlException;
class AccessDeniedException extends AccessControlException {
    requiredAccessLevel;
    currentAccessLevel;
    constructor(message, userAddress, resourceId, requiredAccessLevel, currentAccessLevel, originalError) {
        super(message, userAddress, resourceId, originalError);
        this.requiredAccessLevel = requiredAccessLevel;
        this.currentAccessLevel = currentAccessLevel;
        this.name = 'AccessDeniedException';
    }
}
exports.AccessDeniedException = AccessDeniedException;
class PermissionNotFoundException extends AccessControlException {
    permissionId;
    constructor(message, permissionId, userAddress, resourceId, originalError) {
        super(message, userAddress, resourceId, originalError);
        this.permissionId = permissionId;
        this.name = 'PermissionNotFoundException';
    }
}
exports.PermissionNotFoundException = PermissionNotFoundException;
class PermissionExpiredException extends AccessControlException {
    permissionId;
    expiredAt;
    constructor(message, permissionId, expiredAt, userAddress, resourceId, originalError) {
        super(message, userAddress, resourceId, originalError);
        this.permissionId = permissionId;
        this.expiredAt = expiredAt;
        this.name = 'PermissionExpiredException';
    }
}
exports.PermissionExpiredException = PermissionExpiredException;
class UnauthorizedRevocationException extends AccessControlException {
    permissionId;
    attemptedBy;
    ownedBy;
    constructor(message, permissionId, attemptedBy, ownedBy, originalError) {
        super(message, attemptedBy, undefined, originalError);
        this.permissionId = permissionId;
        this.attemptedBy = attemptedBy;
        this.ownedBy = ownedBy;
        this.name = 'UnauthorizedRevocationException';
    }
}
exports.UnauthorizedRevocationException = UnauthorizedRevocationException;
class CrossDAppAccessException extends AccessControlException {
    dAppId;
    requestId;
    constructor(message, dAppId, requestId, userAddress, originalError) {
        super(message, userAddress, undefined, originalError);
        this.dAppId = dAppId;
        this.requestId = requestId;
        this.name = 'CrossDAppAccessException';
    }
}
exports.CrossDAppAccessException = CrossDAppAccessException;
class BulkOperationException extends AccessControlException {
    successfulOperations;
    failedOperations;
    totalOperations;
    failures;
    constructor(message, successfulOperations, failedOperations, totalOperations, failures, userAddress, originalError) {
        super(message, userAddress, undefined, originalError);
        this.successfulOperations = successfulOperations;
        this.failedOperations = failedOperations;
        this.totalOperations = totalOperations;
        this.failures = failures;
        this.name = 'BulkOperationException';
    }
}
exports.BulkOperationException = BulkOperationException;
class DelegatedDecryptionException extends AccessControlException {
    ownerAddress;
    delegatedAddress;
    permissionId;
    constructor(message, ownerAddress, delegatedAddress, permissionId, originalError) {
        super(message, delegatedAddress, undefined, originalError);
        this.ownerAddress = ownerAddress;
        this.delegatedAddress = delegatedAddress;
        this.permissionId = permissionId;
        this.name = 'DelegatedDecryptionException';
    }
}
exports.DelegatedDecryptionException = DelegatedDecryptionException;
class ResourceOwnershipException extends AccessControlException {
    claimedOwner;
    actualOwner;
    constructor(message, claimedOwner, actualOwner, resourceId, originalError) {
        super(message, claimedOwner, resourceId, originalError);
        this.claimedOwner = claimedOwner;
        this.actualOwner = actualOwner;
        this.name = 'ResourceOwnershipException';
    }
}
exports.ResourceOwnershipException = ResourceOwnershipException;
//# sourceMappingURL=access-control.exceptions.js.map
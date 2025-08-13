export declare class AccessControlException extends Error {
    readonly userAddress?: string | undefined;
    readonly resourceId?: string | undefined;
    readonly originalError?: Error | undefined;
    constructor(message: string, userAddress?: string | undefined, resourceId?: string | undefined, originalError?: Error | undefined);
}
export declare class AccessDeniedException extends AccessControlException {
    readonly requiredAccessLevel?: string | undefined;
    readonly currentAccessLevel?: string | undefined;
    constructor(message: string, userAddress?: string, resourceId?: string, requiredAccessLevel?: string | undefined, currentAccessLevel?: string | undefined, originalError?: Error);
}
export declare class PermissionNotFoundException extends AccessControlException {
    readonly permissionId?: string | undefined;
    constructor(message: string, permissionId?: string | undefined, userAddress?: string, resourceId?: string, originalError?: Error);
}
export declare class PermissionExpiredException extends AccessControlException {
    readonly permissionId?: string | undefined;
    readonly expiredAt?: number | undefined;
    constructor(message: string, permissionId?: string | undefined, expiredAt?: number | undefined, userAddress?: string, resourceId?: string, originalError?: Error);
}
export declare class UnauthorizedRevocationException extends AccessControlException {
    readonly permissionId?: string | undefined;
    readonly attemptedBy?: string | undefined;
    readonly ownedBy?: string | undefined;
    constructor(message: string, permissionId?: string | undefined, attemptedBy?: string | undefined, ownedBy?: string | undefined, originalError?: Error);
}
export declare class CrossDAppAccessException extends AccessControlException {
    readonly dAppId?: string | undefined;
    readonly requestId?: string | undefined;
    constructor(message: string, dAppId?: string | undefined, requestId?: string | undefined, userAddress?: string, originalError?: Error);
}
export declare class BulkOperationException extends AccessControlException {
    readonly successfulOperations: number;
    readonly failedOperations: number;
    readonly totalOperations: number;
    readonly failures: Array<{
        id: string;
        error: string;
    }>;
    constructor(message: string, successfulOperations: number, failedOperations: number, totalOperations: number, failures: Array<{
        id: string;
        error: string;
    }>, userAddress?: string, originalError?: Error);
}
export declare class DelegatedDecryptionException extends AccessControlException {
    readonly ownerAddress?: string | undefined;
    readonly delegatedAddress?: string | undefined;
    readonly permissionId?: string | undefined;
    constructor(message: string, ownerAddress?: string | undefined, delegatedAddress?: string | undefined, permissionId?: string | undefined, originalError?: Error);
}
export declare class ResourceOwnershipException extends AccessControlException {
    readonly claimedOwner?: string | undefined;
    readonly actualOwner?: string | undefined;
    constructor(message: string, claimedOwner?: string | undefined, actualOwner?: string | undefined, resourceId?: string, originalError?: Error);
}

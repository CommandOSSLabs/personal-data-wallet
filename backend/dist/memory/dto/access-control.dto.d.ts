export declare enum AccessLevel {
    READ = "read",
    WRITE = "write",
    ADMIN = "admin"
}
export declare class GrantAccessDto {
    delegatedAddress: string;
    resourceId: string;
    accessLevel?: AccessLevel;
    expiresAt?: number;
    metadata?: Record<string, any>;
}
export declare class RevokeAccessDto {
    permissionId: string;
}
export declare class CheckAccessDto {
    delegatedAddress: string;
    resourceId: string;
    ownerAddress: string;
    requiredAccessLevel?: AccessLevel;
}
export declare class DelegatedDecryptionDto {
    encryptedData: string;
    ownerIdentity: string;
    delegatedIdentity: string;
    permissionId?: string;
    sessionKey?: string;
}
export declare class BatchDecryptionDto {
    encryptedDataList: string[];
    ownerIdentities: string[];
    requestingUserAddress: string;
    parallel?: boolean;
    failFast?: boolean;
}
export declare class AccessPermissionDto {
    id: string;
    ownerAddress: string;
    delegatedAddress: string;
    resourceId: string;
    accessLevel: AccessLevel;
    expiresAt?: number;
    createdAt: number;
    metadata?: Record<string, any>;
}
export declare class UserPermissionsResponseDto {
    owned: AccessPermissionDto[];
    delegated: AccessPermissionDto[];
}
export declare class DelegatedMemoryQueryDto {
    query: string;
    ownerAddress: string;
    requestingUserAddress: string;
    category?: string;
    k?: number;
}

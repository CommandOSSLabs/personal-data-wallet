export declare class GrantAppPermissionDto {
    userAddress: string;
    appAddress: string;
    dataIds: string[];
    expiresAt?: number;
    userSignature?: string;
}
export declare class RevokeAppPermissionDto {
    userAddress: string;
    permissionId: string;
    userSignature?: string;
}
export declare class EncryptForAppDto {
    content: string;
    userAddress: string;
    appAddress: string;
    category?: string;
}
export declare class DecryptAsAppDto {
    encryptedContent: string;
    userAddress: string;
    appAddress: string;
    appSignature: string;
}

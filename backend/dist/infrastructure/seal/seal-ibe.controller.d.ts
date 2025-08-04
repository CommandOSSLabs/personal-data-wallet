import { SealIBEService } from './seal-ibe.service';
import { GrantAppPermissionDto, RevokeAppPermissionDto, EncryptForAppDto, DecryptAsAppDto } from './dto/grant-permission.dto';
export declare class SealIBEController {
    private readonly sealIBEService;
    constructor(sealIBEService: SealIBEService);
    grantPermission(dto: GrantAppPermissionDto): Promise<{
        permissionId: string;
        appAddress: string;
        dataIds: string[];
        expiresAt?: number;
    }>;
    revokePermission(permissionId: string, dto: RevokeAppPermissionDto): Promise<{
        success: boolean;
    }>;
    listPermissions(userAddress: string): Promise<{
        permissionId: string;
        appAddress: string;
        appName?: string;
        dataIds: string[];
        grantedAt: Date;
        expiresAt?: Date;
    }[]>;
    encryptForApp(dto: EncryptForAppDto): Promise<{
        success: boolean;
        encrypted: string;
        backupKey: string;
        appAddress: string;
        identityString: string;
        category: string | undefined;
    }>;
    decryptAsApp(dto: DecryptAsAppDto): Promise<{
        success: boolean;
        content: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        content?: undefined;
    }>;
    encryptWithTimelock(body: {
        content: string;
        userAddress: string;
        expiresAt: number;
    }): Promise<{
        success: boolean;
        encrypted: string;
        backupKey: string;
        expiresAt: number;
        identityString: string;
    }>;
    getAppSessionMessage(dto: {
        appAddress: string;
    }): Promise<{
        message: string;
    }>;
}

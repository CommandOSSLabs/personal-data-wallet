import { ConfigService } from '@nestjs/config';
import { IdentityType, IdentityOptions } from './identity-types';
import { SealService } from './seal.service';
import { SuiService } from '../sui/sui.service';
import { SessionStore } from './session-store';
export declare class SealIBEService extends SealService {
    private readonly suiService;
    constructor(configService: ConfigService, sessionStore: SessionStore, suiService: SuiService);
    encryptForIdentity(content: string, identityOptions: IdentityOptions): Promise<{
        encrypted: string;
        backupKey: string;
        identityType: IdentityType;
        identityString: string;
    }>;
    encryptForApp(content: string, userAddress: string, appAddress: string): Promise<{
        encrypted: string;
        backupKey: string;
        appAddress: string;
        identityString: string;
    }>;
    encryptWithTimelock(content: string, userAddress: string, expiresAt: number): Promise<{
        encrypted: string;
        backupKey: string;
        expiresAt: number;
        identityString: string;
    }>;
    decryptWithIdentity(encryptedContent: string, identityOptions: IdentityOptions, signature?: string): Promise<string>;
    grantAppPermission(userAddress: string, appAddress: string, dataIds: string[], expiresAt?: number): Promise<{
        permissionId: string;
        appAddress: string;
        dataIds: string[];
        expiresAt?: number;
    }>;
    revokeAppPermission(userAddress: string, permissionId: string): Promise<boolean>;
    listAppPermissions(userAddress: string): Promise<Array<{
        permissionId: string;
        appAddress: string;
        appName?: string;
        dataIds: string[];
        grantedAt: Date;
        expiresAt?: Date;
    }>>;
}

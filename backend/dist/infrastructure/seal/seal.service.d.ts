import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { SessionStore } from './session-store';
export declare class SealService {
    private configService;
    protected sessionStore: SessionStore;
    protected sealClient: SealClient;
    protected suiClient: SuiClient;
    protected logger: Logger;
    packageId: string;
    protected sealCorePackageId: string;
    moduleName: string;
    threshold: number;
    network: 'mainnet' | 'testnet' | 'devnet';
    protected sessionKeys: Map<string, SessionKey>;
    protected isOpenMode: boolean;
    constructor(configService: ConfigService, sessionStore: SessionStore);
    encrypt(content: string, userAddress: string): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decrypt(encryptedContent: string, userAddress: string, signature?: string): Promise<string>;
    decryptWithBackupKey(encryptedContent: string, backupKey: string): Promise<string>;
    protected getOrCreateSessionKey(userAddress: string, signature?: string, packageId?: string): Promise<SessionKey>;
    getSessionKeyMessage(userAddress: string): Promise<Uint8Array>;
    protected isSessionKeyExpired(sessionKey: SessionKey): boolean;
    isInOpenMode(): boolean;
    fetchMultipleKeys(ids: string[], userAddress: string, signature?: string): Promise<Map<string, Uint8Array>>;
    createAllowlist(name: string, userAddress: string): Promise<string>;
    encryptForAllowlist(content: string, allowlistId: string, userAddress: string): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decryptFromAllowlist(encryptedContent: string, allowlistId: string, userAddress: string, signature?: string): Promise<string>;
}

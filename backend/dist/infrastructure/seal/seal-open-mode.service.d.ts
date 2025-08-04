import { ConfigService } from '@nestjs/config';
import { SessionStore } from './session-store';
export declare class SealOpenModeService {
    private configService;
    private sessionStore;
    private sealClient;
    private suiClient;
    private logger;
    private network;
    private threshold;
    private sessionKeys;
    private sessionTtlMin;
    constructor(configService: ConfigService, sessionStore: SessionStore);
    encrypt(content: string, packageId: string, identity: string): Promise<{
        encrypted: string;
        backupKey: string;
        metadata: {
            packageId: string;
            identity: string;
            threshold: number;
            network: string;
        };
    }>;
    decrypt(encryptedContent: string, packageId: string, moduleName: string, identity: string, userAddress: string, signature?: string): Promise<string>;
    getSessionKeyMessage(packageId: string, userAddress: string): Promise<Uint8Array>;
    private getOrCreateSessionKey;
    batchEncrypt(items: Array<{
        id: string;
        content: string;
        packageId: string;
        identity: string;
    }>): Promise<Map<string, {
        encrypted: string;
        backupKey: string;
        metadata: any;
    }>>;
    testOpenMode(packageId: string, moduleName: string, userAddress: string, signature: string): Promise<{
        success: boolean;
        details: any;
        error?: string;
    }>;
}

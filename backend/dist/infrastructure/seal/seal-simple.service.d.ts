import { ConfigService } from '@nestjs/config';
import { SessionStore } from './session-store';
export declare class SealSimpleService {
    private configService;
    private sessionStore;
    private sealClient;
    private suiClient;
    private logger;
    private sealPackageId;
    private threshold;
    private network;
    private sessionKeys;
    private sessionTtlMin;
    constructor(configService: ConfigService, sessionStore: SessionStore);
    encryptForUser(content: string, userAddress: string): Promise<{
        encrypted: string;
        backupKey: string;
        identityUsed: string;
    }>;
    decryptForUser(encryptedContent: string, userAddress: string, signature: string): Promise<string>;
    getSessionKeyMessage(userAddress: string): Promise<Uint8Array>;
    private getOrCreateSessionKey;
    testCompleteFlow(userAddress: string, signature: string): Promise<{
        success: boolean;
        encrypted?: string;
        decrypted?: string;
        error?: string;
    }>;
}

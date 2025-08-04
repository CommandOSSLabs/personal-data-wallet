import { ConfigService } from '@nestjs/config';
import { SessionStore } from './session-store';
export declare class SealNativeService {
    private configService;
    private sessionStore;
    private sealClient;
    private suiClient;
    private logger;
    private sealPackageId;
    private threshold;
    private network;
    private sessionKeys;
    constructor(configService: ConfigService, sessionStore: SessionStore);
    encrypt(content: string, identity: string): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decrypt(encryptedContent: string, identity: string, address: string, signature?: string): Promise<string>;
    getSessionKeyMessage(address: string): Promise<Uint8Array>;
    private getOrCreateSessionKey;
}

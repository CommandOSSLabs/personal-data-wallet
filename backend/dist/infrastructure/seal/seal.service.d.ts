import { ConfigService } from '@nestjs/config';
export declare class SealService {
    private configService;
    private masterKey;
    private logger;
    constructor(configService: ConfigService);
    encrypt(content: string, userAddress: string): Promise<string>;
    decrypt(encryptedContent: string, userAddress: string): Promise<string>;
    canDecrypt(userAddress: string): Promise<boolean>;
    generateDecryptionKey(userAddress: string): Promise<string>;
    private deriveUserKey;
}

import { SealSimpleService } from './seal-simple.service';
export declare class SealTestController {
    private readonly sealSimpleService;
    constructor(sealSimpleService: SealSimpleService);
    getSessionMessage(address: string): Promise<{
        message: string;
        messageUtf8: string;
    }>;
    encrypt(body: {
        content: string;
        userAddress: string;
    }): Promise<{
        encrypted: string;
        backupKey: string;
        identityUsed: string;
    }>;
    decrypt(body: {
        encrypted: string;
        userAddress: string;
        signature: string;
    }): Promise<{
        success: boolean;
        decrypted: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        decrypted?: undefined;
    }>;
    testFlow(body: {
        userAddress: string;
        signature: string;
    }): Promise<{
        success: boolean;
        encrypted?: string;
        decrypted?: string;
        error?: string;
    }>;
}

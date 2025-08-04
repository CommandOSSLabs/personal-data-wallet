import { SealOpenModeService } from './seal-open-mode.service';
export declare class SealOpenModeController {
    private readonly sealOpenModeService;
    constructor(sealOpenModeService: SealOpenModeService);
    getSessionMessage(dto: {
        packageId: string;
        userAddress: string;
    }): Promise<{
        message: string;
    }>;
    encrypt(dto: {
        content: string;
        packageId: string;
        identity: string;
    }): Promise<{
        encrypted: string;
        backupKey: string;
        metadata: any;
    }>;
    decrypt(dto: {
        encryptedContent: string;
        packageId: string;
        moduleName: string;
        identity: string;
        userAddress: string;
        signature?: string;
    }): Promise<{
        decrypted: string;
    }>;
    batchEncrypt(dto: {
        items: Array<{
            id: string;
            content: string;
            packageId: string;
            identity: string;
        }>;
    }): Promise<{
        results: Array<{
            id: string;
            encrypted?: string;
            backupKey?: string;
            metadata?: any;
            error?: string;
        }>;
    }>;
    testOpenMode(dto: {
        packageId: string;
        moduleName: string;
        userAddress: string;
        signature: string;
    }): Promise<{
        success: boolean;
        details: any;
        error?: string;
    }>;
    getStatus(): {
        mode: string;
        network: string;
        features: string[];
    };
}

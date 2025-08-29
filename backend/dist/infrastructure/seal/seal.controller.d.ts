import { SealService } from './seal.service';
interface SessionMessageDto {
    userAddress: string;
}
export declare class SealController {
    private readonly sealService;
    constructor(sealService: SealService);
    getSessionMessage(dto: SessionMessageDto): Promise<{
        message: string;
    }>;
    encryptContent(dto: {
        content: string;
        userAddress: string;
    }): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decryptContent(dto: {
        encryptedContent: string;
        userAddress: string;
        signature: string;
    }): Promise<{
        content: string;
    }>;
    createAllowlist(dto: {
        name: string;
        userAddress: string;
    }): Promise<{
        message: string;
    }>;
    encryptForAllowlist(dto: {
        content: string;
        allowlistId: string;
        userAddress: string;
    }): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decryptFromAllowlist(dto: {
        encryptedContent: string;
        allowlistId: string;
        userAddress: string;
        signature: string;
    }): Promise<{
        content: string;
    }>;
    getConfig(): {
        packageId: string;
        moduleName: string;
        network: string;
        threshold: number;
        mode: string;
    };
}
export {};

import { ConfigService } from '@nestjs/config';
import { WalrusService } from './walrus.service';
export declare class CachedWalrusService {
    private readonly walrusService;
    private readonly configService;
    private logger;
    private contentCache;
    constructor(walrusService: WalrusService, configService: ConfigService);
    getAdminAddress(): string;
    uploadContent(content: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    retrieveContent(blobId: string): Promise<string>;
    getFileTags(blobId: string): Promise<Record<string, string>>;
    verifyUserAccess(blobId: string, userAddress: string): Promise<boolean>;
    uploadFile(buffer: Buffer, filename: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    downloadFile(blobId: string): Promise<Buffer>;
    deleteContent(blobId: string, userAddress: string): Promise<boolean>;
    getCacheStats(): {
        keys: number;
        hits: number;
        misses: number;
        ksize: number;
        vsize: number;
    };
    clearCache(): void;
}

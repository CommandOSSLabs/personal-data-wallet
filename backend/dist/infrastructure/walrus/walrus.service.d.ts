import { ConfigService } from '@nestjs/config';
export declare class WalrusService {
    private configService;
    private walrusClient;
    private suiClient;
    private adminKeypair;
    private logger;
    private adminAddress;
    private readonly DEFAULT_STORAGE_EPOCHS;
    constructor(configService: ConfigService);
    private initializeWalrusClient;
    private initializeAdminKeypair;
    getAdminAddress(): string;
    uploadContent(content: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    retrieveContent(blobId: string): Promise<string>;
    getFileTags(blobId: string): Promise<Record<string, string>>;
    verifyUserAccess(blobId: string, userAddress: string): Promise<boolean>;
    uploadFile(buffer: Buffer, filename: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    downloadFile(blobId: string): Promise<Buffer>;
    deleteContent(blobId: string, userAddress: string): Promise<boolean>;
    private uploadFilesToWalrus;
}

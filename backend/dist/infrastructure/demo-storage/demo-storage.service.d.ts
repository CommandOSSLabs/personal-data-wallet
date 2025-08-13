export declare class DemoStorageService {
    private logger;
    private readonly STORAGE_DIR;
    constructor();
    private initializeStorage;
    private generateBlobId;
    uploadContent(content: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    uploadFile(buffer: Buffer, filename: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    downloadFile(blobId: string): Promise<Buffer>;
    verifyUserAccess(blobId: string, userAddress: string): Promise<boolean>;
    getAdminAddress(): string;
    exists(blobId: string): Promise<boolean>;
    getStats(): Promise<{
        totalFiles: number;
        storageDir: string;
    }>;
}

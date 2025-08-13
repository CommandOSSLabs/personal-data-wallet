export interface StoredFileMetadata {
    blobId: string;
    filename: string;
    tags: Record<string, string>;
    size: number;
    createdAt: string;
    storageType: 'local';
}
export declare class LocalStorageService {
    private logger;
    private readonly STORAGE_DIR;
    constructor();
    private initializeStorage;
    private generateBlobId;
    storeContent(content: string, filename: string, tags?: Record<string, string>): Promise<string>;
    storeFile(buffer: Buffer, filename: string, tags?: Record<string, string>): Promise<string>;
    retrieveFile(blobId: string): Promise<Buffer>;
    retrieveContent(blobId: string): Promise<string>;
    getMetadata(blobId: string): Promise<StoredFileMetadata>;
    exists(blobId: string): Promise<boolean>;
    deleteFile(blobId: string): Promise<void>;
    listFiles(): Promise<StoredFileMetadata[]>;
    getStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        storageDir: string;
    }>;
    cleanup(olderThanDays?: number): Promise<number>;
}

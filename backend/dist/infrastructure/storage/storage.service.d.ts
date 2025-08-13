import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { WalrusService } from '../walrus/walrus.service';
export interface StorageResult {
    blobId: string;
    storageType: 'walrus' | 'local';
    success: boolean;
    message?: string;
}
export declare class StorageService {
    private localStorageService;
    private walrusService;
    private configService;
    private logger;
    private walrusAvailable;
    private lastWalrusCheck;
    private readonly WALRUS_CHECK_INTERVAL;
    constructor(localStorageService: LocalStorageService, walrusService: WalrusService, configService: ConfigService);
    private isWalrusAvailable;
    uploadContent(content: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    storeContent(content: string, filename: string, tags?: Record<string, string>): Promise<StorageResult>;
    storeFile(buffer: Buffer, filename: string, tags?: Record<string, string>): Promise<StorageResult>;
    retrieveFile(blobId: string): Promise<Buffer>;
    retrieveContent(blobId: string): Promise<string>;
    exists(blobId: string): Promise<boolean>;
    getStats(): Promise<{
        local: any;
        walrus: {
            available: boolean;
            lastCheck: Date;
        };
    }>;
    forceLocalStorage(): void;
    getAdminAddress(): string;
}

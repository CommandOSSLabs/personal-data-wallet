import { StorageService } from '../infrastructure/storage/storage.service';
import { LocalStorageService } from '../infrastructure/local-storage/local-storage.service';
import { WalrusService } from '../infrastructure/walrus/walrus.service';
export declare class StorageController {
    private readonly storageService;
    private readonly localStorageService;
    private readonly walrusService;
    constructor(storageService: StorageService, localStorageService: LocalStorageService, walrusService: WalrusService);
    retrieveContent(blobId: string): Promise<{
        content: string;
        success: boolean;
    }>;
    checkExists(blobId: string): Promise<{
        exists: boolean;
    }>;
    getStorageStats(): Promise<{
        local: any;
        walrus: {
            available: boolean;
            lastCheck: Date;
        };
    }>;
}

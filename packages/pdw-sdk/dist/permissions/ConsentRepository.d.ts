import { ConsentRequestRecord, ConsentStatus } from '../types/wallet.js';
export interface ConsentRepository {
    save(request: ConsentRequestRecord): Promise<void>;
    updateStatus(requestId: string, status: ConsentStatus, updatedAt: number): Promise<void>;
    getById(requestId: string): Promise<ConsentRequestRecord | null>;
    listByTarget(targetWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
    listByRequester(requesterWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
    delete(requestId: string): Promise<void>;
}
export declare class FileSystemConsentRepository implements ConsentRepository {
    private filePath;
    private initialized;
    constructor(options?: {
        filePath?: string;
    });
    save(request: ConsentRequestRecord): Promise<void>;
    updateStatus(requestId: string, status: ConsentStatus, updatedAt: number): Promise<void>;
    getById(requestId: string): Promise<ConsentRequestRecord | null>;
    listByTarget(targetWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
    listByRequester(requesterWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
    delete(requestId: string): Promise<void>;
    private readAll;
    private writeAll;
    private ensureInitialized;
}
export declare class InMemoryConsentRepository implements ConsentRepository {
    private store;
    save(request: ConsentRequestRecord): Promise<void>;
    updateStatus(requestId: string, status: ConsentStatus, updatedAt: number): Promise<void>;
    getById(requestId: string): Promise<ConsentRequestRecord | null>;
    listByTarget(targetWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
    listByRequester(requesterWallet: string, status?: ConsentStatus): Promise<ConsentRequestRecord[]>;
    delete(requestId: string): Promise<void>;
}
//# sourceMappingURL=ConsentRepository.d.ts.map
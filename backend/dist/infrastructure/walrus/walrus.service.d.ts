import { ConfigService } from '@nestjs/config';
import { EmbeddingService } from '../../memory/embedding/embedding.service';
import { SealService } from '../seal/seal.service';
export interface MemoryMetadata {
    contentType: string;
    contentSize: number;
    contentHash: string;
    category: string;
    topic: string;
    importance: number;
    embeddingBlobId?: string;
    embeddingDimension: number;
    createdTimestamp: number;
    updatedTimestamp?: number;
    customMetadata?: Record<string, string>;
}
export interface EnhancedUploadResult {
    blobId: string;
    metadata: MemoryMetadata;
    embeddingBlobId?: string;
}
export declare class WalrusService {
    private configService;
    private embeddingService?;
    private sealService?;
    private walrusClient;
    private suiClient;
    private adminKeypair;
    private logger;
    private adminAddress;
    private readonly DEFAULT_STORAGE_EPOCHS;
    private readonly LOCAL_STORAGE_DIR;
    private walrusAvailable;
    private lastWalrusCheck;
    private readonly WALRUS_CHECK_INTERVAL;
    constructor(configService: ConfigService, embeddingService?: EmbeddingService | undefined, sealService?: SealService | undefined);
    private initializeWalrusClient;
    private initializeAdminKeypair;
    private initializeLocalStorage;
    private isWalrusAvailable;
    private generateLocalBlobId;
    private storeFileLocally;
    private retrieveFileLocally;
    getAdminAddress(): string;
    private generateContentHash;
    createMetadataWithEmbedding(content: string, category: string, topic?: string, importance?: number, customMetadata?: Record<string, string>): Promise<MemoryMetadata>;
    private storeEmbeddingLocally;
    uploadEncryptedContent(content: string, ownerAddress: string, category: string, topic?: string, importance?: number, epochs?: number, additionalTags?: Record<string, string>): Promise<EnhancedUploadResult & {
        isEncrypted: boolean;
        backupKey?: string;
    }>;
    retrieveEncryptedContent(blobId: string, userAddress: string, sessionKey?: any, signedTxBytes?: Uint8Array): Promise<string>;
    getEncryptionInfo(blobId: string): Promise<{
        isEncrypted: boolean;
        encryptionType?: string;
        requiresAuth: boolean;
    }>;
    uploadContentWithMetadata(content: string, ownerAddress: string, category: string, topic?: string, importance?: number, epochs?: number, additionalTags?: Record<string, string>): Promise<EnhancedUploadResult>;
    uploadContent(content: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    retrieveContent(blobId: string): Promise<string>;
    retrieveMetadataEmbedding(embeddingBlobId: string): Promise<{
        vector: number[];
        dimension: number;
        category: string;
        topic: string;
        contentHash: string;
        timestamp: number;
    } | null>;
    getEnhancedMetadata(blobId: string): Promise<MemoryMetadata | null>;
    searchByMetadataEmbedding(queryText: string, userAddress: string, threshold?: number, limit?: number): Promise<Array<{
        blobId: string;
        metadata: MemoryMetadata;
        similarity: number;
    }>>;
    getFileTags(blobId: string): Promise<Record<string, string>>;
    verifyUserAccess(blobId: string, userAddress: string): Promise<boolean>;
    uploadFile(buffer: Buffer, filename: string, ownerAddress: string, epochs?: number, additionalTags?: Record<string, string>): Promise<string>;
    downloadFile(blobId: string): Promise<Buffer>;
    deleteContent(blobId: string, userAddress: string): Promise<boolean>;
    private uploadFilesToWalrus;
}

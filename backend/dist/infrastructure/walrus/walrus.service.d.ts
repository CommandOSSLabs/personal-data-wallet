import { ConfigService } from '@nestjs/config';
export declare class WalrusService {
    private configService;
    private apiUrl;
    private apiKey;
    private logger;
    constructor(configService: ConfigService);
    uploadContent(content: string): Promise<string>;
    retrieveContent(blobId: string): Promise<string>;
    deleteContent(blobId: string): Promise<boolean>;
    uploadFile(buffer: Buffer, filename: string): Promise<string>;
    downloadFile(blobId: string): Promise<Buffer>;
}

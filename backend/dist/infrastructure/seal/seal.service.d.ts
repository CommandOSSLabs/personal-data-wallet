import { ConfigService } from '@nestjs/config';
import { SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { SuiService } from '../sui/sui.service';
export declare class SealService {
    private configService;
    private suiService;
    private sealClient;
    private logger;
    private packageId;
    private moduleName;
    constructor(configService: ConfigService, suiService: SuiService);
    encrypt(content: string, userAddress: string, metadata?: Record<string, string>): Promise<{
        encryptedData: string;
        backupKey: string;
    }>;
    buildAccessTransaction(identity: string, accessType?: 'read' | 'write'): Promise<Transaction>;
    decrypt(encryptedContent: string, userAddress: string, sessionKey: SessionKey, signedTxBytes: Uint8Array): Promise<string>;
    createSessionKey(userAddress: string): Promise<SessionKey>;
    exportSessionKey(sessionKey: SessionKey): Promise<string>;
    importSessionKey(exportedKey: string): Promise<SessionKey>;
    grantAccess(ownerAddress: string, recipientAddress: string, contentId: string, accessLevel: 'read' | 'write'): Promise<Transaction>;
    revokeAccess(ownerAddress: string, recipientAddress: string, contentId: string): Promise<Transaction>;
    hasAccess(userAddress: string, contentId: string, ownerAddress: string): Promise<boolean>;
    private buildCheckAccessTransaction;
}

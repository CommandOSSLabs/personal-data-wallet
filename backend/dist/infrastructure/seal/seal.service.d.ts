import { ConfigService } from '@nestjs/config';
import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SessionKeyService } from './session-key.service';
export declare class SealService {
<<<<<<< HEAD
    private readonly configService;
    private readonly sessionKeyService;
    private readonly sealClient;
    private readonly suiClient;
    private readonly logger;
    private readonly packageId;
    private readonly threshold;
    constructor(configService: ConfigService, sessionKeyService: SessionKeyService);
    encrypt(data: Uint8Array, policyObjectId: string, nonce?: string): Promise<{
        encrypted: Uint8Array;
        identityId: string;
    }>;
    decrypt(encryptedData: Uint8Array, moveCallConstructor: (tx: Transaction, id: string) => void, userAddress: string): Promise<Uint8Array>;
    createSelfAccessTransaction(userAddress: string): (tx: Transaction, id: string) => void;
    createAppAccessTransaction(allowlistId: string): (tx: Transaction, id: string) => void;
    createTimelockAccessTransaction(timelockId: string): (tx: Transaction, id: string) => void;
    createRoleAccessTransaction(roleRegistryId: string, userAddress: string, role: string): (tx: Transaction, id: string) => void;
    getSuiClient(): SuiClient;
    getSealClient(): SealClient;
=======
    private configService;
    protected sessionStore: SessionStore;
    protected sealClient: SealClient;
    protected suiClient: SuiClient;
    protected logger: Logger;
    packageId: string;
    protected sealCorePackageId: string;
    moduleName: string;
    threshold: number;
    network: 'mainnet' | 'testnet' | 'devnet';
    protected sessionKeys: Map<string, SessionKey>;
    protected isOpenMode: boolean;
    constructor(configService: ConfigService, sessionStore: SessionStore);
    encrypt(content: string, userAddress: string): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decrypt(encryptedContent: string, userAddress: string, signature?: string): Promise<string>;
    decryptWithBackupKey(encryptedContent: string, backupKey: string): Promise<string>;
    protected getOrCreateSessionKey(userAddress: string, signature?: string, packageId?: string): Promise<SessionKey>;
    getSessionKeyMessage(userAddress: string): Promise<Uint8Array>;
    protected isSessionKeyExpired(sessionKey: SessionKey): boolean;
    isInOpenMode(): boolean;
    fetchMultipleKeys(ids: string[], userAddress: string, signature?: string): Promise<Map<string, Uint8Array>>;
    createAllowlist(name: string, userAddress: string): Promise<string>;
    encryptForAllowlist(content: string, allowlistId: string, userAddress: string): Promise<{
        encrypted: string;
        backupKey: string;
    }>;
    decryptFromAllowlist(encryptedContent: string, allowlistId: string, userAddress: string, signature?: string): Promise<string>;
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
}

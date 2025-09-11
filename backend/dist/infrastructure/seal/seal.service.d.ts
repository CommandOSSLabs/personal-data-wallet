import { ConfigService } from '@nestjs/config';
import { SealClient } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SessionKeyService } from './session-key.service';
export declare class SealService {
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
}

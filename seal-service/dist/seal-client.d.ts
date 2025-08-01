/**
 * Seal IBE client wrapper
 */
import { SessionKey } from '@mysten/seal';
import { KeyRequest } from './types.js';
export declare class SealClientWrapper {
    private sealClient;
    private suiClient;
    private config;
    constructor();
    /**
     * Encrypt data using real Seal IBE encryption
     */
    encrypt(data: Buffer, identity: string, packageId?: string): Promise<{
        encryptedObject: string;
        key: string;
    }>;
    /**
     * Create session key for decryption using real Seal SDK
     */
    createSessionKey(userAddress: string, packageId: string, signature?: string): Promise<SessionKey>;
    /**
     * Decrypt data using real Seal SDK
     */
    decrypt(encryptedData: Uint8Array, sessionKey: SessionKey, txBytes: Uint8Array): Promise<Buffer>;
    /**
     * Create a simple seal_approve transaction for testing
     */
    createSealApproveTransaction(packageId: string, identity: string): Promise<Uint8Array>;
    /**
     * Validate access policy against Sui blockchain
     */
    validateAccessPolicy(keyRequest: KeyRequest): Promise<boolean>;
    /**
     * Get service information
     */
    getServiceInfo(): {
        keyServers: number;
        threshold: number;
        verifyKeyServers: boolean;
        network: string;
        status: string;
    };
    /**
     * Health check
     */
    healthCheck(): Promise<boolean>;
}

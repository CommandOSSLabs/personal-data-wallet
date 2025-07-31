/**
 * Seal IBE client wrapper
 */
import { KeyRequest } from './types.js';
export declare class SealClientWrapper {
    private sealClient;
    private suiClient;
    private config;
    constructor();
    /**
     * Encrypt data using Seal IBE
     */
    encrypt(data: Buffer, identity: string): Promise<Buffer>;
    /**
     * Create session key for decryption
     */
    createSessionKey(identity: string, suiPtb: any, signature: string): Promise<any>;
    /**
     * Decrypt data using session key
     */
    decrypt(encryptedData: Buffer, sessionKey: any): Promise<Buffer>;
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

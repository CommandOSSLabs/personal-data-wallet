/**
 * Encryption Service
 *
 * Handles SEAL identity-based encryption, threshold cryptography,
 * access control policies, and session key management.
 */
import type { ClientWithCoreApi, PDWConfig, EncryptionResult, DecryptionOptions, AccessControlOptions, Thunk } from '../types';
export declare class EncryptionService {
    private client;
    private config;
    constructor(client: ClientWithCoreApi, config: PDWConfig);
    /**
     * Encrypt data using SEAL identity-based encryption
     */
    encrypt(data: Uint8Array, userAddress: string): Promise<EncryptionResult>;
    /**
     * Decrypt data using SEAL with session keys
     */
    decrypt(options: DecryptionOptions): Promise<Uint8Array>;
    get tx(): {
        /**
         * Grant access to encrypted memory
         */
        grantAccess: (options: AccessControlOptions) => Promise<never>;
        /**
         * Revoke access to encrypted memory
         */
        revokeAccess: (options: AccessControlOptions) => Promise<never>;
    };
    get call(): {
        /**
         * Move call for granting access
         */
        grantAccess: (options: AccessControlOptions) => Thunk;
        /**
         * Move call for revoking access
         */
        revokeAccess: (options: AccessControlOptions) => Thunk;
    };
    get view(): {
        /**
         * Get access permissions for memories
         */
        getAccessPermissions: (userAddress: string, memoryId?: string) => Promise<never>;
    };
}
//# sourceMappingURL=EncryptionService.d.ts.map
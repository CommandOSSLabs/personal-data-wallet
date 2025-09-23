/**
 * EncryptionService - SEAL-based encryption and access control
 * 
 * Provides identity-based encryption using Mysten's SEAL SDK with decentralized
 * key management and onchain access control policies.
 */

import { SealClient, SessionKey } from '@mysten/seal';
import type { SealCompatibleClient, KeyServerConfig, EncryptOptions as SealEncryptOptions, DecryptOptions as SealDecryptOptions } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, toHex } from '@mysten/sui/utils';
import type {
  ClientWithCoreApi,
  PDWConfig,
  AccessPermission,
  AccessControlOptions,
  Thunk,
  SealEncryptionResult,
  SealDecryptionOptions
} from '../types';

export interface AccessGrantOptions {
  ownerAddress: string;
  recipientAddress: string;
  contentId: string;
  accessLevel: 'read' | 'write';
  expiresIn?: number; // milliseconds from now
}

export interface AccessRevokeOptions {
  ownerAddress: string;
  recipientAddress: string;
  contentId: string;
}

export class EncryptionService {
  private sealClient: SealClient | null = null;
  private suiClient: any;
  private packageId: string;
  private sessionKeyCache = new Map<string, SessionKey>();

  constructor(
    private client: ClientWithCoreApi,
    private config: PDWConfig
  ) {
    this.suiClient = (client as any).client || client;
    this.packageId = config.packageId || '';
    this.initializeSealClient();
  }

  /**
   * Initialize SEAL client with key server configurations
   */
  private initializeSealClient(): void {
    try {
      const encryptionConfig = this.config.encryptionConfig;
      
      if (!encryptionConfig?.enabled) {
        console.warn('Encryption is disabled in configuration');
        return;
      }

      // Default testnet key servers (replace with actual server object IDs)
      const defaultKeyServers = [
        '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
        '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
        '0xa1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456'
      ];

      const keyServerIds = encryptionConfig.keyServers || defaultKeyServers;
      
      this.sealClient = new SealClient({
        suiClient: this.suiClient,
        serverConfigs: keyServerIds.map(id => ({
          objectId: id.trim(),
          weight: 1,
        })),
        verifyKeyServers: process.env.NODE_ENV === 'production',
      });

      console.log('SEAL client initialized successfully');
    } catch (error) {
      console.warn(`SEAL client initialization failed: ${error}`);
      this.sealClient = null;
    }
  }

  /**
   * Encrypt data using SEAL identity-based encryption
   */
  async encrypt(
    data: Uint8Array | string,
    userAddress: string,
    metadata?: Record<string, string>
  ): Promise<SealEncryptionResult> {
    if (!this.sealClient) {
      throw new Error('SEAL client not initialized - encryption unavailable');
    }

    try {
      // Convert string to Uint8Array if needed
      const dataBytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
      
      // Optional: Add metadata as additional authenticated data
      const aad = metadata ? 
        new TextEncoder().encode(JSON.stringify(metadata)) : 
        undefined;

      // Use SEAL client encrypt method with correct options
      const encryptResult = await this.sealClient.encrypt({
        threshold: 2,
        packageId: this.packageId,
        id: userAddress,
        data: dataBytes,
        aad,
      });

      // Convert encrypted object to base64 for storage
      const encryptedData = btoa(String.fromCharCode(...encryptResult.encryptedObject));
      const backupKeyHex = toHex(encryptResult.key);
      
      // Generate content hash for verification
      const contentHash = await this.generateContentHash(dataBytes);

      return {
        encryptedData,
        backupKey: backupKeyHex,
        contentHash,
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Decrypt data using SEAL with session keys
   */
  async decrypt(options: SealDecryptionOptions): Promise<Uint8Array> {
    if (!this.sealClient) {
      throw new Error('SEAL client not initialized - decryption unavailable');
    }

    try {
      // Get or create session key
      let activeSessionKey = options.sessionKey;
      if (!activeSessionKey) {
        activeSessionKey = await this.getOrCreateSessionKey(options.userAddress);
      }

      // Build access transaction if not provided
      let txBytes = options.signedTxBytes;
      if (!txBytes) {
        const tx = await this.buildAccessTransaction(options.userAddress, 'read');
        txBytes = await tx.build({ client: this.suiClient });
      }

      // Convert base64 string to Uint8Array
      const encryptedDataBase64 = options.encryptedData as string;
      const binaryString = atob(encryptedDataBase64);
      const encryptedBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedBytes[i] = binaryString.charCodeAt(i);
      }

      // Use SEAL client decrypt method
      const decryptResult = await this.sealClient.decrypt({
        data: encryptedBytes,
        sessionKey: activeSessionKey,
        txBytes: txBytes,
        checkShareConsistency: true,
      });

      return decryptResult;
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`);
    }
  }

  // ==================== SESSION KEY MANAGEMENT ====================

  /**
   * Create a new session key for a user
   */
  async createSessionKey(userAddress: string): Promise<SessionKey> {
    try {
      const sessionKey = await SessionKey.create({
        address: userAddress,
        packageId: this.packageId,
        ttlMin: 60, // 1 hour TTL
        suiClient: this.suiClient,
      });

      // Cache the session key
      this.sessionKeyCache.set(userAddress, sessionKey);
      
      return sessionKey;
    } catch (error) {
      throw new Error(`Failed to create session key: ${error}`);
    }
  }

  /**
   * Get cached session key or create new one
   */
  async getOrCreateSessionKey(userAddress: string): Promise<SessionKey> {
    const cached = this.sessionKeyCache.get(userAddress);
    if (cached) {
      return cached;
    }

    return this.createSessionKey(userAddress);
  }

  /**
   * Export session key for persistence
   */
  async exportSessionKey(sessionKey: SessionKey): Promise<string> {
    try {
      const exported = sessionKey.export();
      return JSON.stringify(exported);
    } catch (error) {
      throw new Error(`Failed to export session key: ${error}`);
    }
  }

  /**
   * Import previously exported session key
   */
  async importSessionKey(exportedKey: string, userAddress?: string): Promise<SessionKey> {
    try {
      const keyData = JSON.parse(exportedKey);
      const sessionKey = SessionKey.import(keyData, this.suiClient);

      if (userAddress) {
        this.sessionKeyCache.set(userAddress, sessionKey);
      }

      return sessionKey;
    } catch (error) {
      throw new Error(`Failed to import session key: ${error}`);
    }
  }

  // ==================== ACCESS CONTROL TRANSACTIONS ====================

  /**
   * Build access approval transaction for SEAL key servers
   */
  async buildAccessTransaction(
    userAddress: string,
    accessType: 'read' | 'write' = 'read'
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(fromHex(userAddress))),
        tx.pure.string(accessType),
        tx.pure.u64(Date.now()),
      ],
    });

    return tx;
  }

  /**
   * Build transaction to grant access to another user
   */
  async buildGrantAccessTransaction(options: AccessGrantOptions): Promise<Transaction> {
    const { ownerAddress, recipientAddress, contentId, accessLevel, expiresIn } = options;
    const tx = new Transaction();

    const expiresAt = expiresIn ? Date.now() + expiresIn : Date.now() + 86400000; // 24h default

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::grant_access`,
      arguments: [
        tx.pure.address(ownerAddress),
        tx.pure.address(recipientAddress),
        tx.pure.string(contentId),
        tx.pure.string(accessLevel),
        tx.pure.u64(expiresAt),
      ],
    });

    return tx;
  }

  /**
   * Build transaction to revoke access from a user
   */
  async buildRevokeAccessTransaction(options: AccessRevokeOptions): Promise<Transaction> {
    const { ownerAddress, recipientAddress, contentId } = options;
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::revoke_access`,
      arguments: [
        tx.pure.address(ownerAddress),
        tx.pure.address(recipientAddress),
        tx.pure.string(contentId),
      ],
    });

    return tx;
  }

  /**
   * Build transaction to register content ownership
   */
  async buildRegisterContentTransaction(
    ownerAddress: string,
    contentId: string,
    contentHash: string
  ): Promise<Transaction> {
    const tx = new Transaction();

    tx.moveCall({
      target: `${this.packageId}::seal_access_control::register_content`,
      arguments: [
        tx.pure.address(ownerAddress),
        tx.pure.string(contentId),
        tx.pure.string(contentHash),
        tx.pure.string(''), // encryption_info
      ],
    });

    return tx;
  }

  // ==================== TRANSACTION BUILDERS ====================

  get tx() {
    return {
      /**
       * Grant access to encrypted memory
       */
      grantAccess: (options: AccessGrantOptions) => {
        return this.buildGrantAccessTransaction(options);
      },

      /**
       * Revoke access to encrypted memory
       */
      revokeAccess: (options: AccessRevokeOptions) => {
        return this.buildRevokeAccessTransaction(options);
      },

      /**
       * Register content ownership
       */
      registerContent: (ownerAddress: string, contentId: string, contentHash: string) => {
        return this.buildRegisterContentTransaction(ownerAddress, contentId, contentHash);
      },

      /**
       * Build access approval transaction
       */
      buildAccessTransaction: (userAddress: string, accessType: 'read' | 'write' = 'read') => {
        return this.buildAccessTransaction(userAddress, accessType);
      },
    };
  }

  // ==================== MOVE CALL BUILDERS ====================

  get call() {
    return {
      /**
       * Move call for granting access
       */
      grantAccess: (options: AccessGrantOptions): Thunk => {
        return async (tx) => {
          const grantTx = await this.buildGrantAccessTransaction(options);
          return grantTx;
        };
      },

      /**
       * Move call for revoking access
       */
      revokeAccess: (options: AccessRevokeOptions): Thunk => {
        return async (tx) => {
          const revokeTx = await this.buildRevokeAccessTransaction(options);
          return revokeTx;
        };
      },
    };
  }

  // ==================== ACCESS CONTROL QUERIES ====================

  /**
   * Check if a user has access to decrypt content
   */
  async hasAccess(
    userAddress: string,
    contentId: string,
    ownerAddress: string
  ): Promise<boolean> {
    try {
      if (userAddress === ownerAddress) {
        return true;
      }

      const tx = new Transaction();
      tx.moveCall({
        target: `${this.packageId}::seal_access_control::check_access`,
        arguments: [
          tx.pure.address(userAddress),
          tx.pure.string(contentId),
          tx.pure.address(ownerAddress),
        ],
      });

      const result = await this.suiClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: userAddress,
      });

      return result.effects.status.status === 'success';
    } catch (error) {
      console.error(`Error checking access: ${error}`);
      return false;
    }
  }

  // ==================== VIEW METHODS ====================

  get view() {
    return {
      /**
       * Get access permissions for memories
       */
      getAccessPermissions: async (userAddress: string, memoryId?: string): Promise<AccessPermission[]> => {
        // Note: This would typically require event queries or indexing
        // For now, return empty array as this requires additional infrastructure
        console.warn('getAccessPermissions: This method requires event indexing infrastructure');
        return [];
      },

      /**
       * Check if user has access to content
       */
      hasAccess: (userAddress: string, contentId: string, ownerAddress: string) => {
        return this.hasAccess(userAddress, contentId, ownerAddress);
      },
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate content hash for verification
   */
  private async generateContentHash(data: Uint8Array): Promise<string> {
    // Create a new Uint8Array to ensure proper typing
    const dataArray = new Uint8Array(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify content integrity
   */
  async verifyContentHash(data: Uint8Array, expectedHash: string): Promise<boolean> {
    const actualHash = await this.generateContentHash(data);
    return actualHash === expectedHash;
  }

  /**
   * Check if SEAL client is available
   */
  isAvailable(): boolean {
    return this.sealClient !== null;
  }

  /**
   * Get SEAL client configuration info
   */
  getClientInfo(): {
    isInitialized: boolean;
    packageId: string;
    encryptionEnabled: boolean;
  } {
    return {
      isInitialized: this.sealClient !== null,
      packageId: this.packageId,
      encryptionEnabled: this.config.encryptionConfig?.enabled || false,
    };
  }
}
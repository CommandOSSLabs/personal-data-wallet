import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, EncryptedObject, SessionKey } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { SessionKeyService } from './session-key.service';

/**
 * Simplified SEAL service following the official examples
 * Based on @mysten/seal API patterns from the MystenLabs/seal repository
 */
@Injectable()
export class SealService {
  private readonly sealClient: SealClient;
  private readonly suiClient: SuiClient;
  private readonly logger = new Logger(SealService.name);
  private readonly packageId: string;
  private readonly threshold: number = 2;

  constructor(
    private readonly configService: ConfigService,
    private readonly sessionKeyService: SessionKeyService
  ) {
    // Initialize configuration
    const network = this.configService.get<'mainnet' | 'testnet' | 'devnet'>('SEAL_NETWORK', 'testnet');
    this.packageId = this.configService.get<string>('SEAL_PACKAGE_ID', '0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60');

    // Initialize Sui client
    this.suiClient = new SuiClient({
      url: this.configService.get<string>('SUI_RPC_URL', getFullnodeUrl(network))
    });

    // Initialize SEAL client with configured key servers
    const keyServerIds = this.configService.get<string[]>('SEAL_KEY_SERVER_IDS', [
      // Default testnet key servers from the official example
      '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75',
      '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8'
    ]);
    const serverConfigs = keyServerIds.map(id => ({ objectId: id, weight: 1 }));

    this.sealClient = new SealClient({
      suiClient: this.suiClient as any, // Type assertion to bypass compatibility issue
      serverConfigs,
      verifyKeyServers: false,
    });

    this.logger.log(`SEAL service initialized with ${serverConfigs.length} key servers on ${network}`);
    this.logger.log(`Package ID: ${this.packageId || 'Not configured'}`);
  }

  /**
   * Encrypt data using SEAL with access control
   * Following the pattern from official examples
   */
  async encrypt(
    data: Uint8Array,
    policyObjectId: string,
    nonce: string = Math.random().toString(36)
  ): Promise<{ encrypted: Uint8Array; identityId: string }> {
    try {
      // Create identity by combining policy object ID with nonce
      // This follows the pattern from the official examples
      const identityId = `${policyObjectId}:${nonce}`;

      const result = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: this.packageId,
        id: identityId,
        data,
      });

      return {
        encrypted: result.encryptedObject,
        identityId,
      };
    } catch (error) {
      this.logger.error('Failed to encrypt data', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using SEAL with SessionKey and transaction validation
   * Following the pattern from official examples
   */
  async decrypt(
    encryptedData: Uint8Array,
    moveCallConstructor: (tx: Transaction, id: string) => void,
    userAddress: string
  ): Promise<Uint8Array> {
    try {
      // Parse the encrypted object to get the identity ID
      const encryptedObject = EncryptedObject.parse(encryptedData);
      const identityId = encryptedObject.id;

      this.logger.debug(`Decrypting data with identity: ${identityId} for user: ${userAddress}`);

      // Get or create session key for the user
      let sessionKey = await this.sessionKeyService.getSessionKey(userAddress, this.packageId);

      if (!sessionKey) {
        throw new Error('No valid session key found. Please create a session first.');
      }

      // Build transaction with the appropriate seal_approve call
      const tx = new Transaction();
      moveCallConstructor(tx, identityId);
      const txBytes = await tx.build({ client: this.suiClient, onlyTransactionKind: true });

      // First, fetch keys from key servers
      await this.sealClient.fetchKeys({
        ids: [identityId],
        txBytes,
        sessionKey,
        threshold: this.threshold,
      });

      // Then decrypt the data locally
      const decrypted = await this.sealClient.decrypt({
        data: encryptedData,
        sessionKey,
        txBytes,
      });

      this.logger.debug(`Successfully decrypted data for user: ${userAddress}`);
      return decrypted;

    } catch (error) {
      this.logger.error('Failed to decrypt data', error);
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Create a transaction builder for self access
   */
  createSelfAccessTransaction(userAddress: string) {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${this.packageId}::seal_access_control::seal_approve`,
        arguments: [
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
        ],
      });
    };
  }

  /**
   * Create a transaction builder for app access
   */
  createAppAccessTransaction(allowlistId: string) {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${this.packageId}::seal_access_control::seal_approve_app`,
        arguments: [
          tx.object(allowlistId),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
        ],
      });
    };
  }

  /**
   * Create a transaction builder for timelock access
   */
  createTimelockAccessTransaction(timelockId: string) {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${this.packageId}::seal_access_control::seal_approve_timelock`,
        arguments: [
          tx.object(timelockId),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
        ],
      });
    };
  }

  /**
   * Encrypt data with time-lock access control
   */
  async encryptWithTimelock(
    data: Uint8Array,
    unlockTimestamp: number,
    nonce: string = Math.random().toString(36),
  ): Promise<{
    encrypted: Uint8Array;
    identityId: string;
    unlockTime: number;
  }> {
    try {
      // Create identity with timestamp for time-lock
      const identityId = `timelock_${unlockTimestamp}_${nonce}`;

      const result = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: this.packageId,
        id: identityId,
        data,
      });

      this.logger.debug(
        `Encrypted data with time-lock identity: ${identityId}`,
      );

      return {
        encrypted: result.encryptedObject,
        identityId,
        unlockTime: unlockTimestamp,
      };
    } catch (error) {
      this.logger.error('Failed to encrypt data with time-lock', error);
      throw new Error(`Time-lock encryption failed: ${(error as Error).message}`);
    }
  }

  /**
   * Decrypt time-locked data
   */
  async decryptTimelock(
    encryptedData: Uint8Array,
    userAddress: string
  ): Promise<Uint8Array> {
    try {
      // Parse the encrypted object to get the identity ID
      const encryptedObject = EncryptedObject.parse(encryptedData);
      const identityId = encryptedObject.id;

      this.logger.debug(`Decrypting time-locked data with identity: ${identityId} for user: ${userAddress}`);

      // Extract timestamp from identity to validate unlock time
      const timestampMatch = identityId.match(/timelock_(\d+)_/);
      if (!timestampMatch) {
        throw new Error('Invalid time-lock identity format');
      }

      const unlockTimestamp = parseInt(timestampMatch[1]);
      const currentTimestamp = Date.now();

      if (currentTimestamp < unlockTimestamp) {
        throw new Error(`Time-lock not yet expired. Unlocks at: ${new Date(unlockTimestamp).toISOString()}`);
      }

      // Get or create session key for the user
      let sessionKey = await this.sessionKeyService.getSessionKey(userAddress, this.packageId);

      if (!sessionKey) {
        throw new Error('No valid session key found. Please create a session first.');
      }

      // Build transaction with time-lock seal_approve call
      const tx = new Transaction();
      // For timelock, we use the SUI clock object
      const moveCallConstructor = this.createTimelockAccessTransaction('0x6'); // SUI_CLOCK_OBJECT_ID
      moveCallConstructor(tx, identityId);
      const txBytes = await tx.build({ client: this.suiClient, onlyTransactionKind: true });

      // First, fetch keys from key servers
      await this.sealClient.fetchKeys({
        ids: [identityId],
        txBytes,
        sessionKey,
        threshold: this.threshold,
      });

      // Then decrypt the data locally
      const decrypted = await this.sealClient.decrypt({
        data: encryptedData,
        sessionKey,
        txBytes,
      });

      this.logger.debug(`Successfully decrypted time-locked data for user: ${userAddress}`);
      return decrypted;

    } catch (error) {
      this.logger.error('Failed to decrypt time-locked data', error);
      throw new Error(`Time-lock decryption failed: ${error.message}`);
    }
  }

  /**
   * Create a transaction builder for role access
   */
  createRoleAccessTransaction(roleRegistryId: string, userAddress: string, role: string) {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${this.packageId}::seal_access_control::seal_approve_role`,
        arguments: [
          tx.object(roleRegistryId),
          tx.pure.address(userAddress),
          tx.pure.string(role),
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
        ],
      });
    };
  }

  /**
   * Get the Sui client instance
   */
  getSuiClient(): SuiClient {
    return this.suiClient;
  }

  /**
   * Get the SEAL client instance
   */
  getSealClient(): SealClient {
    return this.sealClient;
  }

  /**
   * Create a transaction builder for allowlist access
   */
  createAllowlistAccessTransaction(userAddress: string, allowedAddresses: string[]) {
    return (tx: Transaction, id: string) => {
      tx.moveCall({
        target: `${this.packageId}::seal_access_control::seal_approve_allowlist`,
        arguments: [
          tx.pure.vector('u8', Array.from(new TextEncoder().encode(id))),
          tx.pure.address(userAddress),
          tx.pure.vector('address', allowedAddresses),
        ],
      });
    };
  }
}
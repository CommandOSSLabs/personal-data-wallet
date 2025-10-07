import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey } from '@mysten/seal';
import { Transaction } from '@mysten/sui/transactions';
import { SuiService } from '../sui/sui.service';
import { fromHex, toHex } from '@mysten/sui/utils'; 

@Injectable()
export class SealService {
  private sealClient: SealClient;
  private logger = new Logger(SealService.name);
  private packageId: string;
  private moduleName: string;

  constructor(
    private configService: ConfigService,
    private suiService: SuiService,
  ) {
    // Initialize Seal client with key server configurations
    const keyServerIds = this.configService.get<string>('SEAL_KEY_SERVER_IDS')?.split(',') || [];
    const isTestnet = this.configService.get<string>('SUI_NETWORK') === 'testnet';
    
    if (keyServerIds.length === 0) {
      this.logger.warn('No SEAL_KEY_SERVER_IDS configured, using testnet defaults');
      // Default testnet key servers (these would need to be actual testnet server IDs)
      keyServerIds.push(
        '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', 
        '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8',
        '0x...'
      );
    }

    try {
      this.sealClient = new SealClient({
        suiClient: this.suiService.getClient() as any, // Type assertion for compatibility
        serverConfigs: keyServerIds.map(id => ({
          objectId: id.trim(),
          weight: 1,
        })),
        verifyKeyServers: !isTestnet, // Verify in production
      });
      this.logger.log('SEAL client initialized successfully');
    } catch (error) {
      this.logger.warn(`SEAL client initialization failed: ${error.message}`);
      this.sealClient = null as any;
    }

    // Set package ID for access control contract
    this.packageId = this.configService.get<string>('SEAL_PACKAGE_ID') || '';
    this.moduleName = this.configService.get<string>('SEAL_MODULE_NAME') || 'access_control';
    
    if (!this.packageId) {
      this.logger.warn('SEAL_PACKAGE_ID not configured - access control will not work');
    }
  }

  /**
   * Encrypt content for a specific user using Seal IBE
   * @param content The content to encrypt
   * @param userAddress The user address (used as the encryption identity)
   * @param metadata Optional metadata for the encrypted content
   * @returns The encrypted content and backup key
   */
  async encrypt(
    content: string, 
    userAddress: string,
    metadata?: Record<string, string>
  ): Promise<{ encryptedData: string; backupKey: string }> {
    try {
      if (!this.sealClient) {
        throw new Error('SEAL client not initialized - encryption unavailable');
      }
      
      // Convert content to Uint8Array
      const data = new TextEncoder().encode(content);
      
      // Use user address as the identity for encryption
      const identity = userAddress;
      
      // Optional: Add metadata as additional authenticated data
      const aad = metadata ? 
        new TextEncoder().encode(JSON.stringify(metadata)) : 
        undefined;
      
      // Encrypt using Seal with threshold of 2 (2-of-3 key servers)
      const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
        threshold: 2,
        packageId: this.packageId,
        id: identity,
        data,
        aad,
      });
      
      // Convert encrypted object to base64 for storage
      const encryptedData = Buffer.from(encryptedObject).toString('base64');
      const backupKeyHex = toHex(backupKey);
      
      this.logger.debug(`Content encrypted for user ${userAddress}`);
      
      return {
        encryptedData,
        backupKey: backupKeyHex,
      };
    } catch (error) {
      this.logger.error(`Error encrypting content: ${error.message}`);
      throw new Error(`Encryption error: ${error.message}`);
    }
  }

  /**
   * Build a transaction for access approval
   * @param identity The identity (user address) requesting access
   * @param accessType The type of access requested ('read' or 'write')
   * @returns The transaction to be signed by the user
   */
  async buildAccessTransaction(
    identity: string,
    accessType: 'read' | 'write' = 'read'
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Call the seal_approve function in the Move contract
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::seal_approve`,
      arguments: [
        tx.pure.vector('u8', Array.from(fromHex(identity))),
        tx.pure.string(accessType),
        tx.pure.u64(Date.now()), // Timestamp for audit
      ],
    });
    
    return tx;
  }

  /**
   * Decrypt content using Seal IBE with user authorization
   * @param encryptedContent The encrypted content (base64)
   * @param userAddress The user address requesting decryption
   * @param sessionKey The session key for authentication
   * @param signedTxBytes The signed transaction bytes from the user
   * @returns The decrypted content
   */
  async decrypt(
    encryptedContent: string,
    userAddress: string,
    sessionKey: SessionKey,
    signedTxBytes: Uint8Array
  ): Promise<string> {
    try {
      if (!this.sealClient) {
        throw new Error('SEAL client not initialized - decryption unavailable');
      }
      
      // Convert base64 encrypted content back to Uint8Array
      const encryptedData = Uint8Array.from(Buffer.from(encryptedContent, 'base64'));
      
      // Decrypt using Seal with the user's signed transaction
      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedData,
        sessionKey,
        txBytes: signedTxBytes,
        checkShareConsistency: true, // Ensure consistency across key servers
      });
      
      // Convert decrypted bytes to string
      const decryptedContent = new TextDecoder().decode(decryptedBytes);
      
      this.logger.debug(`Content decrypted for user ${userAddress}`);
      
      return decryptedContent;
    } catch (error) {
      this.logger.error(`Error decrypting content: ${error.message}`);
      throw new Error(`Decryption error: ${error.message}`);
    }
  }

  /**
   * Create a session key for a user
   * @param userAddress The user address
   * @returns A new session key
   */
  async createSessionKey(userAddress: string): Promise<SessionKey> {
    // Use SessionKey.create() with proper parameters
    return SessionKey.create({
      address: userAddress,
      packageId: this.packageId,
      ttlMin: 60, // 1 hour TTL
      suiClient: this.suiService.getClient() as any, // Type assertion for compatibility
    });
  }

  /**
   * Export a session key for persistence
   * @param sessionKey The session key to export
   * @returns The exported session key data
   */
  async exportSessionKey(sessionKey: SessionKey): Promise<string> {
    const exported = sessionKey.export();
    return JSON.stringify(exported);
  }

  /**
   * Import a previously exported session key
   * @param exportedKey The exported session key data
   * @returns The imported session key
   */
  async importSessionKey(exportedKey: string): Promise<SessionKey> {
    const keyData = JSON.parse(exportedKey);
    // Pass required suiClient parameter with type assertion
    return SessionKey.import(keyData, this.suiService.getClient() as any);
  }

  /**
   * Grant access to another user for encrypted content
   * @param ownerAddress The owner of the encrypted content
   * @param recipientAddress The recipient to grant access to
   * @param contentId The ID of the encrypted content
   * @param accessLevel The access level to grant
   * @returns Transaction to be signed by the owner
   */
  async grantAccess(
    ownerAddress: string,
    recipientAddress: string,
    contentId: string,
    accessLevel: 'read' | 'write'
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Call the grant_access function in the Move contract
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::grant_access`,
      arguments: [
        tx.pure.address(ownerAddress),
        tx.pure.address(recipientAddress),
        tx.pure.string(contentId),
        tx.pure.string(accessLevel),
        tx.pure.u64(Date.now() + 86400000), // 24 hour expiry by default
      ],
    });
    
    return tx;
  }

  /**
   * Revoke access from a user
   * @param ownerAddress The owner of the encrypted content
   * @param recipientAddress The recipient to revoke access from
   * @param contentId The ID of the encrypted content
   * @returns Transaction to be signed by the owner
   */
  async revokeAccess(
    ownerAddress: string,
    recipientAddress: string,
    contentId: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    // Call the revoke_access function in the Move contract
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::revoke_access`,
      arguments: [
        tx.pure.address(ownerAddress),
        tx.pure.address(recipientAddress),
        tx.pure.string(contentId),
      ],
    });
    
    return tx;
  }

  /**
   * Check if a user has access to decrypt content
   * @param userAddress The user address
   * @param contentId The content ID
   * @param ownerAddress The owner address
   * @returns True if the user can decrypt
   */
  async hasAccess(
    userAddress: string,
    contentId: string,
    ownerAddress: string
  ): Promise<boolean> {
    try {
      // Check if user is the owner
      if (userAddress === ownerAddress) {
        return true;
      }
      
      // Query the blockchain for access permissions
      const client = this.suiService.getClient();
      const result = await client.devInspectTransactionBlock({
        transactionBlock: await this.buildCheckAccessTransaction(
          userAddress,
          contentId,
          ownerAddress
        ),
        sender: userAddress,
      });
      
      // Parse the result to determine if access is granted
      return result.effects.status.status === 'success';
    } catch (error) {
      this.logger.error(`Error checking access: ${error.message}`);
      return false;
    }
  }

  private async buildCheckAccessTransaction(
    userAddress: string,
    contentId: string,
    ownerAddress: string
  ): Promise<Transaction> {
    const tx = new Transaction();
    
    tx.moveCall({
      target: `${this.packageId}::${this.moduleName}::check_access`,
      arguments: [
        tx.pure.address(userAddress),
        tx.pure.string(contentId),
        tx.pure.address(ownerAddress),
      ],
    });
    
    return tx;
  }
}
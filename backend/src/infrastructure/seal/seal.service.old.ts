import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { IdentityType, IdentityOptions, createIdentityString } from './identity-types';
import { SealService } from './seal.service';
import { SuiService } from '../sui/sui.service';
import { SessionStore } from './session-store';

/**
 * Extended SEAL service with full IBE capabilities
 */
@Injectable()
export class SealIBEService extends SealService {
  constructor(
    configService: ConfigService,
    sessionStore: SessionStore,
    @Inject(forwardRef(() => SuiService)) private readonly suiService: SuiService
  ) {
    super(configService, sessionStore);
  }
  
  /**
   * Encrypt content with flexible identity options using native SEAL
   * @param content The content to encrypt
   * @param identityOptions Identity configuration for encryption
   * @returns The encrypted content, backup key, and identity info
   */
  async encryptForIdentity(
    content: string, 
    identityOptions: IdentityOptions
  ): Promise<{ 
    encrypted: string; 
    backupKey: string; 
    identityType: IdentityType;
    identityString: string;
  }> {
    try {
      // Convert content to bytes
      const data = new TextEncoder().encode(content);
      
      // Create identity string for native SEAL
      const identityString = createIdentityString(identityOptions);
      const identityBytes = new TextEncoder().encode(identityString);
      const id = toHEX(identityBytes);
      
      // Encrypt using native SEAL
      const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: this.sealCorePackageId, // Use official SEAL package
        id: id,
        data,
      });

      // Convert encrypted bytes to base64 for storage
      const encrypted = Buffer.from(encryptedObject).toString('base64');
      const backupKeyHex = toHEX(backupKey);

      this.logger.debug(
        `Encrypted content with identity type ${identityOptions.type} for user ${identityOptions.userAddress}`
      );
      
      return {
        encrypted,
        backupKey: backupKeyHex,
        identityType: identityOptions.type,
        identityString,
      };
    } catch (error) {
      this.logger.error(`Error encrypting content: ${error.message}`);
      throw new Error(`SEAL encryption error: ${error.message}`);
    }
  }

  /**
   * Encrypt content for app access
   * @param content The content to encrypt
   * @param userAddress The user who owns the data
   * @param appAddress The app that can decrypt the data
   * @returns Encrypted data and metadata
   */
  async encryptForApp(
    content: string,
    userAddress: string,
    appAddress: string
  ): Promise<{
    encrypted: string;
    backupKey: string;
    appAddress: string;
    identityString: string;
  }> {
    const result = await this.encryptForIdentity(content, {
      type: IdentityType.APP,
      userAddress,
      targetAddress: appAddress,
    });

    return {
      encrypted: result.encrypted,
      backupKey: result.backupKey,
      appAddress,
      identityString: result.identityString,
    };
  }

  /**
   * Encrypt content with time-based access
   * @param content The content to encrypt
   * @param userAddress The user who owns the data
   * @param expiresAt Unix timestamp when access expires
   * @returns Encrypted data and metadata
   */
  async encryptWithTimelock(
    content: string,
    userAddress: string,
    expiresAt: number
  ): Promise<{
    encrypted: string;
    backupKey: string;
    expiresAt: number;
    identityString: string;
  }> {
    const result = await this.encryptForIdentity(content, {
      type: IdentityType.TIME_LOCKED,
      userAddress,
      expiresAt,
    });

    return {
      encrypted: result.encrypted,
      backupKey: result.backupKey,
      expiresAt,
      identityString: result.identityString,
    };
  }

  /**
   * Decrypt content with flexible identity options using native SEAL
   * @param encryptedContent The encrypted content (base64)
   * @param identityOptions Identity configuration for decryption
   * @param signature Signature for session key
   * @returns The decrypted content
   */
  async decryptWithIdentity(
    encryptedContent: string,
    identityOptions: IdentityOptions,
    signature?: string
  ): Promise<string> {
    try {
      // Get or create session key for the requester
      const requesterAddress = identityOptions.targetAddress || identityOptions.userAddress;
      this.logger.debug(`Creating session key for requester ${requesterAddress} with signature: ${signature}`);
      const sessionKey = await this.getOrCreateSessionKey(requesterAddress, signature);
      
      // Convert encrypted content from base64 to bytes
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
      
      // Create identity string for native SEAL (same as encryption)
      const identityString = createIdentityString(identityOptions);
      const identityBytes = new TextEncoder().encode(identityString);
      const id = toHEX(identityBytes);
      
      // Build a minimal transaction for SEAL
      // Even native SEAL requires a transaction
      const tx = new Transaction();
      const txBytes = await tx.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });
      
      this.logger.debug(`Attempting to decrypt with native SEAL`);
      this.logger.debug(`Encrypted bytes length: ${encryptedBytes.length}`);
      this.logger.debug(`Identity: ${identityString}`);
      this.logger.debug(`Requester address: ${requesterAddress}`);
      
      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
      });

      // Convert decrypted bytes to string
      const decrypted = new TextDecoder().decode(decryptedBytes);
      
      this.logger.debug(
        `Decrypted content with identity type ${identityOptions.type}`
      );
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Error decrypting content: ${error.message}`);
      throw new Error(`SEAL decryption error: ${error.message}`);
    }
  }

  // Note: These methods are no longer needed with native SEAL
  // The identity-based access control is handled by the identity string itself
  // On-chain permissions can still be used for additional access control
  // but the SEAL encryption/decryption is purely based on the identity string

  /**
   * Grant app permission to decrypt user's data
   * @param userAddress The user granting permission
   * @param appAddress The app receiving permission
   * @param dataIds Array of data IDs the app can access
   * @param expiresAt Optional expiration timestamp
   */
  async grantAppPermission(
    userAddress: string,
    appAddress: string,
    dataIds: string[],
    expiresAt?: number
  ): Promise<{
    permissionId: string;
    appAddress: string;
    dataIds: string[];
    expiresAt?: number;
  }> {
    const effectiveExpiresAt = expiresAt || 0; // 0 means never expires
    
    try {
      const permissionId = await this.suiService.grantAppPermission(
        userAddress,
        appAddress,
        dataIds,
        effectiveExpiresAt
      );
      
      this.logger.log(
        `Granted on-chain permission ${permissionId} to app ${appAddress} for user ${userAddress}`
      );
      
      return {
        permissionId,
        appAddress,
        dataIds,
        expiresAt: effectiveExpiresAt,
      };
    } catch (error) {
      this.logger.error(`Failed to grant app permission: ${error.message}`);
      throw error;
    }
  }

  /**
   * Revoke app permission
   * @param userAddress The user revoking permission
   * @param permissionId The permission to revoke
   */
  async revokeAppPermission(
    userAddress: string,
    permissionId: string
  ): Promise<boolean> {
    try {
      const success = await this.suiService.revokeAppPermission(
        permissionId,
        userAddress
      );
      
      this.logger.log(
        `Revoked on-chain permission ${permissionId} for user ${userAddress}`
      );
      
      return success;
    } catch (error) {
      this.logger.error(`Failed to revoke app permission: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all app permissions for a user
   * @param userAddress The user address
   */
  async listAppPermissions(userAddress: string): Promise<Array<{
    permissionId: string;
    appAddress: string;
    appName?: string;
    dataIds: string[];
    grantedAt: Date;
    expiresAt?: Date;
  }>> {
    try {
      const permissions = await this.suiService.getUserAppPermissions(userAddress);
      
      // Get detailed info for each permission
      const detailedPermissions = await Promise.all(
        permissions.map(async (perm) => {
          try {
            const details = await this.suiService.getAppPermission(perm.id);
            return {
              permissionId: perm.id,
              appAddress: perm.app,
              appName: undefined, // Could be fetched from an app registry
              dataIds: details.dataIds,
              grantedAt: new Date(perm.grantedAt),
              expiresAt: perm.expiresAt > 0 ? new Date(perm.expiresAt) : undefined,
              revoked: perm.revoked
            };
          } catch (error) {
            this.logger.warn(`Failed to get details for permission ${perm.id}: ${error.message}`);
            return null;
          }
        })
      );
      
      // Filter out nulls and revoked permissions
      return detailedPermissions
        .filter((p): p is NonNullable<typeof p> => p !== null && !p.revoked)
        .map(({ revoked, ...rest }) => rest);
    } catch (error) {
      this.logger.error(`Failed to list app permissions: ${error.message}`);
      return [];
    }
  }
}
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toHEX } from '@mysten/sui/utils';
import { SessionStore } from './session-store';

/**
 * Simplified SEAL service focusing on core self-encryption/decryption
 */
@Injectable()
export class SealSimpleService {
  private sealClient: SealClient;
  private suiClient: SuiClient;
  private logger = new Logger(SealSimpleService.name);
  private sealPackageId: string = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  private threshold: number;
  private network: 'mainnet' | 'testnet' | 'devnet';
  private sessionKeys: Map<string, {
    sessionKey: SessionKey;
    expiresAt: number;
    signature?: string;
  }> = new Map();
  private sessionTtlMin: number;

  constructor(
    private configService: ConfigService,
    private sessionStore: SessionStore
  ) {
    this.network = this.configService.get<'mainnet' | 'testnet' | 'devnet'>('SEAL_NETWORK', 'testnet');
    this.threshold = this.configService.get<number>('SEAL_THRESHOLD', 2);
    this.sessionTtlMin = this.configService.get<number>('SEAL_SESSION_TTL_MIN', 30);

    // Initialize Sui client
    this.suiClient = new SuiClient({ 
      url: this.configService.get<string>('SUI_RPC_URL', getFullnodeUrl(this.network))
    });

    // Initialize SEAL client
    const serverConfigs = getAllowlistedKeyServers(this.network as 'mainnet' | 'testnet').map(
      id => ({ objectId: id, weight: 1 })
    );

    this.sealClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs,
    });

    this.logger.log(`Simple SEAL service initialized with ${serverConfigs.length} key servers on ${this.network}`);
  }

  /**
   * Encrypt content for a user (self-encryption only)
   */
  async encryptForUser(content: string, userAddress: string): Promise<{ 
    encrypted: string; 
    backupKey: string;
    identityUsed: string;
  }> {
    try {
      // Use our deployed package ID from environment
      const packageId = this.configService.get<string>('SEAL_PACKAGE_ID');
      if (!packageId) {
        throw new Error('SEAL_PACKAGE_ID not configured');
      }
      
      this.logger.log('=== SEAL ENCRYPTION START ===');
      this.logger.log(`Package ID: ${packageId}`);
      this.logger.log(`User Address: ${userAddress}`);
      
      const contentBytes = new TextEncoder().encode(content);
      
      // For self-encryption, create identity with format expected by seal_approve
      // The seal_approve function expects the identity to contain the user address
      const identityString = `self:${userAddress}`;
      const identityBytes = new TextEncoder().encode(identityString);
      const id = toHEX(identityBytes);
      
      this.logger.log(`Identity string: ${identityString}`);
      this.logger.log(`Identity hex: ${id.substring(0, 50)}...`);
      
      const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: packageId,  // Use our deployed package
        id: id,
        data: contentBytes,
      });
      
      const encrypted = Buffer.from(encryptedObject).toString('base64');
      const backupKeyHex = toHEX(backupKey);
      
      this.logger.log(`Encrypted size: ${encryptedObject.length}`);
      this.logger.log(`Backup key: ${backupKeyHex.substring(0, 20)}...`);
      this.logger.log('=== SEAL ENCRYPTION END ===');
      
      return {
        encrypted,
        backupKey: backupKeyHex,
        identityUsed: identityString,
      };
    } catch (error: any) {
      this.logger.error('SEAL encryption error:', error);
      throw new Error(`Failed to encrypt: ${error.message}`);
    }
  }

  /**
   * Decrypt content for a user (self-decryption only)
   */
  async decryptForUser(
    encryptedContent: string, 
    userAddress: string,
    signature: string
  ): Promise<string> {
    try {
      // Use our deployed package ID from environment
      const packageId = this.configService.get<string>('SEAL_PACKAGE_ID');
      const moduleName = this.configService.get<string>('SEAL_MODULE_NAME', 'seal_access_control');
      
      if (!packageId) {
        throw new Error('SEAL_PACKAGE_ID not configured');
      }
      
      this.logger.log('=== SEAL DECRYPTION START ===');
      this.logger.log(`Package ID: ${packageId}`);
      this.logger.log(`Module Name: ${moduleName}`);
      this.logger.log(`User Address: ${userAddress}`);
      
      // Get or create session key
      const sessionKey = await this.getOrCreateSessionKey(userAddress, signature);
      
      // Convert encrypted content from base64
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
      
      // Create identity matching what we used for encryption
      const identityString = `self:${userAddress}`;
      const identityBytes = new TextEncoder().encode(identityString);
      const id = toHEX(identityBytes);
      
      this.logger.log(`Identity for decrypt: ${identityString}`);
      
      // Build transaction that calls our seal_approve function
      const { Transaction } = await import('@mysten/sui/transactions');
      const tx = new Transaction();
      
      // Call seal_approve with the identity
      tx.moveCall({
        target: `${packageId}::${moduleName}::seal_approve`,
        arguments: [
          tx.pure.vector('u8', Array.from(identityBytes))
        ]
      });
      
      this.logger.log('Building transaction with seal_approve call...');
      const txBytes = await tx.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });
      
      this.logger.log(`Transaction size: ${txBytes.length} bytes`);
      
      // Decrypt using SEAL
      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
      });
      
      const decrypted = new TextDecoder().decode(decryptedBytes);
      
      this.logger.log('✅ Decryption successful!');
      this.logger.log('=== SEAL DECRYPTION END ===');
      
      return decrypted;
    } catch (error: any) {
      this.logger.error('SEAL decryption error:', error);
      throw new Error(`Failed to decrypt: ${error.message}`);
    }
  }

  /**
   * Get session key message for signing
   */
  async getSessionKeyMessage(userAddress: string): Promise<Uint8Array> {
    // Get our package ID from config
    const packageId = this.configService.get<string>('SEAL_PACKAGE_ID');
    if (!packageId) {
      throw new Error('SEAL_PACKAGE_ID not configured');
    }
    
    const cacheKey = `${userAddress}:${packageId}`;
    const cached = this.sessionKeys.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      // Return the existing personal message
      return cached.sessionKey.getPersonalMessage();
    }
    
    // Create new session key with our package ID
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: packageId,  // Use our deployed package
      ttlMin: this.sessionTtlMin,
      suiClient: this.suiClient,
    });
    
    const personalMessage = sessionKey.getPersonalMessage();
    
    // Cache it without signature yet
    this.sessionKeys.set(cacheKey, {
      sessionKey,
      expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
    });
    
    this.logger.debug(`Created new session key for ${userAddress} with package ${packageId}`);
    this.logger.debug(`Personal message: ${Buffer.from(personalMessage).toString('utf8')}`);
    
    return personalMessage;
  }

  /**
   * Get or create session key
   */
  private async getOrCreateSessionKey(
    userAddress: string,
    signature?: string
  ): Promise<SessionKey> {
    // Get our package ID from config
    const packageId = this.configService.get<string>('SEAL_PACKAGE_ID');
    if (!packageId) {
      throw new Error('SEAL_PACKAGE_ID not configured');
    }
    
    // Create a cache key that includes the package ID
    const cacheKey = `${userAddress}:${packageId}`;
    
    const cached = this.sessionKeys.get(cacheKey);
    if (cached) {
      const now = Date.now();
      if (now < cached.expiresAt) {
        // If we have a new signature, update it
        if (signature && signature !== cached.signature) {
          cached.sessionKey.setPersonalMessageSignature(signature);
          cached.signature = signature;
          this.logger.debug('Updated signature on cached SessionKey');
        }
        return cached.sessionKey;
      }
    }
    
    // Create new session key with our package ID
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: packageId,  // Use our deployed package
      ttlMin: this.sessionTtlMin,
      suiClient: this.suiClient,
    });
    
    if (signature) {
      sessionKey.setPersonalMessageSignature(signature);
    }
    
    // Cache it with the package-specific key
    this.sessionKeys.set(cacheKey, {
      sessionKey,
      expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
      signature,
    });
    
    this.logger.debug(`Created new session key for ${userAddress} with package ${packageId}`);
    
    return sessionKey;
  }

  /**
   * Test the complete flow
   */
  async testCompleteFlow(userAddress: string, signature: string): Promise<{
    success: boolean;
    encrypted?: string;
    decrypted?: string;
    error?: string;
  }> {
    try {
      // Test data
      const testData = `Test data for ${userAddress} at ${new Date().toISOString()}`;
      
      // Encrypt
      this.logger.log('=== Testing Encryption ===');
      const { encrypted, backupKey, identityUsed } = await this.encryptForUser(testData, userAddress);
      this.logger.log(`✓ Encrypted successfully`);
      this.logger.log(`  Identity used: ${identityUsed}`);
      this.logger.log(`  Backup key: ${backupKey.substring(0, 20)}...`);
      
      // Decrypt
      this.logger.log('=== Testing Decryption ===');
      const decrypted = await this.decryptForUser(encrypted, userAddress, signature);
      this.logger.log(`✓ Decrypted successfully`);
      this.logger.log(`  Original: ${testData}`);
      this.logger.log(`  Decrypted: ${decrypted}`);
      
      return {
        success: true,
        encrypted,
        decrypted,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
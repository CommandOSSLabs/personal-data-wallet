import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { toHEX, fromHEX } from '@mysten/sui/utils';
import { SessionStore } from './session-store';

/**
 * SEAL Open Mode Service
 * 
 * This service implements SEAL in open mode where:
 * - The key server accepts decryption requests for any onchain package
 * - Uses a single master key to serve all access policies across packages
 * - Suitable for testing and public deployments without direct user liability
 */
@Injectable()
export class SealOpenModeService {
  private sealClient: SealClient;
  private suiClient: SuiClient;
  private logger = new Logger(SealOpenModeService.name);
  private network: 'mainnet' | 'testnet' | 'devnet';
  private threshold: number;
  private sessionKeys: Map<string, SessionKey> = new Map();
  private sessionTtlMin: number;

  constructor(
    private configService: ConfigService,
    private sessionStore: SessionStore
  ) {
    // Initialize configuration for open mode
    this.network = this.configService.get<'mainnet' | 'testnet' | 'devnet'>('SEAL_NETWORK', 'testnet');
    this.threshold = this.configService.get<number>('SEAL_THRESHOLD', 2);
    this.sessionTtlMin = this.configService.get<number>('SEAL_SESSION_TTL_MIN', 60);

    // Initialize Sui client
    this.suiClient = new SuiClient({ 
      url: this.configService.get<string>('SUI_RPC_URL', getFullnodeUrl(this.network))
    });

    // Initialize SEAL client with open mode key servers
    const keyServerIds = this.configService.get<string[]>('SEAL_KEY_SERVER_IDS', []);
    const serverConfigs = keyServerIds.length > 0 
      ? keyServerIds.map(id => ({ objectId: id, weight: 1 }))
      : getAllowlistedKeyServers(this.network as 'mainnet' | 'testnet').map(id => ({ objectId: id, weight: 1 }));

    this.sealClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs,
      verifyKeyServers: false, // In open mode, we don't verify key servers
    });

    this.logger.log(`SEAL Open Mode service initialized with ${serverConfigs.length} key servers on ${this.network}`);
    this.logger.log(`Operating in OPEN MODE - accepting requests for any package`);
  }

  /**
   * Encrypt content using open mode
   * @param content The content to encrypt
   * @param packageId The package ID containing seal_approve functions
   * @param identity The identity string for encryption
   * @returns Encrypted content and backup key
   */
  async encrypt(
    content: string, 
    packageId: string,
    identity: string
  ): Promise<{ 
    encrypted: string; 
    backupKey: string;
    metadata: {
      packageId: string;
      identity: string;
      threshold: number;
      network: string;
    };
  }> {
    try {
      this.logger.log('=== SEAL OPEN MODE ENCRYPTION ===');
      this.logger.log(`Package ID: ${packageId}`);
      this.logger.log(`Identity: ${identity}`);
      this.logger.log(`Threshold: ${this.threshold}`);
      
      // Convert content to bytes
      const data = new TextEncoder().encode(content);
      
      // Convert identity to bytes and hex
      const identityBytes = new TextEncoder().encode(identity);
      const id = toHEX(identityBytes);
      
      // Encrypt using SEAL
      const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: packageId,
        id: id,
        data,
      });

      // Convert to base64 for storage
      const encrypted = Buffer.from(encryptedObject).toString('base64');
      const backupKeyHex = toHEX(backupKey);

      this.logger.log(`✓ Encryption successful`);
      this.logger.log(`  Encrypted size: ${encryptedObject.length} bytes`);
      this.logger.log(`  Backup key: ${backupKeyHex.substring(0, 20)}...`);
      
      return {
        encrypted,
        backupKey: backupKeyHex,
        metadata: {
          packageId,
          identity,
          threshold: this.threshold,
          network: this.network,
        },
      };
    } catch (error) {
      this.logger.error(`Open mode encryption error: ${error.message}`, error.stack);
      throw new Error(`SEAL open mode encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt content using open mode
   * @param encryptedContent The encrypted content (base64)
   * @param packageId The package ID containing seal_approve functions
   * @param moduleName The module name containing seal_approve
   * @param identity The identity string used for encryption
   * @param userAddress The user address for session key
   * @param signature The signature from user (optional if cached)
   * @returns Decrypted content
   */
  async decrypt(
    encryptedContent: string,
    packageId: string,
    moduleName: string,
    identity: string,
    userAddress: string,
    signature?: string
  ): Promise<string> {
    try {
      this.logger.log('=== SEAL OPEN MODE DECRYPTION ===');
      this.logger.log(`Package ID: ${packageId}`);
      this.logger.log(`Module: ${moduleName}`);
      this.logger.log(`Identity: ${identity}`);
      this.logger.log(`User: ${userAddress}`);
      
      // Get or create session key
      const sessionKey = await this.getOrCreateSessionKey(packageId, userAddress, signature);
      
      // Convert encrypted content from base64
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
      
      // Convert identity to bytes
      const identityBytes = new TextEncoder().encode(identity);
      
      // Build transaction for seal_approve
      const tx = new Transaction();
      tx.moveCall({
        target: `${packageId}::${moduleName}::seal_approve`,
        arguments: [
          tx.pure.vector('u8', Array.from(identityBytes))
        ]
      });
      
      const txBytes = await tx.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });
      
      this.logger.log(`Transaction built, size: ${txBytes.length} bytes`);
      
      // Decrypt using SEAL
      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
      });

      const decrypted = new TextDecoder().decode(decryptedBytes);
      
      this.logger.log(`✓ Decryption successful`);
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Open mode decryption error: ${error.message}`, error.stack);
      throw new Error(`SEAL open mode decryption failed: ${error.message}`);
    }
  }

  /**
   * Get session key message for signing
   * @param packageId The package ID for the session
   * @param userAddress The user address
   * @returns Message to be signed
   */
  async getSessionKeyMessage(packageId: string, userAddress: string): Promise<Uint8Array> {
    // Check if we have a cached session
    const cacheKey = `${userAddress}:${packageId}`;
    const sessionData = this.sessionStore.get(cacheKey);
    
    if (sessionData && !sessionData.signature) {
      return Buffer.from(sessionData.personalMessage, 'hex');
    }

    // Create new session key
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: packageId,
      ttlMin: this.sessionTtlMin,
      suiClient: this.suiClient,
    });

    const personalMessage = sessionKey.getPersonalMessage();
    
    // Store session data
    this.sessionStore.set(cacheKey, {
      address: userAddress,
      personalMessage: Buffer.from(personalMessage).toString('hex'),
      expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
    });

    // Cache SessionKey instance
    this.sessionKeys.set(cacheKey, sessionKey);

    this.logger.debug(`Created session key for ${userAddress} with package ${packageId}`);
    
    return personalMessage;
  }

  /**
   * Get or create session key for open mode
   */
  private async getOrCreateSessionKey(
    packageId: string,
    userAddress: string,
    signature?: string
  ): Promise<SessionKey> {
    const cacheKey = `${userAddress}:${packageId}`;
    
    // Check cached session key
    const cached = this.sessionKeys.get(cacheKey);
    const sessionData = this.sessionStore.get(cacheKey);
    
    if (cached && sessionData) {
      // If we have a new signature, set it
      if (signature && !sessionData.signature) {
        cached.setPersonalMessageSignature(signature);
        sessionData.signature = signature;
        this.sessionStore.set(cacheKey, sessionData);
        this.logger.debug(`Set signature on cached SessionKey`);
      } else if (sessionData.signature && !signature) {
        // Try to use stored signature
        try {
          cached.setPersonalMessageSignature(sessionData.signature);
        } catch (error) {
          this.logger.warn(`Failed to set stored signature: ${error.message}`);
        }
      }
      return cached;
    }

    // Create new session key
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: packageId,
      ttlMin: this.sessionTtlMin,
      suiClient: this.suiClient,
    });

    if (signature) {
      sessionKey.setPersonalMessageSignature(signature);
    }

    // Cache it
    this.sessionKeys.set(cacheKey, sessionKey);
    
    // Store session data
    this.sessionStore.set(cacheKey, {
      address: userAddress,
      personalMessage: Buffer.from(sessionKey.getPersonalMessage()).toString('hex'),
      signature,
      expiresAt: Date.now() + (this.sessionTtlMin * 60 * 1000),
    });

    this.logger.debug(`Created new SessionKey for ${userAddress} with package ${packageId}`);
    
    return sessionKey;
  }

  /**
   * Batch encrypt multiple contents
   * @param items Array of items to encrypt
   * @returns Map of item ID to encrypted result
   */
  async batchEncrypt(
    items: Array<{
      id: string;
      content: string;
      packageId: string;
      identity: string;
    }>
  ): Promise<Map<string, {
    encrypted: string;
    backupKey: string;
    metadata: any;
  }>> {
    const results = new Map();
    
    for (const item of items) {
      try {
        const result = await this.encrypt(item.content, item.packageId, item.identity);
        results.set(item.id, result);
      } catch (error) {
        this.logger.error(`Failed to encrypt item ${item.id}: ${error.message}`);
        results.set(item.id, { error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Test open mode functionality
   */
  async testOpenMode(
    packageId: string,
    moduleName: string,
    userAddress: string,
    signature: string
  ): Promise<{
    success: boolean;
    details: any;
    error?: string;
  }> {
    try {
      const testData = `Open mode test at ${new Date().toISOString()}`;
      const identity = `test:${userAddress}`;
      
      this.logger.log('=== TESTING SEAL OPEN MODE ===');
      
      // Test encryption
      const { encrypted, backupKey, metadata } = await this.encrypt(
        testData,
        packageId,
        identity
      );
      
      this.logger.log('✓ Encryption test passed');
      
      // Test decryption
      const decrypted = await this.decrypt(
        encrypted,
        packageId,
        moduleName,
        identity,
        userAddress,
        signature
      );
      
      this.logger.log('✓ Decryption test passed');
      
      const success = testData === decrypted;
      
      return {
        success,
        details: {
          original: testData,
          encrypted: encrypted.substring(0, 50) + '...',
          decrypted,
          backupKey: backupKey.substring(0, 20) + '...',
          metadata,
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.stack,
      };
    }
  }
}
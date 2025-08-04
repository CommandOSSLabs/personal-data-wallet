import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SessionStore } from './session-store';

@Injectable()
export class SealService {
  protected sealClient: SealClient;
  protected suiClient: SuiClient;
  protected logger = new Logger(SealService.name);
  protected packageId: string;
  protected sealCorePackageId: string = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52'; // Official SEAL package
  protected moduleName: string;
  protected threshold: number;
  protected network: 'mainnet' | 'testnet' | 'devnet';
  protected sessionKeys: Map<string, SessionKey> = new Map();
  protected isOpenMode: boolean;

  constructor(
    private configService: ConfigService,
    protected sessionStore: SessionStore
  ) {
    // Initialize configuration
    this.network = this.configService.get<'mainnet' | 'testnet' | 'devnet'>('SEAL_NETWORK', 'testnet');
    this.packageId = this.configService.get<string>('SEAL_PACKAGE_ID', '');
    this.moduleName = this.configService.get<string>('SEAL_MODULE_NAME', 'seal_access_control');
    this.threshold = this.configService.get<number>('SEAL_THRESHOLD', 2);
    this.isOpenMode = this.configService.get<boolean>('SEAL_OPEN_MODE', true); // Default to open mode

    // Initialize Sui client
    this.suiClient = new SuiClient({ 
      url: this.configService.get<string>('SUI_RPC_URL', getFullnodeUrl(this.network))
    });

    // Initialize SEAL client with allowlisted key servers
    const keyServerIds = this.configService.get<string[]>('SEAL_KEY_SERVER_IDS', []);
    const serverConfigs = keyServerIds.length > 0 
      ? keyServerIds.map(id => ({ objectId: id, weight: 1 }))
      : getAllowlistedKeyServers(this.network as 'mainnet' | 'testnet').map(id => ({ objectId: id, weight: 1 }));

    this.sealClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs,
      verifyKeyServers: !this.isOpenMode, // Don't verify in open mode
    });

    this.logger.log(`SEAL service initialized with ${serverConfigs.length} key servers on ${this.network}`);
    this.logger.log(`Operating in ${this.isOpenMode ? 'OPEN' : 'PERMISSIONED'} mode`);
  }

  /**
   * Encrypt content for a specific user
   * In open mode: accepts any package ID
   * In permissioned mode: uses native SEAL or configured package
   * @param content The content to encrypt
   * @param userAddress The user address (used as the encryption identity)
   * @param customPackageId Optional custom package ID (only in open mode)
   * @returns The encrypted content and backup key
   */
  async encrypt(
    content: string, 
    userAddress: string,
    customPackageId?: string
  ): Promise<{ encrypted: string; backupKey: string }> {
    try {
      // Convert content to bytes
      const data = new TextEncoder().encode(content);
      
      // Determine package ID to use
      let packageIdToUse: string;
      if (this.isOpenMode && customPackageId) {
        // In open mode, allow custom package ID
        packageIdToUse = customPackageId;
        this.logger.debug(`Open mode: Using custom package ID ${packageIdToUse}`);
      } else if (this.packageId) {
        // Use configured package ID
        packageIdToUse = this.packageId;
      } else {
        // Fall back to official SEAL package (native SEAL)
        packageIdToUse = this.sealCorePackageId;
      }
      
      // Create identity based on mode
      const identityString = this.isOpenMode 
        ? `open:${userAddress}` // Open mode identity format
        : `self:${userAddress}`; // Native SEAL identity format
        
      const identityBytes = new TextEncoder().encode(identityString);
      const id = toHEX(identityBytes);
      
      // Encrypt using SEAL
      const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: packageIdToUse,
        id: id,
        data,
      });

      // Convert encrypted bytes to base64 for storage
      const encrypted = Buffer.from(encryptedObject).toString('base64');
      const backupKeyHex = toHEX(backupKey);

      this.logger.debug(`Encrypted content for user ${userAddress} with threshold ${this.threshold}`);
      this.logger.debug(`Mode: ${this.isOpenMode ? 'OPEN' : 'PERMISSIONED'}, Package: ${packageIdToUse}`);
      
      return {
        encrypted,
        backupKey: backupKeyHex,
      };
    } catch (error) {
      this.logger.error(`Error encrypting content: ${error.message}`);
      throw new Error(`SEAL encryption error: ${error.message}`);
    }
  }

  /**
   * Decrypt content for a specific user
   * @param encryptedContent The encrypted content (base64)
   * @param userAddress The user address
   * @param signature Optional signature for session key (if not provided, will use cached)
   * @param customPackageId Optional custom package ID (only in open mode)
   * @param customModuleName Optional custom module name (only in open mode)
   * @returns The decrypted content
   */
  async decrypt(
    encryptedContent: string, 
    userAddress: string,
    signature?: string,
    customPackageId?: string,
    customModuleName?: string
  ): Promise<string> {
    try {
      // Determine package ID and module to use
      let packageIdToUse: string;
      let moduleNameToUse: string;
      
      if (this.isOpenMode && customPackageId && customModuleName) {
        // In open mode, allow custom package and module
        packageIdToUse = customPackageId;
        moduleNameToUse = customModuleName;
        this.logger.debug(`Open mode: Using custom package ${packageIdToUse}::${moduleNameToUse}`);
      } else if (this.packageId) {
        // Use configured package
        packageIdToUse = this.packageId;
        moduleNameToUse = this.moduleName;
      } else {
        // For native SEAL, we need to build an empty transaction
        packageIdToUse = this.sealCorePackageId;
        moduleNameToUse = '';
      }
      
      // Get or create session key
      const sessionKey = await this.getOrCreateSessionKey(userAddress, signature, packageIdToUse);
      
      // Convert encrypted content from base64 to bytes
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
      
      // Create identity based on mode
      const identityString = this.isOpenMode 
        ? `open:${userAddress}` // Open mode identity format
        : `self:${userAddress}`; // Native SEAL identity format
        
      const identityBytes = new TextEncoder().encode(identityString);
      const id = toHEX(identityBytes);
      
      // Build transaction
      const tx = new Transaction();
      
      if (moduleNameToUse) {
        // Call seal_approve function
        tx.moveCall({
          target: `${packageIdToUse}::${moduleNameToUse}::seal_approve`,
          arguments: [
            tx.pure.vector("u8", fromHEX(id)),
          ]
        });
      }
      // For native SEAL, we can use an empty transaction
      
      const txBytes = await tx.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });
      
      this.logger.debug(`Decrypting with mode: ${this.isOpenMode ? 'OPEN' : 'PERMISSIONED'}`);
      this.logger.debug(`Package: ${packageIdToUse}, Module: ${moduleNameToUse || 'native'}`);
      
      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
      });

      // Convert decrypted bytes to string
      const decrypted = new TextDecoder().decode(decryptedBytes);
      
      this.logger.debug(`Decrypted content for user ${userAddress}`);
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Error decrypting content: ${error.message}`);
      throw new Error(`SEAL decryption error: ${error.message}`);
    }
  }

  /**
   * Decrypt content using backup symmetric key
   * @param encryptedContent The encrypted content (base64)
   * @param backupKey The backup symmetric key (hex)
   * @returns The decrypted content
   */
  async decryptWithBackupKey(
    encryptedContent: string, 
    backupKey: string
  ): Promise<string> {
    try {
      // This would use SEAL's symmetric decryption
      // For now, throw not implemented
      throw new Error('Backup key decryption not yet implemented');
    } catch (error) {
      this.logger.error(`Error decrypting with backup key: ${error.message}`);
      throw new Error(`Backup key decryption error: ${error.message}`);
    }
  }

  /**
   * Create or get a session key for a user
   * @param userAddress The user address
   * @param signature Optional signature from user
   * @param packageId Package ID for the session
   * @returns The session key
   */
  protected async getOrCreateSessionKey(
    userAddress: string, 
    signature?: string,
    packageId?: string
  ): Promise<SessionKey> {
    // Use provided package ID or fall back to configured/core package
    const pkgId = packageId || this.packageId || this.sealCorePackageId;
    const cacheKey = `${userAddress}:${pkgId}`;
    
    // Check if we have a cached session key with signature
    const cached = this.sessionKeys.get(cacheKey);
    const sessionData = this.sessionStore.get(cacheKey);
    
    // If we have both cached SessionKey AND session data with signature, return cached
    if (cached && sessionData && sessionData.signature) {
      this.logger.debug(`Using cached SessionKey for ${userAddress}`);
      return cached;
    }

    // If we have a cached SessionKey but need to set a new signature
    if (cached && signature && (!sessionData || !sessionData.signature)) {
      this.logger.debug(`Setting signature on existing SessionKey for ${userAddress}`);
      try {
        cached.setPersonalMessageSignature(signature);
        this.logger.debug(`Signature set successfully on cached SessionKey`);
        
        // Update session data with signature
        if (sessionData) {
          sessionData.signature = signature;
          this.sessionStore.set(cacheKey, sessionData);
        }
        return cached;
      } catch (error) {
        this.logger.error(`Failed to set signature on cached SessionKey: ${error.message}`);
        // Continue to create new SessionKey
      }
    }

    // If we have session data, use the cached SessionKey from getSessionKeyMessage
    if (sessionData && cached) {
      if (signature) {
        this.logger.debug(`Setting new signature on cached SessionKey for ${userAddress}`);
        try {
          cached.setPersonalMessageSignature(signature);
          this.logger.debug(`Signature set successfully`);
          
          // Update session data with signature
          sessionData.signature = signature;
          this.sessionStore.set(cacheKey, sessionData);
        } catch (error) {
          this.logger.error(`Failed to set signature: ${error.message}`);
          throw new Error(`Failed to set session key signature: ${error.message}`);
        }
      } else if (sessionData.signature) {
        // Try to set stored signature
        try {
          cached.setPersonalMessageSignature(sessionData.signature);
          this.logger.debug(`Set stored signature on cached SessionKey`);
        } catch (error) {
          this.logger.warn(`Failed to set stored signature: ${error.message}`);
          throw new Error('User signature required for session key initialization');
        }
      } else {
        throw new Error('User signature required for session key initialization');
      }
      return cached;
    }

    // No session data exists, this shouldn't happen if getSessionKeyMessage was called first
    throw new Error('No session found. Please request session message first.');
  }

  /**
   * Get the personal message that needs to be signed for session key
   * @param userAddress The user address
   * @param packageId Optional package ID (for open mode)
   * @returns The message to be signed
   */
  async getSessionKeyMessage(userAddress: string, packageId?: string): Promise<Uint8Array> {
    // Use provided package ID or fall back to configured/core package
    const pkgId = packageId || this.packageId || this.sealCorePackageId;
    const cacheKey = `${userAddress}:${pkgId}`;
    
    // Check if we already have a session for this address
    const existingSession = this.sessionStore.get(cacheKey);
    if (existingSession && !existingSession.signature) {
      // Return the existing personal message if no signature set yet
      return Buffer.from(existingSession.personalMessage, 'hex');
    }

    const ttlMin = this.configService.get<number>('SEAL_SESSION_TTL_MIN', 60);
    const sessionKey = new SessionKey({
      address: userAddress,
      packageId: pkgId,
      ttlMin,
      suiClient: this.suiClient,
    });

    const personalMessage = sessionKey.getPersonalMessage();
    
    // Store the session data
    this.sessionStore.set(cacheKey, {
      address: userAddress,
      personalMessage: Buffer.from(personalMessage).toString('hex'),
      expiresAt: Date.now() + (ttlMin * 60 * 1000),
    });

    // Also cache the SessionKey instance
    this.sessionKeys.set(cacheKey, sessionKey);

    return personalMessage;
  }

  /**
   * Check if a session key is expired
   * @param sessionKey The session key to check
   * @returns True if expired
   */
  protected isSessionKeyExpired(sessionKey: SessionKey): boolean {
    // SessionKey doesn't expose expiry directly, so we'll manage it externally
    // In a real implementation, you'd track creation time and TTL
    return false;
  }

  /**
   * Get current mode
   * @returns Whether service is in open mode
   */
  isInOpenMode(): boolean {
    return this.isOpenMode;
  }

  /**
   * Fetch multiple keys in batch (for efficiency)
   * @param ids Array of identity IDs
   * @param userAddress The user address
   * @param signature Optional signature for session key
   * @param packageId Optional package ID (for open mode)
   * @param moduleName Optional module name (for open mode)
   * @returns Map of id to decryption result
   */
  async fetchMultipleKeys(
    ids: string[],
    userAddress: string,
    signature?: string,
    packageId?: string,
    moduleName?: string
  ): Promise<Map<string, Uint8Array>> {
    try {
      // Determine package and module to use
      const pkgId = (this.isOpenMode && packageId) ? packageId : (this.packageId || this.sealCorePackageId);
      const modName = (this.isOpenMode && moduleName) ? moduleName : this.moduleName;
      
      // Get session key
      const sessionKey = await this.getOrCreateSessionKey(userAddress, signature, pkgId);
      
      // Build transaction with multiple seal_approve calls
      const tx = new Transaction();
      for (const id of ids) {
        if (modName) {
          tx.moveCall({
            target: `${pkgId}::${modName}::seal_approve`,
            arguments: [
              tx.pure.vector("u8", fromHEX(id)),
            ],
          });
        }
      }

      const txBytes = await tx.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });

      // Fetch keys from SEAL
      const keys = await this.sealClient.fetchKeys({
        ids: ids,
        txBytes,
        sessionKey,
        threshold: this.threshold,
      });

      // Convert to Map
      const result = new Map<string, Uint8Array>();
      ids.forEach((id, index) => {
        if (keys[index]) {
          result.set(id, keys[index]);
        }
      });

      return result;
    } catch (error) {
      this.logger.error(`Error fetching multiple keys: ${error.message}`);
      throw new Error(`SEAL batch fetch error: ${error.message}`);
    }
  }
}
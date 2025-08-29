import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SealClient, SessionKey, getAllowlistedKeyServers } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { fromHEX, toHEX } from '@mysten/sui/utils';
import { SessionStore } from './session-store';

/**
 * SEAL service using native SEAL functionality without custom Move contracts
 */
@Injectable()
export class SealNativeService {
  private sealClient: SealClient;
  private suiClient: SuiClient;
  private logger = new Logger(SealNativeService.name);
  private sealPackageId: string = '0x62c79dfeb0a2ca8c308a56bde530ccf3846535e1623949d45c90d23128afff52';
  private threshold: number;
  private network: 'mainnet' | 'testnet' | 'devnet';
  private sessionKeys: Map<string, SessionKey> = new Map();

  constructor(
    private configService: ConfigService,
    private sessionStore: SessionStore
  ) {
    // Initialize configuration
    this.network = this.configService.get<'mainnet' | 'testnet' | 'devnet'>('SEAL_NETWORK', 'testnet');
    this.threshold = this.configService.get<number>('SEAL_THRESHOLD', 2);

    // Initialize Sui client
    this.suiClient = new SuiClient({ 
      url: this.configService.get<string>('SUI_RPC_URL', getFullnodeUrl(this.network))
    });

    // Initialize SEAL client with allowlisted key servers
    const serverConfigs = getAllowlistedKeyServers(this.network as 'mainnet' | 'testnet').map(
      id => ({ objectId: id, weight: 1 })
    );

    this.sealClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs,
    });

    this.logger.log(`SEAL Native service initialized with ${serverConfigs.length} key servers on ${this.network}`);
  }

  /**
   * Encrypt content using native SEAL (no custom Move contract)
   */
  async encrypt(content: string, identity: string): Promise<{ encrypted: string; backupKey: string }> {
    try {
      const data = new TextEncoder().encode(content);
      
      // For native SEAL, identity is just a string that will be hashed
      const identityBytes = new TextEncoder().encode(identity);
      const identityHex = toHEX(identityBytes);
      
      const { encryptedObject, key: backupKey } = await this.sealClient.encrypt({
        threshold: this.threshold,
        packageId: this.sealPackageId,
        id: identityHex,
        data,
      });

      const encrypted = Buffer.from(encryptedObject).toString('base64');
      const backupKeyHex = toHEX(backupKey);

      this.logger.debug(`Encrypted content for identity ${identity}`);
      
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
   * Decrypt content using native SEAL
   */
  async decrypt(
    encryptedContent: string, 
    identity: string,
    address: string,
    signature?: string
  ): Promise<string> {
    try {
      // Get or create session key
      const sessionKey = await this.getOrCreateSessionKey(address, signature);
      
      // Convert encrypted content from base64 to bytes
      const encryptedBytes = new Uint8Array(Buffer.from(encryptedContent, 'base64'));
      
      // For native SEAL, identity is just a string
      const identityBytes = new TextEncoder().encode(identity);
      const identityHex = toHEX(identityBytes);
      
      // SEAL requires a transaction for decryption authorization
      const { Transaction } = await import('@mysten/sui/transactions');
      const tx = new Transaction();
      tx.setSender(address);
      
      const txBytes = await tx.build({ 
        client: this.suiClient, 
        onlyTransactionKind: true 
      });
      
      const decryptedBytes = await this.sealClient.decrypt({
        data: encryptedBytes,
        sessionKey,
        txBytes,
      });

      const decrypted = new TextDecoder().decode(decryptedBytes);
      
      this.logger.debug(`Decrypted content for identity ${identity}`);
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Error decrypting content: ${error.message}`);
      throw new Error(`SEAL decryption error: ${error.message}`);
    }
  }

  /**
   * Get session key message for signing
   */
  async getSessionKeyMessage(address: string): Promise<Uint8Array> {
    const existingSession = this.sessionStore.get(address);
    if (existingSession && !existingSession.signature) {
      return Buffer.from(existingSession.personalMessage, 'hex');
    }

    const ttlMin = this.configService.get<number>('SEAL_SESSION_TTL_MIN', 30);
    const sessionKey = new SessionKey({
      address: address,
      packageId: this.sealPackageId,
      ttlMin,
      suiClient: this.suiClient,
    });

    const personalMessage = sessionKey.getPersonalMessage();
    
    this.sessionStore.set(address, {
      address: address,
      personalMessage: Buffer.from(personalMessage).toString('hex'),
      expiresAt: Date.now() + (ttlMin * 60 * 1000),
    });

    this.sessionKeys.set(address, sessionKey);

    return personalMessage;
  }

  /**
   * Get or create session key
   */
  private async getOrCreateSessionKey(
    address: string, 
    signature?: string
  ): Promise<SessionKey> {
    const cached = this.sessionKeys.get(address);
    const sessionData = this.sessionStore.get(address);
    
    if (cached && sessionData && sessionData.signature) {
      this.logger.debug(`Using cached SessionKey for ${address}`);
      return cached;
    }

    if (cached && signature) {
      this.logger.debug(`Setting signature on existing SessionKey for ${address}`);
      try {
        cached.setPersonalMessageSignature(signature);
        this.logger.debug(`Signature set successfully on cached SessionKey`);
        
        if (sessionData) {
          sessionData.signature = signature;
          this.sessionStore.set(address, sessionData);
        }
        return cached;
      } catch (error) {
        this.logger.error(`Failed to set signature on cached SessionKey: ${error.message}`);
        throw error;
      }
    }

    throw new Error('No session found. Please request session message first.');
  }
}
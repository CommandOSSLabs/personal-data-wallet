/**
 * Seal IBE client wrapper
 */

import { SealClient } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui';
import config from './config.js';
import { SealConfig, KeyRequest, KeyMetadata } from './types.js';

export class SealClientWrapper {
  private sealClient: SealClient;
  private suiClient: SuiClient;
  private config: SealConfig;

  constructor() {
    this.config = config.seal;
    
    // Initialize Sui client
    this.suiClient = new SuiClient({ 
      url: config.sui.rpcUrl 
    });

    // Initialize Seal client
    this.sealClient = new SealClient({
      suiClient: this.suiClient,
      serverConfigs: this.config.keyServerIds.map(id => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: this.config.verifyKeyServers,
    });

    console.log(`Initialized Seal client with ${this.config.keyServerIds.length} key servers, threshold: ${this.config.threshold}`);
  }

  /**
   * Encrypt data using Seal IBE
   */
  async encrypt(data: Buffer, identity: string): Promise<Buffer> {
    try {
      console.log(`Encrypting data (${data.length} bytes) with identity: ${identity}`);
      
      const encryptedResult = await this.sealClient.encrypt(data, identity);
      
      console.log(`Encryption successful, encrypted size: ${encryptedResult.length} bytes`);
      return encryptedResult;
    } catch (error) {
      console.error('Seal encryption failed:', error);
      throw new Error(`Seal encryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Create session key for decryption
   */
  async createSessionKey(identity: string, suiPtb: any, signature: string): Promise<Buffer> {
    try {
      console.log(`Creating session key for identity: ${identity}`);
      
      // For development, we'll simulate the session key creation
      // In production, this would validate the Sui PTB and signature
      const sessionKey = await this.sealClient.createSessionKey(
        identity,
        suiPtb,
        signature
      );
      
      console.log('Session key created successfully');
      return sessionKey;
    } catch (error) {
      console.error('Session key creation failed:', error);
      throw new Error(`Session key creation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Decrypt data using session key
   */
  async decrypt(encryptedData: Buffer, sessionKey: Buffer): Promise<Buffer> {
    try {
      console.log(`Decrypting data (${encryptedData.length} bytes)`);
      
      const decryptedData = await this.sealClient.decrypt(encryptedData, sessionKey);
      
      console.log(`Decryption successful, decrypted size: ${decryptedData.length} bytes`);
      return decryptedData;
    } catch (error) {
      console.error('Seal decryption failed:', error);
      throw new Error(`Seal decryption failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate access policy against Sui blockchain
   */
  async validateAccessPolicy(keyRequest: KeyRequest): Promise<boolean> {
    try {
      // For development, we'll do basic validation
      // In production, this would validate against actual Sui contracts
      const { ibe_identity, sui_ptb, signature } = keyRequest;
      
      console.log(`Validating access policy for identity: ${ibe_identity}`);
      
      // Basic validation checks
      if (!ibe_identity || !sui_ptb || !signature) {
        console.log('Missing required fields for access validation');
        return false;
      }
      
      if (!sui_ptb.user_address) {
        console.log('Missing user_address in Sui PTB');
        return false;
      }
      
      // For development, allow all requests with proper structure
      // In production, this would check:
      // 1. Signature validity
      // 2. Sui transaction validity
      // 3. Access policy permissions
      // 4. User authorization
      
      console.log('Access validation passed (development mode)');
      return true;
    } catch (error) {
      console.error('Access policy validation failed:', error);
      return false;
    }
  }

  /**
   * Get service information
   */
  getServiceInfo() {
    return {
      keyServers: this.config.keyServerIds.length,
      threshold: this.config.threshold,
      verifyKeyServers: this.config.verifyKeyServers,
      network: config.sui.network,
      status: 'active'
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check Sui client connection
      await this.suiClient.getLatestSuiSystemState();
      
      // For Seal client, we'll check if key servers are reachable
      // This is a simplified health check
      console.log('Health check passed');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}
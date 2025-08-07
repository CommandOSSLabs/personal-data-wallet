/**
 * Seal Service - Frontend Identity-Based Encryption (IBE) Operations
 * 
 * This service provides client-side encryption and decryption using the Seal SDK.
 * All encryption/decryption happens on the frontend for true end-to-end encryption.
 */

import { SealClient, SessionKey } from '@mysten/seal';
import type { SealCompatibleClient, KeyServerConfig } from '@mysten/seal';
import { SEAL_CONFIG, validateSealConfig, isDebugEnabled, getKeyServers } from '../config/sealConfig';

// Types for memory encryption
export interface EncryptedMemoryData {
  encryptedContent: Uint8Array;
  sealMetadata: {
    policyId: string;
    nftType: string;
    timestamp: number;
    version: string;
    packageId: string;
    id: string;
    threshold: number;
  };
}

export interface DecryptedMemoryData {
  content: string;
  metadata: {
    decryptedAt: number;
    policyId: string;
  };
}

// Cache for decrypted data
class MemoryDecryptionCache {
  private cache = new Map<string, { data: string; timestamp: number; }>();
  private readonly ttl = SEAL_CONFIG.cache.ttl;
  private readonly maxSize = SEAL_CONFIG.cache.maxSize;

  set(key: string, data: string): void {
    if (!SEAL_CONFIG.cache.enabled) return;

    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanOldEntries();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): string | null {
    if (!SEAL_CONFIG.cache.enabled) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanOldEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export class SealService {
  private client: SealClient | null = null;
  private cache = new MemoryDecryptionCache();
  private suiClient: SealCompatibleClient | null = null;
  
  constructor() {
    // Don't initialize on construction to avoid SSR issues
    this.client = null;
  }

  /**
   * Initialize the Seal client with SUI client (call this client-side only)
   */
  async initializeClient(suiClient: SealCompatibleClient): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        if (isDebugEnabled()) {
          console.log('Skipping Seal client initialization on server-side');
        }
        return;
      }

      // Validate configuration first
      if (!validateSealConfig()) {
        throw new Error('Invalid Seal configuration');
      }

      this.suiClient = suiClient;

      // Create server configs for the actual Seal SDK using MystenLabs key servers
      const serverConfigs: KeyServerConfig[] = SEAL_CONFIG.keyServers.map(server => ({
        objectId: server.objectId,
        weight: server.weight
        // Note: No API key needed for Open Mode testnet servers
      }));

      // Initialize Seal client with the correct API
      this.client = new SealClient({
        suiClient: suiClient,
        serverConfigs: serverConfigs,
        verifyKeyServers: true,
        timeout: 30000 // 30 seconds
      });

      if (isDebugEnabled()) {
        console.log('Seal client initialized successfully with SUI client');
      }
    } catch (error) {
      console.error('Failed to initialize Seal client:', error);
      // Don't throw error during initialization to prevent app failures
      this.client = null;
    }
  }

  /**
   * Check if client is initialized
   */
  private ensureInitialized(): void {
    if (!this.client) {
      throw new Error('Seal client not initialized. Call initializeClient() first with a SUI client.');
    }
  }

  /**
   * Encrypt memory content with policy-based access control
   */
  async encryptMemory(
    content: string,
    packageId: string,
    policyId: string,
    nftType: string,
    threshold: number = 1
  ): Promise<EncryptedMemoryData> {
    this.ensureInitialized();

    try {
      if (isDebugEnabled()) {
        console.log('Encrypting memory with policy:', policyId);
      }

      // Convert content to Uint8Array
      const data = new TextEncoder().encode(content);

      // Encrypt the content using the Seal SDK
      const encryptionResult = await this.client!.encrypt({
        threshold: threshold,
        packageId: packageId,
        id: policyId, // Use policy ID as the identity
        data: data,
        // Optional: add additional authenticated data
        // aad: new TextEncoder().encode(nftType)
      });

      const encryptedData: EncryptedMemoryData = {
        encryptedContent: encryptionResult.encryptedObject,
        sealMetadata: {
          policyId,
          nftType,
          timestamp: Date.now(),
          version: '1.0',
          packageId,
          id: policyId,
          threshold
        }
      };

      if (isDebugEnabled()) {
        console.log('Memory encrypted successfully');
      }

      return encryptedData;
    } catch (error) {
      console.error('Failed to encrypt memory:', error);
      throw new Error(`Memory encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt memory content (requires valid transaction with seal_approve call)
   */
  async decryptMemory(
    encryptedData: EncryptedMemoryData,
    sessionKey: SessionKey,
    txBytes: Uint8Array
  ): Promise<DecryptedMemoryData> {
    this.ensureInitialized();

    // Check cache first
    const cacheKey = `${encryptedData.sealMetadata.policyId}-${sessionKey}`;
    const cachedContent = this.cache.get(cacheKey);
    if (cachedContent) {
      if (isDebugEnabled()) {
        console.log('Returning cached decrypted memory');
      }
      
      return {
        content: cachedContent,
        metadata: {
          decryptedAt: Date.now(),
          policyId: encryptedData.sealMetadata.policyId
        }
      };
    }

    try {
      if (isDebugEnabled()) {
        console.log('Decrypting memory with session key');
      }

      // Decrypt the content using the Seal SDK
      const decryptedBytes = await this.client!.decrypt({
        data: encryptedData.encryptedContent,
        sessionKey: sessionKey,
        txBytes: txBytes,
        checkShareConsistency: true
      });

      // Convert bytes back to string
      const decryptedContent = new TextDecoder().decode(decryptedBytes);

      // Cache the decrypted content
      this.cache.set(cacheKey, decryptedContent);

      const decryptedData: DecryptedMemoryData = {
        content: decryptedContent,
        metadata: {
          decryptedAt: Date.now(),
          policyId: encryptedData.sealMetadata.policyId
        }
      };

      if (isDebugEnabled()) {
        console.log('Memory decrypted successfully');
      }

      return decryptedData;
    } catch (error) {
      console.error('Failed to decrypt memory:', error);
      throw new Error(`Memory decryption failed: ${error instanceof Error ? error.message : 'Access denied or invalid transaction'}`);
    }
  }

  /**
   * Fetch keys for decryption (should be called before decrypt operations)
   */
  async fetchKeys(
    ids: string[],
    sessionKey: SessionKey,
    txBytes: Uint8Array,
    threshold: number = 1
  ): Promise<void> {
    this.ensureInitialized();

    try {
      if (isDebugEnabled()) {
        console.log('Fetching keys for IDs:', ids);
      }

      await this.client!.fetchKeys({
        ids,
        sessionKey,
        txBytes,
        threshold
      });

      if (isDebugEnabled()) {
        console.log('Keys fetched successfully');
      }
    } catch (error) {
      console.error('Failed to fetch keys:', error);
      throw new Error(`Key fetching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a session key for the current user
   */
  createSessionKey(): SessionKey {
    try {
      const sessionKey = new SessionKey();
      if (isDebugEnabled()) {
        console.log('Session key created');
      }
      return sessionKey;
    } catch (error) {
      console.error('Failed to create session key:', error);
      throw new Error(`Session key creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear the decryption cache
   */
  clearCache(): void {
    this.cache.clear();
    
    if (isDebugEnabled()) {
      console.log('Decryption cache cleared');
    }
  }

  /**
   * Get client status and configuration info
   */
  getStatus(): {
    initialized: boolean;
    network: string;
    keyServers: string[];
    cacheEnabled: boolean;
  } {
    return {
      initialized: this.client !== null,
      network: SEAL_CONFIG.network,
      keyServers: SEAL_CONFIG.keyServers.map(server => server.url),
      cacheEnabled: SEAL_CONFIG.cache.enabled
    };
  }

  /**
   * Reinitialize the client
   */
  async reinitialize(suiClient: SealCompatibleClient): Promise<void> {
    this.client = null;
    this.cache.clear();
    await this.initializeClient(suiClient);
  }
}

// Note: Don't export singleton instance to avoid SSR issues
// Components should create their own instance and initialize with SUI client
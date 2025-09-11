import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionKey, type ExportedSessionKey } from '@mysten/seal';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export interface SessionKeyData {
  sessionKey: SessionKey;
  exportedKey: ExportedSessionKey;
  userAddress: string;
  packageId: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface CreateSessionRequest {
  userAddress: string;
  packageId?: string;
  ttlMinutes?: number;
}

export interface SignSessionRequest {
  userAddress: string;
  signature: string;
}

@Injectable()
export class SessionKeyService {
  private readonly logger = new Logger(SessionKeyService.name);
  private readonly sessionCache = new Map<string, SessionKeyData>();
  private readonly suiClient: SuiClient;
  private readonly defaultPackageId: string;
  private readonly defaultTtlMinutes: number;
  private readonly mvrName: string;

  constructor(private readonly configService: ConfigService) {
    // Initialize Sui client
    const network = this.configService.get<'mainnet' | 'testnet' | 'devnet'>('SEAL_NETWORK', 'testnet');
    this.suiClient = new SuiClient({
      url: this.configService.get<string>('SUI_RPC_URL', getFullnodeUrl(network))
    });

    // Configuration
    this.defaultPackageId = this.configService.get<string>('SEAL_PACKAGE_ID', '0xa2b73c54b9f354050462547787463e79f33b48fc6c1fea35673f12e3a535ec60');
    this.defaultTtlMinutes = this.configService.get<number>('SEAL_SESSION_TTL_MINUTES', 10);
    this.mvrName = this.configService.get<string>('SEAL_MVR_NAME', 'personal-data-wallet');

    // Clean up expired sessions every 5 minutes
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000);
  }

  /**
   * Create a new session key for a user
   * Returns the personal message that needs to be signed
   */
  async createSession(request: CreateSessionRequest): Promise<{ personalMessage: Uint8Array; sessionId: string }> {
    try {
      const packageId = request.packageId || this.defaultPackageId;
      const ttlMinutes = request.ttlMinutes || this.defaultTtlMinutes;

      this.logger.log(`Creating session for user ${request.userAddress} with package ${packageId}`);

      // Create new session key - using compatible client type
      const sessionKey = await SessionKey.create({
        address: request.userAddress,
        packageId: packageId,
        ttlMin: ttlMinutes,
        suiClient: this.suiClient as any, // Type assertion for compatibility
        mvrName: this.mvrName,
      });

      // Generate session ID
      const sessionId = this.generateSessionId(request.userAddress, packageId);

      // Store session data (without signature yet)
      const sessionData: SessionKeyData = {
        sessionKey,
        exportedKey: sessionKey.export(),
        userAddress: request.userAddress,
        packageId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + ttlMinutes * 60 * 1000),
      };

      this.sessionCache.set(sessionId, sessionData);

      this.logger.log(`Session created with ID: ${sessionId}`);

      return {
        personalMessage: sessionKey.getPersonalMessage(),
        sessionId,
      };
    } catch (error) {
      this.logger.error('Failed to create session', error);
      throw new Error(`Session creation failed: ${error.message}`);
    }
  }

  /**
   * Sign the session key with user's signature
   */
  async signSession(sessionId: string, request: SignSessionRequest): Promise<SessionKeyData> {
    try {
      const sessionData = this.sessionCache.get(sessionId);
      if (!sessionData) {
        throw new Error('Session not found or expired');
      }

      if (sessionData.userAddress !== request.userAddress) {
        throw new Error('Session user address mismatch');
      }

      this.logger.log(`Signing session ${sessionId} for user ${request.userAddress}`);

      // Set the signature on the session key
      await sessionData.sessionKey.setPersonalMessageSignature(request.signature);

      // Update the exported key with signature
      sessionData.exportedKey = sessionData.sessionKey.export();

      // Update cache
      this.sessionCache.set(sessionId, sessionData);

      this.logger.log(`Session ${sessionId} signed successfully`);

      return sessionData;
    } catch (error) {
      this.logger.error('Failed to sign session', error);
      throw new Error(`Session signing failed: ${error.message}`);
    }
  }

  /**
   * Get an active session key for a user
   */
  async getSessionKey(userAddress: string, packageId?: string): Promise<SessionKey | null> {
    try {
      const sessionId = this.generateSessionId(userAddress, packageId || this.defaultPackageId);
      const sessionData = this.sessionCache.get(sessionId);

      if (!sessionData) {
        this.logger.debug(`No session found for user ${userAddress}`);
        return null;
      }

      // Check if session is expired
      if (sessionData.sessionKey.isExpired() || new Date() > sessionData.expiresAt) {
        this.logger.debug(`Session expired for user ${userAddress}`);
        this.sessionCache.delete(sessionId);
        return null;
      }

      // Verify session belongs to the user
      if (sessionData.sessionKey.getAddress() !== userAddress) {
        this.logger.warn(`Session address mismatch for user ${userAddress}`);
        this.sessionCache.delete(sessionId);
        return null;
      }

      this.logger.debug(`Retrieved valid session for user ${userAddress}`);
      return sessionData.sessionKey;
    } catch (error) {
      this.logger.error('Failed to get session key', error);
      return null;
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<{
    exists: boolean;
    signed: boolean;
    expired: boolean;
    userAddress?: string;
    expiresAt?: Date;
  }> {
    const sessionData = this.sessionCache.get(sessionId);
    
    if (!sessionData) {
      return { exists: false, signed: false, expired: false };
    }

    const isExpired = sessionData.sessionKey.isExpired() || new Date() > sessionData.expiresAt;
    const isSigned = !!(sessionData.exportedKey as any).signature;

    return {
      exists: true,
      signed: isSigned,
      expired: isExpired,
      userAddress: sessionData.userAddress,
      expiresAt: sessionData.expiresAt,
    };
  }

  /**
   * Import a session key from exported data
   */
  async importSessionKey(exportedKey: ExportedSessionKey): Promise<SessionKey | null> {
    try {
      const sessionKey = await SessionKey.import(exportedKey, this.suiClient as any);
      
      if (sessionKey.isExpired()) {
        this.logger.debug('Imported session key is expired');
        return null;
      }

      return sessionKey;
    } catch (error) {
      this.logger.error('Failed to import session key', error);
      return null;
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;

    for (const [sessionId, sessionData] of this.sessionCache.entries()) {
      if (sessionData.sessionKey.isExpired() || now > sessionData.expiresAt) {
        this.sessionCache.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} expired sessions`);
    }
  }

  /**
   * Generate a consistent session ID for a user and package
   */
  private generateSessionId(userAddress: string, packageId: string): string {
    return `${userAddress}:${packageId}`;
  }

  /**
   * Get session cache stats (for debugging)
   */
  getStats(): { totalSessions: number; activeSessions: number } {
    const now = new Date();
    let activeSessions = 0;

    for (const sessionData of this.sessionCache.values()) {
      if (!sessionData.sessionKey.isExpired() && now <= sessionData.expiresAt) {
        activeSessions++;
      }
    }

    return {
      totalSessions: this.sessionCache.size,
      activeSessions,
    };
  }
}

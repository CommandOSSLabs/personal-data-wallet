import { ConfigService } from '@nestjs/config';
import { SessionKey, type ExportedSessionKey } from '@mysten/seal';
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
export declare class SessionKeyService {
    private readonly configService;
    private readonly logger;
    private readonly sessionCache;
    private readonly suiClient;
    private readonly defaultPackageId;
    private readonly defaultTtlMinutes;
    private readonly mvrName;
    constructor(configService: ConfigService);
    createSession(request: CreateSessionRequest): Promise<{
        personalMessage: Uint8Array;
        sessionId: string;
    }>;
    signSession(sessionId: string, request: SignSessionRequest): Promise<SessionKeyData>;
    getSessionKey(userAddress: string, packageId?: string): Promise<SessionKey | null>;
    getSessionStatus(sessionId: string): Promise<{
        exists: boolean;
        signed: boolean;
        expired: boolean;
        userAddress?: string;
        expiresAt?: Date;
    }>;
    importSessionKey(exportedKey: ExportedSessionKey): Promise<SessionKey | null>;
    private cleanupExpiredSessions;
    private generateSessionId;
    getStats(): {
        totalSessions: number;
        activeSessions: number;
    };
}

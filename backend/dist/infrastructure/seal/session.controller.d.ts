import { SessionKeyService } from './session-key.service';
export declare class CreateSessionDto {
    userAddress: string;
    packageId?: string;
    ttlMinutes?: number;
}
export declare class SignSessionDto {
    userAddress: string;
    signature: string;
}
export declare class SessionStatusResponse {
    exists: boolean;
    signed: boolean;
    expired: boolean;
    userAddress?: string;
    expiresAt?: Date;
}
export declare class CreateSessionResponse {
    sessionId: string;
    personalMessage: string;
    expiresAt: Date;
}
export declare class SessionController {
    private readonly sessionKeyService;
    private readonly logger;
    constructor(sessionKeyService: SessionKeyService);
    createSession(createSessionDto: CreateSessionDto): Promise<CreateSessionResponse>;
    signSession(sessionId: string, signSessionDto: SignSessionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    getSessionStatus(sessionId: string): Promise<SessionStatusResponse>;
    getSessionStats(): Promise<{
        totalSessions: number;
        activeSessions: number;
    }>;
    healthCheck(): Promise<{
        status: string;
        timestamp: string;
    }>;
}

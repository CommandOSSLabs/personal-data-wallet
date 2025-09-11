import { Controller, Post, Get, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SessionKeyService, CreateSessionRequest, SignSessionRequest } from './session-key.service';

export class CreateSessionDto {
  userAddress: string;
  packageId?: string;
  ttlMinutes?: number;
}

export class SignSessionDto {
  userAddress: string;
  signature: string;
}

export class SessionStatusResponse {
  exists: boolean;
  signed: boolean;
  expired: boolean;
  userAddress?: string;
  expiresAt?: Date;
}

export class CreateSessionResponse {
  sessionId: string;
  personalMessage: string; // Base64 encoded for easy transport
  expiresAt: Date;
}

@Controller('api/seal/session')
export class SessionController {
  private readonly logger = new Logger(SessionController.name);

  constructor(private readonly sessionKeyService: SessionKeyService) {}

  /**
   * Create a new session key for a user
   * POST /api/seal/session/request
   */
  @Post('request')
  async createSession(@Body() createSessionDto: CreateSessionDto): Promise<CreateSessionResponse> {
    try {
      this.logger.log(`Creating session for user: ${createSessionDto.userAddress}`);

      const request: CreateSessionRequest = {
        userAddress: createSessionDto.userAddress,
        packageId: createSessionDto.packageId,
        ttlMinutes: createSessionDto.ttlMinutes,
      };

      const result = await this.sessionKeyService.createSession(request);

      // Calculate expiration time
      const ttlMinutes = createSessionDto.ttlMinutes || 10;
      const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

      return {
        sessionId: result.sessionId,
        personalMessage: Buffer.from(result.personalMessage).toString('base64'),
        expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to create session', error);
      throw new HttpException(
        `Failed to create session: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Sign a session key with user's signature
   * POST /api/seal/session/verify
   */
  @Post('verify/:sessionId')
  async signSession(
    @Param('sessionId') sessionId: string,
    @Body() signSessionDto: SignSessionDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Signing session ${sessionId} for user: ${signSessionDto.userAddress}`);

      const request: SignSessionRequest = {
        userAddress: signSessionDto.userAddress,
        signature: signSessionDto.signature,
      };

      await this.sessionKeyService.signSession(sessionId, request);

      return {
        success: true,
        message: 'Session signed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to sign session', error);
      throw new HttpException(
        `Failed to sign session: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get session status
   * GET /api/seal/session/status/:sessionId
   */
  @Get('status/:sessionId')
  async getSessionStatus(@Param('sessionId') sessionId: string): Promise<SessionStatusResponse> {
    try {
      const status = await this.sessionKeyService.getSessionStatus(sessionId);
      return status;
    } catch (error) {
      this.logger.error('Failed to get session status', error);
      throw new HttpException(
        `Failed to get session status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get session statistics (for debugging)
   * GET /api/seal/session/stats
   */
  @Get('stats')
  async getSessionStats(): Promise<{ totalSessions: number; activeSessions: number }> {
    try {
      return this.sessionKeyService.getStats();
    } catch (error) {
      this.logger.error('Failed to get session stats', error);
      throw new HttpException(
        `Failed to get session stats: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check endpoint
   * GET /api/seal/session/health
   */
  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

import { Controller, Get, Post, Body, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SealService } from './seal.service';
import { SessionKeyService } from './session-key.service';

export interface SealAnalytics {
  overview: {
    totalSessions: number;
    activeSessions: number;
    totalEncryptions: number;
    totalDecryptions: number;
    totalErrors: number;
  };
  sessionStats: {
    averageSessionDuration: number;
    sessionsToday: number;
    sessionsThisWeek: number;
    sessionsThisMonth: number;
  };
  encryptionStats: {
    encryptionsByType: Record<string, number>;
    encryptionsToday: number;
    encryptionsThisWeek: number;
    encryptionsThisMonth: number;
  };
  errorStats: {
    errorsByType: Record<string, number>;
    errorsToday: number;
    errorsThisWeek: number;
    errorsThisMonth: number;
  };
  performanceMetrics: {
    averageEncryptionTime: number;
    averageDecryptionTime: number;
    averageSessionCreationTime: number;
  };
}

export interface SealEvent {
  id: string;
  type: 'session_created' | 'session_expired' | 'encryption' | 'decryption' | 'error';
  userAddress: string;
  timestamp: string;
  metadata: Record<string, any>;
  duration?: number;
  success: boolean;
}

@Controller('api/seal/analytics')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);
  private events: SealEvent[] = []; // In-memory storage for demo
  private metrics = {
    totalSessions: 0,
    totalEncryptions: 0,
    totalDecryptions: 0,
    totalErrors: 0
  };

  constructor(
    private readonly sealService: SealService,
    private readonly sessionKeyService: SessionKeyService
  ) {
    // Initialize with some sample data for demo
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const now = new Date();
    const sampleEvents: Partial<SealEvent>[] = [
      {
        type: 'session_created',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
        metadata: { sessionId: 'session_123', ttl: 1800 },
        duration: 150,
        success: true
      },
      {
        type: 'encryption',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
        metadata: { identityId: 'memory_456', type: 'self' },
        duration: 250,
        success: true
      },
      {
        type: 'decryption',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        metadata: { identityId: 'memory_456', type: 'self' },
        duration: 180,
        success: true
      },
      {
        type: 'error',
        userAddress: '0x1234567890abcdef1234567890abcdef12345678',
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
        metadata: { error: 'Session expired', operation: 'decryption' },
        success: false
      }
    ];

    sampleEvents.forEach((event, index) => {
      const fullEvent: SealEvent = {
        id: `event_${Date.now()}_${index}`,
        type: event.type!,
        userAddress: event.userAddress!,
        timestamp: event.timestamp!,
        metadata: event.metadata!,
        duration: event.duration,
        success: event.success!
      };
      this.events.push(fullEvent);
    });

    // Update metrics
    this.updateMetrics();
  }

  private updateMetrics() {
    this.metrics.totalSessions = this.events.filter(e => e.type === 'session_created').length;
    this.metrics.totalEncryptions = this.events.filter(e => e.type === 'encryption').length;
    this.metrics.totalDecryptions = this.events.filter(e => e.type === 'decryption').length;
    this.metrics.totalErrors = this.events.filter(e => e.type === 'error').length;
  }

  /**
   * Get comprehensive analytics
   * GET /api/seal/analytics/:userAddress
   */
  @Get(':userAddress')
  async getAnalytics(@Param('userAddress') userAddress: string): Promise<SealAnalytics> {
    try {
      const userEvents = this.events.filter(e => e.userAddress === userAddress);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Overview stats
      const totalSessions = userEvents.filter(e => e.type === 'session_created').length;
      const activeSessions = await this.getActiveSessionsCount(userAddress);
      const totalEncryptions = userEvents.filter(e => e.type === 'encryption').length;
      const totalDecryptions = userEvents.filter(e => e.type === 'decryption').length;
      const totalErrors = userEvents.filter(e => e.type === 'error').length;

      // Session stats
      const sessionEvents = userEvents.filter(e => e.type === 'session_created');
      const averageSessionDuration = sessionEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / sessionEvents.length || 0;
      const sessionsToday = sessionEvents.filter(e => new Date(e.timestamp) >= today).length;
      const sessionsThisWeek = sessionEvents.filter(e => new Date(e.timestamp) >= thisWeek).length;
      const sessionsThisMonth = sessionEvents.filter(e => new Date(e.timestamp) >= thisMonth).length;

      // Encryption stats
      const encryptionEvents = userEvents.filter(e => e.type === 'encryption');
      const encryptionsByType = encryptionEvents.reduce((acc, e) => {
        const type = e.metadata.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const encryptionsToday = encryptionEvents.filter(e => new Date(e.timestamp) >= today).length;
      const encryptionsThisWeek = encryptionEvents.filter(e => new Date(e.timestamp) >= thisWeek).length;
      const encryptionsThisMonth = encryptionEvents.filter(e => new Date(e.timestamp) >= thisMonth).length;

      // Error stats
      const errorEvents = userEvents.filter(e => e.type === 'error');
      const errorsByType = errorEvents.reduce((acc, e) => {
        const type = e.metadata.error || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const errorsToday = errorEvents.filter(e => new Date(e.timestamp) >= today).length;
      const errorsThisWeek = errorEvents.filter(e => new Date(e.timestamp) >= thisWeek).length;
      const errorsThisMonth = errorEvents.filter(e => new Date(e.timestamp) >= thisMonth).length;

      // Performance metrics
      const encryptionTimes = encryptionEvents.filter(e => e.duration).map(e => e.duration!);
      const decryptionEvents = userEvents.filter(e => e.type === 'decryption');
      const decryptionTimes = decryptionEvents.filter(e => e.duration).map(e => e.duration!);
      const sessionCreationTimes = sessionEvents.filter(e => e.duration).map(e => e.duration!);

      const averageEncryptionTime = encryptionTimes.reduce((sum, time) => sum + time, 0) / encryptionTimes.length || 0;
      const averageDecryptionTime = decryptionTimes.reduce((sum, time) => sum + time, 0) / decryptionTimes.length || 0;
      const averageSessionCreationTime = sessionCreationTimes.reduce((sum, time) => sum + time, 0) / sessionCreationTimes.length || 0;

      return {
        overview: {
          totalSessions,
          activeSessions,
          totalEncryptions,
          totalDecryptions,
          totalErrors
        },
        sessionStats: {
          averageSessionDuration,
          sessionsToday,
          sessionsThisWeek,
          sessionsThisMonth
        },
        encryptionStats: {
          encryptionsByType,
          encryptionsToday,
          encryptionsThisWeek,
          encryptionsThisMonth
        },
        errorStats: {
          errorsByType,
          errorsToday,
          errorsThisWeek,
          errorsThisMonth
        },
        performanceMetrics: {
          averageEncryptionTime,
          averageDecryptionTime,
          averageSessionCreationTime
        }
      };
    } catch (error) {
      this.logger.error('Failed to get analytics', error);
      throw new HttpException(
        'Failed to get analytics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get recent events
   * GET /api/seal/analytics/:userAddress/events
   */
  @Get(':userAddress/events')
  async getRecentEvents(
    @Param('userAddress') userAddress: string
  ): Promise<{ events: SealEvent[]; total: number }> {
    try {
      const userEvents = this.events
        .filter(e => e.userAddress === userAddress)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50); // Last 50 events

      return {
        events: userEvents,
        total: userEvents.length
      };
    } catch (error) {
      this.logger.error('Failed to get recent events', error);
      throw new HttpException(
        'Failed to get recent events',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Log a new event
   * POST /api/seal/analytics/event
   */
  @Post('event')
  async logEvent(@Body() dto: {
    type: SealEvent['type'];
    userAddress: string;
    metadata: Record<string, any>;
    duration?: number;
    success: boolean;
  }): Promise<{ success: boolean; eventId: string }> {
    try {
      const event: SealEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: dto.type,
        userAddress: dto.userAddress,
        timestamp: new Date().toISOString(),
        metadata: dto.metadata,
        duration: dto.duration,
        success: dto.success
      };

      this.events.push(event);
      this.updateMetrics();

      // Keep only last 1000 events to prevent memory issues
      if (this.events.length > 1000) {
        this.events = this.events.slice(-1000);
      }

      this.logger.log(`Logged event: ${event.type} for user ${dto.userAddress}`);
      return {
        success: true,
        eventId: event.id
      };
    } catch (error) {
      this.logger.error('Failed to log event', error);
      throw new HttpException(
        'Failed to log event',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Get system-wide metrics
   * GET /api/seal/analytics/system/metrics
   */
  @Get('system/metrics')
  async getSystemMetrics(): Promise<{
    totalUsers: number;
    totalEvents: number;
    metrics: typeof this.metrics;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  }> {
    try {
      const uniqueUsers = new Set(this.events.map(e => e.userAddress)).size;
      const uptime = process.uptime();
      const memoryUsage = process.memoryUsage();

      return {
        totalUsers: uniqueUsers,
        totalEvents: this.events.length,
        metrics: this.metrics,
        uptime,
        memoryUsage
      };
    } catch (error) {
      this.logger.error('Failed to get system metrics', error);
      throw new HttpException(
        'Failed to get system metrics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get health status
   * GET /api/seal/analytics/health
   */
  @Get('health')
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: string;
  }> {
    try {
      const checks = {
        sealService: true, // Would check actual service health
        sessionService: true, // Would check actual service health
        database: true, // Would check database connection
        keyServers: true, // Would check key server connectivity
      };

      const allHealthy = Object.values(checks).every(check => check);
      const status = allHealthy ? 'healthy' : 'degraded';

      return {
        status,
        checks,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error('Failed to get health status', error);
      return {
        status: 'unhealthy',
        checks: {
          sealService: false,
          sessionService: false,
          database: false,
          keyServers: false,
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  private async getActiveSessionsCount(userAddress: string): Promise<number> {
    try {
      // This would check actual active sessions from SessionKeyService
      // For demo, return a mock value
      return Math.floor(Math.random() * 3) + 1;
    } catch (error) {
      return 0;
    }
  }
}

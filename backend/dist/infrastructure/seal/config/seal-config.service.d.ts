import { ConfigService } from '@nestjs/config';
import { SealConfig, SealKeyServer, SealHealthCheck } from '../interfaces/seal.interfaces';
export declare class SealConfigService {
    private configService;
    private readonly logger;
    private config;
    private healthChecks;
    constructor(configService: ConfigService);
    private loadConfiguration;
    private validateConfiguration;
    getConfig(): SealConfig;
    getActiveKeyServers(): SealKeyServer[];
    getKeyServersByMode(mode: 'open' | 'permissioned'): SealKeyServer[];
    updateKeyServerStatus(serverId: string, isActive: boolean): void;
    recordHealthCheck(serverId: string, url: string, isHealthy: boolean, responseTime?: number, error?: string): void;
    getHealthChecks(): SealHealthCheck[];
    getHealthCheck(serverId: string): SealHealthCheck | undefined;
    isThresholdMet(): boolean;
    getRecommendedKeyServers(): SealKeyServer[];
    reloadConfiguration(): void;
}

export interface SealOpenModeConfig {
    network: 'mainnet' | 'testnet' | 'devnet';
    threshold: number;
    sessionTtlMin: number;
    keyServers: {
        useAllowlisted: boolean;
        customServerIds?: string[];
        verifyServers: boolean;
    };
    suiRpc: {
        customUrl?: string;
    };
    openMode: {
        allowAnyPackage: boolean;
        enableDetailedLogging: boolean;
        cache: {
            maxSessionKeys: number;
            sessionKeyCacheTtl: number;
        };
        rateLimiting?: {
            enabled: boolean;
            maxRequestsPerMinute: number;
            maxRequestsPerHour: number;
        };
    };
}
export declare const defaultOpenModeConfig: SealOpenModeConfig;
export declare const productionOpenModeConfig: SealOpenModeConfig;
export declare function getOpenModeConfig(env?: string): SealOpenModeConfig;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionOpenModeConfig = exports.defaultOpenModeConfig = void 0;
exports.getOpenModeConfig = getOpenModeConfig;
exports.defaultOpenModeConfig = {
    network: 'testnet',
    threshold: 2,
    sessionTtlMin: 60,
    keyServers: {
        useAllowlisted: true,
        verifyServers: false,
    },
    suiRpc: {},
    openMode: {
        allowAnyPackage: true,
        enableDetailedLogging: true,
        cache: {
            maxSessionKeys: 1000,
            sessionKeyCacheTtl: 60,
        },
    },
};
exports.productionOpenModeConfig = {
    network: 'mainnet',
    threshold: 3,
    sessionTtlMin: 30,
    keyServers: {
        useAllowlisted: false,
        customServerIds: [],
        verifyServers: false,
    },
    suiRpc: {},
    openMode: {
        allowAnyPackage: true,
        enableDetailedLogging: false,
        cache: {
            maxSessionKeys: 10000,
            sessionKeyCacheTtl: 30,
        },
        rateLimiting: {
            enabled: true,
            maxRequestsPerMinute: 100,
            maxRequestsPerHour: 1000,
        },
    },
};
function getOpenModeConfig(env = 'development') {
    switch (env) {
        case 'production':
            return exports.productionOpenModeConfig;
        case 'development':
        case 'test':
        default:
            return exports.defaultOpenModeConfig;
    }
}
//# sourceMappingURL=seal-open-mode.config.js.map
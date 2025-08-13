"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SealConfigService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SealConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const seal_exceptions_1 = require("../exceptions/seal.exceptions");
let SealConfigService = SealConfigService_1 = class SealConfigService {
    configService;
    logger = new common_1.Logger(SealConfigService_1.name);
    config;
    healthChecks = new Map();
    constructor(configService) {
        this.configService = configService;
        this.config = this.loadConfiguration();
        this.validateConfiguration();
    }
    loadConfiguration() {
        try {
            const environment = this.configService.get('SEAL_ENVIRONMENT', 'testnet');
            const threshold = this.configService.get('SEAL_THRESHOLD', 2);
            const keyServers = [];
            if (environment === 'testnet') {
                const mysten1Url = this.configService.get('SEAL_MYSTEN_1_URL');
                const mysten2Url = this.configService.get('SEAL_MYSTEN_2_URL');
                if (mysten1Url) {
                    keyServers.push({
                        id: 'mysten-testnet-1',
                        url: mysten1Url,
                        isActive: true,
                        mode: 'open'
                    });
                }
                if (mysten2Url) {
                    keyServers.push({
                        id: 'mysten-testnet-2',
                        url: mysten2Url,
                        isActive: true,
                        mode: 'open'
                    });
                }
                const rubyUrl = this.configService.get('SEAL_RUBY_URL');
                const rubyObjectId = this.configService.get('SEAL_RUBY_OBJECT_ID');
                if (rubyUrl && rubyObjectId) {
                    keyServers.push({
                        id: 'ruby-nodes',
                        url: rubyUrl,
                        objectId: rubyObjectId,
                        isActive: true,
                        mode: 'open'
                    });
                }
                const nodeInfraUrl = this.configService.get('SEAL_NODEINFRA_URL');
                const nodeInfraObjectId = this.configService.get('SEAL_NODEINFRA_OBJECT_ID');
                if (nodeInfraUrl && nodeInfraObjectId) {
                    keyServers.push({
                        id: 'nodeinfra',
                        url: nodeInfraUrl,
                        objectId: nodeInfraObjectId,
                        isActive: true,
                        mode: 'open'
                    });
                }
            }
            return {
                environment,
                keyServers,
                threshold,
                keyCache: {
                    ttl: this.configService.get('SEAL_KEY_CACHE_TTL', 3600000),
                    maxSize: this.configService.get('SEAL_KEY_CACHE_MAX_SIZE', 1000)
                },
                batch: {
                    size: this.configService.get('SEAL_BATCH_SIZE', 50),
                    flushInterval: this.configService.get('SEAL_BATCH_FLUSH_INTERVAL', 10000)
                },
                timeout: this.configService.get('SEAL_TIMEOUT', 30000),
                pdwPackageId: this.configService.get('PDW_PACKAGE_OBJECT_ID', ''),
                verifyKeyServers: this.configService.get('SEAL_VERIFY_KEY_SERVERS', false)
            };
        }
        catch (error) {
            this.logger.error(`Failed to load Seal configuration: ${error.message}`);
            throw new seal_exceptions_1.SealConfigurationException('Failed to load Seal configuration from environment variables', error);
        }
    }
    validateConfiguration() {
        if (this.config.keyServers.length === 0) {
            throw new seal_exceptions_1.SealConfigurationException('No key servers configured. At least one key server is required.');
        }
        if (this.config.threshold > this.config.keyServers.length) {
            throw new seal_exceptions_1.SealConfigurationException(`Threshold (${this.config.threshold}) cannot be greater than the number of key servers (${this.config.keyServers.length})`);
        }
        if (this.config.threshold < 1) {
            throw new seal_exceptions_1.SealConfigurationException('Threshold must be at least 1');
        }
        if (!this.config.pdwPackageId) {
            this.logger.warn('PDW package ID not configured. This may affect access control.');
        }
        this.logger.log(`Seal configuration validated: ${this.config.keyServers.length} key servers, threshold: ${this.config.threshold}`);
    }
    getConfig() {
        return { ...this.config };
    }
    getActiveKeyServers() {
        return this.config.keyServers.filter(server => server.isActive);
    }
    getKeyServersByMode(mode) {
        return this.config.keyServers.filter(server => server.mode === mode && server.isActive);
    }
    updateKeyServerStatus(serverId, isActive) {
        const server = this.config.keyServers.find(s => s.id === serverId);
        if (server) {
            server.isActive = isActive;
            this.logger.log(`Key server ${serverId} status updated: ${isActive ? 'active' : 'inactive'}`);
            const activeServers = this.getActiveKeyServers().length;
            if (activeServers < this.config.threshold) {
                this.logger.warn(`Warning: Only ${activeServers} active key servers, but threshold is ${this.config.threshold}`);
            }
        }
    }
    recordHealthCheck(serverId, url, isHealthy, responseTime, error) {
        const healthCheck = {
            keyServerId: serverId,
            url,
            isHealthy,
            responseTime,
            lastChecked: Date.now(),
            error
        };
        this.healthChecks.set(serverId, healthCheck);
        this.updateKeyServerStatus(serverId, isHealthy);
    }
    getHealthChecks() {
        return Array.from(this.healthChecks.values());
    }
    getHealthCheck(serverId) {
        return this.healthChecks.get(serverId);
    }
    isThresholdMet() {
        const activeServers = this.getActiveKeyServers().length;
        return activeServers >= this.config.threshold;
    }
    getRecommendedKeyServers() {
        const activeServers = this.getActiveKeyServers();
        if (activeServers.length < this.config.threshold) {
            throw new seal_exceptions_1.SealConfigurationException(`Insufficient active key servers (${activeServers.length}) to meet threshold (${this.config.threshold})`);
        }
        const sortedServers = activeServers.sort((a, b) => {
            const healthA = this.healthChecks.get(a.id);
            const healthB = this.healthChecks.get(b.id);
            if (healthA?.isHealthy !== healthB?.isHealthy) {
                return (healthB?.isHealthy ? 1 : 0) - (healthA?.isHealthy ? 1 : 0);
            }
            if (healthA?.responseTime && healthB?.responseTime) {
                return healthA.responseTime - healthB.responseTime;
            }
            return 0;
        });
        return sortedServers.slice(0, this.config.threshold);
    }
    reloadConfiguration() {
        try {
            const newConfig = this.loadConfiguration();
            this.config = newConfig;
            this.validateConfiguration();
            this.logger.log('Seal configuration reloaded successfully');
        }
        catch (error) {
            this.logger.error(`Failed to reload configuration: ${error.message}`);
            throw error;
        }
    }
};
exports.SealConfigService = SealConfigService;
exports.SealConfigService = SealConfigService = SealConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SealConfigService);
//# sourceMappingURL=seal-config.service.js.map
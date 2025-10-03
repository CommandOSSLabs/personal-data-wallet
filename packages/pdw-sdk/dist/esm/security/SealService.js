/**
 * SEAL Service Integration
 *
 * Production-ready SEAL service wrapper with comprehensive error handling,
 * session management, and performance analytics integration.
 */
import { Transaction } from '@mysten/sui/transactions';
import { fromHex, toHex } from '@mysten/sui/utils';
import { SealClient, SessionKey, EncryptedObject } from '@mysten/seal';
/**
 * SEAL Service - Production Implementation
 */
export class SealService {
    constructor(config) {
        this.sealClient = null;
        this.sessionKey = null;
        this.performanceMetrics = [];
        this.activeSessions = new Map();
        this.config = config;
        console.log('✅ SEAL SDK components loaded successfully');
    }
    /**
     * Initialize SEAL client with retry logic
     */
    async initializeClient() {
        const metric = this.startMetric('seal_client_init');
        try {
            // Configure server configs from testnet servers
            const serverConfigs = this.config.keyServerObjectIds.map((objectId, index) => ({
                objectId,
                weight: 1
            }));
            const sealClientOptions = {
                suiClient: this.config.suiClient,
                serverConfigs,
                verifyKeyServers: this.config.network === 'mainnet' // Only verify on mainnet
            };
            this.sealClient = new SealClient(sealClientOptions);
            this.completeMetric(metric, true, { serverCount: serverConfigs.length });
            console.log('✅ SEAL client initialized with', serverConfigs.length, 'servers');
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            throw new Error(`Failed to initialize SEAL client: ${error}`);
        }
    }
    /**
     * Create and manage session key
     */
    async createSession(config, signature) {
        const metric = this.startMetric('session_creation');
        try {
            const sessionKey = await SessionKey.create({
                address: config.address,
                packageId: config.packageId,
                ttlMin: config.ttlMin,
                suiClient: this.config.suiClient
            });
            const message = sessionKey.getPersonalMessage();
            // In production, signature would come from wallet
            if (signature) {
                // Convert Uint8Array to hex string if needed
                const signatureString = typeof signature === 'string' ? signature : toHex(signature);
                await sessionKey.setPersonalMessageSignature(signatureString);
            }
            // Store session for management
            this.activeSessions.set(config.address, {
                sessionKey,
                createdAt: Date.now(),
                ttl: config.ttlMin * 60 * 1000,
                address: config.address
            });
            this.completeMetric(metric, true, {
                address: config.address,
                ttlMin: config.ttlMin,
                messageLength: message.length
            });
            return { sessionKey, personalMessage: message };
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            throw new Error(`Failed to create session: ${error}`);
        }
    }
    /**
     * Encrypt data with comprehensive error handling
     */
    async encryptData(options) {
        const metric = this.startMetric('encryption');
        try {
            if (!this.sealClient) {
                await this.initializeClient();
            }
            if (!this.sealClient) {
                throw new Error('Failed to initialize SEAL client');
            }
            const threshold = options.threshold || this.config.threshold;
            // Validate threshold against available servers
            if (threshold > this.config.keyServerObjectIds.length) {
                throw new Error(`Threshold ${threshold} exceeds available servers ${this.config.keyServerObjectIds.length}`);
            }
            const result = await this.sealClient.encrypt({
                threshold,
                packageId: this.config.packageId,
                id: options.id,
                data: options.data
            });
            this.completeMetric(metric, true, {
                dataSize: options.data.length,
                threshold,
                encryptedSize: result.encryptedObject.length,
                keySize: result.key.length
            });
            return result;
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            // Enhanced error handling
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('threshold')) {
                throw new Error(`Encryption threshold error: ${errorMessage}`);
            }
            if (errorMessage.includes('network')) {
                throw new Error(`Network error during encryption: ${errorMessage}`);
            }
            throw new Error(`Encryption failed: ${errorMessage}`);
        }
    }
    /**
     * Decrypt data with session management
     */
    async decryptData(options) {
        const metric = this.startMetric('decryption');
        try {
            if (!this.sealClient) {
                await this.initializeClient();
            }
            if (!this.sealClient) {
                throw new Error('Failed to initialize SEAL client');
            }
            // Add detailed debugging for SEAL decryption
            console.log('🔍 SEAL decrypt parameters:');
            console.log(`   - Encrypted data type: ${typeof options.encryptedObject}`);
            console.log(`   - Encrypted data length: ${options.encryptedObject.length}`);
            console.log(`   - Session key type: ${typeof options.sessionKey}`);
            console.log(`   - Session key constructor: ${options.sessionKey?.constructor?.name}`);
            console.log(`   - Transaction bytes type: ${typeof options.txBytes}`);
            console.log(`   - Transaction bytes length: ${options.txBytes.length}`);
            // Check if session key has expected methods
            if (options.sessionKey) {
                console.log(`   - Session key methods: ${Object.getOwnPropertyNames(Object.getPrototypeOf(options.sessionKey)).join(', ')}`);
            }
            // Try SEAL decryption with error boundary
            let result;
            try {
                console.log('🔍 Attempting SEAL client decrypt...');
                result = await this.sealClient.decrypt({
                    data: options.encryptedObject,
                    sessionKey: options.sessionKey,
                    txBytes: options.txBytes
                });
                console.log('🔍 SEAL decrypt completed without throwing');
            }
            catch (innerError) {
                console.log('🔍 SEAL decrypt threw an error:', innerError);
                throw innerError;
            }
            console.log(`🔍 SEAL decrypt result:`, {
                result,
                resultType: typeof result,
                resultLength: result ? result.length : 'undefined',
                hasResult: !!result,
                isUint8Array: result instanceof Uint8Array
            });
            if (!result) {
                throw new Error('SEAL decrypt returned undefined/null result');
            }
            this.completeMetric(metric, true, {
                encryptedSize: options.encryptedObject.length,
                decryptedSize: result ? result.length : 0
            });
            return result;
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            // Enhanced error handling for decryption with detailed logging
            console.log('🚨 SEAL decrypt error details:', {
                error,
                errorType: typeof error,
                errorConstructor: error?.constructor?.name,
                errorMessage: error instanceof Error ? error.message : String(error),
                errorStack: error instanceof Error ? error.stack : 'No stack trace'
            });
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('access')) {
                throw new Error(`Access denied for decryption: ${errorMessage}`);
            }
            if (errorMessage.includes('session')) {
                throw new Error(`Session error during decryption: ${errorMessage}`);
            }
            throw new Error(`Decryption failed: ${errorMessage}`);
        }
    }
    /**
     * Create transaction for seal_approve (legacy - without app_id)
     * @deprecated Use createSealApproveTransactionWithAppId for OAuth-style permissions
     */
    async createSealApproveTransaction(id, userAddress, accessRegistry) {
        const metric = this.startMetric('transaction_creation');
        try {
            const tx = new Transaction();
            // Use the deployed AccessRegistry ID from environment or parameter
            const registryId = accessRegistry || process.env.ACCESS_REGISTRY_ID || "0x8088cc36468b53f210696f1c6b1a4de1b1666dd36a7c36f92c394ff1d342f6dd";
            // CRITICAL FIX: Match SEAL-compliant Move function signature
            // entry fun seal_approve(id: vector<u8>, registry: &AccessRegistry, clock: &Clock, ctx: &TxContext)
            tx.moveCall({
                target: `${this.config.packageId}::seal_access_control::seal_approve`,
                arguments: [
                    tx.pure.vector("u8", fromHex(id)), // FIXED: Use fromHex instead of text encoding
                    tx.object(registryId), // AccessRegistry reference
                    tx.object('0x6') // Clock object (system clock)
                ]
            });
            // Set the sender for the transaction
            tx.setSender(userAddress);
            const txBytes = await tx.build({
                client: this.config.suiClient,
                onlyTransactionKind: true
            });
            this.completeMetric(metric, true, {
                id,
                txSize: txBytes.length,
                registryId,
                clockId: '0x6'
            });
            return txBytes;
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create transaction: ${errorMessage}`);
        }
    }
    /**
     * Create transaction for seal_approve with app_id (OAuth-style permissions)
     *
     * This method builds a SEAL approval transaction that includes the requesting
     * application identifier, enabling OAuth-style permission validation where apps
     * must be explicitly granted access by users.
     *
     * @param contentId - Content identifier (identity bytes)
     * @param appId - Requesting application identifier
     * @param accessRegistry - Optional custom access registry ID
     * @returns Transaction object for SEAL approval
     */
    buildSealApproveTransactionWithAppId(contentId, appId, accessRegistry) {
        const metric = this.startMetric('transaction_creation_with_app_id');
        try {
            const tx = new Transaction();
            // Use the deployed AccessRegistry ID from environment or parameter
            const registryId = accessRegistry || process.env.ACCESS_REGISTRY_ID || "0x8088cc36468b53f210696f1c6b1a4de1b1666dd36a7c36f92c394ff1d342f6dd";
            // OAuth-style seal_approve with app_id parameter
            // entry fun seal_approve(id: vector<u8>, app_id: String, registry: &AccessRegistry, clock: &Clock, ctx: &TxContext)
            tx.moveCall({
                target: `${this.config.packageId}::seal_access_control::seal_approve`,
                arguments: [
                    tx.pure.vector('u8', Array.from(contentId)), // Content identifier
                    tx.pure.string(appId), // Requesting app identifier (OAuth-style)
                    tx.object(registryId), // AccessRegistry reference
                    tx.object('0x6') // Clock object (system clock)
                ]
            });
            this.completeMetric(metric, true, {
                appId,
                contentIdLength: contentId.length,
                registryId,
                clockId: '0x6'
            });
            return tx;
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to create transaction with app_id: ${errorMessage}`);
        }
    }
    /**
     * Parse encrypted object structure
     */
    parseEncryptedObject(encryptedBytes) {
        const metric = this.startMetric('object_parsing');
        try {
            const parsed = EncryptedObject.parse(encryptedBytes);
            this.completeMetric(metric, true, {
                version: parsed.version,
                packageId: parsed.packageId,
                threshold: parsed.threshold,
                dataSize: encryptedBytes.length
            });
            return parsed;
        }
        catch (error) {
            this.completeMetric(metric, false, undefined, error);
            throw new Error(`Failed to parse encrypted object: ${error}`);
        }
    }
    /**
     * Session management utilities
     */
    getActiveSession(address) {
        const session = this.activeSessions.get(address);
        if (!session)
            return null;
        // Check if session is expired
        const now = Date.now();
        if (now > session.createdAt + session.ttl) {
            this.activeSessions.delete(address);
            return null;
        }
        return session.sessionKey;
    }
    cleanupExpiredSessions() {
        const now = Date.now();
        let cleanedCount = 0;
        for (const [address, session] of this.activeSessions.entries()) {
            if (now > session.createdAt + session.ttl) {
                this.activeSessions.delete(address);
                cleanedCount++;
            }
        }
        console.log(`🧹 Cleaned up ${cleanedCount} expired sessions`);
        return cleanedCount;
    }
    getSessionStats() {
        const now = Date.now();
        let active = 0;
        let expired = 0;
        for (const session of this.activeSessions.values()) {
            if (now > session.createdAt + session.ttl) {
                expired++;
            }
            else {
                active++;
            }
        }
        return { total: this.activeSessions.size, active, expired };
    }
    /**
     * Performance metrics and analytics
     */
    startMetric(operation) {
        const metric = {
            operation,
            startTime: Date.now(),
            endTime: 0,
            duration: 0,
            success: false
        };
        return metric;
    }
    completeMetric(metric, success, metadata, error) {
        metric.endTime = Date.now();
        metric.duration = metric.endTime - metric.startTime;
        metric.success = success;
        metric.metadata = metadata;
        if (error) {
            metric.errorType = error.constructor.name;
        }
        this.performanceMetrics.push(metric);
        // Limit metrics storage to prevent memory leaks
        if (this.performanceMetrics.length > 1000) {
            this.performanceMetrics.splice(0, 500); // Keep last 500 metrics
        }
    }
    getPerformanceMetrics() {
        return [...this.performanceMetrics];
    }
    getPerformanceStats() {
        if (this.performanceMetrics.length === 0) {
            return { totalOperations: 0, averageTime: 0, successRate: 0 };
        }
        const successful = this.performanceMetrics.filter(m => m.success);
        const totalTime = this.performanceMetrics.reduce((sum, m) => sum + m.duration, 0);
        return {
            totalOperations: this.performanceMetrics.length,
            successfulOperations: successful.length,
            successRate: (successful.length / this.performanceMetrics.length) * 100,
            averageTime: totalTime / this.performanceMetrics.length,
            averageSuccessTime: successful.length > 0 ?
                successful.reduce((sum, m) => sum + m.duration, 0) / successful.length : 0,
            operationBreakdown: this.getOperationBreakdown()
        };
    }
    getOperationBreakdown() {
        const breakdown = {};
        for (const metric of this.performanceMetrics) {
            if (!breakdown[metric.operation]) {
                breakdown[metric.operation] = {
                    count: 0,
                    totalTime: 0,
                    successCount: 0,
                    avgTime: 0,
                    successRate: 0
                };
            }
            const op = breakdown[metric.operation];
            op.count++;
            op.totalTime += metric.duration;
            if (metric.success)
                op.successCount++;
        }
        // Calculate averages and rates
        for (const op of Object.values(breakdown)) {
            op.avgTime = op.totalTime / op.count;
            op.successRate = (op.successCount / op.count) * 100;
        }
        return breakdown;
    }
    /**
     * Health checks and diagnostics
     */
    async healthCheck() {
        const checks = {
            sealClientInitialized: !!this.sealClient,
            activeSessions: this.activeSessions.size,
            performanceMetrics: this.performanceMetrics.length,
            keyServers: this.config.keyServerObjectIds.length
        };
        // Test key server connectivity
        const serverHealth = await Promise.allSettled(this.config.keyServerUrls.map(async (url) => {
            const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
            return { url, status: response.status, ok: response.ok };
        }));
        const healthyServers = serverHealth.filter(result => result.status === 'fulfilled' && result.value.ok).length;
        let status;
        if (healthyServers === this.config.keyServerUrls.length) {
            status = 'healthy';
        }
        else if (healthyServers >= this.config.threshold) {
            status = 'degraded';
        }
        else {
            status = 'unhealthy';
        }
        return {
            status,
            details: {
                ...checks,
                serverHealth: {
                    total: this.config.keyServerUrls.length,
                    healthy: healthyServers,
                    threshold: this.config.threshold
                },
                performanceStats: this.getPerformanceStats()
            }
        };
    }
    /**
     * Configuration and utilities
     */
    getConfiguration() {
        return {
            packageId: this.config.packageId,
            network: this.config.network,
            threshold: this.config.threshold,
            enableMetrics: this.config.enableMetrics,
            retryAttempts: this.config.retryAttempts,
            timeoutMs: this.config.timeoutMs
        };
    }
    updateConfiguration(updates) {
        this.config = { ...this.config, ...updates };
        // Reinitialize client if critical settings changed
        if (updates.keyServerObjectIds || updates.suiClient) {
            this.sealClient = null;
        }
    }
}
//# sourceMappingURL=SealService.js.map
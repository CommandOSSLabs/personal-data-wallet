/**
 * Seal IBE encryption service server
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config.js';
import { SealClientWrapper } from './seal-client.js';
const app = express();
let sealClient;
// Middleware
app.use(helmet());
app.use(cors({
    origin: config.corsOrigin,
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
// Error handler middleware
const errorHandler = (error, req, res, next) => {
    console.error('Request error:', error);
    const errorResponse = {
        error: error.message,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        success: false
    };
    res.status(500).json(errorResponse);
};
// Initialize Seal client
const initializeSealClient = async () => {
    try {
        sealClient = new SealClientWrapper();
        console.log('Seal client initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize Seal client:', error);
        process.exit(1);
    }
};
// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const isHealthy = await sealClient.healthCheck();
        const serviceInfo = sealClient.getServiceInfo();
        res.json({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            service: 'seal-encryption-service',
            version: '1.0.0',
            keyServers: serviceInfo.keyServers,
            threshold: serviceInfo.threshold,
            network: serviceInfo.network
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
        });
    }
});
// Service info endpoint
app.get('/info', (req, res) => {
    const serviceInfo = sealClient.getServiceInfo();
    res.json({
        service: 'seal-encryption-service',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        ...serviceInfo
    });
});
// Encryption endpoint
app.post('/encrypt', async (req, res) => {
    try {
        const { data, identity, policy } = req.body;
        // Validation
        if (!data || !identity || !policy) {
            return res.status(400).json({
                error: 'Missing required fields: data, identity, policy',
                success: false,
                timestamp: new Date().toISOString()
            });
        }
        // Convert hex data to bytes
        const dataBytes = Buffer.from(data, 'hex');
        // Encrypt using Seal
        const encryptedResult = await sealClient.encrypt(dataBytes, identity);
        const response = {
            encrypted_data: encryptedResult.toString('base64'),
            servers_used: config.seal.keyServerIds.length,
            timestamp: new Date().toISOString(),
            success: true
        };
        console.log(`Encryption completed for identity: ${identity}`);
        res.json(response);
    }
    catch (error) {
        console.error('Encryption endpoint error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});
// Key request endpoint
app.post('/request-key', async (req, res) => {
    try {
        const keyRequest = req.body;
        // Validation
        if (!keyRequest.ibe_identity || !keyRequest.sui_ptb || !keyRequest.signature) {
            return res.status(400).json({
                error: 'Missing required fields: ibe_identity, sui_ptb, signature',
                success: false,
                timestamp: new Date().toISOString()
            });
        }
        // Validate access policy
        const isAuthorized = await sealClient.validateAccessPolicy(keyRequest);
        if (!isAuthorized) {
            return res.status(403).json({
                error: 'Access denied: invalid access policy or signature',
                success: false,
                timestamp: new Date().toISOString()
            });
        }
        // Create session key for decryption
        const sessionKey = await sealClient.createSessionKey(keyRequest.ibe_identity, keyRequest.sui_ptb, keyRequest.signature);
        const response = {
            decryption_key: sessionKey.toString('base64'),
            metadata: {
                identity: keyRequest.ibe_identity,
                servers_contacted: config.seal.keyServerIds.length,
                threshold_met: true,
                timestamp: new Date().toISOString()
            },
            success: true
        };
        console.log(`Session key created for identity: ${keyRequest.ibe_identity}`);
        res.json(response);
    }
    catch (error) {
        console.error('Key request endpoint error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});
// Decryption endpoint
app.post('/decrypt', async (req, res) => {
    try {
        const { encrypted_data, decryption_key, identity } = req.body;
        // Validation
        if (!encrypted_data || !decryption_key || !identity) {
            return res.status(400).json({
                error: 'Missing required fields: encrypted_data, decryption_key, identity',
                success: false,
                timestamp: new Date().toISOString()
            });
        }
        const encryptedBytes = Buffer.from(encrypted_data, 'base64');
        const keyBytes = Buffer.from(decryption_key, 'base64');
        // Decrypt using session key
        const decryptedData = await sealClient.decrypt(encryptedBytes, keyBytes);
        const response = {
            decrypted_data: decryptedData.toString('hex'),
            success: true
        };
        console.log(`Decryption completed for identity: ${identity}`);
        res.json(response);
    }
    catch (error) {
        console.error('Decryption endpoint error:', error);
        res.status(500).json({
            error: error instanceof Error ? error.message : String(error),
            success: false,
            timestamp: new Date().toISOString()
        });
    }
});
// Error handling middleware
app.use(errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
        success: false,
        timestamp: new Date().toISOString()
    });
});
// Start server
const startServer = async () => {
    try {
        await initializeSealClient();
        app.listen(config.port, () => {
            console.log(`🔒 Seal encryption service running on port ${config.port}`);
            console.log(`🌐 Environment: ${config.nodeEnv}`);
            console.log(`🔑 Key servers: ${config.seal.keyServerIds.length}`);
            console.log(`📊 Threshold: ${config.seal.threshold}`);
            console.log(`🚀 Ready to encrypt/decrypt data with Seal IBE`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});
startServer();

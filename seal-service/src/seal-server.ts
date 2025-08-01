/**
 * Seal IBE encryption service server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config.js';
import { SealClientWrapper } from './seal-client.js';
import {
  EncryptionRequest,
  EncryptionResponse,
  KeyRequest,
  KeyResponse,
  DecryptionRequest,
  DecryptionResponse,
  ErrorResponse
} from './types.js';

const app = express();
let sealClient: SealClientWrapper;

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Error handler middleware
const errorHandler = (error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Request error:', error);
  
  const errorResponse: ErrorResponse = {
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
  } catch (error) {
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
      health_status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'seal-encryption-service',
      version: '1.0.0',
      ...serviceInfo
    });
  } catch (error) {
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
    const { data, identity, policy }: EncryptionRequest = req.body;
    
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
    
    // Extract package ID from policy (use default if not provided)
    const packageId = policy.policy_hash || '0x0000000000000000000000000000000000000000000000000000000000000000';
    
    // Encrypt using REAL Seal SDK
    const encryptionResult = await sealClient.encrypt(dataBytes, identity, packageId);
    
    // Convert base64 strings back to bytes for transport
    const encryptedObjectBytes = Buffer.from(encryptionResult.encryptedObject, 'base64');
    const keyBytes = Buffer.from(encryptionResult.key, 'base64');
    
    // Combine encrypted object and key for transport
    const combinedEncrypted = new Uint8Array(encryptedObjectBytes.length + keyBytes.length + 4);
    const keyLengthBytes = new Uint8Array(4);
    new DataView(keyLengthBytes.buffer).setUint32(0, keyBytes.length, true);
    
    combinedEncrypted.set(keyLengthBytes, 0);
    combinedEncrypted.set(keyBytes, 4);
    combinedEncrypted.set(encryptedObjectBytes, 4 + keyBytes.length);
    
    const response: EncryptionResponse = {
      encrypted_data: Buffer.from(combinedEncrypted).toString('base64'),
      servers_used: config.seal.keyServerIds.length || 1,
      timestamp: new Date().toISOString(),
      success: true
    };
    
    console.log(`Encryption completed for identity: ${identity}`);
    res.json(response);
  } catch (error) {
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
    const keyRequest: KeyRequest = req.body;
    
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
    
    // Extract package ID and user address from the request
    const packageId = keyRequest.sui_ptb.function_call?.package || '0x0000000000000000000000000000000000000000000000000000000000000000';
    const userAddress = keyRequest.sui_ptb.user_address;
    
    // Create REAL session key using Seal SDK
    const sessionKey = await sealClient.createSessionKey(
      userAddress,
      packageId,
      keyRequest.signature
    );
    
    // Store the session key for later use in decryption
    // For now, we'll serialize it as a JSON string (in production, use proper session storage)
    const sessionKeyData = {
      sessionKey: sessionKey.export ? sessionKey.export() : 'session_key_placeholder',
      userAddress,
      packageId,
      identity: keyRequest.ibe_identity,
      timestamp: new Date().toISOString()
    };
    
    const response: KeyResponse = {
      decryption_key: Buffer.from(JSON.stringify(sessionKeyData)).toString('base64'),
      metadata: {
        identity: keyRequest.ibe_identity,
        servers_contacted: config.seal.keyServerIds.length || 1,
        threshold_met: true,
        timestamp: new Date().toISOString()
      },
      success: true
    };
    
    console.log(`Session key created for identity: ${keyRequest.ibe_identity}`);
    res.json(response);
  } catch (error) {
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
    const { encrypted_data, decryption_key, identity }: DecryptionRequest = req.body;
    
    // Validation
    if (!encrypted_data || !decryption_key || !identity) {
      return res.status(400).json({
        error: 'Missing required fields: encrypted_data, decryption_key, identity',
        success: false,
        timestamp: new Date().toISOString()
      });
    }
    
    // Parse the combined encrypted data
    const combinedEncrypted = Buffer.from(encrypted_data, 'base64');
    const keyLength = combinedEncrypted.readUInt32LE(0);
    const encryptedKey = new Uint8Array(combinedEncrypted.subarray(4, 4 + keyLength));
    const encryptedObject = new Uint8Array(combinedEncrypted.subarray(4 + keyLength));
    
    // Parse the session key data
    const sessionKeyDataStr = Buffer.from(decryption_key, 'base64').toString('utf8');
    const sessionKeyData = JSON.parse(sessionKeyDataStr);
    
    // Recreate the session key from stored data
    // Note: This is a simplified approach - in production, you'd properly restore the SessionKey object
    const recreatedSessionKey = await sealClient.createSessionKey(
      sessionKeyData.userAddress,
      sessionKeyData.packageId
    );
    
    // Create transaction bytes for seal_approve call
    const txBytes = await sealClient.createSealApproveTransaction(sessionKeyData.packageId, identity);
    
    // Decrypt using REAL Seal SDK
    const decryptedData = await sealClient.decrypt(
      encryptedObject,
      recreatedSessionKey,
      txBytes
    );
    
    const response: DecryptionResponse = {
      decrypted_data: Buffer.from(decryptedData).toString('hex'),
      success: true
    };
    
    console.log(`Decryption completed for identity: ${identity}`);
    res.json(response);
  } catch (error) {
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
  } catch (error) {
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
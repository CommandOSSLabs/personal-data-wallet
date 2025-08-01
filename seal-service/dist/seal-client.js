/**
 * Seal IBE client wrapper
 */
import { SealClient, SessionKey } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { fromHEX } from '@mysten/sui/utils';
import { Transaction } from '@mysten/sui/transactions';
import config from './config.js';
export class SealClientWrapper {
    sealClient;
    suiClient;
    config;
    constructor() {
        this.config = config.seal;
        // Initialize Sui client
        this.suiClient = new SuiClient({
            url: config.sui.rpcUrl
        });
        // Initialize Seal client - let SDK use default testnet servers if none configured
        const sealConfig = {
            suiClient: this.suiClient,
            verifyKeyServers: this.config.verifyKeyServers,
        };
        // Only add serverConfigs if we have specific server IDs
        if (this.config.keyServerIds.length > 0) {
            sealConfig.serverConfigs = this.config.keyServerIds.map(id => ({
                objectId: id,
                weight: 1,
            }));
        }
        this.sealClient = new SealClient(sealConfig);
        console.log(`Initialized Seal client with ${this.config.keyServerIds.length || 'default'} key servers, threshold: ${this.config.threshold}`);
    }
    /**
     * Encrypt data using real Seal IBE encryption
     */
    async encrypt(data, identity, packageId) {
        try {
            console.log(`Encrypting data (${data.length} bytes) with identity: ${identity} using REAL Seal IBE`);
            // Use default package ID if not provided (for testing)
            const defaultPackageId = '0x0000000000000000000000000000000000000000000000000000000000000000';
            const actualPackageId = packageId || defaultPackageId;
            // Convert identity string to hex bytes for Seal SDK
            const identityBytes = Buffer.from(identity, 'utf8');
            // Ensure package ID starts with 0x and is properly formatted
            const formattedPackageId = actualPackageId.startsWith('0x') ? actualPackageId : `0x${actualPackageId}`;
            console.log(`Using package ID: ${formattedPackageId}, identity: ${identity}, threshold: ${this.config.threshold}`);
            console.log(`Identity bytes length: ${identityBytes.length}`);
            console.log(`Package ID type: ${typeof formattedPackageId}, value: ${formattedPackageId}`);
            console.log(`About to call fromHEX with: ${formattedPackageId}`);
            // Test fromHEX call separately to debug the issue
            let packageIdBytes;
            try {
                packageIdBytes = fromHEX(formattedPackageId);
                console.log(`fromHEX succeeded, result length: ${packageIdBytes.length}`);
            }
            catch (error) {
                console.error(`fromHEX failed with package ID: ${formattedPackageId}`, error);
                throw error;
            }
            // Call real Seal SDK encryption - using any to bypass type issues
            const sealResult = await this.sealClient.encrypt({
                threshold: this.config.threshold,
                packageId: packageIdBytes,
                id: identityBytes,
                data: new Uint8Array(data),
            });
            // Extract the results and convert to base64 strings
            const encryptedObject = sealResult.encryptedObject;
            const key = sealResult.key;
            console.log(`REAL Seal encryption completed, encrypted size: ${encryptedObject.length} bytes, key size: ${key.length} bytes`);
            return {
                encryptedObject: Buffer.from(encryptedObject).toString('base64'),
                key: Buffer.from(key).toString('base64')
            };
        }
        catch (error) {
            console.error('Real Seal encryption failed:', error);
            throw new Error(`Real Seal encryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Create session key for decryption using real Seal SDK
     */
    async createSessionKey(userAddress, packageId, signature) {
        try {
            console.log(`Creating REAL Seal session key for user: ${userAddress}, package: ${packageId}`);
            // Create session key using real Seal SDK
            const sessionKey = await SessionKey.create({
                address: userAddress,
                packageId: fromHEX(packageId),
                ttlMin: 10, // 10 minute TTL
                suiClient: this.suiClient,
            });
            // If signature is provided, set it (for wallet-signed session keys)
            if (signature) {
                sessionKey.setPersonalMessageSignature(signature);
                console.log('Session key signature set successfully');
            }
            console.log('REAL Seal session key created successfully');
            return sessionKey;
        }
        catch (error) {
            console.error('Real Seal session key creation failed:', error);
            throw new Error(`Real Seal session key creation failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Decrypt data using real Seal SDK
     */
    async decrypt(encryptedData, sessionKey, txBytes) {
        try {
            console.log(`Decrypting data (${encryptedData.length} bytes) using REAL Seal IBE`);
            // Call real Seal SDK decryption
            const decryptedBytes = await this.sealClient.decrypt({
                data: encryptedData,
                sessionKey,
                txBytes, // Transaction bytes that call seal_approve functions
            });
            console.log(`REAL Seal decryption completed, size: ${decryptedBytes.length} bytes`);
            return Buffer.from(decryptedBytes);
        }
        catch (error) {
            console.error('Real Seal decryption failed:', error);
            throw new Error(`Real Seal decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Create a simple seal_approve transaction for testing
     */
    async createSealApproveTransaction(packageId, identity) {
        try {
            console.log(`Creating seal_approve transaction for package: ${packageId}, identity: ${identity}`);
            // Create a basic transaction that calls a seal_approve function
            const tx = new Transaction();
            // For testing, we'll create a minimal seal_approve call
            // In production, this would call your specific contract's seal_approve function
            tx.moveCall({
                target: `${packageId}::test::seal_approve`,
                arguments: [
                    tx.pure.vector("u8", fromHEX(Buffer.from(identity).toString('hex'))),
                ]
            });
            const txBytes = tx.build({ client: this.suiClient, onlyTransactionKind: true });
            console.log('Seal approve transaction created successfully');
            return txBytes;
        }
        catch (error) {
            console.error('Failed to create seal_approve transaction:', error);
            throw new Error(`Failed to create seal_approve transaction: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Validate access policy against Sui blockchain
     */
    async validateAccessPolicy(keyRequest) {
        try {
            // For development, we'll do basic validation
            // In production, this would validate against actual Sui contracts
            const { ibe_identity, sui_ptb, signature } = keyRequest;
            console.log(`Validating access policy for identity: ${ibe_identity}`);
            // Basic validation checks
            if (!ibe_identity || !sui_ptb || !signature) {
                console.log('Missing required fields for access validation');
                return false;
            }
            if (!sui_ptb.user_address) {
                console.log('Missing user_address in Sui PTB');
                return false;
            }
            // For development, allow all requests with proper structure
            // In production, this would check:
            // 1. Signature validity
            // 2. Sui transaction validity
            // 3. Access policy permissions
            // 4. User authorization
            console.log('Access validation passed (development mode)');
            return true;
        }
        catch (error) {
            console.error('Access policy validation failed:', error);
            return false;
        }
    }
    /**
     * Get service information
     */
    getServiceInfo() {
        return {
            keyServers: this.config.keyServerIds.length,
            threshold: this.config.threshold,
            verifyKeyServers: this.config.verifyKeyServers,
            network: config.sui.network,
            status: 'active'
        };
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            // Check Sui client connection
            await this.suiClient.getLatestSuiSystemState();
            // For Seal client, we'll check if key servers are reachable
            // This is a simplified health check
            console.log('Health check passed');
            return true;
        }
        catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }
}

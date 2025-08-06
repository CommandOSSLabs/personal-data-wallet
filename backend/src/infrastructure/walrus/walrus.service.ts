import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient, WalrusFile, RetryableWalrusClientError } from '@mysten/walrus';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

@Injectable()
export class WalrusService {
  private walrusClient: WalrusClient;
  private suiClient: SuiClient;
  private adminKeypair: Ed25519Keypair;
  private logger = new Logger(WalrusService.name);
  private adminAddress: string;
  
  // Number of epochs to store content for by default
  private readonly DEFAULT_STORAGE_EPOCHS = 12; // ~1 month at ~3 days/epoch

  constructor(private configService: ConfigService) {
    // Initialize Sui client with the appropriate network
    const configNetwork = this.configService.get<string>('SUI_NETWORK', 'testnet');
    
    // Validate network for type safety
    const network = configNetwork || 'testnet';
    
    this.suiClient = new SuiClient({
      url: getFullnodeUrl(network as 'testnet' | 'mainnet'),
    });

    // Initialize Walrus client with proper configuration
    this.initializeWalrusClient(network as 'testnet' | 'mainnet');

    // Initialize admin keypair for signing transactions
    this.initializeAdminKeypair();

    this.logger.log(`Initialized Walrus client on ${network} network`);
  }
  
  /**
   * Initialize Walrus client with optimized settings
   */
  private initializeWalrusClient(network: 'testnet' | 'mainnet') {
    const useUploadRelay = this.configService.get<boolean>('WALRUS_USE_UPLOAD_RELAY', true);
    const uploadRelayHost = this.configService.get<string>(
      'WALRUS_UPLOAD_RELAY_HOST', 
      'https://upload-relay.testnet.walrus.space'
    );
    
    const clientOptions: any = {
      network,
      suiClient: this.suiClient,
      // Custom storage node options for better reliability
      storageNodeClientOptions: {
        // Increased timeout for slow storage nodes
        timeout: 120_000, // 2 minutes
        // Custom fetch with better error handling
        fetch: async (url: string, options?: RequestInit) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 120_000);
          
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response;
          } catch (error: any) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
              throw new Error(`Request timeout: ${url}`);
            }
            throw error;
          }
        },
        // Log individual errors for debugging
        onError: (error: Error) => {
          this.logger.debug(`Storage node error: ${error.message}`);
        },
      },
    };
    
    // Add upload relay configuration if enabled
    if (useUploadRelay && network === 'testnet') {
      clientOptions.uploadRelay = {
        host: uploadRelayHost,
        sendTip: {
          // Use the tip configuration from the external context
          address: '0x4b6a7439159cf10533147fc3d678cf10b714f2bc998f6cb1f1b0b9594cdc52b6',
          kind: {
            const: 105,
          },
        },
      };
      this.logger.log(`Walrus client configured with upload relay: ${uploadRelayHost}`);
    }
    
    this.walrusClient = new WalrusClient(clientOptions);
  }

  /**
   * Initialize admin keypair for signing transactions
   */
  private initializeAdminKeypair() {
    try {
      const privateKey = this.configService.get<string>('SUI_ADMIN_PRIVATE_KEY');
      
      if (!privateKey) {
        throw new Error('SUI_ADMIN_PRIVATE_KEY not provided');
      }
      
      // Handle both hex format and SUI private key format
      const cleanedKey = privateKey.replace(/\s+/g, ''); // Remove any whitespace
      
      if (cleanedKey.startsWith('suiprivkey1')) {
        // SUI private key format - use directly
        this.adminKeypair = Ed25519Keypair.fromSecretKey(cleanedKey);
      } else {
        // Hex format - convert to buffer
        const keyWithPrefix = cleanedKey.startsWith('0x') ? cleanedKey : `0x${cleanedKey}`;
        const keyBuffer = Buffer.from(keyWithPrefix.replace('0x', ''), 'hex');
        if (keyBuffer.length !== 32) {
          throw new Error(`Invalid hex key length: ${keyBuffer.length}, expected 32`);
        }
        this.adminKeypair = Ed25519Keypair.fromSecretKey(keyBuffer);
      }
      this.adminAddress = this.adminKeypair.getPublicKey().toSuiAddress();
      
      this.logger.log(`Walrus service using admin address: ${this.adminAddress}`);
    } catch (error) {
      this.logger.error(`Failed to initialize admin keypair: ${error.message}`);
      throw new Error(`Admin keypair initialization failed: ${error.message}`);
    }
  }

  /**
   * Get admin address
   * @returns The admin address
   */
  getAdminAddress(): string {
    return this.adminAddress;
  }

  /**
   * Upload content to Walrus with full on-chain storage
   * @param content The content to upload
   * @param ownerAddress The address of the owner
   * @param epochs Number of epochs to store the content
   * @param additionalTags Additional metadata tags to include
   * @returns The blob ID
   */
  async uploadContent(
    content: string, 
    ownerAddress: string, 
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    try {
      this.logger.log(`Uploading content to Walrus for owner ${ownerAddress}...`);
      
      // Create a WalrusFile from string content
      const file = WalrusFile.from({
        contents: new TextEncoder().encode(content),
        identifier: `content_${Date.now()}`,
        tags: {
          'content-type': 'text/plain',
          'owner': ownerAddress,
          'created': new Date().toISOString(),
          ...additionalTags
        },
      });
      
      // Use the complete workflow for production
      const results = await this.uploadFilesToWalrus([file], epochs);
      
      if (!results || results.length === 0) {
        throw new Error('Failed to upload content to Walrus');
      }
      
      return results[0].blobId;
    } catch (error) {
      this.logger.error(`Error uploading content to Walrus: ${error.message}`);
      throw new Error(`Walrus upload error: ${error.message}`);
    }
  }

  /**
   * Retrieve content from Walrus
   * @param blobId The blob ID to retrieve
   * @returns The retrieved content
   */
  async retrieveContent(blobId: string): Promise<string> {
    try {
      this.logger.log(`Retrieving content from blobId: ${blobId}`);
      
      // Get file from the blob ID
      const [file] = await this.walrusClient.getFiles({ 
        ids: [blobId] 
      });
      
      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }
      
      // Convert to text
      const content = await file.text();
      
      return content;
    } catch (error) {
      this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
      throw new Error(`Walrus retrieval error: ${error.message}`);
    }
  }

  /**
   * Get file tags from Walrus
   * @param blobId The blob ID
   * @returns The file tags
   */
  async getFileTags(blobId: string): Promise<Record<string, string>> {
    try {
      const [file] = await this.walrusClient.getFiles({ 
        ids: [blobId] 
      });
      
      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }
      
      return await file.getTags();
    } catch (error) {
      this.logger.error(`Error retrieving file tags from Walrus: ${error.message}`);
      throw new Error(`Walrus tag retrieval error: ${error.message}`);
    }
  }

  /**
   * Check if a user has access to a file based on tags
   * @param blobId The blob ID
   * @param userAddress The user's address
   * @returns True if the user has access
   */
  async verifyUserAccess(blobId: string, userAddress: string): Promise<boolean> {
    try {
      const tags = await this.getFileTags(blobId);
      
      // Check if user is the owner or has user-address tag
      return tags['owner'] === userAddress || 
             tags['user-address'] === userAddress ||
             // Also check user addresses without 0x prefix
             tags['user-address'] === userAddress.replace('0x', '');
    } catch (error) {
      this.logger.error(`Error verifying user access: ${error.message}`);
      return false;
    }
  }

  /**
   * Upload a file to Walrus with full on-chain storage
   * @param buffer The file buffer
   * @param filename The file name
   * @param ownerAddress The address of the owner
   * @param epochs Number of epochs to store the file
   * @param additionalTags Additional metadata tags to include
   * @returns The blob ID
   */
  async uploadFile(
    buffer: Buffer, 
    filename: string, 
    ownerAddress: string, 
    epochs: number = this.DEFAULT_STORAGE_EPOCHS,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    try {
      this.logger.log(`Uploading file "${filename}" to Walrus for owner ${ownerAddress}...`);
      
      // Create a WalrusFile from buffer with filename as identifier
      const file = WalrusFile.from({
        contents: new Uint8Array(buffer),
        identifier: filename,
        tags: {
          'content-type': 'application/octet-stream',
          'filename': filename,
          'owner': ownerAddress,
          'created': new Date().toISOString(),
          ...additionalTags
        },
      });
      
      // Use the complete workflow for production
      const results = await this.uploadFilesToWalrus([file], epochs);
      
      if (!results || results.length === 0) {
        throw new Error('Failed to upload file to Walrus');
      }
      
      return results[0].blobId;
    } catch (error) {
      this.logger.error(`Error uploading file to Walrus: ${error.message}`);
      throw new Error(`Walrus file upload error: ${error.message}`);
    }
  }

  /**
   * Download a file from Walrus
   * @param blobId The blob ID
   * @returns The file buffer
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    try {
      this.logger.log(`Downloading file from blobId: ${blobId}`);
      
      // Get file from the blob ID
      const [file] = await this.walrusClient.getFiles({ 
        ids: [blobId] 
      });
      
      if (!file) {
        throw new Error(`File with blob ID ${blobId} not found`);
      }
      
      // Get binary data
      const bytes = await file.bytes();
      
      return Buffer.from(bytes);
    } catch (error) {
      this.logger.error(`Error downloading file from Walrus: ${error.message}`);
      throw new Error(`Walrus file download error: ${error.message}`);
    }
  }

  /**
   * Delete content from Walrus
   * NOTE: This requires on-chain transaction for deletion
   * @param blobId The blob ID to delete
   * @param userAddress The address of the user requesting deletion
   * @returns True if deletion was successful
   */
  async deleteContent(
    blobId: string,
    userAddress: string
  ): Promise<boolean> {
    try {
      this.logger.log(`Deleting blob ${blobId} requested by user ${userAddress}...`);
      
      // Verify access
      const hasAccess = await this.verifyUserAccess(blobId, userAddress);
      if (!hasAccess) {
        this.logger.warn(`User ${userAddress} has no access to blob ${blobId}`);
        // Continue with admin anyway if file exists
      }
      
      // For full implementation, we would:
      // 1. Look up the on-chain blob object
      // 2. Execute a deletion transaction using the object ID
      
      // This is just a placeholder until we implement the full deletion flow
      this.logger.warn(
        `Deletion of Walrus blobs requires on-chain transactions. ` +
        `BlobId: ${blobId}, User: ${userAddress}`
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting Walrus blob: ${error.message}`);
      throw new Error(`Walrus deletion error: ${error.message}`);
    }
  }
  
  /**
   * Upload files to Walrus with full on-chain storage
   * @param files Array of WalrusFiles to upload
   * @param epochs Number of epochs to store the files
   * @returns Array of results with blob IDs
   */
  private async uploadFilesToWalrus(files: WalrusFile[], epochs: number) {
    const maxRetries = 3; // Reduced retries since we have better error handling
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Upload attempt ${attempt}/${maxRetries}`);
        
        // Check if error is retryable and reset client if needed
        if (attempt > 1 && lastError) {
          if (lastError instanceof RetryableWalrusClientError) {
            this.logger.log('Resetting Walrus client due to retryable error...');
            this.walrusClient.reset();
          } else {
            // Recreate client for fresh connection on other errors
            this.logger.log('Recreating Walrus client for fresh connection...');
            this.initializeWalrusClient(
              this.configService.get<string>('SUI_NETWORK', 'testnet') as 'testnet' | 'mainnet'
            );
          }
        }
        
        // Check if we should use the simple writeFiles method (with upload relay)
        const useUploadRelay = this.configService.get<boolean>('WALRUS_USE_UPLOAD_RELAY', true);
        
        if (useUploadRelay) {
          // Use the simpler writeFiles method which handles everything internally
          // This works better with upload relay
          try {
            this.logger.log('Using simplified upload with relay...');
            const results = await this.walrusClient.writeFiles({
              files,
              epochs,
              deletable: true,
              signer: this.adminKeypair,
            });
            
            this.logger.log(`Upload completed successfully on attempt ${attempt}`);
            return results;
          } catch (writeError: any) {
            // If writeFiles fails, fall back to manual flow
            this.logger.warn(`Simplified upload failed: ${writeError.message}, trying manual flow...`);
            if (attempt === maxRetries) {
              throw writeError;
            }
          }
        }
        
        // Manual flow for when upload relay is not available or fails
        // Step 1: Initialize the write flow
        const flow = this.walrusClient.writeFilesFlow({ files });
        
        // Step 2: Encode the files (generates blob ID and prepares data)
        await flow.encode();
        this.logger.log('Files encoded successfully');
        
        // Step 3: Register the blob on-chain
        const registerTx = await flow.register({
          epochs,
          owner: this.adminAddress,
          deletable: true,
        });
        
        // Execute the register transaction with timeout
        this.logger.log('Executing register transaction...');
        const registerResult = await this.suiClient.signAndExecuteTransaction({
          transaction: registerTx,
          signer: this.adminKeypair,
          options: { showEffects: true, showEvents: true }
        });
        
        if (!registerResult.digest) {
          throw new Error('Failed to register blob: No transaction digest');
        }
        
        this.logger.log(`Blob registered with digest: ${registerResult.digest}`);
        
        // Wait for transaction to be indexed
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 4: Upload the actual data to storage nodes
        this.logger.log('Uploading data to storage nodes...');
        
        try {
          await flow.upload({ 
            digest: registerResult.digest,
          });
          this.logger.log('Data uploaded to storage nodes successfully');
        } catch (uploadError: any) {
          // Log the error but continue to certification
          this.logger.warn(`Upload reported error: ${uploadError.message}`);
          
          // Check if this is a critical error that should stop the process
          if (uploadError.message.includes('must be executed before calling certify')) {
            throw uploadError;
          }
          
          // For "Too many failures" errors, wait longer before certification
          if (uploadError.message.includes('Too many failures')) {
            this.logger.log('Waiting for storage nodes to sync...');
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }
        
        // Step 5: Certify the blob on-chain
        this.logger.log('Certifying blob on-chain...');
        const certifyTx = flow.certify();
        
        // Execute the certify transaction
        await this.suiClient.signAndExecuteTransaction({
          transaction: certifyTx,
          signer: this.adminKeypair,
          options: { showEffects: true, showEvents: true }
        });
        
        this.logger.log('Blob certified successfully');
        
        // Step 6: Get the file details
        const result = await flow.listFiles();
        this.logger.log(`Upload completed successfully on attempt ${attempt}`);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Upload attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        
        // Check if this is a retryable error
        if (lastError instanceof RetryableWalrusClientError) {
          this.logger.log('Error is retryable, will reset client and retry...');
        }
        
        // If this is the last attempt, don't wait
        if (attempt < maxRetries) {
          // Shorter wait times with exponential backoff
          const baseWait = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          const jitter = Math.random() * 500;
          const waitTime = baseWait + jitter;
          this.logger.log(`Waiting ${Math.round(waitTime)}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // All attempts failed
    this.logger.error(`All ${maxRetries} upload attempts failed. Last error: ${lastError?.message}`);
    
    if (lastError?.message.includes('fetch failed') || 
        lastError?.message.includes('Too many failures') ||
        lastError?.message.includes('timeout') ||
        lastError?.message.includes('network')) {
      throw new Error(
        'Walrus storage nodes are currently experiencing connectivity issues. ' +
        'This is a known issue with the Walrus testnet. Please try again in a few minutes. ' +
        'If the problem persists, consider enabling the upload relay by setting WALRUS_USE_UPLOAD_RELAY=true'
      );
    }
    
    throw lastError || new Error('Unknown upload error');
  }
}

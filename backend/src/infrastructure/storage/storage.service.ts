import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { WalrusService } from '../walrus/walrus.service';

export interface StorageResult {
  blobId: string;
  storageType: 'walrus' | 'local';
  success: boolean;
  message?: string;
}

@Injectable()
export class StorageService {
  private logger = new Logger(StorageService.name);
  private walrusAvailable = false;
  private lastWalrusCheck = 0;
  private readonly WALRUS_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor(
    private localStorageService: LocalStorageService,
    private walrusService: WalrusService,
    private configService: ConfigService
  ) {
    // For demo, we'll primarily use local storage
    const useLocalForDemo = this.configService.get<boolean>('USE_LOCAL_STORAGE_FOR_DEMO', true);
    if (useLocalForDemo) {
      this.logger.log('Demo mode: Using local storage as primary storage');
      this.walrusAvailable = false;
    }
  }

  /**
   * Check if Walrus is available (cached check)
   */
  private async isWalrusAvailable(): Promise<boolean> {
    // For demo, always use local storage
    const useLocalForDemo = this.configService.get<boolean>('USE_LOCAL_STORAGE_FOR_DEMO', true);
    if (useLocalForDemo) {
      return false;
    }

    const now = Date.now();
    
    // Use cached result if recent
    if (now - this.lastWalrusCheck < this.WALRUS_CHECK_INTERVAL) {
      return this.walrusAvailable;
    }
    
    try {
      // Quick availability check
      // For now, we'll assume Walrus is not available for demo
      this.walrusAvailable = false;
      this.logger.debug('Walrus availability check: UNAVAILABLE (demo mode)');
    } catch (error) {
      this.walrusAvailable = false;
      this.logger.debug('Walrus availability check: UNAVAILABLE');
    }
    
    this.lastWalrusCheck = now;
    return this.walrusAvailable;
  }

  /**
   * Upload content (compatible with WalrusService interface)
   */
  async uploadContent(
    content: string,
    ownerAddress: string,
    epochs: number = 12,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const result = await this.storeContent(
      content,
      `content_${Date.now()}.txt`,
      { owner: ownerAddress, ...additionalTags }
    );

    if (!result.success) {
      throw new Error(result.message || 'Failed to store content');
    }

    return result.blobId;
  }

  /**
   * Store content with automatic fallback
   */
  async storeContent(
    content: string,
    filename: string,
    tags: Record<string, string> = {}
  ): Promise<StorageResult> {
    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();
    
    if (walrusAvailable) {
      try {
        this.logger.log(`Storing content to Walrus: ${filename}`);
        const blobId = await this.walrusService.uploadContent(
          content, 
          tags.owner || 'unknown',
          12, // epochs
          tags
        );
        
        return {
          blobId,
          storageType: 'walrus',
          success: true,
          message: 'Content stored in Walrus'
        };
      } catch (error) {
        this.logger.warn(`Walrus storage failed, falling back to local: ${error.message}`);
        // Fall through to local storage
      }
    }
    
    // Use local storage (either as primary choice or fallback)
    try {
      this.logger.log(`Storing content to local storage: ${filename}`);
      const blobId = await this.localStorageService.storeContent(content, filename, tags);
      
      return {
        blobId,
        storageType: 'local',
        success: true,
        message: 'Content stored locally'
      };
    } catch (error) {
      this.logger.error(`Local storage failed: ${error.message}`);
      return {
        blobId: '',
        storageType: 'local',
        success: false,
        message: `Storage failed: ${error.message}`
      };
    }
  }

  /**
   * Store file buffer with automatic fallback
   */
  async storeFile(
    buffer: Buffer, 
    filename: string, 
    tags: Record<string, string> = {}
  ): Promise<StorageResult> {
    // Check if Walrus is available
    const walrusAvailable = await this.isWalrusAvailable();
    
    if (walrusAvailable) {
      try {
        this.logger.log(`Storing file to Walrus: ${filename}`);
        const blobId = await this.walrusService.uploadFile(
          buffer, 
          filename,
          tags.owner || 'unknown',
          12, // epochs
          tags
        );
        
        return {
          blobId,
          storageType: 'walrus',
          success: true,
          message: 'File stored in Walrus'
        };
      } catch (error) {
        this.logger.warn(`Walrus storage failed, falling back to local: ${error.message}`);
        // Fall through to local storage
      }
    }
    
    // Use local storage (either as primary choice or fallback)
    try {
      this.logger.log(`Storing file to local storage: ${filename}`);
      const blobId = await this.localStorageService.storeFile(buffer, filename, tags);
      
      return {
        blobId,
        storageType: 'local',
        success: true,
        message: 'File stored locally'
      };
    } catch (error) {
      this.logger.error(`Local storage failed: ${error.message}`);
      return {
        blobId: '',
        storageType: 'local',
        success: false,
        message: `Storage failed: ${error.message}`
      };
    }
  }

  /**
   * Retrieve file with automatic detection
   */
  async retrieveFile(blobId: string): Promise<Buffer> {
    // Detect storage type from blob ID
    if (blobId.startsWith('local_')) {
      this.logger.log(`Retrieving file from local storage: ${blobId}`);
      return await this.localStorageService.retrieveFile(blobId);
    } else {
      // Try Walrus first, then local as fallback
      try {
        this.logger.log(`Retrieving file from Walrus: ${blobId}`);
        return await this.walrusService.downloadFile(blobId);
      } catch (error) {
        this.logger.warn(`Walrus retrieval failed, trying local storage: ${error.message}`);
        return await this.localStorageService.retrieveFile(blobId);
      }
    }
  }

  /**
   * Retrieve content as string
   */
  async retrieveContent(blobId: string): Promise<string> {
    if (blobId.startsWith('local_')) {
      return await this.localStorageService.retrieveContent(blobId);
    } else {
      const buffer = await this.retrieveFile(blobId);
      return buffer.toString('utf-8');
    }
  }

  /**
   * Check if file exists
   */
  async exists(blobId: string): Promise<boolean> {
    if (blobId.startsWith('local_')) {
      return await this.localStorageService.exists(blobId);
    } else {
      try {
        await this.walrusService.downloadFile(blobId);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    local: any;
    walrus: { available: boolean; lastCheck: Date };
  }> {
    const localStats = await this.localStorageService.getStats();
    
    return {
      local: localStats,
      walrus: {
        available: this.walrusAvailable,
        lastCheck: new Date(this.lastWalrusCheck)
      }
    };
  }

  /**
   * Force use of local storage (for demo)
   */
  forceLocalStorage(): void {
    this.walrusAvailable = false;
    this.logger.log('Forced to use local storage only');
  }

  /**
   * Get admin address (for compatibility)
   */
  getAdminAddress(): string {
    return this.walrusService.getAdminAddress();
  }
}

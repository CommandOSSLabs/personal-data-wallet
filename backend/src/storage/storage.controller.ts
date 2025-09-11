import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { StorageService } from '../infrastructure/storage/storage.service';
import { LocalStorageService } from '../infrastructure/local-storage/local-storage.service';
import { WalrusService } from '../infrastructure/walrus/walrus.service';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly localStorageService: LocalStorageService,
    private readonly walrusService: WalrusService
  ) {}

  /**
   * Retrieve content from storage (local or Walrus)
   */
  @Get('retrieve/:blobId')
  async retrieveContent(@Param('blobId') blobId: string): Promise<{ content: string; success: boolean }> {
    try {
      console.log(`Retrieving content for blob: ${blobId}`);

      // Check if it's a local storage blob ID
      if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
        console.log(`Fetching from local storage: ${blobId}`);
        const content = await this.localStorageService.retrieveContent(blobId);
        return { content, success: true };
      } else {
        // It's a Walrus blob ID
        console.log(`Fetching from Walrus: ${blobId}`);
        const buffer = await this.walrusService.downloadFile(blobId);
        return { content: buffer.toString('utf-8'), success: true };
      }
    } catch (error) {
      console.error(`Error retrieving content for blob ${blobId}:`, error);
      return { content: '', success: false };
    }
  }

  /**
   * Check if content exists in storage
   */
  @Get('exists/:blobId')
  async checkExists(@Param('blobId') blobId: string): Promise<{ exists: boolean }> {
    try {
      let exists = false;
      
      if (blobId.startsWith('local_') || blobId.startsWith('demo_')) {
        exists = await this.localStorageService.exists(blobId);
      } else {
        // For Walrus, we try to download and catch errors
        try {
          await this.walrusService.downloadFile(blobId);
          exists = true;
        } catch (error) {
          exists = false;
        }
      }
      
      return { exists };
    } catch (error) {
      console.error(`Error checking existence for blob ${blobId}:`, error);
      return { exists: false };
    }
  }

  /**
   * Get storage statistics
   */
  @Get('stats')
  async getStorageStats() {
    try {
      const stats = await this.storageService.getStats();
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new HttpException(
        'Failed to get storage statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

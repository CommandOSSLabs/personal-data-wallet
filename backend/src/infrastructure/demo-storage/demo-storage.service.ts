import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

/**
 * Demo Storage Service - Simple local storage for demo purposes
 * This replaces the complex Walrus service with reliable local storage
 */
@Injectable()
export class DemoStorageService {
  private logger = new Logger(DemoStorageService.name);
  private readonly STORAGE_DIR = path.join(process.cwd(), 'storage', 'demo');

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage directory
   */
  private async initializeStorage() {
    try {
      await mkdir(this.STORAGE_DIR, { recursive: true });
      this.logger.log(`Demo storage initialized at: ${this.STORAGE_DIR}`);
    } catch (error) {
      this.logger.error(`Failed to initialize demo storage: ${error.message}`);
    }
  }

  /**
   * Generate a unique blob ID
   */
  private generateBlobId(): string {
    return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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
    const blobId = this.generateBlobId();
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      // Store content
      await writeFile(filePath, content, 'utf-8');
      
      // Store metadata
      const metadata = {
        blobId,
        ownerAddress,
        epochs,
        tags: additionalTags,
        contentType: 'text/plain',
        createdAt: new Date().toISOString(),
        storageType: 'demo'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`Content stored: ${blobId} for ${ownerAddress}`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store content: ${error.message}`);
      throw new Error(`Demo storage error: ${error.message}`);
    }
  }

  /**
   * Upload file (compatible with WalrusService interface)
   */
  async uploadFile(
    buffer: Buffer, 
    filename: string, 
    ownerAddress: string, 
    epochs: number = 12,
    additionalTags: Record<string, string> = {}
  ): Promise<string> {
    const blobId = this.generateBlobId();
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      // Store file
      await writeFile(filePath, buffer);
      
      // Store metadata
      const metadata = {
        blobId,
        filename,
        ownerAddress,
        epochs,
        tags: additionalTags,
        contentType: 'application/octet-stream',
        size: buffer.length,
        createdAt: new Date().toISOString(),
        storageType: 'demo'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`File stored: ${blobId} (${filename}) for ${ownerAddress}`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store file: ${error.message}`);
      throw new Error(`Demo storage error: ${error.message}`);
    }
  }

  /**
   * Download file (compatible with WalrusService interface)
   */
  async downloadFile(blobId: string): Promise<Buffer> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const textPath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
    
    try {
      // Try binary file first, then text file
      try {
        const buffer = await readFile(filePath);
        this.logger.log(`File retrieved: ${blobId} (${buffer.length} bytes)`);
        return buffer;
      } catch (error) {
        // Try text file
        const content = await readFile(textPath, 'utf-8');
        const buffer = Buffer.from(content, 'utf-8');
        this.logger.log(`Content retrieved: ${blobId} (${buffer.length} bytes)`);
        return buffer;
      }
    } catch (error) {
      this.logger.error(`Failed to retrieve file ${blobId}: ${error.message}`);
      throw new Error(`File not found: ${blobId}`);
    }
  }

  /**
   * Verify user access (always return true for demo)
   */
  async verifyUserAccess(blobId: string, userAddress: string): Promise<boolean> {
    // For demo, always allow access
    return true;
  }

  /**
   * Get admin address (return a demo address)
   */
  getAdminAddress(): string {
    return 'demo_admin_address';
  }

  /**
   * Check if file exists
   */
  async exists(blobId: string): Promise<boolean> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const textPath = path.join(this.STORAGE_DIR, `${blobId}.txt`);
    
    try {
      await readFile(filePath);
      return true;
    } catch (error) {
      try {
        await readFile(textPath);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  /**
   * Get storage stats
   */
  async getStats(): Promise<{
    totalFiles: number;
    storageDir: string;
  }> {
    try {
      const files = await fs.promises.readdir(this.STORAGE_DIR);
      const dataFiles = files.filter(file => file.endsWith('.bin') || file.endsWith('.txt'));
      
      return {
        totalFiles: dataFiles.length,
        storageDir: this.STORAGE_DIR
      };
    } catch (error) {
      return {
        totalFiles: 0,
        storageDir: this.STORAGE_DIR
      };
    }
  }
}

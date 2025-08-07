import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

export interface StoredFileMetadata {
  blobId: string;
  filename: string;
  tags: Record<string, string>;
  size: number;
  createdAt: string;
  storageType: 'local';
}

@Injectable()
export class LocalStorageService {
  private logger = new Logger(LocalStorageService.name);
  private readonly STORAGE_DIR = path.join(process.cwd(), 'storage', 'local-files');

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize local storage directory
   */
  private async initializeStorage() {
    try {
      await mkdir(this.STORAGE_DIR, { recursive: true });
      this.logger.log(`Local storage initialized at: ${this.STORAGE_DIR}`);
    } catch (error) {
      this.logger.error(`Failed to initialize local storage: ${error.message}`);
      throw new Error(`Local storage initialization failed: ${error.message}`);
    }
  }

  /**
   * Generate a unique blob ID for local storage
   */
  private generateBlobId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Store content locally
   */
  async storeContent(
    content: string, 
    filename: string, 
    tags: Record<string, string> = {}
  ): Promise<string> {
    const buffer = Buffer.from(content, 'utf-8');
    return this.storeFile(buffer, filename, tags);
  }

  /**
   * Store file buffer locally
   */
  async storeFile(
    buffer: Buffer, 
    filename: string, 
    tags: Record<string, string> = {}
  ): Promise<string> {
    const blobId = this.generateBlobId();
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      // Store the file data
      await writeFile(filePath, buffer);
      
      // Store metadata
      const metadata: StoredFileMetadata = {
        blobId,
        filename,
        tags,
        size: buffer.length,
        createdAt: new Date().toISOString(),
        storageType: 'local'
      };
      await writeFile(metaPath, JSON.stringify(metadata, null, 2));
      
      this.logger.log(`File stored locally: ${blobId} (${buffer.length} bytes)`);
      return blobId;
    } catch (error) {
      this.logger.error(`Failed to store file locally: ${error.message}`);
      throw new Error(`Local storage error: ${error.message}`);
    }
  }

  /**
   * Retrieve file from local storage
   */
  async retrieveFile(blobId: string): Promise<Buffer> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    
    try {
      const buffer = await readFile(filePath);
      this.logger.log(`File retrieved from local storage: ${blobId} (${buffer.length} bytes)`);
      return buffer;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found in local storage: ${blobId}`);
      }
      this.logger.error(`Failed to retrieve file locally: ${error.message}`);
      throw new Error(`Local storage retrieval error: ${error.message}`);
    }
  }

  /**
   * Retrieve file content as string
   */
  async retrieveContent(blobId: string): Promise<string> {
    const buffer = await this.retrieveFile(blobId);
    return buffer.toString('utf-8');
  }

  /**
   * Get file metadata
   */
  async getMetadata(blobId: string): Promise<StoredFileMetadata> {
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      const metaContent = await readFile(metaPath, 'utf-8');
      return JSON.parse(metaContent);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Metadata not found for: ${blobId}`);
      }
      throw new Error(`Failed to read metadata: ${error.message}`);
    }
  }

  /**
   * Check if file exists
   */
  async exists(blobId: string): Promise<boolean> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    
    try {
      await stat(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(blobId: string): Promise<void> {
    const filePath = path.join(this.STORAGE_DIR, `${blobId}.bin`);
    const metaPath = path.join(this.STORAGE_DIR, `${blobId}.meta.json`);
    
    try {
      await unlink(filePath);
      await unlink(metaPath);
      this.logger.log(`File deleted from local storage: ${blobId}`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        this.logger.error(`Failed to delete file: ${error.message}`);
        throw new Error(`Delete error: ${error.message}`);
      }
    }
  }

  /**
   * List all stored files
   */
  async listFiles(): Promise<StoredFileMetadata[]> {
    try {
      const files = await readdir(this.STORAGE_DIR);
      const metaFiles = files.filter(file => file.endsWith('.meta.json'));
      
      const metadata: StoredFileMetadata[] = [];
      for (const metaFile of metaFiles) {
        try {
          const metaPath = path.join(this.STORAGE_DIR, metaFile);
          const metaContent = await readFile(metaPath, 'utf-8');
          metadata.push(JSON.parse(metaContent));
        } catch (error) {
          this.logger.warn(`Failed to read metadata file ${metaFile}: ${error.message}`);
        }
      }
      
      return metadata.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      this.logger.error(`Failed to list files: ${error.message}`);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    storageDir: string;
  }> {
    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      
      return {
        totalFiles: files.length,
        totalSize,
        storageDir: this.STORAGE_DIR
      };
    } catch (error) {
      this.logger.error(`Failed to get storage stats: ${error.message}`);
      return {
        totalFiles: 0,
        totalSize: 0,
        storageDir: this.STORAGE_DIR
      };
    }
  }

  /**
   * Clean up old files (older than specified days)
   */
  async cleanup(olderThanDays: number = 30): Promise<number> {
    try {
      const files = await this.listFiles();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      let deletedCount = 0;
      for (const file of files) {
        const fileDate = new Date(file.createdAt);
        if (fileDate < cutoffDate) {
          await this.deleteFile(file.blobId);
          deletedCount++;
        }
      }
      
      this.logger.log(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      this.logger.error(`Failed to cleanup files: ${error.message}`);
      return 0;
    }
  }
}

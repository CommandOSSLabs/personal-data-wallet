import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WalrusService {
  private apiUrl: string;
  private apiKey: string;
  private logger = new Logger(WalrusService.name);

  constructor(private configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WALRUS_API_URL', 'https://api.walrus.ai/v1');
    
    const apiKey = this.configService.get<string>('WALRUS_API_KEY');
    if (!apiKey) {
      this.logger.warn('WALRUS_API_KEY not provided, using dummy key for development');
      this.apiKey = 'dummy_key_for_development'; // Default value for type checking
    } else {
      this.apiKey = apiKey;
    }
  }

  /**
   * Upload content to Walrus
   * @param content The content to upload
   * @returns The blob ID
   */
  async uploadContent(content: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/blobs`,
        { content },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.blob_id;
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
      const response = await axios.get(
        `${this.apiUrl}/blobs/${blobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.content;
    } catch (error) {
      this.logger.error(`Error retrieving content from Walrus: ${error.message}`);
      throw new Error(`Walrus retrieval error: ${error.message}`);
    }
  }

  /**
   * Delete content from Walrus
   * @param blobId The blob ID to delete
   * @returns True if deletion was successful
   */
  async deleteContent(blobId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.apiUrl}/blobs/${blobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return true;
    } catch (error) {
      this.logger.error(`Error deleting content from Walrus: ${error.message}`);
      throw new Error(`Walrus deletion error: ${error.message}`);
    }
  }

  /**
   * Upload a file to Walrus
   * @param buffer The file buffer
   * @param filename The file name
   * @returns The blob ID
   */
  async uploadFile(buffer: Buffer, filename: string): Promise<string> {
    try {
      const formData = new FormData();
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      formData.append('file', blob, filename);
      
      const response = await axios.post(
        `${this.apiUrl}/files`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      return response.data.blob_id;
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
      const response = await axios.get(
        `${this.apiUrl}/files/${blobId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`
          },
          responseType: 'arraybuffer'
        }
      );
      
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(`Error downloading file from Walrus: ${error.message}`);
      throw new Error(`Walrus file download error: ${error.message}`);
    }
  }
}
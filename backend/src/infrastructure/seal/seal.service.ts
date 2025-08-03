import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class SealService {
  private masterKey: Buffer;
  private logger = new Logger(SealService.name);

  constructor(private configService: ConfigService) {
    // In a real implementation, this would use the actual Seal IBE SDK
    // For now, we're using a simplified symmetric encryption approach
    const masterKeyHex = this.configService.get<string>('SEAL_MASTER_KEY');
    
    if (!masterKeyHex) {
      this.logger.warn('SEAL_MASTER_KEY not provided, using a default key (NOT SECURE)');
      // Default key for development only
      this.masterKey = crypto.randomBytes(32);
    } else {
      this.masterKey = Buffer.from(masterKeyHex, 'hex');
    }
  }

  /**
   * Encrypt content for a specific user
   * @param content The content to encrypt
   * @param userAddress The user address (used as the encryption identity)
   * @returns The encrypted content
   */
  async encrypt(content: string, userAddress: string): Promise<string> {
    try {
      // In a real implementation, this would use Seal IBE
      // For now, we'll use AES-256-GCM with a user-derived key
      
      // Derive a user-specific key using HKDF
      const userKey = this.deriveUserKey(userAddress);
      
      // Generate a random IV
      const iv = crypto.randomBytes(12);
      
      // Encrypt the content
      const cipher = crypto.createCipheriv('aes-256-gcm', userKey, iv);
      let encrypted = cipher.update(content, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      
      // Get the auth tag
      const authTag = cipher.getAuthTag();
      
      // Format: iv:authTag:encrypted
      return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
    } catch (error) {
      this.logger.error(`Error encrypting content: ${error.message}`);
      throw new Error(`Encryption error: ${error.message}`);
    }
  }

  /**
   * Decrypt content for a specific user
   * @param encryptedContent The encrypted content
   * @param userAddress The user address (used as the decryption identity)
   * @returns The decrypted content
   */
  async decrypt(encryptedContent: string, userAddress: string): Promise<string> {
    try {
      // Parse the encrypted content
      const parts = encryptedContent.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted content format');
      }
      
      const iv = Buffer.from(parts[0], 'base64');
      const authTag = Buffer.from(parts[1], 'base64');
      const encrypted = parts[2];
      
      // Derive the user-specific key
      const userKey = this.deriveUserKey(userAddress);
      
      // Decrypt the content
      const decipher = crypto.createDecipheriv('aes-256-gcm', userKey, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Error decrypting content: ${error.message}`);
      throw new Error(`Decryption error: ${error.message}`);
    }
  }

  /**
   * Check if a user can decrypt content
   * @param userAddress The user address
   * @returns True if the user can decrypt
   */
  async canDecrypt(userAddress: string): Promise<boolean> {
    // In a real implementation, this would check if the user has the necessary keys
    // For now, we assume all valid addresses can decrypt their own content
    return !!userAddress && userAddress.length > 0;
  }

  /**
   * Generate a decryption key for a user
   * @param userAddress The user address
   * @returns The decryption key
   */
  async generateDecryptionKey(userAddress: string): Promise<string> {
    // In a real implementation, this would use Seal IBE to generate a decryption key
    // For now, we return a mock key
    const userKey = this.deriveUserKey(userAddress);
    return userKey.toString('hex');
  }

  private deriveUserKey(userAddress: string): Buffer {
    // Derive a user-specific key using HKDF
    const info = Buffer.from('seal-user-key');
    const salt = crypto.createHash('sha256').update(userAddress).digest();
    
    // Use HKDF to derive a key
    const hkdf = crypto.createHmac('sha256', this.masterKey)
      .update(Buffer.concat([salt, info]))
      .digest();
    
    return hkdf;
  }
}
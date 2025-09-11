import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SealService } from './seal.service';

export class TimelockEncryptDto {
  content: string;
  unlockTime: string; // ISO string
  userAddress: string;
}

export class TimelockDecryptDto {
  encryptedData: string; // Base64 encoded
  userAddress: string;
}

export class TimelockEncryptResponse {
  success: boolean;
  encryptedData: string; // Base64 encoded
  identityId: string;
  unlockTime: number;
  unlockTimeISO: string;
}

export class TimelockDecryptResponse {
  success: boolean;
  content: string;
  decryptedAt: string;
}

@Controller('api/seal/timelock')
export class TimelockController {
  private readonly logger = new Logger(TimelockController.name);

  constructor(private readonly sealService: SealService) {}

  /**
   * Encrypt content with time-lock
   * POST /api/seal/timelock/encrypt
   */
  @Post('encrypt')
  async encryptWithTimelock(@Body() dto: TimelockEncryptDto): Promise<TimelockEncryptResponse> {
    try {
      this.logger.log(`Encrypting content with time-lock for user: ${dto.userAddress}`);

      // Parse unlock time
      const unlockTime = new Date(dto.unlockTime);
      if (isNaN(unlockTime.getTime())) {
        throw new Error('Invalid unlock time format');
      }

      const unlockTimestamp = unlockTime.getTime();
      const currentTimestamp = Date.now();

      if (unlockTimestamp <= currentTimestamp) {
        throw new Error('Unlock time must be in the future');
      }

      // Convert content to bytes
      const contentBytes = new TextEncoder().encode(dto.content);

      // Encrypt with time-lock
      const result = await this.sealService.encryptWithTimelock(
        contentBytes,
        unlockTimestamp
      );

      return {
        success: true,
        encryptedData: Buffer.from(result.encrypted).toString('base64'),
        identityId: result.identityId,
        unlockTime: result.unlockTime,
        unlockTimeISO: new Date(result.unlockTime).toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to encrypt with time-lock', error);
      throw new HttpException(
        `Time-lock encryption failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Decrypt time-locked content
   * POST /api/seal/timelock/decrypt
   */
  @Post('decrypt')
  async decryptTimelock(@Body() dto: TimelockDecryptDto): Promise<TimelockDecryptResponse> {
    try {
      this.logger.log(`Decrypting time-locked content for user: ${dto.userAddress}`);

      // Decode encrypted data
      const encryptedBytes = new Uint8Array(Buffer.from(dto.encryptedData, 'base64'));

      // Decrypt with time-lock validation
      const decryptedBytes = await this.sealService.decryptTimelock(
        encryptedBytes,
        dto.userAddress
      );

      // Convert bytes back to string
      const content = new TextDecoder().decode(decryptedBytes);

      return {
        success: true,
        content,
        decryptedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Failed to decrypt time-locked content', error);
      
      // Check if it's a time-lock not expired error
      if (error.message.includes('Time-lock not yet expired')) {
        throw new HttpException(
          error.message,
          HttpStatus.FORBIDDEN,
        );
      }

      throw new HttpException(
        `Time-lock decryption failed: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Check if time-locked content can be decrypted
   * POST /api/seal/timelock/check
   */
  @Post('check')
  async checkTimelock(@Body() dto: { encryptedData: string }): Promise<{
    canDecrypt: boolean;
    unlockTime?: number;
    unlockTimeISO?: string;
    timeRemaining?: number;
  }> {
    try {
      // Decode and parse encrypted data to extract identity
      const encryptedBytes = new Uint8Array(Buffer.from(dto.encryptedData, 'base64'));
      
      // This is a simplified check - in a real implementation, you'd parse the EncryptedObject
      // For now, we'll extract from the identity pattern
      const encryptedDataStr = dto.encryptedData;
      
      // Mock extraction - in real implementation, parse the EncryptedObject
      const timestampMatch = encryptedDataStr.match(/timelock_(\d+)_/);
      
      if (!timestampMatch) {
        return { canDecrypt: false };
      }

      const unlockTimestamp = parseInt(timestampMatch[1]);
      const currentTimestamp = Date.now();
      const canDecrypt = currentTimestamp >= unlockTimestamp;

      return {
        canDecrypt,
        unlockTime: unlockTimestamp,
        unlockTimeISO: new Date(unlockTimestamp).toISOString(),
        timeRemaining: canDecrypt ? 0 : unlockTimestamp - currentTimestamp,
      };
    } catch (error) {
      this.logger.error('Failed to check time-lock status', error);
      return { canDecrypt: false };
    }
  }
}

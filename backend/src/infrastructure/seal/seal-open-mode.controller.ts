import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { SealOpenModeService } from './seal-open-mode.service';

/**
 * SEAL Open Mode Controller
 * 
 * Provides endpoints for SEAL open mode operations where:
 * - Any package can be used for encryption/decryption
 * - Key servers operate without package restrictions
 */
@Controller('seal/open-mode')
export class SealOpenModeController {
  constructor(private readonly sealOpenModeService: SealOpenModeService) {}

  /**
   * Get session key message for signing
   */
  @Post('session-message')
  async getSessionMessage(@Body() dto: {
    packageId: string;
    userAddress: string;
  }): Promise<{ message: string }> {
    const messageBytes = await this.sealOpenModeService.getSessionKeyMessage(
      dto.packageId,
      dto.userAddress
    );
    const message = Buffer.from(messageBytes).toString('hex');
    return { message };
  }

  /**
   * Encrypt content using open mode
   */
  @Post('encrypt')
  async encrypt(@Body() dto: {
    content: string;
    packageId: string;
    identity: string;
  }): Promise<{
    encrypted: string;
    backupKey: string;
    metadata: any;
  }> {
    return await this.sealOpenModeService.encrypt(
      dto.content,
      dto.packageId,
      dto.identity
    );
  }

  /**
   * Decrypt content using open mode
   */
  @Post('decrypt')
  async decrypt(@Body() dto: {
    encryptedContent: string;
    packageId: string;
    moduleName: string;
    identity: string;
    userAddress: string;
    signature?: string;
  }): Promise<{ decrypted: string }> {
    const decrypted = await this.sealOpenModeService.decrypt(
      dto.encryptedContent,
      dto.packageId,
      dto.moduleName,
      dto.identity,
      dto.userAddress,
      dto.signature
    );
    return { decrypted };
  }

  /**
   * Batch encrypt multiple items
   */
  @Post('batch-encrypt')
  async batchEncrypt(@Body() dto: {
    items: Array<{
      id: string;
      content: string;
      packageId: string;
      identity: string;
    }>;
  }): Promise<{
    results: Array<{
      id: string;
      encrypted?: string;
      backupKey?: string;
      metadata?: any;
      error?: string;
    }>;
  }> {
    const resultsMap = await this.sealOpenModeService.batchEncrypt(dto.items);
    
    const results = Array.from(resultsMap.entries()).map(([id, result]) => ({
      id,
      ...result
    }));
    
    return { results };
  }

  /**
   * Test open mode with a specific package
   */
  @Post('test')
  async testOpenMode(@Body() dto: {
    packageId: string;
    moduleName: string;
    userAddress: string;
    signature: string;
  }): Promise<{
    success: boolean;
    details: any;
    error?: string;
  }> {
    return await this.sealOpenModeService.testOpenMode(
      dto.packageId,
      dto.moduleName,
      dto.userAddress,
      dto.signature
    );
  }

  /**
   * Get open mode status and configuration
   */
  @Get('status')
  getStatus(): {
    mode: string;
    network: string;
    features: string[];
  } {
    return {
      mode: 'open',
      network: process.env.SEAL_NETWORK || 'testnet',
      features: [
        'Any package encryption/decryption',
        'No package restrictions',
        'Single master key operation',
        'Batch operations supported',
      ],
    };
  }
}
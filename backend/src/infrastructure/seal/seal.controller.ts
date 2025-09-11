import { Controller, Post, Body, Get } from '@nestjs/common';
import { SealService } from './seal.service';

interface SessionMessageDto {
  userAddress: string;
}

@Controller('seal')
export class SealController {
  constructor(private readonly sealService: SealService) {}

  @Post('session-message')
  async getSessionMessage(@Body() dto: SessionMessageDto): Promise<{ message: string }> {
    try {
      const messageBytes = await this.sealService.getSessionKeyMessage(dto.userAddress);
      const message = Buffer.from(messageBytes).toString('hex');
      return { message };
    } catch (error) {
      throw new Error(`Failed to generate session message: ${error.message}`);
    }
  }

  @Post('encrypt')
  async encryptContent(@Body() dto: {
    content: string;
    userAddress: string;
  }): Promise<{ encrypted: string; backupKey: string }> {
    try {
      const result = await this.sealService.encrypt(dto.content, dto.userAddress);
      return result;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  @Post('decrypt')
  async decryptContent(@Body() dto: {
    encryptedContent: string;
    userAddress: string;
    signature: string;
  }): Promise<{ content: string }> {
    try {
      const content = await this.sealService.decrypt(
        dto.encryptedContent,
        dto.userAddress,
        dto.signature
      );
      return { content };
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  @Post('allowlist/create')
  async createAllowlist(@Body() dto: {
    name: string;
    userAddress: string;
  }): Promise<{ message: string }> {
    try {
      // This endpoint returns instructions since allowlist creation must happen on frontend
      return {
        message: `To create allowlist "${dto.name}", call the transaction: ${this.sealService.packageId}::seal_access_control::create_allowlist_entry with argument: "${dto.name}"`
      };
    } catch (error) {
      throw new Error(`Failed to create allowlist instructions: ${error.message}`);
    }
  }

  @Post('allowlist/encrypt')
  async encryptForAllowlist(@Body() dto: {
    content: string;
    allowlistId: string;
    userAddress: string;
  }): Promise<{ encrypted: string; backupKey: string }> {
    try {
      const result = await this.sealService.encryptForAllowlist(
        dto.content,
        dto.allowlistId,
        dto.userAddress
      );
      return result;
    } catch (error) {
      throw new Error(`Allowlist encryption failed: ${error.message}`);
    }
  }

  @Post('allowlist/decrypt')
  async decryptFromAllowlist(@Body() dto: {
    encryptedContent: string;
    allowlistId: string;
    userAddress: string;
    signature: string;
  }): Promise<{ content: string }> {
    try {
      const content = await this.sealService.decryptFromAllowlist(
        dto.encryptedContent,
        dto.allowlistId,
        dto.userAddress,
        dto.signature
      );
      return { content };
    } catch (error) {
      throw new Error(`Allowlist decryption failed: ${error.message}`);
    }
  }

  @Get('config')
  getConfig(): {
    packageId: string;
    moduleName: string;
    network: string;
    threshold: number;
    mode: string;
  } {
    return {
      packageId: this.sealService.packageId,
      moduleName: this.sealService.moduleName,
      network: this.sealService.network,
      threshold: this.sealService.threshold,
      mode: 'standard'
    };
  }
}
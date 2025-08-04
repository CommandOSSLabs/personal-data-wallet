import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SealSimpleService } from './seal-simple.service';

@Controller('seal-test')
export class SealTestController {
  constructor(private readonly sealSimpleService: SealSimpleService) {}

  @Get('session/:address')
  async getSessionMessage(@Param('address') address: string) {
    const message = await this.sealSimpleService.getSessionKeyMessage(address);
    return {
      message: Buffer.from(message).toString('hex'),
      messageUtf8: Buffer.from(message).toString('utf8'),
    };
  }

  @Post('encrypt')
  async encrypt(@Body() body: { content: string; userAddress: string }) {
    const result = await this.sealSimpleService.encryptForUser(
      body.content,
      body.userAddress
    );
    return result;
  }

  @Post('decrypt')
  async decrypt(@Body() body: { 
    encrypted: string; 
    userAddress: string;
    signature: string;
  }) {
    try {
      const decrypted = await this.sealSimpleService.decryptForUser(
        body.encrypted,
        body.userAddress,
        body.signature
      );
      return {
        success: true,
        decrypted,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('test-flow')
  async testFlow(@Body() body: {
    userAddress: string;
    signature: string;
  }) {
    return await this.sealSimpleService.testCompleteFlow(
      body.userAddress,
      body.signature
    );
  }
}
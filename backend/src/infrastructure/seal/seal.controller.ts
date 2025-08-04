import { Controller, Post, Body } from '@nestjs/common';
import { SealService } from './seal.service';

interface SessionMessageDto {
  userAddress: string;
}

@Controller('seal')
export class SealController {
  constructor(private readonly sealService: SealService) {}

  @Post('session-message')
  async getSessionMessage(@Body() dto: SessionMessageDto): Promise<{ message: string }> {
    const messageBytes = await this.sealService.getSessionKeyMessage(dto.userAddress);
    const message = Buffer.from(messageBytes).toString('hex');
    return { message };
  }
}
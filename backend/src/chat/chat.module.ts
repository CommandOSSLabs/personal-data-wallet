import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SummarizationService } from './summarization/summarization.service';
import { MemoryModule } from '../memory/memory.module';

@Module({
  imports: [MemoryModule],
  controllers: [ChatController],
  providers: [ChatService, SummarizationService],
  exports: [ChatService, SummarizationService]
})
export class ChatModule {}
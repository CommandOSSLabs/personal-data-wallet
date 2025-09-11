import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SummarizationService } from './summarization/summarization.service';
import { MemoryModule } from '../memory/memory.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatSession } from './entities/chat-session.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    MemoryModule
  ],
  controllers: [ChatController],
  providers: [ChatService, SummarizationService],
  exports: [ChatService, SummarizationService]
})
export class ChatModule {}
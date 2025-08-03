import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MemoryModule } from './memory/memory.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    InfrastructureModule,
    MemoryModule,
    ChatModule
  ]
})
export class AppModule {}
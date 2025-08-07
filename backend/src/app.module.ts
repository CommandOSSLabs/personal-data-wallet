import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MemoryModule } from './memory/memory.module';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    InfrastructureModule,
    MemoryModule,
    ChatModule,
    StorageModule
  ]
})
export class AppModule {}
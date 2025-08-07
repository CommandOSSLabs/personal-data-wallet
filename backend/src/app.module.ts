import { Module } from '@nestjs/common';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { MemoryModule } from './memory/memory.module';
import { ChatModule } from './chat/chat.module';
<<<<<<< HEAD
=======
import { DatabaseModule } from './database/database.module';
import { StorageModule } from './storage/storage.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
>>>>>>> a6df16e (fix docker file)

@Module({
  imports: [
    InfrastructureModule,
    MemoryModule,
<<<<<<< HEAD
    ChatModule
  ]
=======
    ChatModule,
    StorageModule
  ],
  controllers: [AppController],
  providers: [AppService],
>>>>>>> a6df16e (fix docker file)
})
export class AppModule {}
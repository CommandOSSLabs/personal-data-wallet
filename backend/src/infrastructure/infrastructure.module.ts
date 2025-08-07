import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiService } from './sui/sui.service';
import { WalrusService } from './walrus/walrus.service';
import { CachedWalrusService } from './walrus/cached-walrus.service';
import { SealService } from './seal/seal.service';
import { GeminiService } from './gemini/gemini.service';
import { LocalStorageService } from './local-storage/local-storage.service';
import { StorageService } from './storage/storage.service';
import { DemoStorageService } from './demo-storage/demo-storage.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    SuiService,
    WalrusService,
    CachedWalrusService,
    SealService,
    GeminiService,
    LocalStorageService,
    StorageService,
    DemoStorageService,
  ],
  exports: [
    SuiService,
    WalrusService,
    CachedWalrusService,
    SealService,
    GeminiService,
    LocalStorageService,
    StorageService,
    DemoStorageService,
  ]
})
export class InfrastructureModule {}
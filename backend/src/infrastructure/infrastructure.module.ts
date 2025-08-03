import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiService } from './sui/sui.service';
import { WalrusService } from './walrus/walrus.service';
import { SealService } from './seal/seal.service';
import { GeminiService } from './gemini/gemini.service';

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
    SealService,
    GeminiService,
  ],
  exports: [
    SuiService,
    WalrusService,
    SealService,
    GeminiService,
  ]
})
export class InfrastructureModule {}
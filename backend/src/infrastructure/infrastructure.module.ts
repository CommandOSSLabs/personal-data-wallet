import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiService } from './sui/sui.service';
import { WalrusService } from './walrus/walrus.service';
import { SealService } from './seal/seal.service';
import { SessionKeyService } from './seal/session-key.service';
import { SessionController } from './seal/session.controller';
import { TimelockController } from './seal/timelock.controller';
import { AllowlistController } from './seal/allowlist.controller';
import { RoleController } from './seal/role.controller';
import { AnalyticsController } from './seal/analytics.controller';
import { GeminiService } from './gemini/gemini.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [SessionController, TimelockController, AllowlistController, RoleController, AnalyticsController],
  providers: [
    SuiService,
    WalrusService,
    SealService,
    SessionKeyService,
    GeminiService,
  ],
  exports: [
    SuiService,
    WalrusService,
    SealService,
    SessionKeyService,
    GeminiService,
  ]
})
export class InfrastructureModule {}
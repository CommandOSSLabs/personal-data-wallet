import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiService } from './sui/sui.service';
import { WalrusService } from './walrus/walrus.service';
import { CachedWalrusService } from './walrus/cached-walrus.service';
import { SealService } from './seal/seal.service';
<<<<<<< HEAD
import { SessionKeyService } from './seal/session-key.service';
import { SessionController } from './seal/session.controller';
import { TimelockController } from './seal/timelock.controller';
import { AllowlistController } from './seal/allowlist.controller';
import { RoleController } from './seal/role.controller';
import { AnalyticsController } from './seal/analytics.controller';
import { GeminiService } from './gemini/gemini.service';
=======
import { SealController } from './seal/seal.controller';
// import { SealIBEService } from './seal/seal-ibe.service';  // Disabled - compatibility issues
// import { SealIBEController } from './seal/seal-ibe.controller';
import { GeminiService } from './gemini/gemini.service';
import { SessionStore } from './seal/session-store';
// import { SealSimpleService } from './seal/seal-simple.service';  // Disabled - compatibility issues
// import { SealTestController } from './seal/seal-test.controller';  // Disabled
// Disabled - using standard SEAL Client only
// import { SealOpenModeService } from './seal/seal-open-mode.service';
// import { SealOpenModeController } from './seal/seal-open-mode.controller';
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
<<<<<<< HEAD
  controllers: [SessionController, TimelockController, AllowlistController, RoleController, AnalyticsController],
=======
  controllers: [SealController], // Kept only main SEAL controller
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
  providers: [
    SuiService,
    WalrusService,
    CachedWalrusService,
    SealService,
<<<<<<< HEAD
    SessionKeyService,
=======
    // SealIBEService, // Disabled - compatibility issues
    // SealSimpleService, // Disabled - compatibility issues
    // SealOpenModeService, // Disabled - using standard SEAL Client only
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
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
<<<<<<< HEAD
    SessionKeyService,
=======
    // SealIBEService, // Disabled - compatibility issues
    // SealSimpleService, // Disabled - compatibility issues  
    // SealOpenModeService, // Disabled - using standard SEAL Client only
>>>>>>> 175a8dbc02e99cdf82f694d8be93c895b23ba1e0
    GeminiService,
    LocalStorageService,
    StorageService,
    DemoStorageService,
  ]
})
export class InfrastructureModule {}
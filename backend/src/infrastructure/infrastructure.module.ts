import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuiService } from './sui/sui.service';
import { WalrusService } from './walrus/walrus.service';
import { SealService } from './seal/seal.service';
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

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [SealController], // Kept only main SEAL controller
  providers: [
    SuiService,
    WalrusService,
    SessionStore,
    SealService,
    // SealIBEService, // Disabled - compatibility issues
    // SealSimpleService, // Disabled - compatibility issues
    // SealOpenModeService, // Disabled - using standard SEAL Client only
    GeminiService,
  ],
  exports: [
    SuiService,
    WalrusService,
    SessionStore,
    SealService,
    // SealIBEService, // Disabled - compatibility issues
    // SealSimpleService, // Disabled - compatibility issues  
    // SealOpenModeService, // Disabled - using standard SEAL Client only
    GeminiService,
  ]
})
export class InfrastructureModule {}
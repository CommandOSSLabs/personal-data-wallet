import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [StorageController],
})
export class StorageModule {}

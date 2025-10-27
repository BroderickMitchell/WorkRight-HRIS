import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller.js';
import { PrismaModule } from '../../common/prisma.module.js';
import { PositionsWorkflowController } from './positions-workflow.controller.js';
import { PositionIdSettingsController } from './position-id-settings.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [SeedController, PositionsWorkflowController, PositionIdSettingsController]
})
export class AdminModule {}

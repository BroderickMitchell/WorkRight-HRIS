import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { JobRolesController, PositionManagementConfigController, PositionsController } from './positions.controller.js';
import { PositionsService } from './positions.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PositionsController, JobRolesController, PositionManagementConfigController],
  providers: [PositionsService]
})
export class PositionsModule {}


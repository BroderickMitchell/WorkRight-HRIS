import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { JobsController } from './jobs.controller.js';
import { RequisitionsController } from './requisitions.controller.js';
import { ApplicationsController } from './applications.controller.js';
import { LookupsController } from './lookups.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [JobsController, RequisitionsController, ApplicationsController, LookupsController]
})
export class RecruitmentModule {}


import { Module } from '@nestjs/common';
import { PerformanceController } from './performance.controller.js';
import { PerformanceService } from './performance.service.js';
import { PrismaModule } from '../../common/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PerformanceController],
  providers: [PerformanceService]
})
export class PerformanceModule {}

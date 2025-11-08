import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { PositionsController } from './positions.controller.js';
import { PositionsService } from './positions.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [PositionsController],
  providers: [PositionsService]
})
export class PositionsModule {}

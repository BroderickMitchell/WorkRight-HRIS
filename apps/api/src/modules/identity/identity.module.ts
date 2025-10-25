import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service.js';
import { IdentityController } from './identity.controller.js';
import { PrismaModule } from '../../common/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [IdentityController],
  providers: [IdentityService]
})
export class IdentityModule {}

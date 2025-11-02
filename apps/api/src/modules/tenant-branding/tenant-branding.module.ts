import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { AuditModule } from '../../common/audit.module.js';
import { TenantBrandingController } from './tenant-branding.controller.js';
import { TenantBrandingService } from './tenant-branding.service.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [TenantBrandingController],
  providers: [TenantBrandingService],
  exports: [TenantBrandingService]
})
export class TenantBrandingModule {}

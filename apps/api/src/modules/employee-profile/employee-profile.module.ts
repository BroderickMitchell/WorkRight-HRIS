import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { AuditModule } from '../../common/audit.module.js';
import { EmployeeProfileController } from './employee-profile.controller.js';
import { EmployeeProfileService } from './employee-profile.service.js';
import { DocumentGenerationService } from './services/document-generation.service.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [EmployeeProfileController],
  providers: [EmployeeProfileService, DocumentGenerationService],
  exports: [EmployeeProfileService]
})
export class EmployeeProfileModule {}

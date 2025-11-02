import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module.js';
import { AuditModule } from '../../common/audit.module.js';
import { DocumentsController } from './documents.controller.js';
import { DocumentsService } from './documents.service.js';
import { DocumentGenerationService } from '../employee-profile/services/document-generation.service.js';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentGenerationService],
  exports: [DocumentsService]
})
export class DocumentsModule {}

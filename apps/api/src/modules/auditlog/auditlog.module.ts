import { Module } from '@nestjs/common';
import { AuditLogController } from './auditlog.controller.js';

@Module({
  controllers: [AuditLogController]
})
export class AuditLogModule {}


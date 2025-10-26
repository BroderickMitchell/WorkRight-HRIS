import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AuditService } from '../../common/audit.service.js';
import { RecordAuditDto } from './auditlog.dto.js';

@Controller('audit')
export class AuditLogController {
  constructor(private readonly audit: AuditService) {}

  @Post('events')
  async record(@Body() dto: RecordAuditDto) {
    await this.audit.record({
      entity: dto.entity,
      entityId: dto.entityId,
      action: dto.action,
      changes: dto.changes
    });
    return { ok: true };
  }

  @Get('events')
  async list(@Query('entity') entity?: string, @Query('entityId') entityId?: string, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    const events = await this.audit.list({ entity, entityId, limit: parsedLimit });
    return events;
  }
}

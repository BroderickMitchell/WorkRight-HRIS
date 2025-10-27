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
  async list(
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('action') action?: string,
    @Query('from') from?: string,
    @Query('to') to?: string
  ) {
    const take = limit ? parseInt(limit, 10) : 25;
    const events = await this.audit.list({ entity, entityId, limit: take, cursor, action, from, to });
    const nextCursor = events.length === take ? events[events.length - 1]?.createdAt?.toISOString?.() : undefined;
    return { items: events, nextCursor };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { ClsService } from 'nestjs-cls';

type AuditPayload = {
  entity: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  private readonly logger = new Logger('AuditService');

  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  async record(payload: AuditPayload) {
    const tenantId = this.cls.get('tenantId');
    const actorId = this.cls.get('actorId');
    if (!tenantId) {
      this.logger.warn('Attempted to record audit event without tenant');
      return;
    }
    await this.prisma.auditEvent.create({
      data: {
        tenantId,
        actorId,
        entity: payload.entity,
        entityId: payload.entityId,
        action: payload.action,
        changes: payload.changes,
        metadata: {
          ip: this.cls.get('ip'),
          userAgent: this.cls.get('userAgent')
        }
      }
    });
  }
}

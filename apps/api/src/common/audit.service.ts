import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import type { Prisma } from '@prisma/client';
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
        changes: payload.changes as unknown as Prisma.InputJsonValue,
        metadata: {
          ip: this.cls.get('ip'),
          userAgent: this.cls.get('userAgent')
        }
      }
    });
  }

  async list(params: { entity?: string; entityId?: string; limit?: number; cursor?: string; action?: string; from?: string; to?: string } = {}) {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      this.logger.warn('Attempted to list audit events without tenant');
      return [];
    }
    const where: any = { tenantId };
    if (params.entity) where.entity = params.entity;
    if (params.entityId) where.entityId = params.entityId;
    if (params.action) where.action = params.action;
    // createdAt range filters
    let createdAt: any = undefined;
    if (params.from) {
      const dt = new Date(params.from);
      if (!isNaN(dt.getTime())) createdAt = { ...(createdAt ?? {}), gte: dt };
    }
    if (params.to) {
      const dt = new Date(params.to);
      if (!isNaN(dt.getTime())) createdAt = { ...(createdAt ?? {}), lte: dt };
    }
    if (params.cursor) {
      const dt = new Date(params.cursor);
      if (!isNaN(dt.getTime())) {
        createdAt = { ...(createdAt ?? {}), lt: dt };
      }
    }
    if (createdAt) where.createdAt = createdAt;
    const take = Math.min(Math.max(params.limit ?? 100, 1), 500);
    return this.prisma.auditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, take });
  }
}

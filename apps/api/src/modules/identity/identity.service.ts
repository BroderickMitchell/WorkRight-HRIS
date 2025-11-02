import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateTenantDto, CreateUserDto } from './identity.dto.js';
import { AuditService } from '../../common/audit.service.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  createTenant(dto: CreateTenantDto) {
    const now = new Date().toISOString();
    const settings = {
      branding: {
        primaryColor: dto.brandingPrimaryColor ?? '#004c97',
        accentColor: dto.accentColor ?? '#1c7ed6',
        surfaceColor: dto.surfaceColor ?? '#ffffff',
        darkMode: false
      },
      assets: {},
      emails: {
        supportEmail: dto.supportEmail ?? '',
        subjectPrefix: ''
      },
      legal: {
        address: dto.address ?? null
      },
      maintenanceMode: dto.maintenanceMode ?? false,
      updatedAt: now
    } satisfies Record<string, unknown>;

    return this.prisma.tenant.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        slug: dto.slug,
        locale: dto.locale ?? 'en-AU',
        timezone: dto.timezone ?? 'Australia/Sydney',
        currency: dto.currency ?? 'AUD',
        supportEmail: dto.supportEmail ?? null,
        address: dto.address ?? null,
        settings: settings as Prisma.InputJsonValue
      }
    });
  }

  async createUser(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        givenName: dto.givenName,
        familyName: dto.familyName,
        tenantId: dto.tenantId,
        roles: dto.roles
      }
    });
    await this.audit.record({
      entity: 'user',
      entityId: user.id,
      action: 'created',
      changes: { roles: dto.roles }
    });
    return user;
  }

  getTenantSettings(slug: string) {
    return this.prisma.tenant.findUnique({ where: { slug } });
  }
}

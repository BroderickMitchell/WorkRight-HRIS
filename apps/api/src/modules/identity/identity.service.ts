import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateTenantDto, CreateUserDto } from './identity.dto.js';
import { AuditService } from '../../common/audit.service.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class IdentityService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  createTenant(dto: CreateTenantDto) {
    return this.prisma.tenant.create({
      data: {
        id: randomUUID(),
        name: dto.name,
        slug: dto.slug,
        locale: dto.locale ?? 'en-AU',
        settings: {
          brandingPrimaryColor: dto.brandingPrimaryColor ?? '#004c97',
          maintenanceMode: dto.maintenanceMode ?? false
        }
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

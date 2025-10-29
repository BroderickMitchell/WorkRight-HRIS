import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { mergeRoles, isAppRole } from './auth/role-mapping.js';
import type { AppRole } from './auth/roles.decorator.js';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly demoMode: boolean;

  constructor(private readonly cls: ClsService, private readonly configService: ConfigService) {
    this.demoMode = this.configService.get<boolean>('demoMode') ?? false;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (
      request.path?.startsWith('/health') ||
      (request.path?.startsWith('/v1/identity/tenants') && request.method === 'POST')
    ) {
      return true;
    }
    const tenantIdFromUser = typeof request.user?.tenantId === 'string' ? request.user.tenantId : undefined;
    const tenantHeader = Array.isArray(request.headers['x-tenant-id'])
      ? request.headers['x-tenant-id'][0]
      : (request.headers['x-tenant-id'] as string | undefined);

    const tenantId = tenantIdFromUser ?? (this.demoMode ? tenantHeader : undefined);

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    const headerRolesRaw = this.demoMode
      ? Array.isArray(request.headers['x-roles'])
        ? request.headers['x-roles'].join(',')
        : (request.headers['x-roles'] as string | undefined)
      : undefined;

    const userRolesRaw = Array.isArray(request.user?.roles)
      ? (request.user.roles as (string | undefined)[]).filter(
          (role): role is AppRole => typeof role === 'string' && isAppRole(role)
        ).join(',')
      : typeof request.user?.roles === 'string'
        ? request.user.roles
        : undefined;

    const { appRoles, roleKeys } = mergeRoles([userRolesRaw, headerRolesRaw]);

    request.appRoles = appRoles;
    request.roleKeys = roleKeys;
    request.tenantId = tenantId;

    this.cls.set('tenantId', tenantId);
    this.cls.set('actorId', request.user?.id ?? 'anonymous');
    this.cls.set('actorAppRoles', appRoles);
    this.cls.set('actorRoleKeys', roleKeys);
    this.cls.set('ip', request.ip);
    this.cls.set('userAgent', request.headers['user-agent']);
    return true;
  }
}


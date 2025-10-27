import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { mergeRoles, isAppRole } from './auth/role-mapping.js';
import type { AppRole } from './auth/roles.decorator.js';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly cls: ClsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (
      request.path?.startsWith('/health') ||
      (request.path?.startsWith('/v1/identity/tenants') && request.method === 'POST')
    ) {
      return true;
    }
    const tenantHeader = request.headers['x-tenant-id'];
    const tenantId = Array.isArray(tenantHeader) ? tenantHeader[0] : tenantHeader;

    if (!tenantId) {
      throw new UnauthorizedException('Missing tenant context');
    }

    const headerRolesRaw = Array.isArray(request.headers['x-roles'])
      ? request.headers['x-roles'].join(',')
      : (request.headers['x-roles'] as string | undefined);

    const userRoles = Array.isArray(request.user?.roles)
      ? (request.user.roles as (string | undefined)[]).filter(
          (role): role is AppRole => typeof role === 'string' && isAppRole(role)
        )
      : [];

    const userRolesString = userRoles.length ? userRoles.join(',') : undefined;
    const { appRoles, roleKeys } = mergeRoles([userRolesString, headerRolesRaw]);

    request.appRoles = appRoles;
    request.roleKeys = roleKeys;

    this.cls.set('tenantId', tenantId);
    this.cls.set('actorId', request.user?.id ?? 'anonymous');
    this.cls.set('actorAppRoles', appRoles);
    this.cls.set('actorRoleKeys', roleKeys);
    this.cls.set('ip', request.ip);
    this.cls.set('userAgent', request.headers['user-agent']);
    return true;
  }
}


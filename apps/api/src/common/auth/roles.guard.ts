import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator.js';
import { mergeRoles, appRolesToRoleKeys } from './role-mapping.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const req = context.switchToHttp().getRequest();
    const existingRoles: AppRole[] = req.appRoles ?? [];
    const userRoles = Array.isArray(req.user?.roles)
      ? (req.user.roles as (string | undefined)[]).filter((role): role is string => typeof role === 'string' && role.length > 0)
      : undefined;
    const headerRolesRaw = Array.isArray(req.headers['x-roles'])
      ? req.headers['x-roles'].join(',')
      : (req.headers['x-roles'] as string | undefined);

    const { appRoles } = mergeRoles(
      [
        existingRoles.length ? existingRoles.join(',') : undefined,
        userRoles?.length ? userRoles.join(',') : undefined,
        headerRolesRaw
      ]
    );

    req.appRoles = appRoles;
    if (!req.roleKeys || req.roleKeys.length === 0) {
      req.roleKeys = appRolesToRoleKeys(appRoles);
    }

    if (!required || required.length === 0) {
      return true;
    }

    if (!appRoles.length) throw new UnauthorizedException('Missing roles');
    const ok = required.some((role) => appRoles.includes(role));
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}


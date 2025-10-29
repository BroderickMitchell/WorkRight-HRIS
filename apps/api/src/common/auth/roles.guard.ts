import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator.js';
import { appRolesToRoleKeys, isAppRole } from './role-mapping.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    const req = context.switchToHttp().getRequest();
    const appRoles: AppRole[] = Array.isArray(req.appRoles)
      ? req.appRoles
      : Array.isArray(req.user?.roles)
        ? (req.user.roles as (string | undefined)[]).filter(
            (role): role is AppRole => typeof role === 'string' && isAppRole(role)
          )
        : [];

    req.appRoles = appRoles;
    if (!req.roleKeys || req.roleKeys.length === 0) {
      req.roleKeys = appRolesToRoleKeys(appRoles);
    }

    if (!required || required.length === 0) {
      return true;
    }

    if (!req.appRoles.length) throw new UnauthorizedException('Missing roles');
    const ok = required.some((role) => req.appRoles.includes(role));
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}


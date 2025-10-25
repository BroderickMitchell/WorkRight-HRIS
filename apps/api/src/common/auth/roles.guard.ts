import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY, AppRole } from './roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AppRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as { roles?: string[] } | undefined;

    // Demo fallback: allow providing roles via header for testing
    const headerRoles = (req.headers['x-roles'] as string | undefined)?.split(',').map((r) => r.trim());
    const roles = user?.roles ?? headerRoles ?? [];

    if (!roles || roles.length === 0) throw new UnauthorizedException('Missing roles');
    const ok = required.some((role) => roles.includes(role));
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }
}


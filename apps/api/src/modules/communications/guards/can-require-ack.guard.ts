import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { RoleKey } from '../../../types/roles';

const ALLOWED: RoleKey[] = [RoleKey.SYSTEM_OWNER, RoleKey.MANAGER, RoleKey.SUPERVISOR];

@Injectable()
export class CanRequireAckGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const requireAck = request.body?.requireAck;

    if (!requireAck) return true;

    const roleKeys: RoleKey[] = Array.isArray(request.roleKeys) ? request.roleKeys : [];
    const allowed = roleKeys.some((role) => ALLOWED.includes(role));
    if (!allowed) {
      throw new ForbiddenException('Ack-required posts are limited to admin, manager or supervisor roles');
    }
    return true;
  }
}

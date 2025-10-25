import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

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
    this.cls.set('tenantId', tenantId);
    this.cls.set('actorId', request.user?.id ?? 'anonymous');
    this.cls.set('ip', request.ip);
    this.cls.set('userAgent', request.headers['user-agent']);
    return true;
  }
}

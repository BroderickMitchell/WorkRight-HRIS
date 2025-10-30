import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser>(
    err: unknown,
    user: TUser,
    info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || info) {
      const message =
        (info as { message?: string } | undefined)?.message ?? 'Invalid authentication token';
      throw err || new UnauthorizedException(message);
    }

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    return user;
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

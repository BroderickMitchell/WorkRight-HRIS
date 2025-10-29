import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: unknown, user: Express.User | false | null, info?: Error) {
    if (err || info) {
      throw err || new UnauthorizedException(info?.message ?? 'Invalid authentication token');
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

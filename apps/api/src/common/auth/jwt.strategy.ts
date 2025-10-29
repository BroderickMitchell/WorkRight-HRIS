import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email?: string;
  tenantId?: string;
  tenant_id?: string;
  roles?: string[] | string;
  [key: string]: unknown;
}

const parseAudience = (raw?: string): string | string[] | undefined => {
  if (!raw) return undefined;
  const parts = raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  if (parts.length === 0) {
    return undefined;
  }
  return parts.length === 1 ? parts[0] : parts;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT secret is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      issuer: configService.get<string>('jwt.issuer') ?? undefined,
      audience: parseAudience(configService.get<string>('jwt.audience') ?? undefined)
    });
  }

  validate(payload: JwtPayload): Express.User {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid authentication payload');
    }

    const roles = Array.isArray(payload.roles)
      ? payload.roles
      : typeof payload.roles === 'string'
        ? payload.roles.split(',')
        : undefined;

    return {
      id: payload.sub,
      email: payload.email,
      tenantId: (payload.tenantId ?? payload.tenant_id) as string | undefined,
      roles
    };
  }
}

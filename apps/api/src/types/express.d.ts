import type { AppRole } from '../common/auth/roles.decorator';
import type { RoleKey } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    appRoles?: AppRole[];
    roleKeys?: RoleKey[];
  }
}


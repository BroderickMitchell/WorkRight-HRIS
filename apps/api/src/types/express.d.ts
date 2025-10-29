import type { AppRole } from '../common/auth/roles.decorator';
import type { RoleKey } from '@prisma/client';

declare module 'express-serve-static-core' {
  interface Request {
    appRoles?: AppRole[];
    roleKeys?: RoleKey[];
    tenantId?: string;
  }
}

declare global {
  namespace Express {
    interface User {
      id?: string;
      email?: string;
      tenantId?: string;
      roles?: string[] | AppRole[];
    }
  }
}


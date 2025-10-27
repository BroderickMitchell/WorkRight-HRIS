import { SetMetadata } from '@nestjs/common';

export type AppRole =
  | 'HR_ADMIN'
  | 'HRBP'
  | 'PAYROLL'
  | 'FINANCE'
  | 'EXEC'
  | 'MANAGER'
  | 'EMPLOYEE'
  | 'COMPLIANCE_OFFICER'
  | 'IT_ASSET_ADMIN'
  | 'AUDITOR';

export const ROLES_KEY = 'app_roles_required';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);

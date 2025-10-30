import { AppRole } from './roles.decorator.js';

export type RoleKey = 'SYSTEM_OWNER' | 'HR_BUSINESS_PARTNER' | 'MANAGER' | 'EMPLOYEE' | 'AUDITOR';

const APP_ROLES: AppRole[] = [
  'HR_ADMIN',
  'HRBP',
  'PAYROLL',
  'FINANCE',
  'EXEC',
  'MANAGER',
  'EMPLOYEE',
  'COMPLIANCE_OFFICER',
  'IT_ASSET_ADMIN',
  'AUDITOR'
];

const ROLE_MAP: Record<AppRole, RoleKey> = {
  HR_ADMIN: 'SYSTEM_OWNER',
  HRBP: 'HR_BUSINESS_PARTNER',
  PAYROLL: 'SYSTEM_OWNER',
  FINANCE: 'SYSTEM_OWNER',
  EXEC: 'SYSTEM_OWNER',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
  COMPLIANCE_OFFICER: 'AUDITOR',
  IT_ASSET_ADMIN: 'SYSTEM_OWNER',
  AUDITOR: 'AUDITOR'
};

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}

export function parseAppRoles(raw?: string | string[] | null): AppRole[] {
  if (!raw) return [];
  const source = Array.isArray(raw) ? raw.join(',') : raw;
  return source
    .split(',')
    .map((role) => role.trim().toUpperCase())
    .filter((role): role is AppRole => isAppRole(role));
}

export function appRolesToRoleKeys(appRoles: AppRole[]): RoleKey[] {
  const keys = new Set<RoleKey>();
  for (const role of appRoles) {
    const mapped = ROLE_MAP[role];
    if (mapped) keys.add(mapped);
  }
  return Array.from(keys);
}

export function mergeRoles(
  candidateRoles: Array<string | undefined | null>,
  fallbackRoles: AppRole[] = []
): { appRoles: AppRole[]; roleKeys: RoleKey[] } {
  for (const candidate of candidateRoles) {
    const parsed = parseAppRoles(candidate);
    if (parsed.length > 0) {
      return { appRoles: parsed, roleKeys: appRolesToRoleKeys(parsed) };
    }
  }
  return { appRoles: fallbackRoles, roleKeys: appRolesToRoleKeys(fallbackRoles) };
}

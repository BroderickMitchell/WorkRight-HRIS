export interface ApiOptions {
  tenant?: string;
  token?: string;
  roles?: string; // comma-separated demo roles
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getTenantId(): string {
  if (typeof window === 'undefined') return 'tenant-demo';
  try {
    const raw = localStorage.getItem('tenantId');
    return raw ? JSON.parse(raw) : 'tenant-demo';
  } catch {
    return 'tenant-demo';
  }
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const tenant = options.tenant ?? getTenantId();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenant,
      'X-Roles': options.roles ?? (typeof window !== 'undefined' ? (localStorage.getItem('demoRoles') ?? 'HRBP,MANAGER') : 'HRBP,MANAGER'),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any, options: ApiOptions = {}): Promise<T> {
  const tenant = options.tenant ?? getTenantId();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': tenant,
      'X-Roles': options.roles ?? (typeof window !== 'undefined' ? (localStorage.getItem('demoRoles') ?? 'HRBP,MANAGER') : 'HRBP,MANAGER'),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: JSON.stringify(body),
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json().catch(() => ({} as T));
}


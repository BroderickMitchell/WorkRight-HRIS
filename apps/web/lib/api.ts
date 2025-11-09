export interface ApiOptions {
  tenant?: string;
  token?: string;
  roles?: string;
  cache?: RequestCache;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEMO_ROLES_STORAGE_KEY = 'demoRoles';
export const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'tenant-acme';
const DEFAULT_DEMO_ROLES = process.env.NEXT_PUBLIC_DEMO_ROLES ?? 'HR_ADMIN,MANAGER';
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export function getTenantId(): string {
  if (typeof window === 'undefined') return DEFAULT_TENANT_ID;
  try {
    const raw = window.localStorage.getItem('tenantId');
    return raw ? JSON.parse(raw) : DEFAULT_TENANT_ID;
  } catch {
    return DEFAULT_TENANT_ID;
  }
}

const getDemoRoles = (): string => {
  if (typeof window === 'undefined') {
    return DEFAULT_DEMO_ROLES;
  }
  const stored = window.localStorage.getItem(DEMO_ROLES_STORAGE_KEY);
  return stored && stored.length > 0 ? stored : DEFAULT_DEMO_ROLES;
};

const buildHeaders = (options: ApiOptions = {}): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (isDemoMode) {
    headers['X-Tenant-Id'] = options.tenant ?? getTenantId();
    headers['X-Roles'] = options.roles ?? getDemoRoles();
  }

  return headers;
};

const withCache = (init: RequestInit, cache?: RequestCache): RequestInit =>
  cache ? { ...init, cache } : init;

const readJson = async <T>(res: Response): Promise<T> => {
  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
};

const fail = async (res: Response) => {
  const body = await res.text().catch(() => '');
  throw new Error(`API ${res.status} ${res.statusText}${body ? ` - ${body}` : ''}`);
};

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, withCache({ headers: buildHeaders(options) }, options.cache));
  if (!res.ok) return fail(res);
  return readJson<T>(res);
}

export async function apiPost<T = any>(path: string, body: unknown, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(
    `${BASE_URL}${path}`,
    withCache(
      {
        method: 'POST',
        headers: buildHeaders(options),
        body: JSON.stringify(body)
      },
      options.cache
    )
  );
  if (!res.ok) return fail(res);
  return readJson<T>(res);
}

export async function apiPatch<T = any>(path: string, body: unknown, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(
    `${BASE_URL}${path}`,
    withCache(
      {
        method: 'PATCH',
        headers: buildHeaders(options),
        body: JSON.stringify(body)
      },
      options.cache
    )
  );
  if (!res.ok) return fail(res);
  return readJson<T>(res);
}

export async function apiPut<T = any>(path: string, body: unknown, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(
    `${BASE_URL}${path}`,
    withCache(
      {
        method: 'PUT',
        headers: buildHeaders(options),
        body: JSON.stringify(body)
      },
      options.cache
    )
  );
  if (!res.ok) return fail(res);
  return readJson<T>(res);
}

export async function apiDelete<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const res = await fetch(
    `${BASE_URL}${path}`,
    withCache(
      {
        method: 'DELETE',
        headers: buildHeaders(options)
      },
      options.cache
    )
  );
  if (!res.ok) return fail(res);
  return readJson<T>(res);
}

export function setDemoRoles(rolesCsv: string) {
  if (typeof window !== 'undefined') localStorage.setItem('demoRoles', rolesCsv);
}

export function setTenantId(tenantId: string) {
  if (typeof window !== 'undefined') localStorage.setItem('tenantId', JSON.stringify(tenantId));
}

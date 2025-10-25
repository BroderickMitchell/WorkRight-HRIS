export interface ApiOptions {
  tenant: string;
  token?: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch<T>(path: string, options: ApiOptions): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Id': options.tenant,
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status}`);
  }
  return res.json();
}

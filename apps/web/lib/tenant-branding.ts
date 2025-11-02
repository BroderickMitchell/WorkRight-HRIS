import {
  tenantBrandingSchema,
  updateTenantBrandingSchema,
  type TenantBranding,
  type UpdateTenantBrandingInput
} from '@workright/profile-schema';
import { apiFetch, apiPut } from './api';

export async function fetchTenantBranding(): Promise<TenantBranding> {
  const data = await apiFetch('/v1/tenant/branding', { cache: 'no-store' });
  return tenantBrandingSchema.parse(data);
}

export async function updateTenantBranding(input: UpdateTenantBrandingInput): Promise<TenantBranding> {
  const payload = updateTenantBrandingSchema.parse(input);
  const data = await apiPut('/v1/tenant/branding', payload);
  return tenantBrandingSchema.parse(data);
}

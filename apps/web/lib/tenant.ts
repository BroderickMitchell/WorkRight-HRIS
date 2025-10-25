import { parseTenantSettings } from '@workright/config';

type TenantSettingsInput = Partial<Parameters<typeof parseTenantSettings>[0]>;

export function getTenantSettings(input: TenantSettingsInput = {}) {
  return parseTenantSettings({
    brandingPrimaryColor: '#004c97',
    brandName: 'WorkRight HRIS',
    brandTagline: 'People platform for Australian organisations',
    brandLogoUrl: '',
    locale: 'en-AU',
    paySchedule: 'fortnightly',
    leavePolicies: [],
    ...input
  });
}

export function hexToRgbString(hex: string) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

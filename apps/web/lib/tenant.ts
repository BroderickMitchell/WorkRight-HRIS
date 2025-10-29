import type { CSSProperties } from 'react';

import { parseTenantSettings } from '@workright/config';

type TenantSettingsBaseInput = Partial<Parameters<typeof parseTenantSettings>[0]>;

type TenantSettingsExtras = {
  featureFlags?: Record<string, boolean>;
  tenantName?: string;
  tenantTagline?: string;
  brandingAccentColor?: string;
};

export type WorkRightTenantSettings = ReturnType<typeof parseTenantSettings> & {
  featureFlags: Record<string, boolean>;
  tenantName: string;
  tenantTagline?: string;
  brandingAccentColor?: string;
};

export function getTenantSettings(input: TenantSettingsBaseInput & TenantSettingsExtras = {}): WorkRightTenantSettings {
  const { featureFlags, tenantName, tenantTagline, brandingAccentColor, ...rest } = input;
  const parsed = parseTenantSettings({
    brandingPrimaryColor: '#004c97',
    locale: 'en-AU',
    paySchedule: 'fortnightly',
    leavePolicies: [],
    ...rest
  });
  return {
    ...parsed,
    brandingAccentColor: brandingAccentColor ?? '#5046e5',
    featureFlags: {
      canManageSettings: true,
      ...(featureFlags ?? {})
    },
    tenantName: tenantName ?? 'WorkRight HRIS',
    tenantTagline: tenantTagline ?? 'Empowering Aussie teams'
  };
}

export function hexToRgbString(hex: string) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

export function getTenantCssVariables(settings = getTenantSettings()): CSSProperties {
  const cssVariables = {
    '--wr-primary': hexToRgbString(settings.brandingPrimaryColor ?? '#004c97'),
    '--wr-accent': hexToRgbString(settings.brandingAccentColor ?? '#5046e5')
  } satisfies CSSProperties;

  return cssVariables;
}

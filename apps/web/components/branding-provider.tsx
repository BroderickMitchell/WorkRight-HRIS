"use client";

import { useEffect } from 'react';

export type SiteSettings = {
  brandingPrimaryColor?: string;
  brandingAccentColor?: string;
  logoUrl?: string;
};

function hexToRgbString(hex: string) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

function getContrastText(hex: string) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '15 23 42' : '255 255 255';
}

function applyBranding(settings: SiteSettings) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (settings.brandingPrimaryColor) {
    root.style.setProperty('--wr-primary', hexToRgbString(settings.brandingPrimaryColor));
    root.style.setProperty('--wr-primary-contrast', getContrastText(settings.brandingPrimaryColor));
  }
  if (settings.brandingAccentColor) {
    root.style.setProperty('--wr-accent', hexToRgbString(settings.brandingAccentColor));
  }
  if (settings.logoUrl) {
    root.style.setProperty('--tenant-logo', `url(${settings.logoUrl})`);
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem('siteSettings');
      if (raw) {
        const parsed = JSON.parse(raw) as SiteSettings;
        applyBranding(parsed);
      }
    } catch {}

    const handler = (e: StorageEvent) => {
      if (e.key === 'siteSettings' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as SiteSettings;
          applyBranding(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return <>{children}</>;
}

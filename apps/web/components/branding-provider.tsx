"use client";
import { useEffect } from 'react';

type SiteSettings = {
  brandingPrimaryColor?: string; // hex like #004c97
};

function hexToRgbString(hex: string) {
  const value = hex.replace('#', '');
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r} ${g} ${b}`;
}

function applyBranding(settings: SiteSettings) {
  if (typeof document === 'undefined') return;
  const color = settings.brandingPrimaryColor;
  if (color) {
    document.documentElement.style.setProperty('--tenant-primary', hexToRgbString(color));
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


"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';

type SiteSettings = {
  brandingPrimaryColor: string; // hex
};

const DEFAULT_SETTINGS: SiteSettings = {
  brandingPrimaryColor: '#004c97'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('siteSettings');
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function save() {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    // notify other tabs and BrandingProvider
    window.dispatchEvent(new StorageEvent('storage', { key: 'siteSettings', newValue: JSON.stringify(settings) } as any));
    alert('Settings saved');
  }

  return (
    <div className="space-y-6" aria-label="Site settings">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <p className="text-slate-600">Control the look and feel of your site.</p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Primary color affects buttons, badges, and accents.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex items-center gap-4 p-6 pt-0">
          <label className="text-sm font-medium text-slate-700" htmlFor="brandColor">
            Primary color
          </label>
          <input
            id="brandColor"
            type="color"
            value={settings.brandingPrimaryColor}
            onChange={(e) => setSettings((s) => ({ ...s, brandingPrimaryColor: e.target.value }))}
            className="h-10 w-16 cursor-pointer rounded border border-slate-300 bg-white"
          />
          <Button className="ml-auto" onClick={save}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}


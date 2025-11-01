"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { apiFetch, apiPost } from '../../lib/api';

export type SettingsTab = 'branding' | 'tenant' | 'pay';

export interface SettingsPageProps {
  initialTab?: SettingsTab;
}

type SiteSettings = {
  brandingPrimaryColor: string;
};

type TenantProfile = {
  name: string;
  tagline?: string;
  supportEmail: string;
  website?: string;
};

const SITE_SETTINGS_KEY = 'siteSettings';
const TENANT_PROFILE_KEY = 'tenantProfile';

const DEFAULT_SETTINGS: SiteSettings = {
  brandingPrimaryColor: '#004c97'
};

const DEFAULT_TENANT_PROFILE: TenantProfile = {
  name: 'Acme Mining Co',
  tagline: 'Powering safe production',
  supportEmail: 'people@acme.example.au',
  website: 'https://acme-mining.example'
};

function emitStorageEvent(key: string, value: unknown) {
  try {
    window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(value) } as StorageEventInit));
  } catch {
    // no-op; some browsers prevent constructing StorageEvent
  }
}

export default function SettingsPageClient({ initialTab = 'branding' }: SettingsPageProps = {}) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [tenantProfile, setTenantProfile] = useState<TenantProfile>(DEFAULT_TENANT_PROFILE);

  const searchParams = useSearchParams();
  const paramTab = searchParams?.get('tab');
  const resolvedInitialTab = useMemo<SettingsTab>(() => {
    if (paramTab === 'tenant' || paramTab === 'pay' || paramTab === 'branding') {
      return paramTab;
    }
    return initialTab;
  }, [initialTab, paramTab]);
  const [tab, setTab] = useState<SettingsTab>(resolvedInitialTab);

  useEffect(() => {
    setTab(resolvedInitialTab);
  }, [resolvedInitialTab]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SITE_SETTINGS_KEY);
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
    try {
      const rawProfile = localStorage.getItem(TENANT_PROFILE_KEY);
      if (rawProfile) setTenantProfile({ ...DEFAULT_TENANT_PROFILE, ...JSON.parse(rawProfile) });
    } catch {
      setTenantProfile(DEFAULT_TENANT_PROFILE);
    }
  }, []);

  function saveBrand() {
    localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
    emitStorageEvent(SITE_SETTINGS_KEY, settings);
    alert('Branding updated');
  }

  function saveTenantProfile() {
    localStorage.setItem(TENANT_PROFILE_KEY, JSON.stringify(tenantProfile));
    emitStorageEvent(TENANT_PROFILE_KEY, tenantProfile);
    window.dispatchEvent(new CustomEvent('tenantProfile:update', { detail: tenantProfile }));
    alert('Tenant settings saved');
  }

  // Pay profiles
  const [empId, setEmpId] = useState('emp-acme-manager');
  const [rate, setRate] = useState<string>('');

  async function loadProfile() {
    try {
      const data = await apiFetch<any>(`/v1/payroll/profiles/${empId}`);
      const cents = typeof data?.baseRateCents === 'number' ? String(data.baseRateCents) : '';
      setRate(cents);
    } catch {
      setRate('');
    }
  }
  async function saveProfile() {
    const cents = parseInt(rate || '0', 10);
    await apiPost(`/v1/payroll/profiles`, { employeeId: empId, baseRateCents: cents }, { roles: 'PAYROLL,HR_ADMIN' });
    await loadProfile();
  }

  return (
    <div className="space-y-6" aria-label="Workspace settings">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant={tab === 'branding' ? 'primary' : 'secondary'} aria-pressed={tab === 'branding'} onClick={() => setTab('branding')}>
            Branding
          </Button>
          <Button variant={tab === 'tenant' ? 'primary' : 'secondary'} aria-pressed={tab === 'tenant'} onClick={() => setTab('tenant')}>
            Tenant settings
          </Button>
          <Button variant={tab === 'pay' ? 'primary' : 'secondary'} aria-pressed={tab === 'pay'} onClick={() => setTab('pay')}>
            Pay profiles
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Admin shortcuts</CardTitle>
            <CardDescription>Quick links to frequently used configuration screens.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0 text-sm">
          <ul className="space-y-2">
            <li>
              Manage position ID formats:{' '}
              <a href="/settings/ids" className="text-brand hover:underline">
                Position ID settings
              </a>
            </li>
            <li>
              Configure workflow templates:{' '}
              <a href="/settings/workflows" className="text-brand hover:underline">
                Workflow settings
              </a>
            </li>
          </ul>
        </div>
      </Card>

      {tab === 'branding' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Primary color affects buttons, badges, and accents across the workspace.</CardDescription>
            </div>
          </CardHeader>
          <div className="flex flex-wrap items-center gap-4 p-6 pt-0">
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
            <Button onClick={saveBrand}>Save changes</Button>
          </div>
        </Card>
      )}

      {tab === 'tenant' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Tenant profile</CardTitle>
              <CardDescription>Surface organisation details in the header, sidebar, and notifications.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="tenantName">
                Company name
              </label>
              <input
                id="tenantName"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={tenantProfile.name}
                onChange={(e) => setTenantProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700" htmlFor="tenantTagline">
                Tagline (optional)
              </label>
              <input
                id="tenantTagline"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={tenantProfile.tagline ?? ''}
                onChange={(e) => setTenantProfile((p) => ({ ...p, tagline: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="tenantEmail">
                Support email
              </label>
              <input
                id="tenantEmail"
                type="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={tenantProfile.supportEmail}
                onChange={(e) => setTenantProfile((p) => ({ ...p, supportEmail: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="tenantWebsite">
                Website
              </label>
              <input
                id="tenantWebsite"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={tenantProfile.website ?? ''}
                onChange={(e) => setTenantProfile((p) => ({ ...p, website: e.target.value }))}
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-3">
              <Button variant="secondary" onClick={() => setTenantProfile(DEFAULT_TENANT_PROFILE)}>
                Reset
              </Button>
              <Button onClick={saveTenantProfile}>Save tenant profile</Button>
            </div>
            <div className="md:col-span-2 rounded-lg border border-dashed border-border bg-panel/60 p-4 text-sm text-slate-600">
              Demo-ready data is preloaded for the <span className="font-medium text-foreground">Acme Mining Co</span> tenant.
              Use the navigation to explore employees, rosters, travel, and payroll records without running any seed scripts.
            </div>
          </div>
        </Card>
      )}

      {tab === 'pay' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pay profiles</CardTitle>
              <CardDescription>Update employee hourly base rates in cents.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="payEmployee">
                Employee ID
              </label>
              <input
                id="payEmployee"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="payRate">
                Base rate (cents)
              </label>
              <input
                id="payRate"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                value={rate}
                onChange={(e) => setRate(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div className="md:col-span-2 flex items-center gap-3">
              <Button variant="secondary" onClick={loadProfile}>
                Load profile
              </Button>
              <Button onClick={saveProfile}>Save changes</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

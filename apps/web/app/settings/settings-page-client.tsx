"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import type { TenantBranding } from '@workright/profile-schema';
import { apiFetch, apiPost } from '../../lib/api';
import { fetchTenantBranding, updateTenantBranding } from '../../lib/tenant-branding';

export type SettingsTab = 'branding' | 'tenant' | 'pay';

export interface SettingsPageProps {
  initialTab?: SettingsTab;
}

type TenantProfile = {
  name: string;
  tagline?: string;
  supportEmail: string;
  website?: string;
};

type AssetKind = 'logo' | 'emailLogo' | 'loginHero' | 'favicon';

type PendingAssets = Partial<Record<AssetKind, File | null>>;

type AssetRemovals = Partial<Record<AssetKind, boolean>>;

const DEFAULT_TENANT_PROFILE: TenantProfile = {
  name: 'Acme Mining Co',
  tagline: 'Powering safe production',
  supportEmail: 'people@acme.example.au',
  website: 'https://acme-mining.example'
};

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const resolveAssetUrl = (path?: string | null) => (path ? new URL(path, apiBase).toString() : null);
const ACCEPTED_IMAGE_TYPES = 'image/png,image/jpeg,image/svg+xml,image/webp,image/gif,image/x-icon';

async function fileToUpload(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  const base64 = btoa(binary);
  const extension = file.name.split('.').pop()?.toLowerCase();
  const inferredMime =
    file.type ||
    (extension === 'svg'
      ? 'image/svg+xml'
      : extension === 'png'
        ? 'image/png'
        : extension === 'jpg' || extension === 'jpeg'
          ? 'image/jpeg'
          : extension === 'webp'
            ? 'image/webp'
            : extension === 'gif'
              ? 'image/gif'
              : extension === 'ico'
                ? 'image/x-icon'
                : 'application/octet-stream');
  return {
    filename: file.name,
    mimeType: inferredMime,
    data: base64
  };
}

function BrandingPreview({
  primaryColor,
  accentColor,
  surfaceColor,
  darkMode,
  logoUrl
}: {
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
  darkMode: boolean;
  logoUrl?: string | null;
}) {
  return (
    <div
      className="rounded-lg border border-slate-200 shadow-sm"
      style={{ backgroundColor: surfaceColor, color: darkMode ? '#f8fafc' : '#1e293b' }}
    >
      <header
        className="flex items-center justify-between rounded-t-lg px-4 py-3"
        style={{ backgroundColor: primaryColor, color: '#fff' }}
      >
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt="Tenant logo" className="h-8 w-auto rounded" />
          ) : (
            <span className="text-sm font-semibold uppercase tracking-wide">Workspace</span>
          )}
          <span className="text-sm font-medium">Dashboard</span>
        </div>
        <Button size="sm" style={{ backgroundColor: accentColor, borderColor: accentColor }}>
          New request
        </Button>
      </header>
      <div className="px-4 py-6 text-sm">
        <p className="font-medium">Theme preview</p>
        <p className="text-slate-500">Buttons and highlights follow the accent colour, while surfaces respect your base tone.</p>
      </div>
    </div>
  );
}

export default function SettingsPageClient({ initialTab = 'branding' }: SettingsPageProps = {}) {
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

  const [tenantProfile, setTenantProfile] = useState<TenantProfile>(DEFAULT_TENANT_PROFILE);
  const [profileInitialised, setProfileInitialised] = useState(false);

  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [brandingLoading, setBrandingLoading] = useState(true);
  const [brandingError, setBrandingError] = useState<string | null>(null);
  const [brandingMessage, setBrandingMessage] = useState<string | null>(null);
  const [savingBranding, setSavingBranding] = useState(false);

  const [primaryColor, setPrimaryColor] = useState('#004c97');
  const [accentColor, setAccentColor] = useState('#5046e5');
  const [surfaceColor, setSurfaceColor] = useState('#ffffff');
  const [darkMode, setDarkMode] = useState(false);
  const [supportEmail, setSupportEmail] = useState('people@example.com');
  const [legalAddress, setLegalAddress] = useState('');
  const [subjectPrefix, setSubjectPrefix] = useState('');
  const [pendingAssets, setPendingAssets] = useState<PendingAssets>({});
  const [assetRemovals, setAssetRemovals] = useState<AssetRemovals>({});

  useEffect(() => {
    let cancelled = false;
    async function loadBranding() {
      setBrandingLoading(true);
      setBrandingError(null);
      try {
        const data = await fetchTenantBranding();
        if (cancelled) return;
        setBranding(data);
        setPrimaryColor(data.primaryColor);
        setAccentColor(data.accentColor);
        setSurfaceColor(data.surfaceColor);
        setDarkMode(data.darkMode);
        setSupportEmail(data.supportEmail);
        setLegalAddress(data.legalAddress ?? '');
        setSubjectPrefix(data.subjectPrefix ?? '');
      } catch (error) {
        if (!cancelled) {
          setBrandingError(error instanceof Error ? error.message : 'Failed to load branding settings');
        }
      } finally {
        if (!cancelled) setBrandingLoading(false);
      }
    }
    loadBranding();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (branding && !profileInitialised) {
      setTenantProfile((prev) => ({ ...prev, supportEmail: branding.supportEmail }));
      setProfileInitialised(true);
    }
  }, [branding, profileInitialised]);

  const handleFileChange = useCallback((kind: AssetKind, file: File | null) => {
    setPendingAssets((prev) => ({ ...prev, [kind]: file ?? null }));
    setAssetRemovals((prev) => ({ ...prev, [kind]: false }));
  }, []);

  const markAssetRemoval = useCallback((kind: AssetKind) => {
    setPendingAssets((prev) => ({ ...prev, [kind]: null }));
    setAssetRemovals((prev) => ({ ...prev, [kind]: true }));
  }, []);

  const saveBranding = useCallback(async () => {
    setSavingBranding(true);
    setBrandingError(null);
    setBrandingMessage(null);
    try {
      const payload: any = {
        primaryColor,
        accentColor,
        surfaceColor,
        darkMode,
        supportEmail,
        legalAddress: legalAddress || null,
        subjectPrefix: subjectPrefix || null
      };

      for (const kind of ['logo', 'emailLogo', 'loginHero', 'favicon'] as AssetKind[]) {
        const upload = pendingAssets[kind];
        if (upload) {
          payload[kind] = await fileToUpload(upload);
        } else if (assetRemovals[kind]) {
          payload[`remove${kind.charAt(0).toUpperCase()}${kind.slice(1)}`] = true;
        }
      }

      const updated = await updateTenantBranding(payload);
      setBranding(updated);
      setBrandingMessage('Branding updated successfully');
      setPendingAssets({});
      setAssetRemovals({});
    } catch (error) {
      setBrandingError(error instanceof Error ? error.message : 'Failed to save branding');
    } finally {
      setSavingBranding(false);
    }
  }, [accentColor, assetRemovals, darkMode, legalAddress, pendingAssets, primaryColor, subjectPrefix, supportEmail]);

  const brandingPreviewUrl = useMemo(() => resolveAssetUrl(branding?.logoUrl), [branding?.logoUrl]);

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
            <li>
              Document templates:{' '}
              <a href="/settings/documents" className="text-brand hover:underline">
                Contracts & letters
              </a>
            </li>
          </ul>
        </div>
      </Card>

      {tab === 'branding' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Branding & theming</CardTitle>
              <CardDescription>Update tenant colours, imagery, and email identity. Changes apply instantly across the workspace.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-6 p-6 pt-0">
            {brandingLoading ? (
              <div className="text-sm text-slate-500">Loading current branding…</div>
            ) : brandingError ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{brandingError}</div>
            ) : (
              <>
                {brandingMessage && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{brandingMessage}</div>
                )}
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700" htmlFor="primaryColor">
                        Primary colour
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          id="primaryColor"
                          type="color"
                          value={primaryColor}
                          onChange={(event) => setPrimaryColor(event.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border border-slate-300 bg-white"
                        />
                        <span className="text-sm text-slate-500">Navigation, key buttons, and highlights.</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700" htmlFor="accentColor">
                        Accent colour
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          id="accentColor"
                          type="color"
                          value={accentColor}
                          onChange={(event) => setAccentColor(event.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border border-slate-300 bg-white"
                        />
                        <span className="text-sm text-slate-500">Secondary actions and callouts.</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700" htmlFor="surfaceColor">
                        Surface colour
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        <input
                          id="surfaceColor"
                          type="color"
                          value={surfaceColor}
                          onChange={(event) => setSurfaceColor(event.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border border-slate-300 bg-white"
                        />
                        <span className="text-sm text-slate-500">Panels, cards, and dashboard tiles.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        id="darkMode"
                        type="checkbox"
                        checked={darkMode}
                        onChange={(event) => setDarkMode(event.target.checked)}
                        className="h-4 w-4 rounded border border-slate-300"
                      />
                      <label htmlFor="darkMode" className="text-sm font-medium text-slate-700">
                        Prefer dark mode surfaces
                      </label>
                    </div>
                  </div>
                  <BrandingPreview
                    primaryColor={primaryColor}
                    accentColor={accentColor}
                    surfaceColor={surfaceColor}
                    darkMode={darkMode}
                    logoUrl={brandingPreviewUrl}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="brandingSupportEmail">
                      Support email
                    </label>
                    <input
                      id="brandingSupportEmail"
                      type="email"
                      value={supportEmail}
                      onChange={(event) => setSupportEmail(event.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-slate-500">Appears in notification footers and contact panels.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="brandingSubjectPrefix">
                      Email subject prefix
                    </label>
                    <input
                      id="brandingSubjectPrefix"
                      value={subjectPrefix}
                      onChange={(event) => setSubjectPrefix(event.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <p className="text-xs text-slate-500">Optional text added to outbound email subjects.</p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="brandingAddress">
                      Legal address / footer text
                    </label>
                    <textarea
                      id="brandingAddress"
                      value={legalAddress}
                      onChange={(event) => setLegalAddress(event.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Level 10, 55 Market Street, Sydney NSW 2000"
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {(['logo', 'emailLogo', 'loginHero', 'favicon'] as AssetKind[]).map((kind) => {
                    const currentUrl = resolveAssetUrl(branding?.[`${kind}Url` as keyof TenantBranding] as string | undefined);
                    const labelMap: Record<AssetKind, string> = {
                      logo: 'Header logo',
                      emailLogo: 'Email logo',
                      loginHero: 'Login hero image',
                      favicon: 'Favicon'
                    };
                    return (
                      <div key={kind} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700" htmlFor={`${kind}Upload`}>
                            {labelMap[kind]}
                          </label>
                          {currentUrl && !assetRemovals[kind] && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => markAssetRemoval(kind)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        {currentUrl && !assetRemovals[kind] && (
                          <div className="rounded border border-slate-200 bg-slate-50 p-2">
                            <img src={currentUrl} alt={`${labelMap[kind]} preview`} className="h-16 w-auto" />
                          </div>
                        )}
                        <input
                          id={`${kind}Upload`}
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES}
                          onChange={(event) => handleFileChange(kind, event.target.files?.[0] ?? null)}
                          className="w-full text-sm"
                        />
                        {pendingAssets[kind] && (
                          <p className="text-xs text-slate-500">Ready to upload: {pendingAssets[kind]?.name}</p>
                        )}
                        {assetRemovals[kind] && !pendingAssets[kind] && (
                          <p className="text-xs text-amber-600">Marked for removal</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2">
                  <Button onClick={saveBranding} disabled={savingBranding}>
                    {savingBranding ? 'Saving…' : 'Save branding'}
                  </Button>
                </div>
              </>
            )}
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
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('tenantProfile:update', { detail: tenantProfile }));
                  alert('Tenant settings saved');
                }}
              >
                Save tenant profile
              </Button>
            </div>
          </div>
        </Card>
      )}

      {tab === 'pay' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pay profile overrides</CardTitle>
              <CardDescription>Sync salary details for demo employees.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="payEmployeeId">
                  Employee ID
                </label>
                <input
                  id="payEmployeeId"
                  value={empId}
                  onChange={(e) => setEmpId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="payRateCents">
                  Base rate (cents)
                </label>
                <input
                  id="payRateCents"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={loadProfile}>
                Load profile
              </Button>
              <Button onClick={saveProfile}>Save profile</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

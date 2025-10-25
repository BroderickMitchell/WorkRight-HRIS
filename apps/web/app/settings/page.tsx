"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { apiFetch, apiPost } from '../../lib/api';

type SiteSettings = {
  brandingPrimaryColor: string; // hex
};

const DEFAULT_SETTINGS: SiteSettings = {
  brandingPrimaryColor: '#004c97'
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [tab, setTab] = useState<'branding' | 'rosters' | 'pay'>('branding');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('siteSettings');
      if (raw) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function saveBrand() {
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'siteSettings', newValue: JSON.stringify(settings) } as any)
    );
    alert('Settings saved');
  }

  // Roster templates
  const [templates, setTemplates] = useState<{ id: string; name: string; seedDate: string; pattern: string[] }[]>([]);
  const [assignments, setAssignments] = useState<{ id: string; employeeId: string; employeeName?: string; templateId: string; templateName?: string; locationId?: string; locationName?: string; effectiveFrom: string; effectiveTo?: string }[]>([]);
  const [tmplName, setTmplName] = useState('8/6 Day Shifts');
  const [tmplSeed, setTmplSeed] = useState('2024-11-04');
  const [tmplPattern, setTmplPattern] = useState('D,D,D,D,D,D,D,D,R,R,R,R,R,R');
  async function loadTemplates() {
    try {
      const data = await apiFetch<any[]>(`/v1/rosters/templates`);
      const norm = (data || []).map((t) => ({
        id: t.id,
        name: t.name,
        seedDate: typeof t.seedDate === 'string' ? t.seedDate : new Date(t.seedDate).toISOString(),
        pattern: Array.isArray(t.pattern) ? t.pattern : []
      }));
      setTemplates(norm);
    } catch {
      setTemplates([]);
    }
  }
  async function loadAssignments() {
    try {
      const data = await apiFetch<any[]>(`/v1/rosters/assignments`);
      const norm = (data || []).map((a) => ({
        id: a.id,
        employeeId: a.employeeId,
        employeeName: a.employeeName,
        templateId: a.templateId,
        templateName: a.templateName,
        locationId: a.locationId,
        locationName: a.locationName,
        effectiveFrom: typeof a.effectiveFrom === 'string' ? a.effectiveFrom : new Date(a.effectiveFrom).toISOString(),
        effectiveTo: a.effectiveTo ? (typeof a.effectiveTo === 'string' ? a.effectiveTo : new Date(a.effectiveTo).toISOString()) : undefined
      }));
      setAssignments(norm);
    } catch {
      setAssignments([]);
    }
  }
  async function createTemplate() {
    const pattern = tmplPattern
      .split(',')
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);
    await apiPost(`/v1/rosters/templates`, { name: tmplName, seedDate: tmplSeed, pattern }, { roles: 'HR_ADMIN,MANAGER' });
    await loadTemplates();
  }
  useEffect(() => { if (tab === 'rosters') { loadTemplates(); loadAssignments(); } }, [tab]);

  // Assignments
  const [assignEmpId, setAssignEmpId] = useState('emp-2');
  const [assignTmplId, setAssignTmplId] = useState<string>('');
  const [assignLocId, setAssignLocId] = useState('loc-karratha');
  const [assignFrom, setAssignFrom] = useState('2024-11-04');
  const [assignTo, setAssignTo] = useState('');
  async function assignTemplate() {
    const body: any = { employeeId: assignEmpId, templateId: assignTmplId, locationId: assignLocId, effectiveFrom: assignFrom };
    if (assignTo) body.effectiveTo = assignTo;
    await apiPost(`/v1/rosters/assignments`, body, { roles: 'HR_ADMIN,MANAGER' });
    alert('Roster assigned');
    await loadAssignments();
  }

  // Shift preview
  const [prevEmpId, setPrevEmpId] = useState('emp-2');
  const [prevFrom, setPrevFrom] = useState('2024-11-01');
  const [prevTo, setPrevTo] = useState('2024-11-30');
  const [preview, setPreview] = useState<{ date: string; shiftType: string }[]>([]);
  async function loadPreview() {
    const data = await apiFetch<any[]>(`/v1/rosters/shifts?from=${prevFrom}&to=${prevTo}&employeeId=${prevEmpId}`);
    setPreview((data || []).map((d) => ({ date: d.date, shiftType: d.shiftType })));
  }

  // Pay profiles
  const [empId, setEmpId] = useState('emp-2');
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
    <div className="space-y-6" aria-label="Site settings">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Settings</h1>
        <div className="flex gap-2">
          <Button variant={tab === 'branding' ? 'primary' : 'secondary'} onClick={() => setTab('branding')}>Branding</Button>
          <Button variant={tab === 'rosters' ? 'primary' : 'secondary'} onClick={() => setTab('rosters')}>Roster templates</Button>
          <Button variant={tab === 'pay' ? 'primary' : 'secondary'} onClick={() => setTab('pay')}>Pay profiles</Button>
        </div>
      </header>

      {tab === 'branding' && (
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
            <Button className="ml-auto" onClick={saveBrand}>Save</Button>
          </div>
        </Card>
      )}

      {tab === 'rosters' && (
        <>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Templates</CardTitle>
                <CardDescription>Common roster patterns with a seed date.</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0 space-y-2">
              {templates.length === 0 ? (
                <p className="text-sm text-slate-500">No templates yet.</p>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {templates.map((t) => (
                    <li key={t.id} className="py-2 text-sm">
                      <p className="font-medium text-slate-900">{t.name}</p>
                      <p className="text-slate-600">Seed {new Date(t.seedDate).toLocaleDateString()} - Pattern {t.pattern.join(',')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Roster assignments</CardTitle>
                <CardDescription>Current employee-to-template assignments.</CardDescription>
              </div>
            </CardHeader>
            <div className="p-6 pt-0">
              {assignments.length === 0 ? (
                <p className="text-sm text-slate-500">No assignments yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead>
                      <tr className="text-slate-600">
                        <th className="py-2 pr-4">Employee</th>
                        <th className="py-2 pr-4">Template</th>
                        <th className="py-2 pr-4">Location</th>
                        <th className="py-2 pr-4">From</th>
                        <th className="py-2 pr-4">To</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {assignments.map((a) => (
                        <tr key={a.id}>
                          <td className="py-2 pr-4">{a.employeeName ?? a.employeeId}</td>
                          <td className="py-2 pr-4">{a.templateName ?? a.templateId}</td>
                          <td className="py-2 pr-4">{a.locationName ?? a.locationId ?? '-'}</td>
                          <td className="py-2 pr-4">{new Date(a.effectiveFrom).toLocaleDateString()}</td>
                          <td className="py-2 pr-4">{a.effectiveTo ? new Date(a.effectiveTo).toLocaleDateString() : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Create template</CardTitle>
                <CardDescription>Pattern tokens: D (day), N (night), R (rest). Comma-separated.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4 p-6 pt-0 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name</label>
                <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={tmplName} onChange={(e) => setTmplName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Seed date</label>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={tmplSeed} onChange={(e) => setTmplSeed(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Pattern</label>
                <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={tmplPattern} onChange={(e) => setTmplPattern(e.target.value)} placeholder="D,D,D,D,D,D,D,D,R,R,R,R,R,R" />
              </div>
              <div className="md:col-span-1 flex items-end justify-end">
                <Button onClick={createTemplate}>Create</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Assign template to employee</CardTitle>
                <CardDescription>Connects an employee to a roster template for a site.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4 p-6 pt-0 md:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Employee ID</label>
                <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Template</label>
                <select className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={assignTmplId} onChange={(e) => setAssignTmplId(e.target.value)}>
                  <option value="">Select...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Location ID</label>
                <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={assignLocId} onChange={(e) => setAssignLocId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Effective from</label>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={assignFrom} onChange={(e) => setAssignFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Effective to (optional)</label>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={assignTo} onChange={(e) => setAssignTo(e.target.value)} />
              </div>
              <div className="md:col-span-5 flex items-end justify-end">
                <Button onClick={assignTemplate}>Assign</Button>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Shift preview</CardTitle>
                <CardDescription>Generate shifts for an employee over a date range.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4 p-6 pt-0 md:grid-cols-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Employee ID</label>
                <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={prevEmpId} onChange={(e) => setPrevEmpId(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">From</label>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={prevFrom} onChange={(e) => setPrevFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">To</label>
                <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={prevTo} onChange={(e) => setPrevTo(e.target.value)} />
              </div>
              <div className="md:col-span-2 flex items-end justify-end">
                <Button variant="secondary" onClick={loadPreview}>Load</Button>
              </div>
            </div>
            <div className="p-6 pt-0">
              {preview.length === 0 ? (
                <p className="text-sm text-slate-500">No shifts.</p>
              ) : (
                <ul className="grid gap-2 md:grid-cols-3">
                  {preview.map((s) => (
                    <li key={`${s.date}-${s.shiftType}`} className="rounded border border-slate-200 p-3 text-sm">
                      <p className="font-medium text-slate-900">{new Date(s.date).toLocaleDateString()}</p>
                      <p className="text-slate-600">{s.shiftType}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </>
      )}

      {tab === 'pay' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pay profile</CardTitle>
              <CardDescription>Manage base hourly rate (cents). Restricted to Payroll/HR Admin.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 p-6 pt-0 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Employee ID</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={empId} onChange={(e) => setEmpId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Base rate (cents/hour)</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={rate} onChange={(e) => setRate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="secondary" onClick={loadProfile}>Load</Button>
              <Button onClick={saveProfile}>Save</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

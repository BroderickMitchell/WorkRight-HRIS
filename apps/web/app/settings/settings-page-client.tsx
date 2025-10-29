"use client";

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import {
  assignRoster,
  createRosterTemplate,
  fetchRosterAssignments,
  fetchRosterShifts,
  fetchRosterTemplates,
  RosterAssignment,
  RosterTemplate
} from '../../lib/rosters';
import { apiFetch, apiPost } from '../../lib/api';

export type SettingsTab = 'branding' | 'rosters' | 'pay';

export interface SettingsPageProps {
  initialTab?: SettingsTab;
}

type SiteSettings = {
  brandingPrimaryColor: string; // hex
};

const DEFAULT_SETTINGS: SiteSettings = {
  brandingPrimaryColor: '#004c97'
};

export default function SettingsPageClient({ initialTab = 'branding' }: SettingsPageProps = {}) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const searchParams = useSearchParams();
  const paramTab = searchParams?.get('tab');
  const resolvedInitialTab = useMemo<SettingsTab>(() => {
    if (paramTab === 'rosters' || paramTab === 'pay' || paramTab === 'branding') {
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
  const [templates, setTemplates] = useState<RosterTemplate[]>([]);
  const [assignments, setAssignments] = useState<RosterAssignment[]>([]);
  const [tmplName, setTmplName] = useState('8/6 Day Shifts');
  const [tmplSeed, setTmplSeed] = useState('2024-11-04');
  const [tmplPattern, setTmplPattern] = useState('D,D,D,D,D,D,D,D,R,R,R,R,R,R');
  async function loadTemplates() {
    try {
      const data = await fetchRosterTemplates();
      setTemplates(data);
    } catch {
      setTemplates([]);
    }
  }
  async function loadAssignments() {
    try {
      const data = await fetchRosterAssignments();
      setAssignments(data);
    } catch {
      setAssignments([]);
    }
  }
  async function createTemplate() {
    const pattern = tmplPattern
      .split(',')
      .map((x) => x.trim().toUpperCase())
      .filter(Boolean);
    await createRosterTemplate({ name: tmplName, seedDate: tmplSeed, pattern });
    await loadTemplates();
  }
  useEffect(() => {
    if (tab === 'rosters') {
      loadTemplates();
      loadAssignments();
    }
  }, [tab]);

  // Assignments
  const [assignEmpId, setAssignEmpId] = useState('emp-2');
  const [assignTmplId, setAssignTmplId] = useState<string>('');
  const [assignLocId, setAssignLocId] = useState('loc-karratha');
  const [assignFrom, setAssignFrom] = useState('2024-11-04');
  const [assignTo, setAssignTo] = useState('');
  async function assignTemplate() {
    const body: any = { employeeId: assignEmpId, templateId: assignTmplId, locationId: assignLocId, effectiveFrom: assignFrom };
    if (assignTo) body.effectiveTo = assignTo;
    await assignRoster(body);
    alert('Roster assigned');
    await loadAssignments();
  }

  // Shift preview
  const [prevEmpId, setPrevEmpId] = useState('emp-2');
  const [prevFrom, setPrevFrom] = useState('2024-11-01');
  const [prevTo, setPrevTo] = useState('2024-11-30');
  const [preview, setPreview] = useState<{ date: string; shiftType: string }[]>([]);
  async function loadPreview() {
    const data = await fetchRosterShifts({ employeeId: prevEmpId, from: prevFrom, to: prevTo });
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
          <Button
            variant={tab === 'branding' ? 'primary' : 'secondary'}
            aria-pressed={tab === 'branding'}
            onClick={() => setTab('branding')}
          >
            Branding
          </Button>
          <Button
            variant={tab === 'rosters' ? 'primary' : 'secondary'}
            aria-pressed={tab === 'rosters'}
            onClick={() => setTab('rosters')}
          >
            Roster templates
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
            <CardDescription>Quick links to frequently used admin pages.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0 text-sm">
          <p>
            Manage position ID formats per department:{' '}
            <a href="/settings/ids" className="text-brand hover:underline">
              Position ID settings
            </a>
          </p>
        </div>
      </Card>

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
            <Button className="ml-auto" onClick={saveBrand}>
              Save
            </Button>
          </div>
        </Card>
      )}

      {tab === 'rosters' && (
        <>
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Roster templates</CardTitle>
                <CardDescription>Define repeating shift patterns that can be applied to locations.</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 p-6 pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="tmplName">
                  Template name
                  <input
                    id="tmplName"
                    value={tmplName}
                    onChange={(e) => setTmplName(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm font-medium text-slate-700" htmlFor="tmplSeed">
                  Seed date
                  <input
                    id="tmplSeed"
                    type="date"
                    value={tmplSeed}
                    onChange={(e) => setTmplSeed(e.target.value)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                  />
                </label>
              </div>
              <label className="text-sm font-medium text-slate-700" htmlFor="tmplPattern">
                Pattern (comma separated)
                <input
                  id="tmplPattern"
                  value={tmplPattern}
                  onChange={(e) => setTmplPattern(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <Button onClick={createTemplate}>Create template</Button>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Existing templates</CardTitle>
                <CardDescription>Preview and assign saved shift patterns.</CardDescription>
              </div>
            </CardHeader>
            <div className="space-y-4 p-6 pt-0">
              <ul className="space-y-3 text-sm">
                {templates.map((tmpl) => (
                  <li key={tmpl.id} className="rounded border border-slate-200 p-3">
                    <div className="font-medium text-slate-900">{tmpl.name}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Pattern: {tmpl.pattern.join(', ')}
                    </div>
                  </li>
                ))}
                {templates.length === 0 && <li className="text-slate-500">No templates created yet.</li>}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Assign roster template</CardTitle>
                <CardDescription>Allocate a saved pattern to a worker at a location.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="assignEmp">
                Employee ID
                <input
                  id="assignEmp"
                  value={assignEmpId}
                  onChange={(e) => setAssignEmpId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700" htmlFor="assignTmpl">
                Template
                <select
                  id="assignTmpl"
                  value={assignTmplId}
                  onChange={(e) => setAssignTmplId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                >
                  <option value="">Select template</option>
                  {templates.map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700" htmlFor="assignLoc">
                Location ID
                <input
                  id="assignLoc"
                  value={assignLocId}
                  onChange={(e) => setAssignLocId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700" htmlFor="assignFrom">
                Effective from
                <input
                  id="assignFrom"
                  type="date"
                  value={assignFrom}
                  onChange={(e) => setAssignFrom(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700" htmlFor="assignTo">
                Effective to (optional)
                <input
                  id="assignTo"
                  type="date"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
              <Button variant="secondary" onClick={loadAssignments}>
                Refresh assignments
              </Button>
              <Button onClick={assignTemplate}>Assign template</Button>
            </div>
            <div className="p-6 pt-0">
              <h3 className="text-sm font-medium text-slate-700">Current assignments</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {assignments.map((assignment) => (
                  <li key={assignment.id} className="rounded border border-slate-200 p-3">
                    <div className="font-medium text-slate-900">{assignment.employeeName}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Template: {assignment.templateName} · Location: {assignment.locationName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {assignment.effectiveFrom} – {assignment.effectiveTo ?? 'Ongoing'}
                    </div>
                  </li>
                ))}
                {assignments.length === 0 && <li className="text-slate-500">No assignments recorded yet.</li>}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Preview roster shifts</CardTitle>
                <CardDescription>Simulate the pattern for a worker to confirm coverage.</CardDescription>
              </div>
            </CardHeader>
            <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="prevEmp">
                Employee ID
                <input
                  id="prevEmp"
                  value={prevEmpId}
                  onChange={(e) => setPrevEmpId(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700" htmlFor="prevFrom">
                From
                <input
                  id="prevFrom"
                  type="date"
                  value={prevFrom}
                  onChange={(e) => setPrevFrom(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium text-slate-700" htmlFor="prevTo">
                To
                <input
                  id="prevTo"
                  type="date"
                  value={prevTo}
                  onChange={(e) => setPrevTo(e.target.value)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
                />
              </label>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
              <Button variant="secondary" onClick={() => setPreview([])}>
                Clear
              </Button>
              <Button onClick={loadPreview}>Preview shifts</Button>
            </div>
            <div className="p-6 pt-0">
              <h3 className="text-sm font-medium text-slate-700">Preview result</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {preview.map((shift) => (
                  <li key={`${shift.date}-${shift.shiftType}`} className="rounded border border-slate-200 p-3">
                    <div className="font-medium text-slate-900">{shift.date}</div>
                    <div className="text-xs uppercase tracking-wide text-slate-500">{shift.shiftType}</div>
                  </li>
                ))}
                {preview.length === 0 && <li className="text-slate-500">Run a preview to see shift coverage.</li>}
              </ul>
            </div>
          </Card>
        </>
      )}

      {tab === 'pay' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Pay profile</CardTitle>
              <CardDescription>Maintain base pay for award interpretation and payroll.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="payEmp">
              Employee ID
              <input
                id="payEmp"
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="text-sm font-medium text-slate-700" htmlFor="payRate">
              Base rate (cents)
              <input
                id="payRate"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              />
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
            <Button variant="secondary" onClick={loadProfile}>
              Load profile
            </Button>
            <Button onClick={saveProfile}>Save profile</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

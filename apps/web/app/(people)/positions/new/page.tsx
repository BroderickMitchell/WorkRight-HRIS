"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { apiFetch, apiPost } from '../../../../lib/api';

type Department = { id: string; name: string; code_prefix: string };

export default function NewPositionPage() {
  const [deps, setDeps] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [title, setTitle] = useState('');
  const [orgUnitId, setOrgUnitId] = useState('ou-root');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [workType, setWorkType] = useState('Permanent');
  const [fte, setFte] = useState(1);
  const [location, setLocation] = useState('');
  const [reportsToId, setReportsToId] = useState('');
  const [budgetStatus, setBudgetStatus] = useState<'BUDGETED'|'UNBUDGETED'>('BUDGETED');
  const [justification, setJustification] = useState('');
  const [effectiveFrom, setEffectiveFrom] = useState(new Date().toISOString().slice(0,10));
  const [created, setCreated] = useState<any>(null);

  useEffect(() => { apiFetch<Department[]>('/v1/departments').then(setDeps).catch(() => setDeps([])); }, []);
  const prefix = useMemo(() => deps.find((d) => d.id === departmentId)?.code_prefix ?? '', [deps, departmentId]);

  async function create() {
    const body = { title, departmentId, orgUnitId, employmentType, workType, fte: Number(fte), location, reportsToId: reportsToId || undefined, budgetStatus, justification: budgetStatus === 'UNBUDGETED' ? justification : undefined, effectiveFrom };
    const res = await apiPost('/v1/positions', body, { roles: 'HR_ADMIN,HRBP' });
    setCreated(res);
  }

  return (
    <div className="space-y-6" aria-label="Create position">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Create position</h1>
        <p className="text-slate-600">Reserve a position ID and submit for approval.</p>
      </header>

      {created ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Reserved</CardTitle>
              <CardDescription>Position ID has been reserved.</CardDescription>
            </div>
          </CardHeader>
          <div className="p-6 pt-0">
            <p className="text-sm">Position ID: <span className="font-semibold">{created.positionHumanId}</span></p>
            <div className="mt-4 flex gap-2">
              <Link href={`/positions/${created.id}`}><Button>Open position</Button></Link>
              <Link href="/positions"><Button variant="secondary">Back to list</Button></Link>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Details</CardTitle>
              <CardDescription>Fields marked with * are required.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Department *</label>
              <select className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">Select…</option>
                {deps.map((d) => (<option key={d.id} value={d.id}>{d.name} ({d.code_prefix})</option>))}
              </select>
              {prefix && <p className="mt-1 text-xs text-slate-500">Next ID preview: {prefix}00X</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Title *</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Employment type</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Work type</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={workType} onChange={(e) => setWorkType(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">FTE</label>
              <input type="number" step="0.1" min="0.1" max="1" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={fte} onChange={(e) => setFte(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Location</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Org Unit *</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={orgUnitId} onChange={(e) => setOrgUnitId(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Reports to (Position ID)</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={reportsToId} onChange={(e) => setReportsToId(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Budget status *</label>
              <div className="mt-1 flex items-center gap-6 text-sm">
                <label><input type="radio" checked={budgetStatus==='BUDGETED'} onChange={() => setBudgetStatus('BUDGETED')} /> Budgeted</label>
                <label><input type="radio" checked={budgetStatus==='UNBUDGETED'} onChange={() => setBudgetStatus('UNBUDGETED')} /> Unbudgeted</label>
              </div>
            </div>
            {budgetStatus === 'UNBUDGETED' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Justification *</label>
                <textarea className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" rows={3} value={justification} onChange={(e) => setJustification(e.target.value)} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Effective from *</label>
              <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button onClick={create} disabled={!departmentId || !title || !orgUnitId}>Reserve ID & Create</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


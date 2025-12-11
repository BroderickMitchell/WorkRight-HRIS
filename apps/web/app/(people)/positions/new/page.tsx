"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { apiFetch, apiPost } from '../../../../lib/api';

type Department = { id: string; name: string; code_prefix: string };
type JobRole = { id: string; title: string };
type PositionSummary = { id: string; positionId: string; title: string; location?: { id: string; name: string } | null };

export default function NewPositionPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [positions, setPositions] = useState<PositionSummary[]>([]);

  const [departmentId, setDepartmentId] = useState('');
  const [title, setTitle] = useState('');
  const [positionId, setPositionId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [jobRoleId, setJobRoleId] = useState('');
  const [parentPositionId, setParentPositionId] = useState('');
  const [headcount, setHeadcount] = useState(1);
  const [budgetedFte, setBudgetedFte] = useState<string>('');
  const [budgetedSalary, setBudgetedSalary] = useState<string>('');
  const [inheritRoleData, setInheritRoleData] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [created, setCreated] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Department[]>('/departments').then(setDepartments).catch(() => setDepartments([]));
    apiFetch<JobRole[]>('/jobroles').then(setJobRoles).catch(() => setJobRoles([]));
    apiFetch<PositionSummary[]>('/positions?includeInactive=true').then(setPositions).catch(() => setPositions([]));
  }, []);

  const prefix = useMemo(() => departments.find((d) => d.id === departmentId)?.code_prefix ?? '', [departments, departmentId]);
  const locationOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const position of positions) {
      if (position.location?.id && position.location?.name && !seen.has(position.location.id)) {
        seen.set(position.location.id, position.location.name);
      }
    }
    return Array.from(seen.entries());
  }, [positions]);

  async function create() {
    setError(null);
    try {
      const body = {
        title,
        departmentId,
        locationId,
        positionId: positionId.trim() || undefined,
        jobRoleId: jobRoleId || undefined,
        parentPositionId: parentPositionId || undefined,
        headcount,
        budgetedFte: budgetedFte !== '' ? Number(budgetedFte) : undefined,
        budgetedSalary: budgetedSalary !== '' ? Number(budgetedSalary) : undefined,
        inheritRoleData,
        isActive
      };
      const res = await apiPost('/positions', body, { roles: 'HR_ADMIN,HRBP' });
      setCreated(res);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create position');
    }
  }

  const canCreate = Boolean(departmentId && title && locationId);

  return (
    <div className="space-y-6" aria-label="Create position">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Create position</h1>
        <p className="text-slate-600">Define a new position in the organisation structure.</p>
      </header>

      {created ? (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Position created</CardTitle>
              <CardDescription>Use the link below to review the position record.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0 text-sm">
            <p>
              Position ID: <span className="font-semibold">{created.positionId}</span>
            </p>
            <div className="flex gap-2">
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
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name} ({department.code_prefix})
                  </option>
                ))}
              </select>
              {prefix && <p className="mt-1 text-xs text-slate-500">ID prefix: {prefix}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Title *</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Location ID *</label>
              <input list="location-options" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={locationId} onChange={(e) => setLocationId(e.target.value)} placeholder="e.g. loc-karratha" />
              <datalist id="location-options">
                {locationOptions.map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Job role</label>
              <select className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={jobRoleId} onChange={(e) => setJobRoleId(e.target.value)}>
                <option value="">None</option>
                {jobRoles.map((role) => (
                  <option key={role.id} value={role.id}>{role.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Parent position</label>
              <select className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={parentPositionId} onChange={(e) => setParentPositionId(e.target.value)}>
                <option value="">None</option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>{position.positionId} · {position.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Headcount</label>
              <input type="number" min={1} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={headcount} onChange={(e) => setHeadcount(Number(e.target.value) || 1)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Budgeted FTE</label>
              <input type="number" step="0.01" min={0} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={budgetedFte} onChange={(e) => setBudgetedFte(e.target.value)} placeholder="e.g. 1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Budgeted salary (annual)</label>
              <input type="number" min={0} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={budgetedSalary} onChange={(e) => setBudgetedSalary(e.target.value)} placeholder="e.g. 150000" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Manual position ID</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={positionId} onChange={(e) => setPositionId(e.target.value)} placeholder="Leave blank to auto-generate" />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Inherit job role details</label>
              <input type="checkbox" checked={inheritRoleData} onChange={(e) => setInheritRoleData(e.target.checked)} />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700">Active</label>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            </div>

            {error && (
              <div className="md:col-span-2 text-sm text-rose-600">{error}</div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={create} disabled={!canCreate}>Create position</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

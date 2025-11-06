"use client";
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { apiFetch } from '../../../lib/api';

type Position = {
  id: string;
  positionId: string;
  title: string;
  vacancyStatus: 'open' | 'filled' | 'overfilled' | 'inactive';
  isActive: boolean;
  department?: { id: string; name: string } | null;
  location?: { id: string; name: string } | null;
  assignments: { employeeId: string; employeeName?: string | undefined }[];
};

const vacancyClasses: Record<Position['vacancyStatus'], string> = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  filled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overfilled: 'bg-rose-100 text-rose-800 border-rose-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200'
};

function VacancyBadge({ status }: { status: Position['vacancyStatus'] }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${vacancyClasses[status]}`}>
      {status === 'open' && 'Vacant'}
      {status === 'filled' && 'Filled'}
      {status === 'overfilled' && 'Overfilled'}
      {status === 'inactive' && 'Inactive'}
    </span>
  );
}

export default function PositionsPage() {
  const [showInactive, setShowInactive] = useState(false);
  const [vacanciesOnly, setVacanciesOnly] = useState(false);
  const [rows, setRows] = useState<Position[]>([]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (showInactive) params.set('includeInactive', 'true');
    if (vacanciesOnly) params.set('includeVacancies', 'true');
    const qs = params.toString();
    const path = qs.length > 0 ? `/v1/positions?${qs}` : `/v1/positions`;
    const data = await apiFetch<Position[]>(path);
    setRows(data);
  }, [showInactive, vacanciesOnly]);
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6" aria-label="Positions">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Positions</h1>
          <p className="text-slate-600">Manage the positions that drive reporting lines and hiring demand.</p>
        </div>
        <Link href="/positions/new"><Button>Create position</Button></Link>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Position list</CardTitle>
              <CardDescription>Filter by vacancy and inactive status to highlight planning requirements.</CardDescription>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-700">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" checked={vacanciesOnly} onChange={(e) => setVacanciesOnly(e.target.checked)} />
                Show vacancies only
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                Include inactive
              </label>
            </div>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-200 p-6 pt-0">
          <div className="mb-4 text-sm text-slate-600">
            CSV exports: {' '}
            <a className="text-brand hover:underline" href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/v1/reporting/csv/positions/master`} target="_blank" rel="noreferrer">Master</a>
            {' · '}
            <a className="text-brand hover:underline" href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/v1/reporting/csv/positions/cycle-times`} target="_blank" rel="noreferrer">Approval cycle times</a>
          </div>
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No positions found.</p>
          ) : rows.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-900">{p.positionId} · {p.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <VacancyBadge status={p.vacancyStatus} />
                  {p.department && <span>{p.department.name}</span>}
                  {p.location && <span>· {p.location.name}</span>}
                  {p.assignments.length > 0 && (
                    <span>
                      Occupied by {p.assignments.map((a) => a.employeeName ?? 'Unassigned').join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/positions/${p.id}`} className="text-brand text-sm hover:underline">
                Open
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


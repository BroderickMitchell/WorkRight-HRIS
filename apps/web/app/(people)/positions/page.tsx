"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';
import { apiFetch } from '../../../lib/api';

type Position = { id: string; positionHumanId: string; title: string; departmentId: string; status: 'PENDING'|'ACTIVE'|'ARCHIVED'; budgetStatus: 'BUDGETED'|'UNBUDGETED' };

function StatusBadge({ status }: { status: Position['status'] }) {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200'
  } as const;
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[status]}`}>{status}</span>;
}

export default function PositionsPage() {
  const [includePending, setIncludePending] = useState(false);
  const [rows, setRows] = useState<Position[]>([]);

  async function load() {
    const status = includePending ? undefined : 'active';
    const path = status ? `/v1/org/positions?status=${status}` : `/v1/org/positions`;
    const data = await apiFetch<Position[]>(path);
    setRows(data);
  }
  useEffect(() => { load(); }, [includePending]);

  return (
    <div className="space-y-6" aria-label="Positions">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Positions</h1>
          <p className="text-slate-600">Manage approved positions in your org chart.</p>
        </div>
        <Link href="/positions/new"><Button>Create position</Button></Link>
      </header>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Position list</CardTitle>
              <CardDescription>Includes Active positions; toggle to include Pending planning items.</CardDescription>
            </div>
            <label className="text-sm text-slate-700">
              <input type="checkbox" className="mr-2" checked={includePending} onChange={(e) => setIncludePending(e.target.checked)} />
              Include Pending in planning
            </label>
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
                <p className="font-medium text-slate-900">{p.positionHumanId} · {p.title}</p>
                <div className="mt-1 flex items-center gap-2 text-sm">
                  <StatusBadge status={p.status} />
                  {p.budgetStatus === 'UNBUDGETED' && <Badge className="border-violet-200 bg-violet-100 text-violet-800">Unbudgeted</Badge>}
                </div>
              </div>
              <Link href={`/positions/${p.id}`} className="text-brand hover:underline text-sm">Open</Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


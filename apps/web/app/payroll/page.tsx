"use client";
import { useCallback, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';
import { apiFetch, apiPost } from '../../lib/api';

type PayrollLine = { id: string; employeeId: string; hours: number; amountCents: number };
type PayrollRun = { id: string; periodStart: string; periodEnd: string; totalCents: number; createdAt: string; lines: PayrollLine[] };

function aud(amountCents: number) { return `$${(amountCents/100).toFixed(2)}`; }

export default function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [start, setStart] = useState('2024-11-01');
  const [end, setEnd] = useState('2024-11-30');
  const [locationId, setLocationId] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<PayrollRun[]>(`/v1/payroll/runs`);
      setRuns(data);
    } catch {
      setRuns([]);
    }
  }, []);

  async function createRun() {
    await apiPost(`/v1/payroll/runs`, { periodStart: start, periodEnd: end, locationId: locationId || undefined }, { roles: 'PAYROLL,HR_ADMIN' });
    await load();
  }

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6" aria-label="Payroll">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Payroll</h1>
        <p className="text-slate-600">Roster-driven calculations and runs.</p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Create payroll run</CardTitle>
            <CardDescription>Calculates hours from rostered shifts in the period.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 p-6 pt-0 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Period start</label>
            <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Period end</label>
            <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Location (optional)</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={locationId} onChange={(e) => setLocationId(e.target.value)} />
          </div>
          <div className="flex items-end justify-end">
            <Button onClick={createRun}>Create run</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Runs</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {runs.length === 0 ? (
            <p className="text-sm text-slate-500">No runs yet.</p>
          ) : (
            runs.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{new Date(r.periodStart).toLocaleDateString()} → {new Date(r.periodEnd).toLocaleDateString()}</p>
                    <p className="text-sm text-slate-600">Created {new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge>{aud(r.totalCents)}</Badge>
                </div>
                <ul className="mt-2 divide-y divide-slate-200">
                  {r.lines.map((l) => (
                    <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                      <span>Emp {l.employeeId} · {l.hours} hrs</span>
                      <span className="font-medium">{aud(l.amountCents)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

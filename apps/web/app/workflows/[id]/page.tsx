"use client";
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';
import { approveWorkflow, declineWorkflow, getWorkflow } from '../../../lib/workflows';
import { getEmployeeWithOverrides } from '../../../lib/overrides';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';

interface Props { params: { id: string } }

export default function WorkflowDetailPage({ params }: Props) {
  const [role, setRole] = useState<'MANAGER' | 'HR_ADMIN'>('MANAGER');
  const [refresh, setRefresh] = useState(0);
  const wf = useMemo(() => getWorkflow(params.id), [params.id, refresh]);
  if (!wf) return notFound();
  const employee = getEmployeeWithOverrides(wf.employeeId);

  function act(decision: 'APPROVE' | 'DECLINE') {
    if (!wf) return;
    if (decision === 'APPROVE') approveWorkflow(wf.id, role);
    else declineWorkflow(wf.id, role);
    setRefresh((n) => n + 1);
  }

  return (
    <div className="space-y-6" aria-label="Workflow detail">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Profile change workflow</h1>
          <p className="text-slate-600">ID {wf.id} · Step: {wf.step.replace('_', ' ')}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600">Acting as</label>
          <select value={role} onChange={(e) => setRole(e.target.value as any)} className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm">
            <option value="MANAGER">Manager</option>
            <option value="HR_ADMIN">HR</option>
          </select>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Employee</CardTitle>
            <CardDescription>{employee?.name} ({employee?.role} · {employee?.department})</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
          {Object.entries(wf.changes).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-slate-200 p-4">
              <p className="text-xs uppercase text-slate-500">{key}</p>
              <p className="text-sm text-slate-900">{String(value ?? '')}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-end gap-3">
        {wf.step !== 'COMPLETED' && wf.step !== 'DECLINED' ? (
          <>
            <Button variant="secondary" onClick={() => act('DECLINE')}>Decline</Button>
            <Button onClick={() => act('APPROVE')}>Approve</Button>
          </>
        ) : (
          <Badge>{wf.step}</Badge>
        )}
      </div>
    </div>
  );
}

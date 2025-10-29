"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';
import { apiFetch, apiPost } from '../../../../lib/api';

type Step = { id: string; step: { id: string; name: string; roleRequired: string; sequence: number }; action: 'SUBMITTED'|'APPROVED'|'REJECTED'; comment?: string; actedAt?: string };
type Position = { id: string; positionHumanId: string; title: string; budgetStatus: 'BUDGETED'|'UNBUDGETED'; status: 'PENDING'|'ACTIVE'|'ARCHIVED'; approvals?: Step[] };

function StatusBadge({ status }: { status: Position['status'] }) {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200'
  } as const;
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${map[status]}`}>{status}</span>;
}

export default function PositionDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const [pos, setPos] = useState<Position | null>(null);

  const load = useCallback(async () => {
    const data = await apiFetch<Position>(`/v1/positions/${id}`);
    setPos(data);
  }, [id]);
  useEffect(() => {
    if (id) load();
  }, [id, load]);

  async function submit() {
    await apiPost(`/v1/positions/${id}/submit`, {}, { roles: 'HR_ADMIN,HRBP' });
    await load();
  }
  async function approve(stepId: string, action: 'approve'|'reject') {
    await apiPost(`/v1/positions/${id}/approve`, { stepId, action, comment: action==='reject' ? 'Changes requested' : 'Approved' }, { roles: 'HR_ADMIN,HRBP,FINANCE,EXEC' });
    await load();
  }
  async function activate() {
    await apiPost(`/v1/positions/${id}/activate`, {}, { roles: 'HR_ADMIN' });
    await load();
  }

  const allApproved = useMemo(() => (pos?.approvals ?? []).every((a) => a.action === 'APPROVED'), [pos]);

  if (!pos) return null;

  return (
    <div className="space-y-6" aria-label="Position detail">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{pos.positionHumanId} · {pos.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <StatusBadge status={pos.status} />
            {pos.budgetStatus === 'UNBUDGETED' && <Badge className="border-violet-200 bg-violet-100 text-violet-800">Unbudgeted</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {pos.status === 'PENDING' && (
            <Button onClick={submit}>Submit for approval</Button>
          )}
          {pos.status === 'PENDING' && allApproved && (
            <Button variant="secondary" onClick={activate}>Activate</Button>
          )}
        </div>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Approval timeline</CardTitle>
            <CardDescription>Actions recorded with timestamps and comments.</CardDescription>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-200 p-6 pt-0">
          {(pos.approvals ?? []).length === 0 ? (
            <p className="text-sm text-slate-500">Not yet submitted.</p>
          ) : (
            (pos.approvals ?? []).sort((a,b) => a.step.sequence - b.step.sequence).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{a.step.sequence}. {a.step.name}</p>
                  <p className="text-slate-600">Required role: {a.step.roleRequired}</p>
                  {a.comment && <p className="text-slate-500">“{a.comment}”</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">{a.action}</span>
                  {a.action === 'SUBMITTED' && (
                    <>
                      <Button size="sm" onClick={() => approve(a.step.id, 'approve')}>Approve</Button>
                      <Button size="sm" variant="secondary" onClick={() => approve(a.step.id, 'reject')}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}


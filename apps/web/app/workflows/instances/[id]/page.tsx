"use client";
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { actOnStep, listInstances, type WorkflowInstance } from '../../../../lib/workflow-engine';
import { apiFetch } from '../../../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';

type Employee = { id: string; givenName: string; familyName: string; email?: string; positionId?: string };

interface Props { params: { id: string } }

export default function TemplateWorkflowDetail({ params }: Props) {
  const [instance, setInstance] = useState<WorkflowInstance | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [actorName, setActorName] = useState<string>('You');
  const [actorEmployeeId, setActorEmployeeId] = useState<string>('');
  const [actorRole, setActorRole] = useState<string>('MANAGER');
  const [serverEvents, setServerEvents] = useState<any[]>([]);

  useEffect(() => {
    const found = listInstances().find((i) => i.id === params.id) ?? null;
    setInstance(found);
  }, [params.id, refresh]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await apiFetch<Employee[]>(`/v1/directory/employees`);
        setEmployees(rows);
      } catch {
        setEmployees([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!instance?.id) return;
      try {
        const events = await apiFetch<any[]>(`/v1/audit/events?entity=workflowInstance&entityId=${instance.id}&limit=100`);
        setServerEvents(events);
      } catch {
        setServerEvents([]);
      }
    })();
  }, [instance?.id, refresh]);

  const employeeName = (id?: string) => {
    if (!id) return 'Unassigned';
    const e = employees.find((x) => x.id === id);
    if (!e) return id;
    return `${e.givenName ?? ''} ${e.familyName ?? ''}`.trim() || id;
  };

  if (!instance) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-slate-500">Workflow instance not found.</p>
        <Link className="text-brand hover:underline text-sm" href="/workflows">Back to Workflows</Link>
      </div>
    );
  }

  const currentStage = instance.currentStageIndex >= 0 ? instance.stages[instance.currentStageIndex] : undefined;

  function act(stepId: string, action: 'APPROVE' | 'COMPLETE' | 'DECLINE') {
    const selectedEmp = employees.find(e => e.id === actorEmployeeId);
    const name = actorName || (selectedEmp ? `${selectedEmp.givenName ?? ''} ${selectedEmp.familyName ?? ''}`.trim() : 'You');
    actOnStep(instance.id, stepId, action, { id: actorEmployeeId || undefined, name, role: actorRole || undefined });
    setRefresh((n) => n + 1);
  }

  return (
    <div className="space-y-6" aria-label="Workflow instance detail">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{instance.name}</h1>
          <p className="text-slate-600">ID {instance.id} • Status: {instance.status}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Actor</label>
            <select className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm" value={actorEmployeeId} onChange={(e) => setActorEmployeeId(e.target.value)} >
              <option value="">Select employee…</option>
              {employees.map((e) => (<option key={e.id} value={e.id}>{`${e.givenName ?? ''} ${e.familyName ?? ''}`.trim() || e.id}</option>))}
            </select>
            <input className="rounded-md border border-slate-300 px-2 py-1 text-sm" placeholder="Or enter name" value={actorName} onChange={(e) => setActorName(e.target.value)} />
            <select className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm" value={actorRole} onChange={(e) => setActorRole(e.target.value)} >
              {['MANAGER','HR_ADMIN','HRBP','PAYROLL','FINANCE','EXEC'].map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
          </div>
          <Link className="text-brand hover:underline text-sm" href="/workflows">Back to Workflows</Link>
          <Button variant="secondary" onClick={() => setRefresh((n) => n + 1)}>Refresh</Button>
        </div>
      </header>

      {instance.stages.map((stage, sIdx) => (
        <Card key={stage.id} id={`stage-${stage.id}`}>
          <CardHeader>
            <div>
              <CardTitle>
                Stage {sIdx + 1}: {stage.name}
              </CardTitle>
              <CardDescription>
                Policy: {stage.completionPolicy === 'ALL' ? 'All steps required' : 'Any step completes'}
                {instance.currentStageIndex === sIdx ? ' • Current stage' : stage.completedAt ? ' • Completed' : ''}
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                const hash = `#stage-${stage.id}`;
                const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname + hash : hash;
                navigator.clipboard?.writeText(url);
              }}
            >
              Copy link
            </Button>
          </CardHeader>
          <div className="divide-y divide-slate-200 p-6 pt-0">
            {stage.steps.map((st) => {
              const isCurrentStage = instance.currentStageIndex === sIdx;
              const isPending = st.status === 'PENDING';
              const canAct = isCurrentStage && isPending && instance.status === 'ACTIVE';
              return (
                <div key={st.id} id={`step-${st.id}`} className="flex items-start justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{st.name} {st.type === 'APPROVAL' ? '(Approval)' : '(Task)'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <span>Assignees:</span>
                      {st.assignees.length === 0 ? (
                        <span className="italic">None</span>
                      ) : (
                        st.assignees.map((a, i) => (
                          <Badge key={i} className="border-slate-200 bg-slate-100 text-slate-800">
                            {a.resolvedEmployeeId ? employeeName(a.resolvedEmployeeId) : (a.assignee.kind === 'POSITION' ? `Position ${a.assignee.positionId}` : 'Manager of employee')}
                          </Badge>
                        ))
                      )}
                    </div>
                    {st.actedAt && (
                      <p className="mt-1 text-xs text-slate-500">Acted at: {new Date(st.actedAt).toLocaleString()}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {st.status === 'DECLINED' && <Badge className="border-rose-200 bg-rose-100 text-rose-800">Declined</Badge>}
                    {st.status === 'COMPLETED' && <Badge className="border-emerald-200 bg-emerald-100 text-emerald-800">Completed</Badge>}
                    {st.status === 'PENDING' && <Badge className="border-amber-200 bg-amber-100 text-amber-800">Pending</Badge>}
                    {st.type === 'APPROVAL' ? (
                      <>
                        <Button onClick={() => act(st.id, 'APPROVE')} disabled={!canAct}>Approve</Button>
                        <Button variant="secondary" onClick={() => act(st.id, 'DECLINE')} disabled={!canAct}>Decline</Button>
                      </>
                    ) : (
                      <Button onClick={() => act(st.id, 'COMPLETE')} disabled={!canAct}>Complete</Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const hash = `#step-${st.id}`;
                        const url = typeof window !== 'undefined' ? window.location.origin + window.location.pathname + hash : hash;
                        navigator.clipboard?.writeText(url);
                      }}
                    >
                      Copy link
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Log of workflow events.</CardDescription>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-200 p-6 pt-0">
          {(!instance.activities || instance.activities.length === 0) ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            [...instance.activities].sort((a, b) => b.at.localeCompare(a.at)).map((a) => (
              <div key={a.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Badge className="border-slate-200 bg-slate-100 text-slate-800">{a.kind.replace('_', ' ')}</Badge>
                  <p className="text-sm text-slate-800">
                    {a.message}
                    {a.actorId ? (
                      <> — by <Link href={`/employees/${a.actorId}`} className="text-brand hover:underline">{employeeName(a.actorId)}</Link>{a.actorRole ? ` (${a.actorRole})` : ''}</>
                    ) : a.actorName ? (
                      <> — by {a.actorName}{a.actorRole ? ` (${a.actorRole})` : ''}</>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {a.stageId && (
                    <a href={`#stage-${a.stageId}`} className="text-xs text-brand hover:underline">View stage</a>
                  )}
                  {a.stepId && (
                    <a href={`#step-${a.stepId}`} className="text-xs text-brand hover:underline">View step</a>
                  )}
                  <p className="text-xs text-slate-500">{new Date(a.at).toLocaleString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Server Audit</CardTitle>
            <CardDescription>Persisted audit events from the API.</CardDescription>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-200 p-6 pt-0">
          {serverEvents.length === 0 ? (
            <p className="text-sm text-slate-500">No server-side audit events.</p>
          ) : (
            serverEvents.map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Badge className="border-slate-200 bg-slate-100 text-slate-800">{String(e.action || '').replace('_', ' ')}</Badge>
                  <p className="text-sm text-slate-800">
                    {e.changes?.message || '(no message)'}
                    {e.changes?.actorId ? (
                      <> — by <Link href={`/employees/${e.changes.actorId}`} className="text-brand hover:underline">{employeeName(e.changes.actorId)}</Link>{e.changes?.actorRole ? ` (${e.changes.actorRole})` : ''}</>
                    ) : e.changes?.actorName ? (
                      <> — by {e.changes.actorName}{e.changes?.actorRole ? ` (${e.changes.actorRole})` : ''}</>
                    ) : null}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {e.changes?.stageId && (
                    <a href={`#stage-${e.changes.stageId}`} className="text-xs text-brand hover:underline">View stage</a>
                  )}
                  {e.changes?.stepId && (
                    <a href={`#step-${e.changes.stepId}`} className="text-xs text-brand hover:underline">View step</a>
                  )}
                  <p className="text-xs text-slate-500">{e.createdAt ? new Date(e.createdAt).toLocaleString() : ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

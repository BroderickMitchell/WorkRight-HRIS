"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listWorkflows, type ProfileChangeWorkflow } from '../../lib/workflows';
import { listTemplates } from '../../lib/workflow-templates';
import { createInstanceFromTemplate, listInstances, type WorkflowInstance } from '../../lib/workflow-engine';
import { apiFetch } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';

export default function WorkflowsPage() {
  const [items, setItems] = useState<ProfileChangeWorkflow[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState(() => listTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? '');
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('emp-2');
  const [starterName, setStarterName] = useState<string>('You');
  const [starterEmployeeId, setStarterEmployeeId] = useState<string>('');
  const [starterRole, setStarterRole] = useState<string>('MANAGER');
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    setItems(listWorkflows());
    setInstances(listInstances());
    setTemplates(listTemplates());
    setSelectedTemplateId((prev) => prev || listTemplates()[0]?.id || '');
    (async () => {
      try {
        const rows = await apiFetch<any[]>(`/v1/directory/employees`);
        setEmployees(rows);
      } catch {
        setEmployees([]);
      }
    })();
  }, []);

  async function startWorkflow() {
    const tpl = templates.find(t => t.id === selectedTemplateId);
    if (!tpl) return;
    const target = tpl.target === 'EMPLOYEE' ? { kind: 'EMPLOYEE' as const, employeeId: targetEmployeeId } : { kind: 'GENERIC' as const };
    const emp = employees.find((e) => e.id === starterEmployeeId);
    const name = starterName || (emp ? `${emp.givenName ?? ''} ${emp.familyName ?? ''}`.trim() : 'You');
    await createInstanceFromTemplate(tpl, target, undefined, { id: starterEmployeeId || undefined, name, role: starterRole || undefined });
    setInstances(listInstances());
  }

  return (
    <div className="space-y-6" aria-label="Workflows">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Workflows</h1>
          <p className="text-slate-600">Manager and HR approvals for profile changes.</p>
        </div>
      </header>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Start new workflow</CardTitle>
              <CardDescription>Use a template configured in Settings.</CardDescription>
            </div>
          </CardHeader>
          <div className="grid gap-3 p-6 pt-0 md:grid-cols-6">
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
              <option value="">Select a template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {templates.find(t => t.id === selectedTemplateId)?.target === 'EMPLOYEE' && (
              <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={targetEmployeeId} onChange={(e) => setTargetEmployeeId(e.target.value)} placeholder="Employee ID" />
            )}
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={starterEmployeeId} onChange={(e) => setStarterEmployeeId(e.target.value)}>
              <option value="">Actor employee…</option>
              {employees.map((e) => (<option key={e.id} value={e.id}>{`${e.givenName ?? ''} ${e.familyName ?? ''}`.trim() || e.id}</option>))}
            </select>
            <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={starterName} onChange={(e) => setStarterName(e.target.value)} placeholder="Your name (optional)" />
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={starterRole} onChange={(e) => setStarterRole(e.target.value)}>
              {['MANAGER','HR_ADMIN','HRBP','PAYROLL','FINANCE','EXEC'].map(r => (<option key={r} value={r}>{r}</option>))}
            </select>
            <div className="flex items-center">
              <Button onClick={startWorkflow} disabled={!selectedTemplateId}>Start</Button>
            </div>
          </div>
        </Card>

        {instances.length > 0 && (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Instances (template-based)</CardTitle>
                <CardDescription>These are workflows created from your templates.</CardDescription>
              </div>
            </CardHeader>
            <div className="divide-y divide-slate-200 p-6 pt-0">
              {instances.map((wf) => (
                <div key={wf.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{wf.name}</p>
                    <p className="text-sm text-slate-600">Status: {wf.status} • Stages: {wf.stages.length}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="border-slate-200 bg-slate-100 text-slate-800">{wf.id}</Badge>
                    <Link href={`/workflows/instances/${wf.id}`} className="text-brand hover:underline text-sm">Open</Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No workflows yet.</p>
        ) : (
          items.map((wf) => (
            <Card key={wf.id}>
              <CardHeader className="items-start">
                <div>
                  <CardTitle>Profile change for {wf.employeeId}</CardTitle>
                  <CardDescription>Submitted {new Date(wf.createdAt).toLocaleString()} · Step: {wf.step.replace('_', ' ')}</CardDescription>
                </div>
                <Link href={`/workflows/${wf.id}`}>
                  <Button variant="secondary">Open</Button>
                </Link>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

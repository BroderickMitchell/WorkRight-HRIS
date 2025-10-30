"use client";
import { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';
import { apiFetch } from '../../../lib/api';
import { listTemplates, saveTemplate, type WorkflowTemplate, type TemplateStage, type TemplateStep, type Assignee } from '../../../lib/workflow-templates';

type Position = { id: string; positionHumanId: string; title: string; status: 'PENDING'|'ACTIVE'|'ARCHIVED' };

function makeId(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

export default function WorkflowTemplatesSettingsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);

  const [name, setName] = useState('');
  const [target, setTarget] = useState<'EMPLOYEE'|'GENERIC'>('EMPLOYEE');
  const [stages, setStages] = useState<TemplateStage[]>([{
    id: makeId('stg'),
    name: 'Approvals',
    completionPolicy: 'ALL',
    steps: []
  }]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await apiFetch<Position[]>(`/v1/org/positions?status=active`);
        setPositions(rows);
      } catch {
        setPositions([]);
      }
    })();
    setTemplates(listTemplates());
  }, []);

  const activePositions = useMemo(() => positions.filter(p => p.status === 'ACTIVE'), [positions]);

  function addStep(stageId: string) {
    setStages(prev => prev.map(s => s.id === stageId ? ({
      ...s,
      steps: [...s.steps, { id: makeId('step'), name: 'Approval', type: 'APPROVAL' as const, assignees: [] }]
    }) : s));
  }

  function setStep(stageId: string, stepId: string, update: Partial<TemplateStep>) {
    setStages(prev => prev.map(s => s.id === stageId ? ({
      ...s,
      steps: s.steps.map(st => st.id === stepId ? ({ ...st, ...update }) : st)
    }) : s));
  }

  function addAssignee(stageId: string, stepId: string, a: Assignee) {
    setStages(prev => prev.map(s => s.id === stageId ? ({
      ...s,
      steps: s.steps.map(st => st.id === stepId ? ({ ...st, assignees: [...st.assignees, a] }) : st)
    }) : s));
  }

  function removeAssignee(stageId: string, stepId: string, idx: number) {
    setStages(prev => prev.map(s => s.id === stageId ? ({
      ...s,
      steps: s.steps.map(st => st.id === stepId ? ({ ...st, assignees: st.assignees.filter((_, i) => i !== idx) }) : st)
    }) : s));
  }

  function save() {
    if (!name.trim()) return;
    const tpl = saveTemplate({
      name: name.trim(),
      target,
      active: true,
      stages
    });
    setTemplates(listTemplates());
    setName('');
    setTarget('EMPLOYEE');
    setStages([{ id: makeId('stg'), name: 'Approvals', completionPolicy: 'ALL', steps: [] }]);
    return tpl;
  }

  return (
    <div className="space-y-6" aria-label="Workflow templates settings">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Workflow Templates</h1>
          <p className="text-slate-600">Configure customizable workflow steps and assignments by position.</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Create Template</CardTitle>
            <CardDescription>Define stages and steps. Each step can be assigned to positions or the employee&#39;s manager.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Template name</label>
              <input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Onboarding, Pay Change" />
            </div>
            <div>
              <label className="block text-sm text-slate-700 mb-1">Target</label>
              <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={target} onChange={(e) => setTarget(e.target.value as any)}>
                <option value="EMPLOYEE">Employee-centric</option>
                <option value="GENERIC">Generic</option>
              </select>
            </div>
          </div>

          {stages.map((stage) => (
            <div key={stage.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={stage.name} onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? ({ ...s, name: e.target.value }) : s))} />
                  <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={stage.completionPolicy} onChange={(e) => setStages(prev => prev.map(s => s.id === stage.id ? ({ ...s, completionPolicy: e.target.value as any }) : s))}>
                    <option value="ALL">Require all steps</option>
                    <option value="ANY">Any step completes</option>
                  </select>
                </div>
                <Button variant="secondary" onClick={() => addStep(stage.id)}>Add step</Button>
              </div>
              {stage.steps.length === 0 ? (
                <p className="text-sm text-slate-500">No steps. Click Add step to define one.</p>
              ) : (
                <div className="space-y-3">
                  {stage.steps.map((st) => (
                    <div key={st.id} className="rounded-md border border-slate-200 p-3">
                      <div className="grid gap-3 md:grid-cols-3">
                        <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={st.name} onChange={(e) => setStep(stage.id, st.id, { name: e.target.value })} />
                        <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={st.type} onChange={(e) => setStep(stage.id, st.id, { type: e.target.value as any })}>
                          <option value="APPROVAL">Approval</option>
                          <option value="TASK">Task</option>
                        </select>
                        <div className="text-sm text-slate-600 flex items-center">Assignees: {st.assignees.length || 0}</div>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {st.assignees.map((a, i) => (
                          <Badge key={i} className="border-slate-200 bg-slate-100 text-slate-800 flex items-center gap-2">
                            {a.kind === 'POSITION' ? `Position: ${a.positionId}` : 'Manager of employee'}
                            <button className="ml-1 text-slate-500 hover:text-slate-700" onClick={() => removeAssignee(stage.id, st.id, i)}>Ã—</button>
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div className="flex items-center gap-2">
                          <select className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" onChange={(e) => {
                            const posId = e.target.value;
                            if (posId) addAssignee(stage.id, st.id, { kind: 'POSITION', positionId: posId });
                          }}>
                            <option value="">Assign by positionâ€¦</option>
                            {activePositions.map((p) => (
                              <option key={p.id} value={p.id}>{p.positionHumanId} â€“ {p.title}</option>
                            ))}
                          </select>
                        </div>
                        {target === 'EMPLOYEE' && (
                          <Button variant="secondary" onClick={() => addAssignee(stage.id, st.id, { kind: 'MANAGER_OF_EMPLOYEE' })}>Add manager of employee</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-end gap-3">
            <Button onClick={() => save()}>Save template</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Existing Templates</CardTitle>
            <CardDescription>These templates are active and can be used to start workflows.</CardDescription>
          </div>
        </CardHeader>
        <div className="divide-y divide-slate-200 p-6 pt-0">
          {templates.length === 0 ? (
            <p className="text-sm text-slate-500">No templates yet.</p>
          ) : templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-600">Target: {t.target} â€¢ Stages: {t.stages.length}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}



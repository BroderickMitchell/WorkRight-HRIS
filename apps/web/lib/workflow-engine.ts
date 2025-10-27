import { apiFetch, apiPost } from './api';
import { getItem, setItem } from './store';
import type { Assignee, WorkflowTemplate, TemplateStage, TemplateStep } from './workflow-templates';

export type InstanceStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type StepInstanceStatus = 'PENDING' | 'COMPLETED' | 'DECLINED';

export interface StepAssigneeResolution {
  assignee: Assignee;
  resolvedEmployeeId?: string; // filled when we can resolve a person (e.g., occupant of a position)
}

export interface StepInstance {
  id: string;
  defId: string; // links to TemplateStep.id
  name: string;
  type: 'APPROVAL' | 'TASK';
  assignees: StepAssigneeResolution[];
  status: StepInstanceStatus;
  actedAt?: string;
}

export interface StageInstance {
  id: string;
  defId: string; // TemplateStage.id
  name: string;
  completionPolicy: 'ALL' | 'ANY';
  steps: StepInstance[];
  completedAt?: string;
}

export type ActivityKind =
  | 'INSTANCE_CREATED'
  | 'STAGE_STARTED'
  | 'STEP_COMPLETED'
  | 'STEP_DECLINED'
  | 'STAGE_COMPLETED'
  | 'INSTANCE_COMPLETED';

export interface Activity {
  id: string;
  at: string; // ISO
  kind: ActivityKind;
  message: string;
  stageId?: string;
  stepId?: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
}

export interface WorkflowTargetEmployee { kind: 'EMPLOYEE'; employeeId: string }
export interface WorkflowTargetGeneric { kind: 'GENERIC'; ref?: string }
export type WorkflowTarget = WorkflowTargetEmployee | WorkflowTargetGeneric;

export interface WorkflowInstance {
  id: string;
  templateId: string;
  name: string;
  target: WorkflowTarget;
  status: InstanceStatus;
  stages: StageInstance[];
  currentStageIndex: number; // -1 if none
  activities: Activity[];
  createdAt: string;
  updatedAt: string;
}

const KEY_INSTANCES = 'workflowInstances';

export function listInstances(): WorkflowInstance[] {
  return getItem<WorkflowInstance[]>(KEY_INSTANCES, []);
}

function saveInstances(list: WorkflowInstance[]) {
  setItem(KEY_INSTANCES, list);
}


async function recordActivityEvent(wf: WorkflowInstance, activity: Activity) {
  try {
    await apiPost('/v1/audit/events', {
      entity: 'workflowInstance',
      entityId: wf.id,
      action: activity.kind,
      changes: {
        message: activity.message,
        stageId: activity.stageId,
        stepId: activity.stepId,
        actorId: activity.actorId,
        actorName: activity.actorName,
        actorRole: activity.actorRole
      }
    });
  } catch {
    // ignore client-side audit errors
  }
}
export async function resolveAssignee(assignee: Assignee, context: { target: WorkflowTarget }): Promise<StepAssigneeResolution> {
  if (assignee.kind === 'POSITION') {
    try {
      const employees = await apiFetch<any[]>(`/v1/directory/employees`);
      const occupant = employees.find((e) => e.positionId === assignee.positionId);
      return { assignee, resolvedEmployeeId: occupant?.id };
    } catch {
      return { assignee };
    }
  }
  if (assignee.kind === 'MANAGER_OF_EMPLOYEE' && context.target.kind === 'EMPLOYEE') {
    try {
      const emp = await apiFetch<any>(`/v1/directory/employees/${context.target.employeeId}`);
      return { assignee, resolvedEmployeeId: emp?.managerId };
    } catch {
      return { assignee };
    }
  }
  return { assignee };
}

function makeId(prefix: string) { return `${prefix}-${Math.random().toString(36).slice(2, 8)}`; }

async function instantiateStep(step: TemplateStep, context: { target: WorkflowTarget }): Promise<StepInstance> {
  const assignees: StepAssigneeResolution[] = [];
  for (const a of step.assignees) {
    assignees.push(await resolveAssignee(a, context));
  }
  return {
    id: makeId('wfi-step'),
    defId: step.id,
    name: step.name,
    type: step.type,
    assignees,
    status: 'PENDING'
  };
}

async function instantiateStage(stage: TemplateStage, context: { target: WorkflowTarget }): Promise<StageInstance> {
  const steps: StepInstance[] = [];
  for (const s of stage.steps) {
    steps.push(await instantiateStep(s, context));
  }
  return {
    id: makeId('wfi-stage'),
    defId: stage.id,
    name: stage.name,
    completionPolicy: stage.completionPolicy,
    steps
  };
}

export async function createInstanceFromTemplate(
  template: WorkflowTemplate,
  target: WorkflowTarget,
  name?: string,
  actor?: { id?: string; name?: string; role?: string }
): Promise<WorkflowInstance> {
  const now = new Date().toISOString();
  const stages: StageInstance[] = [];
  for (const st of template.stages) {
    stages.push(await instantiateStage(st, { target }));
  }
  const activities: Activity[] = [
    { id: makeId('act'), at: now, kind: 'INSTANCE_CREATED', message: `Workflow created from template '${template.name}'`, actorId: actor?.id, actorName: actor?.name ?? 'System', actorRole: actor?.role }
  ];
  if (stages.length > 0) {
    activities.push({ id: makeId('act'), at: now, kind: 'STAGE_STARTED', message: `Stage started: ${stages[0].name}`, stageId: stages[0].id });
  }
  const instance: WorkflowInstance = {
    id: makeId('wfi'),
    templateId: template.id,
    name: name ?? template.name,
    target,
    status: 'ACTIVE',
    stages,
    currentStageIndex: stages.length > 0 ? 0 : -1,
    activities,
    createdAt: now,
    updatedAt: now
  };
  const all = listInstances();
  all.unshift(instance);
  saveInstances(all);
  for (const act of activities) { recordActivityEvent(instance, act); }
  return instance;
}

function isStageComplete(stage: StageInstance): boolean {
  if (stage.completionPolicy === 'ALL') return stage.steps.every((s) => s.status === 'COMPLETED');
  return stage.steps.some((s) => s.status === 'COMPLETED');
}

export async function actOnStep(
  instanceId: string,
  stepId: string,
  action: 'APPROVE' | 'COMPLETE' | 'DECLINE',
  actor?: { id?: string; name?: string; role?: string }
) {
  const all = listInstances();
  const idx = all.findIndex((w) => w.id === instanceId);
  if (idx < 0) return;
  const wf = all[idx];
  const now = new Date().toISOString();
  for (const stage of wf.stages) {
    const s = stage.steps.find((st) => st.id === stepId);
    if (!s) continue;
    s.status = action === 'DECLINE' ? 'DECLINED' : 'COMPLETED';
    s.actedAt = now;
    const stepEvent: Activity = {
      id: makeId('act'),
      at: now,
      kind: action === 'DECLINE' ? 'STEP_DECLINED' : 'STEP_COMPLETED',
      message: `${s.name} ${action === 'DECLINE' ? 'declined' : 'completed'}`,
      stageId: stage.id,
      stepId: s.id,
      actorId: actor?.id,
      actorName: actor?.name ?? 'You',
      actorRole: actor?.role
    };
    wf.activities.push(stepEvent);
    recordActivityEvent(wf, stepEvent);
    break;
  }
  const current = wf.currentStageIndex >= 0 ? wf.stages[wf.currentStageIndex] : undefined;
  if (current && isStageComplete(current)) {
    current.completedAt = now;
    const completedEvent: Activity = {
      id: makeId('act'),
      at: now,
      kind: 'STAGE_COMPLETED',
      message: `Stage completed: ${current.name}`,
      stageId: current.id,
      actorId: actor?.id,
      actorName: actor?.name ?? 'You',
      actorRole: actor?.role
    };
    wf.activities.push(completedEvent);
    recordActivityEvent(wf, completedEvent);
    wf.currentStageIndex = wf.currentStageIndex + 1 < wf.stages.length ? wf.currentStageIndex + 1 : -1;
    const next = wf.currentStageIndex >= 0 ? wf.stages[wf.currentStageIndex] : undefined;
    if (next) {
      const startedEvent: Activity = {
        id: makeId('act'),
        at: now,
        kind: 'STAGE_STARTED',
        message: `Stage started: ${next.name}`,
        stageId: next.id
      };
      wf.activities.push(startedEvent);
      recordActivityEvent(wf, startedEvent);
    }
  }
  if (wf.currentStageIndex === -1) wf.status = 'COMPLETED';
  if (wf.status === 'COMPLETED') {
    const doneEvent: Activity = {
      id: makeId('act'),
      at: now,
      kind: 'INSTANCE_COMPLETED',
      message: `Workflow completed`,
      actorId: actor?.id,
      actorName: actor?.name ?? 'You',
      actorRole: actor?.role
    };
    wf.activities.push(doneEvent);
    recordActivityEvent(wf, doneEvent);
  }
  wf.updatedAt = now;
  all[idx] = wf;
  saveInstances(all);
}













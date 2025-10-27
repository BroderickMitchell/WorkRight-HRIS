import { getItem, setItem } from './store';

export type AssigneePosition = { kind: 'POSITION'; positionId: string };
export type AssigneeManagerOfEmployee = { kind: 'MANAGER_OF_EMPLOYEE' };
export type Assignee = AssigneePosition | AssigneeManagerOfEmployee;

export type StepType = 'APPROVAL' | 'TASK';

export interface TemplateStep {
  id: string;
  name: string;
  type: StepType;
  assignees: Assignee[]; // can be multiple assignees; semantics controlled by policy
}

export interface TemplateStage {
  id: string;
  name: string;
  steps: TemplateStep[];
  completionPolicy: 'ALL' | 'ANY';
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  target: 'EMPLOYEE' | 'GENERIC';
  active: boolean;
  stages: TemplateStage[];
  createdAt: string;
  updatedAt: string;
}

const KEY_TEMPLATES = 'workflowTemplates';

export function listTemplates(): WorkflowTemplate[] {
  return getItem<WorkflowTemplate[]>(KEY_TEMPLATES, []);
}

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return listTemplates().find((t) => t.id === id);
}

export function saveTemplate(input: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): WorkflowTemplate {
  const all = listTemplates();
  const now = new Date().toISOString();
  if (input.id) {
    const idx = all.findIndex((t) => t.id === input.id);
    const existing = idx >= 0 ? all[idx] : undefined;
    const updated: WorkflowTemplate = {
      id: input.id,
      name: input.name,
      target: input.target,
      active: input.active,
      stages: input.stages,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    if (idx >= 0) all[idx] = updated; else all.unshift(updated);
    setItem(KEY_TEMPLATES, all);
    return updated;
  } else {
    const id = `wft-${Math.random().toString(36).slice(2, 8)}`;
    const created: WorkflowTemplate = {
      id,
      name: input.name,
      target: input.target,
      active: input.active,
      stages: input.stages,
      createdAt: now,
      updatedAt: now
    };
    all.unshift(created);
    setItem(KEY_TEMPLATES, all);
    return created;
  }
}

export function deleteTemplate(id: string) {
  const filtered = listTemplates().filter((t) => t.id !== id);
  setItem(KEY_TEMPLATES, filtered);
}


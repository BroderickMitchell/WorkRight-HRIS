import { getItem, setItem } from './store';
import { EmployeeOverride, setEmployeeOverride } from './overrides';

export type WorkflowStep = 'MANAGER_REVIEW' | 'HR_REVIEW' | 'COMPLETED' | 'DECLINED';

export interface ProfileChangeWorkflow {
  id: string;
  type: 'PROFILE_CHANGE';
  employeeId: string;
  submittedBy: string;
  changes: EmployeeOverride;
  step: WorkflowStep;
  createdAt: string;
  updatedAt: string;
  approvals: { role: 'MANAGER' | 'HR_ADMIN' | 'HRBP'; actor?: string; at?: string; decision?: 'APPROVED' | 'DECLINED' }[];
}

const KEY = 'workflows';

export function listWorkflows(): ProfileChangeWorkflow[] {
  return getItem<ProfileChangeWorkflow[]>(KEY, []);
}

export function getWorkflow(id: string): ProfileChangeWorkflow | undefined {
  return listWorkflows().find((w) => w.id === id);
}

export function createProfileChangeWorkflow(input: {
  employeeId: string;
  submittedBy: string;
  changes: EmployeeOverride;
}): ProfileChangeWorkflow {
  const id = `wf-${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();
  const wf: ProfileChangeWorkflow = {
    id,
    type: 'PROFILE_CHANGE',
    employeeId: input.employeeId,
    submittedBy: input.submittedBy,
    changes: input.changes,
    step: 'MANAGER_REVIEW',
    createdAt: now,
    updatedAt: now,
    approvals: [
      { role: 'MANAGER' },
      { role: 'HR_ADMIN' }
    ]
  };
  const all = listWorkflows();
  all.unshift(wf);
  setItem(KEY, all);
  return wf;
}

export function approveWorkflow(id: string, actorRole: 'MANAGER' | 'HR_ADMIN' | 'HRBP', actorName = 'You') {
  const all = listWorkflows();
  const idx = all.findIndex((w) => w.id === id);
  if (idx < 0) return;
  const wf = all[idx];
  const now = new Date().toISOString();
  if (wf.step === 'MANAGER_REVIEW' && actorRole === 'MANAGER') {
    wf.approvals[0] = { role: 'MANAGER', actor: actorName, at: now, decision: 'APPROVED' };
    wf.step = 'HR_REVIEW';
  } else if (wf.step === 'HR_REVIEW' && (actorRole === 'HR_ADMIN' || actorRole === 'HRBP')) {
    wf.approvals[1] = { role: 'HR_ADMIN', actor: actorName, at: now, decision: 'APPROVED' };
    wf.step = 'COMPLETED';
    // apply overrides now
    setEmployeeOverride(wf.employeeId, wf.changes);
  }
  wf.updatedAt = now;
  all[idx] = wf;
  setItem(KEY, all);
}

export function declineWorkflow(id: string, actorRole: 'MANAGER' | 'HR_ADMIN' | 'HRBP', actorName = 'You') {
  const all = listWorkflows();
  const idx = all.findIndex((w) => w.id === id);
  if (idx < 0) return;
  const wf = all[idx];
  const now = new Date().toISOString();
  if (wf.step === 'MANAGER_REVIEW' && actorRole === 'MANAGER') {
    wf.approvals[0] = { role: 'MANAGER', actor: actorName, at: now, decision: 'DECLINED' };
  } else if (wf.step === 'HR_REVIEW' && (actorRole === 'HR_ADMIN' || actorRole === 'HRBP')) {
    wf.approvals[1] = { role: 'HR_ADMIN', actor: actorName, at: now, decision: 'DECLINED' };
  }
  wf.step = 'DECLINED';
  wf.updatedAt = now;
  all[idx] = wf;
  setItem(KEY, all);
}


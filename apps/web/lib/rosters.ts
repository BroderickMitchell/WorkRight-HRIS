import { apiFetch, apiPost } from './api';

export type RosterTemplate = {
  id: string;
  name: string;
  seedDate: string;
  pattern: string[];
};

export type RosterAssignment = {
  id: string;
  employeeId: string;
  employeeName?: string;
  templateId: string;
  templateName?: string;
  locationId?: string;
  locationName?: string;
  effectiveFrom: string;
  effectiveTo?: string;
};

export type CreateRosterTemplateInput = {
  name: string;
  seedDate: string;
  pattern: string[];
};

export type AssignRosterInput = {
  employeeId: string;
  templateId: string;
  locationId?: string;
  effectiveFrom: string;
  effectiveTo?: string;
};

export type RosterShiftsQuery = {
  employeeId: string;
  from: string;
  to: string;
};

export const rosterTemplatesKey = () => ['rosters', 'templates'] as const;
export const rosterAssignmentsKey = (employeeId?: string) =>
  ['rosters', 'assignments', employeeId ?? 'all'] as const;

export async function fetchRosterTemplates(): Promise<RosterTemplate[]> {
  const data = await apiFetch<any[]>(`/v1/rosters/templates`);
  return (data ?? []).map((item) => ({
    id: String(item.id),
    name: String(item.name ?? ''),
    seedDate: typeof item.seedDate === 'string' ? item.seedDate : new Date(item.seedDate).toISOString(),
    pattern: Array.isArray(item.pattern) ? item.pattern.map(String) : []
  }));
}

export async function fetchRosterAssignments(params: { employeeId?: string } = {}): Promise<RosterAssignment[]> {
  const query = new URLSearchParams();
  if (params.employeeId) {
    query.set('employeeId', params.employeeId);
  }
  const path = `/v1/rosters/assignments${query.toString() ? `?${query.toString()}` : ''}`;
  const data = await apiFetch<any[]>(path);
  return (data ?? []).map((item) => ({
    id: String(item.id),
    employeeId: String(item.employeeId),
    employeeName: item.employeeName ? String(item.employeeName) : undefined,
    templateId: String(item.templateId),
    templateName: item.templateName ? String(item.templateName) : undefined,
    locationId: item.locationId ? String(item.locationId) : undefined,
    locationName: item.locationName ? String(item.locationName) : undefined,
    effectiveFrom:
      typeof item.effectiveFrom === 'string'
        ? item.effectiveFrom
        : new Date(item.effectiveFrom).toISOString(),
    effectiveTo:
      item.effectiveTo
        ? typeof item.effectiveTo === 'string'
          ? item.effectiveTo
          : new Date(item.effectiveTo).toISOString()
        : undefined
  }));
}

export async function createRosterTemplate(input: CreateRosterTemplateInput) {
  return apiPost(`/v1/rosters/templates`, input, { roles: 'HR_ADMIN,MANAGER' });
}

export async function assignRoster(input: AssignRosterInput) {
  return apiPost(`/v1/rosters/assignments`, input, { roles: 'HR_ADMIN,MANAGER' });
}

export async function fetchRosterShifts({ employeeId, from, to }: RosterShiftsQuery) {
  const params = new URLSearchParams({ employeeId, from, to });
  const data = await apiFetch<any[]>(`/v1/rosters/shifts?${params.toString()}`);
  return (data ?? []).map((item) => ({
    id: String(item.id ?? `${employeeId}-${item.date}`),
    employeeId: String(item.employeeId ?? employeeId),
    date: String(item.date),
    shiftType: String(item.shiftType ?? '')
  }));
}

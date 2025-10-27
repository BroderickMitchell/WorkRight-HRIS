import {
  CostSplitInput,
  EmployeeProfilePayload,
  GenerateDocumentInput,
  UpdateEmployeeProfileInput,
  costSplitInputSchema,
  costSplitSchema,
  employeeProfileSchema,
  employmentEventSchema,
  generatedDocumentSchema,
  historyCsvResponseSchema,
  updateEmployeeProfileSchema,
  upsertCostSplitSchema
} from '@workright/profile-schema';
import { apiDelete, apiFetch, apiPatch, apiPost } from './api';

export const employeeProfileQueryKey = (id: string) => ['employee-profile', id];
export const employeeCostSplitsKey = (id: string) => ['employee-profile', id, 'cost-splits'];
export const employeeDocumentsKey = (id: string) => ['employee-profile', id, 'documents'];
export const employeeHistoryKey = (id: string, filters?: Record<string, unknown>) => [
  'employee-profile',
  id,
  'history',
  filters ?? {}
];

export async function fetchEmployeeProfile(id: string): Promise<EmployeeProfilePayload> {
  const data = await apiFetch(`/v1/employees/${id}`);
  return employeeProfileSchema.parse(data);
}

export async function updateEmployeeSection(id: string, input: UpdateEmployeeProfileInput) {
  const payload = updateEmployeeProfileSchema.parse(input);
  const response = await apiPatch(`/v1/employees/${id}`, payload);
  return employeeProfileSchema.parse(response);
}

export async function fetchCostSplits(id: string) {
  const data = await apiFetch(`/v1/employees/${id}/cost-splits`);
  return (data as unknown[]).map((item) => costSplitSchema.parse(item));
}

export async function upsertCostSplits(id: string, splits: CostSplitInput[]) {
  const payload = upsertCostSplitSchema.parse({ splits });
  const data = await apiPost(`/v1/employees/${id}/cost-splits`, payload);
  return (data as unknown[]).map((item) => costSplitSchema.parse(item));
}

export async function updateCostSplit(splitId: string, split: CostSplitInput) {
  const payload = costSplitInputSchema.parse(split);
  const data = await apiPatch(`/v1/employees/cost-splits/${splitId}`, payload);
  return (data as unknown[]).map((item) => costSplitSchema.parse(item));
}

export async function deleteCostSplit(splitId: string) {
  return apiDelete(`/v1/employees/cost-splits/${splitId}`);
}

export async function fetchHistory(id: string, filters: { type?: string; from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const query = params.toString();
  const data = await apiFetch(`/v1/employees/${id}/history${query ? `?${query}` : ''}`);
  return (data as unknown[]).map((item) => employmentEventSchema.parse(item));
}

export async function exportHistory(id: string, filters: { type?: string; from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  const query = params.toString();
  const data = await apiFetch(`/v1/employees/${id}/history/export${query ? `?${query}` : ''}`);
  return historyCsvResponseSchema.parse(data);
}

export async function fetchDocuments(id: string) {
  const data = await apiFetch(`/v1/employees/${id}/documents`);
  return (data as unknown[]).map((item) => generatedDocumentSchema.parse(item));
}

export async function generateDocument(id: string, input: GenerateDocumentInput) {
  const data = await apiPost(`/v1/employees/${id}/documents/generate`, input);
  return generatedDocumentSchema.parse(data);
}

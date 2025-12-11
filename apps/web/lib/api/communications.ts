import { apiDelete, apiFetch, apiPatch, apiPost } from '../api';

export interface CommunicationAttachment {
  url: string;
  name: string;
  type?: string;
}

export interface CommunicationMention {
  userId: string;
}

export interface CommunicationTeam {
  id: string;
  name: string;
  departmentId: string;
  departmentName?: string;
}

export interface CommunicationAuthor {
  id: string;
  email: string;
  givenName: string;
  familyName: string;
}

export interface CommunicationAckState {
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface CommunicationAckSummary {
  summary: { required: number; acknowledged: number; pending: number };
  perTeam: Array<{
    team: { id: string; name: string; departmentId: string };
    counts: { required: number; acknowledged: number; pending: number };
  }>;
  recipients: Array<{
    user: { id: string; email: string; givenName: string; familyName: string };
    acknowledged: boolean;
    acknowledgedAt?: string | null;
    teamIds: string[];
  }>;
}

export interface CommunicationPost {
  id: string;
  title: string;
  body: string;
  attachments?: CommunicationAttachment[];
  mentions?: CommunicationMention[];
  requireAck: boolean;
  ackDueAt?: string;
  createdAt: string;
  editedAt?: string;
  deletedAt?: string;
  lastEditedBy?: string;
  department?: { id: string; name: string };
  author: CommunicationAuthor;
  targetTeams: CommunicationTeam[];
  canEdit: boolean;
  canDelete: boolean;
  myAck?: CommunicationAckState;
  ackSummary?: CommunicationAckSummary['summary'];
}

export interface CommunicationListResponse {
  items: CommunicationPost[];
  nextCursor?: string;
}

export interface CommunicationContextTeam extends CommunicationTeam {
  isMember: boolean;
}

export type CommunicationRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'EMPLOYEE';

export interface CommunicationContext {
  role: CommunicationRole;
  roleKeys: string[];
  departmentId: string | null;
  teamIds: string[];
  supervisorTeamIds: string[];
  allowMultiTeamCommunication: boolean;
  canRequireAck: boolean;
  teams: CommunicationContextTeam[];
}

export interface CreateCommunicationPayload {
  title: string;
  body: string;
  targetTeamIds: string[];
  attachments?: CommunicationAttachment[];
  mentions?: CommunicationMention[];
  requireAck?: boolean;
  ackDueAt?: string | null;
}

export interface UpdateCommunicationPayload extends CreateCommunicationPayload {}

export interface AckListItem {
  post: CommunicationPost;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface AckListResponse {
  items: AckListItem[];
  nextCursor?: string;
}

const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs.length ? `?${qs}` : '';
};

export async function getCommunicationContext(): Promise<CommunicationContext> {
  return apiFetch<CommunicationContext>('/v1/communications/context');
}

export interface ListCommunicationsParams {
  cursor?: string;
  take?: number;
  teamId?: string;
  includeAckSummary?: boolean;
}

export async function listCommunications(params: ListCommunicationsParams = {}): Promise<CommunicationListResponse> {
  const qs = buildQueryString({
    cursor: params.cursor,
    take: params.take,
    teamId: params.teamId,
    includeAckSummary: params.includeAckSummary ?? true
  });
  return apiFetch<CommunicationListResponse>(`/v1/communications${qs}`);
}

export async function createCommunication(payload: CreateCommunicationPayload): Promise<CommunicationPost> {
  return apiPost<CommunicationPost>('/v1/communications', payload);
}

export async function updateCommunication(id: string, payload: UpdateCommunicationPayload): Promise<CommunicationPost> {
  return apiPatch<CommunicationPost>(`/v1/communications/${id}`, payload);
}

export async function deleteCommunication(id: string): Promise<void> {
  await apiDelete(`/v1/communications/${id}`);
}

export async function acknowledgeCommunication(id: string): Promise<CommunicationPost> {
  return apiPost<CommunicationPost>(`/v1/communications/${id}/ack`, {});
}

export async function getCommunicationAckSummary(id: string): Promise<CommunicationAckSummary> {
  return apiFetch<CommunicationAckSummary>(`/v1/communications/${id}/ack/summary`);
}

export interface ListAckParams {
  cursor?: string;
  take?: number;
  onlyPending?: boolean;
}

export async function getMyRequiredAcks(params: ListAckParams = {}): Promise<AckListResponse> {
  const qs = buildQueryString({
    cursor: params.cursor,
    take: params.take,
    onlyPending: params.onlyPending
  });
  return apiFetch<AckListResponse>(`/v1/communications/acks/mine${qs}`);
}

import { RoleKey } from '@prisma/client';

export type CommunicationRole = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'EMPLOYEE';

export interface ActorContext {
  userId: string;
  tenantId: string;
  roleKeys: RoleKey[];
  role: CommunicationRole;
  departmentId?: string | null;
  teamIds: string[];
  supervisorTeamIds: string[];
  allowMultiTeamCommunication: boolean;
}

export interface CommunicationPostSummary {
  id: string;
  title: string;
  body: string;
  requireAck: boolean;
  ackDueAt?: Date | null;
  createdAt: Date;
  editedAt?: Date | null;
  deletedAt?: Date | null;
  lastEditedBy?: string | null;
  attachments?: any;
  mentions?: any;
  department?: { id: string; name: string } | null;
  author: { id: string; email: string; givenName: string; familyName: string };
  targetTeams: Array<{ id: string; name: string; departmentId: string }>;
  canEdit: boolean;
  canDelete: boolean;
  myAck?: { acknowledged: boolean; acknowledgedAt?: Date | null };
  ackSummary?: { required: number; acknowledged: number; pending: number };
}

export interface AckSummary {
  summary: { required: number; acknowledged: number; pending: number };
  perTeam: Array<{
    team: { id: string; name: string; departmentId: string };
    counts: { required: number; acknowledged: number; pending: number };
  }>;
  recipients: Array<{
    user: { id: string; email: string; givenName: string; familyName: string };
    acknowledged: boolean;
    acknowledgedAt?: Date | null;
    teamIds: string[];
  }>;
}

export interface AckItem {
  post: CommunicationPostSummary;
  acknowledged: boolean;
  acknowledgedAt?: Date | null;
}

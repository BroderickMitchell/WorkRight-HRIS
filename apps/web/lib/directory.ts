import { cache } from 'react';
import { apiFetch } from './api';

export interface DirectoryEmployee {
  id: string;
  givenName: string;
  familyName: string;
  email: string;
  managerId?: string | null;
  position?: { title?: string | null; department?: { name?: string | null } | null } | null;
  department?: { name?: string | null } | null;
  location?: { name?: string | null } | null;
  manager?: { id: string; givenName: string; familyName: string; email?: string | null } | null;
}

export interface EmployeeGoal {
  id: string;
  title: string;
  description?: string | null;
  dueDate: string;
  status: string;
  weighting: number;
}

export interface EmployeeLeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  leaveType?: { name: string } | null;
}

export interface EmployeeReview {
  id: string;
  cycle: string;
  status: string;
  overall?: string | null;
}

export interface EmployeeProfile extends DirectoryEmployee {
  directReports: Array<{
    id: string;
    givenName: string;
    familyName: string;
    email?: string | null;
    position?: { title?: string | null } | null;
  }>;
  goals: EmployeeGoal[];
  leaveRequests: EmployeeLeaveRequest[];
  leaveBalances: Array<{ id: string; leaveTypeId: string; balance: number; leaveType?: { name: string } | null }>;
  reviews: EmployeeReview[];
}

export const fetchEmployees = cache(async () => {
  return apiFetch<DirectoryEmployee[]>('/v1/directory/employees');
});

export const fetchEmployeeProfile = cache(async (id: string) => {
  return apiFetch<EmployeeProfile>(`/v1/directory/employees/${id}`);
});

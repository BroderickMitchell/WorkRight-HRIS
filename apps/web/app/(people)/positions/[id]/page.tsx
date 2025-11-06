"use client";
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@workright/ui';
import { apiFetch } from '../../../../lib/api';

const vacancyClasses = {
  open: 'bg-amber-100 text-amber-800 border-amber-200',
  filled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overfilled: 'bg-rose-100 text-rose-800 border-rose-200',
  inactive: 'bg-slate-100 text-slate-600 border-slate-200'
} as const;

type VacancyStatus = keyof typeof vacancyClasses;

type Assignment = {
  id: string;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate?: string | null;
  isPrimary: boolean;
  fte?: number | null;
  baseSalary?: number | null;
};

type PositionDetail = {
  id: string;
  positionId: string;
  title: string;
  vacancyStatus: VacancyStatus;
  headcount: number;
  isActive: boolean;
  inheritRoleData: boolean;
  budgetedFte?: number | null;
  budgetedSalary?: number | null;
  department?: { id: string; name: string } | null;
  location?: { id: string; name: string } | null;
  parent?: { id: string; title: string; positionId: string } | null;
  jobRole?: {
    id: string;
    title: string;
    description?: string | null;
    skills: string[];
    goals: string[];
    courses: string[];
    competencies: string[];
  } | null;
  assignments: Assignment[];
};

function VacancyBadge({ status }: { status: VacancyStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${vacancyClasses[status]}`}>
      {status === 'open' && 'Vacant'}
      {status === 'filled' && 'Filled'}
      {status === 'overfilled' && 'Overfilled'}
      {status === 'inactive' && 'Inactive'}
    </span>
  );
}

export default function PositionDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? '');
  const [position, setPosition] = useState<PositionDetail | null>(null);

  const load = useCallback(async () => {
    const data = await apiFetch<PositionDetail>(`/v1/positions/${id}`);
    setPosition(data);
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  if (!position) return null;

  return (
    <div className="space-y-6" aria-label="Position detail">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-slate-900">{position.positionId} · {position.title}</h1>
          <VacancyBadge status={position.vacancyStatus} />
          <span className="text-sm text-slate-600">Headcount {position.headcount}</span>
        </div>
        <p className="text-slate-600">
          {position.department ? position.department.name : 'No department assigned'}
          {position.location ? ` · ${position.location.name}` : ''}
          {position.parent ? ` · Reports to ${position.parent.positionId} ${position.parent.title}` : ''}
        </p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Key attributes and inheritance controls.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 p-6 pt-0 text-sm text-slate-700 md:grid-cols-2">
          <div>
            <p className="font-medium text-slate-900">Inheritance</p>
            <p>{position.inheritRoleData ? 'Enabled · employees inherit department, location, and manager from this position.' : 'Disabled · assignments retain their individual settings.'}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Budget</p>
            <p>
              {position.budgetedFte != null ? `${position.budgetedFte.toFixed(2)} FTE` : 'FTE not budgeted'}
              {' · '}
              {position.budgetedSalary != null ? `Budgeted salary $${position.budgetedSalary.toLocaleString()}` : 'No salary budget recorded'}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Current occupants and their allocation.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {position.assignments.length === 0 ? (
            <p className="text-sm text-slate-500">No active assignments. This position is currently vacant.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2 pr-4">Employee</th>
                    <th className="py-2 pr-4">Primary</th>
                    <th className="py-2 pr-4">FTE</th>
                    <th className="py-2 pr-4">Start</th>
                    <th className="py-2 pr-4">End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {position.assignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td className="py-2 pr-4">{assignment.employeeName ?? 'Unknown employee'}</td>
                      <td className="py-2 pr-4">{assignment.isPrimary ? 'Yes' : 'No'}</td>
                      <td className="py-2 pr-4">{assignment.fte != null ? assignment.fte.toFixed(2) : '—'}</td>
                      <td className="py-2 pr-4">{assignment.startDate?.slice(0, 10)}</td>
                      <td className="py-2 pr-4">{assignment.endDate ? assignment.endDate.slice(0, 10) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Job profile</CardTitle>
            <CardDescription>Default capabilities inherited from the linked job role.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
          <div>
            <p className="font-medium text-slate-900">Role title</p>
            <p className="text-sm text-slate-600">{position.jobRole?.title ?? 'No job role linked'}</p>
            {position.jobRole?.description && <p className="mt-2 text-sm text-slate-500">{position.jobRole.description}</p>}
          </div>
          <div>
            <p className="font-medium text-slate-900">Skills</p>
            <p className="text-sm text-slate-600">{position.jobRole?.skills?.length ? position.jobRole.skills.join(', ') : 'None configured'}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Goals</p>
            <p className="text-sm text-slate-600">{position.jobRole?.goals?.length ? position.jobRole.goals.join(', ') : 'None configured'}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Learning</p>
            <p className="text-sm text-slate-600">{position.jobRole?.courses?.length ? position.jobRole.courses.join(', ') : 'No learning items linked'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="font-medium text-slate-900">Competencies</p>
            <p className="text-sm text-slate-600">{position.jobRole?.competencies?.length ? position.jobRole.competencies.join(', ') : 'No competencies recorded'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

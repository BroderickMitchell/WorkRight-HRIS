import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@workright/ui';
import Link from 'next/link';
import { getEmployeeWithOverrides } from '../../../../lib/overrides';
import { EmployeeProfileTabs } from '../../../../components/employee/profile-tabs';

const PROFILE_TABS = ['Profile', 'Job Info', 'Compensation', 'Documents', 'History'] as const;

type ProfileTab = typeof PROFILE_TABS[number];

type TabConfig = Record<ProfileTab, string>;

export default function EmployeeLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const employee = getEmployeeWithOverrides(params.id);
  if (!employee) {
    notFound();
  }

  const tabRoutes: TabConfig = {
    Profile: `/employees/${employee.id}`,
    'Job Info': `/employees/${employee.id}/goals`,
    Compensation: `/employees/${employee.id}/remuneration`,
    Documents: `/employees/${employee.id}/documents`,
    History: `/employees/${employee.id}/history`
  };

  const tabs = PROFILE_TABS.map((tab) => ({ href: tabRoutes[tab], label: tab }));

  return (
    <div className="space-y-8" aria-label="Employee profile">
      <div className="sticky top-24 z-20 rounded-3xl border border-border bg-panel/95 px-6 py-6 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-panel/80">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <ProfileAvatar name={employee.name} src={employee.avatarUrl} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-foreground lg:text-3xl">{employee.name}</h1>
                <Badge className="bg-success/15 text-success">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {employee.role} · {employee.department}
              </p>
              <p className="text-xs text-muted-foreground">{employee.location}</p>
              <p className="mt-1 text-xs text-muted-foreground">{employee.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/employees/${employee.id}/leave`}>View leave</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/employees/${employee.id}/reviews`}>Performance</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/employees/${employee.id}/settings`}>Edit profile</Link>
            </Button>
          </div>
        </div>
        <div className="mt-6 overflow-x-auto">
          <EmployeeProfileTabs tabs={tabs} />
        </div>
      </div>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

function ProfileAvatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="h-16 w-16 rounded-2xl object-cover shadow-md ring-2 ring-border"
      />
    );
  }
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('');
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary ring-2 ring-border">
      {initials || 'WR'}
    </div>
  );
}

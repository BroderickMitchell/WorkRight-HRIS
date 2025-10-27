import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Badge, Button } from '@workright/ui';
import Link from 'next/link';
import { getEmployeeWithOverrides } from '../../../../lib/overrides';

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

  const tabs = [
    { href: `/employees/${employee.id}`, label: 'Overview' },
    { href: `/employees/${employee.id}/goals`, label: 'Goals' },
    { href: `/employees/${employee.id}/leave`, label: 'Leave' },
    { href: `/employees/${employee.id}/documents`, label: 'Documents' },
    { href: `/employees/${employee.id}/remuneration`, label: 'Remuneration' },
    { href: `/employees/${employee.id}/history`, label: 'History' },
    { href: `/employees/${employee.id}/reviews`, label: 'Reviews' },
    { href: `/employees/${employee.id}/discipline`, label: 'Discipline' },
    { href: `/employees/${employee.id}/settings`, label: 'Settings' }
  ];

  return (
    <div className="space-y-6" aria-label="Employee profile">
      <header className="space-y-2">
        <Badge className="w-max">{employee.department}</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">{employee.name}</h1>
        <p className="text-slate-600">{employee.role} · {employee.location}</p>
        <p className="text-sm text-slate-500">{employee.email}</p>
      </header>

      <div className="flex items-center justify-between">
        <nav className="-mb-px flex gap-4 border-b">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="border-b-2 border-transparent px-1 pb-2 text-sm font-medium text-slate-600 hover:border-brand hover:text-brand"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
        <Link href={`/employees/${employee.id}/settings`}>
          <Button size="sm" variant="secondary">Edit profile</Button>
        </Link>
      </div>

      <div>{children}</div>
    </div>
  );
}






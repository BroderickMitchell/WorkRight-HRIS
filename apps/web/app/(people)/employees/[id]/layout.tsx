import { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@workright/ui';
import { sampleEmployees } from '../../../../lib/sample-data';

export default function EmployeeLayout({
  children,
  params
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
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

      <div>{children}</div>
    </div>
  );
}




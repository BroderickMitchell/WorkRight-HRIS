import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@workright/ui';
import Link from 'next/link';
import { sampleEmployees } from '../../../lib/sample-data';

export default function EmployeesPage() {
  return (
    <div className="space-y-6" aria-label="Employee directory">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">People directory</h1>
        <p className="text-slate-600">Search and explore your organisation structure.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sampleEmployees.map((employee) => (
          <Card key={employee.id} className="focus-within:ring-brand">
            <CardHeader>
              <div>
                <CardTitle className="text-xl">{employee.name}</CardTitle>
                <CardDescription>{employee.role}</CardDescription>
              </div>
              <Badge>{employee.department}</Badge>
            </CardHeader>
            <dl className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-500">Location</dt>
                <dd>{employee.location}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-medium text-slate-500">Direct reports</dt>
                <dd>{employee.reports}</dd>
              </div>
            </dl>
            <Link
              href={`/employees/${employee.id}`}
              className="mt-4 inline-flex items-center text-sm font-medium text-brand hover:underline"
            >
              View profile<span className="sr-only"> for {employee.name}</span>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

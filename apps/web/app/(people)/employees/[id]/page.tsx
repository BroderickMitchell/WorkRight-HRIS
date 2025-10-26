import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, Button, Badge } from '@workright/ui';
import { sampleEmployees, sampleGoals, sampleLeave } from '../../../../lib/sample-data';

interface Props {
  params: { id: string };
}

export default function EmployeeOverviewPage({ params }: Props) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
  if (!employee) {
    notFound();
  }

  const [givenName, lastName] = employee.name.split(' ');
  const goals = sampleGoals.filter((goal) => goal.owner.includes(givenName));
  const leave = sampleLeave.filter((record) => record.employee === employee.name);
  const [city, state] = employee.location.split(',').map((s) => s.trim());
  const employeeId = employee.id;

  return (
    <div className="space-y-8" aria-label="Employee overview">
      {/* Top profile header */}
      <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {employee.avatarUrl ? (
              <img src={employee.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover ring-2 ring-white" />
            ) : (
              <div className="h-20 w-20 rounded-full bg-slate-200" />
            )}
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{employee.name}</h2>
              <p className="text-sm text-slate-600">{employee.role}</p>
              <p className="text-xs text-slate-500">{employee.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand/30 text-sm font-semibold text-brand">83%</div>
            <p className="mt-1 text-xs text-slate-500">Profile completeness</p>
          </div>
        </div>
        <div className="mt-4 border-b">
          <nav className="flex gap-6 text-sm">
            <span className="border-b-2 border-brand pb-2 font-medium text-brand">General Information</span>
            <span className="pb-2 text-slate-400">Background Information</span>
          </nav>
        </div>
      </section>

      {/* User Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">User Info</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 p-6 pt-0 text-sm">
              <div>
                <p className="text-slate-500">First Name</p>
                <p className="font-medium text-slate-900">{givenName}</p>
              </div>
              <div>
                <p className="text-slate-500">Last Name</p>
                <p className="font-medium text-slate-900">{lastName ?? ''}</p>
              </div>
              <div>
                <p className="text-slate-500">Employee ID</p>
                <p className="font-medium text-slate-900">{employeeId}</p>
              </div>
              <div>
                <p className="text-slate-500">Title</p>
                <p className="font-medium text-slate-900">{employee.role}</p>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 p-6 pt-0 text-sm">
              <div>
                <p className="text-slate-500">City</p>
                <p className="font-medium text-slate-900">{city ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">State</p>
                <p className="font-medium text-slate-900">{state ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-medium text-slate-900">{employee.location}</p>
              </div>
              <div>
                <p className="text-slate-500">Business Phone</p>
                <p className="font-medium text-slate-900">-</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Notes & Bio */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <div className="space-y-3 p-6 pt-0 text-sm">
            <div className="flex gap-2">
              <select className="rounded-md border border-slate-300 bg-white px-2 py-1">
                <option>in the last 14 days</option>
              </select>
              <Button size="sm" variant="secondary">Add Note</Button>
            </div>
            <p className="text-slate-500">No Data</p>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Biographical Information</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 text-sm">
            <p className="text-slate-500">Gender</p>
            <p className="font-medium text-slate-900">-</p>
          </div>
        </Card>
      </section>

      {/* Org Chart & Tags */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Org Chart & Tags</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Org Chart</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <div className="flex items-center gap-3">
                {employee.avatarUrl ? (
                  <img src={employee.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-white" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-slate-200" />
                )}
                <div>
                  <p className="font-medium text-slate-900">{employee.name}</p>
                  <p className="text-sm text-slate-600">{employee.role}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/org-chart" className="text-sm text-brand hover:underline">View full organisational chart</Link>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2 p-6 pt-0">
              {['Leadership', 'Business', 'Coaching', 'Communication'].map((t) => (
                <Badge key={t} className="border-slate-200 bg-slate-100 text-slate-700">{t}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Current Goals & Leave History (with working links) */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current goals</CardTitle>
            <Link href={`/employees/${employee.id}/goals`}>
              <Button variant="secondary" size="sm">Align goal</Button>
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals linked just yet.</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{goal.title}</p>
                  <p className="text-sm text-slate-600">Due {goal.dueDate} · {goal.alignment}</p>
                  <p className="text-sm text-brand">{Math.round(goal.progress * 100)}% complete</p>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave history</CardTitle>
            <Link href={`/employees/${employee.id}/leave`}>
              <Button variant="secondary" size="sm">Request leave</Button>
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {leave.length === 0 ? (
              <p className="text-sm text-slate-500">No leave recorded.</p>
            ) : (
              leave.map((record) => (
                <div key={record.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{record.type}</p>
                  <p className="text-sm text-slate-600">{record.period}</p>
                  <p className="text-sm text-brand">{record.status}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </section>
    </div>
  );
}


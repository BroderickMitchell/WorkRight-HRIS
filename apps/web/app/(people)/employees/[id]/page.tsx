import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, Button, Badge } from '@workright/ui';
import { fetchEmployeeProfile } from '@/lib/directory';

interface Props {
  params: { id: string };
}

function fullName(employee: { givenName?: string | null; familyName?: string | null; email?: string | null }) {
  const parts = [employee.givenName, employee.familyName].filter(Boolean);
  return parts.length ? parts.join(' ') : (employee.email ?? 'Unknown');
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function EmployeeOverviewPage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) {
    notFound();
  }

  const name = fullName(employee);
  const goals = employee.goals ?? [];
  const leave = employee.leaveRequests ?? [];
  const location = employee.location?.name ?? employee.department?.name ?? 'Unassigned';

  return (
    <div className="space-y-8" aria-label="Employee overview">
      <section className="rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-slate-200" aria-hidden />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
              <p className="text-sm text-slate-600">{employee.position?.title ?? 'Role pending'}</p>
              <p className="text-xs text-slate-500">{employee.email}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-4 border-brand/30 text-sm font-semibold text-brand">83%</div>
            <p className="mt-1 text-xs text-slate-500">Profile completeness</p>
          </div>
        </div>
      </section>

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
                <p className="font-medium text-slate-900">{employee.givenName}</p>
              </div>
              <div>
                <p className="text-slate-500">Last Name</p>
                <p className="font-medium text-slate-900">{employee.familyName}</p>
              </div>
              <div>
                <p className="text-slate-500">Employee ID</p>
                <p className="font-medium text-slate-900">{employee.id}</p>
              </div>
              <div>
                <p className="text-slate-500">Title</p>
                <p className="font-medium text-slate-900">{employee.position?.title ?? 'Pending assignment'}</p>
              </div>
            </div>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-4 p-6 pt-0 text-sm">
              <div>
                <p className="text-slate-500">Location</p>
                <p className="font-medium text-slate-900">{location}</p>
              </div>
              <div>
                <p className="text-slate-500">Department</p>
                <p className="font-medium text-slate-900">{employee.position?.department?.name ?? employee.department?.name ?? '-'}</p>
              </div>
              <div>
                <p className="text-slate-500">Business Phone</p>
                <p className="font-medium text-slate-900">-</p>
              </div>
              <div>
                <p className="text-slate-500">Manager</p>
                <p className="font-medium text-slate-900">{employee.manager ? fullName(employee.manager) : 'Unassigned'}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

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

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Org Chart</CardTitle>
          </CardHeader>
          <div className="p-6 pt-0 space-y-4">
            <div>
              <p className="text-xs uppercase text-slate-500">Manager</p>
              <p className="font-medium text-slate-900">{employee.manager ? fullName(employee.manager) : 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Direct Reports</p>
              {employee.directReports.length === 0 ? (
                <p className="text-sm text-slate-500">None</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {employee.directReports.map((report) => (
                    <li key={report.id}>
                      <Link href={`/employees/${report.id}`} className="text-brand hover:underline">
                        {fullName(report)}
                      </Link>
                      {report.position?.title ? <span className="text-slate-500"> � {report.position.title}</span> : null}
                    </li>
                  ))}
                </ul>
              )}
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
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current goals</CardTitle>
            <Link href={`/employees/${employee.id}/goals`}>
              <Button variant="secondary" size="sm">Align goal</Button>
            </Link>
          </CardHeader>
          <div className="space-y-3 p-6 pt-0">
            {goals.length === 0 ? (
              <p className="text-sm text-slate-500">No goals linked just yet.</p>
            ) : (
              goals.map((goal) => (
                <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{goal.title}</p>
                  <p className="text-sm text-slate-600">Due {formatDate(goal.dueDate)} � {goal.status}</p>
                  <p className="text-sm text-brand">Weighting {(goal.weighting * 100).toFixed(0)}%</p>
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
          <div className="space-y-3 p-6 pt-0">
            {leave.length === 0 ? (
              <p className="text-sm text-slate-500">No leave recorded.</p>
            ) : (
              leave.map((record) => (
                <div key={record.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{record.leaveType?.name ?? 'Leave'}</p>
                  <p className="text-sm text-slate-600">{formatDate(record.startDate)} � {formatDate(record.endDate)}</p>
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





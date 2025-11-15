import { Card, CardHeader, CardTitle, CardDescription } from '@workright/ui';
import { fetchRosterAssignments, fetchRosterShifts, fetchRosterTemplates } from '@/lib/rosters';

const formatDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function RostersPage() {
  const [assignments, templates] = await Promise.all([fetchRosterAssignments(), fetchRosterTemplates()]);

  let upcomingShifts: Awaited<ReturnType<typeof fetchRosterShifts>> = [];
  if (assignments.length > 0) {
    const focus = assignments[0];
    const focusTemplate = templates.find((template) => template.id === focus.templateId);
    const patternWindow = focusTemplate?.pattern.length ?? 0;
    const windowDays = Math.max(patternWindow, 14);
    const from = new Date();
    const to = new Date();
    // Fetch shifts for an entire roster cycle (or two weeks as a minimum) so long patterns render correctly.
    to.setDate(from.getDate() + Math.max(windowDays - 1, 0));
    upcomingShifts = await fetchRosterShifts({
      employeeId: focus.employeeId,
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10)
    });
  }

  return (
    <div className="space-y-6" aria-label="Rosters and shifts overview">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-slate-900">Rosters & shifts</h1>
        <p className="text-slate-600">
          View active roster templates, employee assignments, and upcoming shift coverage.
        </p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Active assignments</CardTitle>
            <CardDescription>Current roster coverage for the Acme Mining workforce.</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto p-6 pt-0">
          {assignments.length === 0 ? (
            <p className="text-sm text-slate-500">No roster assignments found.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Template</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Effective</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="py-2 pr-4">{assignment.employeeName ?? assignment.employeeId}</td>
                    <td className="py-2 pr-4">{assignment.templateName ?? assignment.templateId}</td>
                    <td className="py-2 pr-4">{assignment.locationName ?? 'Unassigned'}</td>
                    <td className="py-2 pr-4">
                      {formatDate(assignment.effectiveFrom)}
                      {assignment.effectiveTo ? ` – ${formatDate(assignment.effectiveTo)}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Upcoming shifts</CardTitle>
            <CardDescription>Automatically generated from the roster template for the next cycle.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {upcomingShifts.length === 0 ? (
            <p className="text-sm text-slate-500">
              Assignments are ready, but no shifts fall within the next two weeks.
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-3">
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-sm font-medium text-slate-900">{formatDate(shift.date)}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-600">{shift.shiftType}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Roster templates</CardTitle>
            <CardDescription>Standard work patterns available to assign to employees.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {templates.length === 0 ? (
            <p className="text-sm text-slate-500">No templates configured.</p>
          ) : (
            <ul className="divide-y divide-slate-200 text-sm">
              {templates.map((template) => (
                <li key={template.id} className="py-3">
                  <p className="font-medium text-slate-900">{template.name}</p>
                  <p className="text-xs text-slate-600">
                    Seed date {formatDate(template.seedDate)} • Pattern {template.pattern.join(', ')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

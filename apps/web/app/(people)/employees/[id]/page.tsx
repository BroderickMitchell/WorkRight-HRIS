import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, Button } from '@workright/ui';
import { sampleEmployees, sampleGoals, sampleLeave } from '../../../../lib/sample-data';

interface Props {
  params: { id: string };
}

export default function EmployeeOverviewPage({ params }: Props) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
  if (!employee) {
    notFound();
  }

  const [givenName] = employee.name.split(' ');
  const goals = sampleGoals.filter((goal) => goal.owner.includes(givenName));
  const leave = sampleLeave.filter((record) => record.employee === employee.name);

  return (
    <div className="space-y-6" aria-label="Employee overview">
      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current goals</CardTitle>
            <Button variant="ghost" size="sm">
              Align goal
            </Button>
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
            <Button variant="ghost" size="sm">
              Request leave
            </Button>
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


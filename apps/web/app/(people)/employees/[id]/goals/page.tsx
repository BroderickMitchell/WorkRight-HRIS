import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { sampleEmployees, sampleGoals } from '../../../../../lib/sample-data';

interface Props {
  params: { id: string };
}

export default function EmployeeGoalsPage({ params }: Props) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
  if (!employee) {
    notFound();
  }

  const [givenName] = employee.name.split(' ');
  const goals = sampleGoals.filter((goal) => goal.owner.includes(givenName));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Goals for {employee.name}</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
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
    </div>
  );
}


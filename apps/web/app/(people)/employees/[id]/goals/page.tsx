import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { fetchEmployeeProfile } from '@/lib/directory';

interface Props {
  params: { id: string };
}

function format(date: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(date));
  } catch {
    return date;
  }
}

export default async function EmployeeGoalsPage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) {
    notFound();
  }

  const goals = employee.goals ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Goals for {employee.givenName} {employee.familyName}</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {goals.length === 0 ? (
            <p className="text-sm text-slate-500">No goals linked just yet.</p>
          ) : (
            goals.map((goal) => (
              <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{goal.title}</p>
                <p className="text-sm text-slate-600">Due {format(goal.dueDate)} • {goal.status}</p>
                <p className="text-xs text-slate-500">Weighting {(goal.weighting * 100).toFixed(0)}%</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

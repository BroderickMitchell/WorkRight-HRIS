import { Card, CardHeader, CardTitle, CardDescription, Badge, Button } from '@workright/ui';
import { apiFetch } from '@/lib/api';

interface GoalListItem {
  id: string;
  title: string;
  status: string;
  dueDate: string;
  weighting: number;
  owner: { givenName: string; familyName: string };
}

function ownerName(goal: GoalListItem) {
  return `${goal.owner.givenName} ${goal.owner.familyName}`.trim();
}

export default async function GoalsPage() {
  const goals = await apiFetch<GoalListItem[]>('/performance/goals').catch(() => []);
  const formatter = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' });

  return (
    <div className="space-y-6" aria-label="Goals board">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Performance goals</h1>
          <p className="text-slate-600">Track OKRs, cascaded objectives, and progress updates.</p>
        </div>
        <Button>Create goal</Button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.length === 0 ? (
          <p className="text-sm text-slate-500">No goals captured yet.</p>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} className="border-brand/20">
              <CardHeader>
                <div>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>Status: {goal.status}</CardDescription>
                </div>
                <Badge>{(goal.weighting * 100).toFixed(0)}%</Badge>
              </CardHeader>
              <dl className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Owner</dt>
                  <dd>{ownerName(goal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-slate-500">Due date</dt>
                  <dd>{formatter.format(new Date(goal.dueDate))}</dd>
                </div>
              </dl>
              <Button variant="secondary" className="mt-4 w-full">
                Update progress
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

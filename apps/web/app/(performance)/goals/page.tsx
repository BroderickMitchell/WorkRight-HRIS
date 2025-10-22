import { Card, CardHeader, CardTitle, CardDescription, Badge, Button } from '@workright/ui';
import { sampleGoals } from '../../../lib/sample-data';

export default function GoalsPage() {
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
        {sampleGoals.map((goal) => (
          <Card key={goal.id} className="border-brand/20">
            <CardHeader>
              <div>
                <CardTitle>{goal.title}</CardTitle>
                <CardDescription>Alignment: {goal.alignment}</CardDescription>
              </div>
              <Badge>{Math.round(goal.progress * 100)}%</Badge>
            </CardHeader>
            <dl className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Owner</dt>
                <dd>{goal.owner}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500">Due date</dt>
                <dd>{goal.dueDate}</dd>
              </div>
            </dl>
            <Button variant="secondary" className="mt-4 w-full">
              Update progress
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { Card, CardDescription, CardHeader, CardTitle, Badge, Button } from '@workright/ui';
import { sampleReports, sampleLeave, sampleGoals } from '../../lib/sample-data';

export default function DashboardPage() {
  return (
    <div className="space-y-8" aria-label="Dashboard overview">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Headcount</CardTitle>
          </CardHeader>
          <p className="text-3xl font-semibold">{sampleReports.headcount}</p>
          <CardDescription>Team members employed across all sites.</CardDescription>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Attrition</CardTitle>
          </CardHeader>
          <p className="text-3xl font-semibold">{sampleReports.attritionRate}</p>
          <CardDescription>Rolling twelve-month turnover.</CardDescription>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave balance</CardTitle>
          </CardHeader>
          <p className="text-3xl font-semibold">{sampleReports.leaveBalance}</p>
          <CardDescription>Annual leave owing as at today.</CardDescription>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <p className="text-3xl font-semibold">{sampleReports.reviewCompletion}</p>
          <CardDescription>FY24 performance cycle progress.</CardDescription>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="Priority panels">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming goals</CardTitle>
            <Button variant="ghost" size="sm">
              View board
            </Button>
          </CardHeader>
          <div className="space-y-4">
            {sampleGoals.map((goal) => (
              <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{goal.title}</p>
                    <p className="text-sm text-slate-600">
                      Owner: {goal.owner} · Due {goal.dueDate}
                    </p>
                  </div>
                  <Badge>{Math.round(goal.progress * 100)}% complete</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-500">Alignment: {goal.alignment}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Leave requests</CardTitle>
            <Button variant="ghost" size="sm">
              View calendar
            </Button>
          </CardHeader>
          <div className="space-y-3">
            {sampleLeave.map((request) => (
              <div key={request.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{request.employee}</p>
                <p className="text-sm text-slate-600">
                  {request.type} · {request.period}
                </p>
                <p className="text-sm text-brand">{request.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

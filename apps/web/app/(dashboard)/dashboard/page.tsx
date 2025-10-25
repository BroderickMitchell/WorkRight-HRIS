import Link from 'next/link';
import { Card, CardDescription, CardHeader, CardTitle, Badge, Button } from '@workright/ui';
import {
  sampleReports,
  sampleLeave,
  sampleGoals,
  sampleTasks,
  sampleWorkflows
} from '../../../lib/sample-data';

const quickLinks = [
  {
    href: '/employees',
    label: 'People directory',
    description: 'Maintain employee central records and reporting lines.',
    badge: 'Directory'
  },
  {
    href: '/goals',
    label: 'Performance & goals',
    description: 'Set OKRs, track progress, and gather feedback.',
    badge: 'Performance'
  },
  {
    href: '/leave',
    label: 'Leave & time off',
    description: 'Review balances, approvals, and calendars.',
    badge: 'Leave'
  },
  {
    href: '/reports',
    label: 'Reports & exports',
    description: 'Headcount, attrition, and compliance insights.',
    badge: 'Reporting'
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-10" aria-label="Dashboard overview">
      <section aria-label="Quick links" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Jump back in</h2>
          <p className="text-sm text-slate-500">Tailored shortcuts for your organisation</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand/50 hover:shadow-md"
            >
              <span className="inline-flex items-center self-start rounded-full bg-brand/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand">
                {link.badge}
              </span>
              <div className="mt-4 space-y-2">
                <p className="text-lg font-semibold text-slate-900">{link.label}</p>
                <p className="text-sm text-slate-600">{link.description}</p>
              </div>
              <span className="mt-8 inline-flex items-center text-sm font-medium text-brand">
                Explore
                <span className="ml-1 transition group-hover:translate-x-1">?</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="Tasks and workflows">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Tasks awaiting you</CardTitle>
              <CardDescription>Prioritise what needs your attention today.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            {sampleTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="text-sm text-slate-600">Due {task.dueDate} Â· {task.context}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Pending workflows</CardTitle>
              <CardDescription>Track approvals and reviews in flight.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            {sampleWorkflows.map((workflow) => (
              <div key={workflow.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="font-medium text-slate-900">{workflow.title}</p>
                <p className="text-sm text-slate-600">{workflow.currentStep}</p>
                <p className="text-xs text-slate-400">Submitted {workflow.submitted}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Snapshot">
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





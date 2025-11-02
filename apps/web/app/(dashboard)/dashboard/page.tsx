import Link from 'next/link';
import CommunicationFeed from './components/communication/CommunicationFeed';
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  KpiCard,
  PageActions,
  PageHeader,
  StatGrid
} from '@workright/ui';
import { sampleEmployees, sampleLeave, sampleReports, sampleTasks, sampleWorkflows } from '../../../lib/sample-data';

const anniversaries = sampleEmployees.slice(0, 3).map((employee, index) => ({
  id: `anniv-${employee.id}`,
  name: employee.name,
  role: employee.role,
  date: index === 0 ? '12 Aug' : index === 1 ? '23 Aug' : '1 Sep'
}));

const expiringDocuments = [
  {
    id: 'doc-1',
    title: 'High risk work licence',
    owner: 'Sienna Surveyor',
    due: 'Due in 14 days'
  },
  {
    id: 'doc-2',
    title: 'Working at heights certification',
    owner: 'Noah Navigator',
    due: 'Due in 30 days'
  }
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive dashboard"
        subtitle="Monitor key workforce metrics and outstanding approvals across the enterprise."
        breadcrumb={<span>Overview · Dashboard</span>}
        actions={
          <PageActions>
            <Button variant="ghost" asChild>
              <Link href="/reports">View reports</Link>
            </Button>
            <Button asChild>
              <Link href="/workflows/instances?create=workflow">Start workflow</Link>
            </Button>
          </PageActions>
        }
      />

      <CommunicationFeed />

      <StatGrid columns={4}>
        <KpiCard
          label="Headcount"
          value={sampleReports.headcount}
          delta="▲ 6% vs last quarter"
          trend="up"
        />
        <KpiCard
          label="Open requisitions"
          value={12}
          delta="3 requiring approval"
          trend="flat"
        />
        <KpiCard
          label="Pending leave"
          value={sampleLeave.filter((leave) => leave.status.toLowerCase().includes('pending')).length}
          delta="1 urgent request"
          trend="down"
        />
        <KpiCard
          label="Overdue training"
          value={4}
          delta="▲ 1 this week"
          trend="up"
        />
      </StatGrid>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>My approvals</CardTitle>
              <CardDescription>Approve leave, job requisitions and workflow steps.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workflows/instances">View inbox</Link>
            </Button>
          </CardHeader>
          <div className="space-y-3 p-6 pt-0">
            {sampleTasks.map((task) => (
              <div key={task.id} className="rounded-xl border border-border bg-panel/60 p-4">
                <p className="font-medium text-foreground">{task.title}</p>
                <p className="text-sm text-muted-foreground">Due {task.dueDate} · {task.context}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow instances</CardTitle>
              <CardDescription>Keep onboarding, change and compliance moving.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/workflows">Manage library</Link>
            </Button>
          </CardHeader>
          <div className="space-y-3 p-6 pt-0">
            {sampleWorkflows.map((workflow) => (
              <div key={workflow.id} className="rounded-xl border border-border bg-panel/60 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{workflow.title}</p>
                    <p className="text-sm text-muted-foreground">{workflow.currentStep}</p>
                  </div>
                  <Badge>{workflow.submitted}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming anniversaries</CardTitle>
              <CardDescription>Celebrate tenure milestones over the next 60 days.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">Download CSV</Button>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            {anniversaries.length === 0 ? (
              <EmptyState
                title="No anniversaries"
                description="We'll surface upcoming work anniversaries once employee start dates are captured."
              />
            ) : (
              anniversaries.map((anniversary) => (
                <div key={anniversary.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">{anniversary.name}</p>
                    <p className="text-sm text-muted-foreground">{anniversary.role}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{anniversary.date}</span>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Expiring compliance</CardTitle>
              <CardDescription>Licences and inductions approaching expiry.</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View compliance hub</Button>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            {expiringDocuments.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-border p-4">
                <p className="font-medium text-foreground">{doc.title}</p>
                <p className="text-sm text-muted-foreground">Owned by {doc.owner}</p>
                <p className="text-xs text-warning">{doc.due}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

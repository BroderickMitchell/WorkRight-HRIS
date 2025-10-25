import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';

const dashboards = [
  {
    name: 'Headcount snapshot',
    description: 'Track growth, exits, and workforce distribution by location and department.'
  },
  {
    name: 'Leave balances',
    description: 'Understand outstanding liabilities, carry-over, and pro-rata balances.'
  },
  {
    name: 'Review completion',
    description: 'Monitor progress of performance cycles and calibration sessions.'
  }
];

export default function ReportsPage() {
  return (
    <div className="space-y-6" aria-label="Reporting and analytics">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Reporting & dashboards</h1>
          <p className="text-slate-600">Build ad-hoc views or export CSVs for payroll and regulators.</p>
        </div>
        <Button variant="secondary">Schedule export</Button>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.name}>
            <CardHeader>
              <CardTitle>{dashboard.name}</CardTitle>
              <CardDescription>{dashboard.description}</CardDescription>
            </CardHeader>
            <Button className="mt-4 w-full">Open dashboard</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}


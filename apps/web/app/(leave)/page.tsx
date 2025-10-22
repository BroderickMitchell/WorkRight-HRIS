import { sampleLeave } from '../../lib/sample-data';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';

export default function LeavePage() {
  return (
    <div className="space-y-6" aria-label="Leave management">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Leave & time off</h1>
          <p className="text-slate-600">Review balances, approve requests, and sync calendars.</p>
        </div>
        <Button>New leave policy</Button>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        {sampleLeave.map((request) => (
          <Card key={request.id}>
            <CardHeader>
              <div>
                <CardTitle>{request.employee}</CardTitle>
                <CardDescription>{request.period}</CardDescription>
              </div>
              <Badge>{request.type}</Badge>
            </CardHeader>
            <p className="text-sm text-brand">{request.status}</p>
            <div className="mt-4 flex gap-3">
              <Button className="flex-1">Approve</Button>
              <Button variant="secondary" className="flex-1">
                Decline
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}

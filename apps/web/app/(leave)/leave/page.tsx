import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';
import { apiFetch } from '@/lib/api';

interface LeaveListItem {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  leaveType?: { name: string } | null;
  employee: { id: string; givenName: string; familyName: string };
}

function formatRange(item: LeaveListItem) {
  const fmt = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' });
  return `${fmt.format(new Date(item.startDate))} – ${fmt.format(new Date(item.endDate))}`;
}

export default async function LeavePage() {
  const requests = await apiFetch<LeaveListItem[]>('/v1/leave/requests').catch(() => []);

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
        {requests.length === 0 ? (
          <p className="text-sm text-slate-500">No leave requests for this tenant.</p>
        ) : (
          requests.map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div>
                  <CardTitle>{request.employee.givenName} {request.employee.familyName}</CardTitle>
                  <CardDescription>{formatRange(request)}</CardDescription>
                </div>
                <Badge>{request.leaveType?.name ?? 'Leave'}</Badge>
              </CardHeader>
              <p className="text-sm text-brand">{request.status}</p>
              <div className="mt-4 flex gap-3">
                <Button className="flex-1">Approve</Button>
                <Button variant="secondary" className="flex-1">
                  Decline
                </Button>
              </div>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

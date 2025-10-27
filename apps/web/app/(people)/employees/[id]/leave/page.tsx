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

export default async function EmployeeLeavePage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) {
    notFound();
  }

  const balances = employee.leaveBalances ?? [];
  const requests = employee.leaveRequests ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Leave balances</CardTitle>
        </CardHeader>
        <div className="grid gap-3 p-6 pt-0 md:grid-cols-2">
          {balances.length === 0 ? (
            <p className="text-sm text-slate-500">No leave balances recorded.</p>
          ) : (
            balances.map((balance) => (
              <div key={balance.id} className="rounded-lg border border-slate-200 p-4">
                <p className="text-sm text-slate-500">{balance.leaveType?.name ?? balance.leaveTypeId}</p>
                <p className="text-2xl font-semibold text-slate-900">{balance.balance.toFixed(1)} days</p>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leave requests</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {requests.length === 0 ? (
            <p className="text-sm text-slate-500">No leave requests on record.</p>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{request.leaveType?.name ?? 'Leave'}</p>
                <p className="text-sm text-slate-600">{format(request.startDate)} – {format(request.endDate)}</p>
                <p className="text-sm text-brand">{request.status}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

import { Suspense } from 'react';
import { PageActions, PageHeader, Button, EmptyState } from '@workright/ui';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { LeaveTable, LeaveListItem } from '@/components/leave/leave-table';

async function LeaveRequests() {
  const requests = await apiFetch<LeaveListItem[]>('/leave/requests').catch(() => []);

  if (requests.length === 0) {
    return <EmptyState title="No leave requests" description="All teams are up to date." />;
  }

  return <LeaveTable requests={requests} />;
}

export default function LeavePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave & time off"
        subtitle="Review balances, approve requests and sync calendars."
        breadcrumb={<span>Operations · Leave</span>}
        actions={
          <PageActions>
            <Button variant="ghost" asChild>
              <Link href="/policies/leave">Policies</Link>
            </Button>
          </PageActions>
        }
      />
      <Suspense fallback={<div className="h-64 rounded-xl border border-border bg-panel animate-pulse" aria-hidden />}>
        <LeaveRequests />
      </Suspense>
    </div>
  );
}

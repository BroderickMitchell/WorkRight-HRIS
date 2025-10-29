import { Suspense } from 'react';
import { fetchEmployees, type DirectoryEmployee } from '@/lib/directory';
import { EmployeesDirectory } from '@/components/employee/directory';
import { Button, EmptyState, PageActions, PageHeader } from '@workright/ui';
import Link from 'next/link';

async function EmployeesDirectoryLoader() {
  let employees: DirectoryEmployee[] = [];
  let errored = false;

  try {
    employees = await fetchEmployees();
  } catch (error) {
    console.error('Failed to load employees directory', error);
    errored = true;
  }

  if (errored) {
    return (
      <EmptyState
        title="Unable to load employees"
        description="We ran into an issue loading the directory. Please refresh to try again."
      />
    );
  }

  return <EmployeesDirectory employees={employees} />;
}

export default function EmployeesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="People directory"
        subtitle="Explore the workforce, review reporting lines and take action quickly."
        breadcrumb={<span>People · Directory</span>}
        actions={
          <PageActions>
            <Button asChild>
              <Link href="/employees?create=employee">Add employee</Link>
            </Button>
          </PageActions>
        }
      />
      <Suspense fallback={<div className="h-64 rounded-xl border border-border bg-panel animate-pulse" aria-hidden />}>
        <EmployeesDirectoryLoader />
      </Suspense>
    </div>
  );
}

import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { employeeProfileQueryKey, fetchEmployeeProfile } from '@/lib/employee-profile';
import { EmployeeProfileShell } from '@/components/employee/profile/employee-profile-shell';

interface PageProps {
  params: { id: string };
}

export default async function EmployeeProfilePage({ params }: PageProps) {
  const queryClient = new QueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: employeeProfileQueryKey(params.id),
      queryFn: () => fetchEmployeeProfile(params.id)
    });
  } catch (error) {
    console.error('Failed to prefetch employee profile', error);
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <EmployeeProfileShell employeeId={params.id} />
    </HydrationBoundary>
  );
}

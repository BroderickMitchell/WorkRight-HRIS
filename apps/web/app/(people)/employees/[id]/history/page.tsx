import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { fetchEmployeeProfile } from '@/lib/directory';

interface Props { params: { id: string } }

export default async function EmployeeHistoryPage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employment history</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0 text-sm text-slate-500">
        Employment timeline endpoints are not yet exposed by the API.
      </div>
    </Card>
  );
}

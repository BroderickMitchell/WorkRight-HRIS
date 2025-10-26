import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { fetchEmployeeProfile } from '@/lib/directory';

interface Props {
  params: { id: string };
}

export default async function EmployeeDocumentsPage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) {
    notFound();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents for {employee.givenName} {employee.familyName}</CardTitle>
      </CardHeader>
      <div className="p-6 pt-0 text-sm text-slate-500">
        Document management endpoints are not yet exposed by the API.
      </div>
    </Card>
  );
}

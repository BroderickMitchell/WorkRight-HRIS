import { notFound } from 'next/navigation';
import { fetchEmployeeProfile } from '@/lib/directory';
import EmployeeDocumentsClient from './employee-documents-client';

interface Props {
  params: { id: string };
}

export default async function EmployeeDocumentsPage({ params }: Props) {
  const profile = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!profile) {
    notFound();
  }

  return (
    <EmployeeDocumentsClient
      employeeId={params.id}
      employeeName={profile.employee.legalName.full}
      templates={profile.documents.templates}
      documents={profile.documents.generated}
    />
  );
}

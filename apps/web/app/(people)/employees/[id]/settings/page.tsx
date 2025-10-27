import { notFound } from 'next/navigation';
import { fetchEmployeeProfile } from '@/lib/directory';
import { EmployeeSettingsForm } from './settings-form';

interface Props {
  params: { id: string };
}

export default async function EmployeeSettingsPage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) {
    notFound();
  }
  return <EmployeeSettingsForm employee={employee} />;
}

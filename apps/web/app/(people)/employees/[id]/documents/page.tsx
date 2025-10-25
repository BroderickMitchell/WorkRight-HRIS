import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@workright/ui';
import { sampleEmployees, sampleDocuments } from '../../../../../lib/sample-data';

interface Props { params: { id: string } }

export default function EmployeeDocumentsPage({ params }: Props) {
  const employee = sampleEmployees.find((p) => p.id === params.id);
  if (!employee) notFound();
  const docs = sampleDocuments.filter((d) => d.employeeId === employee.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Signed documents</CardTitle>
            <CardDescription>Contracts, policies, and acknowledgements.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {docs.length === 0 ? (
            <p className="text-sm text-slate-500">No documents on file.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {docs.map((d) => (
                <li key={d.id} className="py-3">
                  <p className="font-medium text-slate-900">{d.title}</p>
                  <p className="text-sm text-slate-600">Signed on {new Date(d.signedOn).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}


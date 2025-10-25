import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@workright/ui';
import { sampleEmployees, sampleDiscipline } from '../../../../../lib/sample-data';

interface Props { params: { id: string } }

export default function EmployeeDisciplinePage({ params }: Props) {
  const employee = sampleEmployees.find((p) => p.id === params.id);
  if (!employee) notFound();
  const records = sampleDiscipline.filter((d) => d.employeeId === employee.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Disciplinary history</CardTitle>
            <CardDescription>Formal actions and outcomes.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {records.length === 0 ? (
            <p className="text-sm text-slate-500">No disciplinary records.</p>
          ) : (
            <ul className="space-y-3">
              {records.map((rec) => (
                <li key={rec.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{rec.category}</p>
                  <p className="text-sm text-slate-600">{new Date(rec.date).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600">{rec.notes}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}


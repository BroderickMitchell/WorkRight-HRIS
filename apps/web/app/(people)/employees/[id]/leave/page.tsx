import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { sampleEmployees, sampleLeave } from '../../../../../lib/sample-data';

interface Props {
  params: { id: string };
}

export default function EmployeeLeavePage({ params }: Props) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
  if (!employee) {
    notFound();
  }

  const leave = sampleLeave.filter((record) => record.employee === employee.name);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Leave for {employee.name}</CardTitle>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {leave.length === 0 ? (
            <p className="text-sm text-slate-500">No leave recorded.</p>
          ) : (
            leave.map((record) => (
              <div key={record.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-medium text-slate-900">{record.type}</p>
                <p className="text-sm text-slate-600">{record.period}</p>
                <p className="text-sm text-brand">{record.status}</p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}


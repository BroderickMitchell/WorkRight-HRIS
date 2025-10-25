import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle } from '@workright/ui';
import { sampleEmployees, sampleEmploymentHistory } from '../../../../../lib/sample-data';

interface Props { params: { id: string } }

export default function EmployeeHistoryPage({ params }: Props) {
  const employee = sampleEmployees.find((p) => p.id === params.id);
  if (!employee) notFound();
  const items = sampleEmploymentHistory.filter((h) => h.employeeId === employee.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Employment history</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          {items.length === 0 ? (
            <p className="text-sm text-slate-500">No history recorded.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((h) => (
                <li key={h.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-medium text-slate-900">{h.type}</p>
                  <p className="text-sm text-slate-600">Effective {new Date(h.effective).toLocaleDateString()}</p>
                  <p className="text-sm text-slate-600">{h.details}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}


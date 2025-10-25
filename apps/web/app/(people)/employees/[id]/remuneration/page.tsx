import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@workright/ui';
import { sampleEmployees, sampleRemuneration } from '../../../../../lib/sample-data';

interface Props { params: { id: string } }

export default function EmployeeRemunerationPage({ params }: Props) {
  const employee = sampleEmployees.find((p) => p.id === params.id);
  if (!employee) notFound();
  const pay = sampleRemuneration.find((r) => r.employeeId === employee.id);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Remuneration</CardTitle>
            <CardDescription>Confidential remuneration details.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-3 p-6 pt-0">
          {pay ? (
            <>
              <p className="text-slate-900">Base salary: ${pay.baseSalaryAud.toLocaleString('en-AU')}</p>
              {pay.allowances && pay.allowances.length > 0 && (
                <div className="text-sm text-slate-600">Allowances: {pay.allowances.map((a) => (<Badge key={a} className="mr-2">{a}</Badge>))}</div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-500">No remuneration data on file.</p>
          )}
        </div>
      </Card>
    </div>
  );
}


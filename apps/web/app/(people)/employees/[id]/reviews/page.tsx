import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Badge } from '@workright/ui';
import { fetchEmployeeProfile } from '@/lib/directory';

interface Props { params: { id: string } }

export default async function EmployeeReviewsPage({ params }: Props) {
  const employee = await fetchEmployeeProfile(params.id).catch(() => null);
  if (!employee) notFound();
  const reviews = employee.reviews ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Performance reviews</CardTitle>
            <CardDescription>Overall assessments and cycle status.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {reviews.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">Cycle {r.cycle}</p>
                    <p className="text-sm text-slate-600">Status: {r.status}</p>
                  </div>
                  {r.overall && <Badge>{r.overall}</Badge>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

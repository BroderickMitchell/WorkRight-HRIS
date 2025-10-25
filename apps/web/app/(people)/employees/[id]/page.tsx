import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle } from '@workright/ui';
import {
  sampleEmployees,
  sampleGoals,
  sampleLeave,
  PerformanceReviewRecord,
  DisciplinaryActionRecord
} from '../../../../lib/sample-data';

interface Props {
  params: { id: string };
}

function resolveEmployeeName(id?: string) {
  if (!id) return undefined;
  const person = sampleEmployees.find((entry) => entry.id === id);
  return person?.name;
}

export default function EmployeeProfilePage({ params }: Props) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
  if (!employee) {
    notFound();
  }

  const [givenName] = employee.name.split(' ');
  const goals = sampleGoals.filter((goal) => goal.owner.includes(givenName));
  const leave = sampleLeave.filter((record) => record.employee === employee.name);
  const managerName = resolveEmployeeName(employee.jobDetails.reportsToId) ?? employee.jobDetails.reportsToName;

  const disciplinaryWithLinks = employee.disciplinaryActions.map((action) => ({
    ...action,
    investigatorName: resolveEmployeeName(action.investigatorId)
  }));

  const reviewWithLinks = employee.performanceReviews.map((record) => ({
    ...record,
    reviewerName: resolveEmployeeName(record.reviewerId)
  }));

  return (
    <div className="space-y-6" aria-label="Employee profile">
      <header className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={employee.profileImage}
              alt={`Profile of ${employee.name}`}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full border-2 border-slate-100 object-cover"
            />
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="w-max">{employee.department}</Badge>
                <span className="text-sm text-slate-500">{employee.employeeNumber}</span>
              </div>
              <h1 className="text-3xl font-semibold text-slate-900">{employee.name}</h1>
              <p className="text-slate-600">{employee.jobDetails.positionTitle}</p>
              <p className="text-sm text-slate-500">
                {employee.location} · {employee.email} · {employee.phone}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 text-sm text-slate-600 lg:items-end">
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                {employee.employmentType}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                Commenced {employee.startDate}
              </span>
            </div>
            <div>
              Reports to{' '}
              {managerName ? (
                employee.jobDetails.reportsToId ? (
                  <Link href={`/people/employees/${employee.jobDetails.reportsToId}`} className="text-brand hover:underline">
                    {managerName}
                  </Link>
                ) : (
                  <span className="font-medium text-slate-700">{managerName}</span>
                )
              ) : (
                <span className="text-slate-500">Not recorded</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/people/positions/${employee.jobDetails.positionId}`} className="text-brand hover:underline">
                View position {employee.jobDetails.positionId}
              </Link>
              <span aria-hidden="true" className="text-slate-400">
                ·
              </span>
              <Link href={`/people/org-chart?focus=${employee.id}`} className="text-brand hover:underline">
                Locate in org chart
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Personal details</CardTitle>
                <CardDescription>Key identification and contact preferences.</CardDescription>
              </div>
            </CardHeader>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">Preferred name</dt>
                <dd className="text-sm text-slate-700">{employee.personalDetails.preferredName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Pronouns</dt>
                <dd className="text-sm text-slate-700">{employee.personalDetails.pronouns}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Date of birth</dt>
                <dd className="text-sm text-slate-700">{employee.personalDetails.dateOfBirth}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-slate-500">Primary phone</dt>
                <dd className="text-sm text-slate-700">{employee.personalDetails.phone}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500">Residential address</dt>
                <dd className="text-sm text-slate-700">{employee.personalDetails.homeAddress}</dd>
              </div>
              {employee.personalDetails.postalAddress ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Postal address</dt>
                  <dd className="text-sm text-slate-700">{employee.personalDetails.postalAddress}</dd>
                </div>
              ) : null}
              {employee.personalDetails.secondaryEmail ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Secondary email</dt>
                  <dd className="text-sm text-slate-700">{employee.personalDetails.secondaryEmail}</dd>
                </div>
              ) : null}
              {employee.personalDetails.emergencyInformation ? (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-500">Emergency information</dt>
                  <dd className="text-sm text-slate-700">{employee.personalDetails.emergencyInformation}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Work history</CardTitle>
                <CardDescription>Chronology of previous roles and experience.</CardDescription>
              </div>
            </CardHeader>
            <ul className="space-y-4">
              {employee.workHistory.map((item) => (
                <li key={`${item.organisation}-${item.start}`} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-col gap-1 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">{item.role}</p>
                    <p>{item.organisation}</p>
                    <p className="text-slate-500">{item.start} – {item.end}</p>
                    {item.notes ? <p>{item.notes}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Employment changes</CardTitle>
                <CardDescription>Promotions, secondments, and remuneration adjustments.</CardDescription>
              </div>
            </CardHeader>
            <ul className="space-y-4">
              {employee.employmentChanges.map((change) => (
                <li key={`${change.type}-${change.date}`} className="rounded-lg border border-slate-200 p-4 text-sm text-slate-700">
                  <p className="font-semibold text-slate-900">{change.type}</p>
                  <p className="text-slate-500">{change.date}</p>
                  <p>{change.details}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Performance review history</CardTitle>
                <CardDescription>Closed cycles, ratings, and reviewer details.</CardDescription>
              </div>
              <Button variant="ghost" size="sm">
                Launch new review
              </Button>
            </CardHeader>
            <ul className="space-y-4">
              {reviewWithLinks.length === 0 ? (
                <li className="text-sm text-slate-500">No reviews captured yet.</li>
              ) : (
                reviewWithLinks.map((review: PerformanceReviewRecord & { reviewerName?: string }) => (
                  <li key={`${review.cycle}-${review.date}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-1 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{review.cycle}</p>
                      <p className="text-slate-500">Completed {review.date}</p>
                      <p>Rating: {review.rating}</p>
                      <p>{review.summary}</p>
                      {review.reviewerId ? (
                        <p>
                          Reviewer:{' '}
                          <Link href={`/people/employees/${review.reviewerId}`} className="text-brand hover:underline">
                            {review.reviewerName ?? 'View reviewer'}
                          </Link>
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Disciplinary history</CardTitle>
                <CardDescription>Formal records with investigator references.</CardDescription>
              </div>
            </CardHeader>
            {disciplinaryWithLinks.length === 0 ? (
              <p className="text-sm text-slate-500">No disciplinary actions recorded.</p>
            ) : (
              <ul className="space-y-4">
                {disciplinaryWithLinks.map((action: DisciplinaryActionRecord & { investigatorName?: string }) => (
                  <li key={`${action.type}-${action.date}`} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col gap-1 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">{action.type}</p>
                      <p className="text-slate-500">{action.date}</p>
                      <p>{action.notes}</p>
                      <p>
                        Investigating officer:{' '}
                        <Link href={`/people/employees/${action.investigatorId}`} className="text-brand hover:underline">
                          {action.investigatorName ?? 'View officer'}
                        </Link>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Job details</CardTitle>
                <CardDescription>Current assignment and structural information.</CardDescription>
              </div>
            </CardHeader>
            <dl className="grid gap-4 text-sm text-slate-700">
              <div>
                <dt className="font-medium text-slate-500">Position title</dt>
                <dd>{employee.jobDetails.positionTitle}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Position ID</dt>
                <dd>
                  <Link href={`/people/positions/${employee.jobDetails.positionId}`} className="text-brand hover:underline">
                    {employee.jobDetails.positionId}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Team</dt>
                <dd>{employee.jobDetails.team}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Cost centre</dt>
                <dd>{employee.jobDetails.costCentre}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Roster</dt>
                <dd>{employee.jobDetails.roster}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Work location</dt>
                <dd>{employee.jobDetails.workLocation}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Employment status</dt>
                <dd>{employee.jobDetails.employmentStatus}</dd>
              </div>
              {employee.jobDetails.awardClassification ? (
                <div>
                  <dt className="font-medium text-slate-500">Award / classification</dt>
                  <dd>{employee.jobDetails.awardClassification}</dd>
                </div>
              ) : null}
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Remuneration</CardTitle>
                <CardDescription>Package components and latest review.</CardDescription>
              </div>
            </CardHeader>
            <dl className="space-y-3 text-sm text-slate-700">
              <div>
                <dt className="font-medium text-slate-500">Base salary</dt>
                <dd>{employee.remuneration.baseSalary}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Superannuation</dt>
                <dd>{employee.remuneration.superannuation}</dd>
              </div>
              {employee.remuneration.bonusTarget ? (
                <div>
                  <dt className="font-medium text-slate-500">Bonus target</dt>
                  <dd>{employee.remuneration.bonusTarget}</dd>
                </div>
              ) : null}
              <div>
                <dt className="font-medium text-slate-500">Pay cycle</dt>
                <dd>{employee.remuneration.payCycle}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Last reviewed</dt>
                <dd>{employee.remuneration.lastReviewed}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Allowances</dt>
                <dd>
                  {employee.remuneration.allowances.length === 0 ? (
                    <span className="text-slate-500">No allowances recorded.</span>
                  ) : (
                    <ul className="space-y-1">
                      {employee.remuneration.allowances.map((allowance) => (
                        <li key={allowance.name}>{allowance.name}: {allowance.amount}</li>
                      ))}
                    </ul>
                  )}
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Emergency contacts</CardTitle>
                <CardDescription>Primary people to reach out to during an incident.</CardDescription>
              </div>
            </CardHeader>
            <ul className="space-y-4 text-sm text-slate-700">
              {employee.emergencyContacts.map((contact) => (
                <li key={contact.name} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{contact.name}</p>
                  <p>{contact.relationship}</p>
                  <p className="text-slate-500">{contact.phone}</p>
                  {contact.email ? <p>{contact.email}</p> : null}
                  {contact.preferred ? <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Preferred</span> : null}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current goals</CardTitle>
              <Button variant="ghost" size="sm">
                Align goal
              </Button>
            </CardHeader>
            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-sm text-slate-500">No goals linked just yet.</p>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-medium text-slate-900">{goal.title}</p>
                    <p className="text-sm text-slate-600">Due {goal.dueDate} · {goal.alignment}</p>
                    <p className="text-sm text-brand">{Math.round(goal.progress * 100)}% complete</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leave history</CardTitle>
              <Button variant="ghost" size="sm">
                Request leave
              </Button>
            </CardHeader>
            <div className="space-y-3">
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
      </section>
    </div>
  );
}

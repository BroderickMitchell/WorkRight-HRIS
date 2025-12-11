import { PageHeader } from '@workright/ui';

export default function LeavePolicyPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave policies"
        subtitle="View and manage leave policies and entitlements."
        breadcrumb={<span>Policies · Leave</span>}
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="prose max-w-none">
          <h2>Leave entitlements</h2>
          <p>
            Our leave policies are designed to support work-life balance while meeting
            regulatory requirements across all Australian jurisdictions.
          </p>

          <h3>Annual leave</h3>
          <ul>
            <li>Full-time employees: 4 weeks (20 days) per year</li>
            <li>Part-time employees: Pro-rated based on hours worked</li>
            <li>Leave loading: 17.5% when taking annual leave</li>
          </ul>

          <h3>Personal/carer's leave</h3>
          <ul>
            <li>10 days per year for full-time employees</li>
            <li>Pro-rated for part-time employees</li>
            <li>Accumulates year to year if unused</li>
          </ul>

          <h3>Long service leave</h3>
          <ul>
            <li>Eligibility after 7 years of continuous service</li>
            <li>13 weeks for 10 years of service</li>
            <li>Additional weeks for each subsequent year</li>
          </ul>

          <h3>Public holidays</h3>
          <p>
            Employees are entitled to all public holidays applicable to their
            work location in Australia.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { useMemo, useState } from 'react';
import { createProfileChangeWorkflow } from '../../../../../lib/workflows';
import { getEmployeeOverrides } from '../../../../../lib/overrides';
import type { EmployeeProfile } from '@/lib/directory';

interface EmployeeSettingsFormProps {
  employee: EmployeeProfile;
}

export function EmployeeSettingsForm({ employee: base }: EmployeeSettingsFormProps) {
  const router = useRouter();
  const overrides = useMemo(() => getEmployeeOverrides()[base.id] ?? {}, [base.id]);
  const [name, setName] = useState(() => overrides.name ?? `${base.givenName ?? ''} ${base.familyName ?? ''}`.trim());
  const [role, setRole] = useState(() => overrides.role ?? base.position?.title ?? '');
  const [department, setDepartment] = useState(() => overrides.department ?? base.position?.department?.name ?? base.department?.name ?? '');
  const [location, setLocation] = useState(() => overrides.location ?? base.location?.name ?? '');
  const [email, setEmail] = useState(() => overrides.email ?? base.email);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wf = createProfileChangeWorkflow({
      employeeId: base.id,
      submittedBy: 'You',
      changes: { name, role, department, location, email }
    });
    alert('Submitted for approval. Next step: Manager review.');
    router.push(`/workflows/${wf.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Employee settings">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Edit profile for {base.givenName} {base.familyName}</CardTitle>
            <CardDescription>Submit changes for manager and HR approval.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Location</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Notes for approvers</label>
              <textarea className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit">Submit for approval</Button>
      </div>
    </form>
  );
}

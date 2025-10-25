"use client";
import { notFound, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { sampleEmployees } from '../../../../../lib/sample-data';
import { useState, useMemo } from 'react';
import { createProfileChangeWorkflow } from '../../../../../lib/workflows';
import { getEmployeeOverrides } from '../../../../../lib/overrides';

interface Props {
  params: { id: string };
}

export default function EmployeeSettingsPage({ params }: Props) {
  const router = useRouter();
  const base = sampleEmployees.find((person) => person.id === params.id);
  const overrides = useMemo(() => getEmployeeOverrides()[params.id] ?? {}, [params.id]);
  const employee = base ? { ...base, ...overrides } : undefined;
  if (!employee) {
    notFound();
  }

  const [name, setName] = useState(employee.name);
  const [role, setRole] = useState(employee.role);
  const [department, setDepartment] = useState(employee.department);
  const [location, setLocation] = useState(employee.location);
  const [email, setEmail] = useState(employee.email);
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const wf = createProfileChangeWorkflow({
      employeeId: employee!.id,
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
            <CardTitle>Edit profile</CardTitle>
            <CardDescription>Submit changes for manager and HR approval.</CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Role</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Department</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none" value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Location</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Notes for approvers</label>
              <textarea className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
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

"use client";
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, Button } from '@workright/ui';
import { sampleEmployees } from '../../../../../lib/sample-data';
import { useState } from 'react';

interface Props {
  params: { id: string };
}

export default function EmployeeSettingsPage({ params }: Props) {
  const employee = sampleEmployees.find((person) => person.id === params.id);
  if (!employee) {
    notFound();
  }

  const [email, setEmail] = useState(employee.email);
  const [location, setLocation] = useState(employee.location);
  const [notifications, setNotifications] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert('Settings saved (demo)');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-label="Employee settings">
      <Card>
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Location</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="notifications"
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            />
            <label htmlFor="notifications" className="text-sm text-slate-700">
              Email me when actions are required
            </label>
          </div>
        </div>
      </Card>
      <div className="flex justify-end">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}


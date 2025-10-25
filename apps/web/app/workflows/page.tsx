"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listWorkflows, type ProfileChangeWorkflow } from '../../lib/workflows';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';

export default function WorkflowsPage() {
  const [items, setItems] = useState<ProfileChangeWorkflow[]>([]);
  useEffect(() => {
    setItems(listWorkflows());
  }, []);

  return (
    <div className="space-y-6" aria-label="Workflows">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Workflows</h1>
          <p className="text-slate-600">Manager and HR approvals for profile changes.</p>
        </div>
      </header>

      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No workflows yet.</p>
        ) : (
          items.map((wf) => (
            <Card key={wf.id}>
              <CardHeader className="items-start">
                <div>
                  <CardTitle>Profile change for {wf.employeeId}</CardTitle>
                  <CardDescription>Submitted {new Date(wf.createdAt).toLocaleString()} · Step: {wf.step.replace('_', ' ')}</CardDescription>
                </div>
                <Link href={`/workflows/${wf.id}`}>
                  <Button variant="secondary">Open</Button>
                </Link>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

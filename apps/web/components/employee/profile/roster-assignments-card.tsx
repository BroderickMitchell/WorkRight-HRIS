'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ProfileCard } from './profile-card';
import { RosterAssignment, RosterTemplate } from '@/lib/rosters';

interface RosterAssignmentsCardProps {
  assignments: RosterAssignment[];
  templates: RosterTemplate[];
  canManage: boolean;
  defaultLocationId?: string;
  isLoading: boolean;
  isAssigning: boolean;
  onAssign: (input: { templateId: string; locationId?: string; effectiveFrom: string; effectiveTo?: string }) => Promise<void>;
}

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export function RosterAssignmentsCard({
  assignments,
  templates,
  canManage,
  defaultLocationId,
  isLoading,
  isAssigning,
  onAssign
}: RosterAssignmentsCardProps) {
  const [templateId, setTemplateId] = useState<string>('');
  const [locationId, setLocationId] = useState<string>(defaultLocationId ?? '');
  const [effectiveFrom, setEffectiveFrom] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState<string>('');

  useEffect(() => {
    setLocationId(defaultLocationId ?? '');
  }, [defaultLocationId]);

  const sortedAssignments = useMemo(
    () =>
      [...assignments].sort(
        (a, b) => new Date(b.effectiveFrom).getTime() - new Date(a.effectiveFrom).getTime()
      ),
    [assignments]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!templateId || !effectiveFrom) return;
    await onAssign({
      templateId,
      locationId: locationId.trim() ? locationId.trim() : undefined,
      effectiveFrom,
      effectiveTo: effectiveTo.trim() ? effectiveTo.trim() : undefined
    });
    setEffectiveTo('');
  };

  return (
    <ProfileCard
      title="Roster assignments"
      section="rosters"
      canEdit={false}
      description="Review upcoming roster coverage and connect templates to this employee."
      actions={
        canManage ? (
          <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            Manage
          </span>
        ) : null
      }
    >
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading roster data…</p>
        ) : sortedAssignments.length === 0 ? (
          <p className="text-sm text-slate-500">No roster assignments yet. Link a template to schedule shifts.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    Template
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Location
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Effective
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    Ends
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {sortedAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{assignment.templateName ?? assignment.templateId}</div>
                      <div className="text-xs text-slate-500">Roster ID: {assignment.templateId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {assignment.locationName ?? assignment.locationId ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatDate(assignment.effectiveFrom)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {assignment.effectiveTo ? formatDate(assignment.effectiveTo) : 'Open ended'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {canManage ? (
          <form className="grid gap-4 md:grid-cols-5" onSubmit={handleSubmit}>
            <div className="md:col-span-2">
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                <span>Template</span>
                <select
                  value={templateId}
                  onChange={(event) => setTemplateId(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                >
                  <option value="">Select template…</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                <span>Location ID</span>
                <input
                  value={locationId}
                  onChange={(event) => setLocationId(event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Optional"
                />
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                <span>Effective from</span>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={(event) => setEffectiveFrom(event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  required
                />
              </label>
            </div>
            <div>
              <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                <span>Effective to</span>
                <input
                  type="date"
                  value={effectiveTo}
                  onChange={(event) => setEffectiveTo(event.target.value)}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="Optional"
                />
              </label>
            </div>
            <div className="md:col-span-5 flex items-end justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-brand/60"
                disabled={isAssigning}
              >
                {isAssigning ? 'Assigning…' : 'Assign template'}
              </button>
            </div>
          </form>
        ) : null}
      </div>
    </ProfileCard>
  );
}

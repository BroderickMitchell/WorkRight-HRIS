'use client';

import { useEffect, useState } from 'react';
import { type HistoryCsvResponse, EmploymentEvent, EmploymentEventType } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const typeOptions: Array<{ value: EmploymentEventType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All events' },
  { value: 'HIRE', label: 'Hire' },
  { value: 'TRANSFER', label: 'Transfers' },
  { value: 'COMP_CHANGE', label: 'Compensation changes' },
  { value: 'COST_CODE_CHANGE', label: 'Cost code changes' },
  { value: 'MANAGER_CHANGE', label: 'Manager changes' },
  { value: 'LOA', label: 'Leave of absence' },
  { value: 'TERMINATION', label: 'Terminations' },
  { value: 'OTHER', label: 'Other updates' }
];

interface HistoryCardProps {
  events: EmploymentEvent[];
  onFiltersChange: (filters: { type?: EmploymentEventType; from?: string; to?: string }) => void;
  onExport: (
    filters: { type?: EmploymentEventType; from?: string; to?: string }
  ) => Promise<HistoryCsvResponse>;
  isLoading: boolean;
  isExporting: boolean;
}

export function HistoryCard({ events, onFiltersChange, onExport, isLoading, isExporting }: HistoryCardProps) {
  const [type, setType] = useState<EmploymentEventType | 'ALL'>('ALL');
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  useEffect(() => {
    const filters: { type?: EmploymentEventType; from?: string; to?: string } = {};
    if (type !== 'ALL') filters.type = type;
    if (from) filters.from = from;
    if (to) filters.to = to;
    onFiltersChange(filters);
  }, [type, from, to, onFiltersChange]);

  const grouped = groupEvents(events);

  const handleExport = async () => {
    const filters: { type?: EmploymentEventType; from?: string; to?: string } = {};
    if (type !== 'ALL') filters.type = type;
    if (from) filters.from = from;
    if (to) filters.to = to;
    await onExport(filters);
  };

  return (
    <ProfileCard
      title="History & Audit"
      section="history"
      canEdit={false}
      description="Effective dated activity log with CSV export"
      actions=
        {(
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand hover:text-brand"
            disabled={isExporting}
          >
            {isExporting ? 'Exporting…' : 'Export CSV'}
          </button>
        )}
    >
      {() => (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Event type</span>
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                value={type}
                onChange={(event) => setType(event.target.value as EmploymentEventType | 'ALL')}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">From</span>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">To</span>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </label>
          </div>

          {isLoading ? (
            <p className="text-sm text-slate-500">Loading timeline…</p>
          ) : grouped.length === 0 ? (
            <p className="text-sm text-slate-500">No events for the selected filters.</p>
          ) : (
            <ol className="space-y-6">
              {grouped.map((group) => (
                <li key={group.label}>
                  <div className="mb-2 text-xs uppercase tracking-wide text-slate-500">{group.label}</div>
                  <ul className="space-y-4 border-l-2 border-brand/30 pl-6">
                    {group.items.map((event) => (
                      <li key={event.id} className="relative">
                        <span className="absolute -left-[14px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand" aria-hidden />
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-900">{formatEventType(event.type)}</p>
                            <p className="text-xs text-slate-500">{formatDate(event.effectiveDate)}</p>
                          </div>
                          {event.payload && Object.keys(event.payload).length > 0 ? (
                            <pre className="mt-3 overflow-x-auto rounded bg-slate-900/90 p-3 text-xs text-slate-100">
                              {JSON.stringify(event.payload, null, 2)}
                            </pre>
                          ) : (
                            <p className="mt-3 text-xs text-slate-500">No additional details recorded.</p>
                          )}
                          <p className="mt-3 text-xs text-slate-500">
                            Actor: {event.actor ?? 'System'} · Source: {event.source}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </ProfileCard>
  );
}

function groupEvents(events: EmploymentEvent[]) {
  const map = new Map<string, EmploymentEvent[]>();
  events.forEach((event) => {
    const label = formatMonth(event.effectiveDate);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(event);
  });
  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    items: items.sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
  }));
}

function formatMonth(value: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatEventType(type: EmploymentEventType) {
  return type
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

type JobItem = { slug: string; title: string; location: string; workType: string; createdAt: string };

export default function JobsPage() {
  const [items, setItems] = useState<JobItem[]>([]);
  useEffect(() => {
    apiFetch<{ items: JobItem[] }>(`/v1/jobs`).then((r) => setItems(r.items ?? [])).catch(() => setItems([]));
  }, []);
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6" aria-label="Job listings">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Current opportunities</h1>
        <p className="text-slate-600">Browse open roles across our Australian operations.</p>
      </header>
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {items.length === 0 && <li className="p-4 text-sm text-slate-500">No jobs posted at the moment.</li>}
        {items.map((j) => (
          <li key={j.slug} className="p-4">
            <Link href={`/jobs/${j.slug}`} className="text-lg font-semibold text-brand hover:underline">{j.title}</Link>
            <p className="text-sm text-slate-600">{j.location} · {j.workType}</p>
            <p className="text-xs text-slate-400">Posted {new Date(j.createdAt).toLocaleDateString('en-AU')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}


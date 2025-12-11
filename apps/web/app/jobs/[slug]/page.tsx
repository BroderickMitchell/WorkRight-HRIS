"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, apiPost } from '../../../lib/api';

type JobDetail = { slug: string; title: string; description: string; selectionCriteria: string[]; location: string; workType: string; closingDate?: string | null } | null;

export default function JobDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [job, setJob] = useState<JobDetail>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const slug = params?.slug as string;
  useEffect(() => {
    apiFetch<JobDetail>(`/jobs/${slug}`).then(setJob).catch(() => setJob(null));
  }, [slug]);

  async function apply() {
    setBusy(true);
    try {
      await apiPost(`/jobs/${slug}/apply`, form);
      alert('Application submitted successfully.');
      router.push('/jobs');
    } catch (e) {
      alert('Could not submit application.');
    } finally { setBusy(false); }
  }

  if (!job) return <div className="mx-auto max-w-3xl p-6 text-sm text-slate-500">Job not found or closed.</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6" aria-label="Job details">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">{job.title}</h1>
        <p className="text-slate-600">{job.location} · {job.workType}</p>
      </header>
      <section className="prose max-w-none rounded-xl border border-slate-200 bg-white p-6">
        <p>{job.description}</p>
        {job.selectionCriteria?.length > 0 && (
          <>
            <h3>Selection criteria</h3>
            <ul>{job.selectionCriteria.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </>
        )}
        {job.closingDate && <p>Applications close: {new Date(job.closingDate).toLocaleDateString('en-AU')}</p>}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Apply for this role</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">First name</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Last name</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input type="email" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Phone</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 text-right">
          <button disabled={busy} onClick={apply} className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit application'}</button>
        </div>
      </section>
    </div>
  );
}


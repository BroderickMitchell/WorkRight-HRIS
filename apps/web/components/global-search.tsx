'use client';

import { Combobox } from '@headlessui/react';
import { Loader2, Search, UserCircle2, Briefcase, Workflow, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { sampleEmployees, sampleWorkflows } from '../lib/sample-data';
import { cn } from '@workright/ui';

interface SearchResult {
  id: string;
  type: 'employee' | 'job' | 'workflow';
  label: string;
  sublabel: string;
  href: string;
}

const SAMPLE_JOBS: Array<{ id: string; title: string; location: string }> = [
  { id: 'job-1', title: 'Maintenance Planner', location: 'Perth, WA' },
  { id: 'job-2', title: 'Process Engineer', location: 'Newcastle, NSW' },
  { id: 'job-3', title: 'HSE Advisor', location: 'Karratha, WA' }
];

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const lower = query.toLowerCase();
    const employeeMatches = sampleEmployees
      .filter((emp) => emp.name.toLowerCase().includes(lower) || emp.role.toLowerCase().includes(lower))
      .map<SearchResult>((emp) => ({
        id: emp.id,
        type: 'employee',
        label: emp.name,
        sublabel: emp.role,
        href: `/employees/${emp.id}`
      }));

    const jobMatches = SAMPLE_JOBS.filter((job) => job.title.toLowerCase().includes(lower)).map<SearchResult>((job) => ({
      id: job.id,
      type: 'job',
      label: job.title,
      sublabel: job.location,
      href: `/jobs/${job.id}`
    }));

    const workflowMatches = sampleWorkflows
      .filter((wf) => wf.title.toLowerCase().includes(lower))
      .map<SearchResult>((wf) => ({
        id: wf.id,
        type: 'workflow',
        label: wf.title,
        sublabel: wf.currentStep,
        href: `/workflows/instances/${wf.id}`
      }));

    return [...employeeMatches, ...jobMatches, ...workflowMatches].slice(0, 10);
  }, [query]);

  return (
    <Combobox
      onChange={(value: SearchResult | null) => {
        if (value) {
          router.push(value.href);
          setQuery('');
        }
      }}
    >
      <div className="relative w-full max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Combobox.Input
          className="h-11 w-full rounded-lg border border-border bg-panel pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring"
          placeholder="Search people, jobs, workflows"
          aria-label="Global search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsLoading(true);
            window.setTimeout(() => setIsLoading(false), 150);
          }}
        />
        {query && (
          <Combobox.Options className="absolute z-50 mt-2 max-h-80 w-full overflow-auto rounded-xl border border-border bg-panel p-2 shadow-xl">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Searching…
              </div>
            ) : results.length === 0 ? (
              <div className="px-3 py-4 text-sm text-muted-foreground">No matches found for “{query}”.</div>
            ) : (
              results.map((result) => (
                <Combobox.Option
                  key={`${result.type}-${result.id}`}
                  value={result}
                  className={({ active }: { active: boolean }) =>
                    cn(
                      'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm',
                      active ? 'bg-primary/10 text-primary' : 'text-foreground'
                    )
                  }
                >
                  {({ active }: { active: boolean }) => (
                    <>
                      <div className="flex items-center gap-3">
                        {renderIcon(result.type, active)}
                        <div className="flex flex-col">
                          <span className="font-medium">{result.label}</span>
                          <span className="text-xs text-muted-foreground">{result.sublabel}</span>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
}

function renderIcon(type: SearchResult['type'], active: boolean) {
  const className = cn('h-5 w-5 flex-none', active ? 'text-primary' : 'text-muted-foreground');
  switch (type) {
    case 'employee':
      return <UserCircle2 className={className} aria-hidden />;
    case 'job':
      return <Briefcase className={className} aria-hidden />;
    case 'workflow':
      return <Workflow className={className} aria-hidden />;
    default:
      return null;
  }
}

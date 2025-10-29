"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { sampleEmployees, type Employee } from '../../../lib/sample-data';

function getRoots(list: Employee[]) {
  const roots = list.filter((e) => !e.managerId);
  return roots.length > 0 ? roots : [list[0]];
}

function getDirectReports(managerId: string) {
  return sampleEmployees.filter((e) => e.managerId === managerId);
}

function OrgNode({ emp, dottedLabel, onRef }: { emp: Employee; dottedLabel?: string; onRef?: (id: string, el: HTMLDivElement | null) => void }) {
  return (
    <div ref={(el) => onRef?.(emp.id, el)} className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-3">
        {emp.avatarUrl ? (
          <Image
            src={emp.avatarUrl}
            alt={`${emp.name}'s avatar`}
            width={48}
            height={48}
            sizes="48px"
            className="h-12 w-12 rounded-full object-cover ring-1 ring-slate-200"
          />
        ) : (
        <div className="h-12 w-12 rounded-full bg-slate-200" />
      )}
      <div>
        <Link href={`/employees/${emp.id}`} className="font-medium text-slate-900 hover:underline">
          {emp.name}
        </Link>
        <p className="text-sm text-slate-600">{emp.role}</p>
      </div>
      </div>
      {/* Hide dotted-line indicator in org chart (matrix manager still editable in profile) */}
    </div>
  );
}

function Subtree({
  emp,
  expanded,
  onToggle,
  dottedMap,
  onRef
}: {
  emp: Employee;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  dottedMap: Map<string, string | undefined>;
  onRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  const children = getDirectReports(emp.id);
  const isOpen = expanded.has(emp.id);
  const dottedLabel = dottedMap.get(emp.id);
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <button
          aria-label={isOpen ? 'Collapse' : 'Expand'}
          onClick={() => onToggle(emp.id)}
          className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-50"
        >
          {isOpen ? '−' : '+'}
        </button>
        <OrgNode emp={emp} dottedLabel={dottedLabel} onRef={onRef} />
      </div>
      {children.length > 0 && isOpen && (
        <>
          <div className="my-2 h-4 w-px bg-slate-300" />
          <div className="relative">
            {/* horizontal connector across children */}
            <div className="absolute left-0 right-0 top-0 h-px bg-slate-300" />
            <div className="flex flex-wrap items-start justify-center gap-10 px-6 pt-2">
              {children.map((c) => (
                <div key={c.id} className="relative flex flex-col items-center">
                  {/* vertical connector down to child */}
                  <div className="absolute -top-2 h-2 w-px bg-slate-300" />
                  <Subtree emp={c} expanded={expanded} onToggle={onToggle} dottedMap={dottedMap} onRef={onRef} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { Suspense } from 'react';

function OrgChartInner() {
  const roots = getRoots(sampleEmployees);
  const [query, setQuery] = useState('');
  // expanded set default: all roots expanded
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialExpanded = useMemo(() => {
    const fromUrl = searchParams?.get('ex');
    if (fromUrl) return new Set(fromUrl.split(',').filter(Boolean));
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('orgExpanded');
      if (raw) return new Set<string>(JSON.parse(raw));
    }
    return new Set(roots.map((r) => r.id));
  }, [searchParams, roots]);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);

  function onToggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // persist expanded to URL and localStorage (debounced via effect)
  useEffect(() => {
    const ids = Array.from(expanded);
    const qs = new URLSearchParams(searchParams ? searchParams.toString() : '');
    qs.set('ex', ids.join(','));
    router.replace(`?${qs.toString()}`);
    try { localStorage.setItem('orgExpanded', JSON.stringify(ids)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded]);

  const idToEmp = useMemo(() => new Map(sampleEmployees.map((e) => [e.id, e] as const)), []);
  // Map each employee id to dotted line manager name (if present)
  const dottedMap = useMemo(() => {
    const m = new Map<string, string | undefined>();
    for (const e of sampleEmployees) {
      if (e.dottedLineManagerId) {
        const mgr = idToEmp.get(e.dottedLineManagerId);
        if (mgr) m.set(e.id, mgr.name);
      }
    }
    return m;
  }, [idToEmp]);

  const filteredRoots = useMemo(() => {
    if (!query.trim()) return roots;
    const q = query.trim().toLowerCase();
    // expand any nodes along the path to matches
    const parentsToOpen = new Set<string>();
    for (const e of sampleEmployees) {
      if (e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)) {
        // open manager chain
        let cur = e;
        while (cur.managerId) {
          parentsToOpen.add(cur.managerId);
          const p = idToEmp.get(cur.managerId);
          if (!p) break;
          cur = p;
        }
      }
    }
    // merge into expanded state
    setExpanded((prev) => new Set([...prev, ...parentsToOpen]));
    return roots;
  }, [query, roots, idToEmp]);

  // Pan/zoom state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const originStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    originStart.current = { ...offset };
  }, [offset]);
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({ x: originStart.current.x + dx, y: originStart.current.y + dy });
  }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);
  const zoomIn = () => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));
  const resetView = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  // Dotted-line connectors are intentionally disabled in the org chart view
  // (Matrix manager remains editable within an employee profile form.)
  return (
    <div className="space-y-6" aria-label="Organisation chart">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Org chart</h1>
        <p className="text-slate-600">Visualise reporting lines and plan workforce moves.</p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-sm font-semibold tracking-wide text-slate-700">Org Chart</h2>
        <div className="mb-4 flex items-center gap-3">
          <input
            type="search"
            placeholder="Search name or role"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            aria-label="Search org chart"
          />
          <div className="text-xs text-slate-500">Click +/- to expand or collapse</div>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <label className="flex items-center gap-1"><input type="radio" name="mode" checked readOnly /> People</label>
            <label className="flex items-center gap-1"><input type="radio" name="mode" onChange={() => router.push('/org-chart/positions')} /> Positions</label>
          </div>
        </div>
        <div className="relative max-w-full overflow-x-auto overflow-y-hidden rounded border border-slate-200">
          <div className="absolute left-2 top-2 z-10 flex gap-2">
            <button onClick={zoomOut} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">-</button>
            <button onClick={zoomIn} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">+</button>
            <button onClick={resetView} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">Reset</button>
          </div>
          <div
            className="relative h-[600px] min-w-[800px] cursor-grab"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
            >
              <div className="relative z-10 flex flex-col items-center gap-8 p-10">
                {filteredRoots.map((r) => (
                  <Subtree key={r.id} emp={r} expanded={expanded} onToggle={onToggle} dottedMap={dottedMap} onRef={() => {}} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/employees" className="text-sm text-brand hover:underline">
            View full organisational chart
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function OrgChartPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-500">Loading chart…</div>}>
      <OrgChartInner />
    </Suspense>
  );
}




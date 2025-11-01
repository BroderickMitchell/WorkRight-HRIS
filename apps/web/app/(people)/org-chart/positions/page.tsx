"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import Link from 'next/link';
import { apiFetch } from '../../../../lib/api';

type Pos = { id: string; positionHumanId: string; title: string; reportsToId?: string | null; status: 'PENDING'|'ACTIVE'|'ARCHIVED' };

function getRoots(list: Pos[]) {
  const ids = new Set(list.map((p) => p.id));
  const children = new Set(list.map((p) => p.reportsToId).filter(Boolean) as string[]);
  const roots = list.filter((p) => !p.reportsToId || !ids.has(p.reportsToId));
  return roots.length > 0 ? roots : list.slice(0,1);
}

function childrenOf(list: Pos[], id: string) {
  return list.filter((p) => p.reportsToId === id);
}

function Node({ p }: { p: Pos }) {
  const map = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    ACTIVE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    ARCHIVED: 'bg-slate-100 text-slate-700 border-slate-200'
  } as const;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm">
      <p className="font-medium text-slate-900">{p.positionHumanId} · {p.title}</p>
      <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-xs ${map[p.status]}`}>{p.status}</span>
    </div>
  );
}

function Subtree({ list, id, expanded, onToggle }: { list: Pos[]; id: string; expanded: Set<string>; onToggle: (id: string) => void }) {
  const me = list.find((x) => x.id === id)!;
  const kids = childrenOf(list, id);
  const isOpen = expanded.has(id);
  return (
    <div className="flex flex-col items-center">
      <div className="mb-1 flex items-center gap-2">
        {kids.length > 0 && (
          <button onClick={() => onToggle(id)} className="inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-50">{isOpen ? '−' : '+'}</button>
        )}
        <Node p={me} />
      </div>
      {kids.length > 0 && isOpen && (
        <div className="relative">
          <div className="my-2 h-4 w-px bg-slate-300" />
          <div className="absolute left-0 right-0 top-0 h-px bg-slate-300" />
          <div className="flex flex-wrap items-start justify-center gap-8 px-6 pt-2">
            {kids.map((c) => (
              <div key={c.id} className="relative flex flex-col items-center">
                <div className="absolute -top-2 h-2 w-px bg-slate-300" />
                <Subtree list={list} id={c.id} expanded={expanded} onToggle={onToggle} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PositionsOrgChartPage() {
  const [includePending, setIncludePending] = useState(false);
  const [rows, setRows] = useState<Pos[]>([]);
  useEffect(() => {
    const status = includePending ? undefined : 'active';
    const path = status ? `/v1/org/positions?status=${status}` : `/v1/org/positions`;
    apiFetch<Pos[]>(path).then(setRows).catch(() => setRows([]));
  }, [includePending]);

  const roots = useMemo(() => getRoots(rows), [rows]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const onToggle = useCallback((id: string) => setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);

  // Pan/zoom like main org chart
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const originStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const onMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => { dragging.current = true; dragStart.current = { x: e.clientX, y: e.clientY }; originStart.current = { ...offset }; }, [offset]);
  const onMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => { if (!dragging.current) return; const dx = e.clientX - dragStart.current.x; const dy = e.clientY - dragStart.current.y; setOffset({ x: originStart.current.x + dx, y: originStart.current.y + dy }); }, []);
  const onMouseUp = useCallback(() => { dragging.current = false; }, []);
  const zoomIn = () => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)));
  const resetView = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  return (
    <div className="space-y-6" aria-label="Positions org chart">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Positions org chart</h1>
          <p className="text-slate-600">View approved positions in the organisational chart.</p>
        </div>
        <label className="text-sm text-slate-700"><input type="checkbox" className="mr-2" checked={includePending} onChange={(e) => setIncludePending(e.target.checked)} /> Include Pending</label>
      </header>

      <div className="relative max-w-full overflow-x-auto overflow-y-hidden rounded border border-slate-200">
        <div className="absolute left-2 top-2 z-10 flex gap-2">
          <button onClick={zoomOut} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">−</button>
          <button onClick={zoomIn} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">+</button>
          <button onClick={resetView} className="rounded border border-slate-300 bg-white px-2 py-1 text-sm">Reset</button>
        </div>
        <div className="relative h-[600px] min-w-[800px] cursor-grab" onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
            <div className="flex flex-col items-center gap-8 p-10">
              {roots.map((r) => (
                <Subtree key={r.id} list={rows} id={r.id} expanded={expanded} onToggle={onToggle} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="text-center text-sm">
        <Link href="/org-chart" className="text-brand hover:underline">Back to People org chart</Link>
      </div>
    </div>
  );
}


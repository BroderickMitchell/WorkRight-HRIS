"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workright/ui";
import { apiFetch } from "../../../../lib/api";

const vacancyClasses = {
  open: "bg-amber-100 text-amber-800 border-amber-200",
  filled: "bg-emerald-100 text-emerald-800 border-emerald-200",
  overfilled: "bg-rose-100 text-rose-800 border-rose-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
} as const;

type VacancyStatus = keyof typeof vacancyClasses;

type OrgChartNode = {
  id: string;
  positionId: string;
  title: string;
  vacancyStatus: VacancyStatus;
  department: { id: string; name: string } | null;
  location: { id: string; name: string } | null;
  occupants: {
    id: string;
    employeeId: string;
    employeeName?: string;
    fte?: number | null;
    baseSalary?: number | null;
    isPrimary: boolean;
  }[];
  children: OrgChartNode[];
};

type OrgChartResponse = OrgChartNode[];

function VacancyBadge({ status }: { status: VacancyStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${vacancyClasses[status]}`}
    >
      {status === "open" && "Vacant"}
      {status === "filled" && "Filled"}
      {status === "overfilled" && "Overfilled"}
      {status === "inactive" && "Inactive"}
    </span>
  );
}

function OccupantsList({ node }: { node: OrgChartNode }) {
  if (node.occupants.length === 0) {
    return (
      <p className="text-xs font-medium text-amber-600">Vacant position</p>
    );
  }

  return (
    <div className="mt-3 space-y-2 text-xs text-slate-600">
      {node.occupants.map((assignment) => (
        <div
          key={assignment.id}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex flex-col">
            <span className="font-medium text-slate-800">
              {assignment.employeeName ?? "Unassigned"}
            </span>
            {assignment.isPrimary && (
              <span className="text-[11px] text-emerald-600">
                Primary occupant
              </span>
            )}
          </div>
          <span className="text-slate-500">
            {assignment.fte != null ? `${assignment.fte.toFixed(2)} FTE` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function PositionNode({ node }: { node: OrgChartNode }) {
  const detailLine = useMemo(() => {
    if (!node.department && !node.location) return null;
    const parts: string[] = [];
    if (node.department) parts.push(node.department.name);
    if (node.location) parts.push(node.location.name);
    return parts.join(" • ");
  }, [node.department, node.location]);

  return (
    <div className="w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">
            {node.positionId} · {node.title}
          </p>
          {detailLine && <p className="text-xs text-slate-600">{detailLine}</p>}
        </div>
        <VacancyBadge status={node.vacancyStatus} />
      </div>
      <OccupantsList node={node} />
      <div className="mt-4 flex items-center justify-between text-xs">
        <Link
          href={`/positions/${node.id}`}
          className="text-brand hover:underline"
        >
          View position
        </Link>
        {node.vacancyStatus === "open" && (
          <Link
            href={`/positions/${node.id}?intent=requisition`}
            className="text-brand hover:underline"
          >
            Raise requisition
          </Link>
        )}
      </div>
    </div>
  );
}

function Subtree({
  node,
  expanded,
  onToggle,
}: {
  node: OrgChartNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expanded.has(node.id);

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-start gap-2">
        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            aria-label={isOpen ? "Collapse" : "Expand"}
            className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded border border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-50"
          >
            {isOpen ? "−" : "+"}
          </button>
        )}
        <PositionNode node={node} />
      </div>
      {hasChildren && isOpen && (
        <div className="flex flex-col items-center">
          <div className="my-2 h-4 w-px bg-slate-300" />
          <div className="relative">
            <div className="absolute left-0 right-0 top-0 h-px bg-slate-300" />
            <div className="flex flex-wrap items-start justify-center gap-8 px-6 pt-2">
              {node.children.map((child) => (
                <div
                  key={child.id}
                  className="relative flex flex-col items-center"
                >
                  <div className="absolute -top-2 h-2 w-px bg-slate-300" />
                  <Subtree
                    node={child}
                    expanded={expanded}
                    onToggle={onToggle}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function collectIds(
  nodes: OrgChartNode[],
  predicate: (node: OrgChartNode) => boolean,
) {
  const result = new Set<string>();
  const walk = (items: OrgChartNode[]) => {
    for (const item of items) {
      if (predicate(item)) result.add(item.id);
      if (item.children.length > 0) {
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return result;
}

export default function PositionsOrgChartPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [showFilledPositions, setShowFilledPositions] = useState(true);
  const [nodes, setNodes] = useState<OrgChartResponse>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (includeInactive) params.set("includeInactive", "true");
      if (showFilledPositions) params.set("includeVacant", "true");
      const qs = params.toString();
      const path = qs
        ? `/v1/positions/orgchart?${qs}`
        : "/v1/positions/orgchart";
      const data = await apiFetch<OrgChartResponse>(path);
      setNodes(data);
    } catch (err) {
      setNodes([]);
      setError("Unable to load positions org chart.");
    } finally {
      setLoading(false);
    }
  }, [includeInactive, showFilledPositions]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setExpanded((prev) => {
      if (nodes.length === 0) return new Set();
      const allIds = collectIds(nodes, () => true);
      if (prev.size === 0) {
        return collectIds(nodes, (node) => node.children.length > 0);
      }
      return new Set([...prev].filter((id) => allIds.has(id)));
    });
  }, [nodes]);

  const toggleNode = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(collectIds(nodes, (node) => node.children.length > 0));
  }, [nodes]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set());
  }, []);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const originStart = useRef({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const onMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      dragging.current = true;
      dragStart.current = { x: event.clientX, y: event.clientY };
      originStart.current = { ...offset };
      setIsDragging(true);
    },
    [offset],
  );

  const onMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dx = event.clientX - dragStart.current.x;
    const dy = event.clientY - dragStart.current.y;
    setOffset({ x: originStart.current.x + dx, y: originStart.current.y + dy });
  }, []);

  const stopDragging = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(
    () => setZoom((value) => Math.min(2, +(value + 0.1).toFixed(2))),
    [],
  );
  const zoomOut = useCallback(
    () => setZoom((value) => Math.max(0.5, +(value - 0.1).toFixed(2))),
    [],
  );
  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const hasNodes = nodes.length > 0;

  return (
    <div className="space-y-6" aria-label="Positions org chart">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Positions org chart
          </h1>
          <p className="text-slate-600">
            Visualise the hierarchy of approved positions and monitor vacancies.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showFilledPositions}
              onChange={(event) => setShowFilledPositions(event.target.checked)}
            />
            Show filled positions
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(event) => setIncludeInactive(event.target.checked)}
            />
            Include inactive
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={expandAll}
            disabled={!hasNodes}
          >
            Expand all
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={collapseAll}
            disabled={!hasNodes}
          >
            Collapse all
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Org chart</CardTitle>
            <CardDescription>
              Drag to pan, use the controls to zoom, and expand nodes to drill
              into reporting lines.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={zoomOut}>
              −
            </Button>
            <Button variant="ghost" size="sm" onClick={zoomIn}>
              +
            </Button>
            <Button variant="ghost" size="sm" onClick={resetView}>
              Reset
            </Button>
          </div>
        </CardHeader>
        <div className="relative min-h-[520px] overflow-hidden border-t border-slate-200">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 text-sm text-slate-600">
              Loading positions…
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 p-6 text-center text-sm text-rose-600">
              {error}
            </div>
          )}
          <div
            className={`relative h-[640px] min-w-full ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={stopDragging}
            onMouseLeave={stopDragging}
          >
            <div
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              }}
            >
              <div className="flex flex-col items-center gap-10 p-10">
                {hasNodes ? (
                  nodes.map((node) => (
                    <Subtree
                      key={node.id}
                      node={node}
                      expanded={expanded}
                      onToggle={toggleNode}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No positions available to display.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="text-center text-sm">
        <Link href="/positions" className="text-brand hover:underline">
          Manage positions
        </Link>
      </div>
    </div>
  );
}

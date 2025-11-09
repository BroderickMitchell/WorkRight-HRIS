"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, cn } from "@workright/ui";
import { apiFetch, apiPost, apiPut } from "../../../lib/api";

/* =======================
 * Types & Constants
 * ======================= */

const NODE_TYPES: Array<{ key: WorkflowNodeType; label: string }> = [
  { key: "task", label: "Task" },
  { key: "form", label: "Form" },
  { key: "course", label: "Course" },
  { key: "email", label: "Email" },
  { key: "profile_task", label: "Profile Task" },
  { key: "survey", label: "Survey" },
  { key: "condition", label: "Condition" },
  { key: "dummy_task", label: "Dummy Task" },
];

const ASSIGNMENT_MODES: Array<{ value: AssignmentMode; label: string }> = [
  { value: "assignee", label: "Assignee" },
  { value: "assignee_manager", label: "Assignee's Manager" },
  { value: "user", label: "Specific User" },
  { value: "group", label: "Specific Group" },
];

const CONDITION_FIELDS: Array<{ value: ConditionField; label: string }> = [
  { value: "department", label: "Department" },
  { value: "location", label: "Location" },
  { value: "position", label: "Position" },
  { value: "manager", label: "Manager" },
  { value: "legal_entity", label: "Legal Entity" },
];

const CONDITION_OPERATORS: Array<{ value: ConditionOperator; label: string }> = [
  { value: "IS", label: "Is" },
  { value: "IS_PARENT_OF", label: "Is parent of" },
  { value: "IS_CHILD_OF", label: "Is child of" },
];

const inputBaseClasses =
  "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function FieldLabel({ htmlFor, children, className }: { htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-medium text-slate-700", className)}>
      {children}
    </label>
  );
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className, ...rest } = props;
  return <input {...rest} className={cn(inputBaseClasses, className)} />;
}

function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className, children, ...rest } = props;
  return (
    <select {...rest} className={cn(inputBaseClasses, "appearance-none pr-8", className)}>
      {children}
    </select>
  );
}

export type WorkflowNodeType =
  | "task" | "form" | "course" | "email"
  | "profile_task" | "survey" | "condition" | "dummy_task";

export type AssignmentMode = "assignee" | "assignee_manager" | "user" | "group";
export type ConditionOperator = "IS" | "IS_PARENT_OF" | "IS_CHILD_OF";
export type ConditionField = "department" | "location" | "position" | "manager" | "legal_entity";

interface WorkflowGraphEdge {
  id: string;
  from: string;
  to: string;
  label?: "true" | "false" | null;
  order?: number | null;
}

interface WorkflowGraphNode {
  id: string;
  type: WorkflowNodeType;
  title: string;
  settings: Record<string, unknown>;
  position: { x: number; y: number };
}

interface WorkflowGraph {
  nodes: WorkflowGraphNode[];
  edges: WorkflowGraphEdge[];
}

interface WorkflowSummary {
  id: string;
  name: string;
  status: string;
  draftVersion?: {
    graph: WorkflowGraph;
    versionNumber: number;
  } | null;
  activeVersion?: {
    graph: WorkflowGraph;
    versionNumber: number;
  } | null;
}

interface WorkflowResources {
  taskTemplates: Array<{ id: string; name: string; defaultDueRules: unknown }>;
  formTemplates: Array<{ id: string; name: string }>;
  emailTemplates: Array<{ id: string; name: string; placeholders: string[] }>;
  profileTaskTemplates: Array<{ id: string; name: string; sections: string[] }>;
  courses: Array<{ id: string; title: string }>;
  surveys: Array<{ id: string; name: string; enabledCollectors: unknown }>;
  groups: Array<{ id: string; name: string; isActive: boolean }>;
  users: Array<{ id: string; givenName: string; familyName: string; email: string }>;
  departments: Array<{ id: string; name: string }>;
  locations: Array<{ id: string; name: string }>;
  positions: Array<{ id: string; title: string }>;
  employees: Array<{ id: string; givenName: string; familyName: string }>;
  legalEntities: Array<{ id: string; name: string }>;
}

interface WorkflowNodeData {
  title: string;
  nodeType: WorkflowNodeType;
  settings: Record<string, unknown>;
}

/* =======================
 * Utilities
 * ======================= */

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return `${prefix}-${(crypto as any).randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nodeColor(type: WorkflowNodeType, settings: Record<string, unknown>): string {
  if (type === "condition") return "bg-slate-600";
  if (type === "dummy_task") return "bg-purple-600";
  if (type === "email" && (settings as any)?.schedule) return "bg-orange-500";
  if (type === "email") return "bg-sky-500";
  if (type === "course") return "bg-emerald-500";
  return "bg-blue-600";
}

function formatAssignment(settings: Record<string, unknown>, resources: WorkflowResources | null): string {
  const assignment: any = (settings as any)?.assignment ?? (settings as any)?.recipients;
  const mode = assignment?.mode ?? assignment;
  if (!mode) return "Assignee";
  switch (mode as AssignmentMode) {
    case "assignee_manager":
      return "Assignee manager";
    case "user": {
      const user = resources?.users.find((u) => u.id === assignment?.id);
      return user ? `${user.givenName} ${user.familyName}` : "Specific user";
    }
    case "group": {
      const group = resources?.groups.find((g) => g.id === assignment?.id);
      return group ? group.name : "Specific group";
    }
    default:
      return "Assignee";
  }
}

const defaultSettings: Record<WorkflowNodeType, () => Record<string, unknown>> = {
  task: () => ({ assignment: { mode: "assignee" }, dueRule: null }),
  form: () => ({ assignment: { mode: "assignee" }, dueRule: null }),
  course: () => ({ assignment: { mode: "assignee" } }),
  email: () => ({ recipients: { mode: "assignee" } }),
  profile_task: () => ({}),
  survey: () => ({}),
  condition: () => ({ logic: "ALL", criteria: [] }),
  dummy_task: () => ({ assignment: { mode: "user" }, dueRule: null }),
};

const defaultTitles: Record<WorkflowNodeType, string> = {
  task: "Task",
  form: "Form",
  course: "Course assignment",
  email: "Email",
  profile_task: "Profile task",
  survey: "Survey",
  condition: "Condition",
  dummy_task: "Gate task",
};

/* =======================
 * Page
 * ======================= */

export default function WorkflowWorkbenchesPage() {
  const [workflows, setWorkflows] = useState<WorkflowSummary[]>([]);
  const [resources, setResources] = useState<WorkflowResources | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<WorkflowNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        setLoading(true);
        const [wf, res] = await Promise.all([
          apiFetch<WorkflowSummary[]>(`/v1/workflows`),
          apiFetch<WorkflowResources>(`/v1/workflows/resources`),
        ]);
        if (cancelled) return;
        setWorkflows(wf);
        setResources(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-select first workflow when list loads and nothing selected
  useEffect(() => {
    if (workflows.length && !selectedWorkflowId) {
      loadWorkflow(workflows[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflows, selectedWorkflowId]);

  const loadWorkflow = useCallback(
    (workflow: WorkflowSummary) => {
      setSelectedWorkflowId(workflow.id);
      setSelectedNodeId(null);
      const graph = workflow.draftVersion?.graph ?? workflow.activeVersion?.graph ?? { nodes: [], edges: [] };
      const nextNodes: Node<WorkflowNodeData>[] = graph.nodes.map((node) => ({
        id: node.id,
        type: "workflowNode",
        position: node.position ?? { x: 100, y: 100 },
        data: {
          title: node.title,
          nodeType: node.type,
          settings: node.settings ?? {},
        },
      }));
      const nextEdges: Edge[] = graph.edges.map((edge) => ({
        id: edge.id,
        source: edge.from,
        target: edge.to,
        label: edge.label ?? undefined,
        data: { label: edge.label ?? null },
        markerEnd: { type: MarkerType.ArrowClosed },
      }));
      setNodes(nextNodes);
      setEdges(nextEdges);
    },
    [setEdges, setNodes]
  );

  const selectedWorkflow = useMemo(() => workflows.find((wf) => wf.id === selectedWorkflowId) ?? null, [
    selectedWorkflowId,
    workflows,
  ]);

  const selectedNode = useMemo(() => nodes.find((node) => node.id === selectedNodeId) ?? null, [nodes, selectedNodeId]);

  const addNode = useCallback(
    (type: WorkflowNodeType) => {
      setNodes((existing) => [
        ...existing,
        {
          id: generateId(type),
          type: "workflowNode",
          position: { x: 200 + existing.length * 40, y: 100 + existing.length * 20 },
          data: {
            title: defaultTitles[type],
            nodeType: type,
            settings: defaultSettings[type](),
          },
        },
      ]);
    },
    [setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: generateId("edge"),
            label: undefined,
            data: { label: null },
            markerEnd: { type: MarkerType.ArrowClosed },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: unknown, node: Node<WorkflowNodeData>) => {
    setSelectedNodeId(node.id);
  }, []);

  const removeSelectedNode = useCallback(() => {
    if (!selectedNodeId) return;
    setNodes((existing) => existing.filter((node) => node.id !== selectedNodeId));
    setEdges((existing) => existing.filter((edge) => edge.source !== selectedNodeId && edge.target !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId, setEdges, setNodes]);

  const updateNodeData = useCallback(
    (id: string, updater: (data: WorkflowNodeData) => WorkflowNodeData) => {
      setNodes((existing) => existing.map((node) => (node.id === id ? { ...node, data: updater(node.data) } : node)));
    },
    [setNodes]
  );

  const updateEdgeLabel = useCallback(
    (edgeId: string, label: "true" | "false" | null) => {
      setEdges((existing) =>
        existing.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                label: label ?? undefined,
                data: { ...(edge.data ?? {}), label },
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  const createWorkflow = useCallback(async () => {
    if (!newWorkflowName.trim()) return;
    try {
      setSaving(true);
      const created = await apiPost<WorkflowSummary>("/v1/workflows", { name: newWorkflowName.trim() });
      const refreshed = await apiFetch<WorkflowSummary[]>("/v1/workflows");
      setWorkflows(refreshed);
      const match = refreshed.find((wf) => wf.id === created.id);
      if (match) {
        loadWorkflow(match);
      }
      setNewWorkflowName("");
      setMessage("Workflow draft created");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [loadWorkflow, newWorkflowName]);

  const buildGraphPayload = useCallback((): WorkflowGraph => {
    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.data.nodeType,
        title: node.data.title,
        settings: node.data.settings,
        position: node.position,
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        from: edge.source,
        to: edge.target,
        label: (edge.data as any)?.label ?? edge.label ?? null,
        order: (edge.data as any)?.order ?? null,
      })),
    };
  }, [edges, nodes]);

  const saveGraph = useCallback(async () => {
    if (!selectedWorkflow) return;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await apiPut(`/v1/workflows/${selectedWorkflow.id}/graph`, buildGraphPayload());
      setMessage("Draft saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [buildGraphPayload, selectedWorkflow]);

  const activate = useCallback(async () => {
    if (!selectedWorkflow) return;
    setActivating(true);
    setMessage(null);
    setError(null);
    try {
      await apiPost(`/v1/workflows/${selectedWorkflow.id}/activate`, {});
      const refreshed = await apiFetch<WorkflowSummary[]>("/v1/workflows");
      setWorkflows(refreshed);
      const match = refreshed.find((wf) => wf.id === selectedWorkflow.id);
      if (match) loadWorkflow(match);
      setMessage("Workflow activated");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActivating(false);
    }
  }, [loadWorkflow, selectedWorkflow]);

  const workflowStatus = selectedWorkflow?.status ?? "draft";

  return (
    <div className="space-y-6" aria-label="Onboarding workflow designer">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Onboarding Workflows</h1>
          <p className="text-slate-600">Design conditional onboarding journeys with tasks, forms, courses, and notifications.</p>
        </div>
      </header>

      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message && <div className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div>}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr_320px]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Workflows</CardTitle>
            <CardDescription>Select a workflow to edit or create a new draft.</CardDescription>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <FieldLabel htmlFor="new-workflow">New workflow name</FieldLabel>
              <TextInput id="new-workflow" value={newWorkflowName} onChange={(event) => setNewWorkflowName(event.target.value)} placeholder="e.g. New starter onboarding" />
              <Button onClick={createWorkflow} disabled={saving || !newWorkflowName.trim()} className="w-full" variant="primary">
                Create draft
              </Button>
            </div>
            <div className="space-y-2">
              <FieldLabel>Existing workflows</FieldLabel>
              <div className="space-y-2">
                {loading && <p className="text-sm text-slate-500">Loading…</p>}
                {!loading && workflows.length === 0 && <p className="text-sm text-slate-500">No workflows defined yet.</p>}
                {!loading && workflows.length > 0 && (
                  <ul className="space-y-1">
                    {workflows.map((wf) => (
                      <li key={wf.id}>
                        <button
                          type="button"
                          onClick={() => loadWorkflow(wf)}
                          className={cn(
                            "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                            wf.id === selectedWorkflowId ? "border-blue-400 bg-blue-50 text-blue-700" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{wf.name}</span>
                            <Badge variant="secondary" className="uppercase">
                              {wf.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">Draft v{wf.draftVersion?.versionNumber ?? wf.activeVersion?.versionNumber ?? 1}</p>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="min-h-[720px]">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>{selectedWorkflow?.name ?? "Select a workflow"}</CardTitle>
              <CardDescription>Drag steps on the canvas, connect them to define branching logic.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="uppercase">
                {workflowStatus}
              </Badge>
              <Button onClick={saveGraph} disabled={!selectedWorkflow || saving} variant="primary">
                {saving ? "Saving…" : "Save draft"}
              </Button>
              <Button onClick={activate} disabled={!selectedWorkflow || activating} variant="secondary">
                {activating ? "Activating…" : "Activate"}
              </Button>
            </div>
          </CardHeader>
          <div className="relative h-[720px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              fitView
              nodeTypes={{ workflowNode: WorkflowCanvasNode(resources) }}
            >
              <MiniMap zoomable pannable />
              <Controls />
              <Background gap={16} size={1} />
            </ReactFlow>
          </div>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Palette & configuration</CardTitle>
            <CardDescription>Add new steps or edit the selected node.</CardDescription>
          </CardHeader>
          <div className="space-y-6 p-6 pt-0">
            <div className="space-y-2">
              <FieldLabel>Add step</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {NODE_TYPES.map((node) => (
                  <Button key={node.key} variant="secondary" onClick={() => addNode(node.key)}>
                    {node.label}
                  </Button>
                ))}
              </div>
            </div>

            {selectedNode ? (
              <NodeConfiguration
                node={selectedNode}
                resources={resources}
                edges={edges}
                updateNodeData={updateNodeData}
                updateEdgeLabel={updateEdgeLabel}
                removeNode={removeSelectedNode}
              />
            ) : (
              <p className="text-sm text-slate-500">Select a node to configure assignments, templates, and logic.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* =======================
 * Canvas Node renderer (with displayName)
 * ======================= */
function WorkflowCanvasNode(resources: WorkflowResources | null) {
  const Component = ({ data }: { data: WorkflowNodeData }) => {
    const color = nodeColor(data.nodeType, data.settings);
    const assignment = formatAssignment(data.settings, resources);
    return (
      <div className={cn("w-64 rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md")}>
        <div className={cn("rounded-t-lg px-3 py-2 text-sm font-medium text-white", color)}>{defaultTitles[data.nodeType]}</div>
        <div className="space-y-1 px-3 py-2">
          <p className="text-sm font-semibold text-slate-800">{data.title}</p>
          <p className="text-xs uppercase tracking-wide text-slate-400">Assignment</p>
          <p className="text-xs text-slate-600">{assignment}</p>
        </div>
      </div>
    );
  };
  Component.displayName = "WorkflowCanvasNode";
  return Component;
}

/* =======================
 * Right rail configuration
 * ======================= */

interface NodeConfigurationProps {
  node: Node<WorkflowNodeData>;
  resources: WorkflowResources | null;
  edges: Edge[];
  updateNodeData: (id: string, updater: (data: WorkflowNodeData) => WorkflowNodeData) => void;
  updateEdgeLabel: (edgeId: string, label: "true" | "false" | null) => void;
  removeNode: () => void;
}

function NodeConfiguration({ node, resources, edges, updateNodeData, updateEdgeLabel, removeNode }: NodeConfigurationProps) {
  const data = node.data;
  const settings = (data.settings ?? {}) as Record<string, unknown>;

  const updateSettings = useCallback(
    (updater: (settings: Record<string, unknown>) => Record<string, unknown>) => {
      updateNodeData(node.id, (existing) => ({ ...existing, settings: updater((existing.settings ?? {}) as Record<string, unknown>) }));
    },
    [node.id, updateNodeData]
  );

  const updateTitle = useCallback(
    (title: string) => {
      updateNodeData(node.id, (existing) => ({ ...existing, title }));
    },
    [node.id, updateNodeData]
  );

  switch (data.nodeType) {
    case "task":
      return <TaskNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    case "form":
      return <FormNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    case "course":
      return <CourseNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    case "email":
      return <EmailNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    case "profile_task":
      return <ProfileTaskNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    case "survey":
      return <SurveyNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    case "condition":
      return (
        <ConditionNodeConfig
          settings={settings}
          resources={resources}
          edges={edges.filter((edge) => edge.source === node.id)}
          updateSettings={updateSettings}
          updateEdgeLabel={updateEdgeLabel}
          removeNode={removeNode}
        />
      );
    case "dummy_task":
      return <DummyNodeConfig title={data.title} settings={settings} resources={resources} updateTitle={updateTitle} updateSettings={updateSettings} removeNode={removeNode} />;
    default:
      return null;
  }
}

interface CommonConfigProps {
  title: string;
  updateTitle: (value: string) => void;
  removeNode: () => void;
}

function NodeHeader({ title, updateTitle, removeNode }: CommonConfigProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Step title</FieldLabel>
        <Button variant="ghost" size="sm" onClick={removeNode}>
          Remove
        </Button>
      </div>
      <TextInput value={title} onChange={(event) => updateTitle(event.target.value)} />
    </div>
  );
}
interface AssignmentConfigProps {
  assignment: Record<string, unknown>;
  resources: WorkflowResources | null;
  onChange: (assignment: Record<string, unknown>) => void;
  allowedModes?: AssignmentMode[];
}

function AssignmentConfig({ assignment, resources, onChange, allowedModes }: AssignmentConfigProps) {
  const modes = allowedModes ?? ASSIGNMENT_MODES.map((item) => item.value);
  const options = ASSIGNMENT_MODES.filter((item) => modes.includes(item.value));
  const currentMode = ((assignment as any)?.mode ?? assignment) as AssignmentMode | undefined;

  return (
    <div className="space-y-2">
      <FieldLabel>Assignment</FieldLabel>
      <SelectInput
        value={currentMode ?? "assignee"}
        onChange={(event) => {
          const value = event.target.value as AssignmentMode;
          if (value === "user" || value === "group") {
            onChange({ mode: value, id: (assignment as any)?.id ?? null });
          } else {
            onChange({ mode: value });
          }
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectInput>

      {currentMode === "user" && (
        <SelectInput
          value={(assignment as any)?.id ?? ""}
          onChange={(event) => onChange({ mode: "user", id: event.target.value || null })}
        >
          <option value="">Select user</option>
          {resources?.users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.givenName} {user.familyName}
            </option>
          ))}
        </SelectInput>
      )}

      {currentMode === "group" && (
        <SelectInput
          value={(assignment as any)?.id ?? ""}
          onChange={(event) => onChange({ mode: "group", id: event.target.value || null })}
        >
          <option value="">Select group</option>
          {resources?.groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
              {group.isActive ? "" : " (disabled)"}
            </option>
          ))}
        </SelectInput>
      )}
    </div>
  );
}

// ----- DueRuleConfig -----

interface DueRuleProps {
  dueRule: Record<string, unknown> | null;
  onChange: (rule: Record<string, unknown> | null) => void;
}

function DueRuleConfig({ dueRule, onChange }: DueRuleProps) {
  const basis = (dueRule as any)?.basis ?? "assignee.start_date";
  const direction = (dueRule as any)?.direction ?? "AFTER";
  const offsetValue = (dueRule as any)?.offset?.value ?? 0;
  const offsetUnit = (dueRule as any)?.offset?.unit ?? "days";

  const currentRule = {
    basis,
    direction,
    offset: { value: offsetValue, unit: offsetUnit },
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Due date rule</FieldLabel>
        <Button variant="ghost" size="sm" onClick={() => onChange(null)}>
          Clear
        </Button>
      </div>

      <SelectInput value={basis} onChange={(e) => onChange({ ...currentRule, basis: e.target.value })}>
        <option value="assignee.start_date">Assignee start date</option>
        <option value="assignee.end_date">Assignee end date</option>
        <option value="node.activation_time">Node activation time</option>
      </SelectInput>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <TextInput
          type="number"
          value={offsetValue}
          onChange={(e) =>
            onChange({
              ...currentRule,
              offset: { value: Number(e.target.value || 0), unit: offsetUnit },
            })
          }
        />
        <SelectInput
          value={offsetUnit}
          onChange={(e) => onChange({ ...currentRule, offset: { value: offsetValue, unit: e.target.value } })}
        >
          <option value="days">Days</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
        </SelectInput>
      </div>

      <SelectInput value={direction} onChange={(e) => onChange({ ...currentRule, direction: e.target.value })}>
        <option value="AFTER">After basis</option>
        <option value="BEFORE">Before basis</option>
      </SelectInput>
    </div>
  );
}

/* ---- Node Configs ----------------------------------- */

interface ConfigBaseProps {
  title: string;
  settings: Record<string, unknown>;
  resources: WorkflowResources | null;
  updateTitle: (value: string) => void;
  updateSettings: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  removeNode: () => void;
}

function TaskNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Task template</FieldLabel>
        <SelectInput
          value={(settings as any).taskTemplateId ?? ""}
          onChange={(event) =>
            updateSettings((prev) => ({ ...prev, taskTemplateId: event.target.value }))
          }
        >
          <option value="">Select template</option>
          {resources?.taskTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
          ))}
        </SelectInput>
      </div>

      <AssignmentConfig
        assignment={(settings as any).assignment ?? { mode: "assignee" }}
        resources={resources}
        onChange={(assignment) => updateSettings((prev) => ({ ...prev, assignment }))}
      />

      <DueRuleConfig
        dueRule={(settings as any).dueRule ?? null}
        onChange={(rule) => updateSettings((prev) => ({ ...prev, dueRule: rule }))}
      />
    </div>
  );
}

function DummyNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Task template</FieldLabel>
        <SelectInput value={(settings as any).taskTemplateId ?? ""} onChange={(event) => updateSettings((prev) => ({ ...prev, taskTemplateId: event.target.value }))}>
          <option value="">Select template</option>
          {resources?.taskTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <AssignmentConfig assignment={(settings as any).assignment ?? { mode: "user" }} resources={resources} onChange={(assignment) => updateSettings((prev) => ({ ...prev, assignment }))} allowedModes={["user", "group"]} />
      <DueRuleConfig dueRule={(settings as any).dueRule ?? null} onChange={(rule) => updateSettings((prev) => ({ ...prev, dueRule: rule }))} />
    </div>
  );
}

function FormNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Form template</FieldLabel>
        <SelectInput value={(settings as any).formTemplateId ?? ""} onChange={(event) => updateSettings((prev) => ({ ...prev, formTemplateId: event.target.value }))}>
          <option value="">Select template</option>
          {resources?.formTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <AssignmentConfig assignment={(settings as any).assignment ?? { mode: "assignee" }} resources={resources} onChange={(assignment) => updateSettings((prev) => ({ ...prev, assignment }))} />
      <DueRuleConfig dueRule={(settings as any).dueRule ?? null} onChange={(rule) => updateSettings((prev) => ({ ...prev, dueRule: rule }))} />
    </div>
  );
}

function CourseNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Course</FieldLabel>
        <SelectInput value={(settings as any).courseId ?? ""} onChange={(event) => updateSettings((prev) => ({ ...prev, courseId: event.target.value }))}>
          <option value="">Select course</option>
          {resources?.courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </SelectInput>
      </div>
      <AssignmentConfig assignment={(settings as any).assignment ?? "assignee"} resources={resources} onChange={(assignment) => updateSettings((prev) => ({ ...prev, assignment }))} allowedModes={["assignee", "assignee_manager"]} />
    </div>
  );
}

function EmailNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  const schedule = ((settings as any).schedule ?? null) as any;
  const relativeTo = schedule?.relativeTo ?? "activation_time";
  const direction = schedule?.direction ?? "AFTER";
  const offsetValue = schedule?.offset?.value ?? 0;
  const offsetUnit = schedule?.offset?.unit ?? "days";
  const sendTime = schedule?.sendTime ?? "";

  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Email template</FieldLabel>
        <SelectInput value={(settings as any).emailTemplateId ?? ""} onChange={(event) => updateSettings((prev) => ({ ...prev, emailTemplateId: event.target.value }))}>
          <option value="">Select template</option>
          {resources?.emailTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </SelectInput>
      </div>
      <AssignmentConfig assignment={(settings as any).recipients ?? { mode: "assignee" }} resources={resources} onChange={(assignment) => updateSettings((prev) => ({ ...prev, recipients: assignment }))} />
      <div className="space-y-2">
        <FieldLabel>Email schedule</FieldLabel>
        <SelectInput
          value={relativeTo}
          onChange={(event) =>
            updateSettings((prev) => ({
              ...prev,
              schedule: { relativeTo: event.target.value, offset: { value: offsetValue, unit: offsetUnit }, direction, sendTime },
            }))
          }
        >
          <option value="activation_time">When step activates</option>
          <option value="start_date">Assignee start date</option>
          <option value="end_date">Assignee end date</option>
        </SelectInput>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <TextInput
            type="number"
            value={offsetValue}
            onChange={(event) =>
              updateSettings((prev) => ({
                ...prev,
                schedule: { relativeTo, direction, offset: { value: Number(event.target.value || 0), unit: offsetUnit }, sendTime },
              }))
            }
          />
          <SelectInput
            value={offsetUnit}
            onChange={(event) =>
              updateSettings((prev) => ({
                ...prev,
                schedule: { relativeTo, direction, offset: { value: offsetValue, unit: event.target.value }, sendTime },
              }))
            }
          >
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
            <option value="months">Months</option>
          </SelectInput>
        </div>
        <SelectInput
          value={direction}
          onChange={(event) =>
            updateSettings((prev) => ({
              ...prev,
              schedule: { relativeTo, offset: { value: offsetValue, unit: offsetUnit }, direction: event.target.value, sendTime },
            }))
          }
        >
          <option value="AFTER">After basis</option>
          <option value="BEFORE">Before basis</option>
        </SelectInput>
        <TextInput
          type="time"
          placeholder="09:00"
          value={sendTime}
          onChange={(event) =>
            updateSettings((prev) => ({
              ...prev,
              schedule: { relativeTo, direction, offset: { value: offsetValue, unit: offsetUnit }, sendTime: event.target.value },
            }))
          }
        />
      </div>
    </div>
  );
}

function ProfileTaskNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Profile task template</FieldLabel>
        <SelectInput value={(settings as any).profileTaskTemplateId ?? ""} onChange={(event) => updateSettings((prev) => ({ ...prev, profileTaskTemplateId: event.target.value }))}>
          <option value="">Select template</option>
          {resources?.profileTaskTemplates.map((tpl) => (
            <option key={tpl.id} value={tpl.id}>
              {tpl.name}
            </option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}

function SurveyNodeConfig({ title, settings, resources, updateTitle, updateSettings, removeNode }: ConfigBaseProps) {
  return (
    <div className="space-y-4">
      <NodeHeader title={title} updateTitle={updateTitle} removeNode={removeNode} />
      <div className="space-y-2">
        <FieldLabel>Survey</FieldLabel>
        <SelectInput value={(settings as any).surveyId ?? ""} onChange={(event) => updateSettings((prev) => ({ ...prev, surveyId: event.target.value }))}>
          <option value="">Select survey</option>
          {resources?.surveys.map((survey) => (
            <option key={survey.id} value={survey.id}>
              {survey.name}
            </option>
          ))}
        </SelectInput>
      </div>
    </div>
  );
}

interface ConditionNodeConfigProps {
  settings: Record<string, any>;
  resources: WorkflowResources | null;
  edges: Edge[];
  updateSettings: (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => void;
  updateEdgeLabel: (edgeId: string, label: "true" | "false" | null) => void;
  removeNode: () => void;
}

function ConditionNodeConfig({ settings, resources, edges, updateSettings, updateEdgeLabel, removeNode }: ConditionNodeConfigProps) {
  const logic: "ALL" | "ANY" = settings.logic ?? "ALL";
  const criteria: Array<{ field: ConditionField; op: ConditionOperator; valueId: string }>
    = settings.criteria ?? [];

  const addCriterion = () => {
    updateSettings((prev) => ({
      ...prev,
      criteria: [...((prev as any).criteria ?? []), { field: "department", op: "IS", valueId: "" }],
    }));
  };

  const updateCriterion = (index: number, patch: Partial<{ field: ConditionField; op: ConditionOperator; valueId: string }>) => {
    const next = criteria.map((item, idx) => (idx === index ? { ...item, ...patch } : item));
    updateSettings((prev) => ({ ...prev, criteria: next }));
  };

  const removeCriterion = (index: number) => {
    const next = criteria.filter((_, idx) => idx !== index);
    updateSettings((prev) => ({ ...prev, criteria: next }));
  };

  const setLogic = (value: "ALL" | "ANY") => {
    updateSettings((prev) => ({ ...prev, logic: value }));
  };

  const optionsForField = (field: ConditionField): Array<{ id: string; name: string }> => {
    switch (field) {
      case "department":
        return (resources?.departments ?? []).map((d) => ({ id: (d as any).id, name: d.name }));
      case "location":
        return (resources?.locations ?? []).map((l) => ({ id: (l as any).id, name: l.name }));
      case "position":
        return (resources?.positions ?? []).map((p) => ({ id: (p as any).id, name: (p as any).title ?? (p as any).name }));
      case "manager":
        return (resources?.users ?? []).map((u) => ({ id: (u as any).id, name: `${u.givenName} ${u.familyName}` }));
      case "legal_entity":
        return (resources?.legalEntities ?? []).map((e) => ({ id: (e as any).id, name: e.name }));
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <FieldLabel>Logic</FieldLabel>
        <SelectInput value={logic} onChange={(e) => setLogic(e.target.value as "ALL" | "ANY")}>
          <option value="ALL">All criteria must match</option>
          <option value="ANY">Any criterion may match</option>
        </SelectInput>
      </div>

      <div className="space-y-4">
        {criteria.length === 0 && (
          <p className="text-sm text-slate-500">No conditions yet. Add your first rule.</p>
        )}
        {criteria.map((c, idx) => {
          const valueOptions = optionsForField(c.field);
          return (
            <div key={idx} className="rounded-md border border-slate-200 p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <SelectInput value={c.field} onChange={(e) => updateCriterion(idx, { field: e.target.value as ConditionField, valueId: "" })}>
                  {CONDITION_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </SelectInput>
                <SelectInput value={c.op} onChange={(e) => updateCriterion(idx, { op: e.target.value as ConditionOperator })}>
                  {CONDITION_OPERATORS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </SelectInput>
                <SelectInput value={c.valueId} onChange={(e) => updateCriterion(idx, { valueId: e.target.value })}>
                  <option value="">Select value</option>
                  {valueOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                  ))}
                </SelectInput>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => removeCriterion(idx)}>Remove</Button>
              </div>
            </div>
          );
        })}
        <Button variant="secondary" onClick={addCriterion}>Add condition</Button>
      </div>

      <div className="space-y-2">
        <FieldLabel>Branch labels</FieldLabel>
        {edges.length === 0 && <p className="text-sm text-slate-500">Connect this condition to two nodes and label one as “true” and the other “false”.</p>}
        {edges.map((e) => (
          <div key={e.id} className="grid grid-cols-[1fr_auto] items-center gap-2">
            <span className="text-sm text-slate-700 truncate">{e.target}</span>
            <SelectInput value={(e.data as any)?.label ?? e.label ?? ""} onChange={(ev) => updateEdgeLabel(e.id, (ev.target.value || null) as any)}>
              <option value="">Unlabelled</option>
              <option value="true">true</option>
              <option value="false">false</option>
            </SelectInput>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={removeNode}>Remove step</Button>
      </div>
    </div>
  );  // ← closes the return

}     // ← add this to close ConditionNodeConfig

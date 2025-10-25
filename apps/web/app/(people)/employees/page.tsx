import { Card } from '@workright/ui';
import Link from 'next/link';
import { sampleEmployees, type Employee } from '../../../lib/sample-data';

type TreeNode = Employee & { children: TreeNode[] };

function buildOrgRoots(employees: Employee[]): TreeNode[] {
  const byManager = new Map<string, Employee[]>();
  const byId = new Map(employees.map((e) => [e.id, e] as const));
  employees.forEach((e) => {
    if (e.managerId) {
      if (!byManager.has(e.managerId)) byManager.set(e.managerId, []);
      byManager.get(e.managerId)!.push(e);
    }
  });
  const roots = employees.filter((e) => !e.managerId);
  function attach(e: Employee): TreeNode {
    const kids = byManager.get(e.id) ?? [];
    return { ...e, children: kids.map(attach) };
  }
  return roots.map(attach);
}

function Node({ node }: { node: TreeNode }) {
  return (
    <li>
      <Card className="p-4">
        <Link href={`/employees/${node.id}`} className="font-medium text-brand hover:underline">
          {node.name}
        </Link>
        <p className="text-sm text-slate-600">{node.role} · {node.department}</p>
        {node.dottedLineManagerId && (
          <p className="text-xs text-slate-500">Dotted line to {sampleEmployees.find((e) => e.id === node.dottedLineManagerId)?.name}</p>
        )}
      </Card>
      {node.children.length > 0 && (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {node.children.map((child) => (
            <Node key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function EmployeesPage() {
  return (
    <div className="space-y-6" aria-label="Employee directory (org structure)">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">People directory</h1>
        <p className="text-slate-600">Org structure generated from manager assignments.</p>
      </header>

      <ul className="space-y-6">
        {buildOrgRoots(sampleEmployees).map((root) => (
          <Node key={root.id} node={root} />
        ))}
      </ul>
    </div>
  );
}

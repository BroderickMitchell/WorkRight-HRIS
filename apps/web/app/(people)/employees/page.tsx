import { Card } from '@workright/ui';
import Link from 'next/link';
import { fetchEmployees, type DirectoryEmployee } from '@/lib/directory';

type TreeNode = DirectoryEmployee & { children: TreeNode[] };

function buildOrgRoots(employees: DirectoryEmployee[]): TreeNode[] {
  if (employees.length === 0) return [];
  const byManager = new Map<string, DirectoryEmployee[]>();
  employees.forEach((emp) => {
    const managerId = emp.managerId ?? emp.manager?.id ?? null;
    if (managerId) {
      if (!byManager.has(managerId)) byManager.set(managerId, []);
      byManager.get(managerId)!.push(emp);
    }
  });
  const roots = employees.filter((e) => {
    const managerId = e.managerId ?? e.manager?.id ?? null;
    return !managerId;
  });

  function attach(emp: DirectoryEmployee): TreeNode {
    const kids = byManager.get(emp.id) ?? [];
    return { ...emp, children: kids.map(attach) };
  }

  return roots.map(attach);
}

function displayName(emp: Pick<DirectoryEmployee, 'givenName' | 'familyName' | 'email'>) {
  const parts = [emp.givenName, emp.familyName].filter(Boolean);
  return parts.length ? parts.join(' ') : emp.email;
}

function Node({ node }: { node: TreeNode }) {
  return (
    <li>
      <Card className="p-4">
        <Link href={`/employees/${node.id}`} className="font-medium text-brand hover:underline">
          {displayName(node)}
        </Link>
        <p className="text-sm text-slate-600">
          {node.position?.title ?? 'Unknown role'}
          {node.department?.name ? ` • ${node.department?.name}` : ''}
        </p>
      </Card>
      {node.children.length > 0 && (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {node.children.map((child: TreeNode) => (
            <Node key={child.id} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default async function EmployeesPage() {
  const employees = await fetchEmployees();
  const roots = buildOrgRoots(employees);

  return (
    <div className="space-y-6" aria-label="Employee directory (org structure)">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">People directory</h1>
        <p className="text-slate-600">Org structure generated from manager assignments.</p>
      </header>

      {roots.length === 0 ? (
        <p className="text-sm text-slate-500">No employees found for this tenant.</p>
      ) : (
        <ul className="space-y-6">
          {roots.map((root) => (
            <Node key={root.id} node={root} />
          ))}
        </ul>
      )}
    </div>
  );
}



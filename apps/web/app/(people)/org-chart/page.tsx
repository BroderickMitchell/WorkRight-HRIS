import { sampleOrg, type OrgNode as OrgNodeType } from '../../../lib/sample-data';

function OrgNode({ node }: { node: OrgNodeType }) {
  return (
    <li>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="font-medium text-slate-900">{node.name}</p>
        <p className="text-sm text-slate-600">{node.role}</p>
      </div>
      {node.children && node.children.length > 0 && (
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {node.children.map((child) => (
            <OrgNode key={child.name} node={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function OrgChartPage() {
  return (
    <div className="space-y-6" aria-label="Organisation chart">
      <header>
        <h1 className="text-3xl font-semibold text-slate-900">Org chart</h1>
        <p className="text-slate-600">Visualise reporting lines and plan workforce moves.</p>
      </header>
      <ul className="space-y-6">
        <OrgNode node={sampleOrg} />
      </ul>
    </div>
  );
}

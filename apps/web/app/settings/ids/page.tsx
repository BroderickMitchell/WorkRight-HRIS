"use client";
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@workright/ui';
import { apiFetch, apiPost } from '../../../lib/api';

type Counter = { departmentId: string; department: string; prefix: string; width: number; hyphenStyle: boolean; nextNumber: number };

export default function PositionIdSettingsPage() {
  const [rows, setRows] = useState<Counter[]>([]);
  async function load() {
    try { setRows(await apiFetch<any[]>(`/v1/admin/position_id_settings`, { roles: 'HR_ADMIN' })); } catch { setRows([]); }
  }
  useEffect(() => { load(); }, []);
  async function update(idx: number, patch: Partial<{ width: number; hyphenStyle: boolean }>) {
    const c = rows[idx];
    const body: any = {};
    if (patch.width != null) body.width = patch.width;
    if (patch.hyphenStyle != null) body.hyphenStyle = patch.hyphenStyle;
    await apiPost(`/v1/admin/position_id_settings/${c.departmentId}`, body, { roles: 'HR_ADMIN' });
    await load();
  }
  return (
    <div className="space-y-6" aria-label="Position ID settings">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Position ID settings</h1>
        <p className="text-slate-600">Configure ID width and hyphen style per department.</p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Departments</CardTitle>
            <CardDescription>Changes apply to newly reserved IDs.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No departments found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-600">
                    <th className="py-2 pr-4">Department</th>
                    <th className="py-2 pr-4">Prefix</th>
                    <th className="py-2 pr-4">Width</th>
                    <th className="py-2 pr-4">Hyphen</th>
                    <th className="py-2 pr-4">Next</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((c, idx) => (
                    <tr key={c.departmentId}>
                      <td className="py-2 pr-4">{c.department}</td>
                      <td className="py-2 pr-4">{c.prefix}</td>
                      <td className="py-2 pr-4">
                        <input type="number" min={2} max={6} value={c.width} onChange={(e) => update(idx, { width: Number(e.target.value) })} className="w-20 rounded border border-slate-300 px-2 py-1" />
                      </td>
                      <td className="py-2 pr-4">
                        <input type="checkbox" checked={c.hyphenStyle} onChange={(e) => update(idx, { hyphenStyle: e.target.checked })} />
                      </td>
                      <td className="py-2 pr-4">{c.nextNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}


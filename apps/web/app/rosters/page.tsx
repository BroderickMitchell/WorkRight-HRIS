"use client";
import { useEffect, useMemo, useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, Button } from '@workright/ui';
import { apiFetch } from '../../lib/api';

type ShiftVm = { id: string; employeeId: string; date: string; shiftType: string };

function getMonthRange(d: Date) {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from: first.toISOString().slice(0,10), to: last.toISOString().slice(0,10) };
}

export default function RostersPage() {
  const [when, setWhen] = useState(new Date());
  const [shifts, setShifts] = useState<ShiftVm[]>([]);
  const { from, to } = useMemo(() => getMonthRange(when), [when]);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<ShiftVm[]>(`/v1/rosters/shifts?from=${from}&to=${to}&employeeId=emp-2`);
      setShifts(data);
    } catch {
      // Fallback sample: alternating D/R pattern
      const f = new Date(from);
      const t = new Date(to);
      const sample: ShiftVm[] = [];
      let on = true;
      for (let d = new Date(f); d <= t; d.setDate(d.getDate()+1)) {
        sample.push({ id: `${d.toISOString()}`, employeeId: 'emp-2', date: d.toISOString().slice(0,10), shiftType: on ? 'DAY' : 'REST' });
        on = !on;
      }
      setShifts(sample);
    }
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  const days = useMemo(() => {
    const arr: { date: Date; key: string }[] = [];
    const start = new Date(from);
    const end = new Date(to);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push({ date: new Date(d), key: d.toISOString() });
    }
    return arr;
  }, [from, to]);

  return (
    <div className="space-y-6" aria-label="Rosters">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-slate-900">Rosters</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setWhen(new Date(when.getFullYear(), when.getMonth()-1, 1))} data-testid="prev-month">Prev</Button>
          <Button variant="secondary" onClick={() => setWhen(new Date(when.getFullYear(), when.getMonth()+1, 1))} data-testid="next-month">Next</Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{when.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-7 gap-2 p-6 pt-0" role="grid">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
            <div key={d} className="text-xs font-medium text-slate-500" role="columnheader">{d}</div>
          ))}
          {days.map(({date, key}) => {
            const iso = key.slice(0,10);
            const s = shifts.find((x) => x.date === iso);
            const isRest = s?.shiftType === 'REST';
            return (
              <div key={key} className={`h-24 rounded-lg border p-2 text-sm ${isRest ? 'bg-slate-50' : 'bg-brand/5'}`} data-testid={`day-${iso}`}>
                <div className="text-xs text-slate-500">{date.getDate()}</div>
                <div className={`mt-2 inline-block rounded px-2 py-1 text-xs ${isRest ? 'bg-slate-100 text-slate-600' : 'bg-brand/20 text-brand'}`}>{s?.shiftType ?? '-'}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

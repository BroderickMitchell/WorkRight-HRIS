"use client";
import { useEffect, useCallback, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { apiFetch, apiPost } from '../../lib/api';

type FlightBookingVm = { id: string; flight: { carrier: string; flightNumber: string; depAirport: string; arrAirport: string }; depTime: string; arrTime: string };

export default function TravelPage() {
  const [employeeId, setEmployeeId] = useState('emp-2');
  const [locationId, setLocationId] = useState('loc-karratha');
  const [start, setStart] = useState('2024-11-04');
  const [end, setEnd] = useState('2024-11-12');
  const [manifestDate, setManifestDate] = useState('2024-11-04');
  const [manifest, setManifest] = useState<FlightBookingVm[]>([]);

  async function plan() {
    await apiPost(`/v1/travel/plan`, { employeeId, locationId, swingDates: [start, end] }, { roles: 'HR_ADMIN,MANAGER' });
    alert('Travel planned');
  }

  const loadManifest = useCallback(async () => {
    try {
      const data = await apiFetch<FlightBookingVm[]>(`/v1/travel/manifests?date=${manifestDate}`);
      setManifest(data);
    } catch {
      setManifest([]);
    }
  }, [manifestDate]);

  useEffect(() => { loadManifest(); }, [loadManifest]);

  async function seedDemo() {
    const body = await apiPost(`/v1/admin/seed-mining`, {}, {});
    try { localStorage.setItem('tenantId', JSON.stringify('tenant-demo')); } catch {}
    alert(`Seeded demo data for tenant ${body.tenantId ?? 'tenant-demo'}`);
  }

  return (
    <div className="space-y-6" aria-label="Travel & accommodation">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Travel & accommodation</h1>
        <p className="text-slate-600">Plan swings and view flight manifests.</p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Demo data</CardTitle>
            <CardDescription>Seed example tenant, employee, roster, travel and accommodation.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          <Button variant="secondary" onClick={seedDemo}>Seed demo data</Button>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Plan travel for swing</CardTitle>
            <CardDescription>Creates flight bookings and accommodation for the swing period.</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 p-6 pt-0 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Employee ID</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Location ID</label>
            <input className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={locationId} onChange={(e) => setLocationId(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Start</label>
            <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">End</label>
            <input type="date" className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <div className="md:col-span-2 text-right">
            <Button onClick={plan}>Plan travel</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Manifests</CardTitle>
            <CardDescription>Departing flights for selected date.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0">
          <div className="mb-4 flex items-center gap-2">
            <input type="date" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={manifestDate} onChange={(e) => setManifestDate(e.target.value)} />
            <Button variant="secondary" onClick={loadManifest}>Refresh</Button>
          </div>
          {manifest.length === 0 ? (
            <p className="text-sm text-slate-500">No flights found.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {manifest.map((m) => (
                <li key={m.id} className="py-3">
                  <p className="font-medium text-slate-900">{m.flight.carrier} {m.flight.flightNumber} {m.flight.depAirport} {'->'} {m.flight.arrAirport}</p>
                  <p className="text-sm text-slate-600">Dep {new Date(m.depTime).toLocaleString()} {'->'} Arr {new Date(m.arrTime).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

"use client";
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@workright/ui';
import { apiFetch } from '../../lib/api';

type RoomOcc = { roomId: string; room: string; occupied: number; capacity: number };

export default function AccommodationPage() {
  const [locationId, setLocationId] = useState('loc-karratha');
  const [date, setDate] = useState('2024-11-06');
  const [rows, setRows] = useState<RoomOcc[]>([]);

  async function load() {
    try {
      const data = await apiFetch<RoomOcc[]>(`/v1/accom/occupancy?locationId=${locationId}&date=${date}`);
      setRows(data);
    } catch {
      setRows([]);
    }
  }

  return (
    <div className="space-y-6" aria-label="Accommodation occupancy">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold text-slate-900">Accommodation</h1>
        <p className="text-slate-600">Room occupancy by site and date.</p>
      </header>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Site occupancy</CardTitle>
            <CardDescription>Shows bed usage across rooms for the selected date.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex items-center gap-2 p-6 pt-0">
          <input className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={locationId} onChange={(e) => setLocationId(e.target.value)} />
          <input type="date" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          <Button variant="secondary" onClick={load}>Load</Button>
        </div>
        <div className="p-6 pt-0">
          {rows.length === 0 ? (
            <p className="text-sm text-slate-500">No rooms or bookings.</p>
          ) : (
            <ul className="grid gap-3 md:grid-cols-2">
              {rows.map((r) => (
                <li key={r.roomId} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{r.room}</p>
                    <Badge>{r.occupied}/{r.capacity} occupied</Badge>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}

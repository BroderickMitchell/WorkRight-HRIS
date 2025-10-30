"use client";

import { useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import {
  Badge,
  Button,
  DataTable,
  EmptyState,
  FormShell,
  Modal,
  PageActions,
  Toolbar
} from '@workright/ui';
import type { Density } from '@workright/ui';
import { getItem, setItem } from '../../lib/store';

export interface LeaveListItem {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  leaveType?: { name: string } | null;
  employee: { id: string; givenName: string; familyName: string };
}

const DENSITY_KEY = 'leave-density';

interface LeaveTableProps {
  requests: LeaveListItem[];
}

interface ApplyLeaveForm {
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export function LeaveTable({ requests }: LeaveTableProps) {
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState<Density>(() => getItem<Density>(DENSITY_KEY, 'comfortable'));
  const [applyOpen, setApplyOpen] = useState(false);
  const form = useForm<ApplyLeaveForm>({
    defaultValues: {
      employeeId: '',
      leaveType: 'Annual Leave',
      startDate: '',
      endDate: ''
    }
  });

  const filtered = useMemo(() => {
    if (!search) return requests;
    const query = search.toLowerCase();
    return requests.filter((request) => {
      const name = `${request.employee.givenName} ${request.employee.familyName}`.toLowerCase();
      return (
        name.includes(query) ||
        (request.leaveType?.name?.toLowerCase().includes(query) ?? false) ||
        request.status.toLowerCase().includes(query)
      );
    });
  }, [requests, search]);

  const columns = useMemo<ColumnDef<LeaveListItem>[]>(
    () => [
      {
        header: 'Employee',
        accessorKey: 'employee',
        cell: ({ row }) => {
          const employee = row.original.employee;
          return (
            <div>
              <p className="font-medium text-foreground">{employee.givenName} {employee.familyName}</p>
              <p className="text-xs text-muted-foreground">{row.original.leaveType?.name ?? 'Leave'}</p>
            </div>
          );
        }
      },
      {
        header: 'Period',
        accessorKey: 'startDate',
        cell: ({ row }) => formatRange(row.original)
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <Badge className="bg-primary/10 text-primary">{row.original.status}</Badge>
      },
      {
        header: 'Actions',
        cell: () => (
          <div className="flex gap-2">
            <Button size="sm">Approve</Button>
            <Button size="sm" variant="ghost">
              Decline
            </Button>
          </div>
        )
      }
    ],
    []
  );

  const onSubmit = form.handleSubmit((data) => {
    console.log('Apply leave', data);
    setApplyOpen(false);
    form.reset();
  });

  return (
    <div className="space-y-4">
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requests"
        density={density}
        onDensityChange={(value) => {
          setDensity(value);
          setItem(DENSITY_KEY, value);
        }}
        actions={
          <PageActions>
            <Button variant="ghost" size="sm" onClick={() => setApplyOpen(true)}>
              Apply leave
            </Button>
          </PageActions>
        }
      />
      <DataTable
        data={filtered}
        columns={columns}
        emptyState={<EmptyState title="No leave requests" description="Everything is up to date." />}
      />
      <Modal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        title="Apply leave"
        description="Capture an ad-hoc leave request."
      >
        <FormShell
          title="Request details"
          description="All submissions follow local policy and route to the right approvers."
          onSubmit={onSubmit}
          footer={
            <>
              <Button type="button" variant="ghost" onClick={() => setApplyOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit request</Button>
            </>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Employee ID</span>
              <input
                {...form.register('employeeId', { required: true })}
                className="h-11 rounded-lg border border-border bg-panel px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="emp-123"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Leave type</span>
              <input
                {...form.register('leaveType', { required: true })}
                className="h-11 rounded-lg border border-border bg-panel px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">Start date</span>
              <input
                type="date"
                {...form.register('startDate', { required: true })}
                className="h-11 rounded-lg border border-border bg-panel px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-muted-foreground">End date</span>
              <input
                type="date"
                {...form.register('endDate', { required: true })}
                className="h-11 rounded-lg border border-border bg-panel px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            <span className="text-muted-foreground">Notes</span>
            <textarea
              {...form.register('notes')}
              className="min-h-[120px] rounded-lg border border-border bg-panel px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </FormShell>
      </Modal>
    </div>
  );
}

function formatRange(item: LeaveListItem) {
  const fmt = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' });
  return `${fmt.format(new Date(item.startDate))} – ${fmt.format(new Date(item.endDate))}`;
}

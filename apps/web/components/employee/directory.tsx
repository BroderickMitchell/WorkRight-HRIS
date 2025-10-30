"use client";

import { useEffect, useMemo, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Button, DataTable, Drawer, EmptyState, PageActions, SplitPane, Toolbar } from '@workright/ui';
import type { Density } from '@workright/ui';
import Link from 'next/link';
import { DirectoryEmployee } from '../../lib/directory';
import { getItem, setItem } from '../../lib/store';

const DENSITY_KEY = 'employees-density';

interface EmployeesDirectoryProps {
  employees: DirectoryEmployee[];
}

export function EmployeesDirectory({ employees }: EmployeesDirectoryProps) {
  const [search, setSearch] = useState('');
  const [density, setDensity] = useState<Density>(() => getItem<Density>(DENSITY_KEY, 'comfortable'));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  useEffect(() => {
    setItem(DENSITY_KEY, density);
  }, [density]);

  const filtered = useMemo(() => {
    if (!search) return employees;
    const query = search.toLowerCase();
    return employees.filter((employee) => {
      const name = `${employee.givenName ?? ''} ${employee.familyName ?? ''}`.trim();
      return (
        name.toLowerCase().includes(query) ||
        (employee.email?.toLowerCase().includes(query) ?? false) ||
        (employee.position?.title?.toLowerCase().includes(query) ?? false) ||
        (employee.department?.name?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [employees, search]);

  const columns = useMemo<ColumnDef<DirectoryEmployee>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'givenName',
        cell: ({ row }) => {
          const employee = row.original;
          const name = formatName(employee);
          return (
            <div className="space-y-1">
              <p className="font-medium text-foreground">{name}</p>
              <p className="text-xs text-muted-foreground">{employee.email}</p>
            </div>
          );
        }
      },
      {
        header: 'Job',
        accessorKey: 'position.title',
        cell: ({ row }) => row.original.position?.title ?? '—'
      },
      {
        header: 'Location',
        accessorKey: 'location.name',
        cell: ({ row }) => row.original.location?.name ?? '—'
      },
      {
        header: 'Status',
        cell: () => <Badge className="bg-success/15 text-success">Active</Badge>
      },
      {
        header: 'Manager',
        accessorKey: 'manager',
        cell: ({ row }) => formatName(row.original.manager)
      },
      {
        header: 'Start date',
        cell: () => '—'
      }
    ],
    []
  );

  const selectedEmployee = filtered.find((employee) => employee.id === selectedId) ?? null;

  const list = (
    <div className="space-y-4">
      <Toolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search employees"
        density={density}
        onDensityChange={setDensity}
        actions={
          <PageActions>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/employees?create=employee">New employee</Link>
            </Button>
          </PageActions>
        }
      />
      <DataTable
        data={filtered}
        columns={columns}
        onRowClick={(employee) => {
          setSelectedId(employee.id);
          if (!isDesktop) {
            setDrawerOpen(true);
          }
        }}
        emptyState={
          <EmptyState
            title="No employees found"
            description="Try adjusting filters or creating a new employee record."
            action={
              <Button asChild>
                <Link href="/employees?create=employee">Create employee</Link>
              </Button>
            }
          />
        }
      />
    </div>
  );

  const detail = selectedEmployee ? (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{formatName(selectedEmployee)}</h2>
          <p className="text-sm text-muted-foreground">
            {selectedEmployee.position?.title ?? 'Role not captured'} · {selectedEmployee.department?.name ?? 'Unassigned'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{selectedEmployee.email}</span>
          {selectedEmployee.manager ? <span>Manager: {formatName(selectedEmployee.manager)}</span> : null}
        </div>
        <Button size="sm" asChild>
          <Link href={`/employees/${selectedEmployee.id}`}>Open profile</Link>
        </Button>
      </header>
      <section className="space-y-2 text-sm">
        <p className="text-muted-foreground">Location</p>
        <p className="font-medium text-foreground">{selectedEmployee.location?.name ?? 'Not recorded'}</p>
      </section>
      <section className="space-y-2 text-sm">
        <p className="text-muted-foreground">Department</p>
        <p className="font-medium text-foreground">{selectedEmployee.department?.name ?? 'Not recorded'}</p>
      </section>
    </div>
  ) : (
    <EmptyState
      title="Select a team member"
      description="Choose a person from the directory to review their profile and take action."
    />
  );

  return (
    <div className="flex h-full flex-col gap-6">
      <SplitPane
        list={list}
        detail={detail}
        collapsible
        initiallyCollapsed={!isDesktop}
        onCollapsedChange={(value) => {
          if (value) {
            setDrawerOpen(false);
          }
        }}
      />
      <Drawer
        open={!isDesktop && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedEmployee ? formatName(selectedEmployee) : 'Employee detail'}
        description={selectedEmployee?.position?.title ?? ''}
      >
        {detail}
      </Drawer>
    </div>
  );
}

function formatName(person?: { givenName?: string | null; familyName?: string | null; email?: string | null } | null) {
  if (!person) return '—';
  const parts = [person.givenName, person.familyName].filter(Boolean);
  if (parts.length === 0) return person.email ?? '—';
  return parts.join(' ');
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined;
    }

    const mediaQueryList = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }

    mediaQueryList.addListener(handleChange);
    return () => mediaQueryList.removeListener(handleChange);
  }, [query]);

  return matches;
}

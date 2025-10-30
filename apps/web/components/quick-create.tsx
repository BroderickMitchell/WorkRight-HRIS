"use client";

import { Menu } from '@headlessui/react';
import { Plus, UserPlus, Briefcase, PlaneTakeoff, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import { Button, cn } from '@workright/ui';

export type QuickCreateAction = {
  id: 'employee' | 'job' | 'leave' | 'workflow';
  label: string;
  description: string;
  icon: ReactNode;
  href: string;
};

const QUICK_ACTIONS: QuickCreateAction[] = [
  {
    id: 'employee',
    label: 'New Employee',
    description: 'Create a worker profile and onboarding pack',
    icon: <UserPlus className="h-4 w-4" aria-hidden />,
    href: '/employees?create=employee'
  },
  {
    id: 'job',
    label: 'Job Requisition',
    description: 'Start a requisition for a new role',
    icon: <Briefcase className="h-4 w-4" aria-hidden />,
    href: '/jobs?create=requisition'
  },
  {
    id: 'leave',
    label: 'Leave Request',
    description: 'Log planned or unscheduled leave',
    icon: <PlaneTakeoff className="h-4 w-4" aria-hidden />,
    href: '/leave?create=request'
  },
  {
    id: 'workflow',
    label: 'Workflow Instance',
    description: 'Kick off an onboarding, change or compliance workflow',
    icon: <Workflow className="h-4 w-4" aria-hidden />,
    href: '/workflows/instances?create=workflow'
  }
];

interface QuickCreateProps {
  onAction?: (action: QuickCreateAction) => void;
}

export function QuickCreate({ onAction }: QuickCreateProps) {
  const router = useRouter();
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button as={Button} size="md" variant="primary" className="gap-2">
        <Plus className="h-4 w-4" aria-hidden />
        Create
      </Menu.Button>
      <Menu.Items className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-border bg-panel p-2 shadow-xl focus:outline-none">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick create</p>
        {QUICK_ACTIONS.map((action) => (
          <Menu.Item key={action.id}>
            {({ active }) => (
              <button
                type="button"
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-primary/10 text-primary' : 'text-foreground'
                )}
                onClick={() => {
                  onAction?.(action);
                  router.push(action.href);
                }}
              >
                <span className="mt-0.5 text-muted-foreground">{action.icon}</span>
                <span className="flex-1">
                  <span className="block font-medium">{action.label}</span>
                  <span className="block text-xs text-muted-foreground">{action.description}</span>
                </span>
              </button>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}

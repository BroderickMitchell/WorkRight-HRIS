"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@workright/ui';

type Tab = { href: string; label: string };

export function EmployeeProfileTabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Employee profile sections">
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              active
                ? 'border-primary bg-primary/15 text-primary shadow-sm'
                : 'border-transparent bg-panel text-muted-foreground hover:border-border hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

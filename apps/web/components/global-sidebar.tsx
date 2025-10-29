'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavSection, resolveIcon } from '../lib/navigation';
import { cn } from '@workright/ui';

interface GlobalSidebarProps {
  sections: NavSection[];
  tenantName: string;
  tenantTagline?: string;
  onNavigate?: () => void;
}

export function GlobalSidebar({ sections, tenantName, tenantTagline, onNavigate }: GlobalSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-panel/95 backdrop-blur supports-[backdrop-filter]:bg-panel/80">
      <div className="flex items-center gap-3 px-6 py-5">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-primary/10"
          aria-hidden
        >
          <span className="text-sm font-semibold text-primary">WR</span>
        </div>
        <div className="flex flex-1 flex-col">
          <span className="text-sm font-semibold text-foreground">{tenantName}</span>
          {tenantTagline ? (
            <span className="text-xs text-muted-foreground">{tenantTagline}</span>
          ) : null}
        </div>
      </div>
      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-2 py-4 text-sm">
        <ul className="space-y-2">
          {sections.map((section) => {
            const Icon = resolveIcon(section.icon);
            const isSectionActive = section.items.some((item) => isActive(pathname, item.href));
            return (
              <li key={section.id}>
                <Disclosure defaultOpen={isSectionActive}>
                  {({ open }) => (
                    <div className="rounded-xl bg-transparent">
                      <Disclosure.Button
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-primary/10 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span className="flex items-center gap-2">
                          {Icon ? <Icon className="h-4 w-4" aria-hidden /> : null}
                          {section.label}
                        </span>
                        <ChevronDown
                          className={cn('h-4 w-4 transition', open ? 'rotate-180 text-primary' : 'text-muted-foreground')}
                          aria-hidden
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel>
                        <ul className="mt-1 space-y-1">
                          {section.items.map((item) => {
                            const active = isActive(pathname, item.href);
                            const ItemIcon = item.icon ? resolveIcon(item.icon) : null;
                            return (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  onClick={onNavigate}
                                  className={cn(
                                    'group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                    active
                                      ? 'bg-primary/15 text-primary shadow-sm'
                                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                  )}
                                >
                                  {ItemIcon ? (
                                    <ItemIcon className={cn('h-4 w-4 flex-none', active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} aria-hidden />
                                  ) : null}
                                  <span className="truncate">{item.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </Disclosure.Panel>
                    </div>
                  )}
                </Disclosure>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-6 pb-6">
        <div className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Need support?</p>
          <p>Visit the knowledge hub or lodge a ticket.</p>
        </div>
      </div>
    </aside>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (pathname === href) return true;
  return pathname.startsWith(`${href}/`);
}

'use client';

import { Menu as HeadlessMenu } from '@headlessui/react';
import {
  Bell,
  ChevronDown,
  LifeBuoy,
  Menu,
  Moon,
  Sun,
  UserCircle2
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';
import { Button, cn } from '@workright/ui';
import { GlobalSearch } from './global-search';
import { InboxDrawer } from './inbox-drawer';
import { QuickCreate, QuickCreateAction } from './quick-create';

interface GlobalHeaderProps {
  tenantName: string;
  userName?: string;
  onOpenSidebar?: () => void;
  onQuickAction?: (action: QuickCreateAction) => void;
}

export function GlobalHeader({ tenantName, userName = 'Alex Admin', onOpenSidebar, onQuickAction }: GlobalHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [inboxOpen, setInboxOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-panel/95 backdrop-blur supports-[backdrop-filter]:bg-panel/80">
      <div className="flex items-center gap-4 px-6 py-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <div className="hidden text-sm font-semibold text-muted-foreground md:block">{tenantName}</div>
        <div className="flex-1">
          <GlobalSearch />
        </div>
        <div className="flex items-center gap-2">
          <QuickCreate onAction={onQuickAction} />
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
            aria-label="Open approvals inbox"
            onClick={() => setInboxOpen(true)}
          >
            <Bell className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" aria-hidden /> : <Moon className="h-4 w-4" aria-hidden />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden h-10 w-10 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary lg:inline-flex"
            aria-label="Help centre"
          >
            <LifeBuoy className="h-4 w-4" aria-hidden />
          </Button>
          <UserMenu userName={userName} tenantName={tenantName} />
        </div>
      </div>
      <InboxDrawer open={inboxOpen} onClose={() => setInboxOpen(false)} />
    </header>
  );
}

function UserMenu({ userName, tenantName }: { userName: string; tenantName: string }) {
  return (
    <HeadlessMenu as="div" className="relative">
      <HeadlessMenu.Button className="flex items-center gap-2 rounded-full border border-border bg-panel px-2 py-1 text-sm text-foreground shadow-sm transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserCircle2 className="h-5 w-5" aria-hidden />
        </span>
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-sm font-medium">{userName}</span>
          <span className="block text-xs text-muted-foreground">{tenantName}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
      </HeadlessMenu.Button>
      <HeadlessMenu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl border border-border bg-panel p-2 shadow-xl focus:outline-none">
        <HeadlessMenu.Item>
          {({ active }) => (
            <a
              className={cn(
                'block rounded-lg px-3 py-2 text-sm',
                active ? 'bg-primary/10 text-primary' : 'text-foreground'
              )}
              href="/settings/profile"
            >
              View profile
            </a>
          )}
        </HeadlessMenu.Item>
        <HeadlessMenu.Item>
          {({ active }) => (
            <a
              className={cn(
                'block rounded-lg px-3 py-2 text-sm',
                active ? 'bg-primary/10 text-primary' : 'text-foreground'
              )}
              href="/settings"
            >
              Tenant settings
            </a>
          )}
        </HeadlessMenu.Item>
        <HeadlessMenu.Item>
          {({ active }) => (
            <button
              type="button"
              className={cn(
                'flex w-full rounded-lg px-3 py-2 text-left text-sm',
                active ? 'bg-primary/10 text-primary' : 'text-foreground'
              )}
            >
              Sign out
            </button>
          )}
        </HeadlessMenu.Item>
      </HeadlessMenu.Items>
    </HeadlessMenu>
  );
}

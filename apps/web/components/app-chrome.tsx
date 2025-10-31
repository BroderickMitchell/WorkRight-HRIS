'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, PropsWithChildren, useEffect, useState } from 'react';
import { NavSection } from '../lib/navigation';
import { GlobalHeader } from './global-header';
import { GlobalSidebar } from './global-sidebar';

interface AppChromeProps extends PropsWithChildren {
  sections: NavSection[];
  tenantName: string;
  tenantTagline?: string;
}

export function AppChrome({ children, sections, tenantName, tenantTagline }: AppChromeProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayTenant, setDisplayTenant] = useState<{ name: string; tagline?: string }>({
    name: tenantName,
    tagline: tenantTagline
  });

  useEffect(() => {
    const loadProfile = (raw?: string | null) => {
      try {
        const source = typeof raw === 'string' ? raw : localStorage.getItem('tenantProfile');
        if (!source) {
          setDisplayTenant({ name: tenantName, tagline: tenantTagline });
          return;
        }
        const parsed = JSON.parse(source) as Partial<{ name: string; tagline?: string }>;
        setDisplayTenant({
          name: parsed.name?.trim() || tenantName,
          tagline: parsed.tagline?.trim() || tenantTagline
        });
      } catch {
        setDisplayTenant({ name: tenantName, tagline: tenantTagline });
      }
    };

    loadProfile();

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'tenantProfile') {
        loadProfile(event.newValue);
      }
    };
    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<Partial<{ name: string; tagline?: string }>>).detail;
      if (detail) {
        setDisplayTenant({
          name: detail.name?.trim() || tenantName,
          tagline: detail.tagline?.trim() || tenantTagline
        });
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('tenantProfile:update', handleCustom as EventListener);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('tenantProfile:update', handleCustom as EventListener);
    };
  }, [tenantName, tenantTagline]);

  return (
    <div className="relative flex h-screen w-full flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="focus:not-sr-only sr-only absolute left-4 top-4 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Skip to content
      </a>
      <GlobalHeader tenantName={displayTenant.name} onOpenSidebar={() => setSidebarOpen(true)} />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 md:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/30" />
            </Transition.Child>
            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <GlobalSidebar
                    sections={sections}
                    tenantName={displayTenant.name}
                    tenantTagline={displayTenant.tagline}
                    onNavigate={() => setSidebarOpen(false)}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        <div className="hidden h-full w-72 flex-none md:flex">
          <GlobalSidebar
            sections={sections}
            tenantName={displayTenant.name}
            tenantTagline={displayTenant.tagline}
          />
        </div>
        <main id="main-content" className="flex-1 overflow-y-auto bg-background px-6 py-8 lg:px-10 lg:py-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

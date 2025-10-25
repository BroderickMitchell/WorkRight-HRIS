import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { QueryProvider } from '../components/query-provider';
import { ThemeProvider } from '../components/theme-provider';
import { getTenantSettings, hexToRgbString } from '../lib/tenant';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkRight HRIS',
  description: 'People platform for Australian organisations'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tenantSettings = getTenantSettings();
  return (
    <html lang={tenantSettings.locale} className="h-full">
      <body
        className={`${inter.className} min-h-full bg-slate-50 text-slate-900`}
        style={{
          // CSS variable used in Tailwind config for brand colour theming
          ['--tenant-primary' as string]: hexToRgbString(tenantSettings.brandingPrimaryColor)
        }}
      >
        <ThemeProvider>
          <QueryProvider>
            <div className="min-h-screen grid grid-cols-[240px_1fr]">
              <aside className="flex min-h-screen flex-col justify-between border-r bg-white p-6">
                <div>
                  <div className="mb-8 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand/20" aria-hidden />
                    <div>
                      <p className="font-semibold text-slate-900">WorkRight HRIS</p>
                      <p className="text-sm text-slate-500">Empowering Aussie teams</p>
                    </div>
                  </div>
                  <nav className="space-y-1 text-sm text-slate-700">
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/dashboard">
                      Dashboard
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/employees">
                      Directory
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/goals">
                      Performance
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/leave">
                      Leave
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/courses">
                      Learning
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/reports">
                      Reporting
                    </Link>
                    <Link className="block rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/org-chart">
                      Org chart
                    </Link>
                  </nav>
                </div>
                <p className="text-xs text-slate-400">v0.1.0</p>
              </aside>
              <main className="px-6 py-10">{children}</main>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

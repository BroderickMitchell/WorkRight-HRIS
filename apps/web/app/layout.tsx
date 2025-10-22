import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
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
            <div className="min-h-screen">
              <header className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-brand/20" aria-hidden />
                    <div>
                      <p className="font-semibold text-slate-900">WorkRight HRIS</p>
                      <p className="text-sm text-slate-500">Empowering Aussie teams</p>
                    </div>
                  </div>
                  <nav className="flex items-center gap-4 text-sm text-slate-600">
                    <a className="hover:text-brand" href="/dashboard">
                      Dashboard
                    </a>
                    <a className="hover:text-brand" href="/people/employees">
                      Directory
                    </a>
                    <a className="hover:text-brand" href="/performance/goals">
                      Performance
                    </a>
                    <a className="hover:text-brand" href="/leave">
                      Leave
                    </a>
                    <a className="hover:text-brand" href="/reports">
                      Reporting
                    </a>
                  </nav>
                </div>
              </header>
              <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

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
  const { brandLogoUrl, brandName, brandTagline } = tenantSettings;
  const brandInitial = brandName.charAt(0).toUpperCase();
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
              <header
                className="border-b border-slate-200 bg-white/95 backdrop-blur"
                style={{
                  borderColor: tenantSettings.brandingPrimaryColor
                    ? `rgba(${hexToRgbString(tenantSettings.brandingPrimaryColor)}, 0.35)`
                    : undefined
                }}
              >
                <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-4">
                  <a href="/dashboard" className="flex items-center gap-3" aria-label={`${brandName} home`}>
                    {brandLogoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brandLogoUrl}
                        alt={`${brandName} logo`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 text-lg font-semibold text-brand">
                        {brandInitial}
                      </div>
                    )}
                    <div className="leading-tight">
                      <p className="font-semibold text-slate-900">{brandName}</p>
                      <p className="text-sm text-slate-500">{brandTagline}</p>
                    </div>
                  </a>
                  <nav aria-label="Primary" className="flex flex-1 items-center gap-1 text-sm font-medium text-slate-600">
                    <a className="rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/dashboard">
                      Dashboard
                    </a>
                    <a className="rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/people/employees">
                      Directory
                    </a>
                    <a className="rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/performance/goals">
                      Performance
                    </a>
                    <a className="rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/leave">
                      Leave
                    </a>
                    <a className="rounded-md px-3 py-2 hover:bg-brand/10 hover:text-brand" href="/reports">
                      Reporting
                    </a>
                  </nav>
                  <form
                    role="search"
                    className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:border-brand/60 focus-within:ring-2 focus-within:ring-brand/40 md:flex"
                    action="/search"
                  >
                    <label htmlFor="global-search" className="sr-only">
                      Search people, positions, and features
                    </label>
                    <input
                      id="global-search"
                      type="search"
                      name="q"
                      placeholder="Search people, positions, features"
                      className="w-64 border-none bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                    />
                    <span className="text-xs uppercase text-slate-400">Enter</span>
                  </form>
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

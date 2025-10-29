import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '../components/query-provider';
import { ThemeProvider } from '../components/theme-provider';
import { BrandingProvider } from '../components/branding-provider';
import { AppChrome } from '../components/app-chrome';
import { getNavigationSections } from '../lib/navigation';
import { getTenantCssVariables, getTenantSettings } from '../lib/tenant';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'WorkRight HRIS',
  description: 'People platform for Australian organisations'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const tenantSettings = getTenantSettings();
  const sections = getNavigationSections(tenantSettings);
  const cssVariables = getTenantCssVariables(tenantSettings);

  return (
    <html lang={tenantSettings.locale} className="h-full" suppressHydrationWarning>
      <body className={`${inter.className}`} style={cssVariables}>
        <ThemeProvider>
          <QueryProvider>
            <BrandingProvider>
              <AppChrome
                sections={sections}
                tenantName={tenantSettings.tenantName}
                tenantTagline={tenantSettings.tenantTagline}
              >
                {children}
              </AppChrome>
            </BrandingProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams()
}));
import { render, screen } from '@testing-library/react';

// Stub fetch for client pages that use apiFetch/useEffect
beforeEach(() => {
  // default: JSON [] with 200 OK
  const mockFetch = vi.fn(async () =>
    new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  );
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App pages render', () => {
  it('Reports page renders heading', async () => {
    const { default: ReportsPage } = await import('../(reports)/reports/page');
    render(<ReportsPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Reporting/i })).toBeInTheDocument();
  });

  it('Payroll page renders heading', async () => {
    const { default: PayrollPage } = await import('../payroll/page');
    render(<PayrollPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Payroll/i })).toBeInTheDocument();
  });

  it('Settings page renders heading', async () => {
    const { default: SettingsPage } = await import('../settings/page');
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Branding/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('Tenant settings page exposes company fields', async () => {
    const { default: SettingsTenantPage } = await import('../settings/tenant/page');
    render(<SettingsTenantPage />);
    expect(screen.getByRole('heading', { level: 1, name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Support email/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo-ready data is preloaded/i)).toBeInTheDocument();
  });
});

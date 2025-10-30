import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams()
}));
import { render, screen } from '@testing-library/react';

// Stub fetch for client pages that use apiFetch/useEffect
beforeEach(() => {
  // default: JSON [] with 200 OK
  // @ts-expect-error partial fetch mock
  global.fetch = vi.fn(async () =>
    new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('App pages render', () => {
  it('Travel page renders heading', async () => {
    const { default: TravelPage } = await import('../travel/page');
    render(<TravelPage />);
    expect(screen.getByRole('heading', { name: /Travel & accommodation/i })).toBeInTheDocument();
  });

  it('Payroll page renders heading', async () => {
    const { default: PayrollPage } = await import('../payroll/page');
    render(<PayrollPage />);
    expect(screen.getByRole('heading', { name: /Payroll/i })).toBeInTheDocument();
  });

  it('Settings page renders heading', async () => {
    const { default: SettingsPage } = await import('../settings/page');
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();
  });

  it('Settings roster tab renders heading', async () => {
    const { default: SettingsRostersPage } = await import('../settings/rosters/page');
    render(<SettingsRostersPage />);
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Roster templates/i })).toHaveAttribute('aria-pressed', 'true');
  });
});


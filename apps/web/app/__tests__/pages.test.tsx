import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
  it('Travel page renders heading', () => {
    const TravelPage = require('../travel/page').default as () => JSX.Element;
    render(<TravelPage />);
    expect(screen.getByRole('heading', { name: /Travel & accommodation/i })).toBeInTheDocument();
  });

  it('Rosters page renders heading', () => {
    const RostersPage = require('../rosters/page').default as () => JSX.Element;
    render(<RostersPage />);
    expect(screen.getByRole('heading', { name: /Rosters/i })).toBeInTheDocument();
  });

  it('Payroll page renders heading', () => {
    const PayrollPage = require('../payroll/page').default as () => JSX.Element;
    render(<PayrollPage />);
    expect(screen.getByRole('heading', { name: /Payroll/i })).toBeInTheDocument();
  });

  it('Settings page renders heading', () => {
    const SettingsPage = require('../settings/page').default as () => JSX.Element;
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: /Settings/i })).toBeInTheDocument();
  });
});


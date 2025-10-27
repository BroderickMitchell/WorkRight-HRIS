import { describe, expect, it, vi } from 'vitest';
import { EmployeeProfileService } from './employee-profile.service.js';

class MockPrisma {}
class MockAudit { record = vi.fn(); }
class MockDocuments {}
class MockCls { get() { return undefined; } }

describe('EmployeeProfileService cost split validation', () => {
  const service = new EmployeeProfileService(
    new MockPrisma() as any,
    new MockAudit() as any,
    new MockDocuments() as any,
    new MockCls() as any
  );
  const validate = (service as any).validateCostSplits.bind(service) as (splits: any[]) => void;

  it('accepts non-overlapping splits within 100%', () => {
    expect(() =>
      validate([
        {
          costCodeId: 'A',
          percentage: 60,
          startDate: '2024-01-01',
          endDate: '2024-06-30'
        },
        {
          costCodeId: 'B',
          percentage: 40,
          startDate: '2024-01-01',
          endDate: null
        }
      ])
    ).not.toThrow();
  });

  it('rejects overlapping splits that exceed 100%', () => {
    expect(() =>
      validate([
        {
          costCodeId: 'A',
          percentage: 70,
          startDate: '2024-01-01',
          endDate: null
        },
        {
          costCodeId: 'B',
          percentage: 40,
          startDate: '2024-03-01',
          endDate: null
        }
      ])
    ).toThrow(/exceed 100%/i);
  });

  it('rejects invalid date ranges', () => {
    expect(() =>
      validate([
        {
          costCodeId: 'A',
          percentage: 50,
          startDate: '2024-06-01',
          endDate: '2024-05-31'
        }
      ])
    ).toThrow(/end date must be after start date/i);
  });
});

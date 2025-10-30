import { describe, expect, it } from 'vitest';
import {
  employeeContactSchema,
  employeeProfileSchema
} from '../index';

describe('employeeContactSchema', () => {
  it('accepts a valid contact payload', () => {
    const result = employeeContactSchema.safeParse({
      workEmail: 'jane.doe@workright.com',
      personalEmail: 'jane@example.com',
      emergencyContacts: [
        {
          id: 'ec-1',
          name: 'John Doe',
          relationship: 'Spouse',
          phone: '555-555-0100',
          email: 'john@example.com'
        }
      ]
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.emergencyContacts).toHaveLength(1);
    }
  });

  it('rejects invalid emails', () => {
    const result = employeeContactSchema.safeParse({
      workEmail: 'not-an-email'
    });

    expect(result.success).toBe(false);
  });
});

describe('employeeProfileSchema', () => {
  it('parses a minimal employee profile', () => {
    const profile = {
      employee: {
        id: 'emp-1',
        legalName: {
          full: 'Jane Doe'
        },
        jobTitle: 'Software Engineer',
        status: 'ACTIVE',
        hireDate: '2024-01-01'
      },
      personal: {
        legalName: {
          first: 'Jane',
          last: 'Doe'
        },
        dateOfBirth: '1990-05-16',
        nationalIdentifiers: [
          {
            id: 'nid-1',
            type: 'SSN',
            country: 'US',
            value: '123-45-6789'
          }
        ]
      },
      contact: {
        workEmail: 'jane.doe@workright.com'
      },
      job: {
        jobTitle: 'Software Engineer',
        fte: 1,
        exempt: true,
        workerType: 'EMPLOYEE',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        hireDate: '2024-01-01'
      },
      compensation: {
        payGroup: 'Monthly',
        baseSalary: {
          amount: 120000,
          currency: 'USD',
          frequency: 'ANNUAL'
        },
        allowances: [],
        effectiveDate: '2024-01-01'
      },
      timeAndEligibility: {
        location: 'New York',
        timezone: 'America/New_York',
        workSchedule: 'Mon-Fri',
        overtimeEligible: false,
        exempt: true,
        benefitsEligible: true,
        leaveBalances: []
      },
      costSplits: [],
      history: [],
      documents: {
        generated: [],
        templates: []
      },
      permissions: {
        canEditPersonal: true,
        canEditJob: true,
        canEditCompensation: false,
        canManageCostSplits: false,
        canGenerateDocuments: true
      }
    };

    const result = employeeProfileSchema.safeParse(profile);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.employee.legalName.full).toBe('Jane Doe');
      expect(result.data.permissions.canGenerateDocuments).toBe(true);
    }
  });

  it('fails when status is invalid', () => {
    const result = employeeProfileSchema.safeParse({
      employee: {
        id: 'emp-1',
        legalName: {
          full: 'Jane Doe'
        },
        jobTitle: 'Software Engineer',
        status: 'UNKNOWN',
        hireDate: '2024-01-01'
      },
      personal: {
        legalName: {
          first: 'Jane',
          last: 'Doe'
        },
        dateOfBirth: '1990-05-16',
        nationalIdentifiers: [
          {
            id: 'nid-1',
            type: 'SSN',
            country: 'US',
            value: '123-45-6789'
          }
        ]
      },
      contact: {
        workEmail: 'jane.doe@workright.com'
      },
      job: {
        jobTitle: 'Software Engineer',
        fte: 1,
        exempt: true,
        workerType: 'EMPLOYEE',
        employmentType: 'FULL_TIME',
        status: 'ACTIVE',
        hireDate: '2024-01-01'
      },
      compensation: {
        payGroup: 'Monthly',
        baseSalary: {
          amount: 120000,
          currency: 'USD',
          frequency: 'ANNUAL'
        },
        allowances: [],
        effectiveDate: '2024-01-01'
      },
      timeAndEligibility: {
        location: 'New York',
        timezone: 'America/New_York',
        workSchedule: 'Mon-Fri',
        overtimeEligible: false,
        exempt: true,
        benefitsEligible: true,
        leaveBalances: []
      },
      costSplits: [],
      history: [],
      documents: {
        generated: [],
        templates: []
      },
      permissions: {
        canEditPersonal: true,
        canEditJob: true,
        canEditCompensation: false,
        canManageCostSplits: false,
        canGenerateDocuments: true
      }
    });

    expect(result.success).toBe(false);
  });
});

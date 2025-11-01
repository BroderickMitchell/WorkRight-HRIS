import { BudgetStatus, LeaveStatus, Prisma, PrismaClient, RoleKey } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();
const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

async function main() {
  await prisma.$transaction([
    prisma.auditEvent.deleteMany({}),
    prisma.webhookDelivery.deleteMany({}),
    prisma.webhookEndpoint.deleteMany({}),
    prisma.notification.deleteMany({}),
    prisma.leaveApproval.deleteMany({}),
    prisma.leaveRequest.deleteMany({}),
    prisma.leaveBalance.deleteMany({}),
    prisma.leavePolicy.deleteMany({}),
    prisma.feedback.deleteMany({}),
    prisma.review.deleteMany({}),
    prisma.reviewParticipant.deleteMany({}),
    prisma.reviewCycle.deleteMany({}),
    prisma.goalAlignment.deleteMany({}),
    prisma.progressUpdate.deleteMany({}),
    prisma.goal.deleteMany({}),
    prisma.generatedDocument.deleteMany({}),
    prisma.documentTemplate.deleteMany({}),
    prisma.employmentEvent.deleteMany({}),
    prisma.employeeCostSplit.deleteMany({}),
    prisma.employeeEmergencyContact.deleteMany({}),
    prisma.employeeAddress.deleteMany({}),
    prisma.employment.deleteMany({}),
    prisma.employee.deleteMany({}),
    prisma.costCode.deleteMany({}),
    prisma.position.deleteMany({}),
    prisma.department.deleteMany({}),
    prisma.completion.deleteMany({}),
    prisma.enrolment.deleteMany({}),
    prisma.module.deleteMany({}),
    prisma.course.deleteMany({}),
    prisma.holiday.deleteMany({}),
    prisma.location.deleteMany({}),
    prisma.user.deleteMany({}),
    prisma.tenant.deleteMany({})
  ]);

  const tenants = await prisma.tenant.createMany({
    data: [
      {
        id: 'tenant-acme',
        name: 'Acme Mining Co',
        slug: 'acme',
        settings: { brandingPrimaryColor: '#00695c', payCycle: 'fortnightly' }
      },
      {
        id: 'tenant-demo',
        name: 'Demo Health AU',
        slug: 'demo',
        settings: { brandingPrimaryColor: '#512da8', payCycle: 'monthly' }
      }
    ]
  });

  console.log(`Seeded ${tenants.count} tenants`);

  const [acme, demo] = await Promise.all([
    prisma.tenant.findUnique({ where: { slug: 'acme' } }),
    prisma.tenant.findUnique({ where: { slug: 'demo' } })
  ]);

  if (!acme || !demo) throw new Error('Tenants missing after seed');

  await prisma.user.createMany({
    data: [
      {
        tenantId: acme.id,
        email: 'owner@acme.example.au',
        givenName: 'Olivia',
        familyName: 'Owner',
        roles: [RoleKey.SYSTEM_OWNER, RoleKey.HR_BUSINESS_PARTNER]
      },
      {
        tenantId: acme.id,
        email: 'manager@acme.example.au',
        givenName: 'Mason',
        familyName: 'Manager',
        roles: [RoleKey.MANAGER]
      },
      {
        tenantId: demo.id,
        email: 'hr@demo.example.au',
        givenName: 'Hannah',
        familyName: 'HR',
        roles: [RoleKey.HR_BUSINESS_PARTNER]
      }
    ]
  });

  await prisma.department.createMany({
    data: [
      { tenantId: acme.id, name: 'Operations' },
      { tenantId: acme.id, name: 'People & Culture' },
      { tenantId: demo.id, name: 'Clinicians' }
    ]
  });

  await prisma.orgUnit.createMany({
    data: [
      { tenantId: acme.id, name: 'Operations' },
      { tenantId: acme.id, name: 'People & Culture' },
      { tenantId: demo.id, name: 'Clinicians' }
    ]
  });

  const operations = await prisma.department.findFirstOrThrow({
    where: { tenantId: acme.id, name: 'Operations' }
  });
  const pnc = await prisma.department.findFirstOrThrow({
    where: { tenantId: acme.id, name: 'People & Culture' }
  });
  const operationsOrg = await prisma.orgUnit.findFirstOrThrow({
    where: { tenantId: acme.id, name: 'Operations' }
  });
  const pncOrg = await prisma.orgUnit.findFirstOrThrow({
    where: { tenantId: acme.id, name: 'People & Culture' }
  });

  const camp = await prisma.location.create({
    data: {
      id: 'loc-acme-camp',
      tenantId: acme.id,
      name: 'Pilbara Village Camp',
      state: 'WA',
      country: 'Australia',
      timezone: 'Australia/Perth'
    }
  });

  const superintendent = await prisma.position.create({
    data: {
      tenantId: acme.id,
      title: 'Superintendent',
      positionHumanId: 'OPS-0001',
      departmentId: operations.id,
      orgUnitId: operationsOrg.id,
      employmentType: 'Permanent',
      workType: 'Onsite',
      budgetStatus: BudgetStatus.BUDGETED,
      effectiveFrom: addDays(new Date(), -365)
    }
  });

  const hrAdvisor = await prisma.position.create({
    data: {
      tenantId: acme.id,
      title: 'HR Advisor',
      positionHumanId: 'HR-0001',
      departmentId: pnc.id,
      orgUnitId: pncOrg.id,
      employmentType: 'Permanent',
      workType: 'Hybrid',
      budgetStatus: BudgetStatus.BUDGETED,
      effectiveFrom: addDays(new Date(), -180)
    }
  });

  const manager = await prisma.employee.create({
    data: {
      id: 'emp-acme-manager',
      tenantId: acme.id,
      givenName: 'Mason',
      familyName: 'Manager',
      preferredName: 'Mason',
      employeeNumber: 'ACME-0001',
      jobTitle: 'Superintendent',
      email: 'manager@acme.example.au',
      personalEmail: 'mason.manager@personal.example.au',
      workPhone: '+61 8 5550 4100',
      mobilePhone: '+61 400 010 100',
      dateOfBirth: new Date('1981-02-03'),
      startDate: addDays(new Date(), -400),
      serviceDate: addDays(new Date(), -380),
      citizenships: ['Australia'],
      languages: ['English'],
      communicationPreferences: ['EMAIL', 'PUSH'],
      timezone: 'Australia/Perth',
      workSchedule: '4/3 FIFO',
      badgeId: 'BADGE-0001',
      overtimeEligible: false,
      benefitsEligible: true,
      exempt: true,
      locationId: camp.id,
      positionId: superintendent.id
    }
  });

  await prisma.employee.createMany({
    data: [
      {
        id: 'emp-acme-sienna',
        tenantId: acme.id,
        givenName: 'Sienna',
        familyName: 'Surveyor',
        preferredName: 'Sienna',
        employeeNumber: 'ACME-1002',
        jobTitle: 'Senior Surveyor',
        email: 'sienna.surveyor@acme.example.au',
        personalEmail: 'sienna.surveyor@personal.example.au',
        workPhone: '+61 8 5550 4201',
        mobilePhone: '+61 400 200 201',
        dateOfBirth: new Date('1990-07-18'),
        startDate: addDays(new Date(), -120),
        serviceDate: addDays(new Date(), -110),
        managerId: manager.id,
        positionId: superintendent.id,
        citizenships: ['Australia'],
        languages: ['English', 'Pitjantjatjara'],
        communicationPreferences: ['EMAIL'],
      timezone: 'Australia/Perth',
      workSchedule: '8/6 Roster',
      badgeId: 'BADGE-0002',
      overtimeEligible: true,
      benefitsEligible: true,
      exempt: false,
      locationId: camp.id
    },
    {
      tenantId: acme.id,
      givenName: 'Noah',
      familyName: 'Navigator',
        preferredName: 'Noah',
        employeeNumber: 'ACME-1003',
        jobTitle: 'HR Advisor',
        email: 'noah.navigator@acme.example.au',
        personalEmail: 'noah.navigator@personal.example.au',
        workPhone: '+61 8 5550 4301',
        mobilePhone: '+61 400 300 301',
        dateOfBirth: new Date('1994-11-05'),
        startDate: addDays(new Date(), -90),
        serviceDate: addDays(new Date(), -85),
        managerId: manager.id,
        positionId: hrAdvisor.id,
        citizenships: ['Australia'],
        languages: ['English'],
        communicationPreferences: ['EMAIL', 'SMS'],
        timezone: 'Australia/Perth',
      workSchedule: 'Hybrid 3/2',
      badgeId: 'BADGE-0003',
      overtimeEligible: false,
      benefitsEligible: true,
      exempt: false,
      locationId: camp.id
    }
  ]
});

  const sienna = await prisma.employee.findFirst({
    where: { tenantId: acme.id, email: 'sienna.surveyor@acme.example.au' }
  });
  const noah = await prisma.employee.findFirst({
    where: { tenantId: acme.id, email: 'noah.navigator@acme.example.au' }
  });

  if (!sienna || !noah) {
    throw new Error('Employee records missing after seed');
  }

  await prisma.payProfile.upsert({
    where: { employeeId: manager.id },
    update: { baseRateCents: 1850000 },
    create: ({ tenantId: acme.id, employeeId: manager.id, baseRateCents: 1850000 } as any)
  });
  await prisma.payProfile.upsert({
    where: { employeeId: sienna.id },
    update: { baseRateCents: 1250000 },
    create: ({ tenantId: acme.id, employeeId: sienna.id, baseRateCents: 1250000 } as any)
  });
  await prisma.payProfile.upsert({
    where: { employeeId: noah.id },
    update: { baseRateCents: 980000 },
    create: ({ tenantId: acme.id, employeeId: noah.id, baseRateCents: 980000 } as any)
  });

  await prisma.employeeAddress.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: manager.id,
        type: 'PRIMARY',
        line1: '1 Mine Road',
        suburb: 'Newman',
        state: 'WA',
        postcode: '6753',
        country: 'Australia'
      },
      {
        id: 'emp-acme-noah',
        tenantId: acme.id,
        employeeId: sienna.id,
        type: 'PRIMARY',
        line1: '27 Surveyor Street',
        suburb: 'Perth',
        state: 'WA',
        postcode: '6000',
        country: 'Australia'
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        type: 'PRIMARY',
        line1: '44 Corporate Avenue',
        suburb: 'Perth',
        state: 'WA',
        postcode: '6000',
        country: 'Australia'
      }
    ]
  });

  await prisma.employeeEmergencyContact.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        name: 'Olivia Surveyor',
        relationship: 'Spouse',
        phone: '+61 400 500 600',
        email: 'olivia.surveyor@example.com'
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        name: 'Ethan Navigator',
        relationship: 'Brother',
        phone: '+61 400 700 800',
        email: 'ethan.navigator@example.com'
      }
    ]
  });

  const [operationsCostCenter, projectExpansion] = await Promise.all([
    prisma.costCode.create({
      data: {
        tenantId: acme.id,
        code: 'CC-4100',
        description: 'Underground Operations Cost Center',
        type: 'COST_CENTER'
      }
    }),
    prisma.costCode.create({
      data: {
        tenantId: acme.id,
        code: 'PJ-ACME-EXP',
        description: 'Acme Expansion Project',
        type: 'PROJECT'
      }
    })
  ]);

  await prisma.employeeCostSplit.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        costCodeId: operationsCostCenter.id,
        percentage: new Prisma.Decimal(60),
        startDate: addDays(new Date(), -90)
      },
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        costCodeId: projectExpansion.id,
        percentage: new Prisma.Decimal(40),
        startDate: addDays(new Date(), -90)
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        costCodeId: operationsCostCenter.id,
        percentage: new Prisma.Decimal(100),
        startDate: addDays(new Date(), -90)
      }
    ]
  });

  const rosterTemplate = await prisma.rosterTemplate.create({
    data: ({
      tenantId: acme.id,
      name: '8/6 Day Shifts',
      seedDate: new Date('2024-01-01'),
      pattern: asJson(['D', 'D', 'D', 'D', 'D', 'D', 'D', 'D', 'R', 'R', 'R', 'R', 'R', 'R'])
    } as any)
  });

  await prisma.rosterAssignment.create({
    data: ({
      tenantId: acme.id,
      templateId: rosterTemplate.id,
      employeeId: sienna.id,
      locationId: camp.id,
      effectiveFrom: addDays(new Date(), -90)
    } as any)
  });

  const swingStart = addDays(new Date(), 7);
  const swingEnd = addDays(swingStart, 8);

  const room = await prisma.room.create({
    data: ({
      tenantId: acme.id,
      locationId: camp.id,
      name: 'Room 101',
      capacity: 1
    } as any)
  });

  await prisma.roomBooking.create({
    data: ({
      tenantId: acme.id,
      roomId: room.id,
      employeeId: sienna.id,
      startDate: swingStart,
      endDate: swingEnd
    } as any)
  });

  const departureFlight = await prisma.flight.create({
    data: ({
      tenantId: acme.id,
      carrier: 'QF',
      flightNumber: 'QF201',
      depAirport: 'PER',
      arrAirport: 'KTA'
    } as any)
  });
  const returnFlight = await prisma.flight.create({
    data: ({
      tenantId: acme.id,
      carrier: 'QF',
      flightNumber: 'QF202',
      depAirport: 'KTA',
      arrAirport: 'PER'
    } as any)
  });

  await prisma.flightBooking.createMany({
    data: [
      ({
        tenantId: acme.id,
        flightId: departureFlight.id,
        employeeId: sienna.id,
        depTime: swingStart,
        arrTime: addDays(swingStart, 0)
      } as any),
      ({
        tenantId: acme.id,
        flightId: returnFlight.id,
        employeeId: sienna.id,
        depTime: swingEnd,
        arrTime: addDays(swingEnd, 0)
      } as any)
    ]
  });

  await prisma.employment.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: manager.id,
        startDate: manager.startDate,
        contractType: 'Permanent',
        fte: 1,
        payType: 'Salary',
        payRate: new Prisma.Decimal(185000),
        currency: 'AUD',
        payFrequency: 'ANNUAL',
        grade: 'G11',
        workerType: 'Employee',
        employmentType: 'Full-time',
        standardHours: 38,
        schedule: '4/3 FIFO',
        bonusTarget: 12.5,
        allowances: asJson([
          { id: 'REMOTE', label: 'Remote Loading', amount: 5000, currency: 'AUD', frequency: 'ANNUAL', taxable: true }
        ]),
        stockPlan: 'LTI Tier 2'
      },
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        startDate: addDays(new Date(), -120),
        contractType: 'Permanent',
        fte: 1,
        payType: 'Salary',
        payRate: new Prisma.Decimal(125000),
        currency: 'AUD',
        payFrequency: 'ANNUAL',
        grade: 'G9',
        workerType: 'Employee',
        employmentType: 'Full-time',
        standardHours: 40,
        schedule: '8/6 Roster',
        bonusTarget: 10,
        allowances: asJson([
          { id: 'FIELD', label: 'Field Uplift', amount: 3000, currency: 'AUD', frequency: 'ANNUAL', taxable: true }
        ]),
        stockPlan: null
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        startDate: addDays(new Date(), -90),
        contractType: 'Permanent',
        fte: 1,
        payType: 'Salary',
        payRate: new Prisma.Decimal(98000),
        currency: 'AUD',
        payFrequency: 'ANNUAL',
        grade: 'G7',
        workerType: 'Employee',
        employmentType: 'Full-time',
        standardHours: 38,
        schedule: 'Hybrid 3/2',
        bonusTarget: 7.5,
        allowances: asJson([]),
        stockPlan: null
      }
    ]
  });

  await prisma.employmentEvent.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        type: 'HIRE',
        effectiveDate: addDays(new Date(), -120),
        payload: { source: 'seed', positionId: superintendent.id },
        actorId: manager.id,
        source: 'UI',
        createdBy: 'seed-script'
      },
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        type: 'COST_CODE_CHANGE',
        effectiveDate: addDays(new Date(), -60),
        payload: { codes: ['CC-4100', 'PJ-ACME-EXP'], percentages: [60, 40] },
        actorId: manager.id,
        source: 'UI',
        createdBy: 'seed-script'
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        type: 'TRANSFER',
        effectiveDate: addDays(new Date(), -45),
        payload: { from: 'Operations', to: 'People & Culture' },
        actorId: manager.id,
        source: 'UI',
        createdBy: 'seed-script'
      }
    ]
  });

  await prisma.documentTemplate.createMany({
    data: [
      {
        tenantId: acme.id,
        name: 'Employment Verification Letter',
        description: 'Confirms employment details for third parties',
        format: 'PDF',
        body:
          'To whom it may concern,\n\nThis letter confirms that {{employee.name}} is employed by Acme Mining Co as {{employee.jobTitle}} (Position ID {{employee.positionId}}). Current cost coding: {{costSplits.0.code}} {{costSplits.0.percentage}}%.\n\nIssued on {{generatedAt}}.'
      },
      {
        tenantId: acme.id,
        name: 'Cost Coding Change Memo',
        description: 'Memo to finance regarding cost split adjustments',
        format: 'DOCX',
        body:
          'Effective {{generatedAt}}, update {{employee.name}} cost allocations to {{costSplits.0.code}} ({{costSplits.0.percentage}}%) and {{costSplits.1.code}} ({{costSplits.1.percentage}}%).'
      }
    ]
  });

  await prisma.goal.create({
    data: {
      tenantId: acme.id,
      title: 'Reduce safety incidents by 20%',
      dueDate: addDays(new Date(), 180),
      weighting: 0.3,
      ownerId: manager.id
    }
  });

  const annualLeave = await prisma.leavePolicy.create({
    data: {
      tenantId: acme.id,
      name: 'Annual Leave',
      code: 'AL',
      accrualRule: asJson({ perMonth: 2.92 }),
      maxBalance: 228
    }
  });

  await prisma.leaveBalance.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        leaveTypeId: annualLeave.id,
        balance: 8
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        leaveTypeId: annualLeave.id,
        balance: 14
      }
    ]
  });

  const approvedLeave = await prisma.leaveRequest.create({
    data: {
      tenantId: acme.id,
      employeeId: sienna.id,
      leaveTypeId: annualLeave.id,
      startDate: addDays(new Date(), 14),
      endDate: addDays(new Date(), 19),
      status: LeaveStatus.APPROVED,
      notes: 'Family trip to Ningaloo'
    }
  });

  await prisma.leaveApproval.create({
    data: {
      tenantId: acme.id,
      leaveRequestId: approvedLeave.id,
      approverId: manager.id,
      stepOrder: 1,
      status: LeaveStatus.APPROVED,
      comment: 'Enjoy the break!',
      actedAt: addDays(new Date(), -2)
    }
  });

  const payrollRun = await prisma.payrollRun.create({
    data: {
      tenantId: acme.id,
      periodStart: addDays(new Date(), -14),
      periodEnd: addDays(new Date(), -1),
      totalCents: 820000,
      lines: {
        create: [
          ({
            tenantId: acme.id,
            employeeId: manager.id,
            hours: 80,
            amountCents: 420000,
            details: asJson({ payCode: 'BASE', narrative: 'Fortnightly salary' })
          } as any),
          ({
            tenantId: acme.id,
            employeeId: sienna.id,
            hours: 84,
            amountCents: 260000,
            details: asJson({ payCode: 'BASE', narrative: 'Rostered shifts' })
          } as any),
          ({
            tenantId: acme.id,
            employeeId: noah.id,
            hours: 80,
            amountCents: 140000,
            details: asJson({ payCode: 'BASE', narrative: 'People & Culture support' })
          } as any)
        ]
      }
    }
  });

  console.log('Seeded demo data');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

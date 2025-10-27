import { Prisma, PrismaClient, RoleKey } from '@prisma/client';
import { addDays } from 'date-fns';

const prisma = new PrismaClient();

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

  const operations = await prisma.department.findFirst({ where: { tenantId: acme.id, name: 'Operations' } });
  const pnc = await prisma.department.findFirst({ where: { tenantId: acme.id, name: 'People & Culture' } });

  const superintendent = await prisma.position.create({
    data: {
      tenantId: acme.id,
      title: 'Superintendent',
      departmentId: operations?.id
    }
  });

  const hrAdvisor = await prisma.position.create({
    data: {
      tenantId: acme.id,
      title: 'HR Advisor',
      departmentId: pnc?.id
    }
  });

  const manager = await prisma.employee.create({
    data: {
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
      positionId: superintendent.id
    }
  });

  await prisma.employee.createMany({
    data: [
      {
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
        exempt: false
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
        exempt: false
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
        allowances: [
          { id: 'REMOTE', label: 'Remote Loading', amount: 5000, currency: 'AUD', frequency: 'ANNUAL', taxable: true }
        ] as Prisma.JsonValue,
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
        allowances: [
          { id: 'FIELD', label: 'Field Uplift', amount: 3000, currency: 'AUD', frequency: 'ANNUAL', taxable: true }
        ] as Prisma.JsonValue,
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
        allowances: [] as Prisma.JsonValue,
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
      owner: { connect: { email_tenantId: { email: 'manager@acme.example.au', tenantId: acme.id } } }
    }
  });

  await prisma.leavePolicy.create({
    data: {
      tenantId: acme.id,
      name: 'Annual Leave',
      code: 'AL',
      accrualRule: { perMonth: 2.92 },
      maxBalance: 228
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

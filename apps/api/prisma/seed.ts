import { FieldMapSource, LeaveStatus, PositionManagementMode, Prisma, PrismaClient, RoleKey } from '@prisma/client';
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
    prisma.nodeRun.deleteMany({}),
    prisma.workflowRun.deleteMany({}),
    prisma.workflowVersion.deleteMany({}),
    prisma.workflow.deleteMany({}),
    prisma.fieldMap.deleteMany({}),
    prisma.taskTemplate.deleteMany({}),
    prisma.formTemplate.deleteMany({}),
    prisma.emailTemplate.deleteMany({}),
    prisma.profileTaskTemplate.deleteMany({}),
    prisma.survey.deleteMany({}),
    prisma.group.deleteMany({}),
    prisma.legalEntity.deleteMany({}),
    prisma.employmentEvent.deleteMany({}),
    prisma.employeeCostSplit.deleteMany({}),
    prisma.employeeEmergencyContact.deleteMany({}),
    prisma.employeeAddress.deleteMany({}),
    prisma.employment.deleteMany({}),
    prisma.employee.deleteMany({}),
    prisma.costCode.deleteMany({}),
    prisma.userPositionAssignment.deleteMany({}),
    prisma.position.deleteMany({}),
    prisma.jobRole.deleteMany({}),
    prisma.positionManagementConfig.deleteMany({}),
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

  const ownerUser = await prisma.user.findFirstOrThrow({
    where: { tenantId: acme.id, email: 'owner@acme.example.au' }
  });
  const demoHrUser = await prisma.user.findFirstOrThrow({
    where: { tenantId: demo.id, email: 'hr@demo.example.au' }
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

  const perthHq = await prisma.location.create({
    data: {
      id: 'loc-acme-hq',
      tenantId: acme.id,
      name: 'Perth Headquarters',
      state: 'WA',
      country: 'Australia',
      timezone: 'Australia/Perth'
    }
  });

  const acmeLegal = await prisma.legalEntity.create({
    data: {
      tenantId: acme.id,
      name: 'Acme Mining Pty Ltd'
    }
  });

  const demoLegal = await prisma.legalEntity.create({
    data: {
      tenantId: demo.id,
      name: 'Demo Health Pty Ltd'
    }
  });

  await prisma.group.createMany({
    data: [
      {
        tenantId: acme.id,
        name: 'Site Supervisors',
        description: 'Supervisors who oversee rostered crews',
        isActive: true
      },
      {
        tenantId: acme.id,
        name: 'HR Business Partners',
        description: 'HRBP team',
        isActive: true
      },
      {
        tenantId: demo.id,
        name: 'Onboarding Coordinators',
        description: 'Demo onboarding support',
        isActive: true
      }
    ]
  });

  await prisma.positionManagementConfig.createMany({
    data: [
      {
        tenantId: acme.id,
        mode: PositionManagementMode.POSITION_LED,
        showPositionIds: true,
        autoGeneratePositionIds: true,
        idPrefix: 'OPS',
        startingNumber: 10000,
        nextSequenceNumber: 10002,
        enableBudgeting: true,
        enableConcurrentPositions: false
      },
      {
        tenantId: demo.id,
        mode: PositionManagementMode.EMPLOYEE_LED,
        showPositionIds: true,
        autoGeneratePositionIds: false,
        idPrefix: 'POS',
        startingNumber: 20000,
        nextSequenceNumber: 20000,
        enableBudgeting: false,
        enableConcurrentPositions: true
      }
    ]
  });

  const superintendentRole = await prisma.jobRole.create({
    data: {
      tenantId: acme.id,
      title: 'Superintendent',
      description: 'Leads the operations team for site production.',
      skills: asJson(['Leadership', 'Production Planning']),
      goals: asJson(['Maintain production targets', 'Improve safety reporting']),
      courses: asJson(['leadership-101']),
      competencies: asJson(['Strategic Thinking', 'People Leadership'])
    }
  });

  const supervisorRole = await prisma.jobRole.create({
    data: {
      tenantId: acme.id,
      title: 'Shift Supervisor',
      description: 'Supervises daily shift operations.',
      skills: asJson(['Crew Leadership', 'Safety Compliance']),
      goals: asJson(['Zero LTIs per swing']),
      courses: asJson(['safety-supervisor']),
      competencies: asJson(['Coaching', 'Operational Excellence'])
    }
  });

  const hrAdvisorRole = await prisma.jobRole.create({
    data: {
      tenantId: acme.id,
      title: 'HR Advisor',
      description: 'Supports site HR needs including onboarding and learning.',
      skills: asJson(['Employee Relations', 'Recruitment']),
      goals: asJson(['Reduce time-to-fill vacancies']),
      courses: asJson(['hr-essentials']),
      competencies: asJson(['Stakeholder Management'])
    }
  });

  const superintendent = await prisma.position.create({
    data: {
      tenantId: acme.id,
      positionId: 'OPS-10000',
      title: 'Operations Superintendent',
      jobRoleId: superintendentRole.id,
      departmentId: operations.id,
      locationId: camp.id,
      headcount: 1,
      budgetedFte: new Prisma.Decimal(1),
      budgetedSalary: new Prisma.Decimal(220000),
      inheritRoleData: true
    }
  });

  const shiftSupervisor = await prisma.position.create({
    data: {
      tenantId: acme.id,
      positionId: 'OPS-10001',
      title: 'Shift Supervisor',
      jobRoleId: supervisorRole.id,
      departmentId: operations.id,
      locationId: camp.id,
      parentPositionId: superintendent.id,
      headcount: 2,
      budgetedFte: new Prisma.Decimal(2),
      budgetedSalary: new Prisma.Decimal(350000),
      inheritRoleData: true
    }
  });

  const hrAdvisor = await prisma.position.create({
    data: {
      tenantId: acme.id,
      positionId: 'HR-10000',
      title: 'HR Advisor',
      jobRoleId: hrAdvisorRole.id,
      departmentId: pnc.id,
      locationId: perthHq.id,
      headcount: 1,
      budgetedFte: new Prisma.Decimal(1),
      budgetedSalary: new Prisma.Decimal(140000),
      inheritRoleData: true
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
      departmentId: operations.id,
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
        departmentId: operations.id,
        positionId: shiftSupervisor.id,
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
        departmentId: pnc.id,
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
      locationId: perthHq.id
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

  await prisma.userPositionAssignment.createMany({
    data: [
      {
        tenantId: acme.id,
        employeeId: manager.id,
        positionId: superintendent.id,
        fte: new Prisma.Decimal(1),
        baseSalary: new Prisma.Decimal(220000),
        startDate: addDays(new Date(), -400),
        isPrimary: true
      },
      {
        tenantId: acme.id,
        employeeId: sienna.id,
        positionId: shiftSupervisor.id,
        fte: new Prisma.Decimal(1),
        baseSalary: new Prisma.Decimal(165000),
        startDate: addDays(new Date(), -120),
        isPrimary: true
      },
      {
        tenantId: acme.id,
        employeeId: noah.id,
        positionId: hrAdvisor.id,
        fte: new Prisma.Decimal(1),
        baseSalary: new Prisma.Decimal(120000),
        startDate: addDays(new Date(), -90),
        isPrimary: true,
        reportsToOverrideId: manager.id
      }
    ]
  });

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
        legalEntityId: acmeLegal.id,
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
        legalEntityId: acmeLegal.id,
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
        legalEntityId: acmeLegal.id,
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

  await prisma.taskTemplate.create({
    data: {
      tenantId: acme.id,
      name: 'Complete welcome tasks',
      description: 'Read the welcome pack and acknowledge policies.',
      defaultNotifications: asJson([{ channel: 'EMAIL', offsetDays: 0 }]),
      defaultDueRules: asJson({ basis: 'assignee.start_date', offset: { value: 2, unit: 'days' }, direction: 'AFTER' }),
      createdById: ownerUser.id
    }
  });

  await prisma.taskTemplate.create({
    data: {
      tenantId: acme.id,
      name: 'Arrange equipment provisioning',
      description: 'IT to provision laptop and access cards.',
      defaultNotifications: asJson([{ channel: 'EMAIL', offsetDays: 0 }]),
      defaultDueRules: asJson({ basis: 'assignee.start_date', offset: { value: -3, unit: 'days' }, direction: 'BEFORE' }),
      createdById: ownerUser.id
    }
  });

  await prisma.formTemplate.create({
    data: {
      tenantId: acme.id,
      name: 'Onboarding information form',
      schema: asJson({
        title: 'Onboarding details',
        fields: [
          { type: 'text', id: 'tshirt', label: 'T-shirt size' },
          { type: 'textarea', id: 'diet', label: 'Dietary requirements' }
        ]
      }),
      notifications: asJson([{ channel: 'EMAIL', offsetDays: 0 }]),
      version: 1,
      publishState: 'published',
      createdById: ownerUser.id
    }
  });

  await prisma.emailTemplate.create({
    data: {
      tenantId: acme.id,
      name: 'Orientation schedule',
      subject: 'Your first week at Acme',
      bodyHtml:
        '<p>Hi {{::FIRSTNAME::}},</p><p>We are excited to welcome you on {{::STARTDATE::}}. Your manager {{::WORKFLOWASSIGNEEMANAGERFIRSTNAME::}} will meet you at reception.</p>',
      placeholders: ['::FIRSTNAME::', '::STARTDATE::', '::WORKFLOWASSIGNEEMANAGERFIRSTNAME::'],
      attachments: asJson([]),
      createdById: ownerUser.id
    }
  });

  await prisma.profileTaskTemplate.create({
    data: {
      tenantId: acme.id,
      name: 'Complete personal information',
      sections: ['BANK_DETAILS', 'EMERGENCY_CONTACT', 'ADDITIONAL_INFO'],
      countryScope: ['AU'],
      createdById: ownerUser.id
    }
  });

  await prisma.survey.create({
    data: {
      tenantId: acme.id,
      name: 'New starter feedback',
      collectors: asJson([{ type: 'link', url: 'https://forms.example.com/acme-onboarding' }]),
      enabledCollectors: asJson({ onboarding_workflow: true }),
      createdById: ownerUser.id
    }
  });

  await prisma.taskTemplate.create({
    data: {
      tenantId: demo.id,
      name: 'Hospital orientation checklist',
      description: 'Complete induction modules before day one.',
      defaultNotifications: asJson([{ channel: 'EMAIL', offsetDays: 0 }]),
      defaultDueRules: asJson({ basis: 'assignee.start_date', offset: { value: 1, unit: 'weeks' }, direction: 'AFTER' }),
      createdById: demoHrUser.id
    }
  });

  await prisma.formTemplate.create({
    data: {
      tenantId: demo.id,
      name: 'Clinical onboarding form',
      schema: asJson({ title: 'Clinical onboarding', fields: [{ type: 'text', id: 'registration', label: 'AHPRA registration #' }] }),
      notifications: asJson([{ channel: 'EMAIL', offsetDays: 0 }]),
      version: 1,
      publishState: 'published',
      createdById: demoHrUser.id
    }
  });

  const placeholderSeeds = [
    { key: '::FIRSTNAME::', path: 'profile.first_name', required: true },
    { key: '::LASTNAME::', path: 'profile.last_name', required: true },
    { key: '::PREFERREDNAME::', path: 'profile.preferred_name', fallback: 'profile.first_name' },
    { key: '::EMAIL::', path: 'profile.email', required: true },
    { key: '::STARTDATE::', path: 'employment.start_date', required: true },
    { key: '::ENDDATE::', path: 'employment.end_date' },
    { key: '::POSITION::', path: 'org.position.name' },
    { key: '::DEPARTMENT::', path: 'org.department.name' },
    { key: '::LOCATION::', path: 'org.location.name' },
    { key: '::MANAGERFIRSTNAME::', path: 'manager.profile.first_name' },
    { key: '::WORKFLOWASSIGNEEMANAGERFIRSTNAME::', path: 'assignee.manager.profile.first_name', required: true },
    { key: '::LEGALENTITY::', path: 'org.legal_entity.name' }
  ];

  for (const placeholder of placeholderSeeds) {
    await prisma.fieldMap.create({
      data: {
        tenantId: acme.id,
        source: FieldMapSource.EMAIL_PLACEHOLDER,
        sourceKey: placeholder.key,
        targetPath: placeholder.path,
        required: placeholder.required ?? false,
        fallback: placeholder.fallback ?? null
      }
    });
    await prisma.fieldMap.create({
      data: {
        tenantId: demo.id,
        source: FieldMapSource.EMAIL_PLACEHOLDER,
        sourceKey: placeholder.key,
        targetPath: placeholder.path,
        required: placeholder.required ?? false,
        fallback: placeholder.fallback ?? null
      }
    });
  }

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

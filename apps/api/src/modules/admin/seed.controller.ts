import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';

@Controller('admin')
export class SeedController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('seed-mining')
  async seed() {
    // Create or reuse a deterministic demo tenant so clients can call with X-Tenant-Id: tenant-demo
    const tenant = await this.prisma.tenant.upsert({
      where: { slug: 'demo' },
      update: {},
      create: ({ id: 'tenant-demo', slug: 'demo', name: 'Demo Mining AU', settings: {} } as any)
    });

    // Create location
    const location = await this.prisma.location.upsert({
      where: { id: 'loc-karratha' },
      update: {},
      create: ({ id: 'loc-karratha', name: 'Karratha Camp', state: 'WA', country: 'Australia', timezone: 'Australia/Perth' } as any)
    });

    // Departments
    const deptCOM = await (this.prisma as any).department.upsert({
      where: { id: 'dept-com' },
      update: {},
      create: ({ id: 'dept-com', name: 'Commercial', codePrefix: 'COM', status: 'ACTIVE' } as any)
    });
    const deptOPS = await (this.prisma as any).department.upsert({
      where: { id: 'dept-ops' },
      update: {},
      create: ({ id: 'dept-ops', name: 'Operations', codePrefix: 'OPS', status: 'ACTIVE' } as any)
    });

    // Org units
    const orgRoot = await (this.prisma as any).orgUnit.upsert({ where: { id: 'ou-root' }, update: {}, create: ({ id: 'ou-root', name: 'Head Office' } as any) });
    const orgOps = await (this.prisma as any).orgUnit.upsert({ where: { id: 'ou-ops' }, update: {}, create: ({ id: 'ou-ops', name: 'Operations', parentId: orgRoot.id } as any) });

    // Create employee
    const employee = await this.prisma.employee.upsert({
      where: { id: 'emp-2' },
      update: {},
      create: ({ id: 'emp-2', givenName: 'Sienna', familyName: 'Surveyor', email: 'sienna.surveyor@acme.example.au', startDate: new Date('2024-08-01') } as any)
    });
    // pay profile (e.g., $120/hr)
    await this.prisma.payProfile.upsert({
      where: { employeeId: employee.id },
      update: { baseRateCents: 12000 },
      create: ({ employeeId: employee.id, baseRateCents: 12000 } as any)
    });

    // Roster template (8/6 from 2024-11-04)
    const tmpl = await this.prisma.rosterTemplate.upsert({
      where: { id: 'tmpl-8-6' },
      update: {},
      create: ({ id: 'tmpl-8-6', name: '8/6 Day Shifts', seedDate: new Date('2024-11-04'), pattern: ['D','D','D','D','D','D','D','D','R','R','R','R','R','R'] } as any)
    });

    // Assignment
    await this.prisma.rosterAssignment.upsert({
      where: { id: 'asn-emp2-8-6' },
      update: {},
      create: ({ id: 'asn-emp2-8-6', templateId: tmpl.id, employeeId: employee.id, locationId: location.id, effectiveFrom: new Date('2024-11-04') } as any)
    });

    // Accommodation room & booking for first swing
    const room = await this.prisma.room.upsert({
      where: { id: 'room-a' },
      update: {},
      create: ({ id: 'room-a', locationId: location.id, name: 'Room A', capacity: 1 } as any)
    });
    await this.prisma.roomBooking.create({
      data: ({ roomId: room.id, employeeId: employee.id, startDate: new Date('2024-11-04'), endDate: new Date('2024-11-12') } as any)
    });

    // Flights & bookings
    const dep = await this.prisma.flight.create({ data: ({ carrier: 'QF', flightNumber: 'QF100', depAirport: 'PER', arrAirport: 'KTA' } as any) });
    const ret = await this.prisma.flight.create({ data: ({ carrier: 'QF', flightNumber: 'QF101', depAirport: 'KTA', arrAirport: 'PER' } as any) });
    await this.prisma.flightBooking.createMany({
      data: [
        ({ flightId: dep.id, employeeId: employee.id, depTime: new Date('2024-11-04T08:00:00+08:00'), arrTime: new Date('2024-11-04T10:30:00+08:00') } as any),
        ({ flightId: ret.id, employeeId: employee.id, depTime: new Date('2024-11-12T15:00:00+08:00'), arrTime: new Date('2024-11-12T17:30:00+08:00') } as any)
      ]
    });

    // Approval workflow (positions): HRBP -> Finance -> Executive
    await (this.prisma as any).approvalStep.deleteMany({});
    await (this.prisma as any).approvalStep.createMany({
      data: [
        ({ name: 'HRBP', roleRequired: 'HRBP', sequence: 1, slaDays: 3 } as any),
        ({ name: 'Finance', roleRequired: 'FINANCE', sequence: 2, slaDays: 3 } as any),
        ({ name: 'Executive', roleRequired: 'EXEC', sequence: 3, slaDays: 5 } as any)
      ]
    });

    // Position ID counters
    await (this.prisma as any).positionIdCounter.upsert({ where: { departmentId: deptCOM.id }, update: {}, create: ({ departmentId: deptCOM.id, nextNumber: 1, width: 3, hyphenStyle: false } as any) });
    await (this.prisma as any).positionIdCounter.upsert({ where: { departmentId: deptOPS.id }, update: {}, create: ({ departmentId: deptOPS.id, nextNumber: 1, width: 3, hyphenStyle: false } as any) });

    // Seed positions
    const comHuman = 'COM001';
    await (this.prisma as any).position.upsert({
      where: { id: 'pos-com-001' },
      update: {},
      create: ({
        id: 'pos-com-001',
        positionHumanId: comHuman,
        title: 'Commercial Manager',
        departmentId: deptCOM.id,
        orgUnitId: orgRoot.id,
        employmentType: 'Full-time',
        workType: 'Permanent',
        fte: 1,
        budgetStatus: 'UNBUDGETED',
        status: 'PENDING',
        effectiveFrom: new Date('2024-11-01')
      } as any)
    });

    const opsHuman = 'OPS001';
    await (this.prisma as any).position.upsert({
      where: { id: 'pos-ops-001' },
      update: {},
      create: ({
        id: 'pos-ops-001',
        positionHumanId: opsHuman,
        title: 'Shift Supervisor',
        departmentId: deptOPS.id,
        orgUnitId: orgOps.id,
        employmentType: 'Full-time',
        workType: 'Permanent',
        fte: 1,
        budgetStatus: 'BUDGETED',
        status: 'ACTIVE',
        effectiveFrom: new Date('2024-10-01')
      } as any)
    });

    return { ok: true, tenantId: tenant.id, employeeId: employee.id, locationId: location.id, templateId: tmpl.id };
  }
}

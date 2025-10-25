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

    return { ok: true, tenantId: tenant.id, employeeId: employee.id, locationId: location.id, templateId: tmpl.id };
  }
}

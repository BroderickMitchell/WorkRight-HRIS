import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { PlanTravelDto } from './travel.dto.js';
import type { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

type RoomRecord = Prisma.RoomGetPayload<Prisma.RoomDefaultArgs>;

@Injectable()
export class TravelService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  private getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new Error('Tenant context is required for travel operations');
    }
    return tenantId;
  }

  async planTravel(dto: PlanTravelDto) {
    const tenantId = this.getTenantId();
    const location = await this.prisma.location.findFirstOrThrow({
      where: { id: dto.locationId, tenantId }
    });

    // Ensure a room exists at location
    let room = await this.prisma.room.findFirst({ where: { locationId: location.id, tenantId } });
    if (!room) {
      room = await this.prisma.room.create({
        data: ({
          tenantId,
          locationId: location.id,
          name: 'Camp Room A',
          capacity: 1
        } as any)
      });
    }
    const [start, end] = dto.swingDates.map((d) => new Date(d)).sort((a, b) => +a - +b);
    await this.prisma.roomBooking.create({
      data: ({
        tenantId,
        roomId: room.id,
        employeeId: dto.employeeId,
        startDate: start,
        endDate: end
      } as any)
    });

    // Create flight and bookings (stub)
    const dep = await this.prisma.flight.create({
      data: ({
        tenantId,
        carrier: 'QF',
        flightNumber: 'QF100',
        depAirport: 'PER',
        arrAirport: 'KTA'
      } as any)
    });
    const ret = await this.prisma.flight.create({
      data: ({
        tenantId,
        carrier: 'QF',
        flightNumber: 'QF101',
        depAirport: 'KTA',
        arrAirport: 'PER'
      } as any)
    });
    await this.prisma.flightBooking.createMany({
      data: [
        ({
          tenantId,
          flightId: dep.id,
          employeeId: dto.employeeId,
          depTime: new Date(start),
          arrTime: new Date(start)
        } as any),
        ({
          tenantId,
          flightId: ret.id,
          employeeId: dto.employeeId,
          depTime: new Date(end),
          arrTime: new Date(end)
        } as any)
      ]
    });

    return { ok: true };
  }

  async getManifest(dateIso: string) {
    const tenantId = this.getTenantId();
    const day = new Date(dateIso);
    const next = new Date(day);
    next.setDate(day.getDate() + 1);
    const flights = await this.prisma.flightBooking.findMany({
      where: { tenantId, depTime: { gte: day, lt: next } },
      include: { flight: true }
    });
    return flights;
  }

  async getOccupancy(locationId: string, dateIso: string) {
    const tenantId = this.getTenantId();
    const day = new Date(dateIso);
    const rooms: RoomRecord[] = await this.prisma.room.findMany({ where: { locationId, tenantId } });
    const bookings = await this.prisma.roomBooking.findMany({
      where: { tenantId, room: { locationId }, startDate: { lte: day }, endDate: { gte: day } }
    });
    const byRoom = new Map<string, number>();
    for (const b of bookings) byRoom.set(b.roomId, (byRoom.get(b.roomId) ?? 0) + 1);
    return rooms.map((room) => ({
      roomId: room.id,
      room: room.name,
      occupied: byRoom.get(room.id) ?? 0,
      capacity: room.capacity
    }));
  }
}

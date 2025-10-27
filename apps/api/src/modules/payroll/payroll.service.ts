import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreatePayrollRunDto, UpsertPayProfileDto } from './payroll.dto.js';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async createRun(dto: CreatePayrollRunDto) {
    const start = new Date(dto.periodStart);
    const end = new Date(dto.periodEnd);
    const shifts = await this.prisma.shift.findMany({
      where: {
        date: { gte: start, lte: end },
        ...(dto.locationId ? { locationId: dto.locationId } : {})
      }
    });

    // Group by employee
    const byEmp = new Map<string, number>();
    for (const s of shifts) {
      if (s.shiftType === 'REST') continue;
      const hrs = 12; // assume 12 hour shifts for mining FIFO day/night
      byEmp.set(s.employeeId, (byEmp.get(s.employeeId) ?? 0) + hrs);
    }

    const run = await this.prisma.payrollRun.create({ data: ({ periodStart: start, periodEnd: end } as any) });
    let total = 0;
    for (const [employeeId, hours] of byEmp.entries()) {
      const profile = await this.prisma.payProfile.findUnique({ where: { employeeId } });
      const rate = profile?.baseRateCents ?? 5000; // $50 default
      const amount = Math.round(rate * hours);
      total += amount;
      await this.prisma.payrollLine.create({
        data: ({ runId: run.id, employeeId, hours, amountCents: amount, details: { note: 'Roster-driven calc' } } as any)
      });
    }
    await this.prisma.payrollRun.update({ where: { id: run.id }, data: { totalCents: total } });
    return this.prisma.payrollRun.findUnique({ where: { id: run.id }, include: { lines: true } });
  }

  listRuns() {
    return this.prisma.payrollRun.findMany({ orderBy: { createdAt: 'desc' }, include: { lines: true } });
  }

  getRun(id: string) {
    return this.prisma.payrollRun.findUnique({ where: { id }, include: { lines: true } });
  }

  async getProfile(employeeId: string) {
    const profile = await this.prisma.payProfile.findUnique({ where: { employeeId } });
    if (profile) return profile;
    return { employeeId, baseRateCents: null } as any;
  }

  async upsertProfile(dto: UpsertPayProfileDto) {
    return this.prisma.payProfile.upsert({
      where: { employeeId: dto.employeeId },
      update: { baseRateCents: dto.baseRateCents },
      create: ({ employeeId: dto.employeeId, baseRateCents: dto.baseRateCents } as any)
    });
  }
}

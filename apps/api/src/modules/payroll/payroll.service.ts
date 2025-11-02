import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreatePayrollRunDto, UpsertPayProfileDto } from './payroll.dto.js';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PayrollService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
  ) {}

  private getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) throw new UnauthorizedException('Missing tenant context');
    return tenantId;
  }

  async createRun(dto: CreatePayrollRunDto) {
    const tenantId = this.getTenantId();
    const start = new Date(dto.periodStart);
    const end = new Date(dto.periodEnd);
    const shifts = await this.prisma.shift.findMany({
      where: {
        tenantId,
        date: { gte: start, lte: end },
        ...(dto.locationId ? { locationId: dto.locationId } : {}),
      },
    });

    // Group by employee
    const byEmp = new Map<string, number>();
    for (const s of shifts) {
      if (s.shiftType === 'REST') continue;
      const hrs = 12; // assume 12 hour shifts for mining FIFO day/night
      byEmp.set(s.employeeId, (byEmp.get(s.employeeId) ?? 0) + hrs);
    }

    const run = await this.prisma.payrollRun.create({
      data: {
        periodStart: start,
        periodEnd: end,
        tenant: { connect: { id: tenantId } },
      },
    });
    let total = 0;
    for (const [employeeId, hours] of byEmp.entries()) {
      const profile = await this.prisma.payProfile.findUnique({
        where: { employeeId },
      });
      const rate = profile?.tenantId === tenantId ? profile.baseRateCents : 0;
      const amount = Math.round(rate * hours);
      total += amount;
      await this.prisma.payrollLine.create({
        data: {
          runId: run.id,
          employeeId,
          hours,
          amountCents: amount,
          tenantId,
          details: { note: 'Roster-driven calc' } as any,
        },
      });
    }
    await this.prisma.payrollRun.update({
      where: { id: run.id },
      data: { totalCents: total },
    });
    return this.prisma.payrollRun.findUnique({
      where: { id: run.id },
      include: { lines: true },
    });
  }

  listRuns() {
    const tenantId = this.getTenantId();
    return this.prisma.payrollRun.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { lines: true },
    });
  }

  getRun(id: string) {
    const tenantId = this.getTenantId();
    return this.prisma.payrollRun.findFirst({
      where: { id, tenantId },
      include: { lines: true },
    });
  }

  async getProfile(employeeId: string) {
    const tenantId = this.getTenantId();
    const profile = await this.prisma.payProfile.findUnique({
      where: { employeeId },
    });
    if (profile && profile.tenantId === tenantId) return profile;
    return { employeeId, baseRateCents: null, tenantId } as any;
  }

  async upsertProfile(dto: UpsertPayProfileDto) {
    const tenantId = this.getTenantId();
    const existing = await this.prisma.payProfile.findUnique({
      where: { employeeId: dto.employeeId },
    });
    if (existing && existing.tenantId !== tenantId) {
      throw new ForbiddenException(
        'Cannot modify pay profile belonging to another tenant',
      );
    }
    return this.prisma.payProfile.upsert({
      where: { employeeId: dto.employeeId },
      update: { baseRateCents: dto.baseRateCents, tenantId },
      create: {
        employeeId: dto.employeeId,
        baseRateCents: dto.baseRateCents,
        tenantId,
      },
    });
  }
}

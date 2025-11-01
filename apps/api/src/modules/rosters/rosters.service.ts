import { Injectable } from '@nestjs/common';
import { CreateRosterTemplateDto, AssignRosterDto, GenerateShiftsDto, ShiftVm } from './rosters.dto.js';
import { PrismaService } from '../../common/prisma.service.js';
import type { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';

type RosterAssignmentWithRelations = Prisma.RosterAssignmentGetPayload<{
  include: { template: true; employee: true; location: true };
}>;

type RosterAssignmentWithTemplate = Prisma.RosterAssignmentGetPayload<{
  include: { template: true };
}>;

@Injectable()
export class RostersService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  private getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new Error('Tenant context is required for roster operations');
    }
    return tenantId;
  }

  async listTemplates() {
    const tenantId = this.getTenantId();
    return this.prisma.rosterTemplate.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async createTemplate(dto: CreateRosterTemplateDto) {
    const tenantId = this.getTenantId();
    return this.prisma.rosterTemplate.create({
      data: ({
        tenantId,
        name: dto.name,
        seedDate: new Date(dto.seedDate),
        pattern: dto.pattern as any
      } as any)
    });
  }

  async listAssignments(employeeId?: string) {
    const tenantId = this.getTenantId();
    const where = employeeId ? { employeeId } : undefined;
    const items: RosterAssignmentWithRelations[] = await this.prisma.rosterAssignment.findMany({
      where: { tenantId, ...where },
      orderBy: { createdAt: 'desc' },
      include: { template: true, employee: true, location: true }
    });
    return items.map((assignment) => ({
      id: assignment.id,
      employeeId: assignment.employeeId,
      employeeName: assignment.employee
        ? `${assignment.employee.givenName} ${assignment.employee.familyName}`
        : undefined,
      templateId: assignment.templateId,
      templateName: assignment.template?.name,
      locationId: assignment.locationId ?? undefined,
      locationName: assignment.location?.name,
      effectiveFrom: assignment.effectiveFrom,
      effectiveTo: assignment.effectiveTo ?? undefined
    }));
  }

  async assign(dto: AssignRosterDto & { templateId: string }) {
    const tenantId = this.getTenantId();
    return this.prisma.rosterAssignment.create({
      data: ({
        tenantId,
        templateId: dto.templateId,
        employeeId: dto.employeeId,
        locationId: dto.locationId,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined
      } as any)
    });
  }

  async generateShifts(dto: GenerateShiftsDto): Promise<ShiftVm[]> {
    const tenantId = this.getTenantId();
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    const whereAssign: any = {
      tenantId,
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: from } }],
      effectiveFrom: { lte: to }
    };
    if (dto.employeeId) whereAssign.employeeId = dto.employeeId;
    const assignments: RosterAssignmentWithTemplate[] = await this.prisma.rosterAssignment.findMany({
      where: whereAssign,
      include: { template: true }
    });
    const out: ShiftVm[] = [];
    for (const assignment of assignments) {
      const seed = assignment.template.seedDate;
      const pattern: string[] = (assignment.template.pattern as any) ?? [];
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const inWindow =
          (!assignment.effectiveFrom || assignment.effectiveFrom <= d) &&
          (!assignment.effectiveTo || d <= assignment.effectiveTo);
        if (!inWindow) continue;
        const daysFromSeed = Math.floor((d.getTime() - new Date(seed).getTime()) / (1000 * 60 * 60 * 24));
        const idx = ((daysFromSeed % pattern.length) + pattern.length) % pattern.length;
        const token = pattern[idx];
        const shiftType = token === 'D' ? 'DAY' : token === 'N' ? 'NIGHT' : 'REST';
        out.push({
          id: `${assignment.id}:${d.toISOString().slice(0, 10)}`,
          employeeId: assignment.employeeId,
          date: d.toISOString().slice(0, 10),
          shiftType
        });
      }
    }
    return out;
  }
}

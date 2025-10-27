import { Injectable } from '@nestjs/common';
import { CreateRosterTemplateDto, AssignRosterDto, GenerateShiftsDto, ShiftVm } from './rosters.dto.js';
import { PrismaService } from '../../common/prisma.service.js';

@Injectable()
export class RostersService {
  constructor(private readonly prisma: PrismaService) {}

  async listTemplates() {
    return this.prisma.rosterTemplate.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createTemplate(dto: CreateRosterTemplateDto) {
    return this.prisma.rosterTemplate.create({
      data: ({
        name: dto.name,
        seedDate: new Date(dto.seedDate),
        pattern: dto.pattern as any
      } as any)
    });
  }

  async listAssignments() {
    const items = await this.prisma.rosterAssignment.findMany({
      orderBy: { createdAt: 'desc' },
      include: { template: true, employee: true, location: true }
    });
    return items.map((a) => ({
      id: a.id,
      employeeId: a.employeeId,
      employeeName: a.employee ? `${a.employee.givenName} ${a.employee.familyName}` : undefined,
      templateId: a.templateId,
      templateName: a.template?.name,
      locationId: a.locationId ?? undefined,
      locationName: a.location?.name,
      effectiveFrom: a.effectiveFrom,
      effectiveTo: a.effectiveTo ?? undefined
    }));
  }

  async assign(dto: AssignRosterDto & { templateId: string }) {
    return this.prisma.rosterAssignment.create({
      data: ({
        templateId: dto.templateId,
        employeeId: dto.employeeId,
        locationId: dto.locationId,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined
      } as any)
    });
  }

  async generateShifts(dto: GenerateShiftsDto): Promise<ShiftVm[]> {
    const from = new Date(dto.from);
    const to = new Date(dto.to);
    const whereAssign: any = { OR: [{ effectiveTo: null }, { effectiveTo: { gte: from } }], effectiveFrom: { lte: to } };
    if (dto.employeeId) whereAssign.employeeId = dto.employeeId;
    const assignments = await this.prisma.rosterAssignment.findMany({
      where: whereAssign,
      include: { template: true }
    });
    const out: ShiftVm[] = [];
    for (const a of assignments) {
      const seed = a.template.seedDate;
      const pattern: string[] = (a.template.pattern as any) ?? [];
      for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
        const inWindow = (!a.effectiveFrom || a.effectiveFrom <= d) && (!a.effectiveTo || d <= a.effectiveTo);
        if (!inWindow) continue;
        const daysFromSeed = Math.floor((d.getTime() - new Date(seed).getTime()) / (1000 * 60 * 60 * 24));
        const idx = ((daysFromSeed % pattern.length) + pattern.length) % pattern.length;
        const token = pattern[idx];
        const shiftType = token === 'D' ? 'DAY' : token === 'N' ? 'NIGHT' : 'REST';
        out.push({ id: `${a.id}:${d.toISOString().slice(0,10)}`, employeeId: a.employeeId, date: d.toISOString().slice(0, 10), shiftType });
      }
    }
    return out;
  }
}

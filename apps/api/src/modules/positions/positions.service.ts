import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreatePositionDto, EditPositionDto, SubmitPositionDto, ApprovePositionDto } from './positions.dto.js';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatHumanId(prefix: string, n: number, width = 3, hyphen = false) {
    const num = n.toString().padStart(width, '0');
    return hyphen ? `${prefix}-${num}` : `${prefix}${num}`;
  }

  async reserveHumanId(departmentId: string) {
    const dept = await (this.prisma as any).department.findUnique({ where: { id: departmentId } });
    if (!dept) throw new BadRequestException('Invalid department');
    if ((dept as any).status && (dept as any).status !== 'ACTIVE') throw new BadRequestException('Department inactive');
    let counter = await (this.prisma as any).positionIdCounter.findUnique({ where: { departmentId } });
    if (!counter) {
      counter = await (this.prisma as any).positionIdCounter.create({ data: ({ departmentId, nextNumber: 1 } as any) });
    }
    const human = this.formatHumanId(dept.codePrefix ?? '', counter.nextNumber, counter.width ?? 3, counter.hyphenStyle ?? false);
    await (this.prisma as any).positionIdCounter.update({ where: { departmentId }, data: { nextNumber: counter.nextNumber + 1 } });
    return human;
  }

  async create(dto: CreatePositionDto, createdByEmployeeId?: string) {
    if (dto.budgetStatus === 'UNBUDGETED' && !dto.justification) {
      throw new BadRequestException('Justification required for Unbudgeted positions');
    }
    const humanId = await this.reserveHumanId(dto.departmentId);
    const pos = await (this.prisma as any).position.create({
      data: ({
        title: dto.title,
        positionHumanId: humanId,
        departmentId: dto.departmentId,
        orgUnitId: dto.orgUnitId,
        employmentType: dto.employmentType,
        workType: dto.workType,
        fte: dto.fte,
        location: dto.location,
        reportsToId: dto.reportsToId,
        budgetStatus: dto.budgetStatus,
        status: 'PENDING',
        effectiveFrom: new Date(dto.effectiveFrom),
        justification: dto.justification,
        createdByEmployeeId
      } as any)
    });
    return pos;
  }

  async get(id: string) {
    const pos = await (this.prisma as any).position.findUnique({ where: { id }, include: { department: true } });
    if (!pos) throw new NotFoundException('Position not found');
    const approvals = await (this.prisma as any).positionApproval.findMany({ where: { positionId: id }, include: { step: true }, orderBy: { createdAt: 'asc' } });
    return { ...pos, approvals } as any;
  }

  async edit(id: string, dto: EditPositionDto) {
    const current = await (this.prisma as any).position.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Position not found');
    if (current.status !== 'PENDING') throw new BadRequestException('Only Pending positions can be edited');
    let data: any = { ...dto };
    if (dto.effectiveFrom) data.effectiveFrom = new Date(dto.effectiveFrom);
    if (dto.effectiveTo) data.effectiveTo = new Date(dto.effectiveTo);
    if (dto.departmentId && dto.departmentId !== current.departmentId) {
      // Re-reserve a new human id with new prefix
      data.positionHumanId = await this.reserveHumanId(dto.departmentId);
    }
    const pos = await (this.prisma as any).position.update({ where: { id }, data });
    return pos;
  }

  async submit(id: string, _dto: SubmitPositionDto) {
    const pos = await (this.prisma as any).position.findUnique({ where: { id } });
    if (!pos) throw new NotFoundException('Position not found');
    if (pos.status !== 'PENDING') throw new BadRequestException('Only Pending positions can be submitted');
    const steps = await (this.prisma as any).approvalStep.findMany({ orderBy: { sequence: 'asc' } });
    // Ensure at least one approver step
    if (steps.length === 0) throw new BadRequestException('No approval steps configured');
    // Ensure Finance (or equivalent) approval for Unbudgeted positions
    const needsFinance = pos.budgetStatus === 'UNBUDGETED' && !steps.some((s: any) => String(s.roleRequired || '').toUpperCase().includes('FINANCE'));
    const allSteps = needsFinance
      ? [...steps, { id: 'finance-ad-hoc', name: 'Finance', roleRequired: 'FINANCE', sequence: steps.length + 1, slaDays: 3 } as any]
      : steps;
    for (const s of allSteps) {
      await (this.prisma as any).positionApproval.create({
        data: ({ positionId: pos.id, stepId: s.id, action: 'SUBMITTED' } as any)
      });
    }
    return { ok: true };
  }

  async approve(id: string, dto: ApprovePositionDto, actorEmployeeId?: string) {
    const pos = await (this.prisma as any).position.findUnique({ where: { id } });
    if (!pos) throw new NotFoundException('Position not found');
    const approval = await (this.prisma as any).positionApproval.findFirst({ where: { positionId: id, stepId: dto.stepId } });
    if (!approval) throw new BadRequestException('Unknown approval step');
    const action = dto.action === 'approve' ? 'APPROVED' : 'REJECTED';
    await (this.prisma as any).positionApproval.update({ where: { id: approval.id }, data: ({ action, comment: dto.comment, approverEmployeeId: actorEmployeeId, actedAt: new Date() } as any) });
    if (action === 'REJECTED') {
      // back to Pending / changes requested
      await (this.prisma as any).position.update({ where: { id }, data: { status: 'PENDING' } });
      return { ok: true, status: 'PENDING' } as any;
    }
    // If all approvals approved, mark approvalsAudit and keep as Pending until activation
    const remaining = await (this.prisma as any).positionApproval.count({ where: { positionId: id, action: { not: 'APPROVED' } as any } });
    if (remaining === 0) {
      await (this.prisma as any).position.update({ where: { id }, data: { approvalsAudit: ({ completedAt: new Date() } as any) } });
    }
    return { ok: true };
  }

  async activate(id: string) {
    const pos = await (this.prisma as any).position.findUnique({ where: { id } });
    if (!pos) throw new NotFoundException('Position not found');
    const remaining = await (this.prisma as any).positionApproval.count({ where: { positionId: id, action: { not: 'APPROVED' } as any } });
    if (remaining > 0) throw new BadRequestException('All approvals must be completed before activation');
    await (this.prisma as any).position.update({ where: { id }, data: { status: 'ACTIVE' } });
    return { ok: true };
  }

  async listForOrg(status?: 'pending' | 'active') {
    const where: any = {};
    if (status === 'pending') where.status = 'PENDING';
    if (status === 'active') where.status = 'ACTIVE';
    const list = await (this.prisma as any).position.findMany({ where, orderBy: { createdAt: 'desc' } });
    return list;
  }
}

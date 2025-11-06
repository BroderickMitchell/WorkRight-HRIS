import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import {
  AssignUserDto,
  CreateJobRoleDto,
  CreatePositionDto,
  ListPositionsQueryDto,
  OrgChartQueryDto,
  UpdateJobRoleDto,
  UpdatePositionConfigDto,
  UpdatePositionDto
} from './positions.dto.js';

type Tx = Prisma.TransactionClient;

type PositionDetail = Prisma.PositionGetPayload<{
  include: {
    department: true;
    location: true;
    jobRole: true;
    parent: { select: { id: true; title: true; positionId: true } };
    assignments: {
      include: {
        employee: {
          select: {
            id: true;
            givenName: true;
            familyName: true;
            preferredName: true;
            email: true;
            departmentId: true;
            locationId: true;
            managerId: true;
            positionId: true
          };
        };
      };
      orderBy: { startDate: 'asc' };
    };
  };
}>;

const ACTIVE_ASSIGNMENT_CONDITION = {
  startDate: { lte: new Date() },
  OR: [{ endDate: null }, { endDate: { gte: new Date() } }]
};

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  private getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    return tenantId;
  }

  private decimalToNumber(value: Prisma.Decimal | number | null | undefined): number | null {
    if (value == null) return null;
    return Number(value);
  }

  private isAssignmentActive(assignment: { startDate: Date; endDate: Date | null }): boolean {
    const now = new Date();
    return assignment.startDate <= now && (!assignment.endDate || assignment.endDate >= now);
  }

  private computeVacancyStatus(position: { isActive: boolean; headcount: number }, assignments: { startDate: Date; endDate: Date | null }[]) {
    if (!position.isActive) return 'inactive';
    const activeAssignments = assignments.filter((assignment) => this.isAssignmentActive(assignment));
    if (activeAssignments.length === 0) return 'open';
    if (activeAssignments.length > position.headcount) return 'overfilled';
    if (activeAssignments.length === position.headcount) return 'filled';
    return 'open';
  }

  private async getConfig(client: Tx | PrismaService, tenantId: string) {
    let config = await client.positionManagementConfig.findUnique({ where: { tenantId } });
    if (!config) {
      config = await client.positionManagementConfig.create({ data: ({ tenantId } as any) });
    }
    return config;
  }

  private formatPositionId(config: Prisma.PositionManagementConfig, nextNumber: number, hintPrefix?: string) {
    const num = nextNumber.toString().padStart(4, '0');
    const prefix = (hintPrefix ?? config.idPrefix ?? '').trim();
    const format = config.positionIdFormat ?? 'number';
    switch (format) {
      case 'prefix':
        return prefix ? `${prefix}-${num}` : num;
      case 'suffix':
        return prefix ? `${num}-${prefix}` : num;
      case 'initials':
        return prefix ? `${prefix}${num}`.toUpperCase() : num;
      default:
        return num;
    }
  }

  private async ensureUniquePositionId(client: Tx | PrismaService, tenantId: string, positionId: string, excludeId?: string) {
    const existing = await client.position.findFirst({
      where: {
        tenantId,
        positionId,
        id: excludeId ? { not: excludeId } : undefined
      }
    });
    if (existing) throw new BadRequestException('Position ID already exists for this tenant');
  }

  private async ensureNoCycle(client: Tx | PrismaService, positionId: string, parentId: string) {
    if (positionId === parentId) throw new BadRequestException('Position cannot report to itself');
    let cursor: string | null | undefined = parentId;
    while (cursor) {
      if (cursor === positionId) throw new BadRequestException('Circular hierarchy detected');
      const parent = await client.position.findUnique({ where: { id: cursor }, select: { parentPositionId: true } });
      cursor = parent?.parentPositionId ?? null;
    }
  }

  private mapAssignment(assignment: Prisma.UserPositionAssignmentGetPayload<{ include: { employee: true } }>) {
    return {
      id: assignment.id,
      employeeId: assignment.employeeId,
      employeeName: assignment.employee
        ? `${assignment.employee.preferredName ?? assignment.employee.givenName} ${assignment.employee.familyName}`
        : undefined,
      fte: this.decimalToNumber(assignment.fte),
      baseSalary: this.decimalToNumber(assignment.baseSalary),
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      isPrimary: assignment.isPrimary,
      reportsToOverrideId: assignment.reportsToOverrideId
    };
  }

  private serializePosition(position: PositionDetail) {
    return {
      id: position.id,
      positionId: position.positionId,
      title: position.title,
      jobRole: position.jobRole
        ? {
            id: position.jobRole.id,
            title: position.jobRole.title,
            description: position.jobRole.description,
            skills: (position.jobRole.skills as string[] | null) ?? [],
            goals: (position.jobRole.goals as string[] | null) ?? [],
            courses: (position.jobRole.courses as string[] | null) ?? [],
            competencies: (position.jobRole.competencies as string[] | null) ?? []
          }
        : null,
      department: position.department ? { id: position.department.id, name: position.department.name } : null,
      location: position.location ? { id: position.location.id, name: position.location.name } : null,
      parent: position.parent,
      headcount: position.headcount,
      budgetedFte: this.decimalToNumber(position.budgetedFte),
      budgetedSalary: this.decimalToNumber(position.budgetedSalary),
      inheritRoleData: position.inheritRoleData,
      isActive: position.isActive,
      vacancyStatus: this.computeVacancyStatus(position, position.assignments),
      assignments: position.assignments.map((assignment) => this.mapAssignment(assignment))
    };
  }

  private async propagateInheritance(client: Tx | PrismaService, positionId: string) {
    const position = await client.position.findUnique({
      where: { id: positionId },
      include: {
        assignments: { include: { employee: true } },
        parent: { include: { assignments: { include: { employee: true } } } }
      }
    });
    if (!position) return;

    const activeAssignments = position.assignments.filter((assignment) => this.isAssignmentActive(assignment));
    if (!position.inheritRoleData) {
      for (const assignment of activeAssignments) {
        if (assignment.employee.positionId !== position.id) {
          await client.employee.update({
            where: { id: assignment.employeeId },
            data: { positionId: position.id }
          });
        }
      }
      return;
    }

    const managerCandidate = (position.parent?.assignments ?? [])
      .filter((assignment) => this.isAssignmentActive(assignment))
      .sort((a, b) => (a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1))[0];
    const managerId = managerCandidate?.employeeId ?? null;

    for (const assignment of activeAssignments) {
      await client.employee.update({
        where: { id: assignment.employeeId },
        data: {
          departmentId: position.departmentId,
          locationId: position.locationId,
          positionId: position.id,
          managerId: assignment.reportsToOverrideId ?? managerId
        }
      });
    }

    const children = await client.position.findMany({ where: { parentPositionId: positionId }, select: { id: true } });
    for (const child of children) {
      await this.propagateInheritance(client, child.id);
    }
  }

  async list(query: ListPositionsQueryDto) {
    const tenantId = this.getTenantId();
    const positions = await this.prisma.position.findMany({
      where: {
        tenantId,
        departmentId: query.departmentId,
        isActive: query.includeInactive ? undefined : true
      },
      include: {
        department: true,
        location: true,
        jobRole: true,
        parent: { select: { id: true, title: true, positionId: true } },
        assignments: { where: ACTIVE_ASSIGNMENT_CONDITION, include: { employee: true } }
      },
      orderBy: [{ title: 'asc' }]
    });

    const mapped = positions.map((position) => this.serializePosition(position as PositionDetail));
    if (!query.includeVacancies) return mapped;
    return mapped.filter((record) => record.vacancyStatus === 'open' || record.vacancyStatus === 'overfilled');
  }

  async get(id: string) {
    const tenantId = this.getTenantId();
    const position = await this.prisma.position.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        location: true,
        jobRole: true,
        parent: { select: { id: true, title: true, positionId: true } },
        assignments: { include: { employee: true }, orderBy: { startDate: 'asc' } }
      }
    });
    if (!position) throw new NotFoundException('Position not found');
    return this.serializePosition(position as PositionDetail);
  }

  async create(dto: CreatePositionDto) {
    const tenantId = this.getTenantId();
    const actorId = this.cls.get<string>('actorId');
    return this.prisma.$transaction(async (tx) => {
      const config = await this.getConfig(tx, tenantId);
      let humanId = dto.positionId?.trim();
      if (humanId) {
        await this.ensureUniquePositionId(tx, tenantId, humanId);
      } else {
        if (!config.autoGeneratePositionIds) {
          throw new BadRequestException('Position ID required when auto-generation is disabled');
        }
        const nextNumber = config.nextSequenceNumber ?? config.startingNumber ?? 1;
        humanId = this.formatPositionId(config, nextNumber, dto.departmentId);
        await tx.positionManagementConfig.update({
          where: { tenantId },
          data: { nextSequenceNumber: nextNumber + 1 }
        });
      }

      const position = await tx.position.create({
        data: {
          tenantId,
          positionId: humanId,
          title: dto.title,
          jobRoleId: dto.jobRoleId ?? null,
          departmentId: dto.departmentId,
          locationId: dto.locationId,
          parentPositionId: dto.parentPositionId ?? null,
          headcount: dto.headcount ?? 1,
          budgetedFte: dto.budgetedFte != null ? new Prisma.Decimal(dto.budgetedFte) : null,
          budgetedSalary: dto.budgetedSalary != null ? new Prisma.Decimal(dto.budgetedSalary) : null,
          inheritRoleData: dto.inheritRoleData ?? true,
          isActive: dto.isActive ?? true,
          createdById: actorId ?? null,
          updatedById: actorId ?? null
        },
        include: {
          department: true,
          location: true,
          jobRole: true,
          parent: { select: { id: true, title: true, positionId: true } },
          assignments: { include: { employee: true } }
        }
      });
      await this.propagateInheritance(tx, position.id);
      return this.serializePosition(position as PositionDetail);
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    const tenantId = this.getTenantId();
    const actorId = this.cls.get<string>('actorId');
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.position.findFirst({ where: { id, tenantId } });
      if (!existing) throw new NotFoundException('Position not found');

      const updates: Prisma.PositionUpdateInput = { updatedById: actorId ?? existing.updatedById };
      if (dto.positionId && dto.positionId !== existing.positionId) {
        await this.ensureUniquePositionId(tx, tenantId, dto.positionId, id);
        updates.positionId = dto.positionId;
      }
      if (dto.title !== undefined) updates.title = dto.title;
      if (dto.jobRoleId !== undefined) updates.jobRoleId = dto.jobRoleId ?? null;
      if (dto.departmentId !== undefined) updates.departmentId = dto.departmentId;
      if (dto.locationId !== undefined) updates.locationId = dto.locationId;
      if (dto.parentPositionId !== undefined) {
        if (dto.parentPositionId) await this.ensureNoCycle(tx, id, dto.parentPositionId);
        updates.parentPositionId = dto.parentPositionId ?? null;
      }
      if (dto.headcount !== undefined) updates.headcount = dto.headcount;
      if (dto.budgetedFte !== undefined) {
        updates.budgetedFte = dto.budgetedFte != null ? new Prisma.Decimal(dto.budgetedFte) : null;
      }
      if (dto.budgetedSalary !== undefined) {
        updates.budgetedSalary = dto.budgetedSalary != null ? new Prisma.Decimal(dto.budgetedSalary) : null;
      }
      if (dto.inheritRoleData !== undefined) updates.inheritRoleData = dto.inheritRoleData;
      if (dto.isActive !== undefined) updates.isActive = dto.isActive;

      const position = await tx.position.update({
        where: { id },
        data: updates,
        include: {
          department: true,
          location: true,
          jobRole: true,
          parent: { select: { id: true, title: true, positionId: true } },
          assignments: { include: { employee: true } }
        }
      });
      await this.propagateInheritance(tx, position.id);
      return this.serializePosition(position as PositionDetail);
    });
  }

  async remove(id: string) {
    const tenantId = this.getTenantId();
    return this.prisma.$transaction(async (tx) => {
      const position = await tx.position.findFirst({
        where: { id, tenantId },
        include: { assignments: { where: ACTIVE_ASSIGNMENT_CONDITION }, children: { select: { id: true } } }
      });
      if (!position) throw new NotFoundException('Position not found');
      if (position.assignments.length > 0) {
        throw new BadRequestException('Cannot delete a position with active assignments');
      }
      if (position.children.length > 0) {
        throw new BadRequestException('Cannot delete a position that has child positions');
      }
      await tx.position.delete({ where: { id } });
      return { ok: true };
    });
  }

  async children(id: string) {
    const tenantId = this.getTenantId();
    const list = await this.prisma.position.findMany({
      where: { tenantId, parentPositionId: id },
      include: {
        department: true,
        location: true,
        jobRole: true,
        parent: { select: { id: true, title: true, positionId: true } },
        assignments: { where: ACTIVE_ASSIGNMENT_CONDITION, include: { employee: true } }
      },
      orderBy: [{ title: 'asc' }]
    });
    return list.map((position) => this.serializePosition(position as PositionDetail));
  }

  async orgChart(query: OrgChartQueryDto) {
    const tenantId = this.getTenantId();
    const positions = await this.prisma.position.findMany({
      where: {
        tenantId,
        isActive: query.includeInactive ? undefined : true
      },
      include: {
        department: true,
        location: true,
        parent: { select: { id: true } },
        assignments: { where: ACTIVE_ASSIGNMENT_CONDITION, include: { employee: true } }
      },
      orderBy: [{ title: 'asc' }]
    });

    const map = new Map<string, any>();
    const roots: any[] = [];
    for (const position of positions) {
      const node = {
        id: position.id,
        positionId: position.positionId,
        title: position.title,
        vacancyStatus: this.computeVacancyStatus(position, position.assignments),
        department: position.department ? { id: position.department.id, name: position.department.name } : null,
        location: position.location ? { id: position.location.id, name: position.location.name } : null,
        occupants: position.assignments.map((assignment) => this.mapAssignment(assignment)),
        children: [] as any[]
      };
      map.set(position.id, node);
    }
    for (const position of positions) {
      const node = map.get(position.id);
      if (position.parentPositionId && map.has(position.parentPositionId)) {
        map.get(position.parentPositionId).children.push(node);
      } else {
        roots.push(node);
      }
    }
    if (query.includeVacant) return roots;
    const filter = (node: any): any | null => {
      node.children = node.children.map(filter).filter(Boolean);
      if (node.vacancyStatus === 'filled' && node.children.length === 0) return null;
      return node;
    };
    return roots.map(filter).filter(Boolean);
  }

  async assignUser(positionId: string, dto: AssignUserDto) {
    const tenantId = this.getTenantId();
    return this.prisma.$transaction(async (tx) => {
      const position = await tx.position.findFirst({
        where: { id: positionId, tenantId },
        include: { assignments: { where: ACTIVE_ASSIGNMENT_CONDITION } }
      });
      if (!position) throw new NotFoundException('Position not found');
      const employee = await tx.employee.findFirst({ where: { id: dto.employeeId, tenantId } });
      if (!employee) throw new NotFoundException('Employee not found');

      const config = await this.getConfig(tx, tenantId);
      const activeAssignments = await tx.userPositionAssignment.findMany({
        where: { tenantId, employeeId: dto.employeeId, ...ACTIVE_ASSIGNMENT_CONDITION }
      });
      if (!config.enableConcurrentPositions && activeAssignments.length > 0) {
        throw new BadRequestException('Concurrent position assignments are disabled for this tenant');
      }

      const isPrimary = dto.isPrimary ?? true;
      if (isPrimary) {
        await tx.userPositionAssignment.updateMany({
          where: { tenantId, employeeId: dto.employeeId, ...ACTIVE_ASSIGNMENT_CONDITION, isPrimary: true },
          data: { isPrimary: false }
        });
      }

      let fte = dto.fte;
      let baseSalary = dto.baseSalary;
      if (config.enableBudgeting) {
        if (fte == null) fte = this.decimalToNumber(position.budgetedFte) ?? undefined;
        if (baseSalary == null) baseSalary = this.decimalToNumber(position.budgetedSalary) ?? undefined;
        if (fte == null) throw new BadRequestException('FTE is required when budgeting is enabled');
      }
      if (config.enableBudgeting && position.budgetedFte != null) {
        const totalAssigned = position.assignments.reduce((sum, assignment) => sum + (this.decimalToNumber(assignment.fte) ?? 0), 0);
        const nextTotal = totalAssigned + (fte ?? 0);
        if (nextTotal > Number(position.budgetedFte)) {
          throw new BadRequestException('Assigned FTE exceeds budgeted allocation');
        }
      }

      await tx.userPositionAssignment.create({
        data: {
          tenantId,
          employeeId: dto.employeeId,
          positionId: position.id,
          fte: fte != null ? new Prisma.Decimal(fte) : null,
          baseSalary: baseSalary != null ? new Prisma.Decimal(baseSalary) : null,
          startDate: new Date(dto.startDate),
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          isPrimary,
          reportsToOverrideId: dto.reportsToOverrideId ?? null
        }
      });

      await tx.employee.update({
        where: { id: dto.employeeId },
        data: {
          positionId: position.id,
          departmentId: position.departmentId,
          locationId: position.locationId,
          managerId: dto.reportsToOverrideId ?? employee.managerId
        }
      });

      await this.propagateInheritance(tx, position.id);
      return { ok: true };
    });
  }

  async removeUser(positionId: string, employeeId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.$transaction(async (tx) => {
      const position = await tx.position.findFirst({ where: { id: positionId, tenantId } });
      if (!position) throw new NotFoundException('Position not found');
      await tx.userPositionAssignment.deleteMany({ where: { tenantId, positionId, employeeId } });
      await this.propagateInheritance(tx, positionId);
      return { ok: true };
    });
  }

  async listJobRoles() {
    const tenantId = this.getTenantId();
    const roles = await this.prisma.jobRole.findMany({ where: { tenantId }, orderBy: { title: 'asc' } });
    return roles.map((role) => ({
      id: role.id,
      title: role.title,
      description: role.description,
      skills: (role.skills as string[] | null) ?? [],
      goals: (role.goals as string[] | null) ?? [],
      courses: (role.courses as string[] | null) ?? [],
      competencies: (role.competencies as string[] | null) ?? []
    }));
  }

  async createJobRole(dto: CreateJobRoleDto) {
    const tenantId = this.getTenantId();
    return this.prisma.jobRole.create({
      data: ({
        tenantId,
        title: dto.title,
        description: dto.description ?? null,
        skills: dto.skills ?? [],
        goals: dto.goals ?? [],
        courses: dto.courses ?? [],
        competencies: dto.competencies ?? []
      } as any)
    });
  }

  async updateJobRole(id: string, dto: UpdateJobRoleDto) {
    const tenantId = this.getTenantId();
    const existing = await this.prisma.jobRole.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Job role not found');
    return this.prisma.jobRole.update({
      where: { id },
      data: ({
        title: dto.title ?? existing.title,
        description: dto.description === undefined ? existing.description : dto.description,
        skills: dto.skills ?? (existing.skills as any),
        goals: dto.goals ?? (existing.goals as any),
        courses: dto.courses ?? (existing.courses as any),
        competencies: dto.competencies ?? (existing.competencies as any)
      } as any)
    });
  }

  async getConfigSettings() {
    const tenantId = this.getTenantId();
    return this.getConfig(this.prisma, tenantId);
  }

  async updateConfig(dto: UpdatePositionConfigDto) {
    const tenantId = this.getTenantId();
    const config = await this.getConfig(this.prisma, tenantId);
    const data: Prisma.PositionManagementConfigUpdateInput = {};
    if (dto.mode) data.mode = dto.mode;
    if (dto.showPositionIds !== undefined) data.showPositionIds = dto.showPositionIds;
    if (dto.autoGeneratePositionIds !== undefined) data.autoGeneratePositionIds = dto.autoGeneratePositionIds;
    if (dto.positionIdFormat) data.positionIdFormat = dto.positionIdFormat;
    if (dto.idPrefix !== undefined) data.idPrefix = dto.idPrefix;
    if (dto.startingNumber !== undefined) data.startingNumber = dto.startingNumber;
    if (dto.enableBudgeting !== undefined) data.enableBudgeting = dto.enableBudgeting;
    if (dto.enableConcurrentPositions !== undefined) data.enableConcurrentPositions = dto.enableConcurrentPositions;
    if (dto.startingNumber !== undefined && dto.nextSequenceNumber !== undefined && dto.nextSequenceNumber < dto.startingNumber) {
      throw new BadRequestException('Next sequence number must be greater than or equal to starting number');
    }
    if (dto.nextSequenceNumber !== undefined) data.nextSequenceNumber = dto.nextSequenceNumber;

    return this.prisma.positionManagementConfig.update({ where: { tenantId: config.tenantId }, data });
  }
}

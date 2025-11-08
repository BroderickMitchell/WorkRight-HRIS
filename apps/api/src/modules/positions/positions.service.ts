// src/modules/positions/positions.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Prisma, PositionManagementMode } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import {
  CreatePositionDto,
  UpdatePositionDto,
  AssignUserDto,
  CreateJobRoleDto,
  UpdateJobRoleDto
} from './dto/positions.dto';

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  private requireTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }
    return tenantId;
  }

  private getActorId(): string | undefined {
    return this.cls.get<string>('actorId') ?? undefined;
  }

  private decimalOrNull(value?: number | null): Prisma.Decimal | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return new Prisma.Decimal(value);
  }

  async orgChart(query?: { rootId?: string }) {
    const tenantId = this.requireTenantId();
    const parentFilter = query?.rootId ? { id: query.rootId } : { parentPositionId: null };
    const rootPositions = await this.prisma.position.findMany({
      where: { tenantId, ...parentFilter },
      include: {
        children: {
          where: { tenantId },
          orderBy: { title: 'asc' },
          select: { id: true, title: true, positionId: true, parentPositionId: true }
        },
        jobRole: { select: { id: true, title: true } }
      },
      orderBy: { title: 'asc' }
    });
    return rootPositions;
  }

  async list(query?: { q?: string; includeInactive?: boolean }) {
    const tenantId = this.requireTenantId();
    return this.prisma.position.findMany({
      where: {
        tenantId,
        ...(query?.q
          ? {
              OR: [
                { title: { contains: query.q, mode: 'insensitive' } },
                { positionId: { contains: query.q, mode: 'insensitive' } }
              ]
            }
          : {}),
        ...(query?.includeInactive ? {} : { isActive: true })
      },
      orderBy: [{ title: 'asc' }],
      include: {
        department: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } },
        jobRole: { select: { id: true, title: true } }
      }
    });
  }

  async get(id: string) {
    const tenantId = this.requireTenantId();
    const position = await this.prisma.position.findFirst({
      where: { id, tenantId },
      include: {
        department: true,
        location: true,
        jobRole: true,
        children: { select: { id: true, title: true } }
      }
    });
    if (!position) {
      throw new NotFoundException('Position not found');
    }
    return position;
  }

  async children(id: string) {
    const tenantId = this.requireTenantId();
    return this.prisma.position.findMany({
      where: { tenantId, parentPositionId: id },
      orderBy: { title: 'asc' },
      select: { id: true, title: true, positionId: true }
    });
  }

  private async ensureConfig(tenantId: string) {
    return this.prisma.positionManagementConfig.upsert({
      where: { tenantId },
      update: {},
      create: { tenantId, mode: PositionManagementMode.EMPLOYEE_LED }
    });
  }

  private async generatePositionId(tenantId: string, hintPrefix?: string | null) {
    const config = await this.ensureConfig(tenantId);
    const prefix = hintPrefix && hintPrefix.trim().length ? hintPrefix.trim().toUpperCase() : config.idPrefix;
    const sequence = config.nextSequenceNumber;
    const width = Math.max(String(config.startingNumber).length, String(sequence).length);
    const id = `${prefix}-${sequence.toString().padStart(width, '0')}`;
    await this.prisma.positionManagementConfig.update({
      where: { tenantId },
      data: { nextSequenceNumber: sequence + 1 }
    });
    return id;
  }

  async create(dto: CreatePositionDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.getActorId();
    const positionId = dto.positionId ?? (await this.generatePositionId(tenantId));

    return this.prisma.position.create({
      data: {
        tenantId,
        positionId,
        title: dto.title,
        jobRoleId: dto.jobRoleId ?? null,
        departmentId: dto.departmentId,
        locationId: dto.locationId,
        parentPositionId: dto.parentPositionId ?? null,
        headcount: dto.headcount ?? 1,
        budgetedFte: dto.budgetedFte !== undefined ? this.decimalOrNull(dto.budgetedFte) : undefined,
        budgetedSalary: dto.budgetedSalary !== undefined ? this.decimalOrNull(dto.budgetedSalary) : undefined,
        inheritRoleData: dto.inheritRoleData ?? true,
        isActive: dto.isActive ?? true,
        createdById: actorId,
        updatedById: actorId
      }
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.getActorId();
    const existing = await this.prisma.position.findFirst({
      where: { id, tenantId },
      select: { id: true }
    });
    if (!existing) {
      throw new NotFoundException('Position not found');
    }

    const data: Prisma.PositionUncheckedUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.positionId !== undefined) data.positionId = dto.positionId;
    if (dto.jobRoleId !== undefined) data.jobRoleId = dto.jobRoleId ?? null;
    if (dto.departmentId !== undefined) data.departmentId = dto.departmentId;
    if (dto.locationId !== undefined) data.locationId = dto.locationId;
    if (dto.parentPositionId !== undefined) data.parentPositionId = dto.parentPositionId ?? null;
    if (dto.headcount !== undefined) data.headcount = dto.headcount;
    if (dto.budgetedFte !== undefined)
      data.budgetedFte = dto.budgetedFte === null ? null : new Prisma.Decimal(dto.budgetedFte);
    if (dto.budgetedSalary !== undefined)
      data.budgetedSalary = dto.budgetedSalary === null ? null : new Prisma.Decimal(dto.budgetedSalary);
    if (dto.inheritRoleData !== undefined) data.inheritRoleData = dto.inheritRoleData;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (actorId !== undefined) data.updatedById = actorId ?? null;

    await this.prisma.position.update({
      where: { id: existing.id },
      data
    });

    return this.get(id);
  }

  async remove(id: string) {
    const tenantId = this.requireTenantId();
    const [childCount, assignmentCount] = await Promise.all([
      this.prisma.position.count({ where: { tenantId, parentPositionId: id } }),
      this.prisma.userPositionAssignment.count({ where: { tenantId, positionId: id } })
    ]);
    if (childCount > 0 || assignmentCount > 0) {
      throw new BadRequestException('Cannot delete a position with children or assignments');
    }
    const deleted = await this.prisma.position.deleteMany({ where: { id, tenantId } });
    if (!deleted.count) {
      throw new NotFoundException('Position not found');
    }
    return { id, deleted: true };
  }

  async assignUser(id: string, dto: AssignUserDto) {
    const tenantId = this.requireTenantId();
    const startDate = new Date(dto.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('startDate must be a valid ISO date');
    }
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('endDate must be a valid ISO date');
    }
    return this.prisma.userPositionAssignment.create({
      data: {
        tenantId,
        positionId: id,
        employeeId: dto.employeeId,
        fte: this.decimalOrNull(dto.fte ?? null),
        baseSalary: this.decimalOrNull(dto.baseSalary ?? null),
        startDate,
        endDate: endDate ?? null
      }
    });
  }

  async removeUser(id: string, employeeId: string) {
    const tenantId = this.requireTenantId();
    await this.prisma.userPositionAssignment.deleteMany({
      where: { tenantId, positionId: id, employeeId }
    });
    return { positionId: id, employeeId, removed: true };
  }

  async listJobRoles() {
    const tenantId = this.requireTenantId();
    return this.prisma.jobRole.findMany({
      where: { tenantId },
      orderBy: { title: 'asc' },
      select: { id: true, title: true }
    });
  }

  async createJobRole(dto: CreateJobRoleDto) {
    const tenantId = this.requireTenantId();
    return this.prisma.jobRole.create({
      data: {
        tenantId,
        title: dto.title,
        description: dto.description ?? null,
        skills: dto.skills ? toJson(dto.skills) : undefined,
        goals: dto.goals ? toJson(dto.goals) : undefined,
        courses: dto.courses ? toJson(dto.courses) : undefined,
        competencies: dto.competencies ? toJson(dto.competencies) : undefined
      }
    });
  }

  async updateJobRole(id: string, dto: UpdateJobRoleDto) {
    const tenantId = this.requireTenantId();
    const data: Prisma.JobRoleUpdateManyMutationInput = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.skills !== undefined) data.skills = dto.skills === null ? Prisma.JsonNull : toJson(dto.skills);
    if (dto.goals !== undefined) data.goals = dto.goals === null ? Prisma.JsonNull : toJson(dto.goals);
    if (dto.courses !== undefined) data.courses = dto.courses === null ? Prisma.JsonNull : toJson(dto.courses);
    if (dto.competencies !== undefined)
      data.competencies = dto.competencies === null ? Prisma.JsonNull : toJson(dto.competencies);
    const result = await this.prisma.jobRole.updateMany({
      where: { id, tenantId },
      data
    });
    if (!result.count) {
      throw new NotFoundException('Job role not found');
    }
    return this.prisma.jobRole.findFirst({ where: { id, tenantId } });
  }

  async getConfigSettings() {
    const tenantId = this.requireTenantId();
    return this.ensureConfig(tenantId);
  }

  async updateConfig(dto: Record<string, unknown>) {
    const tenantId = this.requireTenantId();
    const config = await this.ensureConfig(tenantId);
    const updates: Prisma.PositionManagementConfigUpdateInput = {};

    if (typeof dto['mode'] === 'string' && dto['mode'] in PositionManagementMode) {
      updates.mode = dto['mode'] as PositionManagementMode;
    }
    if (typeof dto['showPositionIds'] === 'boolean') updates.showPositionIds = dto['showPositionIds'];
    if (typeof dto['autoGeneratePositionIds'] === 'boolean') updates.autoGeneratePositionIds = dto['autoGeneratePositionIds'];
    if (typeof dto['idPrefix'] === 'string' && dto['idPrefix'].trim()) updates.idPrefix = dto['idPrefix'].trim().toUpperCase();
    if (typeof dto['startingNumber'] === 'number') updates.startingNumber = dto['startingNumber'];
    if (typeof dto['nextSequenceNumber'] === 'number') updates.nextSequenceNumber = dto['nextSequenceNumber'];
    if (typeof dto['enableBudgeting'] === 'boolean') updates.enableBudgeting = dto['enableBudgeting'];
    if (typeof dto['enableConcurrentPositions'] === 'boolean') updates.enableConcurrentPositions = dto['enableConcurrentPositions'];

    if (Object.keys(updates).length === 0) {
      return config;
    }

    return this.prisma.positionManagementConfig.update({
      where: { tenantId },
      data: updates
    });
  }
}

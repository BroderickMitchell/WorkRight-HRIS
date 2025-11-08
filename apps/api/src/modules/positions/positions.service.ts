// src/modules/positions/positions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

export interface CreatePositionDto {
  departmentId: string;
  locationId: string;
  jobRoleId?: string | null;
  parentPositionId?: string | null;
  title: string;
  hintPrefix?: string;
}

export interface UpdatePositionDto extends Partial<CreatePositionDto> {}

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async orgChart(query?: { rootId?: string }) {
    const rootId = query?.rootId ?? null;
    const positions = await this.prisma.position.findMany({
      where: { parentPositionId: rootId },
      include: { children: true, jobRole: true },
      orderBy: { title: 'asc' },
    });
    return positions;
  }

  async list(query?: { q?: string }) {
    return this.prisma.position.findMany({
      where: query?.q ? { title: { contains: query.q, mode: 'insensitive' } } : {},
      orderBy: { title: 'asc' },
    });
  }

  async get(id: string) {
    const pos = await this.prisma.position.findUnique({ where: { id } });
    if (!pos) throw new Error('Position not found');
    return pos;
  }

  async children(id: string) {
    return this.prisma.position.findMany({ where: { parentPositionId: id } });
  }

  private async generatePositionId(tenantId: string, hintPrefix?: string) {
    // replace with your own generator
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return [hintPrefix ?? 'POS', suffix].join('-');
  }

  async create(dto: CreatePositionDto) {
    const tenantId = 'default'; // obtain from context if applicable
    return this.prisma.position.create({
      data: {
        departmentId: dto.departmentId,
        locationId: dto.locationId,
        jobRoleId: dto.jobRoleId ?? null,
        parentPositionId: dto.parentPositionId ?? null,
        title: dto.title,
        positionId: await this.generatePositionId(tenantId, dto.hintPrefix),
      },
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    return this.prisma.position.update({
      where: { id },
      data: {
        title: dto.title,
        jobRoleId: dto.jobRoleId ?? undefined,
        parentPositionId: dto.parentPositionId ?? undefined,
      },
    });
  }

  async remove(id: string) {
    const [childCount, assignmentCount] = await Promise.all([
      this.prisma.position.count({ where: { parentPositionId: id } }),
      this.prisma.positionAssignment.count({ where: { positionId: id } }),
    ]);
    if (childCount || assignmentCount) {
      throw new Error('Cannot delete a position with children or assignments');
    }
    await this.prisma.position.delete({ where: { id } });
    return { id, deleted: true };
  }

  async assignUser(id: string, dto: { employeeId: string }) {
    return this.prisma.positionAssignment.create({
      data: { positionId: id, employeeId: dto.employeeId },
    });
  }

  async removeUser(id: string, employeeId: string) {
    await this.prisma.positionAssignment.deleteMany({
      where: { positionId: id, employeeId },
    });
    return { positionId: id, employeeId, removed: true };
  }

  async listJobRoles() {
    return this.prisma.jobRole.findMany({ orderBy: { name: 'asc' } });
  }

  async createJobRole(dto: { name: string }) {
    return this.prisma.jobRole.create({ data: { name: dto.name } });
  }

  async updateJobRole(id: string, dto: { name: string }) {
    return this.prisma.jobRole.update({ where: { id }, data: { name: dto.name } });
  }

  async getConfigSettings() {
    return this.prisma.config.findMany({ where: { scope: 'POSITIONS' } });
  }

  async updateConfig(dto: Record<string, unknown>) {
    // implement your config write; placeholder returns input
    return { updated: dto };
  }
}

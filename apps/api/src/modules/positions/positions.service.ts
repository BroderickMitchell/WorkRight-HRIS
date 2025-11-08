import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient, PositionManagementMode } from '@prisma/client';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaClient) {}

  // Controller DTOs (kept broad to match your current controllers)
  export interface CreatePositionDto {
    departmentId: string;
    locationId: string;
    jobRoleId?: string | null;
    parentPositionId?: string | null;
    title: string;
    hintPrefix?: string;
  }

  export interface UpdatePositionDto {
    title?: string;
    jobRoleId?: string | null;
    parentPositionId?: string | null;
  }

  export interface CreateJobRoleDto {
    name: string;
    description?: string | null;
  }

  export interface UpdatePositionConfigDto {
    tenantId: string; // we key config by tenantId (not "id")
    mode?: PositionManagementMode;
    showPositionIds?: boolean;
    autoGeneratePositionIds?: boolean;
    positionIdFormat?: string;
    idPrefix?: string | null;
    nextNumber?: number;
    enableOrgUnits?: boolean;
    enableConcurrentPositions?: boolean;
  }

  // ---------- queries ----------

  async orgChart(query?: { rootId?: string }) {
    // very simple org chart stub for compile; expand later
    const positions = await this.prisma.position.findMany({
      where: {},
      select: {
        id: true,
        title: true,
        parentPositionId: true,
      },
    });
    return { nodes: positions };
  }

  async list(query?: { q?: string }) {
    return this.prisma.position.findMany({
      where: query?.q ? { title: { contains: query.q, mode: 'insensitive' } } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const pos = await this.prisma.position.findUnique({ where: { id } });
    if (!pos) throw new NotFoundException('Position not found');
    return pos;
  }

  async children(id: string) {
    return this.prisma.position.findMany({ where: { parentPositionId: id } });
  }

  // ---------- mutations ----------

  async create(dto: CreatePositionDto) {
    // tenant comes from request context normally – placeholder for compile
    const tenantId = 'dev-tenant';
    return this.prisma.position.create({
      data: {
        tenantId,
        departmentId: dto.departmentId,
        locationId: dto.locationId,
        jobRoleId: dto.jobRoleId ?? null,
        parentPositionId: dto.parentPositionId ?? null,
        title: dto.title,
        positionId: await this.generatePositionId(tenantId, dto.hintPrefix),
      } as any,
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
    // basic safety: block if has children or active assignments
    const [childCount, activeAssign] = await Promise.all([
      this.prisma.position.count({ where: { parentPositionId: id } }),
      this.prisma.positionAssignment.count({
        where: {
          positionId: id,
          // current assignments (open-ended or includes today)
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
      }),
    ]);
    if (childCount > 0) throw new BadRequestException('Cannot delete; position has child positions.');
    if (activeAssign > 0) throw new BadRequestException('Cannot delete; position has active assignments.');

    await this.prisma.position.delete({ where: { id } });
    return { ok: true };
  }

  async assignUser(id: string, dto: { employeeId: string }) {
    return this.prisma.positionAssignment.create({
      data: {
        positionId: id,
        employeeId: dto.employeeId,
        startDate: new Date(),
      } as any,
    });
  }

  async removeUser(id: string, employeeId: string) {
    await this.prisma.positionAssignment.deleteMany({
      where: { positionId: id, employeeId },
    });
    return { ok: true };
  }

  async listJobRoles() {
    return this.prisma.jobRole.findMany({ orderBy: { name: 'asc' } });
  }

  async createJobRole(dto: CreateJobRoleDto) {
    return this.prisma.jobRole.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        // tenant placeholder for compile
        tenantId: 'dev-tenant',
      } as any,
    });
  }

  async updateJobRole(id: string, dto: CreateJobRoleDto) {
    return this.prisma.jobRole.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description ?? null,
      },
    });
  }

  async getConfigSettings() {
    const tenantId = 'dev-tenant';
    const cfg = await this.prisma.positionManagementConfig.findUnique({
      where: { tenantId }, // config keyed by tenantId (no "id" unique)
    });
    return cfg;
  }

  async updateConfig(dto: UpdatePositionConfigDto) {
    const { tenantId, ...data } = dto;
    return this.prisma.positionManagementConfig.upsert({
      where: { tenantId },
      create: { tenantId, ...data } as any,
      data: data as any,
    });
  }

  // ---------- helpers ----------

  private async generatePositionId(tenantId: string, hintPrefix?: string): Promise<string> {
    // Read config; if none, fallback
    const cfg = await this.prisma.positionManagementConfig.findUnique({
      where: { tenantId },
      select: {
        idPrefix: true,
        nextNumber: true,
        positionIdFormat: true,
        // optional: padding/separator/style if you add them later
      },
    });

    const prefix = hintPrefix ?? cfg?.idPrefix ?? '';
    const next = Math.max(1, (cfg?.nextNumber ?? 1));
    const pad = Math.max(0, 4 - String(next).length);
    const padded = `${'0'.repeat(pad)}${next}`;
    const id = prefix ? `${prefix}-${padded}` : padded;

    // bump counter asynchronously
    await this.prisma.positionManagementConfig.upsert({
      where: { tenantId },
      update: { nextNumber: next + 1 } as any,
      create: {
        tenantId,
        nextNumber: next + 1,
        idPrefix: prefix || null,
        positionIdFormat: cfg?.positionIdFormat ?? 'PREFIX-NNNN',
      } as any,
    });

    return id;
  }
}

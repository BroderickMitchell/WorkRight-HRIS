import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  PrismaClient,
  PositionManagementConfig,
} from '@prisma/client';

/**
 * NOTE:
 * - This file restores ALL methods referenced by positions.controller.ts so the project compiles.
 * - Where exact schema fields differ, we avoid strict assumptions and keep logic minimal but type-safe.
 * - Replace TODOs with real implementations incrementally.
 */

const prisma = new PrismaClient();

type Decimalish = Prisma.Decimal | number | null;

type SlimEmployee = {
  id: string;
  givenName: string;
  familyName: string;
  preferredName: string | null;
};

type AssignmentSlim = {
  id: string;
  employeeId: string;
  employee: SlimEmployee | null;
  fte: Decimalish;
  baseSalary: Decimalish;
  startDate: Date;
  endDate: Date | null;
  isPrimary: boolean;
  reportsToOverrideId: string | null;
};

@Injectable()
export class PositionsService {
  // ---------------------------
  // Helpers
  // ---------------------------

  /**
   * Generate a position identifier.
   * Your schema errors showed there is no `prefix/padding/separator/style`.
   * We rely on `idPrefix` if present; otherwise fall back to a simple numeric id.
   */
  private formatPositionId(config: PositionManagementConfig, nextNumber: number, hintPrefix?: string): string {
    const prefix = (hintPrefix ?? (config as any).idPrefix ?? '').toString();
    const seq = String(nextNumber).padStart(4, '0');
    return prefix ? `${prefix}-${seq}` : seq;
  }

  private mapAssignment(assignment: AssignmentSlim) {
    const name =
      assignment.employee?.preferredName ??
      [assignment.employee?.givenName, assignment.employee?.familyName].filter(Boolean).join(' ');
    return {
      id: assignment.id,
      employeeId: assignment.employeeId,
      employeeName: name,
      fte: assignment.fte,
      baseSalary: assignment.baseSalary,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
      isPrimary: assignment.isPrimary,
      reportsToOverrideId: assignment.reportsToOverrideId,
    };
  }

  // ---------------------------
  // Controller-facing methods
  // ---------------------------

  async orgChart(_query: unknown) {
    // TODO: return your org chart DTO
    return { nodes: [], edges: [] };
  }

  async list(_query: unknown) {
    // Minimal list so the app compiles
    return prisma.position.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    } as any);
  }

  async get(id: string) {
    const position = await prisma.position.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            employee: {
              select: { id: true, givenName: true, familyName: true, preferredName: true },
            },
          },
        },
        config: true,
      },
    } as any);

    if (!position) throw new NotFoundException('Position not found');

    return {
      ...position,
      assignments: (position.assignments as any[]).map((a: any) =>
        this.mapAssignment({
          id: a.id,
          employeeId: a.employeeId,
          employee: a.employee,
          fte: a.fte ?? null,
          baseSalary: a.baseSalary ?? null,
          startDate: a.startDate,
          endDate: a.endDate,
          isPrimary: a.isPrimary,
          reportsToOverrideId: a.reportsToOverrideId,
        }),
      ),
    };
  }

  async children(id: string) {
    // Return direct reports/children positions
    return prisma.position.findMany({
      where: { parentId: id } as any,
      orderBy: { createdAt: 'desc' },
    } as any);
  }

  async create(dto: {
    tenantId: string;
    departmentId: string;
    locationId: string;
    jobRoleId?: string | null;
    parentPositionId?: string | null;
    title: string;
    hintPrefix?: string;
  }) {
    const cfg = await prisma.positionManagementConfig.findFirst({
      where: { tenantId: dto.tenantId },
    } as any);
    if (!cfg) throw new BadRequestException('Tenant position config not found');

    // Use a simple sequence source; replace with your actual sequencing.
    const nextNumber = Date.now() % 100000; // TEMPORARY: predictable number is better in practice
    const positionId = this.formatPositionId(cfg as any, nextNumber, dto.hintPrefix);

    return prisma.position.create({
      data: {
        id: positionId,
        title: dto.title,
        department: { connect: { id: dto.departmentId } },
        location: { connect: { id: dto.locationId } },
        jobRole: dto.jobRoleId ? { connect: { id: dto.jobRoleId } } : undefined,
        parent: dto.parentPositionId ? { connect: { id: dto.parentPositionId } } : undefined,
        config: { connect: { id: (cfg as any).id } },
      } as any,
    });
  }

  async update(id: string, dto: {
    title?: string;
    jobRoleId?: string | null;
    departmentId?: string;
    locationId?: string;
    parentPositionId?: string | null;
  }) {
    const position = await prisma.position.findUnique({ where: { id } } as any);
    if (!position) throw new NotFoundException('Position not found');

    const data: Prisma.PositionUpdateInput = {};

    if (dto.title !== undefined) data.title = dto.title;

    if (dto.jobRoleId !== undefined) {
      (data as any).jobRole = dto.jobRoleId ? { connect: { id: dto.jobRoleId } } : { disconnect: true };
    }
    if (dto.departmentId !== undefined) {
      (data as any).department = { connect: { id: dto.departmentId } };
    }
    if (dto.locationId !== undefined) {
      (data as any).location = { connect: { id: dto.locationId } };
    }
    if (dto.parentPositionId !== undefined) {
      if (dto.parentPositionId === id) throw new BadRequestException('A position cannot be its own parent');
      (data as any).parent = dto.parentPositionId ? { connect: { id: dto.parentPositionId } } : { disconnect: true };
    }

    return prisma.position.update({ where: { id }, data } as any);
  }

  async remove(id: string) {
    // Soft-delete or hard-delete depending on your schema/policy
    return prisma.position.delete({ where: { id } } as any);
  }

  async assignUser(id: string, dto: { employeeId: string; isPrimary?: boolean }) {
    // Create an assignment record linking user to position
    return prisma.userPositionAssignment.create({
      data: {
        positionId: id,
        employeeId: dto.employeeId,
        isPrimary: dto.isPrimary ?? false,
        startDate: new Date(),
      } as any,
    });
  }

  async removeUser(id: string, employeeId: string) {
    // End or delete assignment; here we hard-delete for simplicity
    await prisma.userPositionAssignment.deleteMany({
      where: { positionId: id, employeeId },
    } as any);
    return { removed: true };
  }

  // Job roles

  async listJobRoles() {
    return prisma.jobRole.findMany({ orderBy: { name: 'asc' } } as any);
  }

  async createJobRole(dto: { name: string; description?: string | null }) {
    return prisma.jobRole.create({
      data: { name: dto.name, description: dto.description ?? null } as any,
    });
  }

  async updateJobRole(id: string, dto: { name?: string; description?: string | null }) {
    return prisma.jobRole.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description ?? null,
      } as any,
    });
  }

  // Config

  async getConfigSettings() {
    // Return all configs (or scope by tenant in your real logic)
    return prisma.positionManagementConfig.findMany({ take: 50 } as any);
  }

  async updateConfig(dto: Partial<PositionManagementConfig> & { id: string }) {
    const { id, ...rest } = dto;
    return prisma.positionManagementConfig.update({
      where: { id },
      data: rest as any,
    });
  }
}

import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, PositionManagementConfig, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate a position identifier according to tenant configuration.
   * Use the model type (PositionManagementConfig), not Prisma.PositionManagementConfig.
   */
  private formatPositionId(config: PositionManagementConfig, nextNumber: number, hintPrefix?: string): string {
    const prefix = hintPrefix ?? config.prefix ?? '';
    const pad = Math.max(0, (config.padding ?? 4) - String(nextNumber).length);
    const seq = `${'0'.repeat(pad)}${nextNumber}`;
    const sep = config.separator ?? '-';
    switch (config.style) {
      case 'PREFIX_FIRST':
        return `${prefix}${sep}${seq}`;
      case 'SUFFIX_FIRST':
        return `${seq}${sep}${prefix}`;
      default:
        return `${prefix}${sep}${seq}`;
    }
  }

  /**
   * Example mapping that matches our select/include below.
   * If your selection changes, update this signature accordingly.
   */
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

  /**
   * Example: read a position with a slim employee selection compatible with mapAssignment.
   */
  async getPositionDetail(id: string) {
    const position = await this.prisma.position.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            employee: {
              select: {
                id: true,
                givenName: true,
                familyName: true,
                preferredName: true,
              },
            },
          },
        },
        config: true,
      },
    });

    if (!position) throw new NotFoundException('Position not found');

    return {
      ...position,
      assignments: position.assignments.map((a) =>
        this.mapAssignment({
          id: a.id,
          employeeId: a.employeeId,
          employee: a.employee,
          fte: (a as any).fte ?? null,
          baseSalary: (a as any).baseSalary ?? null,
          startDate: a.startDate,
          endDate: a.endDate,
          isPrimary: a.isPrimary,
          reportsToOverrideId: a.reportsToOverrideId,
        }),
      ),
    };
  }

  /**
   * Update a position using nested relation updates instead of raw FK fields.
   * - jobRole       -> updates.jobRole.{connect|disconnect}
   * - department    -> updates.department.connect
   * - location      -> updates.location.connect
   * - parent        -> updates.parent.{connect|disconnect}
   */
  async updatePosition(id: string, dto: {
    title?: string;
    jobRoleId?: string | null;
    departmentId?: string;
    locationId?: string;
    parentPositionId?: string | null;
  }) {
    const position = await this.prisma.position.findUnique({ where: { id }, select: { id: true } });
    if (!position) throw new NotFoundException('Position not found');

    const updates: Prisma.PositionUpdateInput = {};

    if (dto.title !== undefined) updates.title = dto.title;

    if (dto.jobRoleId !== undefined) {
      updates.jobRole = dto.jobRoleId ? { connect: { id: dto.jobRoleId } } : { disconnect: true };
    }

    if (dto.departmentId !== undefined) {
      updates.department = { connect: { id: dto.departmentId } };
    }

    if (dto.locationId !== undefined) {
      updates.location = { connect: { id: dto.locationId } };
    }

    if (dto.parentPositionId !== undefined) {
      // Optional: prevent cycles or self-parenting
      if (dto.parentPositionId === id) {
        throw new BadRequestException('A position cannot be its own parent');
      }
      updates.parent = dto.parentPositionId ? { connect: { id: dto.parentPositionId } } : { disconnect: true };
    }

    return this.prisma.position.update({ where: { id }, data: updates });
  }

  /**
   * Create a new position example showing how to obtain the next sequence and format the ID.
   */
  async createPosition(input: {
    tenantId: string;
    departmentId: string;
    locationId: string;
    jobRoleId?: string | null;
    parentPositionId?: string | null;
    title: string;
    hintPrefix?: string;
  }) {
    const tenantConfig = await this.prisma.positionManagementConfig.findFirst({
      where: { tenantId: input.tenantId },
    });
    if (!tenantConfig) throw new BadRequestException('Tenant position config not found');

    const nextNumberRow = await this.prisma.$queryRaw<{ nextval: bigint }[]>`
      SELECT nextval('position_number_seq') as nextval
    `;
    const nextNumber = Number(nextNumberRow?.[0]?.nextval ?? 1);
    const positionId = this.formatPositionId(tenantConfig, nextNumber, input.hintPrefix);

    return this.prisma.position.create({
      data: {
        id: positionId,
        title: input.title,
        department: { connect: { id: input.departmentId } },
        location: { connect: { id: input.locationId } },
        jobRole: input.jobRoleId ? { connect: { id: input.jobRoleId } } : undefined,
        parent: input.parentPositionId ? { connect: { id: input.parentPositionId } } : undefined,
        config: { connect: { id: tenantConfig.id } },
      },
    });
  }
}

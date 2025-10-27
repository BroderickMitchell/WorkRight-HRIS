import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateEmployeeDto } from './directory.dto.js';

@Injectable()
export class DirectoryService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  createEmployee(dto: CreateEmployeeDto) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.employee.create({
      data: ({
        tenant: tenantId ? { connect: { id: tenantId } } : undefined,
        givenName: dto.givenName,
        familyName: dto.familyName,
        email: dto.email,
        startDate: new Date(dto.startDate),
        positionId: dto.positionId,
        managerId: dto.managerId ?? null
      } as any),
      include: {
        position: { include: { department: true } }
      }
    });
  }

  listEmployees(search?: string) {
    return this.prisma.employee.findMany({
      where: search
        ? {
            OR: [
              { givenName: { contains: search, mode: 'insensitive' } },
              { familyName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        : undefined,
      include: {
        position: { include: { department: true } },
        department: true,
        location: true,
        manager: { select: { id: true, givenName: true, familyName: true } }
      },
      orderBy: [{ givenName: 'asc' }, { familyName: 'asc' }]
    });
  }

  getEmployeeProfile(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        position: { include: { department: true } },
        department: true,
        location: true,
        manager: { select: { id: true, givenName: true, familyName: true, email: true } },
        directReports: {
          select: { id: true, givenName: true, familyName: true, email: true, position: { select: { title: true } } }
        },
        goals: true,
        leaveRequests: true,
        leaveBalances: true,
        reviews: true
      }
    });
  }
}

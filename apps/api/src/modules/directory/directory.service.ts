import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { CreateEmployeeDto } from './directory.dto.js';

@Injectable()
export class DirectoryService {
  constructor(private readonly prisma: PrismaService) {}

  createEmployee(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({
      data: {
        givenName: dto.givenName,
        familyName: dto.familyName,
        email: dto.email,
        startDate: new Date(dto.startDate),
        positionId: dto.positionId,
        managerId: dto.managerId ?? null
      },
      include: {
        position: true
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
      include: { position: true, manager: true }
    });
  }

  getEmployeeProfile(id: string) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        position: { include: { department: true } },
        manager: true,
        directReports: true,
        goals: true,
        leaveRequests: true
      }
    });
  }
}

import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import { AssignCourseDto, CreateCourseDto } from './learning.dto.js';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  createCourse(dto: CreateCourseDto) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.course.create({
      data: ({
        tenant: tenantId ? { connect: { id: tenantId } } : undefined,
        title: dto.title,
        summary: dto.summary,
        deliveryType: dto.deliveryType ?? 'Self-paced'
      } as any)
    });
  }

  assignCourse(courseId: string, dto: AssignCourseDto) {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.enrolment.createMany({
      data: dto.assigneeIds.map((assigneeId) => ({
        tenantId: tenantId!,
        courseId,
        assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
      })) as any
    });
  }

  listCourses() {
    const tenantId = this.cls.get('tenantId');
    return this.prisma.course.findMany({
      where: { tenantId },
      include: {
        modules: true,
        enrolments: true
      }
    });
  }
}

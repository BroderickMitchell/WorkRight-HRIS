import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { AssignCourseDto, CreateCourseDto } from './learning.dto.js';

@Injectable()
export class LearningService {
  constructor(private readonly prisma: PrismaService) {}

  createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({
      data: {
        title: dto.title,
        summary: dto.summary,
        deliveryType: dto.deliveryType ?? 'Self-paced'
      }
    });
  }

  assignCourse(courseId: string, dto: AssignCourseDto) {
    return this.prisma.enrolment.createMany({
      data: dto.assigneeIds.map((assigneeId) => ({
        courseId,
        assigneeId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined
      }))
    });
  }

  listCourses() {
    return this.prisma.course.findMany({
      include: {
        modules: true,
        enrolments: true
      }
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import { ClsService } from 'nestjs-cls';
import { CreateGoalDto, CreateReviewCycleDto } from './performance.dto.js';

@Injectable()
export class PerformanceService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  createGoal(dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: ({
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        weighting: dto.weighting,
        parentGoalId: dto.parentGoalId,
        ownerId: dto.ownerId
      } as any)
    });
  }

  listGoals(ownerId?: string) {
    return this.prisma.goal.findMany({
      where: ownerId ? { ownerId } : undefined,
      include: {
        owner: { select: { id: true, givenName: true, familyName: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    });
  }

  async createReviewCycle(dto: CreateReviewCycleDto) {
    const reviewCycle = await this.prisma.reviewCycle.create({
      data: ({
        name: dto.name,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate)
      } as any)
    });

    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new Error('Tenant context missing when creating review cycle participants');
    }
    await this.prisma.reviewParticipant.createMany({
      data: dto.participantIds.map((participantId, index) => ({
        tenantId,
        reviewCycleId: reviewCycle.id,
        participantId,
        order: index
      }))
    });

    return this.prisma.reviewCycle.findUnique({
      where: { id: reviewCycle.id },
      include: { participants: true }
    });
  }

  getReviewCycleSummary(id: string) {
    return this.prisma.reviewCycle.findUnique({
      where: { id },
      include: {
        participants: {
          orderBy: { order: 'asc' },
          include: {
            participant: true,
            reviews: { include: { reviewer: true } }
          }
        }
      }
    });
  }
}

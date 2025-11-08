// src/modules/onboarding-workflows/onboarding-workflows.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { SaveGraphDto } from './dto/save-graph.dto';
import { ActivateDto } from './dto/activate.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { CompleteNodeRunDto } from './dto/complete-node-run.dto';

// ✅ TYPES AT TOP LEVEL
export type ListQuery = { q?: string } | undefined;

@Injectable()
export class OnboardingWorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query?: ListQuery) {
    const where =
      typeof query === 'string'
        ? { name: { contains: query, mode: 'insensitive' as const } }
        : (query?.q
            ? { name: { contains: query.q, mode: 'insensitive' as const } }
            : ({} as Prisma.WorkflowWhereInput));

    return this.prisma.workflow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getResources() {
    // tailor to your schema
    return {
      forms: await this.prisma.formTemplate.findMany({ select: { id: true, name: true } }),
      roles: await this.prisma.jobRole.findMany({ select: { id: true, name: true } }),
    };
  }

  async create(dto: { name: string }) {
    return this.prisma.workflow.create({
      data: {
        name: dto.name,
        versions: { create: { status: 'DRAFT' } },
      },
    });
  }

  async getById(id: string) {
    const wf = await this.prisma.workflow.findUnique({
      where: { id },
      include: { versions: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    if (!wf) throw new Error('Workflow not found');
    return wf;
  }

  async updateMeta(id: string, dto: UpdateWorkflowDto) {
    return this.prisma.workflow.update({
      where: { id },
      data: {
        name: dto.name,
        // add other fields from dto as needed
      },
    });
  }

  async saveGraph(id: string, dto: SaveGraphDto) {
    const wf = await this.getById(id);
    const activeVersion = wf.versions[0];

    if (activeVersion?.status === 'DRAFT') {
      return this.prisma.workflowVersion.update({
        where: { id: activeVersion.id },
        data: { graph: dto.graph as any },
      });
    }

    return this.prisma.workflowVersion.create({
      data: {
        workflowId: id,
        status: 'DRAFT',
        graph: dto.graph as any,
      },
    });
  }

  async activate(id: string, dto: ActivateDto) {
    const versionId = dto.versionId ?? dto.workflowVersionId;
    await this.prisma.workflowVersion.updateMany({
      where: { workflowId: id, status: 'ACTIVE' },
      data: { status: 'ARCHIVED' },
    });
    return this.prisma.workflowVersion.update({
      where: { id: versionId },
      data: { status: 'ACTIVE' },
    });
  }

  async createRun(dto: CreateRunDto) {
    return this.prisma.workflowRun.create({
      data: {
        workflowId: dto.workflowId,
        workflowVersionId: dto.workflowVersionId,
        context: (dto.context ?? {}) as any,
        status: 'PENDING',
      },
    });
  }

  async getRun(id: string) {
    const run = await this.prisma.workflowRun.findUnique({
      where: { id },
      include: { workflow: true, version: true, nodeRuns: true },
    });
    if (!run) throw new Error('Run not found');
    return run;
  }

  async completeNodeRun(id: string, dto: CompleteNodeRunDto) {
    const nodeRunId = dto.nodeRunId ?? id;
    await this.prisma.workflowNodeRun.update({
      where: { id: nodeRunId },
      data: {
        status: 'COMPLETED',
        output: (dto.output ?? {}) as any,
        completedAt: new Date(),
      },
    });
    return { id: nodeRunId, status: 'COMPLETED' };
  }

  async updateFormInstances(formTemplateId: string) {
    const count = await this.prisma.formInstance.count({
      where: { templateId: formTemplateId },
    });
    return { updated: count };
  }
}

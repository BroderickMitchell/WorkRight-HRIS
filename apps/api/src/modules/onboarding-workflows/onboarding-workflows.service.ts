// src/modules/onboarding-workflows/onboarding-workflows.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service.js';
import {
  Prisma,
  WorkflowStatus,
  WorkflowVersionStatus,
  WorkflowRunStatus,
  WorkflowNodeRunStatus
} from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/create-workflow.dto';
import { SaveGraphDto } from './dto/save-graph.dto';
import { ActivateWorkflowDto } from './dto/activate-workflow.dto';
import { CreateRunDto } from './dto/create-run.dto';
import { CompleteNodeRunDto } from './dto/complete-node-run.dto';

export type ListQuery = { q?: string } | undefined;

const toJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

@Injectable()
export class OnboardingWorkflowsService {
  constructor(private readonly prisma: PrismaService, private readonly cls: ClsService) {}

  private requireTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context is required');
    }
    return tenantId;
  }

  private requireActorId(): string {
    const actorId = this.cls.get<string>('actorId');
    if (!actorId) {
      throw new UnauthorizedException('Actor context is required');
    }
    return actorId;
  }

  async list(query?: ListQuery) {
    const tenantId = this.requireTenantId();
    return this.prisma.workflow.findMany({
      where: {
        tenantId,
        ...(query?.q
          ? {
              name: {
                contains: query.q,
                mode: 'insensitive'
              }
            }
          : {})
      },
      orderBy: { createdAt: 'desc' },
      include: {
        activeVersion: true,
        draftVersion: true
      }
    });
  }

  async getResources() {
    const tenantId = this.requireTenantId();
    const [forms, roles] = await Promise.all([
      this.prisma.formTemplate.findMany({
        where: { tenantId },
        select: { id: true, name: true }
      }),
      this.prisma.jobRole.findMany({
        where: { tenantId },
        select: { id: true, title: true }
      })
    ]);

    return {
      forms,
      roles: roles.map((role) => ({ id: role.id, title: role.title }))
    };
  }

  async create(dto: CreateWorkflowDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.requireActorId();
    const emptyGraph: Prisma.JsonObject = { nodes: [], edges: [] };

    return this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          tenantId,
          name: dto.name,
          status: WorkflowStatus.DRAFT,
          createdById: actorId,
          updatedById: actorId
        }
      });

      const draftVersion = await tx.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          versionNumber: 1,
          status: WorkflowVersionStatus.DRAFT,
          graph: emptyGraph,
          createdById: actorId
        }
      });

      return tx.workflow.update({
        where: { id: workflow.id },
        data: {
          currentVersion: draftVersion.versionNumber,
          draftVersionId: draftVersion.id
        },
        include: {
          draftVersion: true,
          activeVersion: true
        }
      });
    });
  }

  async getById(id: string) {
    const tenantId = this.requireTenantId();
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
      include: {
        activeVersion: true,
        draftVersion: true,
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }
    return workflow;
  }

  async updateMeta(id: string, dto: UpdateWorkflowDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.requireActorId();
    const workflow = await this.prisma.workflow.updateMany({
      where: { id, tenantId },
      data: {
        name: dto.name,
        status: dto.status,
        updatedById: actorId
      }
    });

    if (!workflow.count) {
      throw new NotFoundException('Workflow not found');
    }

    return this.getById(id);
  }

  async saveGraph(id: string, dto: SaveGraphDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.requireActorId();
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
      include: {
        draftVersion: true,
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1
        }
      }
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const graph: Prisma.JsonObject = {
      nodes: dto.nodes.map((node) => ({ ...node })) as unknown as Prisma.JsonValue,
      edges: dto.edges.map((edge) => ({ ...edge })) as unknown as Prisma.JsonValue,
      metadata: (dto.metadata ?? {}) as Prisma.JsonValue
    };

    if (workflow.draftVersion) {
      return this.prisma.workflowVersion.update({
        where: { id: workflow.draftVersion.id },
        data: { graph }
      });
    }

    const nextVersionNumber = (workflow.versions[0]?.versionNumber ?? workflow.currentVersion ?? 0) + 1;
    const draftVersion = await this.prisma.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        versionNumber: nextVersionNumber,
        status: WorkflowVersionStatus.DRAFT,
        graph,
        createdById: actorId
      }
    });

    await this.prisma.workflow.update({
      where: { id: workflow.id },
      data: {
        currentVersion: nextVersionNumber,
        draftVersionId: draftVersion.id
      }
    });

    return draftVersion;
  }

  async activate(id: string, dto: ActivateWorkflowDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.requireActorId();

    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
      include: { draftVersion: true }
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const version = await this.prisma.workflowVersion.findFirst({
      where: { id: dto.workflowVersionId, workflowId: workflow.id }
    });
    if (!version) {
      throw new NotFoundException('Workflow version not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.workflowVersion.updateMany({
        where: { workflowId: workflow.id, status: WorkflowVersionStatus.ACTIVE },
        data: { status: WorkflowVersionStatus.ARCHIVED }
      });

      const existingMetadata =
        version.metadata && typeof version.metadata === 'object' && !Array.isArray(version.metadata)
          ? (version.metadata as Record<string, unknown>)
          : {};
      const metadataUpdate =
        dto.notes === undefined
          ? undefined
          : toJson({ ...existingMetadata, activationNotes: dto.notes });

      const updatedVersion = await tx.workflowVersion.update({
        where: { id: version.id },
        data: {
          status: WorkflowVersionStatus.ACTIVE,
          ...(metadataUpdate !== undefined ? { metadata: metadataUpdate } : {})
        }
      });

      await tx.workflow.update({
        where: { id: workflow.id },
        data: {
          status: WorkflowStatus.ACTIVE,
          activeVersionId: updatedVersion.id,
          draftVersionId: workflow.draftVersionId === updatedVersion.id ? null : workflow.draftVersionId,
          currentVersion: updatedVersion.versionNumber,
          updatedById: actorId
        }
      });

      return updatedVersion;
    });
  }

  async createRun(dto: CreateRunDto) {
    const tenantId = this.requireTenantId();
    const actorId = this.requireActorId();

    const workflow = await this.prisma.workflow.findFirst({
      where: { id: dto.workflowId, tenantId },
      select: { id: true, activeVersionId: true, draftVersionId: true }
    });
    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    const workflowVersionId =
      dto.workflowVersionId ?? workflow.activeVersionId ?? workflow.draftVersionId;
    if (!workflowVersionId) {
      throw new BadRequestException('Workflow does not have an available version to run');
    }

    const version = await this.prisma.workflowVersion.findFirst({
      where: { id: workflowVersionId, workflowId: workflow.id },
      select: { id: true }
    });
    if (!version) {
      throw new NotFoundException('Workflow version not found');
    }

    const startDate = new Date(dto.startDate);
    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('startDate must be a valid ISO date');
    }
    const endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('endDate must be a valid ISO date');
    }

    return this.prisma.workflowRun.create({
      data: {
        tenantId,
        workflowId: workflow.id,
        workflowVersionId: version.id,
        assigneeUserId: dto.assigneeUserId,
        startDate,
        endDate: endDate ?? null,
        status: WorkflowRunStatus.ACTIVE,
        metadata: dto.metadata ? toJson(dto.metadata) : undefined,
        createdById: actorId
      },
      include: {
        workflow: true,
        workflowVersion: true
      }
    });
  }

  async getRun(id: string) {
    const tenantId = this.requireTenantId();
    const run = await this.prisma.workflowRun.findFirst({
      where: { id, tenantId },
      include: {
        workflow: true,
        workflowVersion: true,
        nodeRuns: true
      }
    });
    if (!run) {
      throw new NotFoundException('Run not found');
    }
    return run;
  }

  async completeNodeRun(id: string, dto: CompleteNodeRunDto) {
    const tenantId = this.requireTenantId();
    const nodeRunId = dto.nodeRunId ?? id;
    const nodeRun = await this.prisma.nodeRun.findFirst({
      where: { id: nodeRunId, tenantId }
    });
    if (!nodeRun) {
      throw new NotFoundException('Node run not found');
    }

    const existingMetadata = (nodeRun.metadata as Record<string, unknown> | null) ?? {};
    const mergedMetadata = {
      ...existingMetadata,
      ...(dto.metadata ?? {}),
      ...(dto.output ? { output: dto.output } : {})
    };

    return this.prisma.nodeRun.update({
      where: { id: nodeRunId },
      data: {
        status: dto.status ?? WorkflowNodeRunStatus.COMPLETED,
        metadata: toJson(mergedMetadata),
        completedAt: new Date()
      }
    });
  }

  async updateFormInstances(formTemplateId: string) {
    const tenantId = this.requireTenantId();
    const count = await this.prisma.formTemplate.count({
      where: { tenantId, id: formTemplateId }
    });
    return { updated: count };
  }
}

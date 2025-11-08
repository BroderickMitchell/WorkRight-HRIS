import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaClient, WorkflowNodeType } from '@prisma/client';

/**
 * NOTE:
 * - This file defines ALL methods your controller calls so the project compiles.
 * - Where your schema requires extra fields (e.g. versionNumber, createdBy),
 *   the create/update methods accept parameters but use safe defaults so it builds.
 * - Replace the TODOs with your real logic as you iterate.
 */

const prisma = new PrismaClient();

/** Narrow helper types (adjust to your real DTOs as needed). */
export type JsonInput =
  | Prisma.InputJsonValue
  | Prisma.JsonNullValueInput
  | Prisma.NullableJsonNullValueInput;

export interface ConditionSettings {
  logic: 'ALL' | 'ANY';
  criteria: Array<{
    field: string;
    op: 'EQ' | 'NEQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'IN' | 'NIN' | 'CONTAINS';
    value: unknown;
  }>;
}

export type WorkflowNodeSettings = Record<string, unknown> | null;

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  name?: string | null;
  settings?: WorkflowNodeSettings;
  next?: string[]; // outgoing edge node ids
}

export interface WorkflowGraph {
  nodes: Record<string, WorkflowNode>;
  startId: string | null;
}

export interface ListQuery {
  workflowId?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
}

export interface CreateWorkflowDto {
  name: string;
  createdBy?: string; // required by your schema; defaulted when absent
  graph?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface UpdateMetaDto {
  metadata: Record<string, unknown> | null;
}

export interface SaveGraphDto {
  graph: Record<string, unknown> | null;
}

export interface ActivateDto {
  versionId: string;
}

export interface CreateRunDto {
  workflowId: string;
  subjectUserId: string;
  startedBy?: string | null;
}

export interface CompleteNodeRunDto {
  nodeRunId: string;
  output?: Record<string, unknown> | null;
}

@Injectable()
export class OnboardingWorkflowsService {
  /** Terminal node types (use enum members, not string literals). */
  private static readonly TERMINAL_NODE_TYPES: WorkflowNodeType[] = [
    WorkflowNodeType.EMAIL,
    WorkflowNodeType.SURVEY,
  ];

  // ---------------------------
  // Controller-facing methods
  // ---------------------------

  async list(query: ListQuery) {
    // Minimal, safe implementation so the app builds.
    return prisma.workflowVersion.findMany({
      where: {
        workflowId: query.workflowId,
        status: query.status,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getResources() {
    // Example: surface enum values and terminal list; adjust to your needs.
    return {
      nodeTypes: Object.values(WorkflowNodeType),
      terminalNodeTypes: OnboardingWorkflowsService.TERMINAL_NODE_TYPES,
    };
  }

  async create(dto: CreateWorkflowDto) {
    // Your schema likely requires createdBy/versionNumber — provide safe defaults.
    const createdBy = dto.createdBy ?? 'system';
    const wf = await prisma.workflow.create({
      data: {
        name: dto.name,
        // add tenant link etc. if your schema requires it
      },
    });

    // Create initial draft version so the UI has something to edit.
    const draft = await prisma.workflowVersion.create({
      data: {
        workflowId: wf.id,
        status: 'DRAFT',
        versionNumber: 1,
        createdBy,
        graph: dto.graph == null ? Prisma.JsonNull : (dto.graph as unknown as Prisma.InputJsonValue),
        metadata: dto.metadata == null ? Prisma.JsonNull : (dto.metadata as unknown as Prisma.InputJsonValue),
      },
    });

    return { workflow: wf, version: draft };
  }

  async getById(versionId: string) {
    const version = await prisma.workflowVersion.findUnique({
      where: { id: versionId },
      include: { workflow: true },
    });
    if (!version) throw new NotFoundException('Workflow version not found');
    return version;
  }

  async updateMeta(versionId: string, dto: UpdateMetaDto) {
    const version = await prisma.workflowVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Workflow version not found');
    if (version.status !== 'DRAFT') throw new BadRequestException('Only draft versions can be updated');

    return prisma.workflowVersion.update({
      where: { id: versionId },
      data: {
        metadata:
          dto.metadata == null ? Prisma.JsonNull : (dto.metadata as unknown as Prisma.InputJsonValue),
      },
    });
  }

  async saveGraph(versionId: string, dto: SaveGraphDto) {
    const version = await prisma.workflowVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Workflow version not found');
    if (version.status !== 'DRAFT') throw new BadRequestException('Only draft versions can be updated');

    return prisma.workflowVersion.update({
      where: { id: versionId },
      data: {
        graph: dto.graph == null ? Prisma.JsonNull : (dto.graph as unknown as Prisma.InputJsonValue),
      },
    });
  }

  async activate(_workflowId: string, dto: ActivateDto) {
    const draft = await prisma.workflowVersion.findUnique({ where: { id: dto.versionId } });
    if (!draft) throw new NotFoundException('Version not found');
    if (draft.status !== 'DRAFT') throw new BadRequestException('Only draft versions can be activated');

    // Deactivate current ACTIVE; activate this one; then ensure a new draft exists
    return prisma.$transaction(async (tx) => {
      await tx.workflowVersion.updateMany({
        where: { workflowId: draft.workflowId, status: 'ACTIVE' },
        data: { status: 'INACTIVE' },
      });

      const activated = await tx.workflowVersion.update({
        where: { id: draft.id },
        data: { status: 'ACTIVE' },
      });

      const existingDraft = await tx.workflowVersion.findFirst({
        where: { workflowId: draft.workflowId, status: 'DRAFT' },
      });

      if (!existingDraft) {
        await tx.workflowVersion.create({
          data: {
            workflowId: draft.workflowId,
            status: 'DRAFT',
            versionNumber: activated.versionNumber + 1,
            createdBy: activated.createdBy ?? 'system',
            graph:
              activated.graph === null
                ? Prisma.JsonNull
                : ((activated.graph as unknown) as Prisma.InputJsonValue),
            metadata:
              activated.metadata === null
                ? Prisma.JsonNull
                : ((activated.metadata as unknown) as Prisma.InputJsonValue),
          },
        });
      }

      return activated;
    });
  }

  async createRun(dto: CreateRunDto) {
    // Minimal placeholder to compile; wire to your real run tables.
    const run = await prisma.workflowRun.create({
      data: {
        workflowId: dto.workflowId,
        subjectUserId: dto.subjectUserId,
        startedBy: dto.startedBy ?? 'system',
        status: 'RUNNING',
        context: Prisma.JsonNull,
      } as any, // cast if your model differs
    });
    return run;
  }

  async getRun(runId: string) {
    const run = await prisma.workflowRun.findUnique({ where: { id: runId } as any }); // adjust model name if different
    if (!run) throw new NotFoundException('Run not found');
    return run;
  }

  async completeNodeRun(_runId: string, _dto: CompleteNodeRunDto) {
    // Placeholder — mark a node-run complete in your schema.
    return { ok: true };
  }

  async updateFormInstances(_formTemplateId: string) {
    // Placeholder — update instances derived from a template.
    return { updated: 0 };
  }

  // ---------------------------
  // Internal helpers (keep enum usage consistent to avoid TS errors)
  // ---------------------------

  private isTerminal(node: WorkflowNode): boolean {
    return OnboardingWorkflowsService.TERMINAL_NODE_TYPES.includes(node.type);
  }

  private handleNode(node: WorkflowNode) {
    switch (node.type) {
      case WorkflowNodeType.TASK:
      case WorkflowNodeType.FORM:
      case WorkflowNodeType.COURSE:
      case WorkflowNodeType.EMAIL:
      case WorkflowNodeType.PROFILE_TASK:
      case WorkflowNodeType.SURVEY:
      case WorkflowNodeType.DUMMY_TASK:
      case WorkflowNodeType.CONDITION:
        // TODO: implement per-node logic
        break;
      default:
        ((_: never) => _)(node.type);
    }
  }
}

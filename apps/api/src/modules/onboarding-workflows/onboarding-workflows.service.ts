import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, PrismaClient, WorkflowNodeType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Narrow interfaces used locally to keep the service self-contained and type-safe.
 * Adjust these to match your actual DTOs if needed.
 */
export type JsonInput = Prisma.InputJsonValue | Prisma.JsonNullValueInput | Prisma.NullableJsonNullValueInput;

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
  // Any other fields you use can live here.
}

export interface UpsertWorkflowVersionDto {
  id?: string;
  graph?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

@Injectable()
export class OnboardingWorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * These are terminal “end of flow” node types.
   * Use enum members (UPPERCASE) rather than string literals.
   */
  private static readonly TERMINAL_NODE_TYPES: WorkflowNodeType[] = [
    WorkflowNodeType.EMAIL,
    WorkflowNodeType.SURVEY,
  ];

  /** Create an initial draft version for a workflow. */
  async createDraftVersion(workflowId: string, initialGraph: WorkflowGraph | null = null) {
    const exists = await this.prisma.workflow.findUnique({ where: { id: workflowId }, select: { id: true } });
    if (!exists) throw new NotFoundException('Workflow not found');

    const created = await this.prisma.workflowVersion.create({
      data: {
        workflow: { connect: { id: workflowId } },
        status: 'DRAFT',
        graph: (initialGraph as unknown) as Prisma.InputJsonValue,
        metadata: Prisma.JsonNull,
      },
    });

    return created;
  }

  /** Update a draft version (graph/metadata). */
  async updateVersion(versionId: string, dto: UpsertWorkflowVersionDto) {
    const version = await this.prisma.workflowVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new NotFoundException('Workflow version not found');
    if (version.status !== 'DRAFT') throw new BadRequestException('Only draft versions can be updated');

    const graphInput: JsonInput | undefined =
      dto.graph === undefined
        ? undefined
        : (dto.graph === null ? Prisma.JsonNull : (dto.graph as unknown as Prisma.InputJsonValue));

    const metadataInput: JsonInput | undefined =
      dto.metadata === undefined
        ? undefined
        : (dto.metadata === null ? Prisma.JsonNull : (dto.metadata as unknown as Prisma.InputJsonValue));

    return this.prisma.workflowVersion.update({
      where: { id: versionId },
      data: {
        graph: graphInput,
        metadata: metadataInput,
      },
    });
  }

  /** Activate the current draft, cloning graph/metadata as necessary. */
  async activateVersion(workflowId: string, draftVersionId: string) {
    const [workflow, draft] = await this.prisma.$transaction([
      this.prisma.workflow.findUnique({
        where: { id: workflowId },
        include: { versions: { where: { id: draftVersionId } } },
      }),
      this.prisma.workflowVersion.findUnique({ where: { id: draftVersionId } }),
    ]);

    if (!workflow) throw new NotFoundException('Workflow not found');
    if (!draft) throw new NotFoundException('Draft version not found');
    if (draft.status !== 'DRAFT') throw new BadRequestException('Version is not a draft');

    // Mark all other versions as INACTIVE, then set this one ACTIVE
    return this.prisma.$transaction(async (tx) => {
      await tx.workflowVersion.updateMany({
        where: { workflowId, status: 'ACTIVE' },
        data: { status: 'INACTIVE' },
      });

      const activated = await tx.workflowVersion.update({
        where: { id: draftVersionId },
        data: { status: 'ACTIVE' },
      });

      // Optional: create a new draft forked from the now-active version
      await this.ensureDraftVersion(tx, workflowId, activated.id);

      return activated;
    });
  }

  /**
   * Ensure there is a draft version for a workflow by cloning the currently active version.
   * Uses correct Prisma JSON input types on writes.
   */
  private async ensureDraftVersion(
    tx: PrismaClient,
    workflowId: string,
    activeVersionId?: string,
  ) {
    const activeVersion =
      activeVersionId
        ? await tx.workflowVersion.findUnique({ where: { id: activeVersionId } })
        : await tx.workflowVersion.findFirst({ where: { workflowId, status: 'ACTIVE' } });

    if (!activeVersion) return;

    const existingDraft = await tx.workflowVersion.findFirst({ where: { workflowId, status: 'DRAFT' } });
    if (existingDraft) return;

    await tx.workflowVersion.create({
      data: {
        workflow: { connect: { id: workflowId } },
        status: 'DRAFT',
        graph: (activeVersion.graph as unknown) as Prisma.InputJsonValue,
        metadata:
          activeVersion.metadata === null
            ? Prisma.JsonNull
            : ((activeVersion.metadata as unknown) as Prisma.InputJsonValue),
      },
    });
  }

  /**
   * Example of branching behaviour with correct enum comparisons and settings casting.
   * Keep/extend this as your business logic requires.
   */
  private handleNode(node: WorkflowNode) {
    switch (node.type) {
      case WorkflowNodeType.TASK: {
        // …
        break;
      }
      case WorkflowNodeType.FORM: {
        // …
        break;
      }
      case WorkflowNodeType.COURSE: {
        // …
        break;
      }
      case WorkflowNodeType.EMAIL: {
        // …
        break;
      }
      case WorkflowNodeType.PROFILE_TASK: {
        // …
        break;
      }
      case WorkflowNodeType.SURVEY: {
        // …
        break;
      }
      case WorkflowNodeType.DUMMY_TASK: {
        // …
        break;
      }
      case WorkflowNodeType.CONDITION: {
        const settings: ConditionSettings =
          (node.settings as unknown as ConditionSettings) ?? { logic: 'ALL', criteria: [] };
        // …
        break;
      }
      default:
        // Exhaustive guard
        ((_: never) => _)(node.type);
    }
  }

  /**
   * Example predicate using enum value rather than string literal.
   */
  private isTerminal(node: WorkflowNode): boolean {
    return OnboardingWorkflowsService.TERMINAL_NODE_TYPES.includes(node.type);
  }

  /**
   * Stubbed condition evaluation – keep your original implementation, but ensure the cast goes through `unknown`.
   */
  private async evaluateCondition(
    _tx: Prisma.TransactionClient,
    _context: Record<string, unknown>,
    settings: ConditionSettings,
  ): Promise<boolean> {
    if (!settings?.criteria?.length) return true;
    // Implement real evaluation here
    return true;
  }
}

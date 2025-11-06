import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import {
  FieldMapSource,
  Prisma,
  Workflow,
  WorkflowAssignmentMode,
  WorkflowNodeRunStatus,
  WorkflowNodeType,
  WorkflowRun,
  WorkflowRunStatus,
  WorkflowStatus,
  WorkflowVersionStatus
} from '@prisma/client';
import { addDays, addMonths, addWeeks, subDays, subMonths, subWeeks } from 'date-fns';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../../common/prisma.service.js';
import { AuditService } from '../../common/audit.service.js';
import { CreateWorkflowDto, UpdateWorkflowDto } from './dto/create-workflow.dto.js';
import { SaveGraphDto, WorkflowNodeDto, WorkflowEdgeDto } from './dto/save-graph.dto.js';
import { ActivateWorkflowDto } from './dto/activate-workflow.dto.js';
import { WorkflowGraphDefinition, WorkflowNodeDefinition, WorkflowEdgeDefinition, NodeSettingsMap, ConditionSettings, ConditionCriterion, DueRuleConfig } from './workflow.types.js';
import { WorkflowFieldMapService } from './field-map.service.js';
import { CreateWorkflowRunDto } from './dto/create-run.dto.js';
import { CompleteNodeRunDto } from './dto/complete-node-run.dto.js';

const TERMINAL_NODE_TYPES: WorkflowNodeType[] = ['email', 'survey'];

type AssignmentTarget = {
  mode: WorkflowAssignmentMode;
  id?: string | null;
};

type GraphResourceCollections = {
  taskTemplateIds: string[];
  formTemplateIds: string[];
  emailTemplateIds: string[];
  courseIds: string[];
  profileTaskTemplateIds: string[];
  surveyIds: string[];
  groupIds: string[];
  userIds: string[];
  conditionLookups: {
    departmentIds: string[];
    locationIds: string[];
    positionIds: string[];
    managerIds: string[];
    legalEntityIds: string[];
  };
  emailPlaceholders: string[];
};

type RunContext = {
  tenantId: string;
  assigneeUserId: string;
  employee?: {
    id: string;
    managerId: string | null;
    departmentId: string | null;
    locationId: string | null;
    positionId: string | null;
    startDate: Date;
    contractEndDate: Date | null;
  };
  employment?: {
    startDate: Date;
    endDate: Date | null;
    legalEntityId: string | null;
  };
};

@Injectable()
export class OnboardingWorkflowsService {
  private readonly logger = new Logger(OnboardingWorkflowsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly audit: AuditService,
    private readonly fieldMap: WorkflowFieldMapService
  ) {}

  private getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) {
      throw new ForbiddenException('Tenant context missing');
    }
    return tenantId;
  }

  private getActorId(): string {
    const actorId = this.cls.get<string>('actorId');
    if (!actorId) {
      throw new ForbiddenException('Actor context missing');
    }
    return actorId;
  }

  async list(status?: WorkflowStatus) {
    const tenantId = this.getTenantId();
    return this.prisma.workflow.findMany({
      where: {
        tenantId,
        ...(status ? { status } : {})
      },
      include: {
        activeVersion: true,
        draftVersion: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string) {
    const tenantId = this.getTenantId();
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
      include: { activeVersion: true, draftVersion: true, versions: { orderBy: { versionNumber: 'desc' }, take: 10 } }
    });
    if (!workflow) throw new NotFoundException('Workflow not found');
    return workflow;
  }

  async create(dto: CreateWorkflowDto) {
    const tenantId = this.getTenantId();
    const actorId = this.getActorId();
    const initialGraph: WorkflowGraphDefinition = { nodes: [], edges: [] };

    const result = await this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.create({
        data: {
          tenantId,
          name: dto.name.trim(),
          status: WorkflowStatus.DRAFT,
          currentVersion: 1,
          createdById: actorId,
          updatedById: actorId
        }
      });

      const draftVersion = await tx.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          versionNumber: 1,
          status: WorkflowVersionStatus.DRAFT,
          graph: initialGraph as unknown as Prisma.JsonValue,
          createdById: actorId
        }
      });

      const updated = await tx.workflow.update({
        where: { id: workflow.id },
        data: {
          draftVersionId: draftVersion.id
        },
        include: { draftVersion: true, activeVersion: true }
      });

      await this.audit.record({
        entity: 'Workflow',
        entityId: workflow.id,
        action: 'CREATED',
        changes: { name: dto.name }
      });
      return updated;
    });

    return result;
  }

  async updateMeta(id: string, dto: UpdateWorkflowDto) {
    const tenantId = this.getTenantId();
    const actorId = this.getActorId();
    const workflow = await this.prisma.workflow.findFirst({ where: { id, tenantId } });
    if (!workflow) throw new NotFoundException('Workflow not found');

    if (dto.status && dto.status !== WorkflowStatus.DRAFT && dto.status !== WorkflowStatus.ARCHIVED) {
      throw new BadRequestException('Status can only be set to draft or archived. Activate workflows via the Activate endpoint.');
    }

    const updated = await this.prisma.workflow.update({
      where: { id },
      data: {
        name: dto.name?.trim() ?? workflow.name,
        status: dto.status ?? workflow.status,
        updatedById: actorId
      },
      include: { activeVersion: true, draftVersion: true }
    });

    await this.audit.record({
      entity: 'Workflow',
      entityId: id,
      action: 'UPDATED',
      changes: dto as Record<string, unknown>
    });

    return updated;
  }

  async saveGraph(id: string, dto: SaveGraphDto) {
    const tenantId = this.getTenantId();
    const actorId = this.getActorId();
    const workflow = await this.prisma.workflow.findFirst({
      where: { id, tenantId },
      include: { draftVersion: true, activeVersion: true }
    });
    if (!workflow) throw new NotFoundException('Workflow not found');

    return this.prisma.$transaction(async (tx) => {
      const draftVersion = await this.ensureDraftVersion(tx, workflow, actorId);
      const graph = this.normalizeGraph(dto.nodes, dto.edges);

      await this.validateGraph(tenantId, graph);

      const updatedVersion = await tx.workflowVersion.update({
        where: { id: draftVersion.id },
        data: {
          graph: graph as unknown as Prisma.JsonValue,
          metadata: dto.metadata as Prisma.JsonValue | undefined
        }
      });

      await tx.workflow.update({
        where: { id: workflow.id },
        data: { updatedById: actorId }
      });

      await this.audit.record({
        entity: 'Workflow',
        entityId: workflow.id,
        action: 'GRAPH_SAVED',
        changes: { versionId: updatedVersion.id }
      });

      return updatedVersion;
    });
  }

  async activate(id: string, dto: ActivateWorkflowDto) {
    const tenantId = this.getTenantId();
    const actorId = this.getActorId();

    return this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.findFirst({
        where: { id, tenantId },
        include: { draftVersion: true, activeVersion: true }
      });
      if (!workflow) throw new NotFoundException('Workflow not found');
      if (!workflow.draftVersion) {
        throw new BadRequestException('No draft version available to activate');
      }

      const graph = this.parseGraph(workflow.draftVersion.graph);
      await this.validateGraph(tenantId, graph);

      if (workflow.activeVersionId) {
        await tx.workflowVersion.update({
          where: { id: workflow.activeVersionId },
          data: { status: WorkflowVersionStatus.ARCHIVED }
        });
      }

      const activatedVersion = await tx.workflowVersion.update({
        where: { id: workflow.draftVersionId! },
        data: {
          status: WorkflowVersionStatus.ACTIVE,
          publishedAt: new Date()
        }
      });

      const updatedWorkflow = await tx.workflow.update({
        where: { id: workflow.id },
        data: {
          status: WorkflowStatus.ACTIVE,
          activeVersionId: activatedVersion.id,
          draftVersionId: null,
          currentVersion: activatedVersion.versionNumber,
          updatedById: actorId
        }
      });

      const newDraft = await tx.workflowVersion.create({
        data: {
          workflowId: workflow.id,
          versionNumber: activatedVersion.versionNumber + 1,
          status: WorkflowVersionStatus.DRAFT,
          graph: activatedVersion.graph,
          metadata: activatedVersion.metadata,
          createdById: actorId
        }
      });

      await tx.workflow.update({
        where: { id: workflow.id },
        data: {
          draftVersionId: newDraft.id,
          currentVersion: newDraft.versionNumber
        }
      });

      await this.audit.record({
        entity: 'Workflow',
        entityId: workflow.id,
        action: 'ACTIVATED',
        changes: { notes: dto.notes ?? null, versionId: activatedVersion.id }
      });

      return { workflow: updatedWorkflow, version: activatedVersion };
    });
  }

  async createRun(dto: CreateWorkflowRunDto) {
    const tenantId = this.getTenantId();
    const actorId = this.getActorId();
    const startDate = new Date(dto.startDate);
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid startDate');
    }
    if (endDate && Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid endDate');
    }

    return this.prisma.$transaction(async (tx) => {
      const workflow = await tx.workflow.findFirst({
        where: { id: dto.workflowId, tenantId },
        include: { activeVersion: true }
      });
      if (!workflow || !workflow.activeVersion) {
        throw new BadRequestException('Workflow is not active');
      }

      const graph = this.parseGraph(workflow.activeVersion.graph);
      await this.validateGraph(tenantId, graph);

      const assigneeUser = await tx.user.findFirst({
        where: { id: dto.assigneeUserId, tenantId },
        select: { id: true, tenantId: true }
      });
      if (!assigneeUser) {
        throw new BadRequestException('Assignee user not found for tenant');
      }

      const assigneeProfile = await this.fetchAssigneeProfile(tx, tenantId, dto.assigneeUserId);

      const workflowRun = await tx.workflowRun.create({
        data: {
          tenantId,
          workflowId: workflow.id,
          workflowVersionId: workflow.activeVersion.id,
          assigneeUserId: dto.assigneeUserId,
          startDate,
          endDate,
          status: WorkflowRunStatus.ACTIVE,
          createdById: actorId,
          metadata: dto.metadata as Prisma.InputJsonValue | undefined
        }
      });

      const order = this.computeTopologicalOrder(graph);
      const nodeRecords = graph.nodes.map((node) => {
        const assignment = this.extractAssignment(node);
        const metadata = {
          type: node.type,
          settings: node.settings,
          title: node.title
        };
        return {
          tenantId,
          runId: workflowRun.id,
          nodeId: node.id,
          nodeType: node.type,
          status: WorkflowNodeRunStatus.PENDING,
          assignmentMode: assignment.mode,
          assignmentId: assignment.id ?? null,
          metadata: metadata as Prisma.InputJsonValue,
          orderIndex: order[node.id] ?? null
        };
      });

      if (nodeRecords.length) {
        await tx.nodeRun.createMany({ data: nodeRecords });
      }

      const startNodeIds = this.findStartNodes(graph);
      const activationContext: RunContext = {
        tenantId,
        assigneeUserId: dto.assigneeUserId,
        employee: assigneeProfile.employee,
        employment: assigneeProfile.employment
      };
      for (const nodeId of startNodeIds) {
        await this.activateNode(tx, workflowRun, graph, nodeId, activationContext);
      }

      await this.audit.record({
        entity: 'WorkflowRun',
        entityId: workflowRun.id,
        action: 'RUN_STARTED',
        changes: {
          workflowId: workflow.id,
          assigneeUserId: dto.assigneeUserId,
          startDate: startDate.toISOString(),
          endDate: endDate?.toISOString() ?? null
        }
      });

      return tx.workflowRun.findUnique({
        where: { id: workflowRun.id },
        include: { nodeRuns: true }
      });
    });
  }

  async completeNodeRun(id: string, dto: CompleteNodeRunDto) {
    const tenantId = this.getTenantId();
    const actorId = this.getActorId();
    return this.prisma.$transaction(async (tx) => {
      const nodeRun = await tx.nodeRun.findFirst({
        where: { id, tenantId },
        include: {
          run: {
            include: {
              workflow: true,
              workflowVersion: true
            }
          }
        }
      });
      if (!nodeRun) throw new NotFoundException('Node run not found');
      if (nodeRun.status === WorkflowNodeRunStatus.COMPLETED) {
        return nodeRun;
      }

      const targetStatus = dto.status ?? WorkflowNodeRunStatus.COMPLETED;
      if (!['COMPLETED', 'SKIPPED', 'FAILED'].includes(targetStatus)) {
        throw new BadRequestException('Node run can only transition to COMPLETED, SKIPPED or FAILED');
      }

      const updates: Prisma.NodeRunUpdateInput = {
        status: targetStatus,
        completedAt: targetStatus === WorkflowNodeRunStatus.COMPLETED ? new Date() : null,
        failedAt: targetStatus === WorkflowNodeRunStatus.FAILED ? new Date() : null,
        metadata: this.mergeMetadata(nodeRun.metadata, dto.metadata)
      };
      const updatedNodeRun = await tx.nodeRun.update({ where: { id: nodeRun.id }, data: updates });

      const graph = this.parseGraph(nodeRun.run.workflowVersion.graph);
      await this.advanceFromNode(tx, nodeRun.run, graph, nodeRun.nodeId, targetStatus);

      const remaining = await tx.nodeRun.count({
        where: {
          runId: nodeRun.runId,
          status: { in: [WorkflowNodeRunStatus.PENDING, WorkflowNodeRunStatus.ACTIVE] }
        }
      });
      if (remaining === 0) {
        await tx.workflowRun.update({
          where: { id: nodeRun.runId },
          data: { status: WorkflowRunStatus.COMPLETED, endDate: nodeRun.completedAt ?? new Date() }
        });
      }

      await this.audit.record({
        entity: 'WorkflowRun',
        entityId: nodeRun.runId,
        action: 'NODE_COMPLETED',
        changes: {
          nodeId: nodeRun.nodeId,
          status: targetStatus,
          actorId
        }
      });

      return updatedNodeRun;
    });
  }

  async updateFormInstances(formTemplateId: string) {
    const tenantId = this.getTenantId();
    const now = new Date();
    const affected = await this.prisma.nodeRun.updateMany({
      where: {
        tenantId,
        nodeType: 'form',
        status: { in: [WorkflowNodeRunStatus.PENDING, WorkflowNodeRunStatus.ACTIVE] },
        metadata: {
          path: ['settings', 'formTemplateId'],
          equals: formTemplateId
        }
      },
      data: {
        metadata: {
          set: {
            updatedAt: now.toISOString(),
            updatedReason: 'form_template_version'
          }
        }
      }
    });
    if (affected.count > 0) {
      await this.audit.record({
        entity: 'FormTemplate',
        entityId: formTemplateId,
        action: 'FORM_INSTANCES_REFRESHED',
        changes: { affected: affected.count }
      });
    }
    return { updated: affected.count };
  }

  async getRun(id: string) {
    const tenantId = this.getTenantId();
    const run = await this.prisma.workflowRun.findFirst({
      where: { id, tenantId },
      include: {
        workflow: true,
        workflowVersion: true,
        nodeRuns: true
      }
    });
    if (!run) throw new NotFoundException('Workflow run not found');
    return run;
  }

  async getResources() {
    const tenantId = this.getTenantId();
    const [
      taskTemplates,
      formTemplates,
      emailTemplates,
      profileTaskTemplates,
      courses,
      surveys,
      groups,
      users,
      departments,
      locations,
      positions,
      employees,
      legalEntities
    ] = await Promise.all([
      this.prisma.taskTemplate.findMany({
        where: { tenantId, isActive: true },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, defaultDueRules: true }
      }),
      this.prisma.formTemplate.findMany({
        where: { tenantId, publishState: 'published' },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      }),
      this.prisma.emailTemplate.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, placeholders: true }
      }),
      this.prisma.profileTaskTemplate.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, sections: true }
      }),
      this.prisma.course.findMany({
        where: { tenantId },
        orderBy: { title: 'asc' },
        select: { id: true, title: true }
      }),
      this.prisma.survey.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, enabledCollectors: true }
      }),
      this.prisma.group.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, isActive: true }
      }),
      this.prisma.user.findMany({
        where: { tenantId },
        orderBy: { givenName: 'asc' },
        select: { id: true, givenName: true, familyName: true, email: true }
      }),
      this.prisma.department.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      }),
      this.prisma.location.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      }),
      this.prisma.position.findMany({
        where: { tenantId },
        orderBy: { title: 'asc' },
        select: { id: true, title: true }
      }),
      this.prisma.employee.findMany({
        where: { tenantId },
        orderBy: { givenName: 'asc' },
        select: { id: true, givenName: true, familyName: true }
      }),
      this.prisma.legalEntity.findMany({
        where: { tenantId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
      })
    ]);

    return {
      taskTemplates,
      formTemplates,
      emailTemplates,
      profileTaskTemplates,
      courses,
      surveys,
      groups,
      users,
      departments,
      locations,
      positions,
      employees,
      legalEntities
    };
  }

  private normalizeGraph(nodes: WorkflowNodeDto[], edges: WorkflowEdgeDto[]): WorkflowGraphDefinition {
    return {
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        title: node.title,
        settings: node.settings ?? {},
        position: { x: node.position.x, y: node.position.y }
      })),
      edges: edges.map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        label: edge.label ?? null,
        order: edge.order ?? null
      }))
    };
  }

  private parseGraph(graph: Prisma.JsonValue): WorkflowGraphDefinition {
    if (!graph || typeof graph !== 'object') {
      return { nodes: [], edges: [] };
    }
    const value = graph as { nodes?: WorkflowNodeDefinition[]; edges?: WorkflowEdgeDefinition[] };
    return {
      nodes: Array.isArray(value.nodes) ? (value.nodes as WorkflowNodeDefinition[]) : [],
      edges: Array.isArray(value.edges) ? (value.edges as WorkflowEdgeDefinition[]) : []
    };
  }

  private async ensureDraftVersion(tx: Prisma.TransactionClient, workflow: Workflow, actorId: string) {
    if (workflow.draftVersionId) {
      return tx.workflowVersion.findUniqueOrThrow({ where: { id: workflow.draftVersionId } });
    }
    if (!workflow.activeVersionId) {
      throw new BadRequestException('Workflow has no active version to clone from');
    }
    const activeVersion = await tx.workflowVersion.findUniqueOrThrow({ where: { id: workflow.activeVersionId } });
    const newDraft = await tx.workflowVersion.create({
      data: {
        workflowId: workflow.id,
        versionNumber: workflow.currentVersion + 1,
        status: WorkflowVersionStatus.DRAFT,
        graph: activeVersion.graph,
        metadata: activeVersion.metadata,
        createdById: actorId
      }
    });
    await tx.workflow.update({
      where: { id: workflow.id },
      data: { draftVersionId: newDraft.id, currentVersion: newDraft.versionNumber }
    });
    return newDraft;
  }

  private async validateGraph(tenantId: string, graph: WorkflowGraphDefinition) {
    if (!graph.nodes.length) {
      throw new BadRequestException('Workflow must include at least one node');
    }
    const nodeIds = new Set<string>();
    for (const node of graph.nodes) {
      if (!node.id) throw new BadRequestException('Node id missing');
      if (nodeIds.has(node.id)) {
        throw new BadRequestException(`Duplicate node id detected: ${node.id}`);
      }
      nodeIds.add(node.id);
      if (!node.title?.trim()) {
        throw new BadRequestException(`Node ${node.id} requires a title`);
      }
    }

    for (const edge of graph.edges) {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        throw new BadRequestException(`Edge ${edge.id} references unknown nodes`);
      }
    }

    const startNodes = this.findStartNodes(graph);
    if (!startNodes.length) {
      throw new BadRequestException('Workflow must include a start node (no inbound edges)');
    }
    const order = this.computeTopologicalOrder(graph);
    if (Object.keys(order).length !== graph.nodes.length) {
      throw new BadRequestException('Workflow contains a cycle. Loops are not supported.');
    }

    const terminalNodes = graph.nodes.filter((node) => this.findOutgoingEdges(graph, node.id).length === 0);
    if (!terminalNodes.length) {
      throw new BadRequestException('Workflow must contain at least one terminal node');
    }

    const collections: GraphResourceCollections = {
      taskTemplateIds: [],
      formTemplateIds: [],
      emailTemplateIds: [],
      courseIds: [],
      profileTaskTemplateIds: [],
      surveyIds: [],
      groupIds: [],
      userIds: [],
      conditionLookups: {
        departmentIds: [],
        locationIds: [],
        positionIds: [],
        managerIds: [],
        legalEntityIds: []
      },
      emailPlaceholders: []
    };

    for (const node of graph.nodes) {
      this.collectNodeResources(node, collections);
      if (node.type === 'condition') {
        const condition = (node.settings as ConditionSettings) ?? { logic: 'ALL', criteria: [] };
        this.validateConditionNode(node, condition, graph);
      }
      if (node.type === 'email') {
        const schedule = (node.settings as any)?.schedule;
        if (schedule) {
          const validRelative = ['start_date', 'end_date', 'activation_time'];
          if (!validRelative.includes(schedule.relativeTo)) {
            throw new BadRequestException(`Email node ${node.id} has invalid schedule.relativeTo`);
          }
          if (schedule.offset && typeof schedule.offset.value !== 'number') {
            throw new BadRequestException(`Email node ${node.id} offset requires numeric value`);
          }
        }
      }
    }

    await this.verifyResourcesExist(tenantId, collections);
  }

  private collectNodeResources(node: WorkflowNodeDefinition, collections: GraphResourceCollections) {
    const assignment = this.extractAssignment(node);
    if (assignment.mode === WorkflowAssignmentMode.GROUP && assignment.id) {
      collections.groupIds.push(assignment.id);
    }
    if (assignment.mode === WorkflowAssignmentMode.USER && assignment.id) {
      collections.userIds.push(assignment.id);
    }

    switch (node.type) {
      case 'task': {
        const settings = node.settings as NodeSettingsMap['task'];
        if (!settings?.taskTemplateId) {
          throw new BadRequestException(`Task node ${node.id} missing taskTemplateId`);
        }
        collections.taskTemplateIds.push(settings.taskTemplateId);
        if (settings.dueRule) this.validateDueRule(node.id, settings.dueRule);
        break;
      }
      case 'form': {
        const settings = node.settings as NodeSettingsMap['form'];
        if (!settings?.formTemplateId) {
          throw new BadRequestException(`Form node ${node.id} missing formTemplateId`);
        }
        collections.formTemplateIds.push(settings.formTemplateId);
        if (settings.dueRule) this.validateDueRule(node.id, settings.dueRule);
        break;
      }
      case 'course': {
        const settings = node.settings as NodeSettingsMap['course'];
        if (!settings?.courseId) {
          throw new BadRequestException(`Course node ${node.id} missing courseId`);
        }
        collections.courseIds.push(settings.courseId);
        if (assignment.mode === WorkflowAssignmentMode.USER || assignment.mode === WorkflowAssignmentMode.GROUP) {
          throw new BadRequestException(`Course node ${node.id} must target assignee or their manager`);
        }
        break;
      }
      case 'email': {
        const settings = node.settings as NodeSettingsMap['email'];
        if (!settings?.emailTemplateId) {
          throw new BadRequestException(`Email node ${node.id} missing emailTemplateId`);
        }
        collections.emailTemplateIds.push(settings.emailTemplateId);
        const placeholderKeys: string[] = Array.isArray((settings as any).placeholders)
          ? ((settings as any).placeholders as string[])
          : Array.isArray((settings as any).placeholderKeys)
            ? ((settings as any).placeholderKeys as string[])
            : [];
        collections.emailPlaceholders.push(...placeholderKeys);
        break;
      }
      case 'profile_task': {
        const settings = node.settings as NodeSettingsMap['profile_task'];
        if (!settings?.profileTaskTemplateId) {
          throw new BadRequestException(`Profile task node ${node.id} missing profileTaskTemplateId`);
        }
        collections.profileTaskTemplateIds.push(settings.profileTaskTemplateId);
        const sections = Array.isArray((settings as any).sections) ? (settings as any).sections : [];
        this.fieldMap.ensureProfileSectionsValid(sections);
        break;
      }
      case 'survey': {
        const settings = node.settings as NodeSettingsMap['survey'];
        if (!settings?.surveyId) {
          throw new BadRequestException(`Survey node ${node.id} missing surveyId`);
        }
        collections.surveyIds.push(settings.surveyId);
        break;
      }
      case 'dummy_task': {
        const settings = node.settings as NodeSettingsMap['dummy_task'];
        if (!settings?.taskTemplateId) {
          throw new BadRequestException(`Dummy task node ${node.id} missing taskTemplateId`);
        }
        collections.taskTemplateIds.push(settings.taskTemplateId);
        if (settings.dueRule) this.validateDueRule(node.id, settings.dueRule);
        if (assignment.mode === WorkflowAssignmentMode.ASSIGNEE) {
          throw new BadRequestException(`Dummy task node ${node.id} must target a specific user or group`);
        }
        break;
      }
      case 'condition': {
        const settings = (node.settings as ConditionSettings) ?? { logic: 'ALL', criteria: [] };
        for (const criterion of settings.criteria ?? []) {
          switch (criterion.field) {
            case 'department':
              collections.conditionLookups.departmentIds.push(criterion.valueId);
              break;
            case 'location':
              collections.conditionLookups.locationIds.push(criterion.valueId);
              break;
            case 'position':
              collections.conditionLookups.positionIds.push(criterion.valueId);
              break;
            case 'manager':
              collections.conditionLookups.managerIds.push(criterion.valueId);
              break;
            case 'legal_entity':
              collections.conditionLookups.legalEntityIds.push(criterion.valueId);
              break;
            default:
              throw new BadRequestException(`Unsupported condition field ${(criterion as ConditionCriterion).field}`);
          }
        }
        break;
      }
      default:
        break;
    }
  }

  private validateConditionNode(node: WorkflowNodeDefinition, settings: ConditionSettings, graph: WorkflowGraphDefinition) {
    if (!settings.criteria?.length) {
      throw new BadRequestException(`Condition node ${node.id} requires at least one criterion`);
    }
    const outgoing = this.findOutgoingEdges(graph, node.id);
    const trueEdge = outgoing.find((edge) => edge.label === 'true');
    const falseEdge = outgoing.find((edge) => edge.label === 'false');
    if (!trueEdge || !falseEdge) {
      throw new BadRequestException(`Condition node ${node.id} must have True and False branches`);
    }
  }

  private validateDueRule(nodeId: string, dueRule: DueRuleConfig) {
    const validBasis = ['assignee.start_date', 'assignee.end_date', 'node.activation_time'];
    if (!validBasis.includes(dueRule.basis)) {
      throw new BadRequestException(`Node ${nodeId} has invalid due rule basis`);
    }
    if (dueRule.offset && typeof dueRule.offset.value !== 'number') {
      throw new BadRequestException(`Node ${nodeId} due rule offset requires numeric value`);
    }
    if (dueRule.offset && !['days', 'weeks', 'months'].includes(dueRule.offset.unit)) {
      throw new BadRequestException(`Node ${nodeId} due rule unit must be days, weeks or months`);
    }
  }

  private async verifyResourcesExist(tenantId: string, collections: GraphResourceCollections) {
    const promises: Promise<unknown>[] = [];
    if (collections.taskTemplateIds.length) {
      promises.push(
        this.verifyIds('TaskTemplate', collections.taskTemplateIds, (ids) =>
          this.prisma.taskTemplate.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true, isActive: true } })
        , 'task templates', (records: Array<{ id: string; isActive: boolean }>) => {
          const inactive = records.filter((row) => !row.isActive);
          if (inactive.length) {
            throw new BadRequestException(`Inactive task templates referenced: ${inactive.map((row) => row.id).join(', ')}`);
          }
        })
      );
    }
    if (collections.formTemplateIds.length) {
      promises.push(
        this.verifyIds('FormTemplate', collections.formTemplateIds, (ids) =>
          this.prisma.formTemplate.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true, publishState: true } })
        , 'form templates', (records: Array<{ id: string; publishState: string }>) => {
          const draft = records.filter((row) => row.publishState !== 'published');
          if (draft.length) {
            throw new BadRequestException(`Form templates must be published before activation: ${draft.map((row) => row.id).join(', ')}`);
          }
        })
      );
    }
    if (collections.emailTemplateIds.length) {
      promises.push(
        this.verifyIds('EmailTemplate', collections.emailTemplateIds, (ids) =>
          this.prisma.emailTemplate.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true, placeholders: true } })
        )
      );
    }
    if (collections.courseIds.length) {
      promises.push(this.verifyIds('Course', collections.courseIds, (ids) => this.prisma.course.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }
    if (collections.profileTaskTemplateIds.length) {
      promises.push(this.verifyIds('ProfileTaskTemplate', collections.profileTaskTemplateIds, (ids) => this.prisma.profileTaskTemplate.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }
    if (collections.surveyIds.length) {
      promises.push(
        this.verifyIds('Survey', collections.surveyIds, (ids) =>
          this.prisma.survey.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true, enabledCollectors: true } })
        , 'surveys', (records: Array<{ id: string; enabledCollectors: Prisma.JsonValue | null }>) => {
          const disabled = records.filter((row) => {
            const enabled = (row.enabledCollectors as any) ?? {};
            return !enabled.onboarding_workflow;
          });
          if (disabled.length) {
            throw new BadRequestException(`Survey collectors must enable onboarding workflow: ${disabled.map((row) => row.id).join(', ')}`);
          }
        })
      );
    }
    if (collections.groupIds.length) {
      promises.push(
        this.verifyIds('Group', collections.groupIds, (ids) =>
          this.prisma.group.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true, isActive: true } })
        , 'groups', (records: Array<{ id: string; isActive: boolean }>) => {
          const inactive = records.filter((row) => !row.isActive);
          if (inactive.length) {
            throw new BadRequestException(
              `Groups assigned in workflow are disabled: ${inactive
                .map((row) => row.id)
                .join(', ')}. Temporarily reactivate them in Administration → General → Groups.`
            );
          }
        })
      );
    }
    if (collections.userIds.length) {
      promises.push(this.verifyIds('User', collections.userIds, (ids) => this.prisma.user.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }

    const conditionPromises: Promise<unknown>[] = [];
    if (collections.conditionLookups.departmentIds.length) {
      conditionPromises.push(this.verifyIds('Department', collections.conditionLookups.departmentIds, (ids) => this.prisma.department.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }
    if (collections.conditionLookups.locationIds.length) {
      conditionPromises.push(this.verifyIds('Location', collections.conditionLookups.locationIds, (ids) => this.prisma.location.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }
    if (collections.conditionLookups.positionIds.length) {
      conditionPromises.push(this.verifyIds('Position', collections.conditionLookups.positionIds, (ids) => this.prisma.position.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }
    if (collections.conditionLookups.managerIds.length) {
      conditionPromises.push(this.verifyIds('Employee', collections.conditionLookups.managerIds, (ids) => this.prisma.employee.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }
    if (collections.conditionLookups.legalEntityIds.length) {
      conditionPromises.push(this.verifyIds('LegalEntity', collections.conditionLookups.legalEntityIds, (ids) => this.prisma.legalEntity.findMany({ where: { tenantId, id: { in: ids } }, select: { id: true } })));
    }

    await Promise.all([...promises, ...conditionPromises]);
    await this.fieldMap.validatePlaceholders(tenantId, collections.emailPlaceholders);
  }

  private async verifyIds<T>(
    label: string,
    ids: string[],
    query: (ids: string[]) => Promise<Array<{ id: string } | T>>,
    friendlyName?: string,
    after?: (records: any[]) => void
  ) {
    const unique = Array.from(new Set(ids));
    const records = await query(unique);
    const found = new Set(records.map((row: any) => row.id));
    const missing = unique.filter((id) => !found.has(id));
    if (missing.length) {
      throw new BadRequestException(`Unknown ${friendlyName ?? label} referenced: ${missing.join(', ')}`);
    }
    if (after) {
      after(records as any[]);
    }
  }

  private extractAssignment(node: WorkflowNodeDefinition): AssignmentTarget {
    const rawAssignment = (node.settings as any)?.assignment ?? (node.settings as any)?.recipients ?? {};
    const mode = (rawAssignment.mode ?? rawAssignment).toString().toLowerCase();
    switch (mode) {
      case 'assignee':
        return { mode: WorkflowAssignmentMode.ASSIGNEE };
      case 'assignee_manager':
      case 'manager':
        return { mode: WorkflowAssignmentMode.ASSIGNEE_MANAGER };
      case 'user':
        if (!rawAssignment.id) throw new BadRequestException(`Node ${node.id} missing user id assignment`);
        return { mode: WorkflowAssignmentMode.USER, id: rawAssignment.id };
      case 'group':
        if (!rawAssignment.id) throw new BadRequestException(`Node ${node.id} missing group id assignment`);
        return { mode: WorkflowAssignmentMode.GROUP, id: rawAssignment.id };
      default:
        return { mode: WorkflowAssignmentMode.ASSIGNEE };
    }
  }

  private computeTopologicalOrder(graph: WorkflowGraphDefinition): Record<string, number> {
    const indegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    for (const node of graph.nodes) {
      indegree.set(node.id, 0);
      adjacency.set(node.id, []);
    }
    for (const edge of graph.edges) {
      indegree.set(edge.to, (indegree.get(edge.to) ?? 0) + 1);
      adjacency.get(edge.from)?.push(edge.to);
    }
    const queue: string[] = [];
    indegree.forEach((value, key) => {
      if (value === 0) queue.push(key);
    });
    const order: Record<string, number> = {};
    let index = 0;
    while (queue.length) {
      const nodeId = queue.shift()!;
      order[nodeId] = index++;
      for (const neighbor of adjacency.get(nodeId) ?? []) {
        const degree = (indegree.get(neighbor) ?? 0) - 1;
        indegree.set(neighbor, degree);
        if (degree === 0) queue.push(neighbor);
      }
    }
    return order;
  }

  private findStartNodes(graph: WorkflowGraphDefinition): string[] {
    const incoming = new Map<string, number>();
    for (const node of graph.nodes) incoming.set(node.id, 0);
    for (const edge of graph.edges) {
      incoming.set(edge.to, (incoming.get(edge.to) ?? 0) + 1);
    }
    return graph.nodes.filter((node) => (incoming.get(node.id) ?? 0) === 0).map((node) => node.id);
  }

  private findOutgoingEdges(graph: WorkflowGraphDefinition, nodeId: string): WorkflowEdgeDefinition[] {
    return graph.edges.filter((edge) => edge.from === nodeId);
  }

  private async activateNode(
    tx: Prisma.TransactionClient,
    run: WorkflowRun,
    graph: WorkflowGraphDefinition,
    nodeId: string,
    context: RunContext
  ) {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) throw new NotFoundException(`Node ${nodeId} missing in graph`);
    const nodeRun = await tx.nodeRun.findFirst({ where: { runId: run.id, nodeId } });
    if (!nodeRun) throw new NotFoundException(`Node run for ${nodeId} missing`);
    if (nodeRun.status !== WorkflowNodeRunStatus.PENDING) {
      return nodeRun;
    }
    const now = new Date();
    let status = WorkflowNodeRunStatus.ACTIVE;
    let dueAt: Date | null = null;
    let scheduledAt: Date | null = null;

    switch (node.type) {
      case 'task': {
        const settings = node.settings as NodeSettingsMap['task'];
        dueAt = settings.dueRule ? this.resolveDueDate(settings.dueRule, context, now) : null;
        break;
      }
      case 'form': {
        const settings = node.settings as NodeSettingsMap['form'];
        dueAt = settings.dueRule ? this.resolveDueDate(settings.dueRule, context, now) : null;
        break;
      }
      case 'course': {
        break;
      }
      case 'email': {
        const settings = node.settings as NodeSettingsMap['email'];
        if (settings.schedule) {
          scheduledAt = this.resolveScheduleDate(settings.schedule, context, now);
        }
        status = WorkflowNodeRunStatus.ACTIVE;
        break;
      }
      case 'profile_task':
      case 'survey':
      case 'dummy_task':
      case 'condition':
        break;
      default:
        break;
    }

    const updated = await tx.nodeRun.update({
      where: { id: nodeRun.id },
      data: {
        status,
        activatedAt: now,
        dueAt,
        scheduledAt
      }
    });

    if (node.type === 'email') {
      await this.scheduleEmail(tx, run, node, updated, scheduledAt ?? now);
      await this.advanceFromNode(tx, run, graph, nodeId, WorkflowNodeRunStatus.COMPLETED);
      await tx.nodeRun.update({
        where: { id: updated.id },
        data: { status: WorkflowNodeRunStatus.COMPLETED, completedAt: scheduledAt ?? now }
      });
    }

    return updated;
  }

  private resolveDueDate(rule: DueRuleConfig, context: RunContext, activatedAt: Date): Date | null {
    let basis: Date | null = null;
    switch (rule.basis) {
      case 'assignee.start_date':
        basis = context.employment?.startDate ?? context.employee?.startDate ?? activatedAt;
        break;
      case 'assignee.end_date':
        basis = context.employment?.endDate ?? context.employee?.contractEndDate ?? activatedAt;
        break;
      case 'node.activation_time':
        basis = activatedAt;
        break;
      default:
        basis = activatedAt;
    }
    if (!basis) return null;
    const offset = rule.offset ?? { value: 0, unit: 'days' };
    const direction = rule.direction ?? 'AFTER';
    const multiplier = direction === 'BEFORE' ? -1 : 1;
    const value = offset.value ?? 0;
    if (value === 0) return basis;
    const apply = multiplier * value;
    switch (offset.unit) {
      case 'weeks':
        return apply >= 0 ? addWeeks(basis, apply) : subWeeks(basis, Math.abs(apply));
      case 'months':
        return apply >= 0 ? addMonths(basis, apply) : subMonths(basis, Math.abs(apply));
      case 'days':
      default:
        return apply >= 0 ? addDays(basis, apply) : subDays(basis, Math.abs(apply));
    }
  }

  private resolveScheduleDate(
    schedule: NodeSettingsMap['email']['schedule'],
    context: RunContext,
    activatedAt: Date
  ): Date {
    const basis = (() => {
      switch (schedule?.relativeTo) {
        case 'start_date':
          return context.employment?.startDate ?? context.employee?.startDate ?? activatedAt;
        case 'end_date':
          return context.employment?.endDate ?? context.employee?.contractEndDate ?? activatedAt;
        case 'activation_time':
        default:
          return activatedAt;
      }
    })();
    const offset = schedule?.offset ?? { value: 0, unit: 'days' };
    const direction = schedule?.direction ?? 'AFTER';
    return this.resolveDueDate({ basis: 'node.activation_time', offset, direction }, context, basis) ?? basis;
  }

  private async scheduleEmail(
    tx: Prisma.TransactionClient,
    run: WorkflowRun,
    node: WorkflowNodeDefinition,
    nodeRun: { id: string; metadata: Prisma.JsonValue | null },
    sendAt: Date
  ) {
    await tx.nodeRun.update({
      where: { id: nodeRun.id },
      data: {
        metadata: this.mergeMetadata(nodeRun.metadata, {
          ...(node.settings ?? {}),
          scheduledSendAt: sendAt.toISOString()
        })
      }
    });
    await this.audit.record({
      entity: 'WorkflowRun',
      entityId: run.id,
      action: 'EMAIL_SCHEDULED',
      changes: { nodeId: node.id, sendAt: sendAt.toISOString() }
    });
  }

  private async advanceFromNode(
    tx: Prisma.TransactionClient,
    run: WorkflowRun,
    graph: WorkflowGraphDefinition,
    nodeId: string,
    status: WorkflowNodeRunStatus
  ) {
    if (status === WorkflowNodeRunStatus.FAILED) {
      await tx.workflowRun.update({ where: { id: run.id }, data: { status: WorkflowRunStatus.CANCELLED } });
      return;
    }
    const outgoing = this.findOutgoingEdges(graph, nodeId);
    if (!outgoing.length) {
      return;
    }
    let targetEdges = outgoing;
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (node?.type === 'condition') {
      const context = await this.loadRunContext(tx, run);
      const result = await this.evaluateCondition(tx, context, node.settings as ConditionSettings);
      targetEdges = outgoing.filter((edge) => (edge.label ?? 'true') === (result ? 'true' : 'false'));
    }
    const context = await this.loadRunContext(tx, run);
    for (const edge of targetEdges) {
      await this.activateNode(tx, run, graph, edge.to, context);
    }
  }

  private async evaluateCondition(
    tx: Prisma.TransactionClient,
    context: RunContext,
    settings: ConditionSettings
  ): Promise<boolean> {
    const results = await Promise.all(
      settings.criteria.map(async (criterion) => this.evaluateCriterion(tx, context, criterion))
    );
    if (settings.logic === 'ANY') {
      return results.some((value) => value);
    }
    return results.every((value) => value);
  }

  private async evaluateCriterion(
    tx: Prisma.TransactionClient,
    context: RunContext,
    criterion: ConditionCriterion
  ) {
    switch (criterion.field) {
      case 'department':
        return this.matchHierarchy(
          context.employee?.departmentId ?? null,
          criterion.valueId,
          criterion.op,
          async () => this.fetchDepartmentAncestors(tx, context.tenantId, criterion.valueId)
        );
      case 'location':
        return this.matchHierarchy(
          context.employee?.locationId ?? null,
          criterion.valueId,
          criterion.op,
          async () => this.fetchLocationAncestors(tx, context.tenantId, criterion.valueId)
        );
      case 'position':
        return this.matchHierarchy(
          context.employee?.positionId ?? null,
          criterion.valueId,
          criterion.op,
          async () => this.fetchPositionAncestors(tx, context.tenantId, criterion.valueId)
        );
      case 'manager':
        return this.matchHierarchy(
          context.employee?.managerId ?? null,
          criterion.valueId,
          criterion.op,
          async () => this.fetchManagerAncestors(tx, context.tenantId, criterion.valueId)
        );
      case 'legal_entity':
        return this.matchHierarchy(
          context.employment?.legalEntityId ?? null,
          criterion.valueId,
          criterion.op,
          async () => this.fetchLegalEntityAncestors(tx, context.tenantId, criterion.valueId)
        );
      default:
        return false;
    }
  }

  private async matchHierarchy(
    currentId: string | null,
    valueId: string,
    op: ConditionCriterion['op'],
    loadAncestors: () => Promise<{ ancestors: Set<string>; descendants: Set<string> }>
  ): Promise<boolean> {
    if (!currentId) return false;
    if (op === 'IS') return currentId === valueId;
    const { ancestors, descendants } = await loadAncestors();
    if (op === 'IS_PARENT_OF') {
      return ancestors.has(currentId);
    }
    if (op === 'IS_CHILD_OF') {
      return descendants.has(currentId);
    }
    return false;
  }

  private async fetchDepartmentAncestors(
    tx: Prisma.TransactionClient,
    tenantId: string,
    valueId: string
  ) {
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const departments = await tx.department.findMany({ where: { tenantId }, select: { id: true, parentDepartmentId: true } });
    const parentMap = new Map<string, string | null>();
    const childMap = new Map<string, string[]>();
    for (const dept of departments) {
      parentMap.set(dept.id, dept.parentDepartmentId ?? null);
      childMap.set(dept.id, []);
    }
    for (const dept of departments) {
      if (dept.parentDepartmentId) {
        childMap.get(dept.parentDepartmentId)?.push(dept.id);
      }
    }
    let current = parentMap.get(valueId) ?? null;
    while (current) {
      ancestors.add(current);
      current = parentMap.get(current) ?? null;
    }
    const traverse = (id: string) => {
      for (const child of childMap.get(id) ?? []) {
        descendants.add(child);
        traverse(child);
      }
    };
    traverse(valueId);
    return { ancestors, descendants };
  }

  private async fetchLocationAncestors(
    tx: Prisma.TransactionClient,
    tenantId: string,
    valueId: string
  ) {
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const locations = await tx.location.findMany({ where: { tenantId }, select: { id: true } });
    // Locations currently have no hierarchy; treat IS_PARENT_OF/IS_CHILD_OF as equality checks
    return { ancestors, descendants };
  }

  private async fetchPositionAncestors(
    tx: Prisma.TransactionClient,
    tenantId: string,
    valueId: string
  ) {
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const positions = await tx.position.findMany({
      where: { tenantId },
      select: { id: true, parentPositionId: true },
    });
    const parentMap = new Map<string, string | null>();
    const childMap = new Map<string, string[]>();
    for (const pos of positions) {
      parentMap.set(pos.id, pos.parentPositionId ?? null);
      childMap.set(pos.id, []);
    }
    for (const pos of positions) {
      if (pos.parentPositionId) {
        childMap.get(pos.parentPositionId)?.push(pos.id);
      }
    }
    let current = parentMap.get(valueId) ?? null;
    while (current) {
      ancestors.add(current);
      current = parentMap.get(current) ?? null;
    }
    const traverse = (id: string) => {
      for (const child of childMap.get(id) ?? []) {
        descendants.add(child);
        traverse(child);
      }
    };
    traverse(valueId);
    return { ancestors, descendants };
  }

  private async fetchManagerAncestors(
    tx: Prisma.TransactionClient,
    tenantId: string,
    valueId: string
  ) {
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const employees = await tx.employee.findMany({ where: { tenantId }, select: { id: true, managerId: true } });
    const parentMap = new Map<string, string | null>();
    const childMap = new Map<string, string[]>();
    for (const emp of employees) {
      parentMap.set(emp.id, emp.managerId ?? null);
      childMap.set(emp.id, []);
    }
    for (const emp of employees) {
      if (emp.managerId) {
        childMap.get(emp.managerId)?.push(emp.id);
      }
    }
    let current = parentMap.get(valueId) ?? null;
    while (current) {
      ancestors.add(current);
      current = parentMap.get(current) ?? null;
    }
    const traverse = (id: string) => {
      for (const child of childMap.get(id) ?? []) {
        descendants.add(child);
        traverse(child);
      }
    };
    traverse(valueId);
    return { ancestors, descendants };
  }

  private async fetchLegalEntityAncestors(
    tx: Prisma.TransactionClient,
    tenantId: string,
    valueId: string
  ) {
    const ancestors = new Set<string>();
    const descendants = new Set<string>();
    const legalEntities = await tx.legalEntity.findMany({ where: { tenantId }, select: { id: true, parentId: true } });
    const parentMap = new Map<string, string | null>();
    const childMap = new Map<string, string[]>();
    for (const entity of legalEntities) {
      parentMap.set(entity.id, entity.parentId ?? null);
      childMap.set(entity.id, []);
    }
    for (const entity of legalEntities) {
      if (entity.parentId) {
        childMap.get(entity.parentId)?.push(entity.id);
      }
    }
    let current = parentMap.get(valueId) ?? null;
    while (current) {
      ancestors.add(current);
      current = parentMap.get(current) ?? null;
    }
    const traverse = (id: string) => {
      for (const child of childMap.get(id) ?? []) {
        descendants.add(child);
        traverse(child);
      }
    };
    traverse(valueId);
    return { ancestors, descendants };
  }

  private mergeMetadata(
    existing: Prisma.JsonValue | null,
    incoming?: Record<string, unknown>
  ): Prisma.InputJsonValue {
    const current = (existing ?? {}) as Record<string, unknown>;
    return { ...current, ...incoming } as Prisma.InputJsonValue;
  }

  private async loadRunContext(tx: Prisma.TransactionClient, run: WorkflowRun): Promise<RunContext> {
    const profile = await this.fetchAssigneeProfile(tx, run.tenantId, run.assigneeUserId);
    return {
      tenantId: run.tenantId,
      assigneeUserId: run.assigneeUserId,
      employee: profile.employee,
      employment: profile.employment
    };
  }

  private async fetchAssigneeProfile(
    tx: Prisma.TransactionClient,
    tenantId: string,
    assigneeUserId: string
  ): Promise<Pick<RunContext, 'employee' | 'employment'>> {
    const employee = await tx.employee.findFirst({
      where: { tenantId, userId: assigneeUserId },
      select: {
        id: true,
        managerId: true,
        departmentId: true,
        locationId: true,
        positionId: true,
        startDate: true,
        contractEndDate: true
      }
    });
    const employment = employee
      ? await tx.employment.findFirst({
          where: { tenantId, employeeId: employee.id },
          orderBy: { startDate: 'desc' },
          select: { startDate: true, endDate: true, legalEntityId: true }
        })
      : null;

    return {
      employee: employee
        ? {
            id: employee.id,
            managerId: employee.managerId,
            departmentId: employee.departmentId,
            locationId: employee.locationId,
            positionId: employee.positionId,
            startDate: employee.startDate,
            contractEndDate: employee.contractEndDate
          }
        : undefined,
      employment: employment
        ? {
            startDate: employment.startDate,
            endDate: employment.endDate,
            legalEntityId: employment.legalEntityId
          }
        : undefined
    };
  }
}

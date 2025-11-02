import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { Prisma, RoleKey } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
import { differenceInMilliseconds } from 'date-fns';
import { PrismaService } from '../../common/prisma.service.js';
import { CommunicationsNotificationService } from './communications.notifications.js';
import {
  AckItem,
  AckSummary,
  ActorContext,
  CommunicationPostSummary,
  CommunicationRole
} from './communications.types.js';
import { CreateCommunicationPostDto } from './dto/create-communication.dto.js';
import { UpdateCommunicationPostDto } from './dto/update-communication.dto.js';
import { ListCommunicationsQueryDto } from './dto/list-communications.dto.js';
import { ListAckItemsQueryDto } from './dto/list-acks.dto.js';

const EDIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_PAGE_SIZE = 50;

type RecipientForActor = {
  acknowledged: boolean;
  acknowledgedAt: Date | null;
  firstSeenAt: Date | null;
};

type PostForActor = Prisma.CommunicationPostGetPayload<{
  include: {
    author: true;
    department: true;
    targetTeams: { select: { id: true; name: true; departmentId: true } };
    recipients: { select: { acknowledged: true; acknowledgedAt: true; firstSeenAt: true } };
  };
}>;

type TeamWithRelations = Prisma.TeamGetPayload<{
  include: {
    members: { select: { id: true } };
    supervisors: { select: { id: true } };
    department: { select: { id: true; name: true } };
  };
}>;

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly notifications: CommunicationsNotificationService
  ) {}

  private getTenantId(): string {
    const tenantId = this.cls.get<string>('tenantId');
    if (!tenantId) throw new UnauthorizedException('Tenant context missing');
    return tenantId;
  }

  private getActorId(): string {
    const actorId = this.cls.get<string>('actorId');
    if (!actorId) throw new UnauthorizedException('User context missing');
    return actorId;
  }

  private getRoleKeys(): RoleKey[] {
    const roleKeys = this.cls.get<RoleKey[]>('actorRoleKeys') ?? [];
    return roleKeys;
  }

  private resolveRole(roleKeys: RoleKey[]): CommunicationRole {
    if (
      roleKeys.includes(RoleKey.SYSTEM_OWNER) ||
      roleKeys.includes(RoleKey.HR_BUSINESS_PARTNER)
    ) {
      return 'ADMIN';
    }
    if (roleKeys.includes(RoleKey.MANAGER)) return 'MANAGER';
    if (roleKeys.includes(RoleKey.SUPERVISOR)) return 'SUPERVISOR';
    return 'EMPLOYEE';
  }

  private async getActorContext(): Promise<ActorContext> {
    const tenantId = this.getTenantId();
    const userId = this.getActorId();
    const roleKeys = this.getRoleKeys();
    const role = this.resolveRole(roleKeys);

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        tenantId: true,
        departmentId: true,
        allowMultiTeamCommunication: true,
        teams: { select: { id: true } },
        supervisorOf: { select: { id: true } }
      }
    });

    if (!user || user.tenantId !== tenantId) {
      throw new UnauthorizedException('User not found for tenant');
    }

    let departmentId = user.departmentId;
    if (!departmentId) {
      const employee = await this.prisma.employee.findFirst({
        where: { tenantId, userId },
        select: { departmentId: true }
      });
      departmentId = employee?.departmentId ?? null;
    }

    const teamIds = user.teams.map((team) => team.id);
    const supervisorTeamIds = user.supervisorOf.map((team) => team.id);

    return {
      userId,
      tenantId,
      roleKeys,
      role,
      departmentId,
      teamIds,
      supervisorTeamIds,
      allowMultiTeamCommunication: user.allowMultiTeamCommunication
    };
  }

  private async fetchTeams(tenantId: string, teamIds: string[]): Promise<TeamWithRelations[]> {
    if (!teamIds.length) return [];
    return this.prisma.team.findMany({
      where: { tenantId, id: { in: teamIds } },
      include: {
        members: { select: { id: true } },
        supervisors: { select: { id: true } },
        department: { select: { id: true, name: true } }
      }
    });
  }

  private async resolveTargetableTeams(actor: ActorContext): Promise<TeamWithRelations[]> {
    const include: Prisma.TeamInclude = {
      members: { select: { id: true } },
      supervisors: { select: { id: true } },
      department: { select: { id: true, name: true } }
    };

    if (actor.role === 'ADMIN') {
      return this.prisma.team.findMany({
        where: { tenantId: actor.tenantId },
        include,
        orderBy: [{ department: { name: 'asc' } }, { name: 'asc' }]
      });
    }

    if (!actor.departmentId) {
      return this.prisma.team.findMany({
        where: { tenantId: actor.tenantId, id: { in: [...actor.teamIds, ...actor.supervisorTeamIds] } },
        include,
        orderBy: { name: 'asc' }
      });
    }

    const where: Prisma.TeamWhereInput = {
      tenantId: actor.tenantId,
      departmentId: actor.departmentId
    };

    if (actor.role === 'EMPLOYEE' && !actor.allowMultiTeamCommunication) {
      where.id = { in: [...actor.teamIds, ...actor.supervisorTeamIds] };
    }

    return this.prisma.team.findMany({
      where,
      include,
      orderBy: { name: 'asc' }
    });
  }

  private ensureTeamsExist(teamIds: string[], fetched: Array<{ id: string }>) {
    const foundIds = new Set(fetched.map((team) => team.id));
    const missing = teamIds.filter((teamId) => !foundIds.has(teamId));
    if (missing.length) {
      throw new BadRequestException(`Unknown team ids: ${missing.join(', ')}`);
    }
  }

  private assertTargetsAllowed(actor: ActorContext, teams: Awaited<ReturnType<typeof this.fetchTeams>>) {
    if (!teams.length) {
      throw new BadRequestException('targetTeamIds must include at least one team');
    }

    if (actor.role === 'ADMIN') {
      return;
    }

    if (!actor.departmentId) {
      const msg =
        actor.role === 'EMPLOYEE'
          ? 'Department context is required for posting. Please contact an administrator.'
          : 'Department context missing for user';
      throw new ForbiddenException(msg);
    }

    const departmentMismatch = teams.some((team) => team.departmentId !== actor.departmentId);
    if (departmentMismatch && !(actor.allowMultiTeamCommunication && actor.role === 'EMPLOYEE')) {
      throw new ForbiddenException('Target teams must belong to your department');
    }

    if (actor.role === 'EMPLOYEE') {
      const allowedTeamIds = new Set([...actor.teamIds, ...actor.supervisorTeamIds]);
      const invalidTeams = teams.filter((team) => !allowedTeamIds.has(team.id));
      if (invalidTeams.length > 0) {
        if (actor.allowMultiTeamCommunication) {
          const outsideDepartment = invalidTeams.filter((team) => team.departmentId !== actor.departmentId);
          if (outsideDepartment.length > 0) {
            throw new ForbiddenException('Cannot target teams outside your department');
          }
        } else {
          throw new ForbiddenException('Employees can only target their own team');
        }
      }
      return;
    }

    if (actor.role === 'SUPERVISOR' || actor.role === 'MANAGER') {
      const outsideDepartment = teams.filter((team) => team.departmentId !== actor.departmentId);
      if (outsideDepartment.length > 0) {
        throw new ForbiddenException('Cannot target teams outside your department');
      }
    }
  }

  private computeDepartmentId(actor: ActorContext, teams: TeamWithRelations[]): string | null {
    const uniqueDepartments = new Set(teams.map((team) => team.departmentId));
    if (uniqueDepartments.size === 1) {
      return teams[0]?.departmentId ?? null;
    }
    return actor.departmentId ?? null;
  }

  private mapPost(post: PostForActor, actor: ActorContext, ackSummary?: AckSummary['summary']): CommunicationPostSummary {
    const now = new Date();
    const isAuthor = post.authorId === actor.userId;
    const isAdmin = actor.role === 'ADMIN';
    const withinWindow = differenceInMilliseconds(now, post.createdAt) <= EDIT_WINDOW_MS;

    const canModify = isAdmin || (isAuthor && withinWindow && !post.deletedAt);

    const myRecipient = post.recipients[0];
    const myAck = myRecipient
      ? {
          acknowledged: myRecipient.acknowledged,
          acknowledgedAt: myRecipient.acknowledgedAt ?? undefined
        }
      : undefined;

    return {
      id: post.id,
      title: post.title,
      body: post.body,
      attachments: post.attachments ?? undefined,
      mentions: post.mentions ?? undefined,
      requireAck: post.requireAck,
      ackDueAt: post.ackDueAt ?? undefined,
      createdAt: post.createdAt,
      editedAt: post.editedAt ?? undefined,
      deletedAt: post.deletedAt ?? undefined,
      lastEditedBy: post.lastEditedBy ?? undefined,
      department: post.department
        ? { id: post.department.id, name: post.department.name }
        : undefined,
      author: {
        id: post.author.id,
        email: post.author.email,
        givenName: post.author.givenName,
        familyName: post.author.familyName
      },
      targetTeams: post.targetTeams.map((team) => ({
        id: team.id,
        name: team.name,
        departmentId: team.departmentId
      })),
      canEdit: canModify,
      canDelete: canModify,
      myAck,
      ackSummary: ackSummary
        ? {
            required: ackSummary.required,
            acknowledged: ackSummary.acknowledged,
            pending: ackSummary.pending
          }
        : undefined
    };
  }

  private async computeRecipientsSnapshot(
    tenantId: string,
    postId: string,
    teams: TeamWithRelations[],
    authorId: string,
    includeAuthor = false
  ) {
    const recipients = new Map<string, Set<string>>();

    for (const team of teams) {
      const teamMemberIds = [...team.members, ...team.supervisors].map((member) => member.id);
      for (const userId of teamMemberIds) {
        if (!includeAuthor && userId === authorId) continue;
        if (!recipients.has(userId)) {
          recipients.set(userId, new Set());
        }
        recipients.get(userId)!.add(team.id);
      }
    }

    const rows: Prisma.CommunicationPostRecipientCreateManyInput[] = [];
    const userIds: string[] = [];
    for (const [userId, teamIds] of recipients.entries()) {
      userIds.push(userId);
      rows.push({
        tenantId,
        postId,
        userId,
        teamIds: Array.from(teamIds)
      });
    }

    return { userIds, rows };
  }

  private async ensurePostVisibility(postId: string, actor: ActorContext) {
    if (actor.role === 'ADMIN') return;

    const visibility = await this.prisma.communicationPost.count({
      where: {
        id: postId,
        tenantId: actor.tenantId,
        deletedAt: null,
        OR: [
          { authorId: actor.userId },
          {
            targetTeams: {
              some: {
                id: { in: [...actor.teamIds, ...actor.supervisorTeamIds] }
              }
            }
          },
          actor.departmentId
            ? {
                targetTeams: {
                  some: {
                    departmentId: actor.departmentId
                  }
                }
              }
            : undefined
        ].filter(Boolean) as Prisma.CommunicationPostWhereInput[]
      }
    });
    if (visibility === 0) {
      throw new ForbiddenException('Not permitted to access this post');
    }
  }

  private async hydratePosts(
    where: Prisma.CommunicationPostWhereInput,
    actor: ActorContext,
    query: { cursor?: string; take?: number },
    includeAckSummary = false
  ): Promise<{ items: CommunicationPostSummary[]; nextCursor?: string }> {
    const take = Math.min(query.take ?? 20, MAX_PAGE_SIZE);
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const posts = await this.prisma.communicationPost.findMany({
      where,
      include: {
        author: true,
        department: true,
        targetTeams: { select: { id: true, name: true, departmentId: true } },
        recipients: {
          where: { userId: actor.userId },
          take: 1,
          select: { acknowledged: true, acknowledgedAt: true, firstSeenAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor
    });

    const paginated = posts.slice(0, take);
    await this.markFirstSeen(paginated, actor);
    const nextCursor = posts.length > take ? posts[take].id : undefined;

    const ackSummaryByPostId = new Map<string, AckSummary['summary']>();

    if (includeAckSummary) {
      await Promise.all(
        paginated.map(async (post) => {
          if (!post.requireAck) return;
          if (actor.role !== 'ADMIN' && post.authorId !== actor.userId) return;
          const summary = await this.getAckSummaryInternal(post.id, actor.tenantId);
          ackSummaryByPostId.set(post.id, summary.summary);
        })
      );
    }

    return {
      items: paginated.map((post) => this.mapPost(post, actor, ackSummaryByPostId.get(post.id))),
      nextCursor
    };
  }

  private async markFirstSeen(
    posts: Array<{ id: string; recipients: Array<{ firstSeenAt: Date | null }> }>,
    actor: ActorContext
  ) {
    const unseen = posts
      .map((post) => ({
        id: post.id,
        recipient: post.recipients[0]
      }))
      .filter((entry) => entry.recipient && entry.recipient.firstSeenAt === null)
      .map((entry) => entry.id);

    if (!unseen.length) return;

    await this.prisma.communicationPostRecipient.updateMany({
      where: {
        tenantId: actor.tenantId,
        userId: actor.userId,
        postId: { in: unseen },
        firstSeenAt: null
      },
      data: { firstSeenAt: new Date() }
    });
  }

  private async getAckSummaryInternal(postId: string, tenantId: string): Promise<AckSummary> {
    const [post, recipients] = await Promise.all([
      this.prisma.communicationPost.findUnique({
        where: { id: postId },
        select: { tenantId: true, targetTeams: { select: { id: true, name: true, departmentId: true } } }
      }),
      this.prisma.communicationPostRecipient.findMany({
        where: { tenantId, postId },
        select: { acknowledged: true, acknowledgedAt: true, teamIds: true, user: { select: { id: true, email: true, givenName: true, familyName: true } } }
      })
    ]);

    if (!post || post.tenantId !== tenantId) {
      throw new NotFoundException('Communication post not found');
    }

    const summary = {
      required: recipients.length,
      acknowledged: recipients.filter((recipient) => recipient.acknowledged).length,
      pending: 0
    };
    summary.pending = summary.required - summary.acknowledged;

    const perTeamMap = new Map<
      string,
      { required: number; acknowledged: number; pending: number }
    >();

    for (const team of post.targetTeams) {
      perTeamMap.set(team.id, { required: 0, acknowledged: 0, pending: 0 });
    }

    for (const recipient of recipients) {
      const targetIds = recipient.teamIds.length ? recipient.teamIds : post.targetTeams.map((team) => team.id);
      for (const teamId of targetIds) {
        const entry = perTeamMap.get(teamId);
        if (!entry) continue;
        entry.required += 1;
        if (recipient.acknowledged) {
          entry.acknowledged += 1;
        }
      }
    }

    for (const entry of perTeamMap.values()) {
      entry.pending = entry.required - entry.acknowledged;
    }

    return {
      summary,
      perTeam: Array.from(perTeamMap.entries()).map(([teamId, counts]) => {
        const teamInfo = post.targetTeams.find((team) => team.id === teamId);
        return {
          team: teamInfo ?? { id: teamId, name: 'Unknown', departmentId: '' },
          counts
        };
      }),
      recipients: recipients.map((recipient) => ({
        user: {
          id: recipient.user.id,
          email: recipient.user.email,
          givenName: recipient.user.givenName,
          familyName: recipient.user.familyName
        },
        acknowledged: recipient.acknowledged,
        acknowledgedAt: recipient.acknowledgedAt ?? null,
        teamIds: recipient.teamIds
      }))
    };
  }

  async listPosts(query: ListCommunicationsQueryDto) {
    const actor = await this.getActorContext();

    const baseWhere: Prisma.CommunicationPostWhereInput = {
      tenantId: actor.tenantId,
      deletedAt: null
    };

    if (actor.role !== 'ADMIN') {
      const teamIds = new Set([...actor.teamIds, ...actor.supervisorTeamIds]);
      const teamIdFilter = Array.from(teamIds);
      const departmentId = actor.departmentId;

      baseWhere.OR = [
        { authorId: actor.userId },
        { targetTeams: { some: { id: { in: teamIdFilter } } } }
      ];

      if (departmentId) {
        baseWhere.OR.push({
          targetTeams: { some: { departmentId } }
        });
      }
    }

    if (query.teamId) {
      baseWhere.targetTeams = { some: { id: query.teamId } };
    }

    return this.hydratePosts(baseWhere, actor, query, query.includeAckSummary ?? false);
  }

  async getPost(id: string) {
    const actor = await this.getActorContext();
    await this.ensurePostVisibility(id, actor);

    const post = await this.prisma.communicationPost.findFirst({
      where: { id, tenantId: actor.tenantId },
      include: {
        author: true,
        department: true,
        targetTeams: { select: { id: true, name: true, departmentId: true } },
        recipients: {
          where: { userId: actor.userId },
          take: 1,
          select: { acknowledged: true, acknowledgedAt: true, firstSeenAt: true }
        }
      }
    });

    if (!post || post.deletedAt) {
      throw new NotFoundException('Communication post not found');
    }

    await this.markFirstSeen(post ? [post] : [], actor);

    const includeAck = post.requireAck && (actor.role === 'ADMIN' || post.authorId === actor.userId);
    const ackSummary = includeAck ? (await this.getAckSummaryInternal(id, actor.tenantId)).summary : undefined;
    return this.mapPost(post, actor, ackSummary);
  }

  async createPost(dto: CreateCommunicationPostDto) {
    const actor = await this.getActorContext();
    if (!dto.targetTeamIds?.length) {
      throw new BadRequestException('targetTeamIds is required');
    }

    const tenantId = actor.tenantId;
    const teams = await this.fetchTeams(tenantId, dto.targetTeamIds);
    this.ensureTeamsExist(dto.targetTeamIds, teams);
    this.assertTargetsAllowed(actor, teams);

    const requireAck = dto.requireAck ?? false;
    if (requireAck && actor.role === 'EMPLOYEE') {
      throw new ForbiddenException('Employees cannot require acknowledgements');
    }

    const departmentId = this.computeDepartmentId(actor, teams);

    const post = await this.prisma.$transaction(async (tx) => {
      const created = await tx.communicationPost.create({
        data: {
          tenantId,
          authorId: actor.userId,
          departmentId: departmentId ?? undefined,
          title: dto.title,
          body: dto.body,
          attachments: dto.attachments?.length
            ? (dto.attachments as unknown as Prisma.JsonArray)
            : undefined,
          mentions: dto.mentions?.length
            ? (dto.mentions as unknown as Prisma.JsonArray)
            : undefined,
          requireAck,
          ackDueAt: dto.ackDueAt ? new Date(dto.ackDueAt) : undefined,
          targetTeams: {
            connect: teams.map((team) => ({ id: team.id }))
          }
        },
        include: {
          author: true,
          department: true,
          targetTeams: { select: { id: true, name: true, departmentId: true } },
          recipients: {
            where: { userId: actor.userId },
            take: 1,
            select: { acknowledged: true, acknowledgedAt: true, firstSeenAt: true }
          }
        }
      });

      const { userIds, rows } = await this.computeRecipientsSnapshot(
        tenantId,
        created.id,
        teams,
        actor.userId
      );

      if (rows.length) {
        await tx.communicationPostRecipient.createMany({ data: rows });
      }

      if (rows.length > 0 && requireAck) {
        this.notifications.queuePostRequiresAck(created.id, userIds, created.ackDueAt);
      }
      this.notifications.queuePostCreated(created.id, userIds);

      return created;
    });

    return this.mapPost(post, actor);
  }

  async updatePost(id: string, dto: UpdateCommunicationPostDto) {
    const actor = await this.getActorContext();
    const post = await this.prisma.communicationPost.findUnique({
      where: { id },
      include: { targetTeams: { select: { id: true, name: true, departmentId: true } } }
    });
    if (!post || post.tenantId !== actor.tenantId || post.deletedAt) {
      throw new NotFoundException('Communication post not found');
    }

    const isAdmin = actor.role === 'ADMIN';
    const isAuthor = post.authorId === actor.userId;
    const withinWindow = differenceInMilliseconds(new Date(), post.createdAt) <= EDIT_WINDOW_MS;

    if (!isAdmin && !(isAuthor && withinWindow)) {
      throw new ForbiddenException('Editing window has expired');
    }

    let nextDepartmentId = post.departmentId;
    let teamsToConnect: TeamWithRelations[] | null = null;
    if (dto.targetTeamIds && dto.targetTeamIds.length) {
      teamsToConnect = await this.fetchTeams(actor.tenantId, dto.targetTeamIds);
      this.ensureTeamsExist(dto.targetTeamIds, teamsToConnect);
      this.assertTargetsAllowed(actor, teamsToConnect);
      nextDepartmentId = this.computeDepartmentId(actor, teamsToConnect);
    }

    const attachmentsInput =
      dto.attachments !== undefined
        ? dto.attachments.length
          ? (dto.attachments as unknown as Prisma.JsonArray)
          : Prisma.JsonNull
        : post.attachments === null
          ? Prisma.JsonNull
          : (post.attachments as Prisma.InputJsonValue);

    const mentionsInput =
      dto.mentions !== undefined
        ? dto.mentions.length
          ? (dto.mentions as unknown as Prisma.JsonArray)
          : Prisma.JsonNull
        : post.mentions === null
          ? Prisma.JsonNull
          : (post.mentions as Prisma.InputJsonValue);

    const updated = await this.prisma.communicationPost.update({
      where: { id },
      data: {
        title: dto.title ?? post.title,
        body: dto.body ?? post.body,
        attachments: attachmentsInput,
        mentions: mentionsInput,
        ackDueAt: dto.ackDueAt ? new Date(dto.ackDueAt) : post.ackDueAt,
        lastEditedBy: actor.userId,
        editedAt: new Date(),
        departmentId: nextDepartmentId ?? undefined,
        targetTeams: teamsToConnect
          ? {
              set: [],
              connect: teamsToConnect.map((team) => ({ id: team.id }))
            }
          : undefined
      },
      include: {
        author: true,
        department: true,
        targetTeams: { select: { id: true, name: true, departmentId: true } },
        recipients: {
          where: { userId: actor.userId },
          take: 1,
          select: { acknowledged: true, acknowledgedAt: true, firstSeenAt: true }
        }
      }
    });

    return this.mapPost(updated, actor);
  }

  async deletePost(id: string) {
    const actor = await this.getActorContext();
    const post = await this.prisma.communicationPost.findUnique({
      where: { id },
      select: { authorId: true, tenantId: true, deletedAt: true, createdAt: true }
    });

    if (!post || post.tenantId !== actor.tenantId || post.deletedAt) {
      throw new NotFoundException('Communication post not found');
    }

    const isAdmin = actor.role === 'ADMIN';
    const isAuthor = post.authorId === actor.userId;
    const withinWindow = differenceInMilliseconds(new Date(), post.createdAt) <= EDIT_WINDOW_MS;

    if (!isAdmin && !(isAuthor && withinWindow)) {
      throw new ForbiddenException('Deleting window has expired');
    }

    await this.prisma.communicationPost.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        lastEditedBy: actor.userId
      }
    });
  }

  async acknowledge(postId: string) {
    const actor = await this.getActorContext();
    const recipient = await this.prisma.communicationPostRecipient.findUnique({
      where: { postId_userId: { postId, userId: actor.userId } }
    });

    if (!recipient || recipient.tenantId !== actor.tenantId) {
      throw new ForbiddenException('You are not a required recipient');
    }

    const now = new Date();
    if (!recipient.acknowledged) {
      await this.prisma.communicationPostRecipient.update({
        where: { postId_userId: { postId, userId: actor.userId } },
        data: { acknowledged: true, acknowledgedAt: now }
      });
    }

    return this.getPost(postId);
  }

  async getAckSummary(postId: string): Promise<AckSummary> {
    const actor = await this.getActorContext();
    const post = await this.prisma.communicationPost.findUnique({
      where: { id: postId },
      select: { tenantId: true, authorId: true, requireAck: true }
    });
    if (!post || post.tenantId !== actor.tenantId || !post.requireAck) {
      throw new NotFoundException('Communication post not found');
    }

    if (actor.role !== 'ADMIN' && post.authorId !== actor.userId) {
      throw new ForbiddenException('Only authors or administrators can view acknowledgement summaries');
    }

    return this.getAckSummaryInternal(postId, actor.tenantId);
  }

  async getComposerContext() {
    const actor = await this.getActorContext();
    const teams = await this.resolveTargetableTeams(actor);

    return {
      role: actor.role,
      roleKeys: actor.roleKeys,
      departmentId: actor.departmentId ?? null,
      teamIds: actor.teamIds,
      supervisorTeamIds: actor.supervisorTeamIds,
      allowMultiTeamCommunication: actor.allowMultiTeamCommunication,
      canRequireAck: actor.role !== 'EMPLOYEE',
      teams: teams.map((team) => ({
        id: team.id,
        name: team.name,
        departmentId: team.departmentId,
        departmentName: team.department?.name ?? '',
        isMember: actor.teamIds.includes(team.id) || actor.supervisorTeamIds.includes(team.id)
      }))
    };
  }

  async listMyRequiredAcks(query: ListAckItemsQueryDto) {
    const actor = await this.getActorContext();
    const take = Math.min(query.take ?? 20, MAX_PAGE_SIZE);
    const cursor = query.cursor ? { id: query.cursor } : undefined;
    const onlyPending = query.onlyPending ?? true;

    const posts = await this.prisma.communicationPost.findMany({
      where: {
        tenantId: actor.tenantId,
        deletedAt: null,
        requireAck: true,
        recipients: {
          some: {
            userId: actor.userId,
            ...(onlyPending ? { acknowledged: false } : undefined)
          }
        }
      },
      include: {
        author: true,
        department: true,
        targetTeams: { select: { id: true, name: true, departmentId: true } },
        recipients: {
          where: { userId: actor.userId },
          take: 1,
          select: { acknowledged: true, acknowledgedAt: true, firstSeenAt: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      skip: cursor ? 1 : 0,
      cursor
    });

    const paginated = posts.slice(0, take);
    const nextCursor = posts.length > take ? posts[take].id : undefined;

    return {
      items: paginated.map((post) => ({
        post: this.mapPost(post, actor),
        acknowledged: post.recipients[0]?.acknowledged ?? false,
        acknowledgedAt: post.recipients[0]?.acknowledgedAt ?? undefined
      })),
      nextCursor
    };
  }
}

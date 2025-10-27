import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CostSplitInput,
  EmployeeContact,
  EmployeeCompensation,
  EmployeeHistoryFilters,
  EmployeeJob,
  EmployeePersonal,
  EmployeeProfilePayload,
  EmployeeTimeEligibility,
  EmploymentEventType,
  GenerateDocumentInput,
  UpdateEmployeeProfileInput,
  UpsertCostSplitInput,
  costSplitSchema,
  employeeProfileSchema,
  employmentEventSchema,
  generatedDocumentSchema
} from '@workright/profile-schema';
import { PrismaService } from '../../common/prisma.service.js';
import { AuditService } from '../../common/audit.service.js';
import { DocumentGenerationService } from './services/document-generation.service.js';
import { ClsService } from 'nestjs-cls';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const MAX_DATE = new Date('9999-12-31T23:59:59.999Z');
const asJson = (value: unknown): Prisma.InputJsonValue => value as Prisma.InputJsonValue;

interface DownloadDescriptor {
  stream: ReturnType<typeof createReadStream>;
  filename: string;
  mimeType: string;
}

@Injectable()
export class EmployeeProfileService {
  private readonly storageRoot = join(process.cwd(), 'apps/api/storage');
  private readonly documentsDir = join(this.storageRoot, 'generated-documents');

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly documents: DocumentGenerationService,
    private readonly cls: ClsService
  ) {
    this.ensureStorage();
  }

  async getEmployeeProfile(id: string): Promise<EmployeeProfilePayload> {
    const employee = await this.prisma.employee.findFirst({
      where: { id },
      include: {
        position: {
          include: { department: true, orgUnit: true }
        },
        department: true,
        location: true,
        manager: true,
        addresses: true,
        emergencyContacts: true,
        costSplits: {
          include: { costCode: true },
          orderBy: { startDate: 'desc' }
        },
        generatedDocuments: {
          include: { template: true },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        employmentEvents: {
          orderBy: { effectiveDate: 'desc' },
          take: 250
        },
        employments: {
          orderBy: { startDate: 'desc' },
          take: 1
        },
        leaveBalances: {
          include: { leaveType: true }
        }
      }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const templates = await this.prisma.documentTemplate.findMany({ orderBy: { name: 'asc' } });
    const employment = employee.employments.at(0);
    const primaryAddress = employee.addresses.find((addr) => addr.type === 'PRIMARY');
    const mailingAddress = employee.addresses.find((addr) => addr.type === 'MAILING');

    const costSplits = employee.costSplits.map((split) => ({
      id: split.id,
      costCodeId: split.costCodeId,
      costCode: {
        id: split.costCode.id,
        code: split.costCode.code,
        description: split.costCode.description ?? null,
        type: split.costCode.type
      },
      percentage: Number(split.percentage),
      startDate: split.startDate.toISOString(),
      endDate: split.endDate ? split.endDate.toISOString() : null,
      createdAt: split.createdAt.toISOString(),
      updatedAt: split.updatedAt.toISOString(),
      createdBy: split.createdBy ?? null
    }));

    const history = employee.employmentEvents.map((event) => ({
      id: event.id,
      type: event.type,
      effectiveDate: event.effectiveDate.toISOString(),
      actor: event.actorId ?? null,
      createdAt: event.createdAt.toISOString(),
      payload: event.payload as Record<string, unknown>,
      source: (event.source as 'UI' | 'API' | 'INTEGRATION') ?? 'UI'
    }));

    const generated = employee.generatedDocuments.map((doc) => ({
      id: doc.id,
      templateId: doc.templateId ?? undefined,
      templateName: doc.template?.name ?? undefined,
      format: doc.format,
      filename: doc.filename,
      storageUrl: doc.storageUrl,
      createdAt: doc.createdAt.toISOString(),
      createdBy: doc.createdBy ?? null
    }));

    const permissions = this.resolvePermissions();

    const payload: EmployeeProfilePayload = {
      employee: {
        id: employee.id,
        employeeNumber: employee.employeeNumber ?? null,
        positionId: employee.positionId ?? null,
        legalName: {
          full: this.buildFullName(employee),
          preferred: employee.preferredName ?? null
        },
        jobTitle: employee.jobTitle ?? employee.position?.title ?? 'Role pending',
        department: employee.department?.name ?? employee.position?.department.name ?? null,
        orgUnit: employee.position?.orgUnit?.name ?? null,
        location: employee.location?.name ?? null,
        status: employee.status,
        costCodeSummary: this.buildCostSplitSummary(costSplits),
        hireDate: employee.startDate.toISOString(),
        manager: employee.manager ? this.buildFullName(employee.manager) : null,
        avatarUrl: null
      },
      personal: {
        legalName: {
          first: employee.givenName,
          middle: employee.middleName ?? null,
          last: employee.familyName,
          suffix: employee.nameSuffix ?? null
        },
        preferredName: employee.preferredName ?? null,
        pronouns: employee.pronouns ?? null,
        dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.toISOString() : new Date(0).toISOString(),
        nationalIdentifiers: Array.isArray(employee.nationalIdentifiers)
          ? (employee.nationalIdentifiers as Array<{ id: string; type: string; country: string; value: string }>)
          : [],
        citizenships: employee.citizenships ?? [],
        maritalStatus: employee.maritalStatus ?? null,
        languages: employee.languages ?? [],
        veteranStatus: employee.veteranStatus ?? null
      },
      contact: {
        workEmail: employee.email,
        personalEmail: employee.personalEmail ?? null,
        workPhone: employee.workPhone ?? null,
        mobilePhone: employee.mobilePhone ?? null,
        primaryAddress: primaryAddress
          ? {
              line1: primaryAddress.line1,
              line2: primaryAddress.line2 ?? null,
              suburb: primaryAddress.suburb,
              state: primaryAddress.state,
              postcode: primaryAddress.postcode,
              country: primaryAddress.country
            }
          : null,
        mailingAddress: mailingAddress
          ? {
              line1: mailingAddress.line1,
              line2: mailingAddress.line2 ?? null,
              suburb: mailingAddress.suburb,
              state: mailingAddress.state,
              postcode: mailingAddress.postcode,
              country: mailingAddress.country
            }
          : null,
        emergencyContacts: employee.emergencyContacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
          email: contact.email ?? null
        })),
        communicationPreferences: employee.communicationPreferences ?? []
      },
      job: {
        positionId: employee.positionId ?? null,
        jobTitle: employee.jobTitle ?? employee.position?.title ?? 'Role pending',
        manager: employee.manager ? { id: employee.manager.id, name: this.buildFullName(employee.manager) } : null,
        orgUnit: employee.position?.orgUnit ? { id: employee.position.orgUnit.id, name: employee.position.orgUnit.name } : null,
        department: employee.department
          ? { id: employee.department.id, name: employee.department.name }
          : employee.position?.department
            ? { id: employee.position.department.id, name: employee.position.department.name }
            : null,
        location: employee.location
          ? { id: employee.location.id, name: employee.location.name, timezone: employee.location.timezone }
          : null,
        grade: employment?.grade ?? null,
        fte: employment?.fte ?? 1,
        exempt: employee.exempt,
        workerType: employment?.workerType ?? 'Employee',
        employmentType: employment?.employmentType ?? 'Full-time',
        standardHours: employment?.standardHours ?? null,
        schedule: employment?.schedule ?? null,
        costCenterSummary: this.buildCostSplitSummary(costSplits),
        status: employee.status,
        hireDate: employee.startDate.toISOString(),
        serviceDate: employee.serviceDate ? employee.serviceDate.toISOString() : null,
        probationEndDate: employee.probationEndDate ? employee.probationEndDate.toISOString() : null,
        contractEndDate: employee.contractEndDate ? employee.contractEndDate.toISOString() : null
      },
      compensation: {
        payGroup: 'Default',
        baseSalary: {
          amount: Number(employment?.payRate ?? 0),
          currency: employment?.currency ?? 'AUD',
          frequency: employment?.payFrequency ?? 'ANNUAL'
        },
        payGrade: employment?.grade ?? null,
        salaryRange: null,
        bonusTargetPercent: employment?.bonusTarget ?? null,
        allowances: Array.isArray(employment?.allowances)
          ? (employment?.allowances as Array<{
              id: string;
              label: string;
              amount: number;
              currency: string;
              frequency: string;
              taxable?: boolean;
            }>).map((allowance) => ({
              id: allowance.id,
              label: allowance.label,
              amount: allowance.amount,
              currency: allowance.currency,
              frequency: allowance.frequency as 'ANNUAL' | 'MONTHLY' | 'FORTNIGHTLY' | 'WEEKLY' | 'HOURLY',
              taxable: allowance.taxable ?? true
            }))
          : [],
        stockPlan: employment?.stockPlan ?? null,
        effectiveDate: employment?.startDate
          ? employment.startDate.toISOString()
          : employee.startDate.toISOString()
      },
      timeAndEligibility: {
        location: employee.location?.name ?? 'Unknown',
        timezone: employee.timezone ?? employee.location?.timezone ?? 'Australia/Sydney',
        workSchedule: employee.workSchedule ?? employment?.schedule ?? 'Standard Week',
        badgeId: employee.badgeId ?? null,
        overtimeEligible: employee.overtimeEligible,
        exempt: employee.exempt,
        benefitsEligible: employee.benefitsEligible,
        leaveBalances: employee.leaveBalances.map((balance) => ({
          id: balance.id,
          type: balance.leaveType?.name ?? 'Leave',
          balanceHours: balance.balance
        }))
      },
      costSplits,
      history,
      documents: {
        generated,
        templates: templates.map((template) => ({
          id: template.id,
          name: template.name,
          format: template.format,
          description: template.description ?? null,
          lastUpdatedAt: template.updatedAt.toISOString()
        }))
      },
      permissions
    };

    return employeeProfileSchema.parse(payload);
  }

  async updateSection(id: string, input: UpdateEmployeeProfileInput) {
    switch (input.section) {
      case 'personal':
        return this.updatePersonal(id, input.payload);
      case 'contact':
        return this.updateContact(id, input.payload);
      case 'job':
        return this.updateJob(id, input.payload);
      case 'compensation':
        return this.updateCompensation(id, input.payload);
      case 'timeAndEligibility':
        return this.updateTimeAndEligibility(id, input.payload);
      default:
        throw new BadRequestException('Unsupported section');
    }
  }

  async listCostSplits(id: string) {
    const splits = await this.prisma.employeeCostSplit.findMany({
      where: { employeeId: id },
      include: { costCode: true },
      orderBy: { startDate: 'desc' }
    });
    return splits.map((split) =>
      costSplitSchema.parse({
        id: split.id,
        costCodeId: split.costCodeId,
        costCode: {
          id: split.costCode.id,
          code: split.costCode.code,
          description: split.costCode.description ?? null,
          type: split.costCode.type
        },
        percentage: Number(split.percentage),
        startDate: split.startDate.toISOString(),
        endDate: split.endDate ? split.endDate.toISOString() : null,
        createdAt: split.createdAt.toISOString(),
        updatedAt: split.updatedAt.toISOString(),
        createdBy: split.createdBy ?? null
      })
    );
  }

  async upsertCostSplits(id: string, input: UpsertCostSplitInput) {
    await this.ensureEmployeeExists(id);
    this.validateCostSplits(input.splits);
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');

    const existing = await this.prisma.employeeCostSplit.findMany({ where: { employeeId: id } });
    const incomingIds = new Set(input.splits.map((split) => split.id).filter(Boolean) as string[]);

    await this.prisma.$transaction(async (tx) => {
      for (const split of input.splits) {
        if (split.id) {
          await tx.employeeCostSplit.update({
            where: { id: split.id },
            data: {
              costCodeId: split.costCodeId,
              percentage: new Prisma.Decimal(split.percentage),
              startDate: new Date(split.startDate),
              endDate: split.endDate ? new Date(split.endDate) : null
            }
          });
        } else {
          await tx.employeeCostSplit.create({
            data: {
              tenantId,
              employeeId: id,
              costCodeId: split.costCodeId,
              percentage: new Prisma.Decimal(split.percentage),
              startDate: new Date(split.startDate),
              endDate: split.endDate ? new Date(split.endDate) : null,
              createdBy: this.cls.get('actorId') ?? 'system'
            }
          });
        }
      }
      for (const split of existing) {
        if (!incomingIds.has(split.id)) {
          await tx.employeeCostSplit.delete({ where: { id: split.id } });
        }
      }
    });

    await this.recordEvent(id, 'COST_CODE_CHANGE', { count: input.splits.length });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'costSplits.upserted',
      changes: { splits: input.splits }
    });

    return this.listCostSplits(id);
  }

  async updateSingleCostSplit(splitId: string, split: CostSplitInput) {
    const existing = await this.prisma.employeeCostSplit.findUnique({
      where: { id: splitId },
      include: { employee: false }
    });
    if (!existing) throw new NotFoundException('Cost split not found');
    const otherSplits = await this.prisma.employeeCostSplit.findMany({
      where: { employeeId: existing.employeeId, NOT: { id: splitId } }
    });
    this.validateCostSplits([
      ...otherSplits.map((item) => ({
        id: item.id,
        costCodeId: item.costCodeId,
        percentage: Number(item.percentage),
        startDate: item.startDate.toISOString(),
        endDate: item.endDate ? item.endDate.toISOString() : null
      })),
      split
    ]);

    await this.prisma.employeeCostSplit.update({
      where: { id: splitId },
      data: {
        costCodeId: split.costCodeId,
        percentage: new Prisma.Decimal(split.percentage),
        startDate: new Date(split.startDate),
        endDate: split.endDate ? new Date(split.endDate) : null
      }
    });

    await this.recordEvent(existing.employeeId, 'COST_CODE_CHANGE', { splitId });
    await this.audit.record({
      entity: 'employee',
      entityId: existing.employeeId,
      action: 'costSplits.updated',
      changes: { split }
    });

    return this.listCostSplits(existing.employeeId);
  }

  async deleteCostSplit(splitId: string) {
    const split = await this.prisma.employeeCostSplit.delete({ where: { id: splitId } });
    await this.recordEvent(split.employeeId, 'COST_CODE_CHANGE', { removed: splitId });
    await this.audit.record({
      entity: 'employee',
      entityId: split.employeeId,
      action: 'costSplits.deleted',
      changes: { splitId }
    });
    return { success: true };
  }

  async listHistory(id: string, filters: Partial<EmployeeHistoryFilters>) {
    await this.ensureEmployeeExists(id);
    const where: Prisma.EmploymentEventWhereInput = { employeeId: id };
    if (filters.type) where.type = filters.type;
    if (filters.from || filters.to) {
      where.effectiveDate = {};
      if (filters.from) where.effectiveDate.gte = new Date(filters.from);
      if (filters.to) where.effectiveDate.lte = new Date(filters.to);
    }
    const history = await this.prisma.employmentEvent.findMany({
      where,
      orderBy: { effectiveDate: 'desc' }
    });
    return history.map((event) =>
      employmentEventSchema.parse({
        id: event.id,
        type: event.type,
        effectiveDate: event.effectiveDate.toISOString(),
        actor: event.actorId ?? null,
        createdAt: event.createdAt.toISOString(),
        payload: event.payload as Record<string, unknown>,
        source: (event.source as 'UI' | 'API' | 'INTEGRATION') ?? 'UI'
      })
    );
  }

  async exportHistory(id: string, filters: Partial<EmployeeHistoryFilters>) {
    const history = await this.listHistory(id, filters);
    const lines = ['type,effectiveDate,actor,source,payload'];
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    for (const event of history) {
      const payload = JSON.stringify(event.payload ?? {});
      lines.push(
        [
          escape(event.type),
          escape(event.effectiveDate),
          escape(event.actor ?? ''),
          escape(event.source),
          escape(payload)
        ].join(',')
      );
    }
    const csv = lines.join('\n');
    const base64 = Buffer.from(csv, 'utf8').toString('base64');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    return {
      url: `data:text/csv;base64,${base64}`,
      expiresAt
    };
  }

  async generateDocument(id: string, input: GenerateDocumentInput) {
    const employee = await this.prisma.employee.findFirst({
      where: { id },
      include: { position: { include: { department: true } }, costSplits: { include: { costCode: true } } }
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const template = await this.prisma.documentTemplate.findUnique({ where: { id: input.templateId } });
    if (!template) throw new NotFoundException('Template not found');

    const merge = {
      employee: {
        id: employee.id,
        name: this.buildFullName(employee),
        positionId: employee.positionId,
        jobTitle: employee.jobTitle ?? employee.position?.title ?? null,
        department: employee.position?.department?.name ?? null
      },
      costSplits: employee.costSplits.map((split) => ({
        code: split.costCode.code,
        description: split.costCode.description,
        percentage: Number(split.percentage),
        startDate: split.startDate.toISOString(),
        endDate: split.endDate ? split.endDate.toISOString() : null
      })),
      generatedAt: new Date().toISOString(),
      ...input.mergeFields
    };

    const artifact = await this.documents.generate(input.format ?? template.format, template.name, template.body, merge);
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    await this.ensureStorage();
    await fs.writeFile(join(this.documentsDir, artifact.filename), artifact.buffer);

    const record = await this.prisma.generatedDocument.create({
      data: {
        tenantId,
        employeeId: id,
        templateId: template.id,
        format: input.format ?? template.format,
        filename: artifact.filename,
        storageUrl: '',
        payload: asJson({ path: artifact.filename, merge }),
        createdBy: this.cls.get('actorId') ?? 'system'
      }
    });

    const updated = await this.prisma.generatedDocument.update({
      where: { id: record.id },
      data: { storageUrl: `/v1/employees/documents/${record.id}/download` }
    });

    await this.recordEvent(id, 'OTHER', { action: 'DOCUMENT_GENERATE', templateId: template.id });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'documents.generated',
      changes: { templateId: template.id, documentId: record.id }
    });

    return generatedDocumentSchema.parse({
      id: updated.id,
      templateId: updated.templateId ?? undefined,
      templateName: template.name,
      format: updated.format,
      filename: updated.filename,
      storageUrl: updated.storageUrl,
      createdAt: updated.createdAt.toISOString(),
      createdBy: updated.createdBy ?? null
    });
  }

  async listDocuments(id: string) {
    await this.ensureEmployeeExists(id);
    const docs = await this.prisma.generatedDocument.findMany({
      where: { employeeId: id },
      include: { template: true },
      orderBy: { createdAt: 'desc' }
    });
    return docs.map((doc) =>
      generatedDocumentSchema.parse({
        id: doc.id,
        templateId: doc.templateId ?? undefined,
        templateName: doc.template?.name ?? undefined,
        format: doc.format,
        filename: doc.filename,
        storageUrl: doc.storageUrl,
        createdAt: doc.createdAt.toISOString(),
        createdBy: doc.createdBy ?? null
      })
    );
  }

  async getDownloadStream(docId: string): Promise<DownloadDescriptor> {
    const doc = await this.prisma.generatedDocument.findUnique({ where: { id: docId } });
    if (!doc) throw new NotFoundException('Document not found');
    const path = (doc.payload as { path?: string })?.path;
    if (!path) throw new NotFoundException('Document payload missing path');
    const filePath = join(this.documentsDir, path);
    if (!existsSync(filePath)) throw new NotFoundException('Document file missing');
    const mimeType = doc.format === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return { stream: createReadStream(filePath), filename: doc.filename, mimeType };
  }

  private async updatePersonal(id: string, payload: EmployeePersonal) {
    if (!this.canEditPersonal()) throw new ForbiddenException('Insufficient permissions');
    const existing = await this.prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Employee not found');

    const data: Prisma.EmployeeUpdateInput = {
      givenName: payload.legalName.first,
      middleName: payload.legalName.middle ?? null,
      familyName: payload.legalName.last,
      nameSuffix: payload.legalName.suffix ?? null,
      preferredName: payload.preferredName ?? null,
      pronouns: payload.pronouns ?? null,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : existing.dateOfBirth,
      nationalIdentifiers: payload.nationalIdentifiers,
      citizenships: payload.citizenships,
      languages: payload.languages,
      maritalStatus: payload.maritalStatus ?? null,
      veteranStatus: payload.veteranStatus ?? null
    };

    await this.prisma.employee.update({ where: { id }, data });
    await this.recordEvent(id, 'OTHER', { section: 'personal' });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'profile.personal.updated',
      changes: { before: existing, after: data }
    });
    return this.getEmployeeProfile(id);
  }

  private async updateContact(id: string, payload: EmployeeContact) {
    if (!this.canEditPersonal()) throw new ForbiddenException('Insufficient permissions');
    await this.prisma.employee.update({
      where: { id },
      data: {
        personalEmail: payload.personalEmail ?? null,
        workPhone: payload.workPhone ?? null,
        mobilePhone: payload.mobilePhone ?? null,
        communicationPreferences: payload.communicationPreferences
      }
    });

    await this.upsertAddress(id, 'PRIMARY', payload.primaryAddress ?? null);
    await this.upsertAddress(id, 'MAILING', payload.mailingAddress ?? null);
    await this.syncEmergencyContacts(id, payload.emergencyContacts ?? []);

    await this.recordEvent(id, 'OTHER', { section: 'contact' });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'profile.contact.updated',
      changes: { payload }
    });
    return this.getEmployeeProfile(id);
  }

  private async updateJob(id: string, payload: EmployeeJob) {
    if (!this.canEditJob()) throw new ForbiddenException('Insufficient permissions');
    const employee = await this.ensureEmployeeExists(id);
    const employment = await this.prisma.employment.findFirst({
      where: { employeeId: id },
      orderBy: { startDate: 'desc' }
    }).catch(() => null);

    const data: Prisma.EmployeeUpdateInput = {
      jobTitle: payload.jobTitle ?? null,
      departmentId: payload.department?.id ?? employee.departmentId,
      locationId: payload.location?.id ?? employee.locationId,
      status: payload.status,
      serviceDate: payload.serviceDate ? new Date(payload.serviceDate) : employee.serviceDate,
      probationEndDate: payload.probationEndDate ? new Date(payload.probationEndDate) : employee.probationEndDate,
      contractEndDate: payload.contractEndDate ? new Date(payload.contractEndDate) : employee.contractEndDate,
      exempt: payload.exempt
    };

    data.position = payload.positionId
      ? { connect: { id: payload.positionId } }
      : { disconnect: true };

    await this.prisma.employee.update({ where: { id }, data });

    if (employment) {
      await this.prisma.employment.update({
        where: { id: employment.id },
        data: {
          grade: payload.grade ?? employment.grade,
          employmentType: payload.employmentType,
          workerType: payload.workerType,
          standardHours: payload.standardHours ?? employment.standardHours,
          schedule: payload.schedule ?? employment.schedule,
          fte: payload.fte ?? employment.fte
        }
      });
    }

    await this.recordEvent(id, 'TRANSFER', { payload });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'profile.job.updated',
      changes: { payload }
    });
    return this.getEmployeeProfile(id);
  }

  private async updateCompensation(id: string, payload: EmployeeCompensation) {
    if (!this.canEditCompensation()) throw new ForbiddenException('Insufficient permissions');
    const employment = await this.prisma.employment.findFirst({
      where: { employeeId: id },
      orderBy: { startDate: 'desc' }
    });
    if (!employment) throw new BadRequestException('Employment record missing');

    await this.prisma.employment.update({
      where: { id: employment.id },
      data: {
        payRate: new Prisma.Decimal(payload.baseSalary.amount),
        currency: payload.baseSalary.currency,
        payFrequency: payload.baseSalary.frequency,
        grade: payload.payGrade ?? employment.grade,
        bonusTarget: payload.bonusTargetPercent ?? employment.bonusTarget,
        allowances: payload.allowances,
        stockPlan: payload.stockPlan ?? employment.stockPlan
      }
    });

    await this.recordEvent(id, 'COMP_CHANGE', { payload });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'profile.compensation.updated',
      changes: { payload }
    });
    return this.getEmployeeProfile(id);
  }

  private async updateTimeAndEligibility(id: string, payload: EmployeeTimeEligibility) {
    if (!this.canEditJob()) throw new ForbiddenException('Insufficient permissions');
    await this.prisma.employee.update({
      where: { id },
      data: {
        timezone: payload.timezone,
        workSchedule: payload.workSchedule,
        badgeId: payload.badgeId ?? null,
        overtimeEligible: payload.overtimeEligible,
        benefitsEligible: payload.benefitsEligible,
        exempt: payload.exempt
      }
    });
    await this.recordEvent(id, 'OTHER', { section: 'timeAndEligibility' });
    await this.audit.record({
      entity: 'employee',
      entityId: id,
      action: 'profile.timeEligibility.updated',
      changes: { payload }
    });
    return this.getEmployeeProfile(id);
  }

  private resolvePermissions() {
    const roles = new Set<string>(this.cls.get('actorAppRoles') ?? []);
    return {
      canEditPersonal: roles.has('HR_ADMIN') || roles.has('HRBP') || roles.has('EMPLOYEE'),
      canEditJob: roles.has('HR_ADMIN') || roles.has('HRBP'),
      canEditCompensation: roles.has('HR_ADMIN') || roles.has('HRBP'),
      canManageCostSplits: roles.has('HR_ADMIN') || roles.has('HRBP') || roles.has('FINANCE'),
      canGenerateDocuments: roles.has('HR_ADMIN') || roles.has('HRBP')
    };
  }

  private canEditPersonal() {
    const roles = new Set<string>(this.cls.get('actorAppRoles') ?? []);
    return roles.has('HR_ADMIN') || roles.has('HRBP') || roles.has('EMPLOYEE');
  }

  private canEditJob() {
    const roles = new Set<string>(this.cls.get('actorAppRoles') ?? []);
    return roles.has('HR_ADMIN') || roles.has('HRBP');
  }

  private canEditCompensation() {
    const roles = new Set<string>(this.cls.get('actorAppRoles') ?? []);
    return roles.has('HR_ADMIN') || roles.has('HRBP');
  }

  private buildFullName(employee: { givenName: string; middleName?: string | null; familyName: string; nameSuffix?: string | null }) {
    return [employee.givenName, employee.middleName, employee.familyName, employee.nameSuffix]
      .filter((part) => part && part.length > 0)
      .join(' ');
  }

  private buildCostSplitSummary(splits: Array<{ costCode: { code: string }; percentage: number; startDate: string; endDate: string | null }>) {
    const active = splits.filter((split) => {
      const start = new Date(split.startDate);
      const end = split.endDate ? new Date(split.endDate) : null;
      const now = new Date();
      return start <= now && (!end || end >= now);
    });
    if (!active.length) return null;
    return active
      .sort((a, b) => b.percentage - a.percentage)
      .map((split) => `${split.costCode.code} (${split.percentage}%)`)
      .join(' / ');
  }

  private validateCostSplits(splits: CostSplitInput[]) {
    if (!splits.length) throw new BadRequestException('At least one cost split required');
    const events: Array<{ date: Date; change: number }> = [];
    for (const split of splits) {
      const start = new Date(split.startDate);
      const end = split.endDate ? new Date(split.endDate) : null;
      if (Number.isNaN(start.getTime())) throw new BadRequestException('Invalid start date');
      if (end && Number.isNaN(end.getTime())) throw new BadRequestException('Invalid end date');
      if (end && end < start) throw new BadRequestException('End date must be after start date');
      events.push({ date: start, change: split.percentage });
      events.push({ date: end ? new Date(end.getTime() + 1) : MAX_DATE, change: -split.percentage });
    }
    events.sort((a, b) => a.date.getTime() - b.date.getTime() || b.change - a.change);
    let current = 0;
    for (const event of events) {
      current += event.change;
      if (current > 100.0001) {
        throw new BadRequestException('Cost split percentages exceed 100% for overlapping periods');
      }
    }
  }

  private ensureStorage() {
    if (!existsSync(this.storageRoot)) {
      mkdirSync(this.storageRoot, { recursive: true });
    }
    if (!existsSync(this.documentsDir)) {
      mkdirSync(this.documentsDir, { recursive: true });
    }
  }

  private async ensureEmployeeExists(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  private async upsertAddress(
    employeeId: string,
    type: 'PRIMARY' | 'MAILING',
    address: {
      line1: string;
      line2?: string | null;
      suburb: string;
      state: string;
      postcode: string;
      country: string;
    } | null
  ) {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    if (!address) {
      await this.prisma.employeeAddress.deleteMany({ where: { employeeId, type } });
      return;
    }
    await this.prisma.employeeAddress.upsert({
      where: {
        tenantId_employeeId_type: {
          tenantId,
          employeeId,
          type
        }
      },
      create: {
        tenantId,
        employeeId,
        type,
        line1: address.line1,
        line2: address.line2 ?? null,
        suburb: address.suburb,
        state: address.state,
        postcode: address.postcode,
        country: address.country
      },
      update: {
        line1: address.line1,
        line2: address.line2 ?? null,
        suburb: address.suburb,
        state: address.state,
        postcode: address.postcode,
        country: address.country
      }
    });
  }

  private async syncEmergencyContacts(
    employeeId: string,
    contacts: Array<{ id?: string; name: string; relationship: string; phone: string; email?: string | null }>
  ) {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    const existing = await this.prisma.employeeEmergencyContact.findMany({ where: { employeeId } });
    const keep = new Set<string>();
    for (const contact of contacts) {
      if (contact.id) {
        keep.add(contact.id);
        await this.prisma.employeeEmergencyContact.update({
          where: { id: contact.id },
          data: {
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            email: contact.email ?? null
          }
        });
      } else {
        const created = await this.prisma.employeeEmergencyContact.create({
          data: {
            tenantId,
            employeeId,
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            email: contact.email ?? null
          }
        });
        keep.add(created.id);
      }
    }
    for (const contact of existing) {
      if (!keep.has(contact.id)) {
        await this.prisma.employeeEmergencyContact.delete({ where: { id: contact.id } });
      }
    }
  }

  private async recordEvent(employeeId: string, type: EmploymentEventType, payload: Record<string, unknown>) {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) throw new BadRequestException('Tenant context missing');
    await this.prisma.employmentEvent.create({
      data: {
        tenantId,
        employeeId,
        type,
        effectiveDate: new Date(),
        payload: asJson(payload),
        actorId: this.cls.get('actorId') ?? 'system',
        source: 'UI',
        createdBy: this.cls.get('actorId') ?? 'system'
      }
    });
  }
}

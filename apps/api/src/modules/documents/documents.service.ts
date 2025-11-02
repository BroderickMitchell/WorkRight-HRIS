import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  documentTemplateSchema,
  documentTemplateRevisionSchema,
  documentTemplateFiltersSchema,
  upsertDocumentTemplateSchema,
  updateDocumentTemplateMetadataSchema,
  generatedDocumentSchema,
  generateDocumentPreviewSchema,
  signGeneratedDocumentSchema,
  type DocumentTemplate,
  type DocumentTemplateRevision
} from '@workright/profile-schema';
import { PrismaService } from '../../common/prisma.service.js';
import { AuditService } from '../../common/audit.service.js';
import { ClsService } from 'nestjs-cls';
import { DocumentGenerationService } from '../employee-profile/services/document-generation.service.js';
import { join } from 'node:path';
import { createReadStream, existsSync, mkdirSync } from 'node:fs';

interface DownloadDescriptor {
  filename: string;
  mimeType: string;
  stream: ReturnType<typeof createReadStream>;
}

@Injectable()
export class DocumentsService {
  private readonly storageRoot = join(process.cwd(), 'apps/api/storage');
  private readonly templateAssetsDir = join(this.storageRoot, 'template-assets');
  private readonly generatedDir = join(this.storageRoot, 'generated-documents');

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly cls: ClsService,
    private readonly generator: DocumentGenerationService
  ) {
    this.ensureStorage();
  }

  private ensureStorage() {
    if (!existsSync(this.storageRoot)) {
      mkdirSync(this.storageRoot, { recursive: true });
    }
    if (!existsSync(this.templateAssetsDir)) {
      mkdirSync(this.templateAssetsDir, { recursive: true });
    }
    if (!existsSync(this.generatedDir)) {
      mkdirSync(this.generatedDir, { recursive: true });
    }
  }

  private getTenantId(): string {
    const tenantId = this.cls.get('tenantId');
    if (!tenantId) {
      throw new BadRequestException('Tenant context missing');
    }
    return tenantId;
  }

  private actorId(): string {
    return this.cls.get('actorId') ?? 'system';
  }

  private static toJson(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
  }

  private normalisePlaceholders(value: Prisma.JsonValue | null | undefined) {
    if (!Array.isArray(value)) {
      return [] as DocumentTemplate['placeholders'];
    }
    return value
      .map((item) => {
        if (typeof item !== 'object' || item === null) return null;
        const key = 'key' in item ? String((item as Record<string, unknown>).key ?? '') : '';
        const label = 'label' in item ? String((item as Record<string, unknown>).label ?? key) : key;
        return {
          key,
          label,
          description:
            'description' in item && item.description != null
              ? String((item as Record<string, unknown>).description)
              : null,
          required: Boolean((item as Record<string, unknown>).required ?? false)
        };
      })
      .filter((item): item is DocumentTemplate['placeholders'][number] => Boolean(item));
  }

  private mapTemplate(template: Prisma.DocumentTemplateGetPayload<Prisma.DocumentTemplateDefaultArgs>): DocumentTemplate {
    return documentTemplateSchema.parse({
      id: template.id,
      name: template.name,
      description: template.description ?? null,
      format: template.format,
      category: template.category,
      version: template.version,
      isActive: template.isActive,
      placeholders: this.normalisePlaceholders(template.placeholders),
      lastUpdatedAt: template.updatedAt.toISOString(),
      createdBy: template.createdBy ?? null,
      body: template.body
    });
  }

  async listTemplates(rawFilters: Record<string, unknown>): Promise<DocumentTemplate[]> {
    const tenantId = this.getTenantId();
    const filters = documentTemplateFiltersSchema.partial().parse(rawFilters ?? {});
    const templates = await this.prisma.documentTemplate.findMany({
      where: {
        tenantId,
        ...(filters.category ? { category: filters.category } : {}),
        ...(filters.active !== undefined ? { isActive: filters.active } : {}),
        ...(filters.createdBy ? { createdBy: filters.createdBy } : {})
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    return templates.map((template) => this.mapTemplate(template));
  }

  async getTemplate(id: string): Promise<{ template: DocumentTemplate; revisions: DocumentTemplateRevision[] }> {
    const tenantId = this.getTenantId();
    const template = await this.prisma.documentTemplate.findFirst({
      where: { id, tenantId },
      include: { revisions: { orderBy: { version: 'desc' } } }
    });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const mapped = this.mapTemplate(template);
    const revisions = template.revisions.map((revision) =>
      documentTemplateRevisionSchema.parse({
        id: revision.id,
        name: template.name,
        description: template.description ?? null,
        format: template.format,
        category: template.category,
        version: revision.version,
        isActive: template.isActive,
        placeholders: this.normalisePlaceholders(revision.placeholders),
        lastUpdatedAt: template.updatedAt.toISOString(),
        createdBy: revision.createdBy ?? null,
        body: revision.body,
        createdAt: revision.createdAt.toISOString()
      })
    );
    return { template: mapped, revisions };
  }

  async createTemplate(rawInput: Record<string, unknown>): Promise<DocumentTemplate> {
    const input = upsertDocumentTemplateSchema.parse(rawInput);
    if (input.id) {
      throw new BadRequestException('Use the version endpoint to update an existing template');
    }
    const tenantId = this.getTenantId();
    const actor = this.actorId();
    const created = await this.prisma.documentTemplate.create({
      data: {
        tenantId,
        name: input.name,
        description: input.description ?? null,
        category: input.category,
        format: input.format,
        body: input.body,
        placeholders: DocumentsService.toJson(input.placeholders ?? []),
        isActive: input.isActive ?? true,
        version: 1,
        createdBy: actor
      }
    });
    await this.prisma.documentTemplateRevision.create({
      data: {
        tenantId,
        templateId: created.id,
        version: 1,
        body: input.body,
        placeholders: DocumentsService.toJson(input.placeholders ?? []),
        createdBy: actor
      }
    });
    await this.audit.record({
      entity: 'documentTemplate',
      entityId: created.id,
      action: 'created',
      changes: { name: input.name, category: input.category, format: input.format }
    });
    return this.mapTemplate(created);
  }

  async createVersion(id: string, rawInput: Record<string, unknown>): Promise<DocumentTemplate> {
    const input = upsertDocumentTemplateSchema.parse({ ...rawInput, id });
    const tenantId = this.getTenantId();
    const template = await this.prisma.documentTemplate.findFirst({ where: { id, tenantId } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const actor = this.actorId();
    const nextVersion = template.version + 1;
    const updated = await this.prisma.documentTemplate.update({
      where: { id: template.id },
      data: {
        name: input.name ?? template.name,
        description: input.description ?? template.description,
        category: input.category ?? template.category,
        format: input.format,
        body: input.body,
        placeholders: DocumentsService.toJson(input.placeholders ?? []),
        isActive: input.isActive ?? template.isActive,
        version: nextVersion
      }
    });
    await this.prisma.documentTemplateRevision.create({
      data: {
        tenantId,
        templateId: template.id,
        version: nextVersion,
        body: input.body,
        placeholders: DocumentsService.toJson(input.placeholders ?? []),
        createdBy: actor
      }
    });
    await this.audit.record({
      entity: 'documentTemplate',
      entityId: template.id,
      action: 'version.created',
      changes: { version: nextVersion }
    });
    return this.mapTemplate(updated);
  }

  async updateMetadata(id: string, rawInput: Record<string, unknown>): Promise<DocumentTemplate> {
    const input = updateDocumentTemplateMetadataSchema.parse(rawInput);
    const tenantId = this.getTenantId();
    const template = await this.prisma.documentTemplate.findFirst({ where: { id, tenantId } });
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    const updated = await this.prisma.documentTemplate.update({
      where: { id },
      data: {
        name: input.name ?? template.name,
        description: input.description ?? template.description,
        category: input.category ?? template.category,
        isActive: input.isActive ?? template.isActive
      }
    });
    await this.audit.record({
      entity: 'documentTemplate',
      entityId: id,
      action: 'metadata.updated',
      changes: input
    });
    return this.mapTemplate(updated);
  }

  async preview(rawInput: Record<string, unknown>) {
    const input = generateDocumentPreviewSchema.parse(rawInput);
    const tenantId = this.getTenantId();
    let body = input.body ?? '';
    let name = input.name ?? 'Document Preview';
    if (input.templateId) {
      const template = await this.prisma.documentTemplate.findFirst({ where: { id: input.templateId, tenantId } });
      if (!template) throw new NotFoundException('Template not found');
      body = template.body;
      name = template.name;
    }
    if (!body) {
      throw new BadRequestException('Template body is required for preview');
    }
    const artifact = await this.generator.generate(input.format, name, body, input.data ?? {});
    const base64 = Buffer.from(artifact.buffer).toString('base64');
    return {
      filename: artifact.filename,
      mimeType: artifact.mimeType,
      base64
    };
  }

  async signDocument(rawInput: Record<string, unknown>) {
    const input = signGeneratedDocumentSchema.parse(rawInput);
    const tenantId = this.getTenantId();
    const document = await this.prisma.generatedDocument.findFirst({
      where: { id: input.documentId, tenantId },
      include: { template: true }
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    if (document.signed) {
      return generatedDocumentSchema.parse({
        id: document.id,
        templateId: document.templateId ?? undefined,
        templateName: document.template?.name ?? undefined,
        format: document.format,
        filename: document.filename,
        storageUrl: document.storageUrl,
        createdAt: document.createdAt.toISOString(),
        createdBy: document.createdBy ?? null,
        status: document.status,
        signed: document.signed,
        signedAt: document.signedAt ? document.signedAt.toISOString() : null,
        signedBy: document.signedBy ?? null
      });
    }
    const updated = await this.prisma.generatedDocument.update({
      where: { id: document.id },
      data: {
        signed: true,
        signedBy: input.signedBy,
        signedAt: new Date(),
        status: 'signed',
        payload: document.payload,
        data: document.data
      }
    });
    await this.audit.record({
      entity: 'generatedDocument',
      entityId: document.id,
      action: 'signed',
      changes: { signedBy: input.signedBy }
    });
    return generatedDocumentSchema.parse({
      id: updated.id,
      templateId: updated.templateId ?? undefined,
      templateName: document.template?.name ?? undefined,
      format: updated.format,
      filename: updated.filename,
      storageUrl: updated.storageUrl,
      createdAt: updated.createdAt.toISOString(),
      createdBy: updated.createdBy ?? null,
      status: updated.status,
      signed: updated.signed,
      signedAt: updated.signedAt ? updated.signedAt.toISOString() : null,
      signedBy: updated.signedBy ?? null
    });
  }

  async getDownloadDescriptor(id: string): Promise<DownloadDescriptor> {
    const tenantId = this.getTenantId();
    const document = await this.prisma.generatedDocument.findFirst({ where: { id, tenantId } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const path = (document.payload as { path?: string } | null)?.path;
    if (!path) {
      throw new NotFoundException('Document payload missing path');
    }
    const filePath = join(this.generatedDir, path);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Document artifact not found');
    }
    const mimeType = document.format === 'PDF'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    return { filename: document.filename, mimeType, stream: createReadStream(filePath) };
  }

  async deleteTemplate(id: string) {
    const tenantId = this.getTenantId();
    const template = await this.prisma.documentTemplate.findFirst({ where: { id, tenantId } });
    if (!template) throw new NotFoundException('Template not found');
    await this.prisma.documentTemplate.update({
      where: { id },
      data: { isActive: false }
    });
    await this.audit.record({ entity: 'documentTemplate', entityId: id, action: 'archived', changes: {} });
  }
}

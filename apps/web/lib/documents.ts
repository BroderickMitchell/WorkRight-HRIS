import {
  documentTemplateSchema,
  documentTemplateRevisionSchema,
  upsertDocumentTemplateSchema,
  updateDocumentTemplateMetadataSchema,
  generateDocumentPreviewSchema,
  signGeneratedDocumentSchema,
  generatedDocumentSchema,
  type DocumentTemplate,
  type DocumentTemplateRevision,
  type UpsertDocumentTemplateInput,
} from '@workright/profile-schema';
import { apiDelete, apiFetch, apiPatch, apiPost } from './api';

type TemplateFilters = {
  category?: string;
  active?: boolean;
  createdBy?: string;
};

type TemplateDetail = {
  template: DocumentTemplate;
  revisions: DocumentTemplateRevision[];
};

type DocumentPreview = {
  filename: string;
  mimeType: string;
  base64: string;
};

type SignDocumentInput = {
  documentId: string;
  signedBy: string;
  note?: string | null;
};

export async function listDocumentTemplates(
  filters: TemplateFilters = {},
): Promise<DocumentTemplate[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (typeof filters.active === 'boolean')
    params.set('active', String(filters.active));
  if (filters.createdBy) params.set('createdBy', filters.createdBy);
  const query = params.toString();
  const data = await apiFetch(
    `/documents/templates${query ? `?${query}` : ''}`,
  );
  return (data as unknown[]).map((item) => documentTemplateSchema.parse(item));
}

export async function getDocumentTemplate(id: string): Promise<TemplateDetail> {
  const data = await apiFetch(`/documents/templates/${id}`);
  return {
    template: documentTemplateSchema.parse(
      (data as { template: unknown }).template,
    ),
    revisions: ((data as { revisions: unknown[] }).revisions ?? []).map((rev) =>
      documentTemplateRevisionSchema.parse(rev),
    ),
  };
}

export async function createDocumentTemplate(
  input: UpsertDocumentTemplateInput,
): Promise<DocumentTemplate> {
  const payload = upsertDocumentTemplateSchema.parse(input);
  const data = await apiPost('/documents/templates', payload);
  return documentTemplateSchema.parse(data);
}

export async function createDocumentTemplateVersion(
  id: string,
  input: UpsertDocumentTemplateInput,
): Promise<DocumentTemplate> {
  const payload = upsertDocumentTemplateSchema.parse({ ...input, id });
  const data = await apiPost(`/documents/templates/${id}/versions`, payload);
  return documentTemplateSchema.parse(data);
}

export async function updateDocumentTemplate(
  id: string,
  input: unknown,
): Promise<DocumentTemplate> {
  const payload = updateDocumentTemplateMetadataSchema.parse(input);
  const data = await apiPatch(`/documents/templates/${id}`, payload);
  return documentTemplateSchema.parse(data);
}

export async function archiveDocumentTemplate(id: string) {
  await apiDelete(`/documents/templates/${id}`);
}

export async function previewDocumentTemplate(
  input: unknown,
): Promise<DocumentPreview> {
  const payload = generateDocumentPreviewSchema.parse(input);
  const data = await apiPost('/documents/preview', payload);
  return {
    filename: String((data as { filename?: string }).filename ?? 'preview.pdf'),
    mimeType: String(
      (data as { mimeType?: string }).mimeType ?? 'application/pdf',
    ),
    base64: String((data as { base64?: string }).base64 ?? ''),
  };
}

export async function signGeneratedDocument(input: SignDocumentInput) {
  const payload = signGeneratedDocumentSchema.parse(input);
  const data = await apiPost('/documents/sign', payload);
  return generatedDocumentSchema.parse(data);
}

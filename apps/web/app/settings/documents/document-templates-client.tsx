"use client";

import { useEffect, useMemo, useState } from 'react';
import type { DocumentTemplate, DocumentTemplateRevision } from '@workright/profile-schema';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import {
  archiveDocumentTemplate,
  createDocumentTemplate,
  createDocumentTemplateVersion,
  getDocumentTemplate,
  listDocumentTemplates,
  previewDocumentTemplate,
  updateDocumentTemplate
} from '../../../lib/documents';

type TemplateDetail = {
  template: DocumentTemplate;
  revisions: DocumentTemplateRevision[];
};

type PlaceholderDraft = {
  key: string;
  label: string;
  description?: string;
  required: boolean;
};

type TemplateDraft = {
  name: string;
  description?: string;
  category: DocumentTemplate['category'];
  format: DocumentTemplate['format'];
  body: string;
  placeholders: PlaceholderDraft[];
  isActive: boolean;
};

const categories: DocumentTemplate['category'][] = ['HR', 'Payroll', 'Compliance', 'Legal', 'Custom'];
const formats: DocumentTemplate['format'][] = ['PDF', 'DOCX'];

function sanitisePlaceholders(items: PlaceholderDraft[]) {
  return items
    .filter((item) => item.key.trim().length > 0)
    .map((item) => ({
      key: item.key.trim(),
      label: item.label.trim() || item.key.trim(),
      description: item.description?.trim() || null,
      required: item.required
    }));
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export default function DocumentTemplatesClient() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [filters, setFilters] = useState<{ category?: DocumentTemplate['category']; includeInactive: boolean }>({
    category: undefined,
    includeInactive: false
  });
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string>('');
  const [detail, setDetail] = useState<TemplateDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailMessage, setDetailMessage] = useState<string | null>(null);

  const [newTemplateDraft, setNewTemplateDraft] = useState<TemplateDraft>({
    name: '',
    description: '',
    category: 'HR',
    format: 'PDF',
    body: 'Dear {{employee.name}},\n\nWelcome to the team!',
    placeholders: [{ key: 'employee.name', label: 'Employee name', required: true }],
    isActive: true
  });
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const [metadataDraft, setMetadataDraft] = useState<{ name: string; description?: string; category: DocumentTemplate['category']; isActive: boolean } | null>(
    null
  );
  const [versionDraft, setVersionDraft] = useState<TemplateDraft | null>(null);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);

  const loadTemplates = async () => {
    setListLoading(true);
    setListError(null);
    try {
      const data = await listDocumentTemplates({
        category: filters.category,
        active: filters.includeInactive ? undefined : true
      });
      setTemplates(data);
      if (!data.find((tpl) => tpl.id === selectedId)) {
        setSelectedId(data[0]?.id ?? '');
      }
    } catch (error) {
      setListError(error instanceof Error ? error.message : 'Unable to load templates');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.includeInactive]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setMetadataDraft(null);
      setVersionDraft(null);
      return;
    }
    let cancelled = false;
    async function loadDetail() {
      setDetailLoading(true);
      setDetailError(null);
      setDetailMessage(null);
      try {
        const data = await getDocumentTemplate(selectedId);
        if (cancelled) return;
        setDetail(data);
        setMetadataDraft({
          name: data.template.name,
          description: data.template.description ?? '',
          category: data.template.category,
          isActive: data.template.isActive
        });
        setVersionDraft({
          name: data.template.name,
          description: data.template.description ?? '',
          category: data.template.category,
          format: data.template.format,
          body: data.template.body ?? '',
          placeholders: data.template.placeholders.map((item) => ({
            key: item.key,
            label: item.label,
            description: item.description ?? '',
            required: item.required ?? false
          })),
          isActive: data.template.isActive
        });
      } catch (error) {
        if (!cancelled) setDetailError(error instanceof Error ? error.message : 'Unable to load template');
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    }
    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleCreateTemplate = async () => {
    setCreatingTemplate(true);
    setCreateError(null);
    setCreateMessage(null);
    try {
      const payload = {
        ...newTemplateDraft,
        placeholders: sanitisePlaceholders(newTemplateDraft.placeholders)
      };
      const created = await createDocumentTemplate(payload);
      setCreateMessage(`Created ${created.name}`);
      setNewTemplateDraft({
        name: '',
        description: '',
        category: 'HR',
        format: 'PDF',
        body: 'Dear {{employee.name}},\n\nWelcome to the team!',
        placeholders: [{ key: 'employee.name', label: 'Employee name', required: true }],
        isActive: true
      });
      await loadTemplates();
      setSelectedId(created.id);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Failed to create template');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const handleUpdateMetadata = async () => {
    if (!selectedId || !metadataDraft) return;
    setSavingMetadata(true);
    setDetailMessage(null);
    try {
      const updated = await updateDocumentTemplate(selectedId, {
        name: metadataDraft.name,
        description: metadataDraft.description,
        category: metadataDraft.category,
        isActive: metadataDraft.isActive
      });
      setDetail((prev) => (prev ? { ...prev, template: { ...prev.template, ...updated } } : prev));
      setDetailMessage('Metadata updated');
      await loadTemplates();
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Failed to update template');
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleArchiveTemplate = async () => {
    if (!selectedId) return;
    setSavingMetadata(true);
    setDetailMessage(null);
    try {
      await archiveDocumentTemplate(selectedId);
      setDetailMessage('Template archived');
      await loadTemplates();
      setSelectedId('');
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Failed to archive template');
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!selectedId || !versionDraft) return;
    setSavingVersion(true);
    setDetailMessage(null);
    try {
      const payload = {
        ...versionDraft,
        placeholders: sanitisePlaceholders(versionDraft.placeholders)
      };
      const updated = await createDocumentTemplateVersion(selectedId, payload);
      setDetail((prev) =>
        prev
          ? {
              template: { ...updated },
              revisions: prev.revisions
            }
          : prev
      );
      setDetailMessage(`Published version ${updated.version}`);
      await loadTemplates();
      const refreshed = await getDocumentTemplate(selectedId);
      setDetail(refreshed);
      setVersionDraft({
        name: refreshed.template.name,
        description: refreshed.template.description ?? '',
        category: refreshed.template.category,
        format: refreshed.template.format,
        body: refreshed.template.body ?? '',
        placeholders: refreshed.template.placeholders.map((item) => ({
          key: item.key,
          label: item.label,
          description: item.description ?? '',
          required: item.required ?? false
        })),
        isActive: refreshed.template.isActive
      });
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Failed to save version');
    } finally {
      setSavingVersion(false);
    }
  };

  const handlePreviewDraft = async () => {
    if (!versionDraft) return;
    try {
      const preview = await previewDocumentTemplate({
        body: versionDraft.body,
        format: versionDraft.format,
        name: versionDraft.name,
        data: {}
      });
      const blob = base64ToBlob(preview.base64, preview.mimeType);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Unable to generate preview');
    }
  };

  const selectedTemplate = useMemo(() => templates.find((tpl) => tpl.id === selectedId) ?? null, [selectedId, templates]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_2fr]" aria-label="Document template settings">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Template library</CardTitle>
            <CardDescription>Manage reusable templates for contracts, offers, and compliance letters.</CardDescription>
          </div>
        </CardHeader>
        <div className="p-6 pt-0 space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">Category</label>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={filters.category ?? ''}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, category: (event.target.value || undefined) as DocumentTemplate['category'] | undefined }))
              }
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.includeInactive}
                onChange={(event) => setFilters((prev) => ({ ...prev, includeInactive: event.target.checked }))}
              />
              Show archived templates
            </label>
          </div>
          {listLoading ? (
            <div className="text-sm text-slate-500">Loading templates…</div>
          ) : listError ? (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{listError}</div>
          ) : templates.length === 0 ? (
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
              No templates yet. Create one to get started.
            </div>
          ) : (
            <ul className="space-y-2">
              {templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(template.id)}
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      template.id === selectedId
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-xs text-slate-500">{template.category} · v{template.version}</p>
                      </div>
                      <span className={`text-xs ${template.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {template.isActive ? 'Active' : 'Archived'}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Create template</CardTitle>
              <CardDescription>Define the base template, including merge fields and rich body content.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            {createMessage && <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{createMessage}</div>}
            {createError && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{createError}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="newTemplateName">
                  Template name
                </label>
                <input
                  id="newTemplateName"
                  value={newTemplateDraft.name}
                  onChange={(event) => setNewTemplateDraft((prev) => ({ ...prev, name: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="newTemplateCategory">
                  Category
                </label>
                <select
                  id="newTemplateCategory"
                  value={newTemplateDraft.category}
                  onChange={(event) =>
                    setNewTemplateDraft((prev) => ({ ...prev, category: event.target.value as DocumentTemplate['category'] }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor="newTemplateFormat">
                  Output format
                </label>
                <select
                  id="newTemplateFormat"
                  value={newTemplateDraft.format}
                  onChange={(event) =>
                    setNewTemplateDraft((prev) => ({ ...prev, format: event.target.value as DocumentTemplate['format'] }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {formats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="newTemplateDescription">
                  Description
                </label>
                <textarea
                  id="newTemplateDescription"
                  value={newTemplateDraft.description ?? ''}
                  onChange={(event) => setNewTemplateDraft((prev) => ({ ...prev, description: event.target.value }))}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Offer letter for salaried employees"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700" htmlFor="newTemplateBody">
                  Template body
                </label>
                <textarea
                  id="newTemplateBody"
                  value={newTemplateDraft.body}
                  onChange={(event) => setNewTemplateDraft((prev) => ({ ...prev, body: event.target.value }))}
                  rows={8}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                  placeholder="Use {{employee.name}} to merge in values"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">Merge fields</label>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setNewTemplateDraft((prev) => ({
                        ...prev,
                        placeholders: [...prev.placeholders, { key: '', label: '', description: '', required: false }]
                      }))
                    }
                  >
                    Add field
                  </Button>
                </div>
                <div className="space-y-2">
                  {newTemplateDraft.placeholders.map((placeholder, index) => (
                    <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={placeholder.key}
                        onChange={(event) =>
                          setNewTemplateDraft((prev) => {
                            const copy = [...prev.placeholders];
                            copy[index] = { ...copy[index], key: event.target.value };
                            return { ...prev, placeholders: copy };
                          })
                        }
                        placeholder="employee.name"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        value={placeholder.label}
                        onChange={(event) =>
                          setNewTemplateDraft((prev) => {
                            const copy = [...prev.placeholders];
                            copy[index] = { ...copy[index], label: event.target.value };
                            return { ...prev, placeholders: copy };
                          })
                        }
                        placeholder="Employee name"
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={placeholder.required}
                          onChange={(event) =>
                            setNewTemplateDraft((prev) => {
                              const copy = [...prev.placeholders];
                              copy[index] = { ...copy[index], required: event.target.checked };
                              return { ...prev, placeholders: copy };
                            })
                          }
                        />
                        Required
                      </label>
                      <textarea
                        value={placeholder.description ?? ''}
                        onChange={(event) =>
                          setNewTemplateDraft((prev) => {
                            const copy = [...prev.placeholders];
                            copy[index] = { ...copy[index], description: event.target.value };
                            return { ...prev, placeholders: copy };
                          })
                        }
                        rows={2}
                        className="md:col-span-3 rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Shown beside the merge field"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleCreateTemplate} disabled={creatingTemplate}>
                {creatingTemplate ? 'Creating…' : 'Create template'}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Template detail</CardTitle>
              <CardDescription>Review history, toggle availability, and publish new versions.</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-4 p-6 pt-0">
            {!selectedTemplate ? (
              <div className="text-sm text-slate-500">Select a template to manage versions.</div>
            ) : detailLoading ? (
              <div className="text-sm text-slate-500">Loading template…</div>
            ) : detailError ? (
              <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{detailError}</div>
            ) : detail ? (
              <>
                {detailMessage && <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{detailMessage}</div>}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="metadataName">
                      Template name
                    </label>
                    <input
                      id="metadataName"
                      value={metadataDraft?.name ?? ''}
                      onChange={(event) =>
                        setMetadataDraft((prev) => (prev ? { ...prev, name: event.target.value } : prev))
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="metadataCategory">
                      Category
                    </label>
                    <select
                      id="metadataCategory"
                      value={metadataDraft?.category ?? 'HR'}
                      onChange={(event) =>
                        setMetadataDraft((prev) =>
                          prev ? { ...prev, category: event.target.value as DocumentTemplate['category'] } : prev
                        )
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="metadataActive">
                      Active
                    </label>
                    <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                      <input
                        id="metadataActive"
                        type="checkbox"
                        checked={metadataDraft?.isActive ?? true}
                        onChange={(event) =>
                          setMetadataDraft((prev) => (prev ? { ...prev, isActive: event.target.checked } : prev))
                        }
                      />
                      Visible to HR & Payroll
                    </label>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="metadataDescription">
                      Description
                    </label>
                    <textarea
                      id="metadataDescription"
                      value={metadataDraft?.description ?? ''}
                      onChange={(event) =>
                        setMetadataDraft((prev) => (prev ? { ...prev, description: event.target.value } : prev))
                      }
                      rows={2}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleUpdateMetadata} disabled={savingMetadata}>
                    {savingMetadata ? 'Saving…' : 'Save metadata'}
                  </Button>
                  <Button variant="secondary" onClick={handleArchiveTemplate} disabled={savingMetadata}>
                    Archive template
                  </Button>
                </div>

                <hr className="border-slate-200" />

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="versionFormat">
                      Output format
                    </label>
                    <select
                      id="versionFormat"
                      value={versionDraft?.format ?? 'PDF'}
                      onChange={(event) =>
                        setVersionDraft((prev) =>
                          prev ? { ...prev, format: event.target.value as DocumentTemplate['format'] } : prev
                        )
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      {formats.map((format) => (
                        <option key={format} value={format}>
                          {format}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="versionCategory">
                      Category
                    </label>
                    <select
                      id="versionCategory"
                      value={versionDraft?.category ?? 'HR'}
                      onChange={(event) =>
                        setVersionDraft((prev) =>
                          prev ? { ...prev, category: event.target.value as DocumentTemplate['category'] } : prev
                        )
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="versionBody">
                      Template body (v{detail.template.version + 1})
                    </label>
                    <textarea
                      id="versionBody"
                      value={versionDraft?.body ?? ''}
                      onChange={(event) =>
                        setVersionDraft((prev) => (prev ? { ...prev, body: event.target.value } : prev))
                      }
                      rows={8}
                      className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">Merge fields</label>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setVersionDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  placeholders: [...prev.placeholders, { key: '', label: '', description: '', required: false }]
                                }
                              : prev
                          )
                        }
                      >
                        Add field
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {versionDraft?.placeholders.map((placeholder, index) => (
                        <div key={index} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                          <input
                            value={placeholder.key}
                            onChange={(event) =>
                              setVersionDraft((prev) => {
                                if (!prev) return prev;
                                const copy = [...prev.placeholders];
                                copy[index] = { ...copy[index], key: event.target.value };
                                return { ...prev, placeholders: copy };
                              })
                            }
                            placeholder="employee.manager.name"
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                          />
                          <input
                            value={placeholder.label}
                            onChange={(event) =>
                              setVersionDraft((prev) => {
                                if (!prev) return prev;
                                const copy = [...prev.placeholders];
                                copy[index] = { ...copy[index], label: event.target.value };
                                return { ...prev, placeholders: copy };
                              })
                            }
                            placeholder="Manager"
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                          />
                          <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                              type="checkbox"
                              checked={placeholder.required}
                              onChange={(event) =>
                                setVersionDraft((prev) => {
                                  if (!prev) return prev;
                                  const copy = [...prev.placeholders];
                                  copy[index] = { ...copy[index], required: event.target.checked };
                                  return { ...prev, placeholders: copy };
                                })
                              }
                            />
                            Required
                          </label>
                          <textarea
                            value={placeholder.description ?? ''}
                            onChange={(event) =>
                              setVersionDraft((prev) => {
                                if (!prev) return prev;
                                const copy = [...prev.placeholders];
                                copy[index] = { ...copy[index], description: event.target.value };
                                return { ...prev, placeholders: copy };
                              })
                            }
                            rows={2}
                            className="md:col-span-3 rounded-md border border-slate-300 px-3 py-2 text-sm"
                            placeholder="Visible to editors"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={handlePreviewDraft}>
                    Preview draft
                  </Button>
                  <Button onClick={handleCreateVersion} disabled={savingVersion}>
                    {savingVersion ? 'Publishing…' : 'Publish version'}
                  </Button>
                </div>

                <div>
                  <h3 className="mt-6 text-sm font-semibold text-slate-700">Revision history</h3>
                  <ul className="mt-2 space-y-2 text-sm">
                    {detail.revisions.length === 0 && <li className="text-slate-500">No prior versions recorded.</li>}
                    {detail.revisions.map((revision) => (
                      <li key={revision.id} className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Version {revision.version}</span>
                          <span className="text-xs text-slate-500">{new Date(revision.createdAt).toLocaleString()}</span>
                        </div>
                        {revision.createdBy && (
                          <p className="text-xs text-slate-500">Updated by {revision.createdBy}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

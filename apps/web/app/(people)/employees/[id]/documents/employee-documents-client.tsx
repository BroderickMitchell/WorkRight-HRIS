"use client";

import { useEffect, useMemo, useState } from 'react';
import { generatedDocumentSchema } from '@workright/profile-schema';
import type { DocumentTemplate, GeneratedDocument } from '@workright/profile-schema';
import { Card, CardHeader, CardTitle, CardDescription, Button } from '@workright/ui';
import { generateDocument } from '@/lib/employee-profile';
import { signGeneratedDocument } from '@/lib/documents';
import { apiFetch } from '@/lib/api';

interface EmployeeDocumentsClientProps {
  employeeId: string;
  employeeName: string;
  templates: DocumentTemplate[];
  documents: GeneratedDocument[];
}

type MergeValues = Record<string, string>;

type StatusMessage = { type: 'success' | 'error'; text: string } | null;

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const resolveUrl = (path?: string | null) => (path ? new URL(path, apiBase).toString() : '#');

export default function EmployeeDocumentsClient({ employeeId, employeeName, templates, documents }: EmployeeDocumentsClientProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id ?? '');
  const [mergeValues, setMergeValues] = useState<MergeValues>({});
  const [issuedDocuments, setIssuedDocuments] = useState<GeneratedDocument[]>(documents);
  const [statusMessage, setStatusMessage] = useState<StatusMessage>(null);
  const [generating, setGenerating] = useState(false);
  const [signing, setSigning] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('HR Administrator');

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === selectedTemplateId) ?? null, [selectedTemplateId, templates]);

  useEffect(() => {
    if (!selectedTemplate) return;
    const defaults: MergeValues = {};
    selectedTemplate.placeholders.forEach((field) => {
      defaults[field.key] = mergeValues[field.key] ?? '';
    });
    setMergeValues(defaults);
  }, [selectedTemplateId]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    setStatusMessage(null);
    try {
      const payload = await generateDocument(employeeId, {
        templateId: selectedTemplate.id,
        format: selectedTemplate.format,
        mergeFields: mergeValues
      });
      setIssuedDocuments((prev) => [payload, ...prev]);
      setStatusMessage({ type: 'success', text: `Generated ${payload.filename}` });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to generate document' });
    } finally {
      setGenerating(false);
    }
  };

  const handleRefreshDocuments = async (): Promise<boolean> => {
    try {
      const data = await apiFetch(`/v1/employees/${employeeId}/documents`, { cache: 'no-store' });
      setIssuedDocuments((data as unknown[]).map((item) => generatedDocumentSchema.parse(item)));
      return true;
    } catch {
      return false;
    }
  };

  const handleSignDocument = async (documentId: string) => {
    setSigning(documentId);
    setStatusMessage(null);
    try {
      const signed = await signGeneratedDocument({ documentId, signedBy: signerName });
      const refreshed = await handleRefreshDocuments();
      if (!refreshed) {
        setIssuedDocuments((prev) => prev.map((doc) => (doc.id === signed.id ? (signed as GeneratedDocument) : doc)));
      }
      setStatusMessage({
        type: 'success',
        text: refreshed
          ? 'Document signed'
          : 'Document signed. Unable to refresh list automatically; showing cached data.'
      });
    } catch (error) {
      setStatusMessage({ type: 'error', text: error instanceof Error ? error.message : 'Unable to sign document' });
    } finally {
      setSigning(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Generate document</CardTitle>
            <CardDescription>
              Merge a template for <span className="font-medium text-slate-900">{employeeName}</span>.
            </CardDescription>
          </div>
        </CardHeader>
        <div className="space-y-4 p-6 pt-0">
          {statusMessage && (
            <div
              className={`rounded border px-3 py-2 text-sm ${
                statusMessage.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-red-200 bg-red-50 text-red-600'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="templateSelect">
                Template
              </label>
              <select
                id="templateSelect"
                value={selectedTemplateId}
                onChange={(event) => setSelectedTemplateId(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </option>
                ))}
              </select>
              {selectedTemplate?.description && (
                <p className="mt-2 text-xs text-slate-500">{selectedTemplate.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="signerName">
                Sign off as
              </label>
              <input
                id="signerName"
                value={signerName}
                onChange={(event) => setSignerName(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">Used when marking documents as signed.</p>
            </div>
          </div>
          <div className="space-y-4">
            {selectedTemplate?.placeholders.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {selectedTemplate.placeholders.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <label className="block text-sm font-medium text-slate-700" htmlFor={`merge-${field.key}`}>
                      {field.label}
                      {field.required ? <span className="text-red-500"> *</span> : null}
                    </label>
                    <input
                      id={`merge-${field.key}`}
                      value={mergeValues[field.key] ?? ''}
                      onChange={(event) =>
                        setMergeValues((prev) => ({
                          ...prev,
                          [field.key]: event.target.value
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      placeholder={field.description ?? field.key}
                    />
                    {field.description && <p className="text-xs text-slate-500">{field.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">This template has no merge fields.</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleRefreshDocuments}>
              Refresh list
            </Button>
            <Button onClick={handleGenerate} disabled={generating || !selectedTemplateId}>
              {generating ? 'Generating…' : 'Generate document'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Issued documents</CardTitle>
            <CardDescription>Documents created for this employee, with download and sign-off actions.</CardDescription>
          </div>
        </CardHeader>
        <div className="overflow-x-auto p-6 pt-0">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-2">File</th>
                <th className="py-2">Template</th>
                <th className="py-2">Status</th>
                <th className="py-2">Signed</th>
                <th className="py-2">Created</th>
                <th className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {issuedDocuments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-500">
                    No documents generated yet.
                  </td>
                </tr>
              )}
              {issuedDocuments.map((document) => (
                <tr key={document.id}>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-slate-900">{document.filename}</div>
                    <div className="text-xs text-slate-500">{document.format}</div>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{document.templateName ?? 'Ad-hoc'}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        document.status === 'signed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : document.status === 'issued'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {document.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-600">
                    {document.signed
                      ? `Signed by ${document.signedBy ?? 'unknown'} on ${
                          document.signedAt ? new Date(document.signedAt).toLocaleString() : 'date pending'
                        }`
                      : 'Not signed'}
                  </td>
                  <td className="py-3 pr-4 text-slate-600">{new Date(document.createdAt).toLocaleString()}</td>
                  <td className="py-3 pl-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a
                        href={resolveUrl(document.storageUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-brand hover:underline"
                      >
                        Download
                      </a>
                      {!document.signed && (
                        <Button
                          size="sm"
                          onClick={() => handleSignDocument(document.id)}
                          disabled={signing === document.id}
                        >
                          {signing === document.id ? 'Signing…' : 'Mark signed'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

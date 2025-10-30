"use client";

import { Fragment, useEffect, useState } from 'react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { DocumentTemplate, GeneratedDocument, GenerateDocumentInput } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

interface DocumentsCardProps {
  generated: GeneratedDocument[];
  templates: DocumentTemplate[];
  canGenerate: boolean;
  onGenerate: (input: GenerateDocumentInput) => Promise<void>;
  isGenerating: boolean;
  isDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
}

const formats: Array<GenerateDocumentInput['format']> = ['PDF', 'DOCX'];

export function DocumentsCard({
  generated,
  templates,
  canGenerate,
  onGenerate,
  isGenerating,
  isDialogOpen,
  onDialogChange
}: DocumentsCardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(templates[0] ?? null);
  const [selectedFormat, setSelectedFormat] = useState<GenerateDocumentInput['format']>('PDF');

  useEffect(() => {
    setSelectedTemplate(templates[0] ?? null);
  }, [templates]);

  const open = () => {
    setSelectedTemplate(templates[0] ?? null);
    setSelectedFormat('PDF');
    onDialogChange(true);
  };

  const close = () => onDialogChange(false);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    await onGenerate({ templateId: selectedTemplate.id, format: selectedFormat });
    onDialogChange(false);
  };

  return (
    <ProfileCard
      title="Documents"
      section="documents"
      canEdit={canGenerate}
      description="Generated artifacts and available templates"
      actions={
        canGenerate ? (
          <button
            type="button"
            onClick={open}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand hover:text-brand"
          >
            Generate document
          </button>
        ) : null
      }
    >
      {() => (
        <div className="space-y-4">
          <section aria-labelledby="generated-documents" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="generated-documents" className="text-sm font-semibold text-slate-800">
                Generated documents
              </h3>
              <span className="text-xs text-slate-500">Most recent 50</span>
            </div>
            {generated.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing generated yet.</p>
            ) : (
              <ul className="space-y-3">
                {generated.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{doc.filename}</p>
                      <p className="text-xs text-slate-500">
                        {doc.templateName ?? 'Ad-hoc'} · {doc.format} · {formatDate(doc.createdAt)}
                      </p>
                    </div>
                    <a
                      href={doc.storageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand hover:text-brand"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="available-templates" className="space-y-2">
            <h3 id="available-templates" className="text-sm font-semibold text-slate-800">
              Templates
            </h3>
            {templates.length === 0 ? (
              <p className="text-sm text-slate-500">No document templates configured.</p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {templates.map((template) => (
                  <li key={template.id} className="rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{template.name}</p>
                    <p className="text-xs text-slate-500">
                      {template.format} · Updated {formatDate(template.lastUpdatedAt)}
                    </p>
                    {template.description ? (
                      <p className="mt-1 text-xs text-slate-500">{template.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Transition show={isDialogOpen} as={Fragment}>
            <Dialog onClose={close} className="relative z-50">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
              </Transition.Child>

              <Transition.Child
                as={Fragment}
                enter="ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="fixed inset-0 flex items-center justify-center p-4">
                  <Dialog.Panel className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-lg font-semibold text-slate-900">Generate document</Dialog.Title>
                    {templates.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        No templates available. Add templates in the admin console before generating documents.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Template</p>
                          <Listbox value={selectedTemplate} onChange={setSelectedTemplate}>
                            <div className="relative mt-1">
                              <Listbox.Button className="w-full rounded-md border border-slate-300 px-3 py-2 text-left text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand">
                                {selectedTemplate ? selectedTemplate.name : 'Select template'}
                              </Listbox.Button>
                              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg">
                                  {templates.map((template) => (
                                    <Listbox.Option
                                      key={template.id}
                                      value={template}
                                      className={({ active }) =>
                                        `cursor-pointer px-3 py-2 ${active ? 'bg-brand/10 text-brand' : 'text-slate-700'}`
                                      }
                                    >
                                      <div className="font-medium">{template.name}</div>
                                      <div className="text-xs text-slate-500">{template.format} · Updated {formatDate(template.lastUpdatedAt)}</div>
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-slate-700">Format</p>
                          <div className="flex gap-3">
                            {formats.map((format) => (
                              <label key={format} className="flex items-center gap-2 text-sm text-slate-600">
                                <input
                                  type="radio"
                                  name="doc-format"
                                  value={format}
                                  checked={selectedFormat === format}
                                  onChange={() => setSelectedFormat(format)}
                                  className="h-4 w-4 border-slate-300 text-brand focus:ring-brand"
                                />
                                {format}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={close}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!selectedTemplate || isGenerating}
                        onClick={handleGenerate}
                        className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isGenerating ? 'Generating…' : 'Generate'}
                      </button>
                    </div>
                  </Dialog.Panel>
                </div>
              </Transition.Child>
            </Dialog>
          </Transition>
        </div>
      )}
    </ProfileCard>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
  } catch {
    return value;
  }
}

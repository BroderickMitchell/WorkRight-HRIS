"use client";

import { Fragment, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CostSplit, CostSplitInput } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const costSplitFormSchema = z.object({
  id: z.string().optional(),
  costCodeId: z.string().min(1, 'Cost code is required'),
  percentage: z
    .number({ invalid_type_error: 'Percentage is required' })
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable()
});

export type CostSplitFormValues = z.infer<typeof costSplitFormSchema>;

interface CostSplitsCardProps {
  splits: CostSplit[];
  canManage: boolean;
  onSave: (splits: CostSplitInput[]) => Promise<void>;
  onDelete: (splitId: string) => Promise<void>;
  isMutating: boolean;
}

export function CostSplitsCard({ splits, canManage, onSave, onDelete, isMutating }: CostSplitsCardProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingSplit, setEditingSplit] = useState<CostSplit | null>(null);
  const sortedSplits = useMemo(
    () =>
      [...splits].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [splits]
  );

  const form = useForm<CostSplitFormValues>({
    resolver: zodResolver(costSplitFormSchema),
    defaultValues: mapSplitToForm(editingSplit)
  });

  const openCreate = () => {
    setEditingSplit(null);
    form.reset(mapSplitToForm(null));
    setModalOpen(true);
  };

  const openEdit = (split: CostSplit) => {
    setEditingSplit(split);
    form.reset(mapSplitToForm(split));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const incoming: CostSplitInput = {
      id: values.id,
      costCodeId: values.costCodeId,
      percentage: values.percentage,
      startDate: values.startDate,
      endDate: values.endDate ? values.endDate : null
    };
    const next = mergeSplits(splits, incoming);
    await onSave(next);
    setModalOpen(false);
  });

  const handleDelete = async (split: CostSplit) => {
    if (!canManage) return;
    await onDelete(split.id);
  };

  return (
    <ProfileCard
      title="Cost Coding"
      section="costSplits"
      canEdit={canManage}
      description="Allocate costs across centers with date-effective splits"
      actions={
        canManage ? (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-brand hover:text-brand"
          >
            Add split
          </button>
        ) : null
      }
    >
      {() => (
        <div className="space-y-4">
          {sortedSplits.length === 0 ? (
            <p className="text-sm text-slate-500">No cost splits yet. Add one to track allocations.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left">
                      Cost code
                    </th>
                    <th scope="col" className="px-4 py-3 text-left">
                      Percentage
                    </th>
                    <th scope="col" className="px-4 py-3 text-left">
                      Effective
                    </th>
                    <th scope="col" className="px-4 py-3 text-left">
                      Ends
                    </th>
                    {canManage ? <th scope="col" className="px-4 py-3 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sortedSplits.map((split) => (
                    <tr key={split.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{split.costCode.code}</div>
                        <div className="text-xs text-slate-500">
                          {split.costCode.type} · {split.costCode.description ?? 'No description'}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{split.percentage}%</td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(split.startDate)}</td>
                      <td className="px-4 py-3 text-slate-700">{split.endDate ? formatDate(split.endDate) : 'Open'}</td>
                      {canManage ? (
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(split)}
                              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:border-brand hover:text-brand"
                              aria-label={`Edit cost split for ${split.costCode.code}`}
                            >
                              ✎ Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(split)}
                              className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-2 py-1 text-xs text-rose-600 transition hover:border-rose-400 hover:text-rose-700"
                              aria-label={`Delete cost split for ${split.costCode.code}`}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Transition show={isModalOpen} as={Fragment}>
            <Dialog onClose={closeModal} className="relative z-50">
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
                    <Dialog.Title className="text-lg font-semibold text-slate-900">
                      {editingSplit ? 'Edit cost split' : 'Add cost split'}
                    </Dialog.Title>
                    <form id="cost-split-form" onSubmit={handleSubmit} className="space-y-4">
                      <input type="hidden" {...form.register('id')} />
                      <div className="space-y-2">
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-medium text-slate-700">Cost code ID</span>
                          <input
                            {...form.register('costCodeId')}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                            aria-describedby="cost-code-help"
                          />
                          <span id="cost-code-help" className="text-xs text-slate-500">
                            Enter the cost center / GL / project identifier.
                          </span>
                          {form.formState.errors.costCodeId ? (
                            <span className="text-xs text-rose-600">
                              {form.formState.errors.costCodeId.message}
                            </span>
                          ) : null}
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-medium text-slate-700">Percentage</span>
                          <input
                            type="number"
                            step="0.1"
                            {...form.register('percentage', {
                              valueAsNumber: true
                            })}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          {form.formState.errors.percentage ? (
                            <span className="text-xs text-rose-600">
                              {form.formState.errors.percentage.message}
                            </span>
                          ) : null}
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-medium text-slate-700">Start date</span>
                          <input
                            type="date"
                            {...form.register('startDate')}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          {form.formState.errors.startDate ? (
                            <span className="text-xs text-rose-600">
                              {form.formState.errors.startDate.message}
                            </span>
                          ) : null}
                        </label>
                        <label className="flex flex-col gap-1 text-sm">
                          <span className="font-medium text-slate-700">End date</span>
                          <input
                            type="date"
                            {...form.register('endDate')}
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                          />
                          <span className="text-xs text-slate-500">Leave blank for open-ended allocations.</span>
                          {form.formState.errors.endDate ? (
                            <span className="text-xs text-rose-600">
                              {form.formState.errors.endDate.message}
                            </span>
                          ) : null}
                        </label>
                      </div>
                    </form>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        form="cost-split-form"
                        type="submit"
                        disabled={isMutating}
                        className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isMutating ? 'Saving…' : editingSplit ? 'Save changes' : 'Add split'}
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

function mapSplitToForm(split: CostSplit | null): CostSplitFormValues {
  if (!split) {
    return {
      costCodeId: '',
      percentage: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      id: undefined
    };
  }
  return {
    id: split.id,
    costCodeId: split.costCodeId,
    percentage: split.percentage,
    startDate: split.startDate.slice(0, 10),
    endDate: split.endDate ? split.endDate.slice(0, 10) : ''
  };
}

function mergeSplits(existing: CostSplit[], incoming: CostSplitInput): CostSplitInput[] {
  const others = existing.filter((split) => split.id !== incoming.id);
  return [
    ...others.map((split) => ({
      id: split.id,
      costCodeId: split.costCodeId,
      percentage: split.percentage,
      startDate: split.startDate,
      endDate: split.endDate
    })),
    incoming
  ];
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

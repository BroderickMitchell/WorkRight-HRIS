'use client';

import { useEffect } from 'react';
import { Controller, useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeProfilePayload } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const jobFormSchema = z.object({
  positionId: z.string().optional().nullable(),
  jobTitle: z.string().min(1, 'Job title is required'),
  grade: z.string().optional().nullable(),
  fte: z
    .number({ invalid_type_error: 'FTE must be a number' })
    .min(0, 'FTE must be at least 0')
    .max(1, 'FTE cannot exceed 1'),
  workerType: z.string().min(1, 'Worker type is required'),
  employmentType: z.string().min(1, 'Employment type is required'),
  standardHours: z
    .number({ invalid_type_error: 'Standard hours must be a number' })
    .min(0, 'Standard hours must be positive')
    .max(168, 'Standard hours must be realistic')
    .nullable(),
  schedule: z.string().optional().nullable(),
  exempt: z.boolean(),
  status: z.string(),
  serviceDate: z.string().optional().nullable(),
  probationEndDate: z.string().optional().nullable(),
  contractEndDate: z.string().optional().nullable()
});

export type JobFormValues = z.infer<typeof jobFormSchema>;

interface JobInfoCardProps {
  data: EmployeeProfilePayload['job'];
  canEdit: boolean;
  onSave: (payload: EmployeeProfilePayload['job']) => Promise<void>;
  isSaving: boolean;
}

export function JobInfoCard({ data, canEdit, onSave, isSaving }: JobInfoCardProps) {
  const form = useForm<JobFormValues>({
    resolver: zodResolver(jobFormSchema),
    defaultValues: mapJobToForm(data)
  });

  useEffect(() => {
    form.reset(mapJobToForm(data));
  }, [data, form]);

  return (
    <ProfileCard
      title="Job & Organization"
      section="job"
      canEdit={canEdit}
      description="Role, position and employment details"
    >
      {({ isEditing, markDirty, stopEditing }) => {
        const handleCancel = () => {
          form.reset(mapJobToForm(data));
          markDirty(false);
          stopEditing();
        };

        const handleSubmit = form.handleSubmit(async (values) => {
          await onSave(mapFormToJob(values, data));
          markDirty(false);
          stopEditing();
        });

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormDirtyTracker form={form} onDirtyChange={markDirty} />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Position ID" name="positionId" form={form} disabled={!isEditing} />
              <InputField label="Job title" name="jobTitle" form={form} disabled={!isEditing} />
              <InputField label="Grade" name="grade" form={form} disabled={!isEditing} />
              <Controller
                control={form.control}
                name="fte"
                render={({ field, fieldState }) => (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700">FTE</span>
                    <input
                      type="number"
                      step="0.01"
                      {...field}
                      value={Number.isFinite(field.value) ? field.value : ''}
                      onChange={(event) => field.onChange(event.target.value === '' ? '' : Number(event.target.value))}
                      disabled={!isEditing}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                    {fieldState.error ? (
                      <span className="text-xs text-rose-600">{fieldState.error.message}</span>
                    ) : null}
                  </label>
                )}
              />
              <InputField label="Worker type" name="workerType" form={form} disabled={!isEditing} />
              <InputField label="Employment type" name="employmentType" form={form} disabled={!isEditing} />
              <Controller
                control={form.control}
                name="standardHours"
                render={({ field, fieldState }) => (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-slate-700">Standard hours</span>
                    <input
                      type="number"
                      step="0.1"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(event) =>
                        field.onChange(event.target.value === '' ? null : Number(event.target.value))
                      }
                      disabled={!isEditing}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                    {fieldState.error ? (
                      <span className="text-xs text-rose-600">{fieldState.error.message}</span>
                    ) : null}
                  </label>
                )}
              />
              <InputField label="Schedule" name="schedule" form={form} disabled={!isEditing} />
              <InputField label="Service date" name="serviceDate" type="date" form={form} disabled={!isEditing} />
              <InputField label="Probation end" name="probationEndDate" type="date" form={form} disabled={!isEditing} />
              <InputField label="Contract end" name="contractEndDate" type="date" form={form} disabled={!isEditing} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ReadOnlyField label="Manager" value={data.manager?.name ?? 'Unassigned'} />
              <ReadOnlyField label="Org unit" value={data.orgUnit?.name ?? 'Unassigned'} />
              <ReadOnlyField label="Department" value={data.department?.name ?? 'Unassigned'} />
              <ReadOnlyField label="Location" value={data.location?.name ?? 'Unassigned'} />
            </div>

            <Controller
              control={form.control}
              name="exempt"
              render={({ field }) => (
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                    disabled={!isEditing}
                  />
                  Exempt employee
                </label>
              )}
            />

            {!isEditing ? (
              <p className="text-xs text-slate-500">
                Effective dated employment history is tracked automatically in the timeline below. Use the edit pencil to update.
              </p>
            ) : (
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            )}
          </form>
        );
      }}
    </ProfileCard>
  );
}

function mapJobToForm(job: EmployeeProfilePayload['job']): JobFormValues {
  return {
    positionId: job.positionId ?? '',
    jobTitle: job.jobTitle,
    grade: job.grade ?? '',
    fte: Number(job.fte ?? 1),
    workerType: job.workerType,
    employmentType: job.employmentType,
    standardHours: job.standardHours ?? null,
    schedule: job.schedule ?? '',
    exempt: job.exempt,
    status: job.status,
    serviceDate: job.serviceDate ? job.serviceDate.slice(0, 10) : '',
    probationEndDate: job.probationEndDate ? job.probationEndDate.slice(0, 10) : '',
    contractEndDate: job.contractEndDate ? job.contractEndDate.slice(0, 10) : ''
  };
}

function mapFormToJob(values: JobFormValues, previous: EmployeeProfilePayload['job']): EmployeeProfilePayload['job'] {
  return {
    ...previous,
    positionId: values.positionId || null,
    jobTitle: values.jobTitle,
    grade: values.grade || null,
    fte: Number.isFinite(values.fte) ? values.fte : previous.fte,
    workerType: values.workerType,
    employmentType: values.employmentType,
    standardHours: values.standardHours ?? null,
    schedule: values.schedule || null,
    exempt: values.exempt,
    status: values.status as EmployeeProfilePayload['job']['status'],
    serviceDate: values.serviceDate || null,
    probationEndDate: values.probationEndDate || null,
    contractEndDate: values.contractEndDate || null
  };
}

function FormDirtyTracker({
  form,
  onDirtyChange
}: {
  form: UseFormReturn<JobFormValues>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  useEffect(() => {
    const subscription = form.watch(() => onDirtyChange(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);

  return null;
}

interface InputFieldProps {
  label: string;
  name: keyof JobFormValues;
  form: UseFormReturn<JobFormValues>;
  type?: string;
  disabled: boolean;
}

function InputField({ label, name, form, type = 'text', disabled }: InputFieldProps) {
  const {
    register,
    formState: { errors }
  } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        type={type}
        {...register(name as any)}
        disabled={disabled}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <span className="rounded-md border border-dashed border-slate-200 px-3 py-2 text-slate-600">{value}</span>
    </div>
  );
}

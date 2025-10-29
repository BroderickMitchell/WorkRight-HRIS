'use client';

import { useEffect } from 'react';
import { Controller, type Control, useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeProfilePayload } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const timeFormSchema = z.object({
  timezone: z.string().min(1, 'Timezone is required'),
  workSchedule: z.string().min(1, 'Work schedule is required'),
  badgeId: z.string().optional().nullable(),
  overtimeEligible: z.boolean(),
  exempt: z.boolean(),
  benefitsEligible: z.boolean()
});

export type TimeEligibilityFormValues = z.infer<typeof timeFormSchema>;

interface TimeEligibilityCardProps {
  data: EmployeeProfilePayload['timeAndEligibility'];
  canEdit: boolean;
  onSave: (payload: EmployeeProfilePayload['timeAndEligibility']) => Promise<void>;
  isSaving: boolean;
}

export function TimeEligibilityCard({ data, canEdit, onSave, isSaving }: TimeEligibilityCardProps) {
  const form = useForm<TimeEligibilityFormValues>({
    resolver: zodResolver(timeFormSchema),
    defaultValues: mapTimeToForm(data)
  });

  useEffect(() => {
    form.reset(mapTimeToForm(data));
  }, [data, form]);

  return (
    <ProfileCard
      title="Time & Eligibility"
      section="timeAndEligibility"
      canEdit={canEdit}
      description="Location, schedule and eligibility controls"
    >
      {({ isEditing, markDirty, stopEditing }) => {
        const handleCancel = () => {
          form.reset(mapTimeToForm(data));
          markDirty(false);
          stopEditing();
        };

        const handleSubmit = form.handleSubmit(async (values) => {
          await onSave(mapFormToTime(values, data));
          markDirty(false);
          stopEditing();
        });

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormDirtyTracker form={form} onDirtyChange={markDirty} />
            <div className="grid gap-4 md:grid-cols-2">
              <ReadOnlyField label="Work location" value={data.location} />
              <InputField label="Timezone" name="timezone" form={form} disabled={!isEditing} />
              <InputField label="Work schedule" name="workSchedule" form={form} disabled={!isEditing} />
              <InputField label="Badge/Clock ID" name="badgeId" form={form} disabled={!isEditing} />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <ToggleField label="Overtime eligible" control={form.control} name="overtimeEligible" disabled={!isEditing} />
              <ToggleField label="Exempt" control={form.control} name="exempt" disabled={!isEditing} />
              <ToggleField
                label="Benefits eligible"
                control={form.control}
                name="benefitsEligible"
                disabled={!isEditing}
              />
            </div>

            <div className="rounded-lg border border-dashed border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-700">Leave balances</p>
              {data.leaveBalances.length === 0 ? (
                <p className="text-sm text-slate-500">No leave balances available.</p>
              ) : (
                <dl className="mt-2 grid gap-3 md:grid-cols-2">
                  {data.leaveBalances.map((balance) => (
                    <div key={balance.id} className="rounded-md bg-slate-50 px-3 py-2">
                      <dt className="text-xs uppercase text-slate-500">{balance.type}</dt>
                      <dd className="text-sm font-semibold text-slate-800">{balance.balanceHours.toFixed(2)} hrs</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>

            {isEditing ? (
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
            ) : null}
          </form>
        );
      }}
    </ProfileCard>
  );
}

function mapTimeToForm(time: EmployeeProfilePayload['timeAndEligibility']): TimeEligibilityFormValues {
  return {
    timezone: time.timezone,
    workSchedule: time.workSchedule,
    badgeId: time.badgeId ?? '',
    overtimeEligible: time.overtimeEligible,
    exempt: time.exempt,
    benefitsEligible: time.benefitsEligible
  };
}

function mapFormToTime(
  values: TimeEligibilityFormValues,
  previous: EmployeeProfilePayload['timeAndEligibility']
): EmployeeProfilePayload['timeAndEligibility'] {
  return {
    ...previous,
    timezone: values.timezone,
    workSchedule: values.workSchedule,
    badgeId: values.badgeId || null,
    overtimeEligible: values.overtimeEligible,
    exempt: values.exempt,
    benefitsEligible: values.benefitsEligible
  };
}

function FormDirtyTracker({
  form,
  onDirtyChange
}: {
  form: UseFormReturn<TimeEligibilityFormValues>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  useEffect(() => {
    const subscription = form.watch(() => onDirtyChange(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);

  return null;
}

function InputField({
  label,
  name,
  form,
  disabled
}: {
  label: string;
  name: keyof TimeEligibilityFormValues;
  form: UseFormReturn<TimeEligibilityFormValues>;
  disabled: boolean;
}) {
  const {
    register,
    formState: { errors }
  } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        {...register(name)}
        disabled={disabled}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

type BooleanFieldName = {
  [K in keyof TimeEligibilityFormValues]: TimeEligibilityFormValues[K] extends boolean ? K : never;
}[keyof TimeEligibilityFormValues];

function ToggleField({
  label,
  control,
  name,
  disabled
}: {
  label: string;
  control: Control<TimeEligibilityFormValues>;
  name: BooleanFieldName;
  disabled: boolean;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            checked={Boolean(field.value)}
            onChange={(event) => field.onChange(event.target.checked)}
            disabled={disabled}
          />
          {label}
        </label>
      )}
    />
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

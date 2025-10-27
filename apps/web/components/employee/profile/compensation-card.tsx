'use client';

import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, type UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeProfilePayload } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const allowanceFrequencies = ['ANNUAL', 'MONTHLY', 'FORTNIGHTLY', 'WEEKLY', 'HOURLY'] as const;
type AllowanceFrequency = (typeof allowanceFrequencies)[number];

const allowanceSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'Allowance name is required'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .min(0, 'Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  frequency: z.enum(allowanceFrequencies),
  taxable: z.boolean().default(true)
});

function resolveAllowanceFrequency(frequency: string): AllowanceFrequency {
  return allowanceFrequencies.includes(frequency as AllowanceFrequency)
    ? (frequency as AllowanceFrequency)
    : 'ANNUAL';
}

const compensationFormSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Base salary is required' })
    .min(0, 'Base salary must be positive'),
  currency: z.string().min(1, 'Currency is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  payGrade: z.string().optional().nullable(),
  bonusTargetPercent: z
    .number({ invalid_type_error: 'Bonus target must be a number' })
    .min(0, 'Bonus target must be positive')
    .max(100, 'Bonus target cannot exceed 100')
    .nullable(),
  stockPlan: z.string().optional().nullable(),
  allowances: z.array(allowanceSchema)
});

export type CompensationFormValues = z.infer<typeof compensationFormSchema>;

interface CompensationCardProps {
  data: EmployeeProfilePayload['compensation'];
  canEdit: boolean;
  onSave: (payload: EmployeeProfilePayload['compensation']) => Promise<void>;
  isSaving: boolean;
}

export function CompensationCard({ data, canEdit, onSave, isSaving }: CompensationCardProps) {
  const form = useForm<CompensationFormValues>({
    resolver: zodResolver(compensationFormSchema),
    defaultValues: mapCompToForm(data)
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'allowances' });

  useEffect(() => {
    form.reset(mapCompToForm(data));
  }, [data, form]);

  return (
    <ProfileCard
      title="Compensation"
      section="compensation"
      canEdit={canEdit}
      description="Pay, bonus and allowances"
    >
      {({ isEditing, markDirty, stopEditing }) => {
        const handleCancel = () => {
          form.reset(mapCompToForm(data));
          markDirty(false);
          stopEditing();
        };

        const handleSubmit = form.handleSubmit(async (values) => {
          await onSave(mapFormToComp(values, data));
          markDirty(false);
          stopEditing();
        });

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormDirtyTracker form={form} onDirtyChange={markDirty} />
            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                control={form.control}
                name="amount"
                render={({ field, fieldState }) => (
                  <InputField
                    label="Base salary"
                    type="number"
                    field={field}
                    error={fieldState.error?.message}
                    disabled={!isEditing}
                    icon={data.baseSalary.currency}
                  />
                )}
              />
              <TextInput label="Currency" name="currency" form={form} disabled={!isEditing} />
              <TextInput label="Frequency" name="frequency" form={form} disabled={!isEditing} placeholder="ANNUAL" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <TextInput label="Pay grade" name="payGrade" form={form} disabled={!isEditing} />
              <Controller
                control={form.control}
                name="bonusTargetPercent"
                render={({ field, fieldState }) => (
                  <InputField
                    label="Bonus target %"
                    type="number"
                    field={{ ...field, value: field.value ?? '' }}
                    error={fieldState.error?.message}
                    disabled={!isEditing}
                  />
                )}
              />
              <TextInput label="Stock plan" name="stockPlan" form={form} disabled={!isEditing} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Allowances & stipends</p>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        id: undefined,
                        label: '',
                        amount: 0,
                        currency: data.baseSalary.currency,
                        frequency: resolveAllowanceFrequency(data.baseSalary.frequency),
                        taxable: true
                      })
                    }
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Add allowance
                  </button>
                ) : null}
              </div>
              {fields.length === 0 ? (
                <p className="text-sm text-slate-500">No allowances configured.</p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id ?? index} className="rounded-lg border border-slate-200 p-4">
                      <div className="grid gap-3 md:grid-cols-5">
                        <TextInput
                          label="Label"
                          name={`allowances.${index}.label`}
                          form={form}
                          disabled={!isEditing}
                        />
                        <Controller
                          control={form.control}
                          name={`allowances.${index}.amount`}
                          render={({ field: allowanceField, fieldState }) => (
                            <InputField
                              label="Amount"
                              type="number"
                              field={allowanceField}
                              error={fieldState.error?.message}
                              disabled={!isEditing}
                            />
                          )}
                        />
                        <TextInput
                          label="Currency"
                          name={`allowances.${index}.currency`}
                          form={form}
                          disabled={!isEditing}
                        />
                        <TextInput
                          label="Frequency"
                          name={`allowances.${index}.frequency`}
                          form={form}
                          disabled={!isEditing}
                        />
                        <Controller
                          control={form.control}
                          name={`allowances.${index}.taxable`}
                          render={({ field: taxableField }) => (
                            <label className="flex items-center gap-2 text-sm text-slate-600">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                                checked={taxableField.value}
                                onChange={(event) => taxableField.onChange(event.target.checked)}
                                disabled={!isEditing}
                              />
                              Taxable
                            </label>
                          )}
                        />
                      </div>
                      {isEditing ? (
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-xs font-medium text-rose-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
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
            ) : (
              <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                <InfoRow label="Effective date" value={formatDate(data.effectiveDate)} />
                <InfoRow label="Base salary" value={formatCurrency(data.baseSalary.amount, data.baseSalary.currency, data.baseSalary.frequency)} />
                <InfoRow
                  label="Bonus target"
                  value={data.bonusTargetPercent ? `${data.bonusTargetPercent}% of base` : 'Not configured'}
                />
                <InfoRow label="Stock plan" value={data.stockPlan ?? 'Not part of plan'} />
              </div>
            )}
          </form>
        );
      }}
    </ProfileCard>
  );
}

function mapCompToForm(comp: EmployeeProfilePayload['compensation']): CompensationFormValues {
  return {
    amount: Number(comp.baseSalary.amount),
    currency: comp.baseSalary.currency,
    frequency: comp.baseSalary.frequency,
    payGrade: comp.payGrade ?? '',
    bonusTargetPercent: comp.bonusTargetPercent ?? null,
    stockPlan: comp.stockPlan ?? '',
    allowances: comp.allowances.map((allowance) => ({
      id: allowance.id,
      label: allowance.label,
      amount: allowance.amount,
      currency: allowance.currency,
      frequency: allowance.frequency,
      taxable: allowance.taxable
    }))
  };
}

function mapFormToComp(
  values: CompensationFormValues,
  previous: EmployeeProfilePayload['compensation']
): EmployeeProfilePayload['compensation'] {
  return {
    ...previous,
    baseSalary: {
      amount: values.amount,
      currency: values.currency,
      frequency: values.frequency
    },
    payGrade: values.payGrade || null,
    bonusTargetPercent: values.bonusTargetPercent ?? null,
    stockPlan: values.stockPlan || null,
    allowances: values.allowances.map((allowance, index) => ({
      id: allowance.id ?? previous.allowances[index]?.id ?? `temp-${index}`,
      label: allowance.label,
      amount: allowance.amount,
      currency: allowance.currency,
      frequency: allowance.frequency,
      taxable: allowance.taxable
    }))
  };
}

function FormDirtyTracker({
  form,
  onDirtyChange
}: {
  form: UseFormReturn<CompensationFormValues>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  useEffect(() => {
    const subscription = form.watch(() => onDirtyChange(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);

  return null;
}

function TextInput({
  label,
  name,
  form,
  disabled,
  placeholder
}: {
  label: string;
  name: keyof CompensationFormValues | `allowances.${number}.${'label' | 'currency' | 'frequency' | 'amount' | 'taxable'}`;
  form: UseFormReturn<CompensationFormValues>;
  disabled: boolean;
  placeholder?: string;
}) {
  const { register } = form;
  const fieldState = form.getFieldState(name as any);
  const message = fieldState.error?.message as string | undefined;

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        {...register(name as any)}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {message ? <span className="text-xs text-rose-600">{message}</span> : null}
    </label>
  );
}

function InputField({
  label,
  type,
  field,
  error,
  disabled,
  icon
}: {
  label: string;
  type: string;
  field: { value: number | string; onChange: (value: number | string) => void };
  error?: string;
  disabled: boolean;
  icon?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        {icon ? <span className="text-xs text-slate-500">{icon}</span> : null}
        <input
          type={type}
          value={field.value ?? ''}
          onChange={(event) =>
            field.onChange(event.target.value === '' ? '' : Number(event.target.value))
          }
          disabled={disabled}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </div>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatCurrency(amount: number, currency: string, frequency: string) {
  try {
    return `${new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency
    }).format(amount)} ${frequency.toLowerCase()}`;
  } catch {
    return `${amount} ${currency}/${frequency}`;
  }
}

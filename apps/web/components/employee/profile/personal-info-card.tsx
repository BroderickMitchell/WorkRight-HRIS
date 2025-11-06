'use client';

import { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeProfilePayload } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const optionalDateSchema = z
  .string()
  .transform((value) => value.trim())
  .refine(
    (value) => value.length === 0 || !Number.isNaN(Date.parse(value)),
    'Enter a valid date'
  );

const personalFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional().nullable(),
  lastName: z.string().min(1, 'Last name is required'),
  suffix: z.string().optional().nullable(),
  preferredName: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  dateOfBirth: optionalDateSchema,
  citizenships: z.string().optional().nullable(),
  languages: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  veteranStatus: z.string().optional().nullable()
});

export type PersonalFormValues = z.infer<typeof personalFormSchema>;

interface PersonalInfoCardProps {
  data: EmployeeProfilePayload['personal'];
  canEdit: boolean;
  onSave: (payload: EmployeeProfilePayload['personal']) => Promise<void>;
  isSaving: boolean;
}

export function PersonalInfoCard({ data, canEdit, onSave, isSaving }: PersonalInfoCardProps) {
  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues: mapPersonalToForm(data)
  });

  useEffect(() => {
    form.reset(mapPersonalToForm(data));
  }, [data, form]);

  return (
    <ProfileCard title="Personal Information" section="personal" canEdit={canEdit} description="Legal name, identity and demographic details">
      {({ isEditing, markDirty, stopEditing }) => {
        const handleCancel = () => {
          form.reset(mapPersonalToForm(data));
          markDirty(false);
          stopEditing();
        };

        const handleSubmit = form.handleSubmit(async (values) => {
          await onSave(mapFormToPersonal(values, data));
          markDirty(false);
          stopEditing();
        });

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormDirtyTracker form={form} onDirtyChange={markDirty} />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="First name" name="firstName" form={form} disabled={!isEditing} />
              <InputField label="Middle name" name="middleName" form={form} disabled={!isEditing} />
              <InputField label="Last name" name="lastName" form={form} disabled={!isEditing} />
              <InputField label="Suffix" name="suffix" form={form} disabled={!isEditing} />
              <InputField label="Preferred name" name="preferredName" form={form} disabled={!isEditing} />
              <InputField label="Pronouns" name="pronouns" form={form} disabled={!isEditing} placeholder="e.g. she/her" />
              <InputField label="Date of birth" name="dateOfBirth" type="date" form={form} disabled={!isEditing} />
              <InputField label="Marital status" name="maritalStatus" form={form} disabled={!isEditing} />
              <InputField
                label="Citizenships"
                name="citizenships"
                form={form}
                disabled={!isEditing}
                placeholder="Comma separated"
              />
              <InputField label="Languages" name="languages" form={form} disabled={!isEditing} placeholder="Comma separated" />
              <InputField label="Veteran status" name="veteranStatus" form={form} disabled={!isEditing} />
            </div>

            {!isEditing ? (
              <div className="text-sm text-slate-500">
                <p className="font-medium text-slate-700">National identifiers</p>
                {data.nationalIdentifiers.length ? (
                  <ul className="mt-1 space-y-1">
                    {data.nationalIdentifiers.map((identifier) => (
                      <li key={identifier.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-slate-600">{identifier.type}</span>
                        <span className="font-mono text-slate-700">{identifier.value}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-slate-400">No identifiers recorded.</p>
                )}
              </div>
            ) : null}

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

function mapPersonalToForm(personal: EmployeeProfilePayload['personal']): PersonalFormValues {
  return {
    firstName: personal.legalName.first,
    middleName: personal.legalName.middle ?? '',
    lastName: personal.legalName.last,
    suffix: personal.legalName.suffix ?? '',
    preferredName: personal.preferredName ?? '',
    pronouns: personal.pronouns ?? '',
    dateOfBirth: personal.dateOfBirth ? personal.dateOfBirth.slice(0, 10) : '',
    citizenships: personal.citizenships.join(', '),
    languages: personal.languages.join(', '),
    maritalStatus: personal.maritalStatus ?? '',
    veteranStatus: personal.veteranStatus ?? ''
  };
}

function mapFormToPersonal(values: PersonalFormValues, previous: EmployeeProfilePayload['personal']): EmployeeProfilePayload['personal'] {
  return {
    ...previous,
    legalName: {
      first: values.firstName,
      middle: values.middleName ? values.middleName : null,
      last: values.lastName,
      suffix: values.suffix ? values.suffix : null
    },
    preferredName: values.preferredName ? values.preferredName : null,
    pronouns: values.pronouns ? values.pronouns : null,
    dateOfBirth: values.dateOfBirth ? values.dateOfBirth : null,
    citizenships: normaliseList(values.citizenships),
    languages: normaliseList(values.languages),
    maritalStatus: values.maritalStatus ? values.maritalStatus : null,
    veteranStatus: values.veteranStatus ? values.veteranStatus : null
  };
}

function FormDirtyTracker({
  form,
  onDirtyChange
}: {
  form: UseFormReturn<PersonalFormValues>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  useEffect(() => {
    const subscription = form.watch(() => {
      onDirtyChange(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);

  return null;
}

function normaliseList(value?: string | null) {
  if (!value) return [];
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

interface InputFieldProps {
  label: string;
  name: keyof PersonalFormValues;
  form: UseFormReturn<PersonalFormValues>;
  type?: string;
  disabled: boolean;
  placeholder?: string;
}

function InputField({ label, name, form, type = 'text', disabled, placeholder }: InputFieldProps) {
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
        {...register(name)}
        disabled={disabled}
        placeholder={placeholder}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand disabled:cursor-not-allowed disabled:bg-slate-100"
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

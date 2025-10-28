'use client';

import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeProfilePayload } from '@workright/profile-schema';
import { ProfileCard } from './profile-card';

const addressSchema = z.object({
  line1: z.string().optional().nullable(),
  line2: z.string().optional().nullable(),
  suburb: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  country: z.string().optional().nullable()
});

const emergencyContactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Enter a valid email').optional().nullable()
});

const contactFormSchema = z.object({
  personalEmail: z.string().email('Enter a valid email').optional().nullable(),
  workPhone: z.string().optional().nullable(),
  mobilePhone: z.string().optional().nullable(),
  primaryAddress: addressSchema,
  mailingAddress: addressSchema,
  communicationPreferences: z.array(z.string()),
  emergencyContacts: z.array(emergencyContactSchema)
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactInfoCardProps {
  data: EmployeeProfilePayload['contact'];
  canEdit: boolean;
  onSave: (payload: EmployeeProfilePayload['contact']) => Promise<void>;
  isSaving: boolean;
}

const communicationOptions = [
  { id: 'EMAIL', label: 'Email' },
  { id: 'SMS', label: 'SMS' },
  { id: 'PUSH', label: 'Push notifications' }
];

export function ContactInfoCard({ data, canEdit, onSave, isSaving }: ContactInfoCardProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: mapContactToForm(data)
  });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'emergencyContacts' });

  useEffect(() => {
    form.reset(mapContactToForm(data));
  }, [data, form]);

  return (
    <ProfileCard title="Contact & Address" section="contact" canEdit={canEdit} description="Contact details, addresses and emergency contacts">
      {({ isEditing, markDirty, stopEditing }) => {
        const handleCancel = () => {
          form.reset(mapContactToForm(data));
          markDirty(false);
          stopEditing();
        };

        const handleSubmit = form.handleSubmit(async (values) => {
          await onSave(mapFormToContact(values, data));
          markDirty(false);
          stopEditing();
        });

        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormDirtyTracker form={form} onDirtyChange={markDirty} />
            <div className="grid gap-4 md:grid-cols-2">
              <InputField label="Work email" value={data.workEmail} disabled helper="Managed in identity" />
              <ControlledInput label="Personal email" name="personalEmail" form={form} disabled={!isEditing} type="email" />
              <ControlledInput label="Work phone" name="workPhone" form={form} disabled={!isEditing} />
              <ControlledInput label="Mobile phone" name="mobilePhone" form={form} disabled={!isEditing} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <AddressFields title="Primary address" name="primaryAddress" form={form} disabled={!isEditing} />
              <AddressFields title="Mailing address" name="mailingAddress" form={form} disabled={!isEditing} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Communication preferences</p>
              <div className="flex flex-wrap gap-4">
                {communicationOptions.map((option) => (
                  <Controller
                    key={option.id}
                    control={form.control}
                    name="communicationPreferences"
                    render={({ field }) => {
                      const checked = field.value.includes(option.id);
                      return (
                        <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                            checked={checked}
                            disabled={!isEditing}
                            onChange={(event) => {
                              if (event.target.checked) {
                                field.onChange([...field.value, option.id]);
                              } else {
                                field.onChange(field.value.filter((value) => value !== option.id));
                              }
                            }}
                          />
                          {option.label}
                        </label>
                      );
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Emergency contacts</p>
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => append({ name: '', relationship: '', phone: '', email: '' })}
                    className="text-sm font-medium text-brand hover:underline"
                  >
                    Add contact
                  </button>
                ) : null}
              </div>
              {fields.length === 0 ? (
                <p className="text-sm text-slate-500">No emergency contacts recorded.</p>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-lg border border-slate-200 bg-white p-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <ControlledInput label="Name" name={`emergencyContacts.${index}.name`} form={form} disabled={!isEditing} />
                        <ControlledInput
                          label="Relationship"
                          name={`emergencyContacts.${index}.relationship`}
                          form={form}
                          disabled={!isEditing}
                        />
                        <ControlledInput label="Phone" name={`emergencyContacts.${index}.phone`} form={form} disabled={!isEditing} />
                        <ControlledInput
                          label="Email"
                          name={`emergencyContacts.${index}.email`}
                          form={form}
                          disabled={!isEditing}
                          type="email"
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
            ) : null}
          </form>
        );
      }}
    </ProfileCard>
  );
}

function mapContactToForm(contact: EmployeeProfilePayload['contact']): ContactFormValues {
  return {
    personalEmail: contact.personalEmail ?? '',
    workPhone: contact.workPhone ?? '',
    mobilePhone: contact.mobilePhone ?? '',
    primaryAddress: contact.primaryAddress ?? {},
    mailingAddress: contact.mailingAddress ?? {},
    communicationPreferences: contact.communicationPreferences,
    emergencyContacts: contact.emergencyContacts.length
      ? contact.emergencyContacts
      : [{ name: '', relationship: '', phone: '', email: '' }]
  };
}

function mapFormToContact(values: ContactFormValues, previous: EmployeeProfilePayload['contact']): EmployeeProfilePayload['contact'] {
  return {
    ...previous,
    personalEmail: values.personalEmail ? values.personalEmail : null,
    workPhone: values.workPhone ? values.workPhone : null,
    mobilePhone: values.mobilePhone ? values.mobilePhone : null,
    primaryAddress: normaliseAddress(values.primaryAddress),
    mailingAddress: normaliseAddress(values.mailingAddress),
    communicationPreferences: values.communicationPreferences,
    emergencyContacts: values.emergencyContacts
      .filter((contact) => contact.name.trim().length > 0)
      .map((contact) => ({
        id: contact.id ?? safeRandomId(),
        name: contact.name,
        relationship: contact.relationship,
        phone: contact.phone,
        email: contact.email ?? null
      }))
  };
}

function FormDirtyTracker({
  form,
  onDirtyChange
}: {
  form: UseFormReturn<ContactFormValues>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  useEffect(() => {
    const subscription = form.watch(() => onDirtyChange(form.formState.isDirty));
    return () => subscription.unsubscribe();
  }, [form, onDirtyChange]);

  return null;
}

function safeRandomId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tmp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normaliseAddress(address: ContactFormValues['primaryAddress']) {
  const { line1, suburb, state, postcode, country, line2 } = address;
  if (!line1 && !suburb && !state && !postcode && !country && !line2) {
    return null;
  }
  return {
    line1: line1 ?? '',
    line2: line2 ?? null,
    suburb: suburb ?? '',
    state: state ?? '',
    postcode: postcode ?? '',
    country: country ?? 'Australia'
  };
}

interface ControlledInputProps {
  label: string;
  name: Path<ContactFormValues>;
  form: UseFormReturn<ContactFormValues>;
  type?: string;
  disabled: boolean;
  placeholder?: string;
  helper?: string;
}

function ControlledInput({ label, name, form, type = 'text', disabled, placeholder, helper }: ControlledInputProps) {
  const {
    register,
    formState: { errors }
  } = form;
  const error = getNestedError(errors, name);
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
      {helper ? <span className="text-xs text-slate-400">{helper}</span> : null}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  disabled?: boolean;
  helper?: string;
}

function InputField({ label, value, disabled = false, helper }: InputFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <input
        value={value}
        disabled
        className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
        aria-disabled={disabled}
      />
      {helper ? <span className="text-xs text-slate-400">{helper}</span> : null}
    </label>
  );
}

interface AddressFieldsProps {
  title: string;
  name: 'primaryAddress' | 'mailingAddress';
  form: UseFormReturn<ContactFormValues>;
  disabled: boolean;
}

function AddressFields({ title, name, form, disabled }: AddressFieldsProps) {
  return (
    <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <ControlledInput label="Line 1" name={`${name}.line1`} form={form} disabled={disabled} />
      <ControlledInput label="Line 2" name={`${name}.line2`} form={form} disabled={disabled} />
      <ControlledInput label="Suburb / City" name={`${name}.suburb`} form={form} disabled={disabled} />
      <div className="grid gap-2 md:grid-cols-2">
        <ControlledInput label="State" name={`${name}.state`} form={form} disabled={disabled} />
        <ControlledInput label="Postcode" name={`${name}.postcode`} form={form} disabled={disabled} />
      </div>
      <ControlledInput label="Country" name={`${name}.country`} form={form} disabled={disabled} />
    </div>
  );
}

function getNestedError(errors: any, path: string) {
  if (!path) return undefined;
  return path.split('.').reduce((acc, key) => acc?.[key], errors)?.message as string | undefined;
}

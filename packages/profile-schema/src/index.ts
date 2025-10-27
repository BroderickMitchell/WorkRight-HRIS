import { z } from 'zod';

export const costCodeTypeSchema = z.enum(['COST_CENTER', 'GL', 'PROJECT', 'WORKTAG']);
export type CostCodeType = z.infer<typeof costCodeTypeSchema>;

export const employmentEventTypeSchema = z.enum([
  'HIRE',
  'TRANSFER',
  'COMP_CHANGE',
  'COST_CODE_CHANGE',
  'MANAGER_CHANGE',
  'LOA',
  'TERMINATION',
  'OTHER'
]);
export type EmploymentEventType = z.infer<typeof employmentEventTypeSchema>;

export const documentFormatSchema = z.enum(['PDF', 'DOCX']);
export type DocumentFormat = z.infer<typeof documentFormatSchema>;

export const employeeStatusSchema = z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED']);
export type EmployeeStatus = z.infer<typeof employeeStatusSchema>;

export const employeeContactSchema = z.object({
  workEmail: z.string().email(),
  personalEmail: z.string().email().optional().nullable(),
  workPhone: z.string().optional().nullable(),
  mobilePhone: z.string().optional().nullable(),
  primaryAddress: z
    .object({
      line1: z.string(),
      line2: z.string().optional().nullable(),
      suburb: z.string(),
      state: z.string(),
      postcode: z.string(),
      country: z.string()
    })
    .optional()
    .nullable(),
  mailingAddress: z
    .object({
      line1: z.string(),
      line2: z.string().optional().nullable(),
      suburb: z.string(),
      state: z.string(),
      postcode: z.string(),
      country: z.string()
    })
    .optional()
    .nullable(),
  emergencyContacts: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
        email: z.string().optional().nullable()
      })
    )
    .default([]),
  communicationPreferences: z.array(z.string()).default([])
});
export type EmployeeContact = z.infer<typeof employeeContactSchema>;

export const employeePersonalSchema = z.object({
  legalName: z.object({
    first: z.string(),
    middle: z.string().optional().nullable(),
    last: z.string(),
    suffix: z.string().optional().nullable()
  }),
  preferredName: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  dateOfBirth: z.string(),
  nationalIdentifiers: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      country: z.string(),
      value: z.string()
    })
  ),
  citizenships: z.array(z.string()).default([]),
  maritalStatus: z.string().optional().nullable(),
  languages: z.array(z.string()).default([]),
  veteranStatus: z.string().optional().nullable()
});
export type EmployeePersonal = z.infer<typeof employeePersonalSchema>;

export const employeeJobSchema = z.object({
  positionId: z.string().optional().nullable(),
  jobTitle: z.string(),
  manager: z
    .object({ id: z.string(), name: z.string() })
    .optional()
    .nullable(),
  orgUnit: z.object({ id: z.string(), name: z.string() }).optional().nullable(),
  department: z.object({ id: z.string(), name: z.string() }).optional().nullable(),
  location: z.object({ id: z.string(), name: z.string(), timezone: z.string() }).optional().nullable(),
  grade: z.string().optional().nullable(),
  fte: z.number().min(0).max(1),
  exempt: z.boolean(),
  workerType: z.string(),
  employmentType: z.string(),
  standardHours: z.number().min(0).max(168).optional().nullable(),
  schedule: z.string().optional().nullable(),
  costCenterSummary: z.string().optional().nullable(),
  status: employeeStatusSchema,
  hireDate: z.string(),
  serviceDate: z.string().optional().nullable(),
  probationEndDate: z.string().optional().nullable(),
  contractEndDate: z.string().optional().nullable()
});
export type EmployeeJob = z.infer<typeof employeeJobSchema>;

export const compensationComponentSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  currency: z.string(),
  frequency: z.enum(['ANNUAL', 'MONTHLY', 'FORTNIGHTLY', 'WEEKLY', 'HOURLY']),
  taxable: z.boolean().default(true)
});

export const employeeCompensationSchema = z.object({
  payGroup: z.string(),
  baseSalary: z.object({ amount: z.number(), currency: z.string(), frequency: z.string() }),
  payGrade: z.string().optional().nullable(),
  salaryRange: z
    .object({ min: z.number(), midpoint: z.number().optional(), max: z.number() })
    .optional()
    .nullable(),
  bonusTargetPercent: z.number().min(0).max(100).optional().nullable(),
  allowances: z.array(compensationComponentSchema),
  stockPlan: z.string().optional().nullable(),
  effectiveDate: z.string()
});
export type EmployeeCompensation = z.infer<typeof employeeCompensationSchema>;

export const employeeTimeEligibilitySchema = z.object({
  location: z.string(),
  timezone: z.string(),
  workSchedule: z.string(),
  badgeId: z.string().optional().nullable(),
  overtimeEligible: z.boolean(),
  exempt: z.boolean(),
  benefitsEligible: z.boolean(),
  leaveBalances: z.array(
    z.object({ id: z.string(), type: z.string(), balanceHours: z.number() })
  )
});
export type EmployeeTimeEligibility = z.infer<typeof employeeTimeEligibilitySchema>;

export const costSplitSchema = z.object({
  id: z.string(),
  costCodeId: z.string(),
  costCode: z.object({
    id: z.string(),
    code: z.string(),
    description: z.string().optional().nullable(),
    type: costCodeTypeSchema
  }),
  percentage: z.number().min(0).max(100),
  startDate: z.string(),
  endDate: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  createdBy: z.string().optional().nullable()
});
export type CostSplit = z.infer<typeof costSplitSchema>;

export const costSplitInputSchema = costSplitSchema
  .omit({ id: true, createdAt: true, updatedAt: true, createdBy: true, costCode: true })
  .extend({
    id: z.string().optional(),
    endDate: z.string().optional().nullable()
  });
export type CostSplitInput = z.infer<typeof costSplitInputSchema>;

export const employmentEventSchema = z.object({
  id: z.string(),
  type: employmentEventTypeSchema,
  effectiveDate: z.string(),
  actor: z.string().optional().nullable(),
  createdAt: z.string(),
  payload: z.record(z.any()).default({}),
  source: z.enum(['UI', 'API', 'INTEGRATION']).default('UI')
});
export type EmploymentEvent = z.infer<typeof employmentEventSchema>;

export const documentTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  format: documentFormatSchema,
  description: z.string().optional().nullable(),
  lastUpdatedAt: z.string()
});
export type DocumentTemplate = z.infer<typeof documentTemplateSchema>;

export const generatedDocumentSchema = z.object({
  id: z.string(),
  templateId: z.string().optional().nullable(),
  templateName: z.string().optional().nullable(),
  format: documentFormatSchema,
  filename: z.string(),
  storageUrl: z.string().url(),
  createdAt: z.string(),
  createdBy: z.string().optional().nullable()
});
export type GeneratedDocument = z.infer<typeof generatedDocumentSchema>;

export const employeeHistoryFiltersSchema = z.object({
  type: employmentEventTypeSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional()
});
export type EmployeeHistoryFilters = z.infer<typeof employeeHistoryFiltersSchema>;

export const generateDocumentInputSchema = z.object({
  templateId: z.string(),
  format: documentFormatSchema.default('PDF'),
  mergeFields: z.record(z.any()).optional()
});
export type GenerateDocumentInput = z.infer<typeof generateDocumentInputSchema>;

export const employeeProfileSchema = z.object({
  employee: z.object({
    id: z.string(),
    employeeNumber: z.string().optional().nullable(),
    positionId: z.string().optional().nullable(),
    legalName: z.object({
      full: z.string(),
      preferred: z.string().optional().nullable()
    }),
    jobTitle: z.string(),
    department: z.string().optional().nullable(),
    orgUnit: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    status: employeeStatusSchema,
    costCodeSummary: z.string().optional().nullable(),
    hireDate: z.string(),
    manager: z.string().optional().nullable(),
    avatarUrl: z.string().optional().nullable()
  }),
  personal: employeePersonalSchema,
  contact: employeeContactSchema,
  job: employeeJobSchema,
  compensation: employeeCompensationSchema,
  timeAndEligibility: employeeTimeEligibilitySchema,
  costSplits: z.array(costSplitSchema),
  history: z.array(employmentEventSchema),
  documents: z.object({
    generated: z.array(generatedDocumentSchema),
    templates: z.array(documentTemplateSchema)
  }),
  permissions: z.object({
    canEditPersonal: z.boolean(),
    canEditJob: z.boolean(),
    canEditCompensation: z.boolean(),
    canManageCostSplits: z.boolean(),
    canGenerateDocuments: z.boolean()
  })
});
export type EmployeeProfilePayload = z.infer<typeof employeeProfileSchema>;

export const updateEmployeeProfileSchema = z.discriminatedUnion('section', [
  z.object({ section: z.literal('personal'), payload: employeePersonalSchema }),
  z.object({ section: z.literal('contact'), payload: employeeContactSchema }),
  z.object({ section: z.literal('job'), payload: employeeJobSchema }),
  z.object({ section: z.literal('compensation'), payload: employeeCompensationSchema }),
  z.object({ section: z.literal('timeAndEligibility'), payload: employeeTimeEligibilitySchema })
]);
export type UpdateEmployeeProfileInput = z.infer<typeof updateEmployeeProfileSchema>;

export const upsertCostSplitSchema = z.object({
  splits: z.array(costSplitInputSchema).min(1)
});
export type UpsertCostSplitInput = z.infer<typeof upsertCostSplitSchema>;

export const historyCsvResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string()
});
export type HistoryCsvResponse = z.infer<typeof historyCsvResponseSchema>;

export const employeeDocumentUploadSchema = z.object({
  name: z.string(),
  category: z.string(),
  storageUrl: z.string().url(),
  format: documentFormatSchema,
  uploadedAt: z.string(),
  uploadedBy: z.string()
});

export type EmployeeDocumentUpload = z.infer<typeof employeeDocumentUploadSchema>;


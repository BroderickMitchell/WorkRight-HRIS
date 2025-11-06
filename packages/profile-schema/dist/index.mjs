// src/index.ts
import { z } from "zod";
var isoDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid date"
});
var costCodeTypeSchema = z.enum(["COST_CENTER", "GL", "PROJECT", "WORKTAG"]);
var employmentEventTypeSchema = z.enum([
  "HIRE",
  "TRANSFER",
  "COMP_CHANGE",
  "COST_CODE_CHANGE",
  "MANAGER_CHANGE",
  "LOA",
  "TERMINATION",
  "OTHER"
]);
var documentFormatSchema = z.enum(["PDF", "DOCX"]);
var employeeStatusSchema = z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]);
var employeeContactSchema = z.object({
  workEmail: z.string().email(),
  personalEmail: z.string().email().optional().nullable(),
  workPhone: z.string().optional().nullable(),
  mobilePhone: z.string().optional().nullable(),
  primaryAddress: z.object({
    line1: z.string(),
    line2: z.string().optional().nullable(),
    suburb: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string()
  }).optional().nullable(),
  mailingAddress: z.object({
    line1: z.string(),
    line2: z.string().optional().nullable(),
    suburb: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string()
  }).optional().nullable(),
  emergencyContacts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      relationship: z.string(),
      phone: z.string(),
      email: z.string().optional().nullable()
    })
  ).default([]),
  communicationPreferences: z.array(z.string()).default([])
});
var employeePersonalSchema = z.object({
  legalName: z.object({
    first: z.string(),
    middle: z.string().optional().nullable(),
    last: z.string(),
    suffix: z.string().optional().nullable()
  }),
  preferredName: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  dateOfBirth: isoDateString.nullable(),
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
var employeeJobSchema = z.object({
  positionId: z.string().optional().nullable(),
  jobTitle: z.string(),
  manager: z.object({ id: z.string(), name: z.string() }).optional().nullable(),
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
var compensationComponentSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  currency: z.string(),
  frequency: z.enum(["ANNUAL", "MONTHLY", "FORTNIGHTLY", "WEEKLY", "HOURLY"]),
  taxable: z.boolean().default(true)
});
var employeeCompensationSchema = z.object({
  payGroup: z.string(),
  baseSalary: z.object({ amount: z.number(), currency: z.string(), frequency: z.string() }),
  payGrade: z.string().optional().nullable(),
  salaryRange: z.object({ min: z.number(), midpoint: z.number().optional(), max: z.number() }).optional().nullable(),
  bonusTargetPercent: z.number().min(0).max(100).optional().nullable(),
  allowances: z.array(compensationComponentSchema),
  stockPlan: z.string().optional().nullable(),
  effectiveDate: z.string()
});
var employeeTimeEligibilitySchema = z.object({
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
var costSplitSchema = z.object({
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
var costSplitInputSchema = costSplitSchema.omit({ id: true, createdAt: true, updatedAt: true, createdBy: true, costCode: true }).extend({
  id: z.string().optional(),
  endDate: z.string().optional().nullable()
});
var employmentEventSchema = z.object({
  id: z.string(),
  type: employmentEventTypeSchema,
  effectiveDate: z.string(),
  actor: z.string().optional().nullable(),
  createdAt: z.string(),
  payload: z.record(z.any()).default({}),
  source: z.enum(["UI", "API", "INTEGRATION"]).default("UI")
});
var documentTemplateCategorySchema = z.enum(["HR", "Payroll", "Compliance", "Legal", "Custom"]);
var documentTemplateFieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional().nullable(),
  required: z.boolean().default(false)
});
var documentTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  format: documentFormatSchema,
  category: documentTemplateCategorySchema,
  version: z.number().int().positive(),
  isActive: z.boolean(),
  placeholders: z.array(documentTemplateFieldSchema).default([]),
  lastUpdatedAt: z.string(),
  createdBy: z.string().optional().nullable(),
  body: z.string().optional()
});
var documentTemplateRevisionSchema = documentTemplateSchema.extend({
  version: z.number().int().positive(),
  body: z.string(),
  createdAt: z.string()
});
var upsertDocumentTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  description: z.string().optional().nullable(),
  format: documentFormatSchema,
  category: documentTemplateCategorySchema,
  placeholders: z.array(documentTemplateFieldSchema).default([]),
  body: z.string().min(1),
  isActive: z.boolean().optional()
});
var updateDocumentTemplateMetadataSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional().nullable(),
  category: documentTemplateCategorySchema.optional(),
  isActive: z.boolean().optional()
});
var documentTemplateFiltersSchema = z.object({
  category: documentTemplateCategorySchema.optional(),
  active: z.coerce.boolean().optional(),
  createdBy: z.string().optional()
});
var generatedDocumentSchema = z.object({
  id: z.string(),
  templateId: z.string().optional().nullable(),
  templateName: z.string().optional().nullable(),
  format: documentFormatSchema,
  filename: z.string(),
  storageUrl: z.string().url(),
  createdAt: z.string(),
  createdBy: z.string().optional().nullable(),
  status: z.string(),
  signed: z.boolean(),
  signedAt: z.string().optional().nullable(),
  signedBy: z.string().optional().nullable()
});
var employeeHistoryFiltersSchema = z.object({
  type: employmentEventTypeSchema.optional(),
  from: z.string().optional(),
  to: z.string().optional()
});
var generateDocumentInputSchema = z.object({
  templateId: z.string(),
  format: documentFormatSchema.default("PDF"),
  mergeFields: z.record(z.any()).optional()
});
var generateDocumentPreviewSchema = z.object({
  templateId: z.string().optional(),
  body: z.string().optional(),
  name: z.string().optional(),
  format: documentFormatSchema.default("PDF"),
  data: z.record(z.any()).default({})
});
var signGeneratedDocumentSchema = z.object({
  documentId: z.string(),
  signedBy: z.string().min(1),
  note: z.string().optional().nullable()
});
var tenantBrandingAssetSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(3),
  data: z.string().min(10)
});
var tenantBrandingSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  surfaceColor: z.string(),
  darkMode: z.boolean(),
  logoUrl: z.string().url().optional().nullable(),
  emailLogoUrl: z.string().url().optional().nullable(),
  loginHeroUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  supportEmail: z.string().email(),
  legalAddress: z.string().optional().nullable(),
  subjectPrefix: z.string().optional().nullable(),
  updatedAt: z.string()
});
var updateTenantBrandingSchema = z.object({
  primaryColor: z.string(),
  accentColor: z.string(),
  surfaceColor: z.string().optional(),
  darkMode: z.boolean().optional(),
  supportEmail: z.string().email(),
  legalAddress: z.string().optional().nullable(),
  subjectPrefix: z.string().optional().nullable(),
  logo: tenantBrandingAssetSchema.optional(),
  emailLogo: tenantBrandingAssetSchema.optional(),
  loginHero: tenantBrandingAssetSchema.optional(),
  favicon: tenantBrandingAssetSchema.optional(),
  removeLogo: z.boolean().optional(),
  removeEmailLogo: z.boolean().optional(),
  removeLoginHero: z.boolean().optional(),
  removeFavicon: z.boolean().optional()
});
var employeeProfileSchema = z.object({
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
var updateEmployeeProfileSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("personal"), payload: employeePersonalSchema }),
  z.object({ section: z.literal("contact"), payload: employeeContactSchema }),
  z.object({ section: z.literal("job"), payload: employeeJobSchema }),
  z.object({ section: z.literal("compensation"), payload: employeeCompensationSchema }),
  z.object({ section: z.literal("timeAndEligibility"), payload: employeeTimeEligibilitySchema })
]);
var upsertCostSplitSchema = z.object({
  splits: z.array(costSplitInputSchema).min(1)
});
var historyCsvResponseSchema = z.object({
  url: z.string().url(),
  expiresAt: z.string()
});
var employeeDocumentUploadSchema = z.object({
  name: z.string(),
  category: z.string(),
  storageUrl: z.string().url(),
  format: documentFormatSchema,
  uploadedAt: z.string(),
  uploadedBy: z.string()
});
export {
  compensationComponentSchema,
  costCodeTypeSchema,
  costSplitInputSchema,
  costSplitSchema,
  documentFormatSchema,
  documentTemplateCategorySchema,
  documentTemplateFieldSchema,
  documentTemplateFiltersSchema,
  documentTemplateRevisionSchema,
  documentTemplateSchema,
  employeeCompensationSchema,
  employeeContactSchema,
  employeeDocumentUploadSchema,
  employeeHistoryFiltersSchema,
  employeeJobSchema,
  employeePersonalSchema,
  employeeProfileSchema,
  employeeStatusSchema,
  employeeTimeEligibilitySchema,
  employmentEventSchema,
  employmentEventTypeSchema,
  generateDocumentInputSchema,
  generateDocumentPreviewSchema,
  generatedDocumentSchema,
  historyCsvResponseSchema,
  signGeneratedDocumentSchema,
  tenantBrandingAssetSchema,
  tenantBrandingSchema,
  updateDocumentTemplateMetadataSchema,
  updateEmployeeProfileSchema,
  updateTenantBrandingSchema,
  upsertCostSplitSchema,
  upsertDocumentTemplateSchema
};

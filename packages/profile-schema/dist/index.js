"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  compensationComponentSchema: () => compensationComponentSchema,
  costCodeTypeSchema: () => costCodeTypeSchema,
  costSplitInputSchema: () => costSplitInputSchema,
  costSplitSchema: () => costSplitSchema,
  documentFormatSchema: () => documentFormatSchema,
  documentTemplateCategorySchema: () => documentTemplateCategorySchema,
  documentTemplateFieldSchema: () => documentTemplateFieldSchema,
  documentTemplateFiltersSchema: () => documentTemplateFiltersSchema,
  documentTemplateRevisionSchema: () => documentTemplateRevisionSchema,
  documentTemplateSchema: () => documentTemplateSchema,
  employeeCompensationSchema: () => employeeCompensationSchema,
  employeeContactSchema: () => employeeContactSchema,
  employeeDocumentUploadSchema: () => employeeDocumentUploadSchema,
  employeeHistoryFiltersSchema: () => employeeHistoryFiltersSchema,
  employeeJobSchema: () => employeeJobSchema,
  employeePersonalSchema: () => employeePersonalSchema,
  employeeProfileSchema: () => employeeProfileSchema,
  employeeStatusSchema: () => employeeStatusSchema,
  employeeTimeEligibilitySchema: () => employeeTimeEligibilitySchema,
  employmentEventSchema: () => employmentEventSchema,
  employmentEventTypeSchema: () => employmentEventTypeSchema,
  generateDocumentInputSchema: () => generateDocumentInputSchema,
  generateDocumentPreviewSchema: () => generateDocumentPreviewSchema,
  generatedDocumentSchema: () => generatedDocumentSchema,
  historyCsvResponseSchema: () => historyCsvResponseSchema,
  signGeneratedDocumentSchema: () => signGeneratedDocumentSchema,
  tenantBrandingAssetSchema: () => tenantBrandingAssetSchema,
  tenantBrandingSchema: () => tenantBrandingSchema,
  updateDocumentTemplateMetadataSchema: () => updateDocumentTemplateMetadataSchema,
  updateEmployeeProfileSchema: () => updateEmployeeProfileSchema,
  updateTenantBrandingSchema: () => updateTenantBrandingSchema,
  upsertCostSplitSchema: () => upsertCostSplitSchema,
  upsertDocumentTemplateSchema: () => upsertDocumentTemplateSchema
});
module.exports = __toCommonJS(index_exports);
var import_zod = require("zod");
var costCodeTypeSchema = import_zod.z.enum(["COST_CENTER", "GL", "PROJECT", "WORKTAG"]);
var employmentEventTypeSchema = import_zod.z.enum([
  "HIRE",
  "TRANSFER",
  "COMP_CHANGE",
  "COST_CODE_CHANGE",
  "MANAGER_CHANGE",
  "LOA",
  "TERMINATION",
  "OTHER"
]);
var documentFormatSchema = import_zod.z.enum(["PDF", "DOCX"]);
var employeeStatusSchema = import_zod.z.enum(["ACTIVE", "ON_LEAVE", "TERMINATED"]);
var employeeContactSchema = import_zod.z.object({
  workEmail: import_zod.z.string().email(),
  personalEmail: import_zod.z.string().email().optional().nullable(),
  workPhone: import_zod.z.string().optional().nullable(),
  mobilePhone: import_zod.z.string().optional().nullable(),
  primaryAddress: import_zod.z.object({
    line1: import_zod.z.string(),
    line2: import_zod.z.string().optional().nullable(),
    suburb: import_zod.z.string(),
    state: import_zod.z.string(),
    postcode: import_zod.z.string(),
    country: import_zod.z.string()
  }).optional().nullable(),
  mailingAddress: import_zod.z.object({
    line1: import_zod.z.string(),
    line2: import_zod.z.string().optional().nullable(),
    suburb: import_zod.z.string(),
    state: import_zod.z.string(),
    postcode: import_zod.z.string(),
    country: import_zod.z.string()
  }).optional().nullable(),
  emergencyContacts: import_zod.z.array(
    import_zod.z.object({
      id: import_zod.z.string(),
      name: import_zod.z.string(),
      relationship: import_zod.z.string(),
      phone: import_zod.z.string(),
      email: import_zod.z.string().optional().nullable()
    })
  ).default([]),
  communicationPreferences: import_zod.z.array(import_zod.z.string()).default([])
});
var employeePersonalSchema = import_zod.z.object({
  legalName: import_zod.z.object({
    first: import_zod.z.string(),
    middle: import_zod.z.string().optional().nullable(),
    last: import_zod.z.string(),
    suffix: import_zod.z.string().optional().nullable()
  }),
  preferredName: import_zod.z.string().optional().nullable(),
  pronouns: import_zod.z.string().optional().nullable(),
  dateOfBirth: import_zod.z.string(),
  nationalIdentifiers: import_zod.z.array(
    import_zod.z.object({
      id: import_zod.z.string(),
      type: import_zod.z.string(),
      country: import_zod.z.string(),
      value: import_zod.z.string()
    })
  ),
  citizenships: import_zod.z.array(import_zod.z.string()).default([]),
  maritalStatus: import_zod.z.string().optional().nullable(),
  languages: import_zod.z.array(import_zod.z.string()).default([]),
  veteranStatus: import_zod.z.string().optional().nullable()
});
var employeeJobSchema = import_zod.z.object({
  positionId: import_zod.z.string().optional().nullable(),
  jobTitle: import_zod.z.string(),
  manager: import_zod.z.object({ id: import_zod.z.string(), name: import_zod.z.string() }).optional().nullable(),
  orgUnit: import_zod.z.object({ id: import_zod.z.string(), name: import_zod.z.string() }).optional().nullable(),
  department: import_zod.z.object({ id: import_zod.z.string(), name: import_zod.z.string() }).optional().nullable(),
  location: import_zod.z.object({ id: import_zod.z.string(), name: import_zod.z.string(), timezone: import_zod.z.string() }).optional().nullable(),
  grade: import_zod.z.string().optional().nullable(),
  fte: import_zod.z.number().min(0).max(1),
  exempt: import_zod.z.boolean(),
  workerType: import_zod.z.string(),
  employmentType: import_zod.z.string(),
  standardHours: import_zod.z.number().min(0).max(168).optional().nullable(),
  schedule: import_zod.z.string().optional().nullable(),
  costCenterSummary: import_zod.z.string().optional().nullable(),
  status: employeeStatusSchema,
  hireDate: import_zod.z.string(),
  serviceDate: import_zod.z.string().optional().nullable(),
  probationEndDate: import_zod.z.string().optional().nullable(),
  contractEndDate: import_zod.z.string().optional().nullable()
});
var compensationComponentSchema = import_zod.z.object({
  id: import_zod.z.string(),
  label: import_zod.z.string(),
  amount: import_zod.z.number(),
  currency: import_zod.z.string(),
  frequency: import_zod.z.enum(["ANNUAL", "MONTHLY", "FORTNIGHTLY", "WEEKLY", "HOURLY"]),
  taxable: import_zod.z.boolean().default(true)
});
var employeeCompensationSchema = import_zod.z.object({
  payGroup: import_zod.z.string(),
  baseSalary: import_zod.z.object({ amount: import_zod.z.number(), currency: import_zod.z.string(), frequency: import_zod.z.string() }),
  payGrade: import_zod.z.string().optional().nullable(),
  salaryRange: import_zod.z.object({ min: import_zod.z.number(), midpoint: import_zod.z.number().optional(), max: import_zod.z.number() }).optional().nullable(),
  bonusTargetPercent: import_zod.z.number().min(0).max(100).optional().nullable(),
  allowances: import_zod.z.array(compensationComponentSchema),
  stockPlan: import_zod.z.string().optional().nullable(),
  effectiveDate: import_zod.z.string()
});
var employeeTimeEligibilitySchema = import_zod.z.object({
  location: import_zod.z.string(),
  timezone: import_zod.z.string(),
  workSchedule: import_zod.z.string(),
  badgeId: import_zod.z.string().optional().nullable(),
  overtimeEligible: import_zod.z.boolean(),
  exempt: import_zod.z.boolean(),
  benefitsEligible: import_zod.z.boolean(),
  leaveBalances: import_zod.z.array(
    import_zod.z.object({ id: import_zod.z.string(), type: import_zod.z.string(), balanceHours: import_zod.z.number() })
  )
});
var costSplitSchema = import_zod.z.object({
  id: import_zod.z.string(),
  costCodeId: import_zod.z.string(),
  costCode: import_zod.z.object({
    id: import_zod.z.string(),
    code: import_zod.z.string(),
    description: import_zod.z.string().optional().nullable(),
    type: costCodeTypeSchema
  }),
  percentage: import_zod.z.number().min(0).max(100),
  startDate: import_zod.z.string(),
  endDate: import_zod.z.string().nullable(),
  createdAt: import_zod.z.string(),
  updatedAt: import_zod.z.string(),
  createdBy: import_zod.z.string().optional().nullable()
});
var costSplitInputSchema = costSplitSchema.omit({ id: true, createdAt: true, updatedAt: true, createdBy: true, costCode: true }).extend({
  id: import_zod.z.string().optional(),
  endDate: import_zod.z.string().optional().nullable()
});
var employmentEventSchema = import_zod.z.object({
  id: import_zod.z.string(),
  type: employmentEventTypeSchema,
  effectiveDate: import_zod.z.string(),
  actor: import_zod.z.string().optional().nullable(),
  createdAt: import_zod.z.string(),
  payload: import_zod.z.record(import_zod.z.any()).default({}),
  source: import_zod.z.enum(["UI", "API", "INTEGRATION"]).default("UI")
});
var documentTemplateCategorySchema = import_zod.z.enum(["HR", "Payroll", "Compliance", "Legal", "Custom"]);
var documentTemplateFieldSchema = import_zod.z.object({
  key: import_zod.z.string().min(1),
  label: import_zod.z.string().min(1),
  description: import_zod.z.string().optional().nullable(),
  required: import_zod.z.boolean().default(false)
});
var documentTemplateSchema = import_zod.z.object({
  id: import_zod.z.string(),
  name: import_zod.z.string(),
  description: import_zod.z.string().optional().nullable(),
  format: documentFormatSchema,
  category: documentTemplateCategorySchema,
  version: import_zod.z.number().int().positive(),
  isActive: import_zod.z.boolean(),
  placeholders: import_zod.z.array(documentTemplateFieldSchema).default([]),
  lastUpdatedAt: import_zod.z.string(),
  createdBy: import_zod.z.string().optional().nullable(),
  body: import_zod.z.string().optional()
});
var documentTemplateRevisionSchema = documentTemplateSchema.extend({
  version: import_zod.z.number().int().positive(),
  body: import_zod.z.string(),
  createdAt: import_zod.z.string()
});
var upsertDocumentTemplateSchema = import_zod.z.object({
  id: import_zod.z.string().optional(),
  name: import_zod.z.string().min(3),
  description: import_zod.z.string().optional().nullable(),
  format: documentFormatSchema,
  category: documentTemplateCategorySchema,
  placeholders: import_zod.z.array(documentTemplateFieldSchema).default([]),
  body: import_zod.z.string().min(1),
  isActive: import_zod.z.boolean().optional()
});
var updateDocumentTemplateMetadataSchema = import_zod.z.object({
  name: import_zod.z.string().min(3).optional(),
  description: import_zod.z.string().optional().nullable(),
  category: documentTemplateCategorySchema.optional(),
  isActive: import_zod.z.boolean().optional()
});
var documentTemplateFiltersSchema = import_zod.z.object({
  category: documentTemplateCategorySchema.optional(),
  active: import_zod.z.coerce.boolean().optional(),
  createdBy: import_zod.z.string().optional()
});
var generatedDocumentSchema = import_zod.z.object({
  id: import_zod.z.string(),
  templateId: import_zod.z.string().optional().nullable(),
  templateName: import_zod.z.string().optional().nullable(),
  format: documentFormatSchema,
  filename: import_zod.z.string(),
  storageUrl: import_zod.z.string().url(),
  createdAt: import_zod.z.string(),
  createdBy: import_zod.z.string().optional().nullable(),
  status: import_zod.z.string(),
  signed: import_zod.z.boolean(),
  signedAt: import_zod.z.string().optional().nullable(),
  signedBy: import_zod.z.string().optional().nullable()
});
var employeeHistoryFiltersSchema = import_zod.z.object({
  type: employmentEventTypeSchema.optional(),
  from: import_zod.z.string().optional(),
  to: import_zod.z.string().optional()
});
var generateDocumentInputSchema = import_zod.z.object({
  templateId: import_zod.z.string(),
  format: documentFormatSchema.default("PDF"),
  mergeFields: import_zod.z.record(import_zod.z.any()).optional()
});
var generateDocumentPreviewSchema = import_zod.z.object({
  templateId: import_zod.z.string().optional(),
  body: import_zod.z.string().optional(),
  name: import_zod.z.string().optional(),
  format: documentFormatSchema.default("PDF"),
  data: import_zod.z.record(import_zod.z.any()).default({})
});
var signGeneratedDocumentSchema = import_zod.z.object({
  documentId: import_zod.z.string(),
  signedBy: import_zod.z.string().min(1),
  note: import_zod.z.string().optional().nullable()
});
var tenantBrandingAssetSchema = import_zod.z.object({
  filename: import_zod.z.string().min(1),
  mimeType: import_zod.z.string().min(3),
  data: import_zod.z.string().min(10)
});
var tenantBrandingSchema = import_zod.z.object({
  primaryColor: import_zod.z.string(),
  accentColor: import_zod.z.string(),
  surfaceColor: import_zod.z.string(),
  darkMode: import_zod.z.boolean(),
  logoUrl: import_zod.z.string().url().optional().nullable(),
  emailLogoUrl: import_zod.z.string().url().optional().nullable(),
  loginHeroUrl: import_zod.z.string().url().optional().nullable(),
  faviconUrl: import_zod.z.string().url().optional().nullable(),
  supportEmail: import_zod.z.string().email(),
  legalAddress: import_zod.z.string().optional().nullable(),
  subjectPrefix: import_zod.z.string().optional().nullable(),
  updatedAt: import_zod.z.string()
});
var updateTenantBrandingSchema = import_zod.z.object({
  primaryColor: import_zod.z.string(),
  accentColor: import_zod.z.string(),
  surfaceColor: import_zod.z.string().optional(),
  darkMode: import_zod.z.boolean().optional(),
  supportEmail: import_zod.z.string().email(),
  legalAddress: import_zod.z.string().optional().nullable(),
  subjectPrefix: import_zod.z.string().optional().nullable(),
  logo: tenantBrandingAssetSchema.optional(),
  emailLogo: tenantBrandingAssetSchema.optional(),
  loginHero: tenantBrandingAssetSchema.optional(),
  favicon: tenantBrandingAssetSchema.optional(),
  removeLogo: import_zod.z.boolean().optional(),
  removeEmailLogo: import_zod.z.boolean().optional(),
  removeLoginHero: import_zod.z.boolean().optional(),
  removeFavicon: import_zod.z.boolean().optional()
});
var employeeProfileSchema = import_zod.z.object({
  employee: import_zod.z.object({
    id: import_zod.z.string(),
    employeeNumber: import_zod.z.string().optional().nullable(),
    positionId: import_zod.z.string().optional().nullable(),
    legalName: import_zod.z.object({
      full: import_zod.z.string(),
      preferred: import_zod.z.string().optional().nullable()
    }),
    jobTitle: import_zod.z.string(),
    department: import_zod.z.string().optional().nullable(),
    orgUnit: import_zod.z.string().optional().nullable(),
    location: import_zod.z.string().optional().nullable(),
    status: employeeStatusSchema,
    costCodeSummary: import_zod.z.string().optional().nullable(),
    hireDate: import_zod.z.string(),
    manager: import_zod.z.string().optional().nullable(),
    avatarUrl: import_zod.z.string().optional().nullable()
  }),
  personal: employeePersonalSchema,
  contact: employeeContactSchema,
  job: employeeJobSchema,
  compensation: employeeCompensationSchema,
  timeAndEligibility: employeeTimeEligibilitySchema,
  costSplits: import_zod.z.array(costSplitSchema),
  history: import_zod.z.array(employmentEventSchema),
  documents: import_zod.z.object({
    generated: import_zod.z.array(generatedDocumentSchema),
    templates: import_zod.z.array(documentTemplateSchema)
  }),
  permissions: import_zod.z.object({
    canEditPersonal: import_zod.z.boolean(),
    canEditJob: import_zod.z.boolean(),
    canEditCompensation: import_zod.z.boolean(),
    canManageCostSplits: import_zod.z.boolean(),
    canGenerateDocuments: import_zod.z.boolean()
  })
});
var updateEmployeeProfileSchema = import_zod.z.discriminatedUnion("section", [
  import_zod.z.object({ section: import_zod.z.literal("personal"), payload: employeePersonalSchema }),
  import_zod.z.object({ section: import_zod.z.literal("contact"), payload: employeeContactSchema }),
  import_zod.z.object({ section: import_zod.z.literal("job"), payload: employeeJobSchema }),
  import_zod.z.object({ section: import_zod.z.literal("compensation"), payload: employeeCompensationSchema }),
  import_zod.z.object({ section: import_zod.z.literal("timeAndEligibility"), payload: employeeTimeEligibilitySchema })
]);
var upsertCostSplitSchema = import_zod.z.object({
  splits: import_zod.z.array(costSplitInputSchema).min(1)
});
var historyCsvResponseSchema = import_zod.z.object({
  url: import_zod.z.string().url(),
  expiresAt: import_zod.z.string()
});
var employeeDocumentUploadSchema = import_zod.z.object({
  name: import_zod.z.string(),
  category: import_zod.z.string(),
  storageUrl: import_zod.z.string().url(),
  format: documentFormatSchema,
  uploadedAt: import_zod.z.string(),
  uploadedBy: import_zod.z.string()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
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
});

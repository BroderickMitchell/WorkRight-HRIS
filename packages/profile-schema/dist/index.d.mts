import { z } from 'zod';

declare const costCodeTypeSchema: z.ZodEnum<["COST_CENTER", "GL", "PROJECT", "WORKTAG"]>;
type CostCodeType = z.infer<typeof costCodeTypeSchema>;
declare const employmentEventTypeSchema: z.ZodEnum<["HIRE", "TRANSFER", "COMP_CHANGE", "COST_CODE_CHANGE", "MANAGER_CHANGE", "LOA", "TERMINATION", "OTHER"]>;
type EmploymentEventType = z.infer<typeof employmentEventTypeSchema>;
declare const documentFormatSchema: z.ZodEnum<["PDF", "DOCX"]>;
type DocumentFormat = z.infer<typeof documentFormatSchema>;
declare const employeeStatusSchema: z.ZodEnum<["ACTIVE", "ON_LEAVE", "TERMINATED"]>;
type EmployeeStatus = z.infer<typeof employeeStatusSchema>;
declare const employeeContactSchema: z.ZodObject<{
    workEmail: z.ZodString;
    personalEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    workPhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    mobilePhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    primaryAddress: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        suburb: z.ZodString;
        state: z.ZodString;
        postcode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    }, {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    }>>>;
    mailingAddress: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        line1: z.ZodString;
        line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        suburb: z.ZodString;
        state: z.ZodString;
        postcode: z.ZodString;
        country: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    }, {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    }>>>;
    emergencyContacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        relationship: z.ZodString;
        phone: z.ZodString;
        email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        relationship: string;
        phone: string;
        email?: string | null | undefined;
    }, {
        id: string;
        name: string;
        relationship: string;
        phone: string;
        email?: string | null | undefined;
    }>, "many">>;
    communicationPreferences: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    workEmail: string;
    emergencyContacts: {
        id: string;
        name: string;
        relationship: string;
        phone: string;
        email?: string | null | undefined;
    }[];
    communicationPreferences: string[];
    personalEmail?: string | null | undefined;
    workPhone?: string | null | undefined;
    mobilePhone?: string | null | undefined;
    primaryAddress?: {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    } | null | undefined;
    mailingAddress?: {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    } | null | undefined;
}, {
    workEmail: string;
    personalEmail?: string | null | undefined;
    workPhone?: string | null | undefined;
    mobilePhone?: string | null | undefined;
    primaryAddress?: {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    } | null | undefined;
    mailingAddress?: {
        line1: string;
        suburb: string;
        state: string;
        postcode: string;
        country: string;
        line2?: string | null | undefined;
    } | null | undefined;
    emergencyContacts?: {
        id: string;
        name: string;
        relationship: string;
        phone: string;
        email?: string | null | undefined;
    }[] | undefined;
    communicationPreferences?: string[] | undefined;
}>;
type EmployeeContact = z.infer<typeof employeeContactSchema>;
declare const employeePersonalSchema: z.ZodObject<{
    legalName: z.ZodObject<{
        first: z.ZodString;
        middle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        last: z.ZodString;
        suffix: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        first: string;
        last: string;
        middle?: string | null | undefined;
        suffix?: string | null | undefined;
    }, {
        first: string;
        last: string;
        middle?: string | null | undefined;
        suffix?: string | null | undefined;
    }>;
    preferredName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    pronouns: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    dateOfBirth: z.ZodString;
    nationalIdentifiers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        country: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        type: string;
        country: string;
        id: string;
    }, {
        value: string;
        type: string;
        country: string;
        id: string;
    }>, "many">;
    citizenships: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maritalStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    languages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    veteranStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    legalName: {
        first: string;
        last: string;
        middle?: string | null | undefined;
        suffix?: string | null | undefined;
    };
    dateOfBirth: string;
    nationalIdentifiers: {
        value: string;
        type: string;
        country: string;
        id: string;
    }[];
    citizenships: string[];
    languages: string[];
    preferredName?: string | null | undefined;
    pronouns?: string | null | undefined;
    maritalStatus?: string | null | undefined;
    veteranStatus?: string | null | undefined;
}, {
    legalName: {
        first: string;
        last: string;
        middle?: string | null | undefined;
        suffix?: string | null | undefined;
    };
    dateOfBirth: string;
    nationalIdentifiers: {
        value: string;
        type: string;
        country: string;
        id: string;
    }[];
    preferredName?: string | null | undefined;
    pronouns?: string | null | undefined;
    citizenships?: string[] | undefined;
    maritalStatus?: string | null | undefined;
    languages?: string[] | undefined;
    veteranStatus?: string | null | undefined;
}>;
type EmployeePersonal = z.infer<typeof employeePersonalSchema>;
declare const employeeJobSchema: z.ZodObject<{
    positionId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    jobTitle: z.ZodString;
    manager: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>>>;
    orgUnit: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>>>;
    department: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
    }, {
        id: string;
        name: string;
    }>>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        timezone: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        timezone: string;
    }, {
        id: string;
        name: string;
        timezone: string;
    }>>>;
    grade: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    fte: z.ZodNumber;
    exempt: z.ZodBoolean;
    workerType: z.ZodString;
    employmentType: z.ZodString;
    standardHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    schedule: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    costCenterSummary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodEnum<["ACTIVE", "ON_LEAVE", "TERMINATED"]>;
    hireDate: z.ZodString;
    serviceDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    probationEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    contractEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
    jobTitle: string;
    fte: number;
    exempt: boolean;
    workerType: string;
    employmentType: string;
    hireDate: string;
    positionId?: string | null | undefined;
    manager?: {
        id: string;
        name: string;
    } | null | undefined;
    orgUnit?: {
        id: string;
        name: string;
    } | null | undefined;
    department?: {
        id: string;
        name: string;
    } | null | undefined;
    location?: {
        id: string;
        name: string;
        timezone: string;
    } | null | undefined;
    grade?: string | null | undefined;
    standardHours?: number | null | undefined;
    schedule?: string | null | undefined;
    costCenterSummary?: string | null | undefined;
    serviceDate?: string | null | undefined;
    probationEndDate?: string | null | undefined;
    contractEndDate?: string | null | undefined;
}, {
    status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
    jobTitle: string;
    fte: number;
    exempt: boolean;
    workerType: string;
    employmentType: string;
    hireDate: string;
    positionId?: string | null | undefined;
    manager?: {
        id: string;
        name: string;
    } | null | undefined;
    orgUnit?: {
        id: string;
        name: string;
    } | null | undefined;
    department?: {
        id: string;
        name: string;
    } | null | undefined;
    location?: {
        id: string;
        name: string;
        timezone: string;
    } | null | undefined;
    grade?: string | null | undefined;
    standardHours?: number | null | undefined;
    schedule?: string | null | undefined;
    costCenterSummary?: string | null | undefined;
    serviceDate?: string | null | undefined;
    probationEndDate?: string | null | undefined;
    contractEndDate?: string | null | undefined;
}>;
type EmployeeJob = z.infer<typeof employeeJobSchema>;
declare const compensationComponentSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    amount: z.ZodNumber;
    currency: z.ZodString;
    frequency: z.ZodEnum<["ANNUAL", "MONTHLY", "FORTNIGHTLY", "WEEKLY", "HOURLY"]>;
    taxable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    amount: number;
    currency: string;
    frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
    taxable: boolean;
}, {
    id: string;
    label: string;
    amount: number;
    currency: string;
    frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
    taxable?: boolean | undefined;
}>;
declare const employeeCompensationSchema: z.ZodObject<{
    payGroup: z.ZodString;
    baseSalary: z.ZodObject<{
        amount: z.ZodNumber;
        currency: z.ZodString;
        frequency: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        amount: number;
        currency: string;
        frequency: string;
    }, {
        amount: number;
        currency: string;
        frequency: string;
    }>;
    payGrade: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    salaryRange: z.ZodNullable<z.ZodOptional<z.ZodObject<{
        min: z.ZodNumber;
        midpoint: z.ZodOptional<z.ZodNumber>;
        max: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        min: number;
        max: number;
        midpoint?: number | undefined;
    }, {
        min: number;
        max: number;
        midpoint?: number | undefined;
    }>>>;
    bonusTargetPercent: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    allowances: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        amount: z.ZodNumber;
        currency: z.ZodString;
        frequency: z.ZodEnum<["ANNUAL", "MONTHLY", "FORTNIGHTLY", "WEEKLY", "HOURLY"]>;
        taxable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        label: string;
        amount: number;
        currency: string;
        frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
        taxable: boolean;
    }, {
        id: string;
        label: string;
        amount: number;
        currency: string;
        frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
        taxable?: boolean | undefined;
    }>, "many">;
    stockPlan: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    effectiveDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    payGroup: string;
    baseSalary: {
        amount: number;
        currency: string;
        frequency: string;
    };
    allowances: {
        id: string;
        label: string;
        amount: number;
        currency: string;
        frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
        taxable: boolean;
    }[];
    effectiveDate: string;
    payGrade?: string | null | undefined;
    salaryRange?: {
        min: number;
        max: number;
        midpoint?: number | undefined;
    } | null | undefined;
    bonusTargetPercent?: number | null | undefined;
    stockPlan?: string | null | undefined;
}, {
    payGroup: string;
    baseSalary: {
        amount: number;
        currency: string;
        frequency: string;
    };
    allowances: {
        id: string;
        label: string;
        amount: number;
        currency: string;
        frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
        taxable?: boolean | undefined;
    }[];
    effectiveDate: string;
    payGrade?: string | null | undefined;
    salaryRange?: {
        min: number;
        max: number;
        midpoint?: number | undefined;
    } | null | undefined;
    bonusTargetPercent?: number | null | undefined;
    stockPlan?: string | null | undefined;
}>;
type EmployeeCompensation = z.infer<typeof employeeCompensationSchema>;
declare const employeeTimeEligibilitySchema: z.ZodObject<{
    location: z.ZodString;
    timezone: z.ZodString;
    workSchedule: z.ZodString;
    badgeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    overtimeEligible: z.ZodBoolean;
    exempt: z.ZodBoolean;
    benefitsEligible: z.ZodBoolean;
    leaveBalances: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        balanceHours: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        type: string;
        id: string;
        balanceHours: number;
    }, {
        type: string;
        id: string;
        balanceHours: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    timezone: string;
    location: string;
    exempt: boolean;
    workSchedule: string;
    overtimeEligible: boolean;
    benefitsEligible: boolean;
    leaveBalances: {
        type: string;
        id: string;
        balanceHours: number;
    }[];
    badgeId?: string | null | undefined;
}, {
    timezone: string;
    location: string;
    exempt: boolean;
    workSchedule: string;
    overtimeEligible: boolean;
    benefitsEligible: boolean;
    leaveBalances: {
        type: string;
        id: string;
        balanceHours: number;
    }[];
    badgeId?: string | null | undefined;
}>;
type EmployeeTimeEligibility = z.infer<typeof employeeTimeEligibilitySchema>;
declare const costSplitSchema: z.ZodObject<{
    id: z.ZodString;
    costCodeId: z.ZodString;
    costCode: z.ZodObject<{
        id: z.ZodString;
        code: z.ZodString;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        type: z.ZodEnum<["COST_CENTER", "GL", "PROJECT", "WORKTAG"]>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
        id: string;
        description?: string | null | undefined;
    }, {
        code: string;
        type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
        id: string;
        description?: string | null | undefined;
    }>;
    percentage: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    createdBy: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    costCodeId: string;
    costCode: {
        code: string;
        type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
        id: string;
        description?: string | null | undefined;
    };
    percentage: number;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null | undefined;
}, {
    id: string;
    costCodeId: string;
    costCode: {
        code: string;
        type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
        id: string;
        description?: string | null | undefined;
    };
    percentage: number;
    startDate: string;
    endDate: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy?: string | null | undefined;
}>;
type CostSplit = z.infer<typeof costSplitSchema>;
declare const costSplitInputSchema: z.ZodObject<{
    costCodeId: z.ZodString;
    percentage: z.ZodNumber;
    startDate: z.ZodString;
} & {
    id: z.ZodOptional<z.ZodString>;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    costCodeId: string;
    percentage: number;
    startDate: string;
    id?: string | undefined;
    endDate?: string | null | undefined;
}, {
    costCodeId: string;
    percentage: number;
    startDate: string;
    id?: string | undefined;
    endDate?: string | null | undefined;
}>;
type CostSplitInput = z.infer<typeof costSplitInputSchema>;
declare const employmentEventSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodEnum<["HIRE", "TRANSFER", "COMP_CHANGE", "COST_CODE_CHANGE", "MANAGER_CHANGE", "LOA", "TERMINATION", "OTHER"]>;
    effectiveDate: z.ZodString;
    actor: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    createdAt: z.ZodString;
    payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    source: z.ZodDefault<z.ZodEnum<["UI", "API", "INTEGRATION"]>>;
}, "strip", z.ZodTypeAny, {
    type: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER";
    id: string;
    effectiveDate: string;
    createdAt: string;
    payload: Record<string, any>;
    source: "UI" | "API" | "INTEGRATION";
    actor?: string | null | undefined;
}, {
    type: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER";
    id: string;
    effectiveDate: string;
    createdAt: string;
    actor?: string | null | undefined;
    payload?: Record<string, any> | undefined;
    source?: "UI" | "API" | "INTEGRATION" | undefined;
}>;
type EmploymentEvent = z.infer<typeof employmentEventSchema>;
declare const documentTemplateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    format: z.ZodEnum<["PDF", "DOCX"]>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    lastUpdatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    format: "PDF" | "DOCX";
    lastUpdatedAt: string;
    description?: string | null | undefined;
}, {
    id: string;
    name: string;
    format: "PDF" | "DOCX";
    lastUpdatedAt: string;
    description?: string | null | undefined;
}>;
type DocumentTemplate = z.infer<typeof documentTemplateSchema>;
declare const generatedDocumentSchema: z.ZodObject<{
    id: z.ZodString;
    templateId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    templateName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    format: z.ZodEnum<["PDF", "DOCX"]>;
    filename: z.ZodString;
    storageUrl: z.ZodString;
    createdAt: z.ZodString;
    createdBy: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    format: "PDF" | "DOCX";
    filename: string;
    storageUrl: string;
    createdBy?: string | null | undefined;
    templateId?: string | null | undefined;
    templateName?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    format: "PDF" | "DOCX";
    filename: string;
    storageUrl: string;
    createdBy?: string | null | undefined;
    templateId?: string | null | undefined;
    templateName?: string | null | undefined;
}>;
type GeneratedDocument = z.infer<typeof generatedDocumentSchema>;
declare const employeeHistoryFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["HIRE", "TRANSFER", "COMP_CHANGE", "COST_CODE_CHANGE", "MANAGER_CHANGE", "LOA", "TERMINATION", "OTHER"]>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER" | undefined;
    from?: string | undefined;
    to?: string | undefined;
}, {
    type?: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER" | undefined;
    from?: string | undefined;
    to?: string | undefined;
}>;
type EmployeeHistoryFilters = z.infer<typeof employeeHistoryFiltersSchema>;
declare const generateDocumentInputSchema: z.ZodObject<{
    templateId: z.ZodString;
    format: z.ZodDefault<z.ZodEnum<["PDF", "DOCX"]>>;
    mergeFields: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    format: "PDF" | "DOCX";
    templateId: string;
    mergeFields?: Record<string, any> | undefined;
}, {
    templateId: string;
    format?: "PDF" | "DOCX" | undefined;
    mergeFields?: Record<string, any> | undefined;
}>;
type GenerateDocumentInput = z.infer<typeof generateDocumentInputSchema>;
declare const employeeProfileSchema: z.ZodObject<{
    employee: z.ZodObject<{
        id: z.ZodString;
        employeeNumber: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        positionId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        legalName: z.ZodObject<{
            full: z.ZodString;
            preferred: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            full: string;
            preferred?: string | null | undefined;
        }, {
            full: string;
            preferred?: string | null | undefined;
        }>;
        jobTitle: z.ZodString;
        department: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        orgUnit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        status: z.ZodEnum<["ACTIVE", "ON_LEAVE", "TERMINATED"]>;
        costCodeSummary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hireDate: z.ZodString;
        manager: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        avatarUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        id: string;
        legalName: {
            full: string;
            preferred?: string | null | undefined;
        };
        jobTitle: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: string | null | undefined;
        orgUnit?: string | null | undefined;
        department?: string | null | undefined;
        location?: string | null | undefined;
        employeeNumber?: string | null | undefined;
        costCodeSummary?: string | null | undefined;
        avatarUrl?: string | null | undefined;
    }, {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        id: string;
        legalName: {
            full: string;
            preferred?: string | null | undefined;
        };
        jobTitle: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: string | null | undefined;
        orgUnit?: string | null | undefined;
        department?: string | null | undefined;
        location?: string | null | undefined;
        employeeNumber?: string | null | undefined;
        costCodeSummary?: string | null | undefined;
        avatarUrl?: string | null | undefined;
    }>;
    personal: z.ZodObject<{
        legalName: z.ZodObject<{
            first: z.ZodString;
            middle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            last: z.ZodString;
            suffix: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        }, {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        }>;
        preferredName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pronouns: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        dateOfBirth: z.ZodString;
        nationalIdentifiers: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            country: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            country: string;
            id: string;
        }, {
            value: string;
            type: string;
            country: string;
            id: string;
        }>, "many">;
        citizenships: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        maritalStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        languages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        veteranStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        citizenships: string[];
        languages: string[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        maritalStatus?: string | null | undefined;
        veteranStatus?: string | null | undefined;
    }, {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        citizenships?: string[] | undefined;
        maritalStatus?: string | null | undefined;
        languages?: string[] | undefined;
        veteranStatus?: string | null | undefined;
    }>;
    contact: z.ZodObject<{
        workEmail: z.ZodString;
        personalEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        workPhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        mobilePhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        primaryAddress: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            suburb: z.ZodString;
            state: z.ZodString;
            postcode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }>>>;
        mailingAddress: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            suburb: z.ZodString;
            state: z.ZodString;
            postcode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }>>>;
        emergencyContacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            relationship: z.ZodString;
            phone: z.ZodString;
            email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }, {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }>, "many">>;
        communicationPreferences: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        workEmail: string;
        emergencyContacts: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[];
        communicationPreferences: string[];
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
    }, {
        workEmail: string;
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        emergencyContacts?: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[] | undefined;
        communicationPreferences?: string[] | undefined;
    }>;
    job: z.ZodObject<{
        positionId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        jobTitle: z.ZodString;
        manager: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>>;
        orgUnit: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>>;
        department: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>>;
        location: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            timezone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            timezone: string;
        }, {
            id: string;
            name: string;
            timezone: string;
        }>>>;
        grade: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        fte: z.ZodNumber;
        exempt: z.ZodBoolean;
        workerType: z.ZodString;
        employmentType: z.ZodString;
        standardHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        schedule: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        costCenterSummary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        status: z.ZodEnum<["ACTIVE", "ON_LEAVE", "TERMINATED"]>;
        hireDate: z.ZodString;
        serviceDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        probationEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        contractEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    }, {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    }>;
    compensation: z.ZodObject<{
        payGroup: z.ZodString;
        baseSalary: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            frequency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            currency: string;
            frequency: string;
        }, {
            amount: number;
            currency: string;
            frequency: string;
        }>;
        payGrade: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        salaryRange: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            min: z.ZodNumber;
            midpoint: z.ZodOptional<z.ZodNumber>;
            max: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            midpoint?: number | undefined;
        }, {
            min: number;
            max: number;
            midpoint?: number | undefined;
        }>>>;
        bonusTargetPercent: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        allowances: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            amount: z.ZodNumber;
            currency: z.ZodString;
            frequency: z.ZodEnum<["ANNUAL", "MONTHLY", "FORTNIGHTLY", "WEEKLY", "HOURLY"]>;
            taxable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable: boolean;
        }, {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable?: boolean | undefined;
        }>, "many">;
        stockPlan: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        effectiveDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable: boolean;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    }, {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable?: boolean | undefined;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    }>;
    timeAndEligibility: z.ZodObject<{
        location: z.ZodString;
        timezone: z.ZodString;
        workSchedule: z.ZodString;
        badgeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        overtimeEligible: z.ZodBoolean;
        exempt: z.ZodBoolean;
        benefitsEligible: z.ZodBoolean;
        leaveBalances: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            balanceHours: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id: string;
            balanceHours: number;
        }, {
            type: string;
            id: string;
            balanceHours: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    }, {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    }>;
    costSplits: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        costCodeId: z.ZodString;
        costCode: z.ZodObject<{
            id: z.ZodString;
            code: z.ZodString;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            type: z.ZodEnum<["COST_CENTER", "GL", "PROJECT", "WORKTAG"]>;
        }, "strip", z.ZodTypeAny, {
            code: string;
            type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
            id: string;
            description?: string | null | undefined;
        }, {
            code: string;
            type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
            id: string;
            description?: string | null | undefined;
        }>;
        percentage: z.ZodNumber;
        startDate: z.ZodString;
        endDate: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        createdBy: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        costCodeId: string;
        costCode: {
            code: string;
            type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
            id: string;
            description?: string | null | undefined;
        };
        percentage: number;
        startDate: string;
        endDate: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy?: string | null | undefined;
    }, {
        id: string;
        costCodeId: string;
        costCode: {
            code: string;
            type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
            id: string;
            description?: string | null | undefined;
        };
        percentage: number;
        startDate: string;
        endDate: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy?: string | null | undefined;
    }>, "many">;
    history: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodEnum<["HIRE", "TRANSFER", "COMP_CHANGE", "COST_CODE_CHANGE", "MANAGER_CHANGE", "LOA", "TERMINATION", "OTHER"]>;
        effectiveDate: z.ZodString;
        actor: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        createdAt: z.ZodString;
        payload: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        source: z.ZodDefault<z.ZodEnum<["UI", "API", "INTEGRATION"]>>;
    }, "strip", z.ZodTypeAny, {
        type: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER";
        id: string;
        effectiveDate: string;
        createdAt: string;
        payload: Record<string, any>;
        source: "UI" | "API" | "INTEGRATION";
        actor?: string | null | undefined;
    }, {
        type: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER";
        id: string;
        effectiveDate: string;
        createdAt: string;
        actor?: string | null | undefined;
        payload?: Record<string, any> | undefined;
        source?: "UI" | "API" | "INTEGRATION" | undefined;
    }>, "many">;
    documents: z.ZodObject<{
        generated: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            templateId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            templateName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            format: z.ZodEnum<["PDF", "DOCX"]>;
            filename: z.ZodString;
            storageUrl: z.ZodString;
            createdAt: z.ZodString;
            createdBy: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: string;
            format: "PDF" | "DOCX";
            filename: string;
            storageUrl: string;
            createdBy?: string | null | undefined;
            templateId?: string | null | undefined;
            templateName?: string | null | undefined;
        }, {
            id: string;
            createdAt: string;
            format: "PDF" | "DOCX";
            filename: string;
            storageUrl: string;
            createdBy?: string | null | undefined;
            templateId?: string | null | undefined;
            templateName?: string | null | undefined;
        }>, "many">;
        templates: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            format: z.ZodEnum<["PDF", "DOCX"]>;
            description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            lastUpdatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            format: "PDF" | "DOCX";
            lastUpdatedAt: string;
            description?: string | null | undefined;
        }, {
            id: string;
            name: string;
            format: "PDF" | "DOCX";
            lastUpdatedAt: string;
            description?: string | null | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        generated: {
            id: string;
            createdAt: string;
            format: "PDF" | "DOCX";
            filename: string;
            storageUrl: string;
            createdBy?: string | null | undefined;
            templateId?: string | null | undefined;
            templateName?: string | null | undefined;
        }[];
        templates: {
            id: string;
            name: string;
            format: "PDF" | "DOCX";
            lastUpdatedAt: string;
            description?: string | null | undefined;
        }[];
    }, {
        generated: {
            id: string;
            createdAt: string;
            format: "PDF" | "DOCX";
            filename: string;
            storageUrl: string;
            createdBy?: string | null | undefined;
            templateId?: string | null | undefined;
            templateName?: string | null | undefined;
        }[];
        templates: {
            id: string;
            name: string;
            format: "PDF" | "DOCX";
            lastUpdatedAt: string;
            description?: string | null | undefined;
        }[];
    }>;
    permissions: z.ZodObject<{
        canEditPersonal: z.ZodBoolean;
        canEditJob: z.ZodBoolean;
        canEditCompensation: z.ZodBoolean;
        canManageCostSplits: z.ZodBoolean;
        canGenerateDocuments: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        canEditPersonal: boolean;
        canEditJob: boolean;
        canEditCompensation: boolean;
        canManageCostSplits: boolean;
        canGenerateDocuments: boolean;
    }, {
        canEditPersonal: boolean;
        canEditJob: boolean;
        canEditCompensation: boolean;
        canManageCostSplits: boolean;
        canGenerateDocuments: boolean;
    }>;
}, "strip", z.ZodTypeAny, {
    employee: {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        id: string;
        legalName: {
            full: string;
            preferred?: string | null | undefined;
        };
        jobTitle: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: string | null | undefined;
        orgUnit?: string | null | undefined;
        department?: string | null | undefined;
        location?: string | null | undefined;
        employeeNumber?: string | null | undefined;
        costCodeSummary?: string | null | undefined;
        avatarUrl?: string | null | undefined;
    };
    personal: {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        citizenships: string[];
        languages: string[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        maritalStatus?: string | null | undefined;
        veteranStatus?: string | null | undefined;
    };
    contact: {
        workEmail: string;
        emergencyContacts: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[];
        communicationPreferences: string[];
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
    };
    job: {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    };
    compensation: {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable: boolean;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    };
    timeAndEligibility: {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    };
    costSplits: {
        id: string;
        costCodeId: string;
        costCode: {
            code: string;
            type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
            id: string;
            description?: string | null | undefined;
        };
        percentage: number;
        startDate: string;
        endDate: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy?: string | null | undefined;
    }[];
    history: {
        type: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER";
        id: string;
        effectiveDate: string;
        createdAt: string;
        payload: Record<string, any>;
        source: "UI" | "API" | "INTEGRATION";
        actor?: string | null | undefined;
    }[];
    documents: {
        generated: {
            id: string;
            createdAt: string;
            format: "PDF" | "DOCX";
            filename: string;
            storageUrl: string;
            createdBy?: string | null | undefined;
            templateId?: string | null | undefined;
            templateName?: string | null | undefined;
        }[];
        templates: {
            id: string;
            name: string;
            format: "PDF" | "DOCX";
            lastUpdatedAt: string;
            description?: string | null | undefined;
        }[];
    };
    permissions: {
        canEditPersonal: boolean;
        canEditJob: boolean;
        canEditCompensation: boolean;
        canManageCostSplits: boolean;
        canGenerateDocuments: boolean;
    };
}, {
    employee: {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        id: string;
        legalName: {
            full: string;
            preferred?: string | null | undefined;
        };
        jobTitle: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: string | null | undefined;
        orgUnit?: string | null | undefined;
        department?: string | null | undefined;
        location?: string | null | undefined;
        employeeNumber?: string | null | undefined;
        costCodeSummary?: string | null | undefined;
        avatarUrl?: string | null | undefined;
    };
    personal: {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        citizenships?: string[] | undefined;
        maritalStatus?: string | null | undefined;
        languages?: string[] | undefined;
        veteranStatus?: string | null | undefined;
    };
    contact: {
        workEmail: string;
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        emergencyContacts?: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[] | undefined;
        communicationPreferences?: string[] | undefined;
    };
    job: {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    };
    compensation: {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable?: boolean | undefined;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    };
    timeAndEligibility: {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    };
    costSplits: {
        id: string;
        costCodeId: string;
        costCode: {
            code: string;
            type: "COST_CENTER" | "GL" | "PROJECT" | "WORKTAG";
            id: string;
            description?: string | null | undefined;
        };
        percentage: number;
        startDate: string;
        endDate: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy?: string | null | undefined;
    }[];
    history: {
        type: "HIRE" | "TRANSFER" | "COMP_CHANGE" | "COST_CODE_CHANGE" | "MANAGER_CHANGE" | "LOA" | "TERMINATION" | "OTHER";
        id: string;
        effectiveDate: string;
        createdAt: string;
        actor?: string | null | undefined;
        payload?: Record<string, any> | undefined;
        source?: "UI" | "API" | "INTEGRATION" | undefined;
    }[];
    documents: {
        generated: {
            id: string;
            createdAt: string;
            format: "PDF" | "DOCX";
            filename: string;
            storageUrl: string;
            createdBy?: string | null | undefined;
            templateId?: string | null | undefined;
            templateName?: string | null | undefined;
        }[];
        templates: {
            id: string;
            name: string;
            format: "PDF" | "DOCX";
            lastUpdatedAt: string;
            description?: string | null | undefined;
        }[];
    };
    permissions: {
        canEditPersonal: boolean;
        canEditJob: boolean;
        canEditCompensation: boolean;
        canManageCostSplits: boolean;
        canGenerateDocuments: boolean;
    };
}>;
type EmployeeProfilePayload = z.infer<typeof employeeProfileSchema>;
declare const updateEmployeeProfileSchema: z.ZodDiscriminatedUnion<"section", [z.ZodObject<{
    section: z.ZodLiteral<"personal">;
    payload: z.ZodObject<{
        legalName: z.ZodObject<{
            first: z.ZodString;
            middle: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            last: z.ZodString;
            suffix: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        }, {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        }>;
        preferredName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        pronouns: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        dateOfBirth: z.ZodString;
        nationalIdentifiers: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            country: z.ZodString;
            value: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            value: string;
            type: string;
            country: string;
            id: string;
        }, {
            value: string;
            type: string;
            country: string;
            id: string;
        }>, "many">;
        citizenships: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        maritalStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        languages: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        veteranStatus: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        citizenships: string[];
        languages: string[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        maritalStatus?: string | null | undefined;
        veteranStatus?: string | null | undefined;
    }, {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        citizenships?: string[] | undefined;
        maritalStatus?: string | null | undefined;
        languages?: string[] | undefined;
        veteranStatus?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    payload: {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        citizenships: string[];
        languages: string[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        maritalStatus?: string | null | undefined;
        veteranStatus?: string | null | undefined;
    };
    section: "personal";
}, {
    payload: {
        legalName: {
            first: string;
            last: string;
            middle?: string | null | undefined;
            suffix?: string | null | undefined;
        };
        dateOfBirth: string;
        nationalIdentifiers: {
            value: string;
            type: string;
            country: string;
            id: string;
        }[];
        preferredName?: string | null | undefined;
        pronouns?: string | null | undefined;
        citizenships?: string[] | undefined;
        maritalStatus?: string | null | undefined;
        languages?: string[] | undefined;
        veteranStatus?: string | null | undefined;
    };
    section: "personal";
}>, z.ZodObject<{
    section: z.ZodLiteral<"contact">;
    payload: z.ZodObject<{
        workEmail: z.ZodString;
        personalEmail: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        workPhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        mobilePhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        primaryAddress: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            suburb: z.ZodString;
            state: z.ZodString;
            postcode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }>>>;
        mailingAddress: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            line1: z.ZodString;
            line2: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            suburb: z.ZodString;
            state: z.ZodString;
            postcode: z.ZodString;
            country: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }, {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        }>>>;
        emergencyContacts: z.ZodDefault<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            relationship: z.ZodString;
            phone: z.ZodString;
            email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }, {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }>, "many">>;
        communicationPreferences: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        workEmail: string;
        emergencyContacts: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[];
        communicationPreferences: string[];
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
    }, {
        workEmail: string;
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        emergencyContacts?: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[] | undefined;
        communicationPreferences?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    payload: {
        workEmail: string;
        emergencyContacts: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[];
        communicationPreferences: string[];
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
    };
    section: "contact";
}, {
    payload: {
        workEmail: string;
        personalEmail?: string | null | undefined;
        workPhone?: string | null | undefined;
        mobilePhone?: string | null | undefined;
        primaryAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        mailingAddress?: {
            line1: string;
            suburb: string;
            state: string;
            postcode: string;
            country: string;
            line2?: string | null | undefined;
        } | null | undefined;
        emergencyContacts?: {
            id: string;
            name: string;
            relationship: string;
            phone: string;
            email?: string | null | undefined;
        }[] | undefined;
        communicationPreferences?: string[] | undefined;
    };
    section: "contact";
}>, z.ZodObject<{
    section: z.ZodLiteral<"job">;
    payload: z.ZodObject<{
        positionId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        jobTitle: z.ZodString;
        manager: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>>;
        orgUnit: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>>;
        department: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
        }, {
            id: string;
            name: string;
        }>>>;
        location: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            timezone: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            timezone: string;
        }, {
            id: string;
            name: string;
            timezone: string;
        }>>>;
        grade: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        fte: z.ZodNumber;
        exempt: z.ZodBoolean;
        workerType: z.ZodString;
        employmentType: z.ZodString;
        standardHours: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        schedule: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        costCenterSummary: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        status: z.ZodEnum<["ACTIVE", "ON_LEAVE", "TERMINATED"]>;
        hireDate: z.ZodString;
        serviceDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        probationEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        contractEndDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    }, {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    payload: {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    };
    section: "job";
}, {
    payload: {
        status: "ACTIVE" | "ON_LEAVE" | "TERMINATED";
        jobTitle: string;
        fte: number;
        exempt: boolean;
        workerType: string;
        employmentType: string;
        hireDate: string;
        positionId?: string | null | undefined;
        manager?: {
            id: string;
            name: string;
        } | null | undefined;
        orgUnit?: {
            id: string;
            name: string;
        } | null | undefined;
        department?: {
            id: string;
            name: string;
        } | null | undefined;
        location?: {
            id: string;
            name: string;
            timezone: string;
        } | null | undefined;
        grade?: string | null | undefined;
        standardHours?: number | null | undefined;
        schedule?: string | null | undefined;
        costCenterSummary?: string | null | undefined;
        serviceDate?: string | null | undefined;
        probationEndDate?: string | null | undefined;
        contractEndDate?: string | null | undefined;
    };
    section: "job";
}>, z.ZodObject<{
    section: z.ZodLiteral<"compensation">;
    payload: z.ZodObject<{
        payGroup: z.ZodString;
        baseSalary: z.ZodObject<{
            amount: z.ZodNumber;
            currency: z.ZodString;
            frequency: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            amount: number;
            currency: string;
            frequency: string;
        }, {
            amount: number;
            currency: string;
            frequency: string;
        }>;
        payGrade: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        salaryRange: z.ZodNullable<z.ZodOptional<z.ZodObject<{
            min: z.ZodNumber;
            midpoint: z.ZodOptional<z.ZodNumber>;
            max: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            min: number;
            max: number;
            midpoint?: number | undefined;
        }, {
            min: number;
            max: number;
            midpoint?: number | undefined;
        }>>>;
        bonusTargetPercent: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        allowances: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            amount: z.ZodNumber;
            currency: z.ZodString;
            frequency: z.ZodEnum<["ANNUAL", "MONTHLY", "FORTNIGHTLY", "WEEKLY", "HOURLY"]>;
            taxable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable: boolean;
        }, {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable?: boolean | undefined;
        }>, "many">;
        stockPlan: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        effectiveDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable: boolean;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    }, {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable?: boolean | undefined;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    payload: {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable: boolean;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    };
    section: "compensation";
}, {
    payload: {
        payGroup: string;
        baseSalary: {
            amount: number;
            currency: string;
            frequency: string;
        };
        allowances: {
            id: string;
            label: string;
            amount: number;
            currency: string;
            frequency: "ANNUAL" | "MONTHLY" | "FORTNIGHTLY" | "WEEKLY" | "HOURLY";
            taxable?: boolean | undefined;
        }[];
        effectiveDate: string;
        payGrade?: string | null | undefined;
        salaryRange?: {
            min: number;
            max: number;
            midpoint?: number | undefined;
        } | null | undefined;
        bonusTargetPercent?: number | null | undefined;
        stockPlan?: string | null | undefined;
    };
    section: "compensation";
}>, z.ZodObject<{
    section: z.ZodLiteral<"timeAndEligibility">;
    payload: z.ZodObject<{
        location: z.ZodString;
        timezone: z.ZodString;
        workSchedule: z.ZodString;
        badgeId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        overtimeEligible: z.ZodBoolean;
        exempt: z.ZodBoolean;
        benefitsEligible: z.ZodBoolean;
        leaveBalances: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            balanceHours: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            type: string;
            id: string;
            balanceHours: number;
        }, {
            type: string;
            id: string;
            balanceHours: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    }, {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    payload: {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    };
    section: "timeAndEligibility";
}, {
    payload: {
        timezone: string;
        location: string;
        exempt: boolean;
        workSchedule: string;
        overtimeEligible: boolean;
        benefitsEligible: boolean;
        leaveBalances: {
            type: string;
            id: string;
            balanceHours: number;
        }[];
        badgeId?: string | null | undefined;
    };
    section: "timeAndEligibility";
}>]>;
type UpdateEmployeeProfileInput = z.infer<typeof updateEmployeeProfileSchema>;
declare const upsertCostSplitSchema: z.ZodObject<{
    splits: z.ZodArray<z.ZodObject<{
        costCodeId: z.ZodString;
        percentage: z.ZodNumber;
        startDate: z.ZodString;
    } & {
        id: z.ZodOptional<z.ZodString>;
        endDate: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        costCodeId: string;
        percentage: number;
        startDate: string;
        id?: string | undefined;
        endDate?: string | null | undefined;
    }, {
        costCodeId: string;
        percentage: number;
        startDate: string;
        id?: string | undefined;
        endDate?: string | null | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    splits: {
        costCodeId: string;
        percentage: number;
        startDate: string;
        id?: string | undefined;
        endDate?: string | null | undefined;
    }[];
}, {
    splits: {
        costCodeId: string;
        percentage: number;
        startDate: string;
        id?: string | undefined;
        endDate?: string | null | undefined;
    }[];
}>;
type UpsertCostSplitInput = z.infer<typeof upsertCostSplitSchema>;
declare const historyCsvResponseSchema: z.ZodObject<{
    url: z.ZodString;
    expiresAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    url: string;
    expiresAt: string;
}, {
    url: string;
    expiresAt: string;
}>;
type HistoryCsvResponse = z.infer<typeof historyCsvResponseSchema>;
declare const employeeDocumentUploadSchema: z.ZodObject<{
    name: z.ZodString;
    category: z.ZodString;
    storageUrl: z.ZodString;
    format: z.ZodEnum<["PDF", "DOCX"]>;
    uploadedAt: z.ZodString;
    uploadedBy: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    format: "PDF" | "DOCX";
    storageUrl: string;
    category: string;
    uploadedAt: string;
    uploadedBy: string;
}, {
    name: string;
    format: "PDF" | "DOCX";
    storageUrl: string;
    category: string;
    uploadedAt: string;
    uploadedBy: string;
}>;
type EmployeeDocumentUpload = z.infer<typeof employeeDocumentUploadSchema>;

export { type CostCodeType, type CostSplit, type CostSplitInput, type DocumentFormat, type DocumentTemplate, type EmployeeCompensation, type EmployeeContact, type EmployeeDocumentUpload, type EmployeeHistoryFilters, type EmployeeJob, type EmployeePersonal, type EmployeeProfilePayload, type EmployeeStatus, type EmployeeTimeEligibility, type EmploymentEvent, type EmploymentEventType, type GenerateDocumentInput, type GeneratedDocument, type HistoryCsvResponse, type UpdateEmployeeProfileInput, type UpsertCostSplitInput, compensationComponentSchema, costCodeTypeSchema, costSplitInputSchema, costSplitSchema, documentFormatSchema, documentTemplateSchema, employeeCompensationSchema, employeeContactSchema, employeeDocumentUploadSchema, employeeHistoryFiltersSchema, employeeJobSchema, employeePersonalSchema, employeeProfileSchema, employeeStatusSchema, employeeTimeEligibilitySchema, employmentEventSchema, employmentEventTypeSchema, generateDocumentInputSchema, generatedDocumentSchema, historyCsvResponseSchema, updateEmployeeProfileSchema, upsertCostSplitSchema };

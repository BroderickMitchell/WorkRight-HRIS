import { z } from 'zod';
export declare const featureFlagSchema: z.ZodObject<{
    maintenanceMode: z.ZodDefault<z.ZodBoolean>;
    enableLearningReminders: z.ZodDefault<z.ZodBoolean>;
    enableGoalSuggestions: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maintenanceMode: boolean;
    enableLearningReminders: boolean;
    enableGoalSuggestions: boolean;
}, {
    maintenanceMode?: boolean | undefined;
    enableLearningReminders?: boolean | undefined;
    enableGoalSuggestions?: boolean | undefined;
}>;
export declare const tenantSettingSchema: z.ZodObject<{
    brandingPrimaryColor: z.ZodDefault<z.ZodString>;
    locale: z.ZodDefault<z.ZodString>;
    paySchedule: z.ZodDefault<z.ZodEnum<["fortnightly", "monthly", "weekly"]>>;
    leavePolicies: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        code: z.ZodString;
        accrualRule: z.ZodRecord<z.ZodString, z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        code: string;
        name: string;
        accrualRule: Record<string, number>;
    }, {
        code: string;
        name: string;
        accrualRule: Record<string, number>;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    brandingPrimaryColor: string;
    locale: string;
    paySchedule: "fortnightly" | "monthly" | "weekly";
    leavePolicies: {
        code: string;
        name: string;
        accrualRule: Record<string, number>;
    }[];
}, {
    brandingPrimaryColor?: string | undefined;
    locale?: string | undefined;
    paySchedule?: "fortnightly" | "monthly" | "weekly" | undefined;
    leavePolicies?: {
        code: string;
        name: string;
        accrualRule: Record<string, number>;
    }[] | undefined;
}>;
export type FeatureFlags = z.infer<typeof featureFlagSchema>;
export type TenantSettings = z.infer<typeof tenantSettingSchema>;
export declare function parseFeatureFlags(input: unknown): FeatureFlags;
export declare function parseTenantSettings(input: unknown): TenantSettings;

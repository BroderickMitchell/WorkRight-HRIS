import { z } from 'zod';
export const featureFlagSchema = z.object({
    maintenanceMode: z.boolean().default(false),
    enableLearningReminders: z.boolean().default(true),
    enableGoalSuggestions: z.boolean().default(false)
});
export const tenantSettingSchema = z.object({
    brandingPrimaryColor: z.string().default('#004c97'),
    locale: z.string().default('en-AU'),
    paySchedule: z.enum(['fortnightly', 'monthly', 'weekly']).default('fortnightly'),
    leavePolicies: z
        .array(z.object({
        name: z.string(),
        code: z.string(),
        accrualRule: z.record(z.number())
    }))
        .default([])
});
export function parseFeatureFlags(input) {
    return featureFlagSchema.parse(input);
}
export function parseTenantSettings(input) {
    return tenantSettingSchema.parse(input);
}

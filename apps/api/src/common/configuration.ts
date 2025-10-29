import { parseFeatureFlags } from '@workright/config';

const parseAllowedOrigins = (raw?: string): string[] =>
  raw
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) ?? [];

export default () => ({
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/workright',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  telemetryExporter: process.env.TELEMETRY_EXPORTER ?? 'console',
  defaultLocale: process.env.DEFAULT_LOCALE ?? 'en-AU',
  demoMode: process.env.DEMO_MODE === 'true',
  jwt: {
    secret: process.env.AUTH_SECRET ?? 'change-me',
    issuer: process.env.AUTH_ISSUER,
    audience: process.env.AUTH_AUDIENCE
  },
  security: {
    allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS)
  },
  features: parseFeatureFlags({
    maintenanceMode: process.env.FEATURE_MAINTENANCE_MODE === 'true'
  })
});

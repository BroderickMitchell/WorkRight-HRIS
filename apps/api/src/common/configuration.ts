import { parseFeatureFlags } from '@workright/config';

export default () => ({
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/workright',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  telemetryExporter: process.env.TELEMETRY_EXPORTER ?? 'console',
  defaultLocale: process.env.DEFAULT_LOCALE ?? 'en-AU',
  features: parseFeatureFlags({
    maintenanceMode: process.env.FEATURE_MAINTENANCE_MODE === 'true'
  })
});

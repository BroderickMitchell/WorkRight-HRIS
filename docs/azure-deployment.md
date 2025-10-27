# Azure deployment checklist

The WorkRight HRIS API can be hosted on Azure App Service or Azure Container Apps. The following infrastructure and configuration values are typically required alongside the Azure SQL Database and App Service plan that you already provisioned.

## Platform resources

| Concern | Azure service | Notes |
| --- | --- | --- |
| Background jobs & queues | Azure Service Bus | A queue or topic is required so BullMQ workers can process asynchronous jobs from the API. Capture the namespace, queue name, and the SAS connection string. |
| Cache & rate limiting | Azure Cache for Redis | Provision a Redis instance with TLS (`rediss://`). This backs BullMQ and feature flag caching. |
| Object storage | Azure Storage Account (Blob) | Used for file attachments, exports, and audit archives. Record the account name, container, and connection string. |
| Secrets management | Azure Key Vault | Store production secrets (database password, JWT secret, Service Bus keys) and grant the App Service managed identity access. |
| Monitoring & logging | Azure Application Insights | Configure the connection string to forward NestJS telemetry and logs. |
| Identity integration | Azure Active Directory app registration | Optional, but required if integrating with Microsoft Entra for SSO or Graph API access. Keep the tenant ID (`64b767a3-b467-4316-a27e-efaeb8b3180e`), default domain (`NETORG19467793.onmicrosoft.com`), client ID, and client secret. |

## Environment variables

Populate the following variables (see `apps/api/.env.example` for concrete samples):

- `DATABASE_URL` – SQL Server connection string targeting `wrhris.database.windows.net`.
- `REDIS_URL` – TLS-enabled connection string for Azure Cache for Redis.
- `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_CONTAINER`, `AZURE_STORAGE_CONNECTION_STRING` – Blob storage configuration.
- `AZURE_SERVICEBUS_NAMESPACE`, `AZURE_SERVICEBUS_QUEUE`, `AZURE_SERVICEBUS_CONNECTION_STRING` – Service Bus configuration for background jobs.
- `APPINSIGHTS_CONNECTION_STRING` and `TELEMETRY_EXPORTER` – Application Insights telemetry wiring.
- `API_JWT_ISSUER`, `API_JWT_AUDIENCE`, `API_JWT_SECRET` – API authentication values used by downstream services.
- `AZURE_TENANT_ID`, `AZURE_AD_DEFAULT_DOMAIN`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET` – App registration values when enabling SSO or Graph automation.
- `AZURE_KEY_VAULT_URI` – Referenced if secrets are loaded dynamically via managed identity.

## Deployment flow

1. Build the API container image (`pnpm --filter api run build`) and push it to Azure Container Registry.
2. Update the App Service or Container App to use the new image, enabling managed identity for Key Vault access if required.
3. Apply Prisma migrations against Azure SQL (`pnpm --filter api run prisma:migrate`).
4. Set the environment variables above in the App Service configuration or via Key Vault references.
5. Validate health by hitting `/healthz` (or the root endpoint) and running smoke tests.

This checklist supplements the environment sample so deployments include the ancillary Azure resources beyond the database and App Service.

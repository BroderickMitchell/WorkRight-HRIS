# Azure deployment checklist

The WorkRight HRIS API can be hosted on Azure App Service or Azure Container Apps. Use this runbook to verify that the Azure environment is complete before promoting a build. The checklist assumes the App Service plan and Azure Database for PostgreSQL Flexible Server are already provisioned.

## Platform resources to provision

| Concern | Azure service | Notes |
| --- | --- | --- |
| Background jobs & queues | Azure Service Bus | Provision a queue or topic so BullMQ workers can process asynchronous jobs from the API. Record the namespace, queue name, and a SAS connection string. |
| Cache & rate limiting | Azure Cache for Redis | Create a TLS-enabled instance (`rediss://`) used by BullMQ and feature flag caching. |
| Object storage | Azure Storage Account (Blob) | Required for file attachments, exports, and audit archives. Capture the account name, container, and connection string. |
| Secrets management | Azure Key Vault | Store production secrets (database password, JWT secret, Service Bus keys) and grant the App Service managed identity access. |
| Monitoring & logging | Azure Application Insights | Configure the connection string so NestJS telemetry and logs flow into Azure Monitor. |
| Identity integration | Azure Active Directory app registration | Needed when integrating with Microsoft Entra for SSO or Graph API access. Keep the tenant ID (`64b767a3-b467-4316-a27e-efaeb8b3180e`), default domain (`NETORG19467793.onmicrosoft.com`), client ID (`7e43d311-d1bd-4869-b4e1-c8e09a799bb`), and secret ID (`5ce67b84-2aba-4de5-bf01-3096ab34c59b`); store the client secret value in Key Vault. |

## Required configuration

Populate these settings via App Service configuration or Key Vault references (see `apps/api/.env.example` for sample values):

- `DATABASE_URL` – PostgreSQL connection string targeting `<server-name>.postgres.database.azure.com` with `sslmode=require` and `schema=public`.
- `REDIS_URL` – TLS-enabled connection string for Azure Cache for Redis.
- `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_CONTAINER`, `AZURE_STORAGE_CONNECTION_STRING` – Blob storage configuration.
- `AZURE_SERVICEBUS_NAMESPACE`, `AZURE_SERVICEBUS_QUEUE`, `AZURE_SERVICEBUS_CONNECTION_STRING` – Service Bus configuration for background jobs.
- `APPINSIGHTS_CONNECTION_STRING` and `TELEMETRY_EXPORTER` – Application Insights telemetry wiring.
- `API_JWT_ISSUER`, `API_JWT_AUDIENCE`, `API_JWT_SECRET` – API authentication values used by downstream services. The shared secret should be set to `50c76a9e7a065f45ac7eb7261bb647308f59956ec054eef9df61b78bcd010c7bc5268c135c5e2ba03462443706a81c5033c00a5217f6a786f4f534991b12959f` and stored securely (for example, in Azure Key Vault).
- `AZURE_TENANT_ID`, `AZURE_AD_DEFAULT_DOMAIN`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_CLIENT_SECRET_ID` – App registration values when enabling SSO or Graph automation.
- `AZURE_KEY_VAULT_URI` – Referenced if secrets are loaded dynamically via managed identity.

## Deployment flow

1. Provision the Azure resources via Bicep: `infra/azure/main.bicep` + `main.parameters.json` cover the VNet, PostgreSQL flexible server, Redis, Service Bus, Key Vault, Storage, and App Service plan/Web App. Deploy with `az deployment group create --resource-group <rg> --template-file infra/azure/main.bicep --parameters @infra/azure/main.parameters.json`. The template omits subnet-level tags to avoid the `InvalidJson ... Could not find member 'tags' on object of type 'Subnet'` error raised by ARM. If your tooling requires an ARM JSON template instead, use `infra/azure/appservice-template.json`, which applies the same subnet/tag fixes while targeting PostgreSQL Flexible Server, Redis, and private networking.
2. Build the API container image (`pnpm --filter api run build`) and push it to Azure Container Registry.
3. Apply Prisma migrations against Azure Database for PostgreSQL (`pnpm --filter api run prisma:migrate`).
4. Update the App Service or Container App to use the new image. Enable the managed identity and give it access to Key Vault secrets if you are using Key Vault references.
5. Populate the configuration values above in App Service (or bind Key Vault references) and set `NODE_ENV=production`.
6. Validate health by hitting `/healthz` (or the root endpoint) and running smoke tests.
7. Monitor Application Insights for errors during the warm-up window and roll back if required.

This checklist supplements the environment sample so deployments cover the ancillary Azure resources beyond the database and App Service.

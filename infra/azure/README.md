# Azure infrastructure deployment

This directory contains a Bicep template that provisions the core resources required to host the WorkRight HRIS API on Azure. T
he template intentionally avoids setting unsupported properties (for example, subnet-level tags) so that deployments succeed w
ith the Azure Resource Manager API.

## Resources created

`infra/azure/main.bicep` deploys the following:

- Virtual network with dedicated application and data subnets (no subnet tags to satisfy ARM requirements)
- Azure SQL server + database
- Azure Storage account with a private container for attachments
- Azure Service Bus namespace and queue
- Azure Cache for Redis instance
- Azure Key Vault with an initial access policy for the deployment principal
- Application Insights resource
- Linux App Service plan and container-based Web App wired for VNet integration and managed identity

For teams that need to stick with Azure Resource Manager (ARM) JSON deployments, the repository also includes
`infra/azure/appservice-template.json`. That template mirrors the platform-as-a-service architecture above—App Service plan,
container Web App, PostgreSQL flexible server, Redis cache, and private networking—while remaining compliant with the ARM
schema (no subnet-level tags or unsupported properties).

## How to deploy

1. Ensure you are targeting the correct subscription and resource group:

   ```bash
   az account set --subscription <subscription-id>
   az group create --name wrhris-prod-rg --location eastus
   ```

2. Update `infra/azure/main.parameters.json` with values that match your environment (unique storage account names, object IDs,
   registry credentials, etc.).

3. Deploy the Bicep template:

   ```bash
   az deployment group create \
     --resource-group wrhris-prod-rg \
     --template-file infra/azure/main.bicep \
     --parameters @infra/azure/main.parameters.json
   ```

4. After the deployment completes, use the outputs to configure DNS, client applications, and CI/CD secrets. The Web App
   application settings seeded in the parameters file align with `apps/api/.env.example` and the Azure deployment checklist.

### Deploying the ARM JSON template

If you prefer an ARM JSON deployment (for example, when using tooling that has not yet adopted Bicep), run:

```bash
az deployment group create \
  --resource-group wrhris-prod-rg \
  --template-file infra/azure/appservice-template.json \
  --parameters \
    subscriptionId=<subscription-id> \
    resourceGroupName=wrhris-prod-rg \
    name=wrhris-api \
    location=eastus \
    hostingPlanName=wrhris-plan \
    serverFarmResourceGroup=wrhris-prod-rg \
    vnetName=wrhris-vnet \
    vnetAddressPrefix=10.0.0.0/16 \
    appSubnetName=app \
    appSubnetAddressPrefix=10.0.1.0/24 \
    outboundSubnetName=data \
    outboundSubnetAddressPrefix=10.0.2.0/24 \
    postgreSqlServerName=wrhris-pg \
    postgreSqlServerAdminUsername=pgadmin \
    postgreSqlServerAdminPwd=<secure-password> \
    postgresqlDatabaseSku=Standard_B1ms \
    postgresqlDatabaseTier=GeneralPurpose \
    postgreSqlDatabaseName=wrhris \
    privateDnsZoneName=privatelink.postgres.database.azure.com \
    virtualLinkName=wrhris-pg-link \
    cacheName=wrhris-cache \
    redisPrivateDnsZoneName=privatelink.redis.cache.windows.net \
    redisVirtualLinkName=wrhris-redis-link \
    redisPrivateEndpointName=wrhris-redis-pe \
    redisCacheServiceConnectorName=wrhris-redis-connector
```

Supplement the remaining parameters (tags, SKU choices, etc.) to suit your environment. Because the template uses
parameterized subnet names and omits unsupported `tags` properties on subnet resources, it avoids the `Could not find member
'tags' on object of type 'Subnet'` deployment error.

## Troubleshooting

- `InvalidJson ... Could not find member 'tags' on object of type 'Subnet'`: Ensure you are using the updated template in this
  directory. Subnet resources created here do not include a `tags` property, satisfying the Azure Network RP contract.
- Storage account names must be globally unique. If the deployment fails with `StorageAccountAlreadyTaken`, update `storageA
  ccountName` in the parameter file and redeploy.
- For private registries, populate `containerRegistryServer`, `containerRegistryUsername`, and `containerRegistryPassword`. Le
  ave them blank when using Azure Container Registry with managed identities.


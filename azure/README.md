# Azure Deployment Guide

This guide walks through hosting the WorkRight HRIS FastAPI application on Azure App Service with a managed PostgreSQL database. The deployment flow uses the container image produced from the repository `Dockerfile` and the accompanying Bicep template (`app_service.bicep`).

## Prerequisites

- [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- Access to an Azure subscription with permissions to create resource groups, Azure Container Registry (ACR), App Service, and Azure Database for PostgreSQL resources
- Docker installed locally for building the container image

## 1. Set up environment variables

```bash
export AZ_RESOURCE_GROUP="workright-hris-rg"
export AZ_LOCATION="eastus"
export AZ_ACR_NAME="workrighthrisacr"
export AZ_APP_NAME="workright-hris-app"
export AZ_PG_SERVER="workrighthrisdb"
export AZ_CONTAINER_TAG="${AZ_ACR_NAME}.azurecr.io/hris:latest"
export AZ_PG_ADMIN="hrisadmin"
export AZ_PG_PASSWORD="$(openssl rand -base64 16)"
```

> **Note:** `AZ_PG_SERVER` must be globally unique, lowercase, and between 3–60 characters.

## 2. Create the resource group and container registry

```bash
az login
az group create --name "$AZ_RESOURCE_GROUP" --location "$AZ_LOCATION"
az acr create --resource-group "$AZ_RESOURCE_GROUP" --name "$AZ_ACR_NAME" --sku Basic
```

## 3. Build and push the container image

```bash
az acr login --name "$AZ_ACR_NAME"
docker build -t "$AZ_CONTAINER_TAG" .
docker push "$AZ_CONTAINER_TAG"
```

## 4. Deploy infrastructure with Bicep

```bash
az deployment group create \
  --resource-group "$AZ_RESOURCE_GROUP" \
  --template-file azure/app_service.bicep \
  --parameters \
      location="$AZ_LOCATION" \
      appName="$AZ_APP_NAME" \
      planSku="B1" \
      planTier="Basic" \
      postgresServerName="$AZ_PG_SERVER" \
      postgresAdmin="$AZ_PG_ADMIN" \
      postgresPassword="$AZ_PG_PASSWORD" \
      containerImage="$AZ_CONTAINER_TAG" \
      containerRegistryServer="${AZ_ACR_NAME}.azurecr.io" \
      containerRegistryUsername="$(az acr credential show --name "$AZ_ACR_NAME" --query username -o tsv)" \
      containerRegistryPassword="$(az acr credential show --name "$AZ_ACR_NAME" --query passwords[0].value -o tsv)"
```

The deployment outputs the hosted Web App URL and PostgreSQL fully qualified domain name.

## 5. Run database migrations (optional)

Tables are automatically created on first application start. If you prefer to run them manually, connect to the container and execute the `init_db` helper via Python:

```bash
az webapp ssh --resource-group "$AZ_RESOURCE_GROUP" --name "$AZ_APP_NAME"
python -c "from app.database import init_db; init_db()"
exit
```

## 6. Verify the deployment

Open the Web App URL from the deployment output in a browser. The FastAPI root endpoint returns:

```json
{"message": "WorkRight HRIS API"}
```

Interactive API documentation is available at `/docs`.

## Operational considerations

- **Scaling:** Adjust the `planSku`/`planTier` parameters to provision higher tiers (e.g. `P1v3`/`PremiumV3`) or use Azure App Service autoscale rules.
- **Secrets management:** Replace in-template credentials with Azure Key Vault references or App Service managed identity as part of hardening.
- **Database access:** The included firewall rule allows open access for demonstration. Restrict IP ranges or integrate with VNet in production.
- **Monitoring:** Enable Application Insights and configure alert rules for proactive monitoring of the HRIS workload.

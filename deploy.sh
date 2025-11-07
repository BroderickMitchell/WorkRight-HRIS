#!/usr/bin/env bash
set -euo pipefail

# ===== WorkRight HRIS: Azure Production Bootstrap =====
# This script provisions Azure resources and wires up configuration
# for container-based deployment (API + Web) using Azure App Service.
#
# Prerequisites:
# - az CLI logged in:   az login
# - Correct subscription selected: az account set --subscription "<SUBSCRIPTION_ID or NAME>"
# - You control DNS for workrightadvisory.com.au to add CNAMEs later.
#
# Notes:
# - Region: australiaeast (Sydney). Change LOC to taste.
# - Custom domains (api., app.) require a manual DNS step; commands are shown at the end.
#
# Safe to re-run: mostly yes (idempotent where possible).

# --------------- Configurable variables ----------------
RG="${RG:-rg-workright-prod}"
LOC="${LOC:-australiaeast}"

# A random suffix for globally-unique names. Override by exporting SUFFIX before running.
SUFFIX="${SUFFIX:-$RANDOM}"
ACR="${ACR:-workrightacr${SUFFIX}}"
PG="${PG:-workrightpg${SUFFIX}}"
KV="${KV:-workright-kv-${SUFFIX}}"
PLAN="${PLAN:-asp-workright-prod}"
APP_API="${APP_API:-workright-api}"
APP_WEB="${APP_WEB:-workright-web}"
AI_NAME="${AI_NAME:-ai-workright}"

DOMAIN="${DOMAIN:-workrightadvisory.com.au}"
API_HOST="${API_HOST:-api.${DOMAIN}}"
WEB_HOST="${WEB_HOST:-app.${DOMAIN}}"

# Container tags to deploy (these must exist in ACR before the final step or via CI/CD)
API_IMAGE_TAG="${API_IMAGE_TAG:-prod}"
WEB_IMAGE_TAG="${WEB_IMAGE_TAG:-prod}"

# --------------- Create resource group -----------------
echo ">> Creating resource group: $RG ($LOC)"
az group create -n "$RG" -l "$LOC" >/dev/null

# --------------- Container Registry -------------------
echo ">> Creating Azure Container Registry: $ACR"
az acr create -n "$ACR" -g "$RG" --sku Basic >/dev/null
ACR_LOGIN_SERVER="$(az acr show -n "$ACR" -g "$RG" --query loginServer -o tsv)"
ACR_ID="$(az acr show -n "$ACR" -g "$RG" --query id -o tsv)"

# --------------- PostgreSQL Flexible Server -----------
echo ">> Provisioning Azure Database for PostgreSQL Flexible Server: $PG"
az postgres flexible-server create \
  -g "$RG" -n "$PG" -l "$LOC" \
  --sku-name B2s --storage-size 64 --version 16 \
  --high-availability Disabled --public-access 0.0.0.0-255.255.255.255 >/dev/null

PG_FQDN="$(az postgres flexible-server show -g "$RG" -n "$PG" --query fullyQualifiedDomainName -o tsv)"
PG_ADMIN="$(az postgres flexible-server show -g "$RG" -n "$PG" --query administratorLogin -o tsv)"
PG_PASS="$(az postgres flexible-server show -g "$RG" -n "$PG" --query administratorLoginPassword -o tsv 2>/dev/null || true)"
if [ -z "$PG_PASS" ]; then
  echo ">> Setting a strong admin password for Postgres"
  PG_PASS="$(openssl rand -base64 24)"
  az postgres flexible-server update -g "$RG" -n "$PG" --admin-password "$PG_PASS" >/dev/null
fi

# --------------- Key Vault ----------------------------
echo ">> Creating Key Vault: $KV"
az keyvault create -g "$RG" -n "$KV" -l "$LOC" >/dev/null

# Database URL (Prisma-compatible). Database 'workright' will be created on first migration.
DATABASE_URL="postgresql://${PG_ADMIN}:${PG_PASS}@${PG_FQDN}:5432/workright?schema=public&sslmode=require"
echo ">> Storing DATABASE_URL in Key Vault"
KV_DB_SECRET_URI="$(az keyvault secret set --vault-name "$KV" -n DATABASE-URL --value "$DATABASE_URL" --query id -o tsv)"

# --------------- App Service Plan (Linux) -------------
echo ">> Creating App Service Plan (Linux): $PLAN"
az appservice plan create -g "$RG" -n "$PLAN" --is-linux --sku B1 >/dev/null

# --------------- Web Apps (containers) ----------------
echo ">> Creating Web Apps: $APP_API (API), $APP_WEB (Web)"
# Create with Node runtime first (we'll switch to container images)
az webapp create -g "$RG" -p "$PLAN" -n "$APP_API" --runtime "NODE:20-lts" >/dev/null
az webapp create -g "$RG" -p "$PLAN" -n "$APP_WEB" --runtime "NODE:20-lts" >/dev/null

# Managed identities
echo ">> Assigning managed identities and granting ACR pull"
az webapp identity assign -g "$RG" -n "$APP_API" >/dev/null
az webapp identity assign -g "$RG" -n "$APP_WEB" >/dev/null
API_PRINCIPAL_ID="$(az webapp show -g "$RG" -n "$APP_API" --query identity.principalId -o tsv)"
WEB_PRINCIPAL_ID="$(az webapp show -g "$RG" -n "$APP_WEB" --query identity.principalId -o tsv)"
az role assignment create --assignee "$API_PRINCIPAL_ID" --role "AcrPull" --scope "$ACR_ID" >/dev/null
az role assignment create --assignee "$WEB_PRINCIPAL_ID" --role "AcrPull" --scope "$ACR_ID" >/dev/null

# --------------- Application Insights -----------------
echo ">> Creating Application Insights: $AI_NAME"
az monitor app-insights component create -g "$RG" -l "$LOC" -a "$AI_NAME" >/dev/null || true
AI_CONN="$(az monitor app-insights component show -g "$RG" -a "$AI_NAME" --query connectionString -o tsv)"

# --------------- App settings -------------------------
echo ">> Setting app settings (Key Vault refs, AI, ports)"
az webapp config appsettings set -g "$RG" -n "$APP_API" --settings \
  WEBSITES_PORT=3001 NODE_ENV=production \
  APPLICATIONINSIGHTS_CONNECTION_STRING="$AI_CONN" \
  DATABASE_URL="@Microsoft.KeyVault(SecretUri=${KV_DB_SECRET_URI})" >/dev/null

API_URL="https://${APP_API}.azurewebsites.net"
az webapp config appsettings set -g "$RG" -n "$APP_WEB" --settings \
  WEBSITES_PORT=3000 NODE_ENV=production \
  APPLICATIONINSIGHTS_CONNECTION_STRING="$AI_CONN" \
  NEXT_PUBLIC_API_URL="${API_URL}" >/dev/null

# --------------- (Optional) set container images ------
# This step will succeed once CI has pushed images into ACR.
echo ">> Wiring container images (will succeed once images exist in ACR)"
az webapp config container set -g "$RG" -n "$APP_API" \
  --container-image-name "${ACR_LOGIN_SERVER}/workright/api:${API_IMAGE_TAG}" >/dev/null || true

az webapp config container set -g "$RG" -n "$APP_WEB" \
  --container-image-name "${ACR_LOGIN_SERVER}/workright/web:${WEB_IMAGE_TAG}" >/dev/null || true

# --------------- Output summary -----------------------
cat <<EOF

============================================================
✅ Provisioning complete (or already present). Next steps:
------------------------------------------------------------
1) CI/CD: push Docker images tagged:
   - ${ACR_LOGIN_SERVER}/workright/api:${API_IMAGE_TAG}
   - ${ACR_LOGIN_SERVER}/workright/web:${WEB_IMAGE_TAG}

2) After images exist, re-run the container set (or let CI do it).

3) Custom domains (optional, recommended):
   - API: ${API_HOST}  -> CNAME to ${APP_API}.azurewebsites.net
   - Web: ${WEB_HOST}  -> CNAME to ${APP_WEB}.azurewebsites.net

   Once DNS is in place:
   az webapp config hostname add -g ${RG} -n ${APP_API} --hostname ${API_HOST}
   az webapp config hostname add -g ${RG} -n ${APP_WEB} --hostname ${WEB_HOST}
   Then add managed certs from the portal (TLS/SSL settings).

4) Database migrations (once API is deployed):
   az webapp ssh -g ${RG} -n ${APP_API} --command "cd site/wwwroot && pnpm --filter @workright/api run prisma:migrate"

5) Health checks:
   - API: add /health endpoint and configure App Service Health Check.
   - Web: add /healthz or use root path.

Resource snapshot:
- Resource Group:   ${RG} (${LOC})
- ACR:              ${ACR} (${ACR_LOGIN_SERVER})
- Postgres FQDN:    ${PG_FQDN}
- Key Vault:        ${KV}
- App Service Plan: ${PLAN}
- API App:          ${APP_API} (${API_URL})
- Web App:          ${APP_WEB} (https://${APP_WEB}.azurewebsites.net)

============================================================
EOF

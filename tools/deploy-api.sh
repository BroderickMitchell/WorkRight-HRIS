#!/usr/bin/env bash
set -euo pipefail

# ====== inputs ======
PROJECT_ID="${PROJECT_ID:-workright-hris}"
REGION="${REGION:-australia-southeast1}"
SERVICE="workright-api"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-workright-runner@${PROJECT_ID}.iam.gserviceaccount.com}"
INSTANCE_CONNECTION_NAME="${INSTANCE_CONNECTION_NAME:-workright-hris:australia-southeast1:hris-db-7937}"
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-workrightdb}"
DB_USER="${DB_USER:-appuser}"
SECRET_DB_PASSWORD="DB_PASSWORD"

gcloud config set project "$PROJECT_ID"

# 1) IAM (idempotent)
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client" >/dev/null

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" >/dev/null

# 2) Secret (create if missing)
if ! gcloud secrets describe "$SECRET_DB_PASSWORD" >/dev/null 2>&1; then
  echo "Enter DB password for user ${DB_USER}:"
  read -rs DB_PASSWORD
  printf "%s" "$DB_PASSWORD" | gcloud secrets create "$SECRET_DB_PASSWORD" --data-file=-
fi

# 3) Build container (root or apps/api)
gcloud builds submit --tag "gcr.io/${PROJECT_ID}/${SERVICE}:latest" .

# 4) Deploy Cloud Run with Cloud SQL + Secret as env
# Prefer private IP connectivity when DB_HOST is provided; otherwise fall back to Unix socket host at /cloudsql/<instance>.
if [[ -z "$DB_HOST" && -z "$INSTANCE_CONNECTION_NAME" ]]; then
  echo "Either DB_HOST or INSTANCE_CONNECTION_NAME must be provided" >&2
  exit 1
fi

DEPLOY_ARGS=(
  run deploy "$SERVICE"
  --image "gcr.io/${PROJECT_ID}/${SERVICE}:latest"
  --region "$REGION"
  --service-account "$SERVICE_ACCOUNT"
  --platform managed
  --allow-unauthenticated
  --port 8080
  --set-env-vars "DB_NAME=${DB_NAME},DB_USER=${DB_USER},DB_PORT=${DB_PORT}"
  --set-secrets "DB_PASSWORD=${SECRET_DB_PASSWORD}:latest"
)

if [[ -n "$DB_HOST" ]]; then
  DEPLOY_ARGS+=(--set-env-vars "DB_HOST=${DB_HOST}")
  DEPLOY_ARGS+=(--set-env-vars "DATABASE_URL=postgresql://${DB_USER}:\${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public")
else
  DEPLOY_ARGS+=(--set-env-vars "INSTANCE_CONNECTION_NAME=${INSTANCE_CONNECTION_NAME}")
  DEPLOY_ARGS+=(--set-env-vars "DATABASE_URL=postgresql://${DB_USER}:\${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${INSTANCE_CONNECTION_NAME}&schema=public")
  DEPLOY_ARGS+=(--add-cloudsql-instances "${INSTANCE_CONNECTION_NAME}")
fi

gcloud "${DEPLOY_ARGS[@]}"

echo "Deployed. Check logs for 'DB OK, NOW() =' to confirm connectivity."
